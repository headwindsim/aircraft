// Copyright (c) 2021-2023 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0
import React from 'react';
import { A333Overview } from 'instruments/src/EFB/Dispatch/Pages/Overview/A330_343/A333Overview';
import { getAirframeType } from '../../Efb';

export const OverviewPage = () => {
    switch (getAirframeType()) {
    case 'A330_343':
    default:
        return (
            <A333Overview />
        );
    }
};
