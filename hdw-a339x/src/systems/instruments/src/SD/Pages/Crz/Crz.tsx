// Copyright (c) 2021-2023 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0

import React, { useEffect, useState } from 'react';
import { GaugeComponent, GaugeMarkerComponent, splitDecimals } from '@instruments/common/gauges';
import { UnitType } from '@microsoft/msfs-sdk';
import { useSimVar, usePersistentProperty, useArinc429Var } from '@flybywiresim/fbw-sdk';
import { fuelForDisplay } from '../../Common/FuelFunctions';

import './Crz.scss';

export const CrzPage = () => (
  <>
    <svg id="crz-page" viewBox="0 0 600 600" style={{ marginTop: '-60px' }} xmlns="http://www.w3.org/2000/svg">
      <text className="Title" x="300" y="20">
        CRUISE
      </text>

      <text className="SubTitle" x="50" y="60">
        ENG
      </text>
      <FuelComponent />
      <OilComponent />

      <text className="SubTitle" x="50" y="330">
        AIR
      </text>
      <PressureComponent />

      <CondComponent />
    </svg>
  </>
);

export const FuelComponent = () => {
  const [unit] = usePersistentProperty('CONFIG_USING_METRIC_UNIT', '1');

  const [leftConsumption] = useSimVar('L:A32NX_FUEL_USED:1', 'number', 1000);
  const [rightConsumption] = useSimVar('L:A32NX_FUEL_USED:2', 'number', 1000);

  const leftFuel = fuelForDisplay(leftConsumption, unit);
  const rightFuel = fuelForDisplay(rightConsumption, unit);

  return (
    <>
      <text className="Standard Center" x="300" y="70">
        F.USED
      </text>
      <text className="Standard Center" x="300" y="90">
        1+2
      </text>
      <text id="FuelUsedLeft" className="Large Green" x="210" y="95" textAnchor="end">
        {leftFuel}
      </text>
      <text id="FuelUsedRight" className="Large Green" x="455" y="95" textAnchor="end">
        {rightFuel}
      </text>
      <text id="FuelUsedTotal" className="Large Green Center" x="300" y="112">
        {leftFuel + rightFuel}
      </text>
      <text id="FuelUsedUnit" className="Standard Cyan Center" x="300" y="132">
        {unit === '1' ? 'KG' : 'LBS'}
      </text>
      <path className="WingPlaneSym" d="M230 80 l20 -2" />
      <path className="WingPlaneSym" d="M370 80 l-20 -2" />
    </>
  );
};

