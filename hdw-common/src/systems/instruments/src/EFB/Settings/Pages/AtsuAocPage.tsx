// Copyright (c) 2023-2024 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

/* eslint-disable max-len */
import React from 'react';

import { usePersistentProperty, SENTRY_CONSENT_KEY, SentryConsentState, isMsfs2024 } from '@flybywiresim/fbw-sdk';

import { toast } from 'react-toastify';
import { t } from '../../Localization/translation';
import { useModals, PromptModal } from '../../UtilComponents/Modals/Modals';
import { Toggle } from '../../UtilComponents/Form/Toggle';
import { SelectGroup, SelectItem } from '../../UtilComponents/Form/Select';
import { SimpleInput } from '../../UtilComponents/Form/SimpleInput/SimpleInput';
import { ButtonType, SettingItem, SettingsPage } from '../Settings';
import { AcarsConnector } from '../../../../../datalink/router/src';
import { AcarsNetwork } from '../../../../../datalink/common/src/messages';

export const AtsuAocPage = () => {
  const [atisSource, setAtisSource] = usePersistentProperty('CONFIG_ATIS_SRC', 'FAA');
  const [metarSource, setMetarSource] = usePersistentProperty('CONFIG_METAR_SRC', 'MSFS');
  const [tafSource, setTafSource] = usePersistentProperty('CONFIG_TAF_SRC', isMsfs2024() ? 'MSFS' : 'NOAA');
  const [telexEnabled, setTelexEnabled] = usePersistentProperty('CONFIG_ONLINE_FEATURES_STATUS', 'DISABLED');

  const [acarsNetwork, setAcarsNetwork] = usePersistentProperty('CONFIG_ACARS_NETWORK', AcarsNetwork.Disabled);
  const [hoppieUserId, setHoppieUserId] = usePersistentProperty('CONFIG_ACARS_HOPPIE_USERID');
  const [sayIntentionsKey, setSayIntentionsKey] = usePersistentProperty('CONFIG_ACARS_SAYINTENTIONS_KEY');

  const [trafficSource, setTrafficSource] = usePersistentProperty('CONFIG_TRAFFIC_SOURCE', "NONE");
  const [trafficDisplayHideCallsign, setTrafficDisplayHideCallsign] = usePersistentProperty('CONFIG_TRAFFIC_DISPLAY_HIDE_CALLSIGN', "YES");

  const [sentryEnabled, setSentryEnabled] = usePersistentProperty(SENTRY_CONSENT_KEY, SentryConsentState.Refused);

  const handleAcarsNetwork = (network: string | AcarsNetwork) => {
    setAcarsNetwork(network);
    if (network === AcarsNetwork.Disabled) {
      AcarsConnector.deactivate();
    } else {
      AcarsConnector.activate();
    }
  };

  const handleTrafficSourceChange = (entry: string) => {
    const map = {"NONE": 0, "SIM":1, "VATSIM": 2, "IVAO": 3};
    setTrafficSource(entry);
    SimVar.SetSimVarValue('L:A339X_TRAFFIC_SELECTOR_SOURCE', 'number', map[entry]);
  }

  const handleTrafficDefaultChange = (entry: string) => {
    setTrafficDisplayHideCallsign(entry);
    SimVar.SetSimVarValue('L:A339X_TRAFFIC_SELECTOR_DISPLAY_HIDE_CALLSIGN', 'number', entry === "YES" ? 1 : 0);
  }

  const handleAcarsIdentifierInput = (network: string | AcarsNetwork, value: string) => {
    AcarsConnector.validate(network, value)
      .then((response) => {
        if (!value) {
          toast.success(`${t('Headwind.Settings.AtsuAoc.YourAcarsIdHasBeenRemoved')} ${response}`);
          return;
        }
        toast.success(`${t('Headwind.Settings.AtsuAoc.YourAcarsIdHasBeenValidated')} ${response}`);
      })
      .catch((_error) => {
        toast.error(t('Headwind.Settings.AtsuAoc.ThereWasAnErrorEncounteredWhenValidatingYourAcarsID'));
      });
  };

  const atisSourceButtons: ButtonType[] = [
    { name: 'FAA (US)', setting: 'FAA' },
    { name: 'PilotEdge', setting: 'PILOTEDGE' },
    { name: 'IVAO', setting: 'IVAO' },
    { name: 'VATSIM', setting: 'VATSIM' },
    { name: 'SayIntentions', setting: 'SAYINTENTIONS'},
    { name: 'BeyondATC', setting: 'BEYONDATC' },
  ];

  const metarSourceButtons: ButtonType[] = [
    { name: 'MSFS', setting: 'MSFS' },
    { name: 'NOAA', setting: 'NOAA' },
    { name: 'PilotEdge', setting: 'PILOTEDGE' },
    { name: 'VATSIM', setting: 'VATSIM' },
    { name: 'SayIntentions', setting: 'SAYINTENTIONS'},
    { name: 'BeyondATC', setting: 'BEYONDATC' },
  ];

  const acarsNetworkButtons: ButtonType[] = [
    { name: 'Disabled', setting: AcarsNetwork.Disabled },
    { name: 'Hoppie', setting: AcarsNetwork.Hoppie },
    { name: 'SayIntentions', setting: AcarsNetwork.SayIntentions },
    { name: 'BeyondATC', setting: AcarsNetwork.BeyondATC },
  ];

  let tafSourceButtons: ButtonType[] = [
    { name: 'MSFS', setting: 'MSFS' },
    { name: 'NOAA', setting: 'NOAA' },
  ];

  let trafficSourceButtons: ButtonType[] = [
    { name: 'None', setting: 'NONE' },
    { name: 'MSFS', setting: 'SIM' },
    { name: 'VATSIM', setting: 'VATSIM' },
    { name: 'IVAO', setting: 'IVAO'},
  ];

 let trafficDisplayButtons: ButtonType[] = [
    { name: 'No', setting: 'NO' },
    { name: 'Yes', setting: 'YES' },
  ];
  if (!isMsfs2024()) {
    tafSourceButtons = tafSourceButtons.slice(1);
  }

  const { showModal } = useModals();

  const handleTelexToggle = (toggleValue: boolean): void => {
    if (toggleValue) {
      showModal(
        <PromptModal
          title={t('Settings.AtsuAoc.TelexWarning')}
          bodyText={t('Settings.AtsuAoc.TelexEnablesFreeTextAndLiveMap')}
          onConfirm={() => setTelexEnabled('ENABLED')}
          confirmText={t('Settings.AtsuAoc.EnableTelex')}
        />,
      );
    } else {
      setTelexEnabled('DISABLED');
    }
  };

  const handleSentryToggle = (toggleValue: boolean) => {
    if (toggleValue) {
      showModal(
        <PromptModal
          title={t('Headwind.Settings.AtsuAoc.OptionalA32nxErrorReporting')}
          bodyText={t('Settings.AtsuAoc.YouAreAbleToOptIntoAnonymousErrorReporting')}
          onConfirm={() => setSentryEnabled(SentryConsentState.Given)}
          onCancel={() => setSentryEnabled(SentryConsentState.Refused)}
          confirmText={t('Settings.AtsuAoc.Enable')}
        />,
      );
    } else {
      setSentryEnabled(SentryConsentState.Refused);
    }
  };

  function handleWeatherSource(source: string, type: string) {
    if (type !== 'TAF') {
      AcarsConnector.deactivate();
    }

    if (type === 'ATIS') {
      setAtisSource(source);
    } else if (type === 'METAR') {
      setMetarSource(source);
    } else if (type === 'TAF') {
      setTafSource(source);
    }

    if (type !== 'TAF') {
      AcarsConnector.activate();
    }
  }

  return (
    <SettingsPage name={t('Settings.AtsuAoc.Title')}>
      <SettingItem name={t('Settings.AtsuAoc.AtisAtcSource')}>
        <SelectGroup>
          {atisSourceButtons.map((button) => (
            <SelectItem
              key={button.setting}
              onSelect={() => handleWeatherSource(button.setting, 'ATIS')}
              selected={atisSource === button.setting}
            >
              {button.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SettingItem>
      <SettingItem name={t('Settings.AtsuAoc.MetarSource')}>
        <SelectGroup>
          {metarSourceButtons.map((button) => (
            <SelectItem
              key={button.setting}
              onSelect={() => handleWeatherSource(button.setting, 'METAR')}
              selected={metarSource === button.setting}
            >
              {button.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SettingItem>
      <SettingItem name={t('Settings.AtsuAoc.TafSource')}>
        <SelectGroup>
          {tafSourceButtons.map((button) => (
            <SelectItem
              key={button.setting}
              onSelect={() => handleWeatherSource(button.setting, 'TAF')}
              selected={tafSource === button.setting}
            >
              {button.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SettingItem>
      <SettingItem name={t('Headwind.Settings.AtsuAoc.TrafficSource')}>
        <SelectGroup>
          {trafficSourceButtons.map((button) => (
            <SelectItem
              key={button.setting}
              onSelect={() => handleTrafficSourceChange(button.setting)}
              selected={trafficSource === button.setting}
            >
              {button.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SettingItem>
            <SettingItem name={t('Headwind.Settings.AtsuAoc.TrafficHideCallsign')}>
        <SelectGroup>
          {trafficDisplayButtons.map((button) => (
            <SelectItem
              key={button.setting}
              onSelect={() => handleTrafficDefaultChange(button.setting)}
              selected={trafficDisplayHideCallsign === button.setting}
            >
              {button.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SettingItem>
      <SettingItem name={t('Settings.AtsuAoc.ErrorReporting')}>
        <Toggle
          value={sentryEnabled === SentryConsentState.Given}
          onToggle={(toggleValue) => handleSentryToggle(toggleValue)}
        />
      </SettingItem>

      <SettingItem name={t('Settings.AtsuAoc.Telex')}>
        <Toggle value={telexEnabled === 'ENABLED'} onToggle={(toggleValue) => handleTelexToggle(toggleValue)} />
      </SettingItem>

      <SettingItem name={t('Headwind.Settings.AtsuAoc.AcarsNetwork')}>
        <SelectGroup>
          {acarsNetworkButtons.map((button) => (
            <SelectItem
              key={button.setting}
              onSelect={() => handleAcarsNetwork(button.setting)}
              selected={acarsNetwork === button.setting}
            >
              {button.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SettingItem>

      {acarsNetwork === AcarsNetwork.Hoppie && (
        <SettingItem name={t('Settings.AtsuAoc.HoppieUserId')}>
          <SimpleInput
            className="w-30 text-center"
            value={hoppieUserId}
            onBlur={(value) => handleAcarsIdentifierInput(AcarsNetwork.Hoppie, value.replace(/\s/g, ''))}
            onChange={(value) => setHoppieUserId(value)}
          />
        </SettingItem>
      )}

      {acarsNetwork === AcarsNetwork.SayIntentions && (
        <SettingItem name={t('Headwind.Settings.AtsuAoc.SayIntentionsKey')}>
          <SimpleInput
            className="w-30 text-center"
            value={sayIntentionsKey}
            onBlur={(value) => handleAcarsIdentifierInput(AcarsNetwork.SayIntentions, value.replace(/\s/g, ''))}
            onChange={(value) => setSayIntentionsKey(value)}
          />
        </SettingItem>
      )}
    </SettingsPage>
  );
};
