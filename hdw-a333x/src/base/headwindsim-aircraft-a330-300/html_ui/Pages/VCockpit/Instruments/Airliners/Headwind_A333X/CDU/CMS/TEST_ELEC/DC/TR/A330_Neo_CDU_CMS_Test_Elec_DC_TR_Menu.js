class CDU_CMS_Test_Elec_DC_TR_Menu {
    static ShowPage(mcdu) {
        mcdu.clearDisplay();
        mcdu.setTemplate([
            ['TR'],
            [''],
            ['<TR 1'],
            [''],
            ['<TR 2'],
            [''],
            ['<TR ESS'],
            [''],
            ['<TR APU'],
            [''],
            [''],
            [''],
            ['<RETURN[color]cyan'],
        ]);

        mcdu.leftInputDelay[0] = () => mcdu.getDelaySwitchPage();
        mcdu.onLeftInput[0] = () => {
            CDU_CMS_Test_Elec_DC_TR_Menu.ShowSubPage(mcdu, 1);
        };
        mcdu.leftInputDelay[1] = () => mcdu.getDelaySwitchPage();
        mcdu.onLeftInput[1] = () => {
            CDU_CMS_Test_Elec_DC_TR_Menu.ShowSubPage(mcdu, 2);
        };
        mcdu.leftInputDelay[2] = () => mcdu.getDelaySwitchPage();
        mcdu.onLeftInput[2] = () => {
            CDU_CMS_Test_Elec_DC_TR_Menu.ShowSubPage(mcdu, 'ESS');
        };
        mcdu.leftInputDelay[3] = () => mcdu.getDelaySwitchPage();
        mcdu.onLeftInput[3] = () => {
            CDU_CMS_Test_Elec_DC_TR_Menu.ShowSubPage(mcdu, 'APU');
        };
        mcdu.leftInputDelay[5] = () => mcdu.getDelaySwitchPage();
        mcdu.onLeftInput[5] = () => {
            CDU_CMS_Test_Elec_DC_Menu.ShowPage(mcdu);
        };
    }

    static ShowSubPage(mcdu, subPage) {
        mcdu.clearDisplay();
        const title = `TR ${subPage}`;
        mcdu.setTemplate([
            [title],
            [''],
            ['', `${title} RESET>`],
            [''],
            [''],
            [''],
            [''],
            [''],
            [''],
            [''],
            [''],
            [''],
            ['<RETURN[color]cyan'],
        ]);

        mcdu.leftInputDelay[5] = () => mcdu.getDelaySwitchPage();
        mcdu.onLeftInput[5] = () => {
            CDU_CMS_Test_Elec_DC_TR_Menu.ShowPage(mcdu);
        };
    }
}
