// Copyright (c) 2023-2024 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

/* eslint-disable no-console */
import React, { useState } from 'react';
import { getAirframeType } from '@flybywiresim/flypad';
import { A330Services } from './A330_941/A330Services';

export const ServicesPage = () => {
    const [airframe] = useState(getAirframeType());

    switch (airframe) {
    case 'ACJ330_941':
    case 'A330_941':
    default:
        return (
            <A330Services />
        );
    }
};
