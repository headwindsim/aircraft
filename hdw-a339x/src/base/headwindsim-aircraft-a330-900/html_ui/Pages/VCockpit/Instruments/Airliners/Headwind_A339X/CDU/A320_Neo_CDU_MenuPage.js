class CDUMenuPage {
    static ShowPage(mcdu) {
        mcdu.clearDisplay();
        mcdu.page.Current = mcdu.page.MenuPage;
        const activeSystem = mcdu.activeSystem;

        let selectedFM = false;
        let selectedACARS = false;
        let selectedACMS = false;
        let selectedCMS = false;
        let selectedSAT = false;
        let selectedATSU = false;

        const updateView = () => {
            const getText = (name, isSelected, extra = "", isLeft = true) => isSelected ? (isLeft ? name + " (SEL)" : "(SEL) " + name) : name + extra;
            const getColor = (system, isSelected) => isSelected ? Column.cyan : system === activeSystem ? Column.green : Column.white;

            mcdu.setTemplate(FormatTemplate([
                [new Column(7, "MCDU MENU")],
                [new Column(22, "SELECT", Column.right)],
                [
                    new Column(0, getText("<FM1", selectedFM, " (REQ)"), getColor("FMGC", selectedFM)),
                    new Column(23, "NAV B/UP>", Column.inop, Column.right)
                ],
                [""],
                [new Column(0, getText("<ACARS", selectedACARS), getColor("ACARS", selectedACARS))],
                [""],
                [new Column(0, getText("<ACMS", selectedACMS), getColor("ACMS", selectedACMS))],
                [""],
                [new Column(0, getText("<CMS", selectedCMS), getColor("CMS", selectedCMS))],
                [""],
                [new Column(0, getText("<SAT", selectedSAT), getColor("SAT", selectedSAT))],
                [""],
                [new Column(0, getText("<ATSU", selectedATSU), getColor("ATSU", selectedATSU))],
            ]));
        };

        updateView();

        mcdu.setScratchpadMessage(NXSystemMessages.selectDesiredSystem);

        mcdu.onLeftInput[0] = () => {
            mcdu.setScratchpadMessage(NXSystemMessages.waitForSystemResponse);
            selectedFM = true;
            updateView();
            setTimeout(() => {
                mcdu.removeScratchpadMessage(NXSystemMessages.waitForSystemResponse.text);
                CDUIdentPage.ShowPage(mcdu);
            }, Math.floor(Math.random() * 400) + 400);
        };

        mcdu.onLeftInput[1] = () => {
            mcdu.setScratchpadMessage(NXSystemMessages.waitForSystemResponse);
            selectedACARS = true;
            updateView();
            setTimeout(() => {
                mcdu.removeScratchpadMessage(NXSystemMessages.waitForSystemResponse.text);
                CDU_ACARS_MenuPage.ShowPage1(mcdu);
            }, Math.floor(Math.random() * 400) + 400);
        };

        mcdu.onLeftInput[2] = () => {
            mcdu.setScratchpadMessage(NXSystemMessages.waitForSystemResponse);
            selectedACMS = true;
            updateView();
            setTimeout(() => {
                mcdu.removeScratchpadMessage(NXSystemMessages.waitForSystemResponse.text);
                CDU_CMS_ACMS_Menu.ShowPage(mcdu);
            }, Math.floor(Math.random() * 400) + 200);
        };

        mcdu.onLeftInput[3] = () => {
            mcdu.setScratchpadMessage(NXSystemMessages.waitForSystemResponse);
            selectedCMS = true;
            updateView();
            setTimeout(() => {
                mcdu.removeScratchpadMessage(NXSystemMessages.waitForSystemResponse.text);
                CDU_CMS_MenuPage.ShowPage1(mcdu);
            }, Math.floor(Math.random() * 400) + 400);
        };

        mcdu.onLeftInput[4] = () => {
            mcdu.setScratchpadMessage(NXSystemMessages.waitForSystemResponse);
            selectedSAT = true;
            updateView();
            setTimeout(() => {
                mcdu.removeScratchpadMessage(NXSystemMessages.waitForSystemResponse.text);
                CDU_SAT_Menu.ShowPage(mcdu);
            }, Math.floor(Math.random() * 400) + 200);
        };

        mcdu.onLeftInput[5] = () => {
            mcdu.setScratchpadMessage(NXSystemMessages.waitForSystemResponse);
            selectedATSU = true;
            updateView();
            setTimeout(() => {
                mcdu.removeScratchpadMessage(NXSystemMessages.waitForSystemResponse.text);
                CDUAtsuMenu.ShowPage(mcdu);
            }, Math.floor(Math.random() * 400) + 200);
        };
    }
}
