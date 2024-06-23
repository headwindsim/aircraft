class CDU_CMS_MenuPage {
    static ShowPage1(mcdu) {
        mcdu.clearDisplay();
        mcdu.page.Current = mcdu.page.MenuPage;
        mcdu.activeSystem = 'CMS';
        const selectedPrint = false;
        const isOnGround = SimVar.GetSimVarValue('GEAR IS ON GROUND', 'Bool');
        if (!isOnGround) {
            this.ShowPage3(mcdu);
            return;
        }

        const updateView = () => {
            mcdu.setTemplate(FormatTemplate([
                [new Column(1, 'MAINTENANCE MENU 1/2')],
                [new Column(1, 'POST', Column.inop)],
                [
                    new Column(0, '<FLIGHT REPORT', Column.inop),
                    new Column(23, selectedPrint ? '----PRINT*' : '------SEND', Column.inop, Column.right),
                ],
                [new Column(1, 'PREVIOUS', Column.inop)],
                [new Column(0, '<FLIGHT REPORT', Column.inop)],
                [''],
                [
                    new Column(0, '<AVIONICS STATUS'),
                    new Column(23, selectedPrint ? '----PRINT*' : '------SEND', Column.inop, Column.right),
                ],
                [''],
                [new Column(0, '<SYSTEM REPORT/TEST')],
                [''],
                [''],
                [''],
                [new Column(0, '<UTC/DATE INIT', Column.inop)],
            ]));
        };

        updateView();

        mcdu.onUp = () => {
            this.ShowPage2(mcdu);
        };
        mcdu.onDown = () => {
            this.ShowPage2(mcdu);
        };
        mcdu.onNextPage = () => {
            this.selectedPrint = !this.selectedPrint;
            updateView();
        };

        mcdu.leftInputDelay[2] = () => mcdu.getDelaySwitchPage();
        mcdu.onLeftInput[2] = () => {
            CDU_CMS_AvionicsMenu.ShowPage(mcdu);
        };

        mcdu.leftInputDelay[3] = () => mcdu.getDelaySwitchPage();
        mcdu.onLeftInput[3] = () => {
            CDU_CMS_TestMenu.ShowPage1(mcdu);
        };
    }

    static ShowPage2(mcdu) {
        mcdu.clearDisplay();
        mcdu.page.Current = mcdu.page.MenuPage;

        const updateView = () => {
            mcdu.setTemplate(FormatTemplate([
                [new Column(1, 'MAINTENANCE MENU 2/2')],
                [''],
                [new Column(0, '<CLASS 3 REPORT', Column.inop)],
                [''],
                [''],
                [''],
                [''],
                [''],
                [''],
                [''],
                [''],
                [''],
                [''],
            ]));
        };

        updateView();

        mcdu.onUp = () => {
            this.ShowPage1(mcdu);
        };
        mcdu.onDown = () => {
            this.ShowPage1(mcdu);
        };
    }

    static ShowPage3(mcdu) {
        mcdu.clearDisplay();
        mcdu.page.Current = mcdu.page.MenuPage;

        const selectedPrint = false;

        const updateView = () => {
            mcdu.setTemplate(FormatTemplate([
                [new Column(1, 'MAINTENANCE MENU 1/1')],
                [new Column(1, 'CURRENT')],
                [
                    new Column(0, '<FLIGHT REPORT', Column.inop),
                    new Column(23, selectedPrint ? '----PRINT*' : '------SEND', Column.inop, Column.right),
                ],
                [''],
                [''],
                [''],
                [
                    new Column(0, '<AVIONICS STATUS'),
                    new Column(23, selectedPrint ? '----PRINT*' : '------SEND', Column.inop, Column.right),
                ],
                [''],
                [''],
                [''],
                [''],
                [''],
                [new Column(0, '<UTC/DATE INIT', Column.inop)],
            ]));
        };

        updateView();

        mcdu.leftInputDelay[2] = () => mcdu.getDelaySwitchPage();
        mcdu.onLeftInput[2] = () => {
            CDU_CMS_AvionicsMenu.ShowPage(mcdu);
        };

        mcdu.onNextPage = () => {
            this.selectedPrint = !this.selectedPrint;
        };
    }
}
