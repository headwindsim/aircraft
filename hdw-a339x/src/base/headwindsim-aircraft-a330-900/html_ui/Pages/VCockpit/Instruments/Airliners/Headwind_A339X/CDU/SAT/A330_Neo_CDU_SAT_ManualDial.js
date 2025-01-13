class CDU_SAT_ManualDial {
    static ShowPage(mcdu) {
        mcdu.clearDisplay();
        mcdu.page.Current = mcdu.page.MenuPage;
        let phoneNumber = null;

        const [phoneNumberAction, phoneNumberText, phoneNumberColor] = new CDU_SingleValueField(mcdu,
            "string",
            phoneNumber ? "[" + phoneNumber + "]" : null,
            {
                clearable: true,
                emptyValue: "________________[color]amber",
                suffix: "[color]cyan",
                maxLength: 16
            },
            (value) => {
                if (value != null) {
                    phoneNumber = value;
                } else {
                    phoneNumber = null;
                }

                updateView();
            }
        ).getFieldAsColumnParameters();

        const updateView = () => {
            mcdu.setTemplate(FormatTemplate([
                [new Column(3, "SATCOM MANUAL DIAL")],
                [""],
                [""],
                [new Column(1, "PHONE NUMBER")],
                [new Column(1, phoneNumberText, phoneNumberColor)],
                [""],
                [""],
                [new Column(1, "SAT1/2")],
                [new Column(1, "1")],
                [new Column(1, "PRIORITY")],
                [new Column(1, "NON-SAFETY")],
                [""],
                [
                    new Column(0, "<RETURN", Column.cyan),
                    new Column(23, "PRE-SELECT*", Column.cyan, Column.right)
                ],
            ]));
        };

        updateView();

        mcdu.onLeftInput[1] = phoneNumberAction;

        mcdu.leftInputDelay[5] = () => {
            return mcdu.getDelaySwitchPage();
        };
        mcdu.onLeftInput[5] = () => {
            CDU_SAT_Menu.ShowPage(mcdu);
        };
    }
}
