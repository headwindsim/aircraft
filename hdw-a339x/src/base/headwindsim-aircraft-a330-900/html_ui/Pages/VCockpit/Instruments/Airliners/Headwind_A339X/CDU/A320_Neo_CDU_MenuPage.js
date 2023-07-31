class CDUMenuPage {
    static ShowPage(mcdu) {
        mcdu.clearDisplay();
        mcdu.page.Current = mcdu.page.MenuPage;
        // The MCDU MENU does not maintain an editable scratchpad... subsystems and the backup nav do that.
        mcdu.activateMcduScratchpad();

        const fmActive = mcdu.activeSystem === "FMGEC";
        const atsuActive = mcdu.activeSystem === "ATSU";
        const acarsActive = mcdu.activeSystem === "ACARS";
        const acmsActive = mcdu.activeSystem === "ACMS";
        const cmsActive = mcdu.activeSystem === "CMS";
        const satActive = mcdu.activeSystem === "SAT";

        // delay to get text and draw already connected subsystem page
        const connectedSubsystemDelay = 200;
        // delay to establish initial communication with disconnect systems on low speed ports
        const disconnectedSubsystemDelay = Math.floor(Math.random() * 800) + 500;

        /**
         * Updates the page text.
         * @param {"FMGEC" | "ATSU" | "ACARS" | "ACMS" | "CMS" | "SAT" | null} selectedSystem Newly selected system establishing comms, or null if none.
         */
        const updateView = (selectedSystem = null) => {
            const getText = (name, isRequesting = false, isLeft = true) => {
                let flag = null;
                if (selectedSystem !== null) {
                    if (selectedSystem === name) {
                        flag = "(SEL)";
                    }
                } else if (isRequesting) {
                    flag = "(REQ)";
                }
                if (isLeft) {
                    return `${name}\xa0${flag !== null ? flag : ""}`;
                } else {
                    return `${flag !== null ? flag : ""}\xa0${name}`;
                }
            };
            const getColor = (isActive, isSelected) => isSelected ? Column.cyan : (isActive && selectedSystem === null ? Column.green : Column.white);

            mcdu.setTemplate(FormatTemplate([
                [new Column(7, "MCDU MENU")],
                [new Column(22, "SELECT", Column.right, Column.inop)],
                [
                    new Column(0, getText("<FM1", mcdu.isSubsystemRequesting("FMGEC")), getColor(fmActive, selectedSystem === "FMGEC")),
                    new Column(23, "NAV B/UP>", Column.right, Column.inop)
                ],
                [""],
                [new Column(0, getText("<ACARS", mcdu.isSubsystemRequesting("ACARS")), getColor(acarsActive, selectedSystem === "ACARS"))],
                [""],
                [new Column(0, getText("<ACMS", mcdu.isSubsystemRequesting("ACMS")), getColor(acmsActive, selectedSystem === "ACMS"))],
                [""],
                [new Column(0, getText("<CMS", mcdu.isSubsystemRequesting("CMS")), getColor(cmsActive, selectedSystem === "CMS"))],
                [""],
                [new Column(0, getText("<SAT", mcdu.isSubsystemRequesting("SAT")), getColor(satActive, selectedSystem === "SAT"))],
                [""],
                [new Column(0, getText("<ATSU", mcdu.isSubsystemRequesting("ATSU")), getColor(atsuActive, selectedSystem === "ATSU"))],
            ]));
        };

        updateView();

        mcdu.mcduScratchpad.setMessage(NXSystemMessages.selectDesiredSystem);

        mcdu.onLeftInput[0] = () => {
            mcdu.mcduScratchpad.setMessage(NXSystemMessages.waitForSystemResponse);
            updateView("FMGEC");

            setTimeout(() => {
                mcdu.mcduScratchpad.removeMessage(NXSystemMessages.waitForSystemResponse.text);
                CDUIdentPage.ShowPage(mcdu);
            }, connectedSubsystemDelay); // FMGECs are on high-speed port... always fast
        };

        mcdu.onLeftInput[1] = () => {
            mcdu.mcduScratchpad.setMessage(NXSystemMessages.waitForSystemResponse);
            updateView("ACARS");
            setTimeout(() => {
                mcdu.mcduScratchpad.removeMessage(NXSystemMessages.waitForSystemResponse.text);
                CDU_ACARS_MenuPage.ShowPage1(mcdu);
            }, acarsActive ? connectedSubsystemDelay : disconnectedSubsystemDelay);
        };

        mcdu.onLeftInput[2] = () => {
            mcdu.mcduScratchpad.setMessage(NXSystemMessages.waitForSystemResponse);
            updateView("ACMS");
            setTimeout(() => {
                mcdu.mcduScratchpad.removeMessage(NXSystemMessages.waitForSystemResponse.text);
                CDU_CMS_ACMS_Menu.ShowPage(mcdu);
            }, acmsActive ? connectedSubsystemDelay : disconnectedSubsystemDelay);
        };

        mcdu.onLeftInput[3] = () => {
            mcdu.mcduScratchpad.setMessage(NXSystemMessages.waitForSystemResponse);
            updateView("CMS");
            setTimeout(() => {
                mcdu.mcduScratchpad.removeMessage(NXSystemMessages.waitForSystemResponse.text);
                CDU_CMS_MenuPage.ShowPage1(mcdu);
            }, cmsActive ? connectedSubsystemDelay : disconnectedSubsystemDelay);
        };

        mcdu.onLeftInput[4] = () => {
            mcdu.mcduScratchpad.setMessage(NXSystemMessages.waitForSystemResponse);
            updateView("SAT");
            setTimeout(() => {
                mcdu.mcduScratchpad.removeMessage(NXSystemMessages.waitForSystemResponse.text);
                CDU_SAT_Menu.ShowPage(mcdu);
            }, satActive ? connectedSubsystemDelay : disconnectedSubsystemDelay);
        };

        mcdu.onLeftInput[5] = () => {
            mcdu.mcduScratchpad.setMessage(NXSystemMessages.waitForSystemResponse);
            updateView("ATSU");
            setTimeout(() => {
                mcdu.mcduScratchpad.removeMessage(NXSystemMessages.waitForSystemResponse.text);
                CDUAtsuMenu.ShowPage(mcdu);
            }, atsuActive ? connectedSubsystemDelay : disconnectedSubsystemDelay);
        };
    }
}
