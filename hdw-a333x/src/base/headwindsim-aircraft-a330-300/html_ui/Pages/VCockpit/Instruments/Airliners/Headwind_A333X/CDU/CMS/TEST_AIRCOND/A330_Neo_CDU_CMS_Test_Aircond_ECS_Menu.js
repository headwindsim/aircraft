class CDU_CMS_Test_Aircond_ECS_Menu {
    static ShowPage(mcdu) {
        mcdu.clearDisplay();
        mcdu.setTemplate([
            ['ECS'],
            ['LAST LEG[color]inop', 'CLASS 3[color]inop'],
            ['<REPORT[color]inop', 'FAULTS>[color]inop'],
            ['PREVIOUS LEGS[color]inop'],
            ['<REPORT[color]inop'],
            [''],
            ['<LRU IDENT[color]inop', 'TESTS>[color]inop'],
            [''],
            ['<GND SCANNING[color]inop'],
            ['TROUBLE SHOOT[color]inop', 'GROUND[color]inop'],
            ['<DATA[color]inop', 'REPORT>[color]inop'],
            ['', 'SPECIFIC'],
            ['<RETURN[color]cyan', 'DATA>[color]inop'],
        ]);

        mcdu.leftInputDelay[5] = () => mcdu.getDelaySwitchPage();
        mcdu.onLeftInput[5] = () => {
            CDU_CMS_TestMenu.ShowPage1(mcdu);
        };
    }
}
