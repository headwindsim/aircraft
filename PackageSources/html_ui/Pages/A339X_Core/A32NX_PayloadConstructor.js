class A32NX_PayloadConstructor {
    constructor() {
        this.paxStations = {
            rows1_6: {
                name: 'ROWS [1-8]',
                seats: 32,
                weight: 2688,
                pax: 0,
                paxTarget: 0,
                stationIndex: 2 + 1,
                position: 21.98,
                seatsRange: [1, 32],
                simVar: "A32NX_PAX_TOTAL_ROWS_1_6"
            },
            rows7_13: {
                name: 'ROWS [9-11]',
                seats: 21,
                weight: 1764,
                pax: 0,
                paxTarget: 0,
                stationIndex: 3 + 1,
                position: 2.86,
                seatsRange: [32, 53],
                simVar: "A32NX_PAX_TOTAL_ROWS_7_13"
            },
            rows14_21: {
                name: 'ROWS [12-25]',
                seats: 106,
                weight: 8904,
                pax: 0,
                paxTarget: 0,
                stationIndex: 4 + 1,
                position: -15.34,
                seatsRange: [53, 159],
                simVar: "A32NX_PAX_TOTAL_ROWS_14_21"
            },
            rows22_29: {
                name: 'ROWS [26-42]',
                seats: 131,
                weight: 11004,
                pax: 0,
                paxTarget: 0,
                stationIndex: 5 + 1,
                position: -32.81,
                seatsRange: [159, 290],
                simVar: "A32NX_PAX_TOTAL_ROWS_22_29"
            },
        };

        this.payloadStations = {
            pilot: {
                name: 'PILOT',
                weight: 91,
                stationIndex: 0 + 1,
                position: 42.36,
                visible: false,
                simVar: 'PAYLOAD STATION WEIGHT:1',
            },
            firstOfficer: {
                name: 'FIRST OFFICER',
                weight: 91,
                stationIndex: 1 + 1,
                position: 42.36,
                visible: false,
                simVar: 'PAYLOAD STATION WEIGHT:2',
            },
            fwdBag: {
                name: 'FWD BAGGAGE/CONTAINER',
                weight: 5800,
                stationIndex: 6 + 1,
                position: 18.28,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:7',
            },
            aftCont: {
                name: 'AFT CONTAINER CPT1/2',
                weight: 22861,
                stationIndex: 7 + 1,
                position: -15.96,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:8',
            },
            aftBag: {
                name: 'AFT BAGGAGE CPT3/4',
                weight: 18507,
                stationIndex: 8 + 1,
                position: -27.10,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:9',
            },
            aftBulk: {
                name: 'AFT BULK/LOOSE CPT5',
                weight: 3468,
                stationIndex: 9 + 1,
                position: -37.35,
                visible: true,
                simVar: 'PAYLOAD STATION WEIGHT:10',
            },
        };
    }
}