// Copyright (c) 2023-2024 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

// Data and calculations obtained from Quick Reference Handbook (In Flight Procedures, Landing Performance Assessment/Landing Distance)

import {
  AutobrakeMode,
  LandingPerformanceCalculator,
  LandingFlapsConfig,
  LandingRunwayConditions,
} from '@flybywiresim/fbw-sdk';

/**
 * Landing data for a specific aircraft configuration with a specific runway condition
 */
type LandingData = {
  refDistance: number;
  weightCorrectionAbove: number; // per 10T above 190T
  weightCorrectionBelow: number; // per 10T below 190T
  speedCorrection: number; // Per 5kt
  altitudeCorrection: number; // Per 1000ft ASL
  windCorrection: number; // Per 5KT tail wind
  tempCorrection: number; // Per 10 deg C above ISA
  slopeCorrection: number; // Per 1% down slope
  reverserCorrection: number; // Per thrust reverser operative
  overweightProcedureCorrection: number; // If overweight procedure applied
};

type FlapsConfigLandingData = {
  [flapsConfig in LandingFlapsConfig]: LandingData;
};

type AutobrakeConfigLandingData = {
  [autobrakeConfig in AutobrakeMode]: FlapsConfigLandingData;
};

type RunwayConditionLandingData = {
  [runwayCondition in LandingRunwayConditions]: AutobrakeConfigLandingData;
};

const dryRunwayLandingData: AutobrakeConfigLandingData = {
  [AutobrakeMode.Max]: {
    [LandingFlapsConfig.Full]: {
      refDistance: 1310,
      weightCorrectionAbove: 170,
      weightCorrectionBelow: -40,
      speedCorrection: 80,
      altitudeCorrection: 50,
      windCorrection: 140,
      tempCorrection: 40,
      slopeCorrection: 20,
      reverserCorrection: -10,
      overweightProcedureCorrection: 640,
    },
    [LandingFlapsConfig.Conf3]: {
      refDistance: 1360,
      weightCorrectionAbove: 180,
      weightCorrectionBelow: -50,
      speedCorrection: 80,
      altitudeCorrection: 50,
      windCorrection: 150,
      tempCorrection: 50,
      slopeCorrection: 20,
      reverserCorrection: -10,
      overweightProcedureCorrection: 740,
    },
  },
  [AutobrakeMode.Medium]: {
    [LandingFlapsConfig.Full]: {
      refDistance: 1670,
      weightCorrectionAbove: 140,
      weightCorrectionBelow: -40,
      speedCorrection: 100,
      altitudeCorrection: 50,
      windCorrection: 150,
      tempCorrection: 50,
      slopeCorrection: 20,
      reverserCorrection: 0,
      overweightProcedureCorrection: 70,
    },
    [LandingFlapsConfig.Conf3]: {
      refDistance: 1750,
      weightCorrectionAbove: 160,
      weightCorrectionBelow: -50,
      speedCorrection: 100,
      altitudeCorrection: 60,
      windCorrection: 160,
      tempCorrection: 50,
      slopeCorrection: 20,
      reverserCorrection: 0,
      overweightProcedureCorrection: 70,
    },
  },
  [AutobrakeMode.Low]: {
    [LandingFlapsConfig.Full]: {
      refDistance: 2220,
      weightCorrectionAbove: 160,
      weightCorrectionBelow: -40,
      speedCorrection: 130,
      altitudeCorrection: 80,
      windCorrection: 220,
      tempCorrection: 70,
      slopeCorrection: 30,
      reverserCorrection: -20,
      overweightProcedureCorrection: 100,
    },
    [LandingFlapsConfig.Conf3]: {
      refDistance: 2340,
      weightCorrectionAbove: 170,
      weightCorrectionBelow: -50,
      speedCorrection: 140,
      altitudeCorrection: 80,
      windCorrection: 220,
      tempCorrection: 80,
      slopeCorrection: 40,
      reverserCorrection: -30,
      overweightProcedureCorrection: 110,
    },
  },
};

