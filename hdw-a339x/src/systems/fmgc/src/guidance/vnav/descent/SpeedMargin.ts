// Copyright (c) 2021-2023 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0

import { VerticalProfileComputationParametersObserver } from '@fmgc/guidance/vnav/VerticalProfileComputationParameters';

export class SpeedMargin {
  private vmo: Knots = 330;

  private mmo: Mach = 0.86;

  constructor(private observer: VerticalProfileComputationParametersObserver) {}

  getTarget(indicatedAirspeed: Knots, targetSpeed: Knots): Knots {
    const [lowerMargin, upperMargin] = this.getMargins(targetSpeed);

    return Math.max(Math.min(indicatedAirspeed, upperMargin), lowerMargin);
  }

  getMargins(currentTarget: Knots): [Knots, Knots] {
    const { managedDescentSpeed, managedDescentSpeedMach, approachSpeed } = this.observer.get();

    const vmax = SimVar.GetSimVarValue('L:A32NX_SPEEDS_VMAX', 'number');
    const vMan = this.getVman(approachSpeed);

    const vls = SimVar.GetSimVarValue('L:A32NX_SPEEDS_VLS', 'number');
    const vmin = Math.max(vls, vMan);

    const mmoAsIas = SimVar.GetGameVarValue('FROM MACH TO KIAS', 'number', this.mmo);
    const isMachTarget =
      managedDescentSpeed - SimVar.GetGameVarValue('FROM MACH TO KIAS', 'number', managedDescentSpeedMach) > 1;

    const distanceToUpperMargin = !isMachTarget && managedDescentSpeed - currentTarget > 1 ? 5 : 20;

    return [
      Math.max(vmin, Math.min(currentTarget - 20, vmax, this.vmo - 3, mmoAsIas - 0.006)),
      Math.max(vmin, Math.min(vmax, this.vmo - 3, mmoAsIas - 0.006, currentTarget + distanceToUpperMargin)),
    ];
  }

  private getVman(vApp: Knots): Knots {
    switch (SimVar.GetSimVarValue('L:A32NX_FLAPS_HANDLE_INDEX', 'Number')) {
      case 0:
        return SimVar.GetSimVarValue('L:A32NX_SPEEDS_GD', 'number');
      case 1:
        return SimVar.GetSimVarValue('L:A32NX_SPEEDS_S', 'number');
      case 2:
        return SimVar.GetSimVarValue('L:A32NX_SPEEDS_F', 'number');
      case 3:
      case 4:
        return vApp;
      default:
        return SimVar.GetSimVarValue('L:A32NX_SPEEDS_VLS', 'number');
    }
  }
}
