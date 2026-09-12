// Copyright (c) 2021-2025 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0

import { NXUnits } from '@flybywiresim/fbw-sdk';

const WING_FUELRATE_GAL_SEC = 18.5523;
const CENTER_MODIFIER = 1.00075;
const TANKS = [
  { index: 1, name: 'CENTER', capacity: 10979 },
  { index: 2, name: 'LEFT_MAIN', capacity: 11095 },
  { index: 3, name: 'RIGHT_MAIN', capacity: 11095 },
  { index: 4, name: 'LEFT_AUX', capacity: 964 },
  { index: 5, name: 'RIGHT_AUX', capacity: 964 },
  { index: 6, name: 'TRIM', capacity: 1646 },
];

enum RefuelRateNumeric {
  REAL = 0,
  FAST = 1,
  INSTANT = 2,
}

// FIXME move to systems host
export class A32NX_Refuel {
  init() {
    const current = TANKS.map((tank) => SimVar.GetSimVarValue(`FUELSYSTEM TANK QUANTITY:${tank.index}`, 'Gallons'));
    const total = current.reduce((sum, quantity) => sum + quantity, 0);
    const fuelWeight = SimVar.GetSimVarValue('FUEL WEIGHT PER GALLON', 'kilograms');
    SimVar.SetSimVarValue('L:A32NX_REFUEL_STARTED_BY_USR', 'Bool', false);
    SimVar.SetSimVarValue('L:A32NX_FUEL_TOTAL_DESIRED', 'Number', total);
    SimVar.SetSimVarValue('L:A32NX_FUEL_DESIRED', 'Number', Math.round(NXUnits.kgToUser(total * fuelWeight)));
    SimVar.SetSimVarValue('L:A32NX_FUEL_DESIRED_PERCENT', 'Number', (total / 36743) * 100);
    TANKS.forEach((tank, i) => SimVar.SetSimVarValue(`L:A32NX_FUEL_${tank.name}_DESIRED`, 'Number', current[i]));
  }

  update(deltaTime: number) {
    if (!SimVar.GetSimVarValue('L:A32NX_REFUEL_STARTED_BY_USR', 'Bool')) {
      return;
    }
    // Pause preserves the request. Cancel ineligible requests so FADEC can resume fuel consumption.
    if (!Number.isFinite(deltaTime) || deltaTime <= 0) {
      return;
    }
    if (!SimVar.GetSimVarValue('SIM ON GROUND', 'Bool')) {
      SimVar.SetSimVarValue('L:A32NX_REFUEL_STARTED_BY_USR', 'Bool', false);
      return;
    }
    const rate = SimVar.GetSimVarValue('L:A32NX_EFB_REFUEL_RATE_SETTING', 'number');
    if (![RefuelRateNumeric.REAL, RefuelRateNumeric.FAST, RefuelRateNumeric.INSTANT].includes(rate)) {
      SimVar.SetSimVarValue('L:A32NX_REFUEL_STARTED_BY_USR', 'Bool', false);
      return;
    }
    if (rate !== RefuelRateNumeric.INSTANT) {
      const powered =
        SimVar.GetSimVarValue('L:A32NX_ELEC_DC_2_BUS_IS_POWERED', 'Bool') ||
        SimVar.GetSimVarValue('L:A32NX_ELEC_DC_HOT_1_BUS_IS_POWERED', 'Bool');
      if (
        !powered ||
        SimVar.GetSimVarValue('ENG COMBUSTION:1', 'Bool') ||
        SimVar.GetSimVarValue('ENG COMBUSTION:2', 'Bool') ||
        SimVar.GetSimVarValue('GPS GROUND SPEED', 'knots') > 0.1
      ) {
        SimVar.SetSimVarValue('L:A32NX_REFUEL_STARTED_BY_USR', 'Bool', false);
        return;
      }
    }
    const targets = TANKS.map((tank) => SimVar.GetSimVarValue(`L:A32NX_FUEL_${tank.name}_DESIRED`, 'Number'));
    const current = TANKS.map((tank) => SimVar.GetSimVarValue(`FUELSYSTEM TANK QUANTITY:${tank.index}`, 'Gallons'));
    if (
      TANKS.some(
        (tank, i) =>
          !Number.isFinite(targets[i]) ||
          targets[i] < 0 ||
          targets[i] > tank.capacity ||
          !Number.isFinite(current[i]) ||
          current[i] < 0 ||
          current[i] > tank.capacity,
      )
    ) {
      return;
    }
    const next = [...current];
    if (rate === RefuelRateNumeric.INSTANT) {
      targets.forEach((target, i) => {
        next[i] = target;
      });
    } else {
      const gallons = (WING_FUELRATE_GAL_SEC * (rate === RefuelRateNumeric.FAST ? 5 : 1) * deltaTime) / 1000;
      // Each bank has one shared budget, including when a tank reaches its target partway through a tick.
      const banks = [
        { fillOrder: [3, 1], budget: gallons / 2 },
        { fillOrder: [4, 2], budget: gallons / 2 },
        { fillOrder: [0, 5], budget: gallons * CENTER_MODIFIER },
      ];
      banks.forEach(({ fillOrder, budget }) => {
        const order = [...fillOrder]
          .reverse()
          .filter((i) => next[i] > targets[i])
          .concat(fillOrder.filter((i) => next[i] < targets[i]));
        order.forEach((i) => {
          const difference = targets[i] - next[i];
          const amount = Math.min(Math.abs(difference), budget);
          next[i] = amount === Math.abs(difference) ? targets[i] : next[i] + Math.sign(difference) * amount;
          budget -= amount;
        });
      });
    }
    if (next.some((quantity, i) => quantity !== current[i])) {
      // The FADEC can miss a start flag that is cleared during this same batch.
      const sequence = SimVar.GetSimVarValue('L:A339X_FUEL_EXTERNAL_EDIT_SEQUENCE', 'Number');
      SimVar.SetSimVarValue(
        'L:A339X_FUEL_EXTERNAL_EDIT_SEQUENCE',
        'Number',
        Number.isSafeInteger(sequence) && sequence < Number.MAX_SAFE_INTEGER ? sequence + 1 : 0,
      );
    }
    TANKS.forEach((tank, i) => {
      if (next[i] !== current[i]) {
        SimVar.SetSimVarValue(`FUELSYSTEM TANK QUANTITY:${tank.index}`, 'Gallons', next[i]);
      }
    });
    if (next.every((quantity, i) => quantity === targets[i])) {
      SimVar.SetSimVarValue('L:A32NX_REFUEL_STARTED_BY_USR', 'Bool', false);
    }
  }
}
