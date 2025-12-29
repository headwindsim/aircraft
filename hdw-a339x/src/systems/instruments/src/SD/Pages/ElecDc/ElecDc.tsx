// Copyright (c) 2021-2023 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0

import React from 'react';
import classNames from 'classnames';
import { useSimVar } from '@flybywiresim/fbw-sdk';
import { PageTitle } from '../../Common/PageTitle';
import { EcamPage } from '../../Common/EcamPage';
import { SvgGroup } from '../../Common/SvgGroup';

import './ElecDc.scss';

const maxStaleness = 300;

export const ElecDcPage = () => {
  const [dc1IsPowered] = useSimVar('L:A32NX_ELEC_DC_1_BUS_IS_POWERED', 'Bool', maxStaleness);
  const [dc2IsPowered] = useSimVar('L:A32NX_ELEC_DC_2_BUS_IS_POWERED', 'Bool', maxStaleness);
  const [dcEssIsPowered] = useSimVar('L:A32NX_ELEC_DC_ESS_BUS_IS_POWERED', 'Bool', maxStaleness);
  const [dcEssShedBusIsPowered] = useSimVar('L:A32NX_ELEC_DC_ESS_SHED_BUS_IS_POWERED', 'Bool', maxStaleness);
  // const [ac1IsPowered] = useSimVar('L:A32NX_ELEC_AC_1_BUS_IS_POWERED', 'Bool', maxStaleness);
  //const [ac2IsPowered] = useSimVar('L:A32NX_ELEC_AC_2_BUS_IS_POWERED', 'Bool', maxStaleness);
  const [staticInverterInUse] = useSimVar('L:A32NX_ELEC_CONTACTOR_15XE2_IS_CLOSED', 'Bool', maxStaleness);
  //const [galleyIsShed] = useSimVar('L:A32NX_ELEC_GALLEY_IS_SHED', 'Bool', maxStaleness);
  //const [tr1SuppliesDc1] = useSimVar('L:A32NX_ELEC_CONTACTOR_5PU1_IS_CLOSED', 'Bool', maxStaleness);
  //const [tr2SuppliesDc2] = useSimVar('L:A32NX_ELEC_CONTACTOR_5PU2_IS_CLOSED', 'Bool', maxStaleness);
  //const [trEssSuppliesDcEss] = useSimVar('L:A32NX_ELEC_CONTACTOR_5PU1_IS_CLOSED', 'Bool', maxStaleness); //change to correct contactor for ESS
  //const [trApuSuppliesDcEss] = useSimVar('L:A32NX_ELEC_CONTACTOR_5PU1_IS_CLOSED', 'Bool', maxStaleness); //change to correct contactor for APU
  //const [ac1SuppliesAcEss] = useSimVar('L:A32NX_ELEC_CONTACTOR_3XC1_IS_CLOSED', 'Bool', maxStaleness);
  const [ac2SuppliesAcEss] = useSimVar('L:A32NX_ELEC_CONTACTOR_3XC2_IS_CLOSED', 'Bool', maxStaleness);
  const [dc1AndDcBatConnected] = useSimVar('L:A32NX_ELEC_CONTACTOR_1PC1_IS_CLOSED', 'Bool', maxStaleness);
  //const [dcBatAndDcEssConnected] = useSimVar('L:A32NX_ELEC_CONTACTOR_4PC_IS_CLOSED', 'Bool', maxStaleness);
  const [dc2AndDcBatConnected] = useSimVar('L:A32NX_ELEC_CONTACTOR_1PC2_IS_CLOSED', 'Bool', maxStaleness);

  const [emergencyGeneratorSupplies] = useSimVar('L:A32NX_ELEC_CONTACTOR_2XE_IS_CLOSED', 'Bool', maxStaleness);
  const [acEssBusContactorClosed] = useSimVar('L:A32NX_ELEC_CONTACTOR_15XE1_IS_CLOSED', 'Bool', maxStaleness);
  //const [trEssSuppliesDcEss] = useSimVar('L:A32NX_ELEC_CONTACTOR_3PE_IS_CLOSED', 'Bool', maxStaleness);

  //const [externalPowerContactorClosed] = useSimVar('L:A32NX_ELEC_CONTACTOR_3XG_IS_CLOSED', 'Bool', maxStaleness);
  const [apuGeneratorContactorClosed] = useSimVar('L:A32NX_ELEC_CONTACTOR_3XS_IS_CLOSED', 'Bool', maxStaleness);
  const [generatorLineContactor1Closed] = useSimVar('L:A32NX_ELEC_CONTACTOR_9XU1_IS_CLOSED', 'Bool', maxStaleness);
  const [generatorLineContactor2Closed] = useSimVar('L:A32NX_ELEC_CONTACTOR_9XU2_IS_CLOSED', 'Bool', maxStaleness);
  const [busTieContactor1Closed] = useSimVar('L:A32NX_ELEC_CONTACTOR_11XU1_IS_CLOSED', 'Bool', maxStaleness);
  const [busTieContactor2Closed] = useSimVar('L:A32NX_ELEC_CONTACTOR_11XU2_IS_CLOSED', 'Bool', maxStaleness);

  return (
    <EcamPage name="main-elec-dc">
      <PageTitle x={6} y={18} text="ELEC DC" />

      {ac2SuppliesAcEss ? <Wire description="AC2 to AC ESS" d="M367.5 279.32 h94.63 h-94.63" /> : null}

      {dc1AndDcBatConnected ? <Wire description="DC1 to DC BAT" d="M56.44 73 v177 v-177 h85 h-85" /> : null}
      {dc2AndDcBatConnected ? (
        <Wire description="DC2 to DC BAT" d="M 341.16 103.125 h 166.66 h -166.66 v -42.52 v42.52" />
      ) : null}

      {acEssBusContactorClosed && emergencyGeneratorSupplies ? (
        <>
          <Wire description="EMER GEN to AC ESS" d="M 343.55 237.62 v 14.25 v -14.25" />
          <Arrow x={350.42} y={252.87} description="EMER GEN to AC ESS" green direction="down" />
        </>
      ) : null}

      {apuGeneratorContactorClosed && busTieContactor1Closed && !busTieContactor2Closed ? (
        <Wire description="APU GEN to AC1" d="M56.44 302.81 v18.75 h159.60 v35.67" />
      ) : null}
      {apuGeneratorContactorClosed && !busTieContactor1Closed && busTieContactor2Closed ? (
        <Wire description="APU GEN to AC2" d="M536.25 302.81 v18.75 h-320.2 v35.67" />
      ) : null}
      {apuGeneratorContactorClosed && busTieContactor1Closed && busTieContactor2Closed ? (
        <Wire description="APU GEN to AC1 and AC2" d="M536.25 302.81 v18.75 h-320.2 v35.67 v-35.67 h-159.60 v-18.75" />
      ) : null}

      {generatorLineContactor1Closed && !busTieContactor1Closed ? (
        <Wire description="GEN1 to AC1" d="M56.44 277 v98 v-98" />
      ) : null}
      {generatorLineContactor1Closed && busTieContactor1Closed && busTieContactor2Closed ? (
        <Wire description="GEN1 to AC1 and AC2" d="M56.44 302.81 v42.5 v-23.75 h479.81 v-20.75" />
      ) : null}

      {generatorLineContactor1Closed && !busTieContactor1Closed ? ( // ESS TR to DC ESS
        <Wire description="GEN1 to AC1" d="M215 277 v98 v-98" />
      ) : null}
      {generatorLineContactor1Closed && busTieContactor1Closed && busTieContactor2Closed ? (
        <Wire description="GEN1 to AC1 and AC2" d="M56.44 302.81 v42.5 v-23.75 h479.81 v-20.75" />
      ) : null}

      {generatorLineContactor1Closed && !busTieContactor1Closed ? ( // TR 2 to DC 2
        <Wire description="GEN1 to AC1" d="M393 277 v98 v-98" />
      ) : null}
      {generatorLineContactor1Closed && busTieContactor1Closed && busTieContactor2Closed ? (
        <Wire description="GEN1 to AC1 and AC2" d="M56.44 302.81 v42.5 v-23.75 h479.81 v-20.75" />
      ) : null}

      {generatorLineContactor2Closed && !busTieContactor2Closed ? (
        <Wire description="GEN2 to AC2" d="M536.25 86 v290 v-290" />
      ) : null}
      {generatorLineContactor2Closed && busTieContactor1Closed && busTieContactor2Closed ? (
        <Wire description="GEN2 to AC1 and AC2" d="M536.25 302.81 v42.5 v-23.75 h-479.81 v-20.75" />
      ) : null}

      <Arrow description="STAT INV" x={277} y={278} direction="down" />
      <Arrow description="AC1 to TR1" x={53} y={463} direction="up" />
      <Arrow description="AC1 to TR ESS" x={210} y={463} direction="up" />
      <Arrow description="AC2 to TR2" x={385} y={463} direction="up" />
      <Arrow description="AC2 to TR APU" x={533} y={463} direction="up" />

      <Battery x={88} y={140} number={1} />
      <Battery x={255} y={140} number={2} />
      <Battery x={415} y={140} number={3} />
      <BatteryBus x={140} y={60} width={135} number={1} />
      <BatteryBus x={467} y={60} width={90} number={2} />
      <Bus x={10} y={250} width={86.25} name="DC" number={1} isNormal={dc1IsPowered} />
      <Bus x={340} y={250} width={86.25} name="DC" number={2} isNormal={dc2IsPowered} />
      <Bus x={150} y={250} width={135} name="DC ESS" isNormal={dcEssIsPowered} isShed={!dcEssShedBusIsPowered} />
      {staticInverterInUse ? <StaticInverter x={315} y={390} /> : null}
      <TransformerRectifier x={13.125} y={375} number={1} />
      <TransformerRectifier x={345} y={375} number={2} />
      <TransformerRectifier x={170} y={375} number={3} />
      <TransformerRectifier x={493.125} y={375} number={4} />
      <AcBusTitle x={44} y={484} number={1} />
      <AcBusTitle x={201} y={484} number={1} />
      <AcBusTitle x={376} y={484} number={2} />
      <AcBusTitle x={524} y={484} number={2} />
      <StaticInverterTitle x={264} y={307} />
    </EcamPage>
  );
};

