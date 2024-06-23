class CDUWindPage {
    static Return() {}

    static ShowPage(mcdu) {
        CDUWindPage.ShowCLBPage(mcdu);
    }

    static ShowCLBPage(mcdu, offset = 0) {
        mcdu.clearDisplay();
        mcdu.page.Current = mcdu.page.ClimbWind;

        const template = [
            [new Column(7, 'CLIMB WIND')],

            [
                new Column(0, 'TRU WIND/ALT'),
                new Column(22, 'HISTORY', Column.right, Column.inop),
            ],
            [
                '',
                new Column(23, 'WIND>', Column.right, Column.inop),
            ],

            [
                '',
                CDUWindPage.HasUplinkWindData(mcdu.uplinkWinds.cruise)
                    ? new Column(22, 'INSERT', Column.cyan, Column.right)
                    : new Column(22, 'WIND', Column.amber, Column.right),
            ],
            [
                '',
                CDUWindPage.HasUplinkWindData(mcdu.uplinkWinds.cruise)
                    ? new Column(23, 'UPLINK*', Column.cyan, Column.right)
                    : new Column(23, mcdu.windRequestEnabled ? 'REQUEST*' : 'REQUEST ', Column.amber, Column.right),
            ],

            [''],
            [''],
            [''],
            [''],
            [
                '',
                new Column(22, 'NEXT', Column.right),
            ],
            [
                '',
                new Column(23, 'PHASE>', Column.right),
            ],
            [''],
            [
                new Column(0, '<RETURN'),
            ],
        ];

        mcdu.setTemplate(FormatTemplate(CDUWindPage.ShowWinds(template, mcdu, 'CLB', CDUWindPage.ShowCLBPage, offset, 5)));

        mcdu.onRightInput[4] = () => {
            CDUWindPage.ShowCRZPage(mcdu);
        };

        mcdu.onLeftInput[5] = () => {
            CDUWindPage.Return();
        };

        mcdu.onRightInput[1] = (value) => {
            if (CDUWindPage.HasUplinkWindData(mcdu.uplinkWinds.climb)) {
                if (value === FMCMainDisplay.clrValue) {
                    CDUWindPage.ClearUplinkWindData(mcdu, 'CLB', CDUWindPage.ShowCLBPage);
                    return;
                }

                CDUWindPage.InsertUplinkWindData(mcdu, 'CLB', CDUWindPage.ShowCLBPage);
            } else if (mcdu.windRequestEnabled) {
                CDUWindPage.WindRequest(mcdu, CDUWindPage.ShowCLBPage);
            }
        };
    }

    static ShowCRZPage(mcdu, offset = 0) {
        mcdu.clearDisplay();
        mcdu.page.Current = mcdu.page.CruiseWind;

        let waypoint = null;

        const activeWaypoint = mcdu.flightPlanManager.getActiveWaypoint();
        if (activeWaypoint) {
            waypoint = mcdu.simbrief.navlog.find((val) => val.stage === 'CRZ' && val.ident === activeWaypoint.ident);
            if (waypoint) {
                CDUWindPage.ShowWPTPage(mcdu, waypoint.ident);
                return;
            }
        }

        waypoint = mcdu.simbrief.navlog.find((val) => val.stage === 'CRZ');
        if (waypoint) {
            CDUWindPage.ShowWPTPage(mcdu, waypoint.ident);
            return;
        }

        const template = [
            [new Column(7, 'CRUISE WIND')],
            [
                new Column(0, 'TRU WIND/WPT'),
                new Column(22, 'CRZ FL', Column.right),
            ],
            [
                '',
                new Column(22, 'FL330', Column.right),
            ],

            [
                '',
                CDUWindPage.HasUplinkWindData(mcdu.uplinkWinds.cruise)
                    ? new Column(22, 'INSERT', Column.cyan, Column.right)
                    : new Column(22, 'WIND', Column.amber, Column.right),
            ],
            [
                '',
                CDUWindPage.HasUplinkWindData(mcdu.uplinkWinds.cruise)
                    ? new Column(23, 'UPLINK*', Column.cyan, Column.right)
                    : new Column(23, mcdu.windRequestEnabled ? 'REQUEST*' : 'REQUEST ', Column.amber, Column.right),
            ],

            [''],
            [''],

            [
                '',
                new Column(22, 'PREV', Column.right),
            ],
            [
                '',
                new Column(23, 'PHASE>', Column.right),
            ],
            [
                '',
                new Column(22, 'NEXT', Column.right),
            ],
            [
                '',
                new Column(23, 'PHASE>', Column.right),
            ],
            [''],
            [
                new Column(0, '<RETURN'),
            ],
        ];

        mcdu.setTemplate(FormatTemplate(CDUWindPage.ShowWinds(template, mcdu, 'CRZ', CDUWindPage.ShowCRZPage, offset, 5)));

        mcdu.onRightInput[3] = () => {
            CDUWindPage.ShowCLBPage(mcdu);
        };
        mcdu.onRightInput[4] = () => {
            CDUWindPage.ShowDESPage(mcdu);
        };

        mcdu.onLeftInput[5] = () => {
            CDUWindPage.Return();
        };

        mcdu.onRightInput[1] = (value) => {
            if (CDUWindPage.HasUplinkWindData(mcdu.uplinkWinds.cruise)) {
                if (value === FMCMainDisplay.clrValue) {
                    CDUWindPage.ClearUplinkWindData(mcdu, 'CRZ', CDUWindPage.ShowCRZPage);
                    return;
                }

                CDUWindPage.InsertUplinkWindData(mcdu, 'CRZ', CDUWindPage.ShowCRZPage);
            } else if (mcdu.windRequestEnabled) {
                CDUWindPage.WindRequest(mcdu, CDUWindPage.ShowCRZPage);
            }
        };
    }

    static ShowWPTPage(mcdu, ident, offset = 0) {
        mcdu.clearDisplay();
        mcdu.page.Current = mcdu.page.CruiseWind;

        const waypoint = mcdu.simbrief.navlog.find((val) => val.ident === ident);
        if (!waypoint || waypoint.stage === 'CLB') {
            CDUWindPage.ShowCLBPage(mcdu);
            return;
        }

        if (waypoint.stage === 'DSC') {
            CDUWindPage.ShowDESPage(mcdu);
            return;
        }

        const template = [
            [
                new Column(4, 'CRZ WIND'),
                new Column(13, 'AT', Column.small),
                new Column(16, ident, Column.green),
            ],

            [
                new Column(0, 'TRU WIND/ALT'),
            ],
            [''],

            [
                '',
                CDUWindPage.HasUplinkWindData(mcdu.uplinkWinds.cruise)
                    ? new Column(22, 'INSERT', Column.cyan, Column.right)
                    : new Column(22, 'WIND', Column.amber, Column.right),
            ],
            [
                '',
                CDUWindPage.HasUplinkWindData(mcdu.uplinkWinds.cruise)
                    ? new Column(23, 'UPLINK*', Column.cyan, Column.right)
                    : new Column(23, mcdu.windRequestEnabled ? 'REQUEST*' : 'REQUEST ', Column.amber, Column.right),
            ],

            [''],
            [''],

            [
                '',
                new Column(22, 'PREV', Column.right),
            ],
            [
                '',
                new Column(23, 'PHASE>', Column.right),
            ],
            [
                new Column(0, 'SAT / ALT', Column.small),
                new Column(22, 'NEXT', Column.right),
            ],
            [
                new Column(0, '[ ]°/[   ]', Column.inop),
                new Column(23, 'PHASE>', Column.right),
            ],
            [''],
            [
                new Column(0, '<RETURN'),
            ],
        ];

        mcdu.setTemplate(FormatTemplate(CDUWindPage.ShowWinds(template, mcdu, 'WPT', CDUWindPage.ShowWPTPage, offset, 4, ident)));

        mcdu.onRightInput[3] = () => {
            CDUWindPage.ShowCLBPage(mcdu);
        };
        mcdu.onRightInput[4] = () => {
            CDUWindPage.ShowDESPage(mcdu);
        };

        mcdu.onLeftInput[5] = () => {
            CDUWindPage.Return();
        };

        mcdu.onRightInput[1] = (value) => {
            if (CDUWindPage.HasUplinkWindData(mcdu.uplinkWinds.cruise)) {
                if (value === FMCMainDisplay.clrValue) {
                    CDUWindPage.ClearUplinkWindData(mcdu, 'CRZ', CDUWindPage.ShowCRZPage);
                    return;
                }

                CDUWindPage.InsertUplinkWindData(mcdu, 'CRZ', CDUWindPage.ShowCRZPage);
            } else if (mcdu.windRequestEnabled) {
                CDUWindPage.WindRequest(mcdu, CDUWindPage.ShowCRZPage);
            }
        };
    }

    static ShowDESPage(mcdu, offset = 0) {
        mcdu.clearDisplay();
        mcdu.page.Current = mcdu.page.DescentWind;

        let alternateCellValue = '';
        if (mcdu.winds.alternate != null) {
            alternateCellValue = new Column(0, `${CDUWindPage.FormatNumber(mcdu.winds.alternate.direction, 2)}°/${CDUWindPage.FormatNumber(mcdu.winds.alternate.speed, 2)}/FL${mcdu.winds.alternate.altitude / 100}`, Column.cyan);
        }

        if (mcdu.uplinkWinds.alternate != null) {
            alternateCellValue = new Column(0, `${CDUWindPage.FormatNumber(mcdu.uplinkWinds.alternate.direction, 2)}°/${CDUWindPage.FormatNumber(mcdu.uplinkWinds.alternate.speed, 2)}/FL${mcdu.uplinkWinds.alternate.altitude / 100}`, Column.green);
        }

        const template = [
            [new Column(6, 'DESCENT WIND')],
            [
                new Column(0, 'TRU WIND/ALT'),
                '',
            ],
            [''],
            [
                '',
                CDUWindPage.HasUplinkWindData(mcdu.uplinkWinds.cruise)
                    ? new Column(22, 'INSERT', Column.cyan, Column.right)
                    : new Column(22, 'WIND', Column.amber, Column.right),
            ],
            [
                '',
                CDUWindPage.HasUplinkWindData(mcdu.uplinkWinds.cruise)
                    ? new Column(23, 'UPLINK*', Column.cyan, Column.right)
                    : new Column(23, mcdu.windRequestEnabled ? 'REQUEST*' : 'REQUEST ', Column.amber, Column.right),
            ],
            [''],
            [''],
            [
                '',
                new Column(22, 'PREV', Column.right),
            ],
            [
                '',
                new Column(23, 'PHASE>', Column.right),
            ],
            [
                new Column(0, 'ALTERNATE'),
            ],
            [
                alternateCellValue,
            ],
            [''],
            [
                new Column(0, '<RETURN'),
            ],
        ];

        mcdu.setTemplate(FormatTemplate(CDUWindPage.ShowWinds(template, mcdu, 'DES', CDUWindPage.ShowDESPage, offset, 4)));

        mcdu.onRightInput[0] = (value, scratchpadCallback) => {
            if (value === FMCMainDisplay.clrValue) {
                mcdu.winds.alternate = null;
                CDUWindPage.ShowDESPage(mcdu, offset);
                return;
            }
            const wind = CDUWindPage.ParseWind(value);
            if (wind == null) {
                mcdu.setScratchpadMessage(NXSystemMessages.formatError);
                scratchpadCallback();
            } else {
                mcdu.winds.alternate = wind;
                CDUWindPage.ShowDESPage(mcdu, offset);
            }
        };

        mcdu.onRightInput[3] = () => {
            CDUWindPage.ShowCRZPage(mcdu);
        };

        mcdu.onLeftInput[5] = () => {
            CDUWindPage.Return();
        };

        mcdu.onRightInput[1] = (value) => {
            if (CDUWindPage.HasUplinkWindData(mcdu.uplinkWinds.des)) {
                if (value === FMCMainDisplay.clrValue) {
                    CDUWindPage.ClearUplinkWindData(mcdu, 'DES', CDUWindPage.ShowDESPage);
                    return;
                }

                CDUWindPage.InsertUplinkWindData(mcdu, 'DES', CDUWindPage.ShowDESPage);
            } else if (mcdu.windRequestEnabled) {
                CDUWindPage.WindRequest(mcdu, CDUWindPage.ShowDESPage);
            }
        };
    }

    static FormatNumber(n, leadingZeroes) {
        let output = `${n.toFixed(0)}`;
        for (let i = 0; i < leadingZeroes; i++) {
            if (n < (10 ** (leadingZeroes - i))) {
                output = `0${output}`;
            }
        }
        return output;
    }

    static ShowWinds(rows, mcdu, phase, _showPage, _offset, _max = 3, _ident = null) {
        let color = Column.cyan;

        let _winds = [];
        let _uplinkWinds = [];

        switch (phase) {
        case 'CLB':
            _winds = mcdu.winds.climb;
            _uplinkWinds = mcdu.uplinkWinds.climb;
            break;
        case 'CRZ':
            _winds = mcdu.winds.cruise;
            _uplinkWinds = mcdu.uplinkWinds.cruise;
            break;
        case 'DES':
            _winds = mcdu.winds.des;
            _uplinkWinds = mcdu.uplinkWinds.des;
            break;
        case 'WPT':
            if (_ident) {
                const windWpt = mcdu.winds.cruise.find((x) => x.ident === _ident);
                if (windWpt) {
                    _winds = windWpt.data;
                }

                const uplinkWindWpt = mcdu.uplinkWinds.cruise.find((x) => x.ident === _ident);
                if (uplinkWindWpt) {
                    _winds = uplinkWindWpt.data;
                }
            }
            break;
        }

        if (_uplinkWinds.length > 0) {
            _winds = _uplinkWinds;
            color = Column.green;
        }

        let entries = 0;
        for (let i = 0; i < (_winds.length - _offset); i++) {
            if (i < _max) {
                let row;
                const wind = _winds[i + _offset];

                switch (phase) {
                case 'CRZ':
                    row = new Column(0, `${CDUWindPage.FormatNumber(wind.direction, 2)}°/${CDUWindPage.FormatNumber(wind.speed, 2)}/${wind.ident}`, color);
                    break;
                case 'CLB':
                case 'DES':
                case 'WPT':
                    row = new Column(0, `${CDUWindPage.FormatNumber(wind.direction, 2)}°/${CDUWindPage.FormatNumber(wind.speed, 2)}/FL${wind.altitude}`, color);
                    break;
                }

                rows[(i * 2) + 2][0] = row;
                entries = i + 1;
                mcdu.onLeftInput[i] = (value) => {
                    if (value === FMCMainDisplay.clrValue) {
                        _winds.splice(i + _offset, 1);

                        if (phase === 'WPT' && _ident) {
                            _showPage(mcdu, _ident, _offset);
                        } else {
                            _showPage(mcdu, _offset);
                        }
                    }
                };
            }
        }
        if (entries < _max) {
            rows[(entries * 2) + 2][0] = new Column(0, '[ ]°/[ ]/[   ]', color);
            mcdu.onLeftInput[entries] = (value, scratchpadCallback) => {
                CDUWindPage.TryAddWind(mcdu, _winds, value, () => _showPage(mcdu, _offset), scratchpadCallback);
            };
        }

        let up = false;
        let down = false;

        if (phase === 'WPT') {
            const waypoints = mcdu.simbrief.navlog.filter((val) => val.stage === 'CRZ');
            const actualCruiseWindIndex = waypoints.findIndex((x) => x.ident === _ident);

            if (actualCruiseWindIndex < (waypoints.length - 1)) {
                mcdu.onDown = () => {
                    _showPage(mcdu, waypoints[actualCruiseWindIndex + 1].ident);
                };
                down = true;
            }

            if (actualCruiseWindIndex > 0) {
                mcdu.onUp = () => {
                    _showPage(mcdu, waypoints[actualCruiseWindIndex - 1].ident);
                };
                up = true;
            }

            mcdu.setArrows(up, down, false, false);
        } else {
            if (_winds.length > (_max - 1) && _offset > 0) {
                mcdu.onDown = () => {
                    _showPage(mcdu, _offset - 1);
                };
                down = true;
            }

            if (_offset < (_winds.length - (_max - 1))) {
                mcdu.onUp = () => {
                    _showPage(mcdu, _offset + 1);
                };
                up = true;
            }

            mcdu.setArrows(up, down, false, false);
        }

        return rows;
    }

    static ParseTrueWindAlt(_input) {
        const elements = _input.split('/');
        if (elements.length !== 3) {
            return null;
        }

        let direction = parseInt(elements[0]);
        if (direction === 360) {
            direction = 0;
        }
        if (!isFinite(direction) || direction < 0 || direction > 359) {
            return null;
        }

        const speed = parseInt(elements[1]);
        if (!isFinite(speed) || speed < 0 || speed > 999) {
            return null;
        }

        const altitude = parseInt(elements[2]);
        if (!isFinite(altitude) || altitude < 0 || altitude > 450) {
            return null;
        }

        return {
            direction,
            speed,
            altitude,
        };
    }

    static TryAddWind(mcdu, _windArray, _input, _showPage, scratchpadCallback) {
        const data = CDUWindPage.ParseTrueWindAlt(_input);
        if (data == null) {
            mcdu.setScratchpadMessage(NXSystemMessages.formatError);
            scratchpadCallback(_input);
        } else {
            _windArray.push(data);
            _showPage();
        }
    }

    static ParseWind(_input) {
        const elements = _input.split('/');
        if (elements.length !== 2) {
            return null;
        }

        let direction = parseInt(elements[0]);
        if (direction === 360) {
            direction = 0;
        }
        if (!isFinite(direction) || direction < 0 || direction > 359) {
            return null;
        }

        const speed = parseInt(elements[1]);
        if (!isFinite(speed) || speed < 0 || speed > 999) {
            return null;
        }

        return {
            direction,
            speed,
        };
    }

    static WindRequest(mcdu, _showPage = null) {
        getSimBriefOfp(mcdu, () => {}, () => {
            mcdu.windRequestEnabled = false;

            if (_showPage) {
                _showPage(mcdu);
            }

            const isOneEngineRunning = SimVar.GetSimVarValue('L:A32NX_ENGINE_N1:1', 'Number') >= 15 || SimVar.GetSimVarValue('L:A32NX_ENGINE_N1:2', 'Number') >= 15;
            let clbWind = [];
            let crzWind = [];
            let desWind = [];
            let altWind = null;

            switch (mcdu.flightPhaseManager.phase) {
            case FmgcFlightPhases.PREFLIGHT:
            case FmgcFlightPhases.TAKEOFF:
                clbWind = CDUWindPage.GetClimbWind(mcdu);
                crzWind = CDUWindPage.GetCruiseWind(mcdu);
                desWind = CDUWindPage.GetDescendWind(mcdu);
                altWind = CDUWindPage.GetAlternateWind(mcdu);
                break;
            case FmgcFlightPhases.CLIMB:
            case FmgcFlightPhases.CRUISE:
                crzWind = CDUWindPage.GetCruiseWind(mcdu);
                desWind = CDUWindPage.GetDescendWind(mcdu);
                altWind = CDUWindPage.GetAlternateWind(mcdu);
                break;
            case FmgcFlightPhases.DESCENT:
            case FmgcFlightPhases.APPROACH:
            case FmgcFlightPhases.GOAROUND:
            case FmgcFlightPhases.DONE:
            default:
                mcdu.windRequestEnabled = true;
                if (_showPage) {
                    _showPage(mcdu);
                }
                return;
            }

            setTimeout(() => {
                if (!isOneEngineRunning && mcdu.winds.climb.length === 0 && mcdu.winds.cruise.length === 0 && mcdu.winds.des.length === 0 && mcdu.winds.alternate == null) {
                    mcdu.winds.climb = clbWind;
                    mcdu.winds.cruise = crzWind;
                    mcdu.winds.des = desWind;
                    mcdu.winds.alternate = altWind;
                } else {
                    mcdu.uplinkWinds.climb = clbWind;
                    mcdu.uplinkWinds.cruise = crzWind;
                    mcdu.uplinkWinds.des = desWind;
                    mcdu.uplinkWinds.alternate = altWind;
                }

                mcdu.windRequestEnabled = true;
                mcdu.setScratchpadMessage(NXSystemMessages.windDataUplink);

                if (_showPage && mcdu.page.Current === mcdu.page.ClimbWind || mcdu.page.Current === mcdu.page.CruiseWind
                    || mcdu.page.Current === mcdu.page.DescentWind || mcdu.page.Current === mcdu.page.AcarsMenuPage) {
                    _showPage(mcdu);
                }
            }, Math.floor(Math.random() * 25000) + 25000);
        });
    }

    static HasUplinkWindData(windData) {
        return windData.length > 0;
    }

    static InsertUplinkWindData(mcdu, phase, _showPage) {
        switch (phase) {
        case 'CLB':
            mcdu.winds.climb = mcdu.uplinkWinds.climb;
            break;
        case 'CRZ':
            mcdu.winds.climb = mcdu.uplinkWinds.climb;
            break;
        case 'DES':
            mcdu.winds.cruise = mcdu.uplinkWinds.cruise;
            mcdu.winds.alternate = mcdu.uplinkWinds.alternate;
            break;
        }

        CDUWindPage.ClearUplinkWindData(mcdu, phase, _showPage);
    }

    static ClearUplinkWindData(mcdu, phase, _showPage) {
        switch (phase) {
        case 'CLB':
            mcdu.uplinkWinds.climb = [];
            break;
        case 'CRZ':
            mcdu.uplinkWinds.cruise = [];
            break;
        case 'DES':
            mcdu.uplinkWinds.des = [];
            mcdu.uplinkWinds.alternate = null;
            break;
        }
        _showPage(mcdu);
    }

    static GetClimbWind(mcdu) {
        const windData = [];
        let lastAltitude = 0;
        const clbWpts = mcdu.simbrief.navlog.filter((val) => val.stage === 'CLB');

        // iterate through each clbWpt grabbing the wind data
        clbWpts.forEach((clbWpt, wptIdx) => {
            if (wptIdx === 0) {
                let altIdx = 0;
                // we need to backfill from altitude 0 to below clbWpt.altitude_feet in windData
                while (lastAltitude < clbWpt.altitude_feet) {
                    const altitude = parseInt(clbWpt.wind_data.level[altIdx].altitude);
                    const speed = parseInt(clbWpt.wind_data.level[altIdx].wind_spd);
                    const direction = parseInt(clbWpt.wind_data.level[altIdx].wind_dir);

                    windData.push({
                        direction,
                        speed,
                        altitude: altitude / 100,
                    });
                    lastAltitude = altitude;
                    altIdx++;
                }
            }
            // Now we add the closest wind data to the altitude of the clbWpt
            clbWpt.wind_data.level.forEach((wind, levelIdx) => {
                const altitude = parseInt(wind.altitude);

                let deltaPrevLevel = 0;
                let deltaThisLevel = 0;
                // Look backwards for the closest level
                if (levelIdx > 0 && levelIdx < clbWpt.wind_data.level.length - 1) {
                    deltaPrevLevel = Math.abs(clbWpt.altitude_feet - parseInt(clbWpt.wind_data.level[levelIdx - 1].altitude));
                    deltaThisLevel = Math.abs(clbWpt.altitude_feet - altitude);
                }

                // Check that altitude isn't backtracking
                if (altitude > lastAltitude && lastAltitude <= clbWpt.altitude_feet) {
                    const idx = (deltaPrevLevel > deltaThisLevel) ? levelIdx : levelIdx - 1;

                    const idxAltitude = parseInt(clbWpt.wind_data.level[idx].altitude);
                    const direction = parseInt(clbWpt.wind_data.level[idx].wind_dir);
                    const speed = parseInt(clbWpt.wind_data.level[idx].wind_spd);

                    // Check again that we didn't backtrack
                    if (idxAltitude > lastAltitude) {
                        windData.push({
                            direction,
                            speed,
                            altitude: idxAltitude / 100,
                        });
                        lastAltitude = idxAltitude;
                    }
                }
            });
        });

        return windData;
    }

    static GetCruiseWind(mcdu) {
        const windData = [];
        const crzWpts = mcdu.simbrief.navlog.filter((val) => val.stage === 'CRZ' && val.ident !== 'TOD');

        crzWpts.forEach((crzWpt, wptIdx) => {
            const wptWindData = [];

            crzWpt.wind_data.level.forEach((wind, levelIdx) => {
                const altitude = parseInt(wind.altitude);
                const direction = parseInt(wind.wind_dir);
                const speed = parseInt(wind.wind_spd);

                wptWindData.push({
                    direction,
                    speed,
                    altitude: altitude / 100,
                });
            });

            windData.push({
                ident: crzWpt.ident,
                speed: parseInt(crzWpt.wind_spd),
                direction: parseInt(crzWpt.wind_dir),
                data: wptWindData.reverse(),
            });
        });

        return windData;
    }

    static GetDescendWind(mcdu) {
        // TOD is marked as cruise stage, but we want it's topmost wind data
        const tod = mcdu.simbrief.navlog.find((val) => val.ident === 'TOD');
        const desWpts = [tod, ...mcdu.simbrief.navlog.filter((val) => val.stage === 'DSC')];

        const windData = [];
        let lastAltitude = 45000;
        desWpts.forEach((desWpt, wptIdx) => {
            if (wptIdx === 0) {
                let altIdx = desWpt.wind_data.level.length - 1;
                // we need to backfill from crz altitude to above next clbWpt.altitude_feet in windData
                while (lastAltitude > desWpt.altitude_feet) {
                    const altitude = parseInt(desWpt.wind_data.level[altIdx].altitude);
                    const speed = parseInt(desWpt.wind_data.level[altIdx].wind_spd);
                    const direction = parseInt(desWpt.wind_data.level[altIdx].wind_dir);

                    windData.push({
                        direction,
                        speed,
                        altitude: altitude / 100,
                    });
                    lastAltitude = altitude;
                    altIdx--;
                }
            }
            // Now we add the closest wind data to the altitude of the desWpt
            desWpt.wind_data.level.reverse().forEach((wind, levelIdx) => {
                const altitude = parseInt(wind.altitude);

                let deltaNextLevel = 0;
                let deltaThisLevel = 0;
                // Look forwards for the closest level
                if (levelIdx < desWpt.wind_data.level.length - 2) {
                    deltaNextLevel = Math.abs(desWpt.altitude_feet - parseInt(desWpt.wind_data.level[levelIdx + 1].altitude));
                    deltaThisLevel = Math.abs(desWpt.altitude_feet - altitude);
                }

                // Check that altitude isn't backtracking
                if (altitude >= lastAltitude && lastAltitude > desWpt.altitude_feet) {
                    const idx = (deltaNextLevel > deltaThisLevel) ? levelIdx : levelIdx + 1;

                    const idxAltitude = parseInt(desWpt.wind_data.level[idx].altitude);
                    const direction = parseInt(desWpt.wind_data.level[idx].wind_dir);
                    const speed = parseInt(desWpt.wind_data.level[idx].wind_spd);

                    // Check again that we didn't backtrack
                    if (idxAltitude < lastAltitude) {
                        windData.push({
                            direction,
                            speed,
                            altitude: idxAltitude / 100,
                        });
                        lastAltitude = idxAltitude;
                    }
                }
            });
        });

        return windData;
    }

    static GetAlternateWind(mcdu) {
        return {
            direction: mcdu.simbrief.alternateAvgWindDir,
            speed: mcdu.simbrief.alternateAvgWindSpd,
            altitude: mcdu.simbrief.alternateCruiseAltitude,
        };
    }
}
