// Copyright (c) 2021-2024 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0

import {
  AircraftConfig,
  EngineModelParameters,
  FlightModelParameters,
  FMSymbolsConfig,
  LnavConfig,
  VnavConfig,
  VnavDescentMode,
} from '@fmgc/flightplanning/AircraftConfigTypes';

const lnavConfig: LnavConfig = {
  DEFAULT_MIN_PREDICTED_TAS: 160,
  TURN_RADIUS_FACTOR: 1.0,
  NUM_COMPUTED_TRANSITIONS_AFTER_ACTIVE: -1,
  EMIT_END_OF_VD_MARKER: false,
};

const vnavConfig: VnavConfig = {
  VNAV_DESCENT_MODE: VnavDescentMode.NORMAL,
  VNAV_EMIT_CDA_FLAP_PWP: false,
  DEBUG_PROFILE: false,
  DEBUG_GUIDANCE: false,
  ALLOW_DEBUG_PARAMETER_INJECTION: false,
  VNAV_USE_LATCHED_DESCENT_MODE: false,
  IDLE_N1_MARGIN: 3,
  MAXIMUM_FUEL_ESTIMATE: 40000,
};

const flightModelParams: FlightModelParameters = {
  Cd0: 0.026,
  wingSpan: 209.97,
  wingArea: 4000,
  wingEffcyFactor: 0.72,
  requiredAccelRateKNS: 1.33,
  requiredAccelRateMS2: 0.684,
  gravityConstKNS: 19.0626,
  gravityConstMS2: 9.806665,
  machValues: [0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85],
  dragCoefficientCorrections: [0, 0.0002, 0.0003, 0.0004, 0.0008, 0.0015, 0.01],
  speedBrakeDrag: 0.01008,
  gearDrag: 0.0372,
  dragCoeffFactor: 1,
};

const engineModelParams: EngineModelParameters = {
  maxThrust: 72_200,
  numberOfEngines: 2,
  fuelBurnFactor: 2.5,
};

const fmsSymbolConfig: FMSymbolsConfig = {
  publishDepartureIdent: false,
  showRnpArLabel: false,
};

export const A330AircraftConfig: AircraftConfig = {
  lnavConfig,
  vnavConfig,
  engineModelParameters: engineModelParams,
  flightModelParameters: flightModelParams,
  fmSymbolConfig: fmsSymbolConfig,
};
