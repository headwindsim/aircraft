/* eslint-disable no-undef */
class A32NX_PayloadConstructor {
    constructor() {
        this.paxStations = {
            rows1_4: {
                name: 'ROWS [1-4]',
                seats: 30,
                weight: 2520,
                stationIndex: 1,
                position: 40,
                simVar: "A32NX_PAX_A"
            },
            rows5_8: {
                name: 'ROWS [5-8]',
                seats: 18,
                weight: 1512,
                stationIndex: 2,
                position: -50,
                simVar: "A32NX_PAX_B"
            },
            rows9_15: {
                name: 'ROWS [9-15]',
                seats: 42,
                weight: 3528,
                stationIndex: 3,
                position: -70,
                simVar: "A32NX_PAX_C"
            },
        };

        this.cargoStations = {
            fwdBag: {
                name: 'BAGGAGE',
                weight: 5800,
                load: 0,
                stationIndex: 4,
                position: 40.00,
                visible: true,
                simVar: 'A32NX_CARGO_FWD_BAGGAGE_CONTAINER',
            },
            aftCont: {
                name: 'FWD CONTAINER CPT 1/2',
                weight: 17061,
                load: 0,
                stationIndex: 5,
                position: 0.00,
                visible: true,
                simVar: 'A32NX_CARGO_AFT_CONTAINER',
            },
            aftBag: {
                name: 'AFT CONTAINER CPT 3/4',
                weight: 18507,
                load: 0,
                stationIndex: 6,
                position: -55.00,
                visible: true,
                simVar: 'A32NX_CARGO_AFT_BAGGAGE',
            },
            aftBulk: {
                name: 'AFT BULK/LOOSE CPT 5',
                weight: 3468,
                load: 0,
                stationIndex: 7,
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
const MAX_SEAT_AVAILABLE = 90;

/**
 * Calculate %MAC ZWFCG of all stations
 */
function getZfwcg() {
    const leMacZ = -15.33; // Accurate to 3 decimals, replaces debug weight values
    const macSize = 46.69; // Accurate to 3 decimals, replaces debug weight values

    const emptyWeight = (SimVar.GetSimVarValue("EMPTY WEIGHT", getUserUnit()));
    const emptyPosition = -27.56; // Value from flight_model.cfg
    const emptyMoment = emptyPosition * emptyWeight;
    const PAX_WEIGHT = SimVar.GetSimVarValue("L:A32NX_WB_PER_PAX_WEIGHT", "Number");

    const paxTotalMass = Object.values(paxStations).map((station) => new BitFlags(SimVar.GetSimVarValue(`L:${station.simVar}`, "Number")).getTotalBits() * PAX_WEIGHT).reduce((acc, cur) => acc + cur, 0);
    const paxTotalMoment = Object.values(paxStations).map((station) => new BitFlags(SimVar.GetSimVarValue(`L:${station.simVar}`, "Number")).getTotalBits() * PAX_WEIGHT * station.position).reduce((acc, cur) => acc + cur, 0);

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
