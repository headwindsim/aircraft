// Copyright (c) 2021-2023 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0

import React, { FC } from 'react';
import { PageTitle } from '../../Common/PageTitle';
import { EcamPage } from '../../Common/EcamPage';
import CBDisplay from './elements/CBDisplay';
import DownArrow from './elements/DownArrow';

import './CB.scss';

export const CBPage: FC = () => (
  <EcamPage name="main-cb">
    <PageTitle x={250} y={23} text="C/B" />

    <line className="Separator" x1="380" y1="72" x2="380" y2="460" />
    <CBDisplay x={10} y={90} side="LEFT" />
    <CBDisplay x={408} y={90} side="RIGHT" />

    <DownArrow x={377} y={464} active={false} />
  </EcamPage>
);
