// Copyright (c) 2021-2023 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0
import React from 'react';
import { SU95Overview } from 'instruments/src/EFB/Dispatch/Pages/Overview/SU100_95B/SU95Overview';
import { getAirframeType } from '../../Efb';

export const OverviewPage = () => {
    switch (getAirframeType()) {
    case 'SU100_95B':
    default:
        return (
            <SU95Overview />
        );
    }
};
