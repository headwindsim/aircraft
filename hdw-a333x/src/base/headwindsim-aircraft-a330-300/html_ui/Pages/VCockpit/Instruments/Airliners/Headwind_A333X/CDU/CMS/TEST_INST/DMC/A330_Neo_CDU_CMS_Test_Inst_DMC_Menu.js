class CDU_CMS_Test_Inst_DMC_Menu {
    static ShowPage(mcdu, dmcIndex) {
        mcdu.clearDisplay();
        SimVar.SetSimVarValue(`L:A32NX_DMC_DISPLAYTEST:${dmcIndex}`, 'Enum', 1);
        const title = `DMC ${dmcIndex}`;
        mcdu.setTemplate([
            [title],
            ['LAST LEG[color]inop', 'CLASS 3[color]inop'],
            ['<REPORT[color]inop', 'FAULTS>[color]inop'],
            ['PREVIOUS LEGS[color]inop', 'SYSTEM'],
            ['<REPORT[color]inop', 'TESTS>'],
            [''],
            ['<LRU IDENT[color]inop'],
            ['', 'SWTG/BUS/DU[color]inop'],
            ['<GND SCANNING[color]inop', 'TESTS>[color]inop'],
            ['TROUBLE SHOOT[color]inop', 'GROUND[color]inop'],
            ['<DATA[color]inop', 'REPORT>[color]inop'],
            ['', 'PIN PROG/STATUS[color]inop'],
            ['<RETURN[color]cyan', 'AND XLOAD>[color]inop'],
        ]);

        mcdu.onUnload = () => SimVar.SetSimVarValue(`L:A32NX_DMC_DISPLAYTEST:${dmcIndex}`, 'Enum', 0);

        mcdu.leftInputDelay[5] = () => mcdu.getDelaySwitchPage();
        mcdu.onLeftInput[5] = () => {
            CDU_CMS_Test_Inst_Display.ShowPage(mcdu);
        };
        mcdu.rightInputDelay[1] = () => mcdu.getDelaySwitchPage();
        mcdu.onRightInput[1] = () => {
            CDU_CMS_Test_Inst_DMC_Tests.ShowPage(mcdu, dmcIndex);
        };
    }
}
