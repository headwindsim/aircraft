class CDU_CMS_Test_Aircond_AEVC_Menu {
    static ShowPage(mcdu) {
        mcdu.clearDisplay();
        mcdu.setTemplate([
            ['AEVC'],
            ['LAST LEG/GND[color]inop', 'CLASS 3[color]inop'],
            [''],
            [''],
            ['', 'TEST>[color]inop'],
            [''],
            ['<LRU IDENT[color]inop'],
            [''],
            [''],
            [''],
            [''],
            [''],
            ['<RETURN[color]cyan'],
        ]);

        mcdu.leftInputDelay[5] = () => mcdu.getDelaySwitchPage();
        mcdu.onLeftInput[5] = () => {
            CDU_CMS_TestMenu.ShowPage1(mcdu);
        };
    }
}