const goodRunwayLandingData: AutobrakeConfigLandingData = {
  [AutobrakeMode.Max]: {
    [LandingFlapsConfig.Full]: {
      refDistance: 1600,
      weightCorrectionAbove: 180,
      weightCorrectionBelow: -70,
      speedCorrection: 120,
      altitudeCorrection: 80,
      windCorrection: 220,
      tempCorrection: 60,
      slopeCorrection: 40,
      reverserCorrection: -20,
      overweightProcedureCorrection: 500,
    },
    [LandingFlapsConfig.Conf3]: {
      refDistance: 1700,
      weightCorrectionAbove: 200,
      weightCorrectionBelow: -80,
      speedCorrection: 130,
      altitudeCorrection: 80,
      windCorrection: 230,
      tempCorrection: 80,
      slopeCorrection: 60,
      reverserCorrection: -20,
      overweightProcedureCorrection: 580,
    },
  },
  [AutobrakeMode.Medium]: {
    [LandingFlapsConfig.Full]: {
      refDistance: 1760,
      weightCorrectionAbove: 180,
      weightCorrectionBelow: -70,
      speedCorrection: 120,
      altitudeCorrection: 80,
      windCorrection: 220,
      tempCorrection: 60,
      slopeCorrection: 50,
      reverserCorrection: -20,
      overweightProcedureCorrection: 120,
    },
    [LandingFlapsConfig.Conf3]: {
      refDistance: 1870,
      weightCorrectionAbove: 200,
      weightCorrectionBelow: -80,
      speedCorrection: 130,
      altitudeCorrection: 80,
      windCorrection: 230,
      tempCorrection: 80,
      slopeCorrection: 60,
      reverserCorrection: -30,
      overweightProcedureCorrection: 140,
    },
  },
  [AutobrakeMode.Low]: {
    [LandingFlapsConfig.Full]: {
      refDistance: 2220,
      weightCorrectionAbove: 160,
      weightCorrectionBelow: -70,
      speedCorrection: 130,
      altitudeCorrection: 80,
      windCorrection: 220,
      tempCorrection: 70,
      slopeCorrection: 30,
      reverserCorrection: -20,
      overweightProcedureCorrection: 100,
    },
    [LandingFlapsConfig.Conf3]: {
      refDistance: 2340,
      weightCorrectionAbove: 190,
      weightCorrectionBelow: -80,
      speedCorrection: 140,
      altitudeCorrection: 80,
      windCorrection: 220,
      tempCorrection: 80,
      slopeCorrection: 40,
      reverserCorrection: -30,
      overweightProcedureCorrection: 110,
    },
  },
};

const goodMediumRunwayLandingData: AutobrakeConfigLandingData = {
  [AutobrakeMode.Max]: {
    [LandingFlapsConfig.Full]: {
      refDistance: 1820,
      weightCorrectionAbove: 130,
      weightCorrectionBelow: -60,
      speedCorrection: 100,
      altitudeCorrection: 70,
      windCorrection: 200,
      tempCorrection: 60,
      slopeCorrection: 60,
      reverserCorrection: -40,
      overweightProcedureCorrection: 570,
    },
    [LandingFlapsConfig.Conf3]: {
      refDistance: 1930,
      weightCorrectionAbove: 150,
      weightCorrectionBelow: -80,
      speedCorrection: 100,
      altitudeCorrection: 70,
      windCorrection: 210,
      tempCorrection: 60,
      slopeCorrection: 70,
      reverserCorrection: -50,
      overweightProcedureCorrection: 660,
    },
  },
  [AutobrakeMode.Medium]: {
    [LandingFlapsConfig.Full]: {
      refDistance: 1980,
      weightCorrectionAbove: 130,
      weightCorrectionBelow: -60,
      speedCorrection: 100,
      altitudeCorrection: 70,
      windCorrection: 210,
      tempCorrection: 60,
      slopeCorrection: 70,
      reverserCorrection: -60,
      overweightProcedureCorrection: 100,
    },
    [LandingFlapsConfig.Conf3]: {
      refDistance: 2100,
      weightCorrectionAbove: 140,
      weightCorrectionBelow: -80,
      speedCorrection: 110,
      altitudeCorrection: 70,
      windCorrection: 220,
      tempCorrection: 60,
      slopeCorrection: 80,
      reverserCorrection: -60,
      overweightProcedureCorrection: 110,
    },
  },
  [AutobrakeMode.Low]: {
    [LandingFlapsConfig.Full]: {
      refDistance: 2230,
      weightCorrectionAbove: 160,
      weightCorrectionBelow: -60,
      speedCorrection: 130,
      altitudeCorrection: 80,
      windCorrection: 220,
      tempCorrection: 70,
      slopeCorrection: 50,
      reverserCorrection: -20,
      overweightProcedureCorrection: 100,
    },
    [LandingFlapsConfig.Conf3]: {
      refDistance: 2350,
      weightCorrectionAbove: 170,
      weightCorrectionBelow: -80,
      speedCorrection: 140,
      altitudeCorrection: 80,
      windCorrection: 230,
      tempCorrection: 80,
      slopeCorrection: 60,
      reverserCorrection: -30,
      overweightProcedureCorrection: 110,
    },
  },
};