const Battery = ({ x, y, number }) => {
  const [isAuto] = useSimVar(`L:A32NX_OVHD_ELEC_BAT_${number}_PB_IS_AUTO`, 'Bool', maxStaleness);

  const [potential] = useSimVar(`L:A32NX_ELEC_BAT_${number}_POTENTIAL`, 'Volts', maxStaleness);
  const [potentialWithinNormalRange] = useSimVar(`L:A32NX_ELEC_BAT_${number}_POTENTIAL_NORMAL`, 'Bool', maxStaleness);

  const [current] = useSimVar(`L:A32NX_ELEC_BAT_${number}_CURRENT`, 'Ampere', maxStaleness);
  const [currentWithinNormalRange] = useSimVar(`L:A32NX_ELEC_BAT_${number}_CURRENT_NORMAL`, 'Bool', maxStaleness);

  const allParametersWithinNormalRange = potentialWithinNormalRange && currentWithinNormalRange;

  const [staticInverterInUse] = useSimVar('L:A32NX_ELEC_CONTACTOR_15XE2_IS_CLOSED', 'Bool', maxStaleness);

  return (
    <SvgGroup x={x} y={y}>
      <Box width={86.25} height={71.25} />
      {number === 3 ? (
        <>
          <text x={38} y={21.625} className={`Right ${!allParametersWithinNormalRange && isAuto ? 'Amber' : ''}`}>
            APU
          </text>
          <text x={50} y={21.625} className={`${!allParametersWithinNormalRange && isAuto ? 'Amber' : ''}`}>
            BAT
          </text>
        </>
      ) : (
        <>
          <text x={52.5} y={21.625} className={`Right ${!allParametersWithinNormalRange && isAuto ? 'Amber' : ''}`}>
            BAT
          </text>
          <text x={56.25} y={21.625} className={`Large ${!allParametersWithinNormalRange && isAuto ? 'Amber' : ''}`}>
            {number}
          </text>
        </>
      )}
      {isAuto ? (
        <>
          <ElectricalProperty
            x={52.5}
            y={43.125}
            value={potential}
            unit="V"
            isWithinNormalRange={potentialWithinNormalRange}
          />
          <ElectricalProperty
            x={52.5}
            y={65.625}
            value={Math.abs(current)}
            unit="A"
            isWithinNormalRange={currentWithinNormalRange}
          />
        </>
      ) : (
        <text x={43.125} y={41.25} className="Middle" dominantBaseline="middle">
          OFF
        </text>
      )}
      {number === 1 && staticInverterInUse ? (
        <>
          <Arrow x={92.57625} y={1.875} direction="right" />
          <text x={108.75} y={15} className="Medium">
            STAT INV
          </text>
        </>
      ) : null}
    </SvgGroup>
  );
};

