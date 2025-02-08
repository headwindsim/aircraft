// Copyright (c) 2024 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

import { SyncedSettingDefinition } from '@flybywiresim/flypad';
import { A330X_DEFAULT_RADIO_AUTO_CALL_OUTS } from '@shared/AutoCallOuts';

export const a32nxSyncedSettings: SyncedSettingDefinition[] = [
  { configKey: 'SOUND_PTU_AUDIBLE_COCKPIT', localVarName: 'L:A32NX_SOUND_PTU_AUDIBLE_COCKPIT', defaultValue: '0' },
  {
    configKey: 'CONFIG_A330X_FWC_RADIO_AUTO_CALL_OUT_PINS',
    localVarName: 'L:A330X_FWC_RADIO_AUTO_CALL_OUT_PINS',
    defaultValue: A330X_DEFAULT_RADIO_AUTO_CALL_OUTS.toString(),
  },
];
