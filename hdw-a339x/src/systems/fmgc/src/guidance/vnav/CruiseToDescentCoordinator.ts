// @ts-strict-ignore
// Copyright (c) 2021-2026 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0

import { CruisePathBuilder } from '@fmgc/guidance/vnav/cruise/CruisePathBuilder';
import { DescentPathBuilder } from '@fmgc/guidance/vnav/descent/DescentPathBuilder';
import { NavGeometryProfile, VerticalCheckpointReason } from '@fmgc/guidance/vnav/profile/NavGeometryProfile';
import { ClimbStrategy } from '@fmgc/guidance/vnav/climb/ClimbStrategy';
import { DescentStrategy } from '@fmgc/guidance/vnav/descent/DescentStrategy';
import { ApproachPathBuilder } from '@fmgc/guidance/vnav/descent/ApproachPathBuilder';
import { SpeedProfile } from '@fmgc/guidance/vnav/climb/SpeedProfile';
import { VerticalProfileComputationParametersObserver } from '@fmgc/guidance/vnav/VerticalProfileComputationParameters';
import { TemporaryCheckpointSequence } from '@fmgc/guidance/vnav/profile/TemporaryCheckpointSequence';
import { ProfileInterceptCalculator } from '@fmgc/guidance/vnav/descent/ProfileInterceptCalculator';
import { AircraftConfig } from '@fmgc/flightplanning/AircraftConfigTypes';
import { InvalidVnavPredictionError } from '@fmgc/guidance/vnav/PredictionValidation';

export class CruiseToDescentCoordinator {
  private lastEstimatedFuelAtDestination: Pounds = 4000;

  private lastEstimatedTimeAtDestination: Seconds = 0;

  constructor(
    private observer: VerticalProfileComputationParametersObserver,
    private cruisePathBuilder: CruisePathBuilder,
    private descentPathBuilder: DescentPathBuilder,
    private approachPathBuilder: ApproachPathBuilder,
    private readonly acConfig: AircraftConfig,
  ) {}

  resetEstimations() {
    const { estimatedDestinationFuel } = this.observer.get();

    // Use INIT FUEL PRED entry as initial estimate for destination EFOB. Clamp it to avoid unrealistic entries from erroneous pilot input.
    this.lastEstimatedFuelAtDestination = Number.isFinite(estimatedDestinationFuel)
      ? Math.min(
          Math.max(estimatedDestinationFuel, this.acConfig.vnavConfig.LOWEST_FUEL_ESTIMATE),
          this.acConfig.vnavConfig.MAXIMUM_FUEL_ESTIMATE,
        )
      : 4000;
    this.lastEstimatedTimeAtDestination = 0;
  }

