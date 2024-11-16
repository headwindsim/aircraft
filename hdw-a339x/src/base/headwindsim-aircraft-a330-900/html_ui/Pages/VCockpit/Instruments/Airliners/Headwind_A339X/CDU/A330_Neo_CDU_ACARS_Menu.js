class CDU_ACARS_MenuPage {
    static ShowPage1(mcdu) {
        mcdu.clearDisplay();
        mcdu.page.Current = mcdu.page.AcarsMenuPage;
        mcdu.activeSystem = "ACARS";
        let requestEnable = false;

        if (mcdu.simbrief.sendStatus === "REQUESTING") {
            requestEnable = false;
        }

        /*
        if (mcdu.flightPlanManager.getPersistentOrigin() && mcdu.flightPlanManager.getPersistentOrigin().ident) {
            if (mcdu.flightPlanManager.getDestination() && mcdu.flightPlanManager.getDestination().ident) {
                if (mcdu.simbrief.sendStatus != "DONE" ||
                    (mcdu.simbrief["originIcao"] === mcdu.flightPlanManager.getPersistentOrigin().ident && mcdu.simbrief["destinationIcao"] === mcdu.flightPlanManager.getDestination().ident)) {
                    requestEnable = false;
                }
            }
        }
            */

        const updateView = () => {
            mcdu.setTemplate(FormatTemplate([
                [new Column(1, "ACARS FUNCTION 1/2")],
                [
                    "",
                    new Column(23, "UPLINK", Column.right, Column.inop),
                ],
                [
                    new Column(7, "F-PLN INIT", Column.inop),
                    new Column(23, requestEnable ? "REQ*" : "REQ ", Column.right, Column.inop)
                ],
                [""],
                [
                    new Column(7, "TO DATA", Column.inop),
                    new Column(23, "REQ*", Column.right, Column.inop)
                ],
                [""],
                [
                    new Column(7, "WIND DATA", Column.small, Column.inop),
                    new Column(23, mcdu.windRequestEnabled ? "REQ*" : "REQ ", Column.right, Column.inop)
                ],
                [""],
                [""],
                [""],
                [""],
                [
                    "",
                    new Column(23, "PRINT", Column.right, Column.inop)
                ],
                [
                    new Column(0, "<RETURN", Column.inop),
                    new Column(23, "FUNCTION>", Column.right, Column.inop)
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
    }

    static ShowPage2(mcdu) {
        mcdu.clearDisplay();
        mcdu.page.Current = mcdu.page.MenuPage;

        const updateView = () => {
            mcdu.setTemplate(FormatTemplate([
                [new Column(1, "ACARS FUNCTION 2/2")],
                [
                    "",
                    new Column(23, "REPORT", Column.right, Column.inop),
                ],
                [
                    new Column(5, "F-PLN RPT", Column.inop),
                    new Column(23, "SEND*", Column.right, Column.inop)
                ],
                [""],
                [
                    new Column(5, "POSITION RPT", Column.inop),
                    new Column(23, "SEND*", Column.right, Column.inop)
                ],
                [""],
                [""],
                [""],
                [""],
                [""],
                [""],
                [
                    "",
                    new Column(23, "PRINT", Column.right, Column.inop)
                ],
                [
                    new Column(0, "<RETURN", Column.inop),
                    new Column(23, "FUNCTION>", Column.right, Column.inop)
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
