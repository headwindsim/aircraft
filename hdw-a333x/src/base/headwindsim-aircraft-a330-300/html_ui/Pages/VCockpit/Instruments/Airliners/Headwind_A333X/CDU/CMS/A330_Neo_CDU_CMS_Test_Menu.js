class CDU_CMS_TestMenu {
    static ShowPage1(mcdu) {
        mcdu.clearDisplay();
        mcdu.page.Current = mcdu.page.MenuPage;
        const activeSystem = mcdu.activeSystem;

        let selectedReturn = false;

        const updateView = () => {
            const getColor = (system, isSelected) => isSelected ? Column.cyan : system === activeSystem ? Column.green : Column.white;

            mcdu.setTemplate(FormatTemplate([
                [new Column(1, "SYSTEM REPORT/TEST 1/6")],
                [new Column(5, "ATA:21 AIRCOND")],
                [
                    new Column(0, "<AVNCS VENT"),
                    new Column(23, "TEMP REGUL>", Column.right)
                ],
                [""],
                [
                    new Column(0, "<CARG VENT"),
                    new Column(23, "PRESS>", Column.right)
                ],
                [new Column(5, "ATA:22 AFS")],
                [
                    new Column(0, "<AP", Column.inop),
                    new Column(23, "FD>", Column.inop, Column.right)
                ],
                [""],
                [
                    new Column(0, "<SPEED LIMIT", Column.inop),
                    new Column(23, "FM>", Column.inop, Column.right)
                ],
                [""],
                [
                    new Column(0, "<WIND SHEAR", Column.inop),
                    new Column(23, "A-THR>", Column.inop, Column.right)
                ],
                [""],
                [new Column(0, "<RETURN", getColor("RETURN", selectedReturn))],
            ]));
        };

        updateView();

        mcdu.onUp = () => {
            this.ShowPage6(mcdu);
        };
        mcdu.onDown = () => {
            this.ShowPage2(mcdu);
        };

        mcdu.leftInputDelay[0] = () => {
            return mcdu.getDelaySwitchPage();
        };
        mcdu.onLeftInput[0] = () => {
            CDU_CMS_Test_Aircond_AEVC_Menu.ShowPage(mcdu);
        };

        mcdu.leftInputDelay[1] = () => {
            return mcdu.getDelaySwitchPage();
        };
        mcdu.onLeftInput[1] = () => {
            CDU_CMS_Test_Aircond_VC_Menu.ShowPage(mcdu);
        };

        mcdu.leftInputDelay[5] = () => {
            return mcdu.getDelaySwitchPage();
        };
        mcdu.onLeftInput[5] = () => {
            CDU_CMS_MenuPage.ShowPage1(mcdu);
        };

        mcdu.rightInputDelay[0] = () => {
            return mcdu.getDelaySwitchPage();
        };
        mcdu.onRightInput[0] = () => {
            CDU_CMS_Test_Aircond_ECS_Menu.ShowPage(mcdu);
        };

        mcdu.rightInputDelay[1] = () => {
            return mcdu.getDelaySwitchPage();
        };
        mcdu.onRightInput[1] = () => {
            CDU_CMS_Test_Aircond_CPC.ShowPage(mcdu);
        };
    }

    static ShowPage2(mcdu) {
        mcdu.clearDisplay();
        mcdu.page.Current = mcdu.page.MenuPage;
        const activeSystem = mcdu.activeSystem;

        let selectedReturn = false;

        const updateView = () => {
            const getColor = (system, isSelected) => isSelected ? Column.cyan : system === activeSystem ? Column.green : Column.white;

            mcdu.setTemplate(FormatTemplate([
                [new Column(1, "SYSTEM REPORT/TEST 2/6")],
                [new Column(5, "ATA:23 COM")],
                [
                    new Column(0, "<RADIO", Column.inop),
                    new Column(23, "CABIN>", Column.inop, Column.right)
                ],
                [""],
                [new Column(0, "<EMERG & DISPLAY LIGHTS", Column.inop)],
                [new Column(5, "ATA:24 ELEC")],
                [
                    new Column(0, "<AC"),
                    new Column(6, "GENERATION"),
                    new Column(23, "DC>", Column.right)
                ],
                [new Column(5, "ATA:26 FIRE PROT")],
                [
                    new Column(0, "<ENGINES", Column.inop),
                    new Column(23, "SMOKE/LAV>", Column.inop, Column.right)
                ],
                [new Column(5, "ATA:27 F/CTRL")],
                [
                    new Column(0, "<FLAP/SLAT", Column.inop),
                    new Column(23, "ELEC FLIGHT>", Column.inop, Column.right)
                ],
                [new Column(13, "CTL SYS")],
                [new Column(0, "<RETURN", getColor("RETURN", selectedReturn))],
            ]));
        };

        updateView();

        mcdu.onUp = () => {
            this.ShowPage1(mcdu);
        };
        mcdu.onDown = () => {
            this.ShowPage3(mcdu);
        };

        mcdu.leftInputDelay[2] = () => {
            return mcdu.getDelaySwitchPage();
        };
        mcdu.onLeftInput[2] = () => {
            CDU_CMS_Test_Elec_AC_Menu.ShowPage(mcdu);
        };

        mcdu.leftInputDelay[5] = () => {
            return mcdu.getDelaySwitchPage();
        };
        mcdu.onLeftInput[5] = () => {
            CDU_CMS_MenuPage.ShowPage1(mcdu);
        };

        mcdu.rightInputDelay[2] = () => {
            return mcdu.getDelaySwitchPage();
        };
        mcdu.onRightInput[2] = () => {
            CDU_CMS_Test_Elec_DC_Menu.ShowPage(mcdu);
        };
    }

    static ShowPage3(mcdu) {
        mcdu.clearDisplay();
        mcdu.page.Current = mcdu.page.MenuPage;
        const activeSystem = mcdu.activeSystem;

        let selectedReturn = false;

        const updateView = () => {
            const getColor = (system, isSelected) => isSelected ? Column.cyan : system === activeSystem ? Column.green : Column.white;

            mcdu.setTemplate(FormatTemplate([
                [new Column(1, "SYSTEM REPORT/TEST 3/6")],
                [new Column(5, "ATA:28 FUEL")],
                [new Column(0, "<FUEL CTL MONG SYS")],
                [new Column(5, "ATA:29 HYD")],
                [new Column(0, "<HYD SYS MONG UNIT", Column.inop)],
                [new Column(5, "ATA:30 ICE")],
                [
                    new Column(0, "<WINDOWW", Column.inop),
                    new Column(23, "PROBES>", Column.inop, Column.right)
                ],
                [new Column(5, "ATA:31 INST")],
                [
                    new Column(0, "<DISPLAY"),
                    new Column(23, "WARNING>", Column.right)
                ],
                [""],
                [new Column(0, "<RECORDER")],
                [""],
                [new Column(0, "<RETURN", getColor("RETURN", selectedReturn))],
            ]));
        };

        updateView();

        mcdu.onUp = () => {
            this.ShowPage2(mcdu);
        };
        mcdu.onDown = () => {
            this.ShowPage4(mcdu);
        };

        mcdu.leftInputDelay[0] = () => {
            return mcdu.getDelaySwitchPage();
        };
        mcdu.onLeftInput[0] = () => {
            CDU_CMS_Test_Fuel_Menu.ShowPage(mcdu);
        };

        mcdu.leftInputDelay[3] = () => {
            return mcdu.getDelaySwitchPage();
        };
        mcdu.onLeftInput[3] = () => {
            CDU_CMS_Test_Inst_Display.ShowPage(mcdu);
        };

        mcdu.leftInputDelay[4] = () => {
            return mcdu.getDelaySwitchPage();
        };
        mcdu.onLeftInput[4] = () => {
            CDU_CMS_Test_Inst_Recorder.ShowPage(mcdu);
        };

        mcdu.leftInputDelay[5] = () => {
            return mcdu.getDelaySwitchPage();
        };
        mcdu.onLeftInput[5] = () => {
            CDU_CMS_MenuPage.ShowPage1(mcdu);
        };

        mcdu.rightInputDelay[3] = () => {
            return mcdu.getDelaySwitchPage();
        };
        mcdu.onRightInput[3] = () => {
            CDU_CMS_Test_Inst_Warning.ShowPage(mcdu);
        };
    }

    static ShowPage4(mcdu) {
        mcdu.clearDisplay();
        mcdu.page.Current = mcdu.page.MenuPage;
        const activeSystem = mcdu.activeSystem;

        let selectedReturn = false;

        const updateView = () => {
            const getColor = (system, isSelected) => isSelected ? Column.cyan : system === activeSystem ? Column.green : Column.white;

            mcdu.setTemplate(FormatTemplate([
                [new Column(1, "SYSTEM REPORT/TEST 4/6")],
                [new Column(5, "ATA:32 L/G")],
                [
                    new Column(0, "<STEERING", Column.inop),
                    new Column(23, "EXT/RETR>", Column.inop, Column.right)
                ],
                [""],
                [
                    "",
                    new Column(23, "BRAKING>", Column.inop, Column.right)
                ],
                [new Column(5, "ATA:34 NAV")],
                [
                    new Column(0, "<ALTITUDE", Column.inop),
                    new Column(23, "SPEED/TEMP>", Column.inop, Column.right)
                ],
                [""],
                [
                    new Column(0, "<RADIO NAV", Column.inop),
                    new Column(23, "ATTITUDE>", Column.inop, Column.right)
                ],
                [""],
                [""],
                [""],
                [new Column(0, "<RETURN", getColor("RETURN", selectedReturn))],
            ]));
        };

        updateView();

        mcdu.onUp = () => {
            this.ShowPage3(mcdu);
        };
        mcdu.onDown = () => {
            this.ShowPage5(mcdu);
        };

        mcdu.leftInputDelay[5] = () => {
            return mcdu.getDelaySwitchPage();
        };
        mcdu.onLeftInput[5] = () => {
            CDU_CMS_MenuPage.ShowPage1(mcdu);
        };
    }

    static ShowPage5(mcdu) {
        mcdu.clearDisplay();
        mcdu.page.Current = mcdu.page.MenuPage;
        const activeSystem = mcdu.activeSystem;

        let selectedReturn = false;

        const updateView = () => {
            const getColor = (system, isSelected) => isSelected ? Column.cyan : system === activeSystem ? Column.green : Column.white;

            mcdu.setTemplate(FormatTemplate([
                [new Column(1, "SYSTEM REPORT/TEST 5/6")],
                [new Column(5, "ATA:36 AIR BLEED")],
                [new Column(0, "<LEAK DETECTION", Column.inop)],
                [new Column(1, "PR/TEMPS", Column.inop)],
                [new Column(0, "<REGULATION CROSS FEED", Column.inop)],
                [new Column(5, "ATA:38 WATER/WASTE")],
                [new Column(0, "<TOILETS", Column.inop)],
                [new Column(5, "ATA:45 MAINTENANCE")],
                [new Column(0, "<ON BOARD MAINT SYSTEM", Column.inop)],
                [new Column(5, "ATA:49 APU")],
                [new Column(0, "<ENGINE CTL BOX", Column.inop)],
                [""],
                [new Column(0, "<RETURN", getColor("RETURN", selectedReturn))],
            ]));
        };

        updateView();

        mcdu.onUp = () => {
            this.ShowPage4(mcdu);
        };
        mcdu.onDown = () => {
            this.ShowPage6(mcdu);
        };

        mcdu.leftInputDelay[5] = () => {
            return mcdu.getDelaySwitchPage();
        };
        mcdu.onLeftInput[5] = () => {
            CDU_CMS_MenuPage.ShowPage1(mcdu);
        };
    }

    static ShowPage6(mcdu) {
        mcdu.clearDisplay();
        mcdu.page.Current = mcdu.page.MenuPage;
        const activeSystem = mcdu.activeSystem;

        let selectedReturn = false;

        const updateView = () => {
            const getColor = (system, isSelected) => isSelected ? Column.cyan : system === activeSystem ? Column.green : Column.white;

            mcdu.setTemplate(FormatTemplate([
                [new Column(1, "SYSTEM REPORT/TEST 6/6")],
                [new Column(5, "ATA:52 DOORS")],
                [new Column(0, "<PROXIMITY SWITCH CTL UT", Column.inop)],
                [new Column(5, "ATA:70-80 ENG")],
                [
                    new Column(0, "<VIBRATION", Column.inop),
                    new Column(23, "START/IGNIT>", Column.inop, Column.right)
                ],
                [""],
                [
                    new Column(0, "<INTERFACE", Column.inop),
                    new Column(23, "INDICATING>", Column.inop, Column.right)
                ],
                [""],
                [new Column(0, "<FADEC STATUS REVERSERS", Column.inop)],
                [""],
                [
                    new Column(0, "<OTHERS", Column.inop),
                    new Column(23, "AUTO THRUST>", Column.inop, Column.right)
                ],
                [""],
                [new Column(0, "<RETURN", getColor("RETURN", selectedReturn))],
            ]));
        };

        updateView();

        mcdu.onUp = () => {
            this.ShowPage5(mcdu);
        };
        mcdu.onDown = () => {
            this.ShowPage1(mcdu);
        };

        mcdu.leftInputDelay[5] = () => {
            return mcdu.getDelaySwitchPage();
        };
        mcdu.onLeftInput[5] = () => {
            CDU_CMS_MenuPage.ShowPage1(mcdu);
        };
    }
}
