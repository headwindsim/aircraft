class CDU_CMS_Test_Aircond_CPC_Menu {
  static ShowPage(mcdu, cpcIndex) {
    mcdu.clearDisplay();
    const title = 'CPC' + cpcIndex;
    mcdu.setTemplate([
      [title],
      ['LAST LEG[color]inop', 'CLASS 3[color]inop'],
      ['<REPORT[color]inop', 'FAULTS>[color]inop'],
      ['PREVIOUS LEGS[color]inop'],
      ['<REPORT[color]inop', 'TEST>[color]inop'],
      [''],
      ['<LRU IDENT[color]inop'],
      [''],
      ['<GND SCANNING[color]inop'],
      ['TROUBLE SHOOT[color]inop', 'GROUND[color]inop'],
      ['<DATA[color]inop', 'REPORT>[color]inop'],
      [''],
      ['<RETURN[color]cyan'],
    ]);

    mcdu.leftInputDelay[5] = () => {
      return mcdu.getDelaySwitchPage();
    };
    mcdu.onLeftInput[5] = () => {
      CDU_CMS_Test_Aircond_CPC.ShowPage(mcdu);
    };
  }
}
