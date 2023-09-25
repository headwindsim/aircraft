// Copyright (c) 2022 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

/* eslint-disable no-console */
import React, { useState } from 'react';
import { A330Services } from './Services/A330_941/A330Services';
import { getAirframeType } from '../../Efb';

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
