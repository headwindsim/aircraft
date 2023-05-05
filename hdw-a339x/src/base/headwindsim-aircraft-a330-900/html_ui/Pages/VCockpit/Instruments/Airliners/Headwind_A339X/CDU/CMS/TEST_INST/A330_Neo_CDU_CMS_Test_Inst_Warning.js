class CDU_CMS_Test_Inst_Warning {
    static ShowPage(mcdu) {
        mcdu.clearDisplay();
        mcdu.setTemplate([
            ["FWS"],
            ["LAST LEG[color]inop", "CLASS 3[color]inop"],
            ["<REPORT[color]inop", "FAULTS>[color]inop"],
            ["PREVIOUS LEGS[color]inop"],
            ["<REPORT[color]inop", "TESTS>[color]inop"],
            ["","OEB[color]inop"],
            ["<LRU IDENT[color]inop", "DATABASE>[color]inop"],
            [""],
            [""],
            ["TROUBLE SHOOT[color]inop", "GROUND[color]inop"],
            ["<DATA[color]inop", "REPORT>[color]inop"],
            ["", "CURRENT[color]inop"],
            ["<RETURN[color]cyan", "DATA>[color]inop"]
        ]);

        mcdu.leftInputDelay[5] = () => {
            return mcdu.getDelaySwitchPage();
        };
        mcdu.onLeftInput[5] = () => {
            CDU_CMS_TestMenu.ShowPage3(mcdu);
        };
    }
}