const BatteryToBatBusWire = ({ x, y, number }) => {
  const [contactorClosed] = useSimVar(`L:A32NX_ELEC_CONTACTOR_6PB${number}_IS_CLOSED`, 'Bool', maxStaleness);
  const [current] = useSimVar(`L:A32NX_ELEC_BAT_${number}_CURRENT`, 'Ampere', maxStaleness);
  const [showArrowWhenContactorClosed] = useSimVar(
    `L:A32NX_ELEC_CONTACTOR_6PB${number}_SHOW_ARROW_WHEN_CLOSED`,
    'Bool',
    maxStaleness,
  );

  const showArrow = contactorClosed && showArrowWhenContactorClosed;
  const isCharging = current > 0;
  const isDischarging = current < 0;

  const pointingRight = (number === 2 && isCharging) || (number === 1 && isDischarging);

  if (!contactorClosed) {
    return <></>;
  }

  return (
    <SvgGroup x={x} y={y}>
      {showArrow ? (
        <>
          {pointingRight ? (
            <>
              <Wire d="M0.3 0 h24.53 h-24.53" amber={isDischarging} />
              <Arrow x={25.525625} y={-(arrowSize / 2)} direction="right" green={isCharging} amber={isDischarging} />
            </>
          ) : (
            <>
              <Wire d="M11.5 0 h24.52 h-24.53" amber={isDischarging} />
              <Arrow x={10} y={arrowSize / 2} direction="left" green={isCharging} amber={isDischarging} />
            </>
          )}
        </>
      ) : (
        <Wire d="M0.3 0 h36.15 h-36.15" />
      )}
    </SvgGroup>
  );
};

