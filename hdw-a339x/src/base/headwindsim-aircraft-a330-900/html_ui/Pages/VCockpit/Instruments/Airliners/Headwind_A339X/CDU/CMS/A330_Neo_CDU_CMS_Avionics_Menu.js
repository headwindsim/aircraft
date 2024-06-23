class CDU_CMS_AvionicsMenu {
  static ShowPage(mcdu) {
    mcdu.clearDisplay();
    mcdu.setTemplate([
      ['AVIONICS STATUS', '1', '2'],
      [''],
      ['<VHF 3[color]inop'],
      [''],
      ['<FCDC 1[color]inop'],
      [''],
      ['<DMU[color]inop'],
      [''],
      ['<LGCIU 2[color]inop'],
      [''],
      ['<TPIU[color]inop'],
      [''],
      ['<RETURN[color]cyan', 'PAGE PRINT*[color]inop'],
    ]);

    mcdu.leftInputDelay[5] = () => {
      return mcdu.getDelaySwitchPage();
    };

    mcdu.onLeftInput[5] = () => {
      CDU_CMS_MenuPage.ShowPage1(mcdu);
    };

    // PAGE SWITCHING
    mcdu.onUp = () => {
      this.ShowPage2(mcdu);
    };
    mcdu.onDown = () => {
      this.ShowPage2(mcdu);
    };
  }

  static ShowPage2(mcdu) {
    mcdu.clearDisplay();
    mcdu.setTemplate([
      ['AVIONICS STATUS', '2', '2'],
      [''],
      ['<ADIRU3[color]inop'],
      [''],
      ['<SFCC1[color]inop'],
      [''],
      [''],
      [''],
      [''],
      [''],
      [''],
      [''],
      ['<RETURN[color]cyan', ' PAGE PRINT*[color]inop'],
    ]);

    mcdu.leftInputDelay[5] = () => {
      return mcdu.getDelaySwitchPage();
    };

    mcdu.onLeftInput[5] = () => {
      CDU_CMS_MenuPage.ShowPage1(mcdu);
    };

    // PAGE SWITCHING
    mcdu.onUp = () => {
      this.ShowPage(mcdu);
    };
    mcdu.onDown = () => {
      this.ShowPage(mcdu);
    };
  }
}
