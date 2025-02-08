// Copyright (c) 2023-2024 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

import React from 'react';

import { usePersistentNumberProperty } from '@flybywiresim/fbw-sdk';
import { pathify, SettingItem, SettingsPage, t, Toggle } from '@flybywiresim/flypad';
import { A330X_DEFAULT_RADIO_AUTO_CALL_OUTS, A330XRadioAutoCallOutFlags } from '../../../../shared/src/AutoCallOuts';

export const AutomaticCallOutsPage: React.FC = () => {
  const [autoCallOuts, setAutoCallOuts] = usePersistentNumberProperty(
    'CONFIG_A330X_FWC_RADIO_AUTO_CALL_OUT_PINS',
    A330X_DEFAULT_RADIO_AUTO_CALL_OUTS,
  );

  const toggleRadioAcoFlag = (flag: A330XRadioAutoCallOutFlags): void => {
    let newFlags = autoCallOuts;
    if ((autoCallOuts & flag) > 0) {
      newFlags &= ~flag;
    } else {
      newFlags |= flag;
    }

    // two-thousand-five-hundred and twenty-five-hundred are exclusive
    const both2500s = A330XRadioAutoCallOutFlags.TwoThousandFiveHundred | A330XRadioAutoCallOutFlags.TwentyFiveHundred;
    if ((newFlags & both2500s) === both2500s) {
      if (flag === A330XRadioAutoCallOutFlags.TwentyFiveHundred) {
        newFlags &= ~A330XRadioAutoCallOutFlags.TwoThousandFiveHundred;
      } else {
        newFlags &= ~A330XRadioAutoCallOutFlags.TwentyFiveHundred;
      }
    }

    // one of five-hundred or four-hundred is mandatory
    const fiveHundredFourHundred = A330XRadioAutoCallOutFlags.FiveHundred | A330XRadioAutoCallOutFlags.FourHundred;
    if ((newFlags & fiveHundredFourHundred) === 0) {
      // Airbus basic config is four hundred so prefer that if it wasn't just de-selected
      if (flag === A330XRadioAutoCallOutFlags.FourHundred) {
        newFlags |= A330XRadioAutoCallOutFlags.FiveHundred;
      } else {
        newFlags |= A330XRadioAutoCallOutFlags.FourHundred;
      }
    }

    // can't have 500 glide without 500
    if ((newFlags & A330XRadioAutoCallOutFlags.FiveHundred) === 0) {
      newFlags &= ~A330XRadioAutoCallOutFlags.FiveHundredGlide;
    }

    setAutoCallOuts(newFlags);
  };

  return (
    <SettingsPage
      name={t('Settings.AutomaticCallOuts.Title')}
      backRoute={`/settings/${pathify('Aircraft Options / Pin Programs')}`}
    >
      <div className="grid grid-cols-2 gap-x-6">
        <div className="mr-3 divide-y-2 divide-theme-accent">
          <SettingItem name="Two Thousand Five Hundred">
            <Toggle
              value={(autoCallOuts & A330XRadioAutoCallOutFlags.TwoThousandFiveHundred) > 0}
              onToggle={() => toggleRadioAcoFlag(A330XRadioAutoCallOutFlags.TwoThousandFiveHundred)}
            />
          </SettingItem>
          <SettingItem name="Twenty Five Hundred">
            <Toggle
              value={(autoCallOuts & A330XRadioAutoCallOutFlags.TwentyFiveHundred) > 0}
              onToggle={() => toggleRadioAcoFlag(A330XRadioAutoCallOutFlags.TwentyFiveHundred)}
            />
          </SettingItem>
          <SettingItem name="Two Thousand">
            <Toggle
              value={(autoCallOuts & A330XRadioAutoCallOutFlags.TwoThousand) > 0}
              onToggle={() => toggleRadioAcoFlag(A330XRadioAutoCallOutFlags.TwoThousand)}
            />
          </SettingItem>
          <SettingItem name="One Thousand">
            <Toggle
              value={(autoCallOuts & A330XRadioAutoCallOutFlags.OneThousand) > 0}
              onToggle={() => toggleRadioAcoFlag(A330XRadioAutoCallOutFlags.OneThousand)}
            />
          </SettingItem>
          {/* TODO enable this when the new rust FWC is merged with the 500 hundred GS inhibit logic */}
          {/* <SettingGroup> */}
          {/* groupType="parent" */}
          <SettingItem name="Five Hundred">
            <Toggle
              value={(autoCallOuts & A330XRadioAutoCallOutFlags.FiveHundred) > 0}
              onToggle={() => toggleRadioAcoFlag(A330XRadioAutoCallOutFlags.FiveHundred)}
            />
          </SettingItem>
          {/* <SettingItem name={t('Settings.AutomaticCallOuts.FiveHundredGlide')} groupType="sub">
                            <Toggle
                                value={(autoCallOuts & RadioAutoCallOutFlags.FiveHundredGlide) > 0}
                                disabled={(autoCallOuts & RadioAutoCallOutFlags.FiveHundred) === 0}
                                onToggle={() => toggleRadioAcoFlag(RadioAutoCallOutFlags.FiveHundredGlide)}
                            />
                        </SettingItem> */}
          {/* </SettingGroup> */}
          <SettingItem name="Four Hundred">
            <Toggle
              value={(autoCallOuts & A330XRadioAutoCallOutFlags.FourHundred) > 0}
              onToggle={() => toggleRadioAcoFlag(A330XRadioAutoCallOutFlags.FourHundred)}
            />
          </SettingItem>
          <SettingItem name="Three Hundred">
            <Toggle
              value={(autoCallOuts & A330XRadioAutoCallOutFlags.ThreeHundred) > 0}
              onToggle={() => toggleRadioAcoFlag(A330XRadioAutoCallOutFlags.ThreeHundred)}
            />
          </SettingItem>
          <SettingItem name="Two Hundred">
            <Toggle
              value={(autoCallOuts & A330XRadioAutoCallOutFlags.TwoHundred) > 0}
              onToggle={() => toggleRadioAcoFlag(A330XRadioAutoCallOutFlags.TwoHundred)}
            />
          </SettingItem>
          <SettingItem name="One Hundred">
            <Toggle
              value={(autoCallOuts & A330XRadioAutoCallOutFlags.OneHundred) > 0}
              onToggle={() => toggleRadioAcoFlag(A330XRadioAutoCallOutFlags.OneHundred)}
            />
          </SettingItem>
        </div>
        <div className="ml-3 divide-y-2 divide-theme-accent">
          <SettingItem name="Ninety">
            <Toggle
              value={(autoCallOuts & A330XRadioAutoCallOutFlags.Ninety) > 0}
              onToggle={() => toggleRadioAcoFlag(A330XRadioAutoCallOutFlags.Ninety)}
            />
          </SettingItem>

          <SettingItem name="Eighty">
            <Toggle
              value={(autoCallOuts & A330XRadioAutoCallOutFlags.Eighty) > 0}
              onToggle={() => toggleRadioAcoFlag(A330XRadioAutoCallOutFlags.Eighty)}
            />
          </SettingItem>

          <SettingItem name="Seventy">
            <Toggle
              value={(autoCallOuts & A330XRadioAutoCallOutFlags.Seventy) > 0}
              onToggle={() => toggleRadioAcoFlag(A330XRadioAutoCallOutFlags.Seventy)}
            />
          </SettingItem>

          <SettingItem name="Sixty">
            <Toggle
              value={(autoCallOuts & A330XRadioAutoCallOutFlags.Sixty) > 0}
              onToggle={() => toggleRadioAcoFlag(A330XRadioAutoCallOutFlags.Sixty)}
            />
          </SettingItem>

          <SettingItem name="Fifty">
            <Toggle
              value={(autoCallOuts & A330XRadioAutoCallOutFlags.Fifty) > 0}
              onToggle={() => toggleRadioAcoFlag(A330XRadioAutoCallOutFlags.Fifty)}
            />
          </SettingItem>

          <SettingItem name="Forty">
            <Toggle
              value={(autoCallOuts & A330XRadioAutoCallOutFlags.Forty) > 0}
              onToggle={() => toggleRadioAcoFlag(A330XRadioAutoCallOutFlags.Forty)}
            />
          </SettingItem>

          <SettingItem name="Thirty">
            <Toggle
              value={(autoCallOuts & A330XRadioAutoCallOutFlags.Thirty) > 0}
              onToggle={() => toggleRadioAcoFlag(A330XRadioAutoCallOutFlags.Thirty)}
            />
          </SettingItem>

          <SettingItem name="Twenty">
            <Toggle
              value={(autoCallOuts & A330XRadioAutoCallOutFlags.Twenty) > 0}
              onToggle={() => toggleRadioAcoFlag(A330XRadioAutoCallOutFlags.Twenty)}
            />
          </SettingItem>

          <SettingItem name="Ten">
            <Toggle
              value={(autoCallOuts & A330XRadioAutoCallOutFlags.Ten) > 0}
              onToggle={() => toggleRadioAcoFlag(A330XRadioAutoCallOutFlags.Ten)}
            />
          </SettingItem>

          <SettingItem name="Five">
            <Toggle
              value={(autoCallOuts & A330XRadioAutoCallOutFlags.Five) > 0}
              onToggle={() => toggleRadioAcoFlag(A330XRadioAutoCallOutFlags.Five)}
            />
          </SettingItem>
        </div>
      </div>
      <SettingItem name={t('Settings.AutomaticCallOuts.ResetStandardConfig')}>
        <button
          type="button"
          className="rounded-md border-2 border-theme-highlight bg-theme-highlight px-5
                                       py-2.5 text-theme-body transition duration-100 hover:bg-theme-body hover:text-theme-highlight"
          onClick={() => setAutoCallOuts(A330X_DEFAULT_RADIO_AUTO_CALL_OUTS)}
        >
          {t('Settings.AutomaticCallOuts.Reset')}
        </button>
      </SettingItem>
    </SettingsPage>
  );
};