export const OilComponent = () => {
  const [oilQuantLeft] = useSimVar('ENG OIL QUANTITY:1', 'percent', 1000);
  const [oilQuantRight] = useSimVar('ENG OIL QUANTITY:2', 'percent', 1000);

  const oilLeft = splitDecimals(oilQuantLeft * 0.01 * 20);
  const oilRight = splitDecimals(oilQuantRight * 0.01 * 20);

  const [leftVIBN1] = useSimVar('TURB ENG VIBRATION:1', 'Number', 1000);
  const [rightVIBN1] = useSimVar('TURB ENG VIBRATION:2', 'Number', 1000);

  const leftVN1 = splitDecimals(leftVIBN1 < 0 ? 0.0 : leftVIBN1);
  const rightVN1 = splitDecimals(rightVIBN1 < 0 ? 0.0 : rightVIBN1);

  return (
    <>
      <text className="Standard Center" x="300" y="160">
        OIL
      </text>
      <text className="Medium Cyan Center" x="300" y="180">
        QT
      </text>

      <path className="WingPlaneSym" d="M230 170 l20 -2" />
      <path className="WingPlaneSym" d="M370 170 l-20 -2" />

      <text className="Standard Center" x="300" y="220">
        VIB N1
      </text>
      <text className="Standard" x="312" y="250">
        N2
      </text>
      <text className="Standard" x="312" y="280">
        N3
      </text>

      <path className="WingPlaneSym" d="M230 220 l20 -2" />
      <path className="WingPlaneSym" d="M370 220 l-20 -2" />

      <path className="WingPlaneSym" d="M230 250 l20 -2" />
      <path className="WingPlaneSym" d="M370 250 l-20 -2" />

      <path className="WingPlaneSym" d="M230 280 l20 -2" />
      <path className="WingPlaneSym" d="M370 280 l-20 -2" />

      <text id="OilQuantityLeft" className="Large Green" x="195" y="185" textAnchor="end">
        {oilLeft[0]}.
      </text>
      <text id="OilQuantityLeftDecimal" className="Standard Green" x="197" y="185" textAnchor="start">
        {oilLeft[1]}
      </text>
      <text id="OilQuantityRight" className="Large Green" x="440" y="185" textAnchor="end">
        {oilRight[0]}.
      </text>
      <text id="OilQuantityRightDecimal" className="Standard Green" x="440" y="185" textAnchor="start">
        {oilRight[1]}
      </text>

      <text id="VibN1Left" className="Large Green" x="195" y="235" textAnchor="end">
        {leftVN1[0]}.
      </text>
      <text id="VibN1LeftDecimal" className="Standard Green" x="197" y="235" textAnchor="start">
        {leftVN1[1]}
      </text>

      <text id="VibN2Left" className="Large Green" x="195" y="265" textAnchor="end">
        {leftVN1[0]}.
      </text>
      <text id="VibN2LeftDecimal" className="Standard Green" x="197" y="265" textAnchor="start">
        {leftVN1[1]}
      </text>

      <text id="VibN1Right" className="Large Green" x="440" y="235" textAnchor="end">
        {rightVN1[0]}.
      </text>
      <text id="VibN1RightDecimal" className="Standard Green" x="440" y="235" textAnchor="start">
        {rightVN1[1]}
      </text>

      <text id="VibN2Right" className="Large Green" x="440" y="265" textAnchor="end">
        {rightVN1[0]}.
      </text>
      <text id="VibN2RightDecimal" className="Standard Green" x="440" y="265" textAnchor="start">
        {rightVN1[1]}
      </text>

      <text id="VibN3Left" className="Large Green" x="195" y="295" textAnchor="end">
        {leftVN1[0]}.
      </text>
      <text id="VibN3LeftDecimal" className="Standard Green" x="197" y="295" textAnchor="start">
        {leftVN1[1]}
      </text>

      <text id="VibN3Right" className="Large Green" x="440" y="295" textAnchor="end">
        {rightVN1[0]}.
      </text>
      <text id="VibN3RightDecimal" className="Standard Green" x="440" y="295" textAnchor="start">
        {rightVN1[1]}
      </text>

      <text id="VibN3Right" className="Large Green" x="440" y="295" textAnchor="end">
        {rightVN1[0]}.
      </text>
      <text id="VibN3RightDecimal" className="Standard Green" x="440" y="295" textAnchor="start">
        {rightVN1[1]}
      </text>
    </>
  );
};

