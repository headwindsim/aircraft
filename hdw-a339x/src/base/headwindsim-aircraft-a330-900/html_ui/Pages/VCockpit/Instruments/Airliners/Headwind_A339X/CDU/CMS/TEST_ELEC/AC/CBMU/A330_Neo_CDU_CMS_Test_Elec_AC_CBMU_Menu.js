class CDU_CMS_Test_Elec_AC_CBMU_Menu {
    static ShowPage(mcdu) {
        mcdu.clearDisplay();
        mcdu.setTemplate([
            ["CBMU"],
            ["LAST LEG[color]inop", "CLASS 3[color]inop"],
            ["<REPORT[color]inop", "FAULTS>[color]inop"],
            [""],
            ["", "TEST>[color]inop"],
            [""],
            [""],
            [""],
            [""],
            [""],
            [""],
            [""],
            ["<RETURN[color]cyan"]
        ]);

        mcdu.leftInputDelay[5] = () => {
            return mcdu.getDelaySwitchPage();
        };
        mcdu.onLeftInput[5] = () => {
            CDU_CMS_Test_Elec_AC_Menu.ShowPage(mcdu);
        };
    }
}