const mediumRunwayLandingData: AutobrakeConfigLandingData = {
  [AutobrakeMode.Max]: {
    [LandingFlapsConfig.Full]: {
      refDistance: 2030,
      weightCorrectionAbove: 150,
      weightCorrectionBelow: -70,
      speedCorrection: 110,
      altitudeCorrection: 70,
      windCorrection: 230,
      tempCorrection: 70,
      slopeCorrection: 90,
      reverserCorrection: -60,
      overweightProcedureCorrection: 530,
    },
    [LandingFlapsConfig.Conf3]: {
      refDistance: 2160,
      weightCorrectionAbove: 170,
      weightCorrectionBelow: -90,
      speedCorrection: 120,
      altitudeCorrection: 80,
      windCorrection: 240,
      tempCorrection: 70,
      slopeCorrection: 110,
      reverserCorrection: -70,
      overweightProcedureCorrection: 620,
    },
  },
  [AutobrakeMode.Medium]: {
    [LandingFlapsConfig.Full]: {
      refDistance: 2170,
      weightCorrectionAbove: 150,
      weightCorrectionBelow: -70,
      speedCorrection: 110,
      altitudeCorrection: 80,
      windCorrection: 240,
      tempCorrection: 70,
      slopeCorrection: 100,
      reverserCorrection: -70,
      overweightProcedureCorrection: 110,
    },
    [LandingFlapsConfig.Conf3]: {
      refDistance: 2310,
      weightCorrectionAbove: 160,
      weightCorrectionBelow: -90,
      speedCorrection: 120,
      altitudeCorrection: 80,
      windCorrection: 250,
      tempCorrection: 70,
      slopeCorrection: 120,
      reverserCorrection: -80,
      overweightProcedureCorrection: 130,
    },
  },
  [AutobrakeMode.Low]: {
    [LandingFlapsConfig.Full]: {
      refDistance: 2310,
      weightCorrectionAbove: 160,
      weightCorrectionBelow: -70,
      speedCorrection: 130,
      altitudeCorrection: 80,
      windCorrection: 240,
      tempCorrection: 80,
      slopeCorrection: 90,
      reverserCorrection: -30,
      overweightProcedureCorrection: 110,
    },
    [LandingFlapsConfig.Conf3]: {
      refDistance: 2450,
      weightCorrectionAbove: 170,
      weightCorrectionBelow: -90,
      speedCorrection: 140,
      altitudeCorrection: 90,
      windCorrection: 250,
      tempCorrection: 80,
      slopeCorrection: 110,
      reverserCorrection: -40,
      overweightProcedureCorrection: 120,
    },
  },
};

const mediumPoorRunwayLandingData: AutobrakeConfigLandingData = {
  [AutobrakeMode.Max]: {
    [LandingFlapsConfig.Full]: {
      refDistance: 2350,
      weightCorrectionAbove: 270,
      weightCorrectionBelow: -110,
      speedCorrection: 180,
      altitudeCorrection: 120,
      windCorrection: 390,
      tempCorrection: 120,
      slopeCorrection: 150,
      reverserCorrection: -70,
      overweightProcedureCorrection: 370,
    },
    [LandingFlapsConfig.Conf3]: {
      refDistance: 2580,
      weightCorrectionAbove: 310,
      weightCorrectionBelow: -130,
      speedCorrection: 190,
      altitudeCorrection: 140,
      windCorrection: 420,
      tempCorrection: 130,
      slopeCorrection: 190,
      reverserCorrection: -90,
      overweightProcedureCorrection: 430,
    },
  },
  [AutobrakeMode.Medium]: {
    [LandingFlapsConfig.Full]: {
      refDistance: 2420,
      weightCorrectionAbove: 270,
      weightCorrectionBelow: -110,
      speedCorrection: 170,
      altitudeCorrection: 130,
      windCorrection: 390,
      tempCorrection: 110,
      slopeCorrection: 150,
      reverserCorrection: -90,
      overweightProcedureCorrection: 170,
    },
    [LandingFlapsConfig.Conf3]: {
      refDistance: 2650,
      weightCorrectionAbove: 310,
      weightCorrectionBelow: -130,
      speedCorrection: 190,
      altitudeCorrection: 140,
      windCorrection: 420,
      tempCorrection: 130,
      slopeCorrection: 200,
      reverserCorrection: -100,
      overweightProcedureCorrection: 190,
    },
  },
  [AutobrakeMode.Low]: {
    [LandingFlapsConfig.Full]: {
      refDistance: 2470,
      weightCorrectionAbove: 270,
      weightCorrectionBelow: -110,
      speedCorrection: 170,
      altitudeCorrection: 130,
      windCorrection: 400,
      tempCorrection: 110,
      slopeCorrection: 160,
      reverserCorrection: -50,
      overweightProcedureCorrection: 160,
    },
    [LandingFlapsConfig.Conf3]: {
      refDistance: 2710,
      weightCorrectionAbove: 310,
      weightCorrectionBelow: -130,
      speedCorrection: 190,
      altitudeCorrection: 140,
      windCorrection: 430,
      tempCorrection: 130,
      slopeCorrection: 210,
      reverserCorrection: -80,
      overweightProcedureCorrection: 180,
    },
  },
};

