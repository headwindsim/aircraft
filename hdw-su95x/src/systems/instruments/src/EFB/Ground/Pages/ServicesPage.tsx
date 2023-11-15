// Copyright (c) 2022 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

/* eslint-disable no-console */
import React, { useState } from 'react';
import { SU95Services } from './Services/SU100_95/SU95Services';
import { getAirframeType } from '../../Efb';

export const ServicesPage = () => {
    const [airframe] = useState(getAirframeType());

    switch (airframe) {
    case 'SU100_95B':
    default:
        return (
            <SU95Services />
        );
    }
};
