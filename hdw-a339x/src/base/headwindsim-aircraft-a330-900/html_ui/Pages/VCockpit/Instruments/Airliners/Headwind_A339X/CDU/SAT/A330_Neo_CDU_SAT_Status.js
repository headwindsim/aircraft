class CDU_SAT_Status {
    static ShowPage(mcdu) {
        mcdu.clearDisplay();
        mcdu.page.Current = mcdu.page.MenuPage;

        const updateView = () => {
            mcdu.setTemplate(FormatTemplate([
                [new Column(6, "SATCOM STATUS")],
                [new Column(1, "LOG - ON STATE")],
                [new Column(1, "SATCOM INOP")],
                [""],
                [""],
                [new Column(1, "SAT1 LEVEL")],
                [new Column(1, "LOW")],
                [new Column(1, "SAT2 LEVEL")],
                [
                    new Column(1, "LOW"),
                    new Column(23, "BITE OK>", Column.inop, Column.right)
                ],
                [new Column(1, "DATA LEVEL")],
                [
                    new Column(1, "LOW"),
                    new Column(23, "CONFIG>", Column.inop, Column.right)
                ],
                [""],
                [
                    new Column(0, "<RETURN", Column.cyan)
                ],
            ]));
        };

        updateView();

        mcdu.leftInputDelay[5] = () => {
            return mcdu.getDelaySwitchPage();
        };
        mcdu.onLeftInput[5] = () => {
            CDU_SAT_Menu.ShowPage(mcdu);
        };
    }
}
