// Copyright (c) 2023-2024 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

/* eslint-disable max-len */
import React, { useState } from 'react';
import { AirframeType, Units, useSimVar } from '@flybywiresim/fbw-sdk';
import { isSimbriefDataLoaded } from '@flybywiresim/flypad';
import { A330Fuel } from './A330_941/A330Fuel';
import { SU95Fuel } from './SU100_95/SU95Fuel';
import { useAppSelector } from '../../../Store/store';

export const Fuel = () => {
    const airframeInfo = useAppSelector((state) => state.config.airframeInfo);
    const [isOnGround] = useSimVar('SIM ON GROUND', 'Bool', 8_059);
    const simbriefUnits = useAppSelector((state) => state.simbrief.data.units);
    const simbriefPlanRamp = useAppSelector((state) => state.simbrief.data.fuels.planRamp);

    const simbriefDataLoaded = isSimbriefDataLoaded();

    const [massUnitForDisplay] = useState(Units.usingMetric ? 'KGS' : 'LBS');
    const [convertUnit] = useState(Units.usingMetric ? 1 : (1 / 0.4535934));

    switch (airframeInfo.variant) {
    case AirframeType.SU100_95:
        return (
            <SU95Fuel
                simbriefDataLoaded={simbriefDataLoaded}
                simbriefUnits={simbriefUnits}
                simbriefPlanRamp={simbriefPlanRamp}
                massUnitForDisplay={massUnitForDisplay}
                convertUnit={convertUnit}
                isOnGround={isOnGround}
            />
        );
    case AirframeType.A330_343:
    case AirframeType.A330_941:
    default:
        return (
            <A330Fuel
                simbriefDataLoaded={simbriefDataLoaded}
                simbriefUnits={simbriefUnits}
                simbriefPlanRamp={simbriefPlanRamp}
                massUnitForDisplay={massUnitForDisplay}
                convertUnit={convertUnit}
                isOnGround={isOnGround}
            />
        );
    }
};
