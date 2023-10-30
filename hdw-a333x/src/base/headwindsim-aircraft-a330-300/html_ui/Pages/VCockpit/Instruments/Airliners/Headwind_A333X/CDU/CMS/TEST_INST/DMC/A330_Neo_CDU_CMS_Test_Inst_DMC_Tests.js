class CDU_CMS_Test_Inst_DMC_Tests {
    static ShowPage(mcdu, dmcIndex) {
        mcdu.clearDisplay();
        SimVar.SetSimVarValue(`L:A32NX_DMC_DISPLAYTEST:${dmcIndex}`, "Enum", 1);
        const title = "DMC " + dmcIndex;
        mcdu.setTemplate([
            [title],
            ["", "", "TEST"],
            [""],
            [""],
            ["<SYSTEM TEST[color]inop"],
            [""],
            ["<DISPLAY TEST"],
            [""],
            ["<I/P TEST[color]inop"],
            [""],
            ["<SYSTEM TEST RESULT[color]inop"],
            [""],
            ["<RETURN[color]cyan"]
        ]);

        mcdu.onUnload = () => SimVar.SetSimVarValue(`L:A32NX_DMC_DISPLAYTEST:${dmcIndex}`, "Enum", 0);

        mcdu.leftInputDelay[2] = () => {
            return mcdu.getDelaySwitchPage();
        };
        mcdu.onLeftInput[2] = () => {
            CDU_CMS_Test_Inst_DMC_Tests_Display.ShowPage(mcdu, dmcIndex);
        };
        mcdu.leftInputDelay[5] = () => {
            return mcdu.getDelaySwitchPage();
        };
        mcdu.onLeftInput[5] = () => {
            CDU_CMS_Test_Inst_DMC_Menu.ShowPage(mcdu, dmcIndex);
        };
    }
}
