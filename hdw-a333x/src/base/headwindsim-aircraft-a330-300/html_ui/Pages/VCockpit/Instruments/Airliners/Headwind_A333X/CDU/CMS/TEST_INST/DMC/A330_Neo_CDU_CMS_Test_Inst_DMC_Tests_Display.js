class CDU_CMS_Test_Inst_DMC_Tests_Display {
    static ShowPage(mcdu, dmcIndex) {
        mcdu.clearDisplay();
        SimVar.SetSimVarValue(`L:A32NX_DMC_DISPLAYTEST:${dmcIndex}`, 'Enum', 2);
        const title = `DMC ${dmcIndex}`;
        mcdu.setTemplate([
            [title],
            [''],
            [''],
            [''],
            [''],
            [''],
            ['', '', 'DISPLAY TEST'],
            [''],
            ['', '', 'IN'],
            [''],
            ['', '', 'PROGRESS '],
            [''],
            ['<RETURN[color]cyan'],
        ]);

        mcdu.onUnload = () => SimVar.SetSimVarValue(`L:A32NX_DMC_DISPLAYTEST:${dmcIndex}`, 'Enum', 0);

        mcdu.leftInputDelay[5] = () => mcdu.getDelaySwitchPage();
        mcdu.onLeftInput[5] = () => {
            CDU_CMS_Test_Inst_DMC_Tests.ShowPage(mcdu, dmcIndex);
        };
    }
}