const poorRunwayLandingData: AutobrakeConfigLandingData = {
  [AutobrakeMode.Max]: {
    [LandingFlapsConfig.Full]: {
      refDistance: 3640,
      weightCorrectionAbove: 290,
      weightCorrectionBelow: -140,
      speedCorrection: 170,
      altitudeCorrection: 140,
      windCorrection: 550,
      tempCorrection: 130,
      slopeCorrection: 720,
      reverserCorrection: -200,
      overweightProcedureCorrection: 360,
    },
    [LandingFlapsConfig.Conf3]: {
      refDistance: 3970,
      weightCorrectionAbove: 330,
      weightCorrectionBelow: -160,
      speedCorrection: 180,
      altitudeCorrection: 150,
      windCorrection: 570,
      tempCorrection: 150,
      slopeCorrection: 850,
      reverserCorrection: -240,
      overweightProcedureCorrection: 430,
    },
  },
  [AutobrakeMode.Medium]: {
    [LandingFlapsConfig.Full]: {
      refDistance: 3710,
      weightCorrectionAbove: 290,
      weightCorrectionBelow: -140,
      speedCorrection: 160,
      altitudeCorrection: 140,
      windCorrection: 560,
      tempCorrection: 130,
      slopeCorrection: 730,
      reverserCorrection: -210,
      overweightProcedureCorrection: 170,
    },
    [LandingFlapsConfig.Conf3]: {
      refDistance: 4050,
      weightCorrectionAbove: 330,
      weightCorrectionBelow: -160,
      speedCorrection: 170,
      altitudeCorrection: 150,
      windCorrection: 580,
      tempCorrection: 140,
      slopeCorrection: 860,
      reverserCorrection: -250,
      overweightProcedureCorrection: 190,
    },
  },
  [AutobrakeMode.Low]: {
    [LandingFlapsConfig.Full]: {
      refDistance: 3750,
      weightCorrectionAbove: 290,
      weightCorrectionBelow: -140,
      speedCorrection: 160,
      altitudeCorrection: 140,
      windCorrection: 550,
      tempCorrection: 140,
      slopeCorrection: 720,
      reverserCorrection: -220,
      overweightProcedureCorrection: 160,
    },
    [LandingFlapsConfig.Conf3]: {
      refDistance: 4100,
      weightCorrectionAbove: 330,
      weightCorrectionBelow: -160,
      speedCorrection: 180,
      altitudeCorrection: 150,
      windCorrection: 580,
      tempCorrection: 150,
      slopeCorrection: 860,
      reverserCorrection: -260,
      overweightProcedureCorrection: 180,
    },
  },
};

/**
 * Stores all landing data for the aircraft.
 * Retrieve with runwayConditionLandingData[runwayCondition][autobrakeMode][flapsConfig]
 */
const runwayConditionLandingData: RunwayConditionLandingData = {
  [LandingRunwayConditions.Dry]: dryRunwayLandingData,
  [LandingRunwayConditions.Good]: goodRunwayLandingData,
  [LandingRunwayConditions.GoodMedium]: goodMediumRunwayLandingData,
  [LandingRunwayConditions.Medium]: mediumRunwayLandingData,
  [LandingRunwayConditions.MediumPoor]: mediumPoorRunwayLandingData,
  [LandingRunwayConditions.Poor]: poorRunwayLandingData,
};

