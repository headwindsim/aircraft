// Copyright (c) 2026 Headwind Simulations contributors
// SPDX-License-Identifier: GPL-3.0

/** Takeoff results from a generated SimBrief OFP. */
export interface A339TakeoffRunwayReport {
  runway: string;
  v1?: number;
  vr?: number;
  v2?: number;
  flex?: number;
  flaps: string;
  thrust: string;
  packs: string;
  antiIce: string;
  maxWeight: string;
  limit: string;
  unavailableReason?: string;
}

export interface A339TakeoffReport {
  airport: string;
  destination: string;
  plannedRunway: string;
  registration: string;
  flight: string;
  airline: string;
  flightNumber: string;
  scheduledDeparture: string;
  generated: string;
  plannedWeight: string;
  weightUnits: string;
  wind: string;
  temperature: string;
  altimeter: string;
  surface: string;
  runways: A339TakeoffRunwayReport[];
  reportText: string;
}

const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
const text = (value: unknown, limit = 80): string =>
  typeof value === 'string' || typeof value === 'number' ? String(value).trim().slice(0, limit) : '';

function number(value: unknown, min: number, max: number): number | undefined {
  const raw = text(value);
  if (!/^-?\d+(?:\.\d+)?$/.test(raw)) return undefined;
  const result = Number(raw);
  return Number.isFinite(result) && result >= min && result <= max ? result : undefined;
}

export function normalizeTakeoffRunway(value: unknown): string {
  const raw = text(value)
    .toUpperCase()
    .replace(/^RW(?:Y)?/, '');
  return /^(?:0?[1-9]|[12]\d|3[0-6])[LCR]?$/.test(raw) ? raw.padStart(/[LCR]$/.test(raw) ? 3 : 2, '0') : '';
}

export function parseA339TakeoffReport(json: unknown, expectedAirport = ''): A339TakeoffReport {
  const source = record(json);
  const aircraft = record(source.aircraft);
  if (text(aircraft.icaocode).toUpperCase() !== 'A339') {
    throw new Error('The latest SimBrief OFP is not for an A339. Generate an A330-900 OFP first.');
  }
  const takeoff = record(record(source.tlr).takeoff);
  const conditions = record(takeoff.conditions);
  const airport = text(conditions.airport_icao).toUpperCase();
  if (!/^[A-Z0-9]{4}$/.test(airport)) {
    throw new Error('No takeoff report. Enable Runway Analysis in SimBrief, generate the OFP, then import again.');
  }
  if (expectedAirport && airport !== expectedAirport.toUpperCase()) {
    throw new Error(
      `The report is for ${airport}, but the tablet flight departs ${expectedAirport}. Import the matching flight first.`,
    );
  }
  const rawRunways = Array.isArray(takeoff.runway) ? takeoff.runway : [takeoff.runway];
  if (rawRunways.length > 100) throw new Error('Unexpected number of runway reports.');
  const runways: A339TakeoffRunwayReport[] = [];
  const plannedWeight = number(conditions.planned_weight, 1, 1_000_000);
  for (const value of rawRunways) {
    const row = record(value);
    const runway = normalizeTakeoffRunway(row.identifier);
    if (!runway) continue;
    if (runways.some((r) => r.runway === runway)) throw new Error(`Duplicate report for runway ${runway}.`);
    const v1 = number(row.speeds_v1, 1, 400);
    const vr = number(row.speeds_vr, 1, 400);
    const v2 = number(row.speeds_v2, 1, 400);
    const maxWeight = number(row.max_weight, 1, 1_000_000);
    let unavailableReason: string | undefined;
    if (v1 === undefined || vr === undefined || v2 === undefined || v1 > vr || vr > v2) {
      unavailableReason = 'The report is missing a complete, ordered set of takeoff speeds.';
    } else if (plannedWeight === undefined || maxWeight === undefined) {
      unavailableReason = 'The report is missing the takeoff weight or runway weight limit.';
    } else if (plannedWeight > maxWeight) {
      unavailableReason = 'The reported takeoff weight exceeds this runway’s weight limit.';
    }
    runways.push({
      runway,
      v1: unavailableReason ? undefined : v1,
      vr: unavailableReason ? undefined : vr,
      v2: unavailableReason ? undefined : v2,
      flex: unavailableReason ? undefined : number(row.flex_temperature, -60, 100),
      flaps: text(row.flap_setting),
      thrust: text(row.thrust_setting),
      packs: text(row.bleed_setting),
      antiIce: text(row.anti_ice_setting),
      maxWeight: text(row.max_weight),
      limit: text(row.limit_code),
      unavailableReason,
    });
  }
  if (!runways.length)
    throw new Error('The OFP contains no takeoff runway results. Regenerate it with Runway Analysis enabled.');
  const general = record(source.general);
  const units = text(record(source.params).units).toUpperCase();
  const ofpTow = number(record(source.weights).est_tow, 1, 1_000_000);
  return {
    airport,
    destination: text(record(source.destination).icao_code).toUpperCase(),
    plannedRunway: normalizeTakeoffRunway(conditions.planned_runway),
    registration: text(aircraft.reg),
    flight: text(record(source.atc).callsign) || `${text(general.icao_airline)}${text(general.flight_number)}`,
    airline: text(general.icao_airline),
    flightNumber: text(general.flight_number),
    scheduledDeparture: text(record(source.times).sched_out),
    generated: text(record(source.params).time_generated),
    plannedWeight: text(conditions.planned_weight),
    // Only apply the documented OFP mass unit when the raw report TOW agrees with it.
    weightUnits: plannedWeight !== undefined && plannedWeight === ofpTow && ['KGS', 'LBS'].includes(units) ? units : '',
    wind: `${text(conditions.wind_direction) || '---'} / ${text(conditions.wind_speed) || '---'} kt`,
    temperature: text(conditions.temperature),
    // SimBrief can choose QNH and runway-distance units independently of OFP weight units.
    // Preserve the source values when their units are unspecified.
    altimeter: text(conditions.altimeter),
    surface: text(conditions.surface_condition),
    runways,
    reportText: text(record(source.text).tlr_section, 2_000_000),
  };
}

export async function fetchA339TakeoffReport(
  username: string,
  userId: string,
  expectedAirport: string,
): Promise<A339TakeoffReport> {
  const url = new URL('https://www.simbrief.com/api/xml.fetcher.php');
  if (userId.trim()) url.searchParams.set('userid', userId.trim());
  else if (username.trim()) url.searchParams.set('username', username.trim());
  else throw new Error('Set your SimBrief username or Pilot ID in the tablet settings first.');
  url.searchParams.set('json', '1');
  const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`SimBrief could not load the OFP (${response.status}). Try again shortly.`);
  return parseA339TakeoffReport(await response.json(), expectedAirport);
}