const ElectricalProperty = ({ x, y, value, unit, isWithinNormalRange }) => (
  <SvgGroup x={x} y={y}>
    <text className={`Right ${isWithinNormalRange ? 'Green' : 'Amber'}`}>{Math.round(value)}</text>
    <text x={3.75} className="Cyan">
      {unit}
    </text>
  </SvgGroup>
);

const Box = ({ width, height }) => <rect className="Box" width={width} height={height} />;

interface BusProps {
  x: number;
  y: number;
  width: number;
  name: string;
  number?: number;
  isNormal: boolean;
  isShed?: boolean;
}

const Bus = ({ x, y, width, name, number, isNormal, isShed }: BusProps) => {
  const busHeight = 26.25;
  return (
    <SvgGroup x={x} y={y}>
      <rect width={width} height={busHeight} className="Bus" />
      <text x={width / 2} y={21} className={`QuiteLarge Middle ${isNormal ? 'Green' : 'Amber'}`}>
        {name}
      </text>
      {number ? (
        <text x={width / 2 + 16.875} y={22} className={`ExtraLarge ${isNormal ? 'Green' : 'Amber'}`}>
          {number}
        </text>
      ) : null}
      {isShed ? (
        <text x={width / 2} y={busHeight + 8.25} className="Middle ExtraSmall Amber" dominantBaseline="middle">
          SHED
        </text>
      ) : null}
    </SvgGroup>
  );
};

