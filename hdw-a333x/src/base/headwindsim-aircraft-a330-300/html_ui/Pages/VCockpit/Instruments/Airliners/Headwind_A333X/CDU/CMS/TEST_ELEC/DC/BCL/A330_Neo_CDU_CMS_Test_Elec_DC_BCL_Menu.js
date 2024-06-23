class CDU_CMS_Test_Elec_DC_BCL_Menu {
    static ShowPage(mcdu, bclIndex) {
        mcdu.clearDisplay();
        const title = `BCL ${bclIndex}`;
        mcdu.setTemplate([
            [title],
            ['LAST LEG[color]inop', 'CLASS 3[color]inop'],
            ['<REPORT[color]inop', 'FAULTS>[color]inop'],
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
            CDU_CMS_Test_Elec_DC_Menu.ShowPage(mcdu);
        };
    }
}
