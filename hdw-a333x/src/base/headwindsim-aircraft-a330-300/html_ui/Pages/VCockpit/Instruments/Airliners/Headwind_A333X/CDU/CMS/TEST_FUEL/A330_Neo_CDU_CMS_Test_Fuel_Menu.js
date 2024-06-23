class CDU_CMS_Test_Fuel_Menu {
    static ShowPage(mcdu) {
        mcdu.clearDisplay();
        mcdu.setTemplate([
            ['SYSTEM REPORT/TEST 1/1'],
            ['', '', 'FUEL'],
            ['<FCMC 1', 'FCMC 2>'],
            ['', '', 'FUEL CTL MONG SYS'],
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
            CDU_CMS_Test_Fuel_FCMC_Menu.ShowPage(mcdu, 1);
        };

        mcdu.leftInputDelay[5] = () => mcdu.getDelaySwitchPage();
        mcdu.onLeftInput[5] = () => {
            CDU_CMS_TestMenu.ShowPage3(mcdu);
        };

        mcdu.rightInputDelay[0] = () => mcdu.getDelaySwitchPage();
        mcdu.onRightInput[0] = () => {
            CDU_CMS_Test_Fuel_FCMC_Menu.ShowPage(mcdu, 2);
        };
    }
}
