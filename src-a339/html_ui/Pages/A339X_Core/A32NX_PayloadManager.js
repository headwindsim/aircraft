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
                position: 12.77,
                seatsRange: [32, 53],
                simVar: "A32NX_PAX_TOTAL_ROWS_7_13"
            },
            rows12_25: {
                name: 'ROWS [12-25]',
                seats: 112,
                weight: 9408,
                pax: 0,
                paxTarget: 0,
                stationIndex: 2 + 1,
                position: -11.63,
                seatsRange: [53, 165],
                simVar: "A32NX_PAX_TOTAL_ROWS_14_21"
            },
            rows26_42: {
                name: 'ROWS [26-42]',
                seats: 125,
                weight: 10500,
                pax: 0,
                paxTarget: 0,
                stationIndex: 3 + 1,
                position: -65.84,
                seatsRange: [165, 290],
                simVar: "A32NX_PAX_TOTAL_ROWS_22_29"
            },
        };

        this.cargoStations = {
            fwdBag: {
                name: 'BAGGAGE',
                weight: 5800,
                load: 0,
                stationIndex: 4 + 1,
                position: 40.00,
                visible: true,
                simVar: 'A32NX_CARGO_FWD_BAGGAGE_CONTAINER',
            },
            aftCont: {
                name: 'FWD CONTAINER CPT 1/2',
                weight: 22061,
                load: 0,
                stationIndex: 5 + 1,
                position: 10.00,
                visible: true,
                simVar: 'A32NX_CARGO_AFT_CONTAINER',
            },
            aftBag: {
                name: 'AFT CONTAINER CPT 3/4',
                weight: 18507,
                load: 0,
                stationIndex: 6 + 1,
                position: -55.00,
                visible: true,
                simVar: 'A32NX_CARGO_AFT_BAGGAGE',
            },
            aftBulk: {
                name: 'AFT BULK/LOOSE CPT 5',
                weight: 3468,
                load: 0,
                stationIndex: 7 + 1,
                position: -80.00,
                visible: true,
                simVar: 'A32NX_CARGO_AFT_BULK_LOOSE',
            },
        };
    }
}

const payloadConstruct = new A32NX_PayloadConstructor();
const paxStations = payloadConstruct.paxStations;
const cargoStations = payloadConstruct.cargoStations;
const MAX_SEAT_AVAILABLE = 290;

/**
 * Calculate %MAC ZWFCG of all stations
 */
function getZfwcg() {
    const leMacZ = -21.63; // Accurate to 3 decimals, replaces debug weight values
    const macSize = 25.49; // Accurate to 3 decimals, replaces debug weight values

    const emptyWeight = (SimVar.GetSimVarValue("EMPTY WEIGHT", getUserUnit()));
    const emptyPosition = -28; // Value from flight_model.cfg
    const emptyMoment = emptyPosition * emptyWeight;
    const PAX_WEIGHT = SimVar.GetSimVarValue("L:A32NX_WB_PER_PAX_WEIGHT", "Number");

    const paxTotalMass = Object.values(paxStations).map((station) => (SimVar.GetSimVarValue(`L:${station.simVar}`, "Number") * PAX_WEIGHT)).reduce((acc, cur) => acc + cur, 0);
    const paxTotalMoment = Object.values(paxStations).map((station) => (SimVar.GetSimVarValue(`L:${station.simVar}`, "Number") * PAX_WEIGHT) * station.position).reduce((acc, cur) => acc + cur, 0);

    const cargoTotalMass = Object.values(cargoStations).map((station) => SimVar.GetSimVarValue(`PAYLOAD STATION WEIGHT:${station.stationIndex}`, getUserUnit())).reduce((acc, cur) => acc + cur, 0);
    const cargoTotalMoment = Object.values(cargoStations).map((station) => (SimVar.GetSimVarValue(`PAYLOAD STATION WEIGHT:${station.stationIndex}`, getUserUnit()) * station.position)).reduce((acc, cur) => acc + cur, 0);

    const totalMass = emptyWeight + paxTotalMass + cargoTotalMass;
    const totalMoment = emptyMoment + paxTotalMoment + cargoTotalMoment;

    const cgPosition = totalMoment / totalMass;
    const cgPositionToLemac = cgPosition - leMacZ;
    const cgPercentMac = -100 * (cgPositionToLemac / macSize);

    return cgPercentMac;
}

function getTotalCargo() {
    const cargoTotalMass = Object.values(cargoStations).filter((station) => station.visible).map((station) => SimVar.GetSimVarValue(`PAYLOAD STATION WEIGHT:${station.stationIndex}`, getUserUnit())).reduce((acc, cur) => acc + cur, 0);
    return cargoTotalMass;
}

function getTotalPayload() {
    const paxTotalMass = Object.values(paxStations).map((station) => SimVar.GetSimVarValue(`PAYLOAD STATION WEIGHT:${station.stationIndex}`, getUserUnit())).reduce((acc, cur) => acc + cur, 0);
    const cargoTotalMass = getTotalCargo();
    return paxTotalMass + cargoTotalMass;
}

function getZfw() {
    const emptyWeight = (SimVar.GetSimVarValue("EMPTY WEIGHT", getUserUnit()));
    return emptyWeight + getTotalPayload();
}

function getUserUnit() {
    const defaultUnit = (NXUnits.userWeightUnit() == "KG") ? "Kilograms" : "Pounds";
    return defaultUnit;
}
