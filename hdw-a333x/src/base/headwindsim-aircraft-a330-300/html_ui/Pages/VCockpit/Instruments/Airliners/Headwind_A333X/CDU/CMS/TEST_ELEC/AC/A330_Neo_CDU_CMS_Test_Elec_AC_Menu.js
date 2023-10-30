class CDU_CMS_Test_Elec_AC_Menu {
    static ShowPage(mcdu) {
        mcdu.clearDisplay();
        mcdu.setTemplate([
            ["SYSTEM REPORT/TEST 1/1"],
            ["", "", "ELEC"],
            ["<ECMU1", "ECMU2>"],
            ["", "", "ELEC CNTOR MGT UNIT"],
            ["<EPGS"],
            ["", "", "EXT PWR GEN SYS"],
            ["<GCU EMG"],
            ["", "", "GEN CTL UNIT EMER"],
            ["<CBMU"],
            ["", "", "CKT BRKR MONG UNIT"],
            [""],
            [""],
            ["<RETURN[color]cyan"]
        ]);

        mcdu.leftInputDelay[0] = () => {
            return mcdu.getDelaySwitchPage();
        };
        mcdu.onLeftInput[0] = () => {
            CDU_CMS_Test_Elec_AC_ECMU_Menu.ShowPage(mcdu, 1);
        };
        mcdu.leftInputDelay[1] = () => {
            return mcdu.getDelaySwitchPage();
        };
        mcdu.onLeftInput[1] = () => {
            CDU_CMS_Test_Elec_AC_EPGS_Menu.ShowPage(mcdu);
        };
        mcdu.leftInputDelay[2] = () => {
            return mcdu.getDelaySwitchPage();
        };
        mcdu.onLeftInput[2] = () => {
            CDU_CMS_Test_Elec_AC_GCU_Menu.ShowPage(mcdu);
        };
        mcdu.leftInputDelay[3] = () => {
            return mcdu.getDelaySwitchPage();
        };
        mcdu.onLeftInput[3] = () => {
            CDU_CMS_Test_Elec_AC_CBMU_Menu.ShowPage(mcdu);
        };
        mcdu.leftInputDelay[5] = () => {
            return mcdu.getDelaySwitchPage();
        };
        mcdu.onLeftInput[5] = () => {
            CDU_CMS_TestMenu.ShowPage2(mcdu);
        };
        mcdu.rightInputDelay[0] = () => {
            return mcdu.getDelaySwitchPage();
        };
        mcdu.onRightInput[0] = () => {
            CDU_CMS_Test_Elec_AC_ECMU_Menu.ShowPage(mcdu, 2);
        };
    }
}