/**
 * Safety margin multiplier, obtained from QRH In-Flight Performance section
 */
const SAFETY_MARGIN = 1.15;

/**
 * VLS speed (kts) for full flap configuration
 * Index 0 = 120T, Index 8 = 260T, 20T increment
 */
const CONF_FULL_VLS = [126, 126, 130, 138, 145, 152, 160, 163, 164];

/**
 * VLS speed (kts) for conf 3 flaps
 * Index 0 = 120T, Index 8 = 260T, 20T increment
 */
const CONF3_VLS = [126, 126, 131, 139, 146, 153, 159, 163, 163];

/**
 * Gets the interpolated VLS speed (kts) for the given mass, in tonnes, and the appropriate VLS speed table.
 * @param mass
 * @param vlsSpeedTable
 */
const getInterpolatedVlsTableValue = (mass: number, vlsSpeedTable: number[]): number => {
  const min = 120;
  const max = 260;
  const step = 20;

  const index = Math.max(0, Math.ceil((Math.min(max, mass) - min) / step));
  console.log(index);

  if (index === 0) return vlsSpeedTable[0];
  if (index === 8) return vlsSpeedTable[8];

  const lower = vlsSpeedTable[index - 1];
  const upper = vlsSpeedTable[index];

  const oneTonSpeedIncrement = (upper - lower) / step;
  if (mass % step == 0) return upper;
  return lower + oneTonSpeedIncrement * (mass % step);
};

