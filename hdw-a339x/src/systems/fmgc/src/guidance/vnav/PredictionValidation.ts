// Copyright (c) 2026 Headwind Simulations contributors
// SPDX-License-Identifier: GPL-3.0

import type { StepResults } from './Predictions';
import type { VerticalCheckpoint } from './profile/NavGeometryProfile';

export class InvalidVnavPredictionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidVnavPredictionError';
  }
}

/** Forward flight cannot gain fuel or travel backwards in time. Reverse descent uses a different contract. */
export function assertValidForwardStep(step: StepResults): void {
  if (
    (step.error !== undefined && step.error !== null) ||
    ![step.finalAltitude, step.distanceTraveled, step.timeElapsed, step.fuelBurned, step.speed].every(
      Number.isFinite,
    ) ||
    step.distanceTraveled < 0 ||
    step.timeElapsed < 0 ||
    step.fuelBurned < 0 ||
    step.speed <= 0 ||
    (step.timeElapsed === 0 &&
      (step.distanceTraveled !== 0 ||
        step.fuelBurned !== 0 ||
        (step.initialAltitude !== undefined && step.finalAltitude !== step.initialAltitude)))
  ) {
    throw new InvalidVnavPredictionError('Invalid forward flight prediction');
  }
}

/** Check after reverse-built descent has been assembled; negative timestamps can be legitimate. */
export function assertFiniteProfile(checkpoints: readonly VerticalCheckpoint[]): void {
  if (
    checkpoints.length === 0 ||
    checkpoints.some(
      (checkpoint) =>
        ![
          checkpoint.distanceFromStart,
          checkpoint.secondsFromPresent,
          checkpoint.altitude,
          checkpoint.remainingFuelOnBoard,
          checkpoint.speed,
          checkpoint.mach,
        ].every(Number.isFinite),
    )
  ) {
    throw new InvalidVnavPredictionError('Incomplete or non-finite vertical profile');
  }
}