const BatteryBus = ({ x, y, width, number }) => {
  const [isPowered] = useSimVar('L:A32NX_ELEC_DC_BAT_BUS_IS_POWERED', 'Bool', maxStaleness);

  const [bat1IsAuto] = useSimVar('L:A32NX_OVHD_ELEC_BAT_1_PB_IS_AUTO', 'Bool', maxStaleness);
  const [bat2IsAuto] = useSimVar('L:A32NX_OVHD_ELEC_BAT_2_PB_IS_AUTO', 'Bool', maxStaleness);
  const atLeastOneBatteryIsAuto = bat1IsAuto || bat2IsAuto;

  const potentialIsWithinNormalRange = useSimVar('L:A32NX_ELEC_DC_BAT_BUS_POTENTIAL_NORMAL', 'Bool', maxStaleness);

  const nameDc = atLeastOneBatteryIsAuto ? 'DC BAT' : 'XX';
  const nameApu = atLeastOneBatteryIsAuto ? 'DC APU' : 'XX';
  return (
    <Bus
      x={x}
      y={y}
      width={width}
      name={number === 1 ? nameDc : nameApu}
      isNormal={isPowered && potentialIsWithinNormalRange && atLeastOneBatteryIsAuto}
    />
  );
};

const StaticInverter = ({ x, y }) => {
  const [potential] = useSimVar('L:A32NX_ELEC_STAT_INV_POTENTIAL', 'Volts', maxStaleness);
  const [potentialWithinNormalRange] = useSimVar('L:A32NX_ELEC_STAT_INV_POTENTIAL_NORMAL', 'Bool', maxStaleness);

  const [frequency] = useSimVar('L:A32NX_ELEC_STAT_INV_FREQUENCY', 'Hertz', maxStaleness);
  const [frequencyWithinNormalRange] = useSimVar('L:A32NX_ELEC_STAT_INV_FREQUENCY_NORMAL', 'Bool', maxStaleness);

  return (
    <PotentialFrequencyBox
      x={x}
      y={y}
      text="STAT INV"
      potential={potential}
      potentialWithinNormalRange={potentialWithinNormalRange}
      frequency={frequency}
      frequencyWithinNormalRange={frequencyWithinNormalRange}
    />
  );
};

const PotentialFrequencyBox = ({
  x,
  y,
  text,
  potential,
  potentialWithinNormalRange,
  frequency,
  frequencyWithinNormalRange,
}) => {
  const allParametersWithinNormalRange = potentialWithinNormalRange && frequencyWithinNormalRange;

  return (
    <SvgGroup x={x} y={y}>
      <Box width={93.75} height={67.5} />
      <text
        x={46.875}
        y={18.75}
        className={`Middle ${text.length > 7 ? 'Small' : ''} ${!allParametersWithinNormalRange ? 'Amber' : ''}`}
      >
        {text}
      </text>
      <ElectricalProperty
        x={52.5}
        y={41.25}
        value={potential}
        unit="V"
        isWithinNormalRange={potentialWithinNormalRange}
      />
      <ElectricalProperty
        x={52.5}
        y={63.75}
        value={frequency}
        unit="HZ"
        isWithinNormalRange={frequencyWithinNormalRange}
      />
    </SvgGroup>
  );
};

