class CDU_SAT_Directory {
    static ShowPage(mcdu) {
        mcdu.clearDisplay();
        mcdu.page.Current = mcdu.page.MenuPage;

        const updateView = () => {
            mcdu.setTemplate(FormatTemplate([
                [new Column(4, 'SATCOM DIRECTORY')],
                [''],
                [new Column(0, '<EMERGENCY', Column.inop)],
                [''],
                [new Column(0, '<SAFETY', Column.inop)],
                [''],
                [new Column(0, '<NON-SAFETY', Column.inop)],
                [''],
                [new Column(0, '<PUBLIC', Column.inop)],
                [''],
                [''],
                [''],
                [new Column(0, '<RETURN', Column.cyan)],
            ]));
        };

        updateView();

        mcdu.leftInputDelay[5] = () => mcdu.getDelaySwitchPage();
        mcdu.onLeftInput[5] = () => {
            CDU_SAT_Menu.ShowPage(mcdu);
        };
    }
}
