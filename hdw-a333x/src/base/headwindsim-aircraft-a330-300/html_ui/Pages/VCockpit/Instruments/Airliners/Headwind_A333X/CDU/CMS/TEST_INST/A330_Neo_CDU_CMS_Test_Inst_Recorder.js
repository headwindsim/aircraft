class CDU_CMS_Test_Inst_Recorder {
    static ShowPage(mcdu) {
        mcdu.clearDisplay();
        mcdu.setTemplate([
            ['SYSTEM REPORT/TEST 1/1'],
            ['', '', 'INST:RECORDER'],
            ['<DFDRS'],
            ['', '', 'DGTL FLT DATA SYS'],
            ['<ACMS'],
            ['', '', 'A/C COND MONG SYS'],
            [''],
            [''],
            [''],
            [''],
            [''],
            [''],
            ['<RETURN[color]cyan'],
        ]);

        mcdu.leftInputDelay[0] = () => mcdu.getDelaySwitchPage();
        mcdu.onLeftInput[0] = () => {
            CDU_CMS_Test_Inst_DFDRS_Menu.ShowPage(mcdu);
        };

        mcdu.leftInputDelay[1] = () => mcdu.getDelaySwitchPage();
        mcdu.onLeftInput[1] = () => {
            CDU_CMS_Test_Inst_ACMS_Menu.ShowPage(mcdu);
        };

        mcdu.leftInputDelay[5] = () => mcdu.getDelaySwitchPage();
        mcdu.onLeftInput[5] = () => {
            CDU_CMS_TestMenu.ShowPage3(mcdu);
        };
    }
}
