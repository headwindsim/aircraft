class CDU_CMS_ACMS_Menu {
  static ShowPage(mcdu) {
    mcdu.clearDisplay();
    mcdu.page.Current = mcdu.page.MenuPage;
    mcdu.activeSystem = 'ACMS';

    mcdu.setTemplate([
      ['ACMS'],
      ['PARAMETER[color]inop', 'CALL UP[color]inop'],
      ['<LABEL[color]inop', 'ALPHA>[color]inop'],
      ['SPECIAL FUNCT/[color]inop'],
      ['<REPROGRAMMING[color]inop', 'PCMCIA>[color]inop'],
      ['', 'AIRLINE[color]inop'],
      ['<DAR RECRDNG[color]inop', 'FUNCTIONS>[color]inop'],
      ['STORED[color]inop', 'STORED[color]inop'],
      ['<SAR DATA[color]inop', 'REPORTS>[color]inop'],
      ['MAN REQST[color]inop', 'MAN REQST[color]inop'],
      ['<SAR/RECRDNG[color]inop', 'REPORTS>[color]inop'],
      ['SYSTEM[color]inop'],
      ['<DATA[color]inop', 'HELP>[color]inop'],
    ]);
  }
}