  buildCruiseAndDescentPath(
    profile: NavGeometryProfile,
    speedProfile: SpeedProfile,
    stepClimbStrategy: ClimbStrategy,
    stepDescentStrategy: DescentStrategy,
  ) {
    // - Start with initial guess for fuel on board at destination
    // - Compute descent profile to get distance to T/D and burnt fuel during descent
    // - Compute cruise profile to T/D -> Use fuel at T/D and previously computed fuel burn to get new fuel on board at destination
    // - Repeat
    const startingPointIndex = profile.findLastVerticalCheckpointIndex(
      VerticalCheckpointReason.TopOfClimb,
      VerticalCheckpointReason.PresentPosition,
    );

    if (startingPointIndex < 0) {
      throw new InvalidVnavPredictionError('Cruise/descent profile has no starting checkpoint');
    }

    let startingPoint = profile.checkpoints[startingPointIndex];

    let iterationCount = 0;
    let todFuelError = Infinity;
    let todTimeError = Infinity;
    let todAltitudeError = Infinity;

    if (
      !Number.isFinite(this.lastEstimatedFuelAtDestination) ||
      !Number.isFinite(this.lastEstimatedTimeAtDestination)
    ) {
      this.resetEstimations();
    }

    let descentPath = new TemporaryCheckpointSequence();
    let cruisePath = new TemporaryCheckpointSequence();

    while (
      iterationCount++ < 4 &&
      (Math.abs(todFuelError) > 100 || Math.abs(todTimeError) > 1 || Math.abs(todAltitudeError) > 1e-6)
    ) {
      descentPath = this.approachPathBuilder.computeApproachPath(
        profile,
        speedProfile,
        this.lastEstimatedFuelAtDestination,
        this.lastEstimatedTimeAtDestination,
      );

      if (descentPath?.lastCheckpoint?.reason !== VerticalCheckpointReason.Decel) {
        throw new InvalidVnavPredictionError('Approach path did not end in DECEL');
      }

      // Geometric and idle
      this.descentPathBuilder.computeManagedDescentPath(
        descentPath,
        profile,
        speedProfile,
        this.cruisePathBuilder.getFinalCruiseAltitude(profile.cruiseSteps),
      );

      // @ts-ignore computeManagedDescentPath changes the checkpoint reason narrowed by the DECEL check.
      if (descentPath.lastCheckpoint?.reason !== VerticalCheckpointReason.TopOfDescent) {
        throw new InvalidVnavPredictionError('Descent path did not end in T/D');
      }

      if (descentPath.lastCheckpoint.distanceFromStart < startingPoint.distanceFromStart) {
        // Check if plane is past T/D.
        if (startingPoint.reason === VerticalCheckpointReason.PresentPosition) {
          // At this point, there will still be a PresentPosition checkpoint in the profile, but we use it and remove it in DescentGuidance
          profile.checkpoints.push(...descentPath.get(true).reverse());

          return;
        }
        if (startingPoint.reason === VerticalCheckpointReason.TopOfClimb) {
          // Flight plan too short
          const [index, climbDescentInterceptDistance] = ProfileInterceptCalculator.calculateIntercept(
            profile.checkpoints,
            descentPath.checkpoints,
          );

          if (index < 0) {
            throw new InvalidVnavPredictionError('Short-route climb and descent paths do not intersect');
          }

          // If there is an intercept, place the T/D wherever we need it
          const combinedTopOfClimbTopOfDescent = profile.addInterpolatedCheckpoint(climbDescentInterceptDistance, {
            reason: VerticalCheckpointReason.TopOfClimb,
          });
          const savedTopOfDescent = descentPath.lastCheckpoint;
          descentPath.checkpoints = descentPath.checkpoints.filter(
            (checkpoint) => checkpoint.distanceFromStart >= combinedTopOfClimbTopOfDescent.distanceFromStart,
          );
          // TODO: We should interpolate this point along the descent path, so fuel and time are correct
          descentPath.push({
            ...savedTopOfDescent,
            distanceFromStart: combinedTopOfClimbTopOfDescent.distanceFromStart,
            altitude: combinedTopOfClimbTopOfDescent.altitude,
          });

          startingPoint = combinedTopOfClimbTopOfDescent;
        }
      }

      cruisePath = this.cruisePathBuilder.computeCruisePath(
        profile,
        this.acConfig,
        startingPoint,
        descentPath.lastCheckpoint.distanceFromStart,
        stepClimbStrategy,
        stepDescentStrategy,
        speedProfile,
      );

      if (!cruisePath?.lastCheckpoint) {
        throw new InvalidVnavPredictionError('Cruise path has no ending checkpoint');
      }

      todFuelError = cruisePath.lastCheckpoint.remainingFuelOnBoard - descentPath.lastCheckpoint.remainingFuelOnBoard;
      todTimeError = cruisePath.lastCheckpoint.secondsFromPresent - descentPath.lastCheckpoint.secondsFromPresent;
      todAltitudeError = cruisePath.lastCheckpoint.altitude - descentPath.lastCheckpoint.altitude;
      if (![todFuelError, todTimeError, todAltitudeError].every(Number.isFinite)) {
        throw new InvalidVnavPredictionError('Cruise/descent predictions did not produce finite results');
      }

      this.lastEstimatedFuelAtDestination += todFuelError;
      this.lastEstimatedTimeAtDestination += todTimeError;
    }

    if (Math.abs(todAltitudeError) > 1e-6) {
      throw new InvalidVnavPredictionError('Cruise and descent altitudes do not join');
    }

    profile.checkpoints = profile.checkpoints.filter(
      (checkpoint) => checkpoint.distanceFromStart <= startingPoint.distanceFromStart,
    );

    profile.checkpoints.push(...cruisePath.get());
    profile.checkpoints.push(...descentPath.get(true).reverse());
  }
}