export const PressureComponent = () => {
  const cpc1DiscreteWord = useArinc429Var('L:A32NX_PRESS_CPC_1_DISCRETE_WORD');
  const cpc2DiscreteWord = useArinc429Var('L:A32NX_PRESS_CPC_2_DISCRETE_WORD');

  const activeCpcNumber = cpc1DiscreteWord.bitValueOr(11, false) ? 1 : 2;
  const cpcDiscreteWordToUse = activeCpcNumber === 1 ? cpc1DiscreteWord : cpc2DiscreteWord;

  const landingElevationIsMan = cpcDiscreteWordToUse.bitValueOr(17, false);
  const cpcLandingElevation = useArinc429Var(`L:A32NX_PRESS_CPC_${activeCpcNumber}_LANDING_ELEVATION`, 500);
  const fmLandingElevation = useArinc429Var('L:A32NX_FM1_LANDING_ELEVATION', 1000);

  let landingElevation;
  if (cpcLandingElevation.isNormalOperation()) {
    landingElevation = cpcLandingElevation.value;
  } else if (fmLandingElevation.isNormalOperation()) {
    landingElevation = fmLandingElevation.value;
  } else {
    landingElevation = -6000;
  }

  const [autoMode] = useSimVar('L:A32NX_OVHD_PRESS_MODE_SEL_PB_IS_AUTO', 'Bool', 1000);
  const [ldgElevMode, setLdgElevMode] = useState('AUTO');
  const [ldgElevValue, setLdgElevValue] = useState('XX');
  const [cssLdgElevName, setCssLdgElevName] = useState('green');

  const arincCabinAlt = useArinc429Var(`L:A32NX_PRESS_CPC_${activeCpcNumber}_CABIN_ALTITUDE`, 500);
  const [manCabinAlt] = useSimVar('L:A32NX_PRESS_MAN_CABIN_ALTITUDE', 'foot', 500);
  const cabinAlt = arincCabinAlt.isNormalOperation() ? arincCabinAlt.value : manCabinAlt;

  const arincDeltaPsi = useArinc429Var(`L:A32NX_PRESS_CPC_${activeCpcNumber}_CABIN_DELTA_PRESSURE`, 500);
  const [manDeltaPsi] = useSimVar('L:A32NX_PRESS_MAN_CABIN_DELTA_PRESSURE', 'psi', 500);
  const deltaPsi = arincDeltaPsi.isNormalOperation() ? arincDeltaPsi.value : manDeltaPsi;

  const arincCabinVs = useArinc429Var(`L:A32NX_PRESS_CPC_${activeCpcNumber}_CABIN_VS`, 500);
  const [manCabinVs] = useSimVar('L:A32NX_PRESS_MAN_CABIN_VS', 'feet per minute', 500);
  const cabinVs = arincCabinVs.isNormalOperation() ? arincCabinVs.value : manCabinVs;

  const vsx = 440;
  const y = 385;
  const radius = 50;

  const deltaPress = splitDecimals(deltaPsi);

  useEffect(() => {
    setLdgElevMode(landingElevationIsMan ? 'MAN' : 'AUTO');
    const nearestfifty = Math.round(landingElevation / 50) * 50;

    setLdgElevValue(landingElevation > -5000 ? nearestfifty.toString() : 'XX');
    setCssLdgElevName(landingElevation > -5000 ? 'Green' : 'Amber');
  }, [landingElevationIsMan, landingElevation]);

  return (
    <>
      <g id="LandingElevation" className={autoMode ? 'show' : 'hide'}>
        <text className="Standard Center" x="330" y="335">
          LDG ELEV
        </text>
        <text id="LandingElevationMode" className="Standard Green" x="385" y="335">
          {ldgElevMode}
        </text>

        <text id="LandingElevation" className={`Large ${cssLdgElevName}`} x="525" y="335" textAnchor="end">
          {ldgElevValue}
        </text>
        <text className="Standard Cyan" x="530" y="335">
          FT
        </text>
      </g>

      {/* Vertical speed gauge */}
      <g id="VsIndicator">
        <GaugeComponent
          x={vsx}
          y={y}
          radius={radius}
          startAngle={170}
          endAngle={10}
          visible={!autoMode}
          className="Gauge"
        >
          <GaugeMarkerComponent
            value={2}
            x={vsx}
            y={y}
            min={-2}
            max={2}
            radius={radius}
            startAngle={180}
            endAngle={0}
            className="GaugeText"
            showValue
            textNudgeY={10}
          />
          <GaugeMarkerComponent
            value={1}
            x={vsx}
            y={y}
            min={-2}
            max={2}
            radius={radius}
            startAngle={180}
            endAngle={0}
            className="GaugeText"
          />
          <GaugeMarkerComponent
            value={0}
            x={vsx}
            y={y}
            min={-2}
            max={2}
            radius={radius}
            startAngle={180}
            endAngle={0}
            className="GaugeText"
            showValue
            textNudgeX={10}
          />
          <GaugeMarkerComponent
            value={-1}
            x={vsx}
            y={y}
            min={-2}
            max={2}
            radius={radius}
            startAngle={180}
            endAngle={0}
            className="GaugeText"
          />
          <GaugeMarkerComponent
            value={-2}
            x={vsx}
            y={y}
            min={-2}
            max={2}
            radius={radius}
            startAngle={180}
            endAngle={0}
            className="GaugeText"
            showValue
            textNudgeY={-10}
          />
          <GaugeMarkerComponent
            value={Math.abs(((cabinVs / 50) * 50) / 1000) <= 2.25 ? ((cabinVs / 50) * 50) / 1000 : 2.25}
            x={vsx}
            y={y}
            min={-2}
            max={2}
            radius={radius}
            startAngle={180}
            endAngle={0}
            className="GaugeIndicator"
            indicator
          />
        </GaugeComponent>
      </g>

      <text className="Standard" x="218" y="370">
        @P
      </text>
      <text id="Large Green" className="Large Green" x="290" y="370" textAnchor="end">
        {deltaPress[0]}.
      </text>
      <text id="standard green" className="Standard Green" x="290" y="370">
        {deltaPress[1]}
      </text>
      <text className="Standard Cyan" x="320" y="370">
        PSI
      </text>

      <text className="Standard" x="480" y="380">
        CAB V/S
      </text>
      <text id="CabinVerticalSpeed" className="Large Green" x="515" y="405" textAnchor="end">
        {!autoMode ? Math.round(cabinVs / 50) * 50 : Math.abs(Math.round(cabinVs / 50) * 50)}
      </text>
      <text className="Medium Cyan" x="525" y="405">
        FT/MIN
      </text>

      <text className="Standard" x="480" y="450">
        CAB ALT
      </text>
      <text id="CabinAltitude" className="Large Green" x="515" y="475" textAnchor="end">
        {Math.round(cabinAlt / 50) * 50 > 0 ? Math.round(cabinAlt / 50) * 50 : 0}
      </text>
      <text className="Medium Cyan" x="525" y="475">
        FT
      </text>

      <g
        id="vsArrow"
        className={(cabinVs * 60 <= -50 || cabinVs * 60 >= 50) && autoMode ? '' : 'Hide'}
        transform={cabinVs * 60 <= -50 ? 'translate(0, 795) scale(1, -1)' : 'scale(1, 1)'}
      >
        <path d="M433,405 h7 L446,395" className="VsIndicator" strokeLinejoin="miter" />
        <polygon points="452,388 447,396 457,396" transform="rotate(38,452,388)" className="VsIndicator" />
      </g>
    </>
  );
};

