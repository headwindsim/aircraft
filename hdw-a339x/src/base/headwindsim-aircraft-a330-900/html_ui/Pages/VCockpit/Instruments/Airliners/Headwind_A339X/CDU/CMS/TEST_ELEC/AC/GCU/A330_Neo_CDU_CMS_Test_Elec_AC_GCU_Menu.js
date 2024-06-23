class CDU_CMS_Test_Elec_AC_GCU_Menu {
  static ShowPage(mcdu) {
    mcdu.clearDisplay();
    mcdu.setTemplate([
      ['GCU EMR'],
      [''],
      [''],
      [''],
      ['', 'TEST>[color]inop'],
      [''],
      [''],
      [''],
      [''],
      [''],
      [''],
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
