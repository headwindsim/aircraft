// Copyright (c) 2021-2023 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0

import {
  FSComponent,
  ComponentProps,
  Subscribable,
  VNode,
  Subject,
  EventBus,
  ConsumerSubject,
  InstrumentBackplane,
  Clock,
  AdcPublisher,
} from '@microsoft/msfs-sdk';

import { NDPage } from '../NDPage';

import { UpperDisplay } from '@ewd/UpperDisplay';

export interface EngModePageProps<T extends number> extends ComponentProps {
  bus: EventBus;
}

export class EngModePage<T extends number> extends NDPage<EngModePageProps<T>> {
  public isVisible = Subject.create(false);

  onShow() {}

  render(): VNode | null {
    return (
      <svg
        visibility={this.isVisible.map((visible) => (visible ? 'visible' : 'hidden'))}
        class="ewd-svg"
        version="1.1"
        viewBox="0 0 768 768"
        xmlns="http://www.w3.org/2000/svg"
      >
        <UpperDisplay bus={this.props.bus} />
      </svg>
    );
  }
}
