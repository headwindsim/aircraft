// Copyright (c) 2021-2023 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0

/* eslint-disable max-len */
import React, { useState } from 'react';
import { Units, useSimVar } from '@flybywiresim/fbw-sdk';
import { getAirframeType } from '../../../Efb';
import { isSimbriefDataLoaded } from '../../../Store/features/simBrief';
import { SU95Fuel } from './SU100_95B/SU95Fuel';
import { useAppSelector } from '../../../Store/store';

export const Fuel = () => {
    const [isOnGround] = useSimVar('SIM ON GROUND', 'Bool', 8_059);
    const simbriefUnits = useAppSelector((state) => state.simbrief.data.units);
    const simbriefPlanRamp = useAppSelector((state) => state.simbrief.data.fuels.planRamp);

    const simbriefDataLoaded = isSimbriefDataLoaded();

    const [massUnitForDisplay] = useState(Units.usingMetric ? 'KGS' : 'LBS');
    const [convertUnit] = useState(Units.usingMetric ? 1 : (1 / 0.4535934));

    switch (getAirframeType()) {
    case 'SU100_95B':
    default:
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
    }
};
