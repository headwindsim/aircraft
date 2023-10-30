class CDU_CMS_Test_Aircond_VC_Menu {
    static ShowPage(mcdu) {
        mcdu.clearDisplay();
        mcdu.setTemplate([
            ["VC"],
            ["LAST LEG[color]inop", "CLASS 3[color]inop"],
            ["<REPORT[color]inop", "FAULTS>[color]inop"],
            ["PREVIOUS LEGS[color]inop", "SYSTEM[color]inop"],
            ["<REPORT[color]inop", "TEST>[color]inop"],
            [""],
            ["<LRU IDENT[color]inop"],
            ["", "ADDITIONAL[color]inop"],
            ["<GND SCANNING[color]inop", "TEST>[color]inop"],
            ["TROUBLE SHOOT[color]inop", "GROUND[color]inop"],
            ["<DATA[color]inop", "REPORT>[color]inop"],
            ["", "SPECIFIC[color]inop"],
            ["<RETURN[color]cyan", "FUNCTIONS>[color]inop"]
        ]);

        mcdu.leftInputDelay[5] = () => {
            return mcdu.getDelaySwitchPage();
        };
        mcdu.onLeftInput[5] = () => {
            CDU_CMS_TestMenu.ShowPage1(mcdu);
        };

    }
}
