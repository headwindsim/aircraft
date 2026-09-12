// Copyright (c) 2026 Headwind Simulations contributors
// SPDX-License-Identifier: GPL-3.0

import React, { useEffect, useRef, useState } from 'react';
import { NXDataStore } from '@flybywiresim/fbw-sdk';
import { useAppSelector } from '../../Store/store';
import {
  A339TakeoffReport as Report,
  fetchA339TakeoffReport,
  normalizeTakeoffRunway,
} from '@shared/performance/a339x_takeoff_report';

export const A339TakeoffReport = () => {
  const flight = useAppSelector((state) => state.simbrief.data);
  const contextKey = JSON.stringify([
    flight.departingAirport,
    flight.departingRunway,
    flight.arrivingAirport,
    flight.aircraftReg,
    flight.airline,
    flight.flightNum,
    flight.schedOut,
    flight.departingMetar,
    flight.weights,
    flight.fuels,
    flight.units,
    flight.route,
  ]);
  const [loadedContext, setLoadedContext] = useState('');
  const [report, setReport] = useState<Report>();
  const [selectedRunway, setSelectedRunway] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showReport, setShowReport] = useState(false);
  const request = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(
    () => () => {
      request.current++;
      clearTimeout(timer.current);
    },
    [],
  );

  const load = async () => {
    if (busy) return;
    const requestId = ++request.current;
    clearTimeout(timer.current);
    setBusy(true);
    setError('');
    setReport(undefined);
    setShowReport(false);
    // Coherent has no AbortController. Bound the UI wait and ignore obsolete responses.
    timer.current = setTimeout(() => {
      if (request.current === requestId) {
        request.current++;
        setError('The request timed out. Try importing again.');
        setBusy(false);
      }
    }, 30_000);
    try {
      const next = await fetchA339TakeoffReport(
        NXDataStore.getLegacy('NAVIGRAPH_USERNAME', ''),
        NXDataStore.getLegacy('CONFIG_OVERRIDE_SIMBRIEF_USERID', ''),
        flight.departingAirport,
      );
      if (request.current !== requestId) return;
      if (flight.arrivingAirport && next.destination !== flight.arrivingAirport.toUpperCase()) {
        throw new Error(
          'The latest OFP has a different destination. Import the matching flight into the tablet first.',
        );
      }
      if (flight.aircraftReg && next.registration.toUpperCase() !== flight.aircraftReg.toUpperCase()) {
        throw new Error(
          'The report aircraft registration differs from the tablet flight. Import the matching OFP first.',
        );
      }
      if (
        (flight.airline && next.airline !== flight.airline) ||
        (flight.flightNum && next.flightNumber !== String(flight.flightNum)) ||
        (flight.schedOut && next.scheduledDeparture !== String(flight.schedOut))
      ) {
        throw new Error(
          'The report flight number or departure time differs from the tablet flight. Import the matching OFP first.',
        );
      }
      setReport(next);
      setLoadedContext(contextKey);
      setSelectedRunway(normalizeTakeoffRunway(flight.departingRunway) || next.plannedRunway);
    } catch (cause) {
      if (request.current === requestId) {
        setError(cause instanceof Error ? cause.message : String(cause));
      }
    } finally {
      if (request.current === requestId) {
        clearTimeout(timer.current);
        setBusy(false);
      }
    }
  };

  const stale = report !== undefined && loadedContext !== contextKey;
  const row = !stale ? report?.runways.find((runway) => runway.runway === selectedRunway) : undefined;
  const metrics: [string, number | undefined, string][] = [
    ['V1', row?.v1, 'kt'],
    ['VR', row?.vr, 'kt'],
    ['V2', row?.v2, 'kt'],
    ['FLEX', row?.flex, '°C'],
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-5">
        <div>
          <h2 className="text-2xl font-semibold">A330-900 takeoff performance</h2>
          <p className="mt-2 text-theme-text">SimBrief OFP runway analysis</p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={load}
          className="rounded-md border-2 border-theme-highlight bg-theme-highlight px-5 py-3 text-theme-body disabled:opacity-50"
        >
          {busy ? 'Importing…' : 'Import latest report'}
        </button>
      </div>
      <p className="rounded-md border border-theme-accent p-4">
        Calculate in SimBrief with <strong>Runway Analysis</strong> enabled, generate the OFP, then import it here.
        These results apply to the report’s weight, weather and configuration. Changes require a new calculation. This
        page does not calculate new V-speeds or FLEX, or enter values into the MCDU.
      </p>
      <p>
        <a
          href="https://dispatch.simbrief.com/performance"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => {
            if (typeof OpenBrowser === 'function') {
              event.preventDefault();
              OpenBrowser('https://dispatch.simbrief.com/performance');
            }
          }}
          className="text-theme-highlight underline"
        >
          SimBrief performance calculator ↗
        </a>
        <span className="ml-3">Standalone calculator changes may not update your saved OFP report.</span>
      </p>
      {error && (
        <p role="alert" className="rounded-md border border-utility-red p-4">
          {error}
        </p>
      )}
      {stale && <p role="alert">The tablet flight changed. Import its matching report before using these results.</p>}
      {report && !stale && (
        <>
          <div className="flex items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold">
                {report.airport} · {report.flight} · {report.registration}
              </h3>
              <p className="mt-1">Planned runway {report.plannedRunway || 'not reported'}</p>
              <p className="mt-1">
                Report takeoff weight:{' '}
                {report.weightUnits
                  ? `${report.plannedWeight} ${report.weightUnits}`
                  : 'See source report for weight and units'}
              </p>
              <p className="mt-1">
                Report generated:{' '}
                {/^\d+$/.test(report.generated)
                  ? new Date(Number(report.generated) * 1000).toUTCString()
                  : report.generated || 'Not reported'}
              </p>
            </div>
            <div role="group" aria-label="Runway" className="flex flex-wrap items-center gap-3">
              <span>Runway</span>
              {report.runways.map((runway) => (
                <button
                  type="button"
                  key={runway.runway}
                  aria-pressed={selectedRunway === runway.runway}
                  onClick={() => setSelectedRunway(runway.runway)}
                  className={`rounded-md border border-theme-accent px-3 py-2 ${selectedRunway === runway.runway ? 'bg-theme-highlight text-theme-body' : 'text-theme-text'}`}
                >
                  {runway.runway}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {metrics.map(([label, value, unit]) => (
              <div key={label} className="border-b border-theme-accent pb-4">
                <p>{label}</p>
                <p className="mt-2 font-mono text-4xl text-theme-highlight">
                  {value ?? '---'} <span className="text-base">{unit}</span>
                </p>
              </div>
            ))}
          </div>
          {!row && <p role="alert">No result for this runway. Do not use the figures from a different runway.</p>}
          {row?.unavailableReason && <p role="alert">{row.unavailableReason}</p>}
          {row && (
            <div role="list" className="grid grid-cols-4 gap-x-6 gap-y-4">
              {[
                ['Flaps', row.flaps],
                ['Thrust', row.thrust],
                ['Packs / bleed', row.packs],
                ['Anti-ice', row.antiIce],
                ['Wind', report.wind],
                ['OAT', report.temperature && `${report.temperature} °C`],
                ['QNH as reported', report.altimeter],
                ['Surface', report.surface],
                [
                  'Reported weight limit',
                  report.weightUnits && row.maxWeight ? `${row.maxWeight} ${report.weightUnits}` : 'See source report',
                ],
                ['Limit code', row.limit],
              ].map(([label, value]) => (
                <div role="listitem" key={label}>
                  <div>{label}</div>
                  <div className="mt-1 font-mono text-xl">{value || 'Not reported'}</div>
                </div>
              ))}
            </div>
          )}
          <div className="rounded-md border border-theme-accent p-4">
            <button
              type="button"
              aria-expanded={showReport}
              onClick={() => setShowReport(!showReport)}
              className="font-semibold"
            >
              Full report: weight limits, distances and source units
            </button>
            {showReport && (
              <>
                <p className="my-3">
                  Use the report’s printed unit labels. Distance and QNH units can differ from your aircraft settings.
                </p>
                <div data-report-text className="max-h-96 overflow-auto whitespace-pre font-mono text-sm">
                  {report.reportText || 'Plain-text report not supplied. Read the report in SimBrief.'}
                </div>
              </>
            )}
          </div>
        </>
      )}
      {!report && !busy && !error && (
        <p>
          No report imported yet. Select your A339 flight in SimBrief and include Runway Analysis when generating it.
        </p>
      )}
    </div>
  );
};
