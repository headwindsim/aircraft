class CDU_CMS_Test_Elec_DC_Menu {
    static ShowPage(mcdu) {
        mcdu.clearDisplay();
        mcdu.setTemplate([
            ['SYSTEM REPORT/TEST 1/1'],
            ['', '', 'ELEC'],
            ['<BCL 1', 'BCL 2>'],
            ['', '', 'BATTERY CHARGE LIMITER'],
            ['<BCL APU', 'TR>'],
            ['', '', 'TRANSFORMER RECTIFIER'],
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
            CDU_CMS_Test_Elec_DC_BCL_Menu.ShowPage(mcdu, 1);
        };
        mcdu.leftInputDelay[1] = () => mcdu.getDelaySwitchPage();
        mcdu.onLeftInput[1] = () => {
            CDU_CMS_Test_Elec_DC_BCL_Menu.ShowPage(mcdu, 'APU');
        };
        mcdu.leftInputDelay[5] = () => mcdu.getDelaySwitchPage();
        mcdu.onLeftInput[5] = () => {
            CDU_CMS_TestMenu.ShowPage2(mcdu);
        };
        mcdu.rightInputDelay[0] = () => mcdu.getDelaySwitchPage();
        mcdu.onRightInput[0] = () => {
            CDU_CMS_Test_Elec_DC_BCL_Menu.ShowPage(mcdu, 2);
        };
        mcdu.rightInputDelay[1] = () => mcdu.getDelaySwitchPage();
        mcdu.onRightInput[1] = () => {
            CDU_CMS_Test_Elec_DC_TR_Menu.ShowPage(mcdu);
        };
    }
}
