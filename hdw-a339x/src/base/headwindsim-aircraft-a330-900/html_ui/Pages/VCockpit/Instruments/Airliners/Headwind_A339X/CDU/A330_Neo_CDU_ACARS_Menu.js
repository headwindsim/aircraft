class CDU_ACARS_MenuPage {
    static ShowPage1(mcdu) {
        mcdu.clearDisplay();
        mcdu.page.Current = mcdu.page.AcarsMenuPage;
        mcdu.activeSystem = "ACARS";

        const updateView = () => {
            mcdu.setTemplate(FormatTemplate([
                [new Column(1, "ACARS FUNCTION 1/2")],
                [
                    "",
                    new Column(23, "UPLINK", Column.right),
                ],
                [
                    new Column(7, "F-PLN INIT"),
                    new Column(23, mcdu.flightPlanRequestEnabled ? "REQ*" : "REQ ", Column.right)
                ],
                [""],
                [
                    new Column(7, "TO DATA", Column.inop),
                    new Column(23, "REQ*", Column.right, Column.inop)
                ],
                [""],
                [
                    new Column(7, "WIND DATA", Column.small),
                    new Column(23, mcdu.windRequestEnabled ? "REQ*" : "REQ ", Column.right)
                ],
                [""],
                [""],
                [""],
                [""],
                [
                    "",
                    new Column(23, "PRINT", Column.right)
                ],
                [
                    new Column(0, "<RETURN"),
                    new Column(23, "FUNCTION>", Column.right)
                ],
            ]));
        };

        updateView();

        mcdu.onPrevPage = () => {
            this.ShowPage2(mcdu);
        };
        mcdu.onNextPage = () => {
            this.ShowPage2(mcdu);
        };

        mcdu.onRightInput[0] = () => {
            if (mcdu.flightPlanRequestEnabled) {
                getSimBriefOfp(mcdu, () => {
                    CDU_ACARS_MenuPage.ShowPage1(mcdu)
                }).then(() => {
                    insertUplink(mcdu);
                });
                updateView();
            }
        };

        mcdu.onRightInput[2] = () => {
            if (mcdu.windRequestEnabled) {
                CDUWindPage.WindRequest(mcdu, CDU_ACARS_MenuPage.ShowPage1);
                updateView();
            }
        };
    }

    static ShowPage2(mcdu) {
        mcdu.clearDisplay();
        mcdu.page.Current = mcdu.page.MenuPage;

        const updateView = () => {
            mcdu.setTemplate(FormatTemplate([
                [new Column(1, "ACARS FUNCTION 2/2")],
                [
                    "",
                    new Column(23, "REPORT", Column.right),
                ],
                [
                    new Column(5, "F-PLN RPT"),
                    new Column(23, "SEND*", Column.right)
                ],
                [""],
                [
                    new Column(5, "POSITION RPT"),
                    new Column(23, "SEND*", Column.right)
                ],
                [""],
                [""],
                [""],
                [""],
                [""],
                [""],
                [
                    "",
                    new Column(23, "PRINT", Column.right)
                ],
                [
                    new Column(0, "<RETURN"),
                    new Column(23, "FUNCTION>", Column.right)
                ],
            ]));
        };

        updateView();

        mcdu.onPrevPage = () => {
            this.ShowPage1(mcdu);
        };
        mcdu.onNextPage = () => {
            this.ShowPage1(mcdu);
        };
    }
}
