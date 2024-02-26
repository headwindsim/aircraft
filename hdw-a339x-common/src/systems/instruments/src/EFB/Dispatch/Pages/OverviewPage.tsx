// Copyright (c) 2021-2023 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0
import React from 'react';
import { getAirframeType } from '@flybywiresim/flypad';
import { A330Overview } from './Overview/A330_941/A330Overview';
import { ACJ330Overview } from './Overview/A330_941/ACJ330Overview';

export const OverviewPage = () => {
    switch (getAirframeType()) {
    case 'A330_941':
        return (
            <A330Overview />
        );
    case 'ACJ330_941':
        return (
            <ACJ330Overview />
        );
    default:
        return (
            <A330Overview />
        );
    }
};
