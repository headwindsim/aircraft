// Copyright (c) 2023-2024 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

/* eslint-disable no-console */
import React from 'react';
import { AirframeType } from '@flybywiresim/fbw-sdk';
import { useAppSelector } from '@flybywiresim/flypad';
import { A330Services } from './A330_941/A330Services';
import { SU95Services } from './SU100_95/SU95Services';

export const ServicesPage = () => {
  // TODO: Configurable Services Page vs A380/A320
  const airframeInfo = useAppSelector((state) => state.config.airframeInfo);

  switch (airframeInfo.variant) {
    case AirframeType.SU100_95:
      return <SU95Services />;
    case AirframeType.A330_343:
    case AirframeType.A330_941:
    default:
      return <A330Services />;
  }
};