export const CondComponent = () => {
  const [unit] = usePersistentProperty('CONFIG_USING_METRIC_UNIT', '1');
  let [cockpitCabinTemp] = useSimVar('L:A32NX_COND_CKPT_TEMP', 'celsius', 1000);
  let [fwdCabinTemp] = useSimVar('L:A32NX_COND_FWD_TEMP', 'celsius', 1000);
  let [aftCabinTemp] = useSimVar('L:A32NX_COND_AFT_TEMP', 'celsius', 1000);

  if (unit === '0') {
    //  converting to F if 'lbs' selected in EFB
    cockpitCabinTemp = UnitType.CELSIUS.convertTo(cockpitCabinTemp, UnitType.FAHRENHEIT);
    fwdCabinTemp = UnitType.CELSIUS.convertTo(fwdCabinTemp, UnitType.FAHRENHEIT);
    aftCabinTemp = UnitType.CELSIUS.convertTo(aftCabinTemp, UnitType.FAHRENHEIT);
  }

  return (
    <>
      <path
        className="WingPlaneSym"
        d="M 300 410 a 70 70 0 0 0 -30 -5 l -180 0 m 30 0 l 0 50 l 85 0 l 0 -10 m 0 10 l 85 0 l 0 -48 m -170 48 l -30 0 c -60 0 -60 -20 -45 -25"
      />

      <text className="Standard" x="55" y="425">
        CKPT
      </text>
      <text id="CockpitTemp" className="Standard Green" x="75" y="448">
        {cockpitCabinTemp.toFixed(0)}
      </text>
      <text className="Standard" x="145" y="425">
        FWD
      </text>
      <text id="ForwardTemp" className="Standard Green" x="150" y="448">
        {fwdCabinTemp.toFixed(0)}
      </text>
      <text className="Standard" x="245" y="425">
        AFT
      </text>
      <text id="AftTemp" className="Standard Green" x="235" y="448">
        {aftCabinTemp.toFixed(0)}
      </text>
      <text className="Medium Cyan" x="310" y="455">
        {unit === '1' ? '°C' : '°F'}
      </text>
    </>
  );
};
