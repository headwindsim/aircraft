class CDU_CMS_Test_Inst_Display {
    static ShowPage(mcdu) {
        mcdu.clearDisplay();
        mcdu.setTemplate([
            ['SYSTEM REPORT/TEST 1/1'],
            ['', '', 'INST: DISPLAY'],
            ['<DMC 1', 'DMC 2>'],
            ['', '', 'DSPL MGT CMPTR'],
            ['<DMC 3'],
            [''],
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
            CDU_CMS_Test_Inst_DMC_Menu.ShowPage(mcdu, 1);
        };
        mcdu.leftInputDelay[1] = () => mcdu.getDelaySwitchPage();
        mcdu.onLeftInput[1] = () => {
            CDU_CMS_Test_Inst_DMC_Menu.ShowPage(mcdu, 3);
        };
        mcdu.leftInputDelay[5] = () => mcdu.getDelaySwitchPage();
        mcdu.onLeftInput[5] = () => {
            CDU_CMS_TestMenu.ShowPage3(mcdu);
        };
        mcdu.rightInputDelay[0] = () => mcdu.getDelaySwitchPage();
        mcdu.onRightInput[0] = () => {
            CDU_CMS_Test_Inst_DMC_Menu.ShowPage(mcdu, 2);
        };
    }
}
