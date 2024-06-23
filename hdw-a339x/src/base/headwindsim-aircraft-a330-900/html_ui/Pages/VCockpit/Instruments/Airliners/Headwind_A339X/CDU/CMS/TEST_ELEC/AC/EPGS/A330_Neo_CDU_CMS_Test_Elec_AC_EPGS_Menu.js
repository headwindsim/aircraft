class CDU_CMS_Test_Elec_AC_EPGS_Menu {
  static ShowPage(mcdu) {
    mcdu.clearDisplay();

    mcdu.setTemplate([
      ['EPGS'],
      ['LAST LEG[color]inop', 'CLASS 3[color]inop'],
      ['<REPORT[color]inop', 'FAULTS>[color]inop'],
      ['PREVIOUS LEGS[color]inop', 'GCU/GPCU[color]inop'],
      ['<REPORT[color]inop', 'TEST>[color]inop'],
      ['', 'GCU APU[color]inop'],
      ['<LRU IDENT[color]inop', 'TEST>[color]inop'],
      [''],
      [''],
      ['TROUBLE SHOOT[color]inop', 'GROUND[color]inop'],
      ['<DATA[color]inop', 'REPORT>[color]inop'],
      [''],
      ['<RETURN[color]cyan'],
    ]);

    mcdu.leftInputDelay[5] = () => {
      return mcdu.getDelaySwitchPage();
    };
    mcdu.onLeftInput[5] = () => {
      CDU_CMS_Test_Elec_AC_Menu.ShowPage(mcdu);
    };
  }
}
