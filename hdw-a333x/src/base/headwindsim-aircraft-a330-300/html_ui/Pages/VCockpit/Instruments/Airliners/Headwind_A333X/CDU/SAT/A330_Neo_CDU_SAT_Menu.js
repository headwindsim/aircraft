class CDU_SAT_Menu {
    static ShowPage(mcdu) {
        mcdu.clearDisplay();
        mcdu.page.Current = mcdu.page.MenuPage;
        mcdu.activeSystem = 'SAT';

        const updateView = () => {
            mcdu.setTemplate(FormatTemplate([
                [new Column(4, 'SATCOM MAIN MENU')],
                [''],
                [''],
                [new Column(1, 'SAT 1 NOT AVAILABLE')],
                [new Column(1, '')],
                [''],
                [''],
                [new Column(1, 'SAT 2 NOT AVAILABLE')],
                [new Column(1, '')],
                [''],
                [new Column(23, 'MANUAL DIAL>', Column.right)],
                [new Column(1, 'SATCOM')],
                [
                    new Column(0, '<STATUS'),
                    new Column(23, 'DIRECTORY>', Column.right),
                ],
            ]));
        };

        updateView();

        mcdu.leftInputDelay[5] = () => mcdu.getDelaySwitchPage();
        mcdu.onLeftInput[5] = () => {
            CDU_SAT_Status.ShowPage(mcdu);
        };

        mcdu.rightInputDelay[4] = () => mcdu.getDelaySwitchPage();
        mcdu.onRightInput[4] = () => {
            CDU_SAT_ManualDial.ShowPage(mcdu);
        };

        mcdu.rightInputDelay[5] = () => mcdu.getDelaySwitchPage();
        mcdu.onRightInput[5] = () => {
            CDU_SAT_Directory.ShowPage(mcdu);
        };
    }
}
