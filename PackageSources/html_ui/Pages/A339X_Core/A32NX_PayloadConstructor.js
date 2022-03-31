class A32NX_PayloadConstructor {
    constructor() {
        this.paxStations = {
            rows1_6: {
                name: 'ROWS [1-9]',
                seats: 32,
                weight: 2688,
                pax: 0,
                paxTarget: 0,
                stationIndex: 2 + 1,
                position: 21.98,
                seatsRange: [1, 32],
                simVar: "A32NX_PAX_TOTAL_ROWS_1_9"
            },
            rows7_13: {
                name: 'ROWS [10-21]',
                seats: 136,
                weight: 296562,
                pax: 0,
                paxTarget: 0,
                stationIndex: 3 + 1,
                position: 2.86,
                seatsRange: [32, 168],
                simVar: "A32NX_PAX_TOTAL_ROWS_10_21"
            },
            rows14_21: {
                name: 'ROWS [22-26]',
                seats: 40,
                weight: 3360,
                pax: 0,
                paxTarget: 0,
                stationIndex: 4 + 1,
                position: -15.34,
                seatsRange: [168, 208],
                simVar: "A32NX_PAX_TOTAL_ROWS_22_26"
            },
            rows22_29: {
                name: 'ROWS [27-43]',
                seats: 131,
                weight: 11004,
                pax: 0,
                paxTarget: 0,
                stationIndex: 5 + 1,
                position: -32.81,
                seatsRange: [208, 339],
                simVar: "A32NX_PAX_TOTAL_ROWS_27_43"
            },
        };

        this.payloadStations = {
            pilot: {
                name: 'PILOT',
                weight: 84,
                stationIndex: 0 + 1,
                position: 42.36,
                visible: false,
                simVar: 'PAYLOAD STATION WEIGHT:1',
            },
            firstOfficer: {
                name: 'FIRST OFFICER',
                weight: 84,
                stationIndex: 1 + 1,
                position: 42.36,
                visible: false,
                simVar: 'PAYLOAD STATION WEIGHT:2',
            },
            fwdBag: {
                name: 'FWD BAGGAGE/CONTAINER',
                weight: 3600,
                stationIndex: 6 + 1,
                position: 18.28,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:7',
            },
            aftCont: {
                name: 'AFT CONTAINER',
                weight: 5500,
                stationIndex: 7 + 1,
                position: -15.96,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:8',
            },
            aftBag: {
                name: 'AFT BAGGAGE',
                weight: 2110,
                stationIndex: 8 + 1,
                position: -27.10,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:9',
            },
            aftBulk: {
                name: 'AFT BULK/LOOSE',
                weight: 1497,
                stationIndex: 9 + 1,
                position: -37.35,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:10',
            },
        };
    }
}
