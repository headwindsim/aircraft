/** Bit flags for the radio auto call outs (for CONFIG_A330X_FWC_RADIO_AUTO_CALL_OUT_PINS). */
export enum A330XRadioAutoCallOutFlags {
  TwoThousandFiveHundred = 1 << 0,
  TwentyFiveHundred = 1 << 1,
  TwoThousand = 1 << 2,
  OneThousand = 1 << 3,
  FiveHundred = 1 << 4,
  FourHundred = 1 << 5,
  ThreeHundred = 1 << 6,
  TwoHundred = 1 << 7,
  OneHundred = 1 << 8,
  Ninety = 1 << 9,
  Eighty = 1 << 10,
  Seventy = 1 << 11,
  Sixty = 1 << 12,
  Fifty = 1 << 13,
  Forty = 1 << 14,
  Thirty = 1 << 15,
  Twenty = 1 << 16,
  Ten = 1 << 17,
  Five = 1 << 18,
  FiveHundredGlide = 1 << 19,
}

/** The default (Airbus basic configuration) radio altitude auto call outs. */
export const A330X_DEFAULT_RADIO_AUTO_CALL_OUTS =
  A330XRadioAutoCallOutFlags.TwoThousandFiveHundred |
  A330XRadioAutoCallOutFlags.TwoThousand |
  A330XRadioAutoCallOutFlags.OneThousand |
  A330XRadioAutoCallOutFlags.FiveHundred |
  A330XRadioAutoCallOutFlags.FourHundred |
  A330XRadioAutoCallOutFlags.ThreeHundred |
  A330XRadioAutoCallOutFlags.TwoHundred |
  A330XRadioAutoCallOutFlags.OneHundred |
  A330XRadioAutoCallOutFlags.Eighty |
  A330XRadioAutoCallOutFlags.Seventy |
  A330XRadioAutoCallOutFlags.Sixty |
  A330XRadioAutoCallOutFlags.Fifty |
  A330XRadioAutoCallOutFlags.Forty |
  A330XRadioAutoCallOutFlags.Thirty |
  A330XRadioAutoCallOutFlags.Twenty |
  A330XRadioAutoCallOutFlags.Ten |
  A330XRadioAutoCallOutFlags.Five;
