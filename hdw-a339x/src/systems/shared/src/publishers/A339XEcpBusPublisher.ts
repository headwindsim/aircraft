// Copyright (c) 2025 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

import {
  EventBus,
  IndexedEventType,
  PublishPacer,
  SimVarPublisher,
  SimVarPublisherEntry,
  SimVarValueType,
} from '@microsoft/msfs-sdk';

interface A339XEcpBusBaseEvents {
  /**
   * The ECP warning switch word containg button pressed state.
   * Transmitted to each FWC, DMC, TAWS, FDIMU, and ATSU.
   * Raw ARINC word.
   * | Bit |            Description            |
   * |:---:|:---------------------------------:|
   * | 11  | CLR 1                             |
   * | 13  | STS                               |
   * | 14  | RCL                               |
   * | 16  | CLR 2                             |
   * | 17  | EMERGENCY CANCEL                  |
   * | 18  | TO CONFIG TEST                    |
   */
  a32nx_ecp_warning_switch_word: number;
  /**
   * The ECP system switch word containg button pressed state.
   * Transmitted to each FWC, DMC, TAWS, FDIMU, and ATSU.
   * Raw ARINC word.
   * | Bit |            Description            |
   * |:---:|:---------------------------------:|
   * | 11  | ENG                               |
   * | 12  | BLEED                             |
   * | 13  | PRESS                             |
   * | 14  | ELEC AC                           |
   * | 15  | ELEC DC                           |
   * | 16  | HYD                               |
   * | 17  | CB                                |
   * | 18  | APU                               |
   * | 19  | COND                              |
   * | 20  | DOOR                              |
   * | 21  | BRAKES                            |
   * | 22  | FLT/CTL                           |
   * | 23  | FUEL                              |
   * | 24  | ALL                               |
   */
  a32nx_ecp_system_switch_word: number;
  /**
   * The ECP light status word containg button light state.
   * Transmitted to each FWC, DMC, TAWS, FDIMU, and ATSU.
   * Raw ARINC word.
   * | Bit |            Description            |
   * |:---:|:---------------------------------:|
   * | 11  | ENG                               |
   * | 12  | BLEED                             |
   * | 13  | PRESS                             |
   * | 14  | ELEC AC                           |
   * | 15  | ELEC DC                           |
   * | 16  | HYD                               |
   * | 17  | CB                                |
   * | 18  | APU                               |
   * | 19  | COND                              |
   * | 20  | DOOR                              |
   * | 21  | BRAKES                            |
   * | 22  | FLT/CTL                           |
   * | 23  | FUEL                              |
   * | 24  | CLR 1                             |
   * | 25  | CLR 2                             |
   * | 26  | STATUS                            |
   * | 27  | L. TEST                           |
   * | 28  | DIM                               |
   */
  a32nx_ecp_light_status_word: number;
  /** The hardwired discrete for STS button to each FWC. */
  a32nx_ecp_discrete_out_sts: boolean;
  /** The hardwired discrete for RCL button to each FWC. */
  a32nx_ecp_discrete_out_rcl: boolean;
  /** The hardwired discrete for CLR button to each FWC. */
  a32nx_ecp_discrete_out_clr: boolean;
  /** The hardwired discrete for emergency cancel/audio suppression to each FWC and the TAWS. */
  a32nx_ecp_discrete_out_emer_canc: boolean;
  /** The hardwired discrete for emergency cancel/audio suppression to each DMC. */
  a32nx_ecp_discrete_out_all: boolean;
}

type IndexedTopics = null;

type A339XEcpBusIndexedEvents = {
  [P in keyof Pick<A339XEcpBusBaseEvents, IndexedTopics> as IndexedEventType<P>]: A339XEcpBusBaseEvents[P];
};

interface A339XEcpBusPublisherEvents extends A339XEcpBusBaseEvents, A339XEcpBusIndexedEvents {}

/**
 * Events for A339X ECP bus local vars.
 */
export interface A339XEcpBusEvents extends Omit<A339XEcpBusBaseEvents, IndexedTopics>, A339XEcpBusIndexedEvents {}

/**
 * Publisher for A339X ECP bus local vars.
 */
export class A339XEcpBusPublisher extends SimVarPublisher<A339XEcpBusPublisherEvents> {
  /**
   * Create a publisher.
   * @param bus The EventBus to publish to
   * @param pacer An optional pacer to use to control the rate of publishing
   */
  public constructor(bus: EventBus, pacer?: PublishPacer<A339XEcpBusPublisherEvents>) {
    const simvars = new Map<keyof A339XEcpBusPublisherEvents, SimVarPublisherEntry<any>>([
      ['a32nx_ecp_warning_switch_word', { name: 'L:A32NX_ECP_WARNING_SWITCH_WORD', type: SimVarValueType.Enum }],
      ['a32nx_ecp_system_switch_word', { name: 'L:A32NX_ECP_SYSTEM_SWITCH_WORD', type: SimVarValueType.Enum }],
      ['a32nx_ecp_light_status_word', { name: 'L:A32NX_ECP_LIGHT_STATUS_WORD', type: SimVarValueType.Enum }],
      ['a32nx_ecp_discrete_out_sts', { name: 'L:A32NX_ECP_DISCRETE_OUT_STS', type: SimVarValueType.Bool }],
      ['a32nx_ecp_discrete_out_rcl', { name: 'L:A32NX_ECP_DISCRETE_OUT_RCL', type: SimVarValueType.Bool }],
      ['a32nx_ecp_discrete_out_clr', { name: 'L:A32NX_ECP_DISCRETE_OUT_CLR', type: SimVarValueType.Bool }],
      ['a32nx_ecp_discrete_out_emer_canc', { name: 'L:A32NX_ECP_DISCRETE_OUT_EMER_CANC', type: SimVarValueType.Bool }],
      ['a32nx_ecp_discrete_out_all', { name: 'L:A32NX_ECP_DISCRETE_OUT_ALL', type: SimVarValueType.Bool }],
    ]);

    super(simvars, bus, pacer);
  }
}
