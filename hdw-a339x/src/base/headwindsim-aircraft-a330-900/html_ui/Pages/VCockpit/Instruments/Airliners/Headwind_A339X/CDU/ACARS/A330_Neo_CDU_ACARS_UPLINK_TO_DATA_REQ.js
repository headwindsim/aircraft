class CDU_ACARS_UPLINK_TO_DATA_REQ_Page {
    static ShowPage1(mcdu) {
        mcdu.clearDisplay();
        mcdu.page.Current = mcdu.page.ACARSUplinkToDataReq1;
        let requestEnable = false;

        mcdu.setArrows(false, false, false, true);

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

        // check if we even have an airport
        const targetPlan = mcdu.flightPlanService.active;
        const hasOrigin = !!targetPlan.originAirport;

        // runway
        let runway = "";
        let hasRunway = false;
        if (hasOrigin) {
            const runwayObj = targetPlan.originRunway;

            if (runwayObj) {
                runway = Fmgc.RunwayUtils.runwayString(runwayObj.ident);
                hasRunway = true;
            }
        }

        let towCell = "---.-";
        if (isFinite(mcdu.taxiFuelWeight) && isFinite(mcdu.zeroFuelWeight) && isFinite(mcdu.blockFuel)) {
            const takeOffWeight = mcdu.zeroFuelWeight + mcdu.blockFuel - mcdu.taxiFuelWeight;
            towCell = `${NXUnits.kgToUser(takeOffWeight).toFixed(1)}`;
        }

        let tempCell = "{cyan}[\xa0]°{end}";
        /* TODO: ADD STORE FOR TEMP
        if (isFinite(mcdu.perfApprTemp)) {
            tempCell = "{cyan}" + (mcdu.perfApprTemp >= 0 ? "+" : "-") + ("" + Math.abs(mcdu.perfApprTemp).toFixed(0)).padStart(2).replace(/ /g, "\xa0") + "°{end}";
        }
        */

        let qnhCell = "[\xa0\xa0][color]cyan";
        /* TODO: ADD STORE FOR QNH
        if (isFinite(mcdu.perfApprQNH)) {
            if (mcdu.perfApprQNH < 500) {
                qnhCell = mcdu.perfApprQNH.toFixed(2) + "[color]cyan";
            } else {
                qnhCell = mcdu.perfApprQNH.toFixed(0) + "[color]cyan";
            }
        }
        */

        let magWindHeadingCell = "{cyan}000{end}";
        /* TODO: ADD STORE FOR MAGWIND HEADING
        if (isFinite(mcdu.perfApprWindHeading)) {
            magWindHeadingCell = "{green}" + ("" + mcdu.perfApprWindHeading.toFixed(0)).padStart(3, 0) + "{end}";
        }
        */

        let magWindSpeedCell = "{cyan}000{end}";
        /* TODO: ADD STORE FOR MAGWIND SPEED
        if (isFinite(mcdu.perfApprWindSpeed)) {
            magWindSpeedCell = mcdu.perfApprWindSpeed.toFixed(0).padStart(3, "0");
        }
        */

        let contamCell = "{cyan}DRY{end}";
        /* TODO: ADD STORE CONTAM
        if (isFinite(mcdu.perfApprWindSpeed)) {
            magWindSpeedCell = mcdu.perfApprWindSpeed.toFixed(0).padStart(3, "0");
        }
        */

        let toLimitCell = "{cyan}[\xa0]{end}";
        /* TODO: ADD STORE FOR TO LIMIT SPEED
        if (isFinite(mcdu.perfApprWindSpeed)) {
            magWindSpeedCell = mcdu.perfApprWindSpeed.toFixed(0).padStart(3, "0");
        }
        */

        // flaps / trim horizontal stabilizer
        let flapsThs = "[]/[\xa0\xa0\xa0][color]cyan";
        // The following line uses a special Javascript concept that is signed
        // zeroes. In Javascript -0 is strictly equal to 0, so for most cases we
        // don't care about that difference. But here, we use that fact to show
        // the pilot the precise value they entered: DN0.0 or UP0.0. The only
        // way to figure that difference out is using Object.is, as
        // Object.is(+0, -0) returns false. Alternatively we could use a helper
        // variable (yuck) or encode it using a very small, but negative value
        // such as -0.001.
        const formattedThs = mcdu.ths !== null
            ? (mcdu.ths >= 0 && !Object.is(mcdu.ths, -0) ? `UP${Math.abs(mcdu.ths).toFixed(1)}` : `DN${Math.abs(mcdu.ths).toFixed(1)}`)
            : '';
        if (mcdu.flightPhaseManager.phase < FmgcFlightPhases.TAKEOFF) {
            const flaps = mcdu.flaps !== null ? mcdu.flaps : "[]";
            const ths = formattedThs ? formattedThs : "[\xa0\xa0\xa0]";
            flapsThs = `${flaps}/${ths}[color]cyan`;
        } else {
            const flaps = mcdu.flaps !== null ? mcdu.flaps : "";
            const ths = formattedThs ? formattedThs : "\xa0\xa0\xa0\xa0\xa0";
            flapsThs = `${flaps}/${ths}[color]green`;
        }

        // flex takeoff temperature
        let flexTakeOffTempCell = "[\xa0\xa0]°[color]cyan";
        if (isFinite(mcdu.perfTOTemp)) {
            if (mcdu._toFlexChecked) {
                flexTakeOffTempCell = `${mcdu.perfTOTemp.toFixed(0)}°[color]cyan`;
            } else {
                flexTakeOffTempCell = `{small}${mcdu.perfTOTemp.toFixed(0)}{end}${flexTakeOffTempCell}[color]cyan`;
            }
        }

        const updateView = () => {
            mcdu.setTemplate([
                ["UPLINK TO DATA REQ {small}1/2{end}"],
                ["{small}TOW/TOCG{end}", "{small}SHIFT/RWY{end}"],
                [hasRunway ? `{green}${towCell}/${mcdu.getCG().toFixed(1)}{end}` : "---.-/--.-", hasRunway ? `FT{inop}[  ]{end}{cyan}/${runway}{end}` : `-----{cyan}/[  ]{end}`],
                ["{small}TEMP/QNH{end}", "{small}TO LIMIT{end}"],
                [hasRunway ? `${tempCell}/${qnhCell}` : "---°/-----", hasRunway ? `FT ${toLimitCell}` : "------"],
                ["{small}MAG/WIND{end}", "{small}FLAPS/THS{end}"],
                [hasRunway ? `${magWindHeadingCell}°/${magWindSpeedCell}` : "---°/---", hasRunway ? flapsThs : "--/-----"],
                ["{small}CONTAM↓↑{end}", "{small}FLEX TO TEMP{end}"],
                [hasRunway ? contamCell : "---------", hasRunway ? flexTakeOffTempCell : "---°"],
                [],
                [],
                ["{small}RECEIVED{end}", "{amber}{small}TO DATA{end}{end}"],
                ["<TO DATA", "{amber}REQUEST*{end}"],
            ]);
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
        mcdu.page.Current = mcdu.page.ACARSUplinkToDataReq2;
        mcdu.setArrows(false, false, true, false);

        const updateView = () => {
            mcdu.setTemplate([
                ["UPLINK TO DATA REQ 2/2"],
                ["{small}TOW/TOCG{end}", "{small}SHIFT/RWY{end}"],
                ["---.-/--.-", "-----/{cyan}[  ]{end}"],
                ["{small}TEMP/QNH{end}", "{small}TO LIMIT{end}"],
                ["---°/-----", "------"],
                ["{small}MAG/WIND{end}", "{small}FLAPS/THS{end}"],
                ["---°/---", "--/-----"],
                ["{small}CONTAM↓↑{end}", "{small}FLEX TO TEMP{end}"],
                ["---------", "---°"],
                [],
                [],
                ["{small}RECEIVED{end}", "{small}TO DATA{end}"],
                ["<TO DATA", "REQUEST*"],
            ]);
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