interface TransformerRectifierProps {
  x: number;
  y: number;
  number: number;
  titleOnly?: boolean;
}

const TransformerRectifier = ({ x, y, number, titleOnly }: TransformerRectifierProps) => {
  const [potential] = useSimVar(`L:A32NX_ELEC_TR_${number}_POTENTIAL`, 'Volts', maxStaleness);
  const [potentialWithinNormalRange] = useSimVar(`L:A32NX_ELEC_TR_${number}_POTENTIAL_NORMAL`, 'Bool', maxStaleness);

  const [current] = useSimVar(`L:A32NX_ELEC_TR_${number}_CURRENT`, 'Ampere', maxStaleness);
  const [currentWithinNormalRange] = useSimVar(`L:A32NX_ELEC_TR_${number}_CURRENT_NORMAL`, 'Bool', maxStaleness);

  const allParametersWithinNormalRange = potentialWithinNormalRange && currentWithinNormalRange;

  const title = (
    <text
      x={number === 3 || number === 4 ? 80 : 50}
      y={24.375}
      className={`Right ${!allParametersWithinNormalRange && !titleOnly ? 'Amber' : ''}`}
    >
      {number === 3 ? 'ESS TR' : number === 4 ? 'APU TR' : 'TR'}
    </text>
  );

  return (
    <SvgGroup x={x} y={y}>
      {titleOnly ? (
        title
      ) : (
        <>
          <Box width={86.25} height={75} />
          {title}
          {number !== 3 && number !== 4 ? (
            <text x={53.75} y={24.375} className={`Large ${!allParametersWithinNormalRange ? 'Amber' : ''}`}>
              {number}
            </text>
          ) : null}
          <ElectricalProperty
            x={54.375}
            y={46.875}
            value={potential}
            unit="V"
            isWithinNormalRange={potentialWithinNormalRange}
          />
          <ElectricalProperty
            x={54.375}
            y={69.375}
            value={current}
            unit="A"
            isWithinNormalRange={currentWithinNormalRange}
          />
        </>
      )}
    </SvgGroup>
  );
};

const AcBusTitle = ({ x, y, number }) => {
  return (
    <SvgGroup x={x} y={y}>
      <text className="middle">AC{number}</text>
    </SvgGroup>
  );
};

const StaticInverterTitle = ({ x, y }) => {
  return (
    <SvgGroup x={x} y={y}>
      <text className="middle">
        <tspan x={0} dy={0}>
          STAT
        </tspan>
        <tspan x={0} dy={20}>
          INV
        </tspan>
      </text>
    </SvgGroup>
  );
};

interface ArrowProps {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'right' | 'left';
  green?: boolean;
  amber?: boolean;
  description?: string;
}

const Arrow = ({ x, y, direction, green, amber }: ArrowProps) => {
  const classes = classNames({ Green: green }, { Amber: amber });
  switch (direction) {
    default:
    case 'up':
      return <path className={classes} d={`M${x} ${y}h${arrowSize} l-6.8685 -8.99325z`} />;
    case 'down':
      return <path className={classes} d={`M${x} ${y}h-${arrowSize} l6.8685 8.99325z`} />;
    case 'right':
      return <path className={classes} d={`M${x} ${y}v${arrowSize} l8.99325 -6.8685z`} />;
    case 'left':
      return <path className={classes} d={`M${x} ${y}v-${arrowSize} l-8.99325 6.8685z`} />;
  }
};

const arrowSize = 13.737375;

interface WireProps {
  d: string;
  amber?: boolean;
  description?: string;
}

const Wire = ({ d, amber }: WireProps) => {
  const classes = classNames({ Green: !amber }, { Amber: amber });
  return <path className={classes} d={d} />;
};
