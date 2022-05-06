class A32NX_PayloadConstructor {
    constructor() {
        this.paxStations = {
            rows1_8: {
                name: 'ROWS [1-8]',
                seats: 32,
                weight: 2688,
                pax: 0,
                paxTarget: 0,
                stationIndex: 0 + 1,
                position: 43,
                seatsRange: [1, 32],
                simVar: "A32NX_PAX_TOTAL_ROWS_1_6"
            },
            rows9_11: {
                name: 'ROWS [9-11]',
                seats: 21,
                weight: 1764,
                pax: 0,
                paxTarget: 0,
                stationIndex: 1 + 1,
                position: 10,
                seatsRange: [32, 53],
                simVar: "A32NX_PAX_TOTAL_ROWS_7_13"
            },
            rows12_25: {
                name: 'ROWS [12-25]',
                seats: 106,
                weight: 8904,
                pax: 0,
                paxTarget: 0,
                stationIndex: 2 + 1,
                position: -20.34,
                seatsRange: [53, 159],
                simVar: "A32NX_PAX_TOTAL_ROWS_14_21"
            },
            rows26_42: {
                name: 'ROWS [26-42]',
                seats: 131,
                weight: 11004,
                pax: 0,
                paxTarget: 0,
                stationIndex: 3 + 1,
                position: -49.22,
                seatsRange: [159, 290],
                simVar: "A32NX_PAX_TOTAL_ROWS_22_29"
            },
        };

        this.cargoStations = {
            fwdBag: {
                name: 'BAGGAGE',
                weight: 5800,
                load: 0,
                stationIndex: 4 + 1,
                position: 22.42,
                visible: true,
                simVar: 'A32NX_CARGO_FWD_BAGGAGE_CONTAINER',
            },
            aftCont: {
                name: 'FWD CONTAINER CPT 1/2',
                weight: 17061,
                load: 0,
                stationIndex: 5 + 1,
                position: -23.94,
                visible: true,
                simVar: 'A32NX_CARGO_AFT_CONTAINER',
            },
            aftBag: {
                name: 'AFT CONTAINER CPT 3/4',
                weight: 18507,
                load: 0,
                stationIndex: 6 + 1,
                position: -45.65,
                visible: true,
                simVar: 'A32NX_CARGO_AFT_BAGGAGE',
            },
            aftBulk: {
                name: 'AFT BULK/LOOSE CPT 5',
                weight: 3468,
                load: 0,
                stationIndex: 7 + 1,
                position: -70,
                visible: true,
                simVar: 'A32NX_CARGO_AFT_BULK_LOOSE',
            },
        };
    }
}
