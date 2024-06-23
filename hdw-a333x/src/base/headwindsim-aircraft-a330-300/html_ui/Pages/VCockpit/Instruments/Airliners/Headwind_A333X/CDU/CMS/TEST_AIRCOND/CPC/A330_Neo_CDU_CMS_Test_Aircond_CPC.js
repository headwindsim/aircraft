class CDU_CMS_Test_Aircond_CPC {
    static ShowPage(mcdu) {
        mcdu.clearDisplay();
        mcdu.setTemplate([
            ['SYSTEM REPORT/TEST 1/1'],
            ['', '', 'AIRCOND'],
            ['<CPC 1', 'CPC 2>'],
            ['', '', 'CAB PRESS CTL UNIT'],
            [''],
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
            CDU_CMS_Test_Aircond_CPC_Menu.ShowPage(mcdu, 1);
        };

        mcdu.leftInputDelay[5] = () => mcdu.getDelaySwitchPage();
        mcdu.onLeftInput[5] = () => {
            CDU_CMS_TestMenu.ShowPage1(mcdu);
        };

        mcdu.rightInputDelay[0] = () => mcdu.getDelaySwitchPage();
        mcdu.onRightInput[0] = () => {
            CDU_CMS_Test_Aircond_CPC_Menu.ShowPage(mcdu, 2);
        };
    }
}