function getTailWind(windDirection: number, windMagnitude: number, runwayHeading: number): number {
  const windDirectionRelativeToRwy = windDirection - runwayHeading;
  const windDirectionRelativeToRwyRadians = toRadians(windDirectionRelativeToRwy);

  const tailWind = Math.cos(Math.PI - windDirectionRelativeToRwyRadians) * windMagnitude;
  return tailWind;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export class A330343LandingCalculator implements LandingPerformanceCalculator {
  /**
   * Calculates the landing distances for each autobrake mode for the given conditions
   * @param weight Aircraft weight in KGs
   * @param flaps Flap Configuration
   * @param runwayCondition
   * @param approachSpeed Actual approach speed in kts
   * @param windDirection Heading wind is coming from, relative to north
   * @param windMagnitude Magnitude of wind in Knots
   * @param runwayHeading Heading of runway relative to north
   * @param reverseThrust Indicates if reverse thrust is active
   * @param altitude Runway altitude in feet ASL
   * @param temperature OAT of runway
   * @param slope Runway slope in %. Negative is downward slope
   * @param overweightProcedure Overweight procedure is being used if true
   * @param autoland Indicates if the usage of autoland is active
   */
  public calculateLandingDistances(
    weight: number,
    flaps: LandingFlapsConfig,
    runwayCondition: LandingRunwayConditions,
    approachSpeed: number,
    windDirection: number,
    windMagnitude: number,
    runwayHeading: number,
    reverseThrust: boolean,
    altitude: number,
    temperature: number,
    slope: number,
    overweightProcedure: boolean,
    pressure: number,
    autoland: boolean,
  ): { maxAutobrakeDist: number; mediumAutobrakeDist: number; lowAutobrakeDist: number } {
    return {
      maxAutobrakeDist:
        SAFETY_MARGIN *
        this.calculateRequiredLandingDistance(
          weight,
          flaps,
          runwayCondition,
          AutobrakeMode.Max,
          approachSpeed,
          windDirection,
          windMagnitude,
          runwayHeading,
          reverseThrust,
          altitude,
          temperature,
          slope,
          overweightProcedure,
          pressure,
          autoland,
        ),
      mediumAutobrakeDist:
        SAFETY_MARGIN *
        this.calculateRequiredLandingDistance(
          weight,
          flaps,
          runwayCondition,
          AutobrakeMode.Medium,
          approachSpeed,
          windDirection,
          windMagnitude,
          runwayHeading,
          reverseThrust,
          altitude,
          temperature,
          slope,
          overweightProcedure,
          pressure,
          autoland,
        ),
      lowAutobrakeDist:
        SAFETY_MARGIN *
        this.calculateRequiredLandingDistance(
          weight,
          flaps,
          runwayCondition,
          AutobrakeMode.Low,
          approachSpeed,
          windDirection,
          windMagnitude,
          runwayHeading,
          reverseThrust,
          altitude,
          temperature,
          slope,
          overweightProcedure,
          pressure,
          autoland,
        ),
    };
  }

  /**
   * Calculates the required landing distance for the given conditions
   * @param weight Aircraft weight in KGs
   * @param flaps Flap Configuration
   * @param runwayCondition
   * @param autobrakeMode
   * @param approachSpeed Actual approach speed in kts
   * @param windDirection Heading wind is coming from, relative to north
   * @param windMagnitude Magnitude of wind in Knots
   * @param runwayHeading Heading of runway relative to north
   * @param reverseThrust Indicates if reverse thrust is active
   * @param altitude Runway altitude in feet ASL
   * @param temperature OAT of runway
   * @param slope Runway slope in %. Negative is downward slope
   * @param overweightProcedure Overweight procedure is being used if true
   * @param autoland Indicates if the usage of autoland is active
   */
  private calculateRequiredLandingDistance(
    weight: number,
    flaps: LandingFlapsConfig,
    runwayCondition: LandingRunwayConditions,
    autobrakeMode: AutobrakeMode,
    approachSpeed: number,
    windDirection: number,
    windMagnitude: number,
    runwayHeading: number,
    reverseThrust: boolean,
    altitude: number,
    temperature: number,
    slope: number,
    overweightProcedure: boolean,
    pressure: number,
    autoland: boolean,
  ): number {
    const pressureAltitude = altitude + this.getPressureAltitude(pressure);
    const isaTemperature = this.getISATemperature(pressureAltitude);

    let targetApproachSpeed: number;
    const tonnage = weight / 1000;

    if (flaps === LandingFlapsConfig.Full) {
      targetApproachSpeed = getInterpolatedVlsTableValue(tonnage, CONF_FULL_VLS);
    } else {
      targetApproachSpeed = getInterpolatedVlsTableValue(tonnage, CONF3_VLS);
    }

    const landingData = runwayConditionLandingData[runwayCondition][autobrakeMode][flaps];

    let tailWind = getTailWind(windDirection, windMagnitude, runwayHeading);
    if (tailWind < 0) {
      tailWind = 0;
    }

    const weightDifference = weight / 1000 - 190;
    let weightCorrection: number;
    if (weightDifference < 0) {
      weightCorrection = landingData.weightCorrectionBelow * Math.abs(weightDifference);
    } else {
      weightCorrection = landingData.weightCorrectionAbove * weightDifference;
    }

    let speedDifference = approachSpeed - targetApproachSpeed;
    if (speedDifference < 0) {
      speedDifference = 0;
    }

    const speedCorrection = (speedDifference / 5) * landingData.speedCorrection;
    const windCorrection = (tailWind / 5) * landingData.windCorrection;
    let reverserCorrection;
    if (reverseThrust) {
      reverserCorrection = landingData.reverserCorrection * 2;
    } else {
      reverserCorrection = 0;
    }

    const altitudeCorrection = pressureAltitude > 0 ? (pressureAltitude / 1000) * landingData.altitudeCorrection : 0;
    const slopeCorrection = slope < 0 ? Math.abs(slope) * landingData.slopeCorrection : 0;
    const temperatureCorrection =
      temperature > isaTemperature ? ((temperature - isaTemperature) / 10) * landingData.tempCorrection : 0;
    const overweightProcCorrection = overweightProcedure ? landingData.overweightProcedureCorrection : 0;

    let autolandCorrection;

    if (autoland) {
      autolandCorrection = flaps === LandingFlapsConfig.Full ? 180 : 160;
    } else {
      autolandCorrection = 0;
    }

    const requiredLandingDistance =
      landingData.refDistance +
      weightCorrection +
      speedCorrection +
      windCorrection +
      reverserCorrection +
      altitudeCorrection +
      slopeCorrection +
      temperatureCorrection +
      overweightProcCorrection +
      autolandCorrection;

    return Math.round(requiredLandingDistance);
  }

  /**
   * Converts a given pressure to equivalent pressure altitude
   * @param pressure Pressure in mb
   * @returns Pressure altitude in feet
   */
  private getPressureAltitude(pressure: number): number {
    // Equation from Boeing Jet Transport Performance Methods document
    return 145442.15 * (1 - (pressure / 1013.25) ** 0.190263);
  }

  /**
   * Calculates ISA temperature for a given pressure altitude
   * @param PressureAltitude is pressure altitude in feet
   * @returns ISA temperature in degrees C
   */
  private getISATemperature(pressureAltitude: number): number {
    return 15 - 0.0019812 * pressureAltitude;
  }
}
