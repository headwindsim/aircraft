/* eslint-disable no-undef */
class A32NX_PayloadConstructor {
    constructor() {
        this.paxStations = {
            rows1_4: {
                name: 'ROWS [1-4]',
                seats: 36,
                weight: 3024,
                stationIndex: 1,
                position: 40,
                simVar: "A32NX_PAX_A"
            },
            rows5_8: {
                name: 'ROWS [5-8]',
                seats: 36,
                weight: 3024,
                stationIndex: 2,
                position: 30,
                simVar: "A32NX_PAX_B"
            },
            rows9_15: {
                name: 'ROWS [9-15]',
                seats: 39,
                weight: 3276,
                stationIndex: 3,
                position: 20,
                simVar: "A32NX_PAX_C"
            },
            rows16_21: {
                name: 'ROWS [16-21]',
                seats: 48,
                weight: 4032,
                stationIndex: 4,
                position: 10,
                simVar: "A32NX_PAX_D"
            },
            rows23_26: {
                name: 'ROWS [22-26]',
                seats: 45,
                weight: 3780,
                stationIndex: 5,
                position: -10,
                simVar: "A32NX_PAX_E"
            },
            rows27_31: {
                name: 'ROWS [27-31]',
                seats: 45,
                weight: 3780,
                stationIndex: 6,
                position: -30,
                simVar: "A32NX_PAX_F"
            },
            rows32_36: {
                name: 'ROWS [32-36]',
                seats: 45,
                weight: 3780,
                stationIndex: 7,
                position: -50,
                simVar: "A32NX_PAX_G"
            },
            rows37_42: {
                name: 'ROWS [37-41]',
                seats: 45,
                weight: 3780,
                stationIndex: 8,
                position: -60,
                simVar: "A32NX_PAX_H"
            },
            rows42_46: {
                name: 'ROWS [42-46]',
                seats: 45,
                weight: 3780,
                stationIndex: 9,
                position: -70,
                simVar: "A32NX_PAX_I"
            },
            rows47_54: {
                name: 'ROWS [47-54]',
                seats: 52,
                weight: 4368,
                stationIndex: 10,
                position: -80,
                simVar: "A32NX_PAX_J"
            },
        };

        this.cargoStations = {
            fwdBag: {
                name: 'BAGGAGE',
                weight: 5800,
                load: 0,
                stationIndex: 11,
                position: 40.00,
                visible: true,
                simVar: 'A32NX_CARGO_FWD_BAGGAGE_CONTAINER',
            },
            aftCont: {
                name: 'FWD CONTAINER CPT 1/2',
                weight: 17061,
                load: 0,
                stationIndex: 12,
                position: 0.00,
                visible: true,
                simVar: 'A32NX_CARGO_AFT_CONTAINER',
            },
            aftBag: {
                name: 'AFT CONTAINER CPT 3/4',
                weight: 18507,
                load: 0,
                stationIndex: 13,
                position: -55.00,
                visible: true,
                simVar: 'A32NX_CARGO_AFT_BAGGAGE',
            },
            aftBulk: {
                name: 'AFT BULK/LOOSE CPT 5',
                weight: 3468,
                load: 0,
                stationIndex: 14,
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
const MAX_SEAT_AVAILABLE = 436;

/**
 * Calculate %MAC ZWFCG of all stations
 */
function getZfwcg() {
    const leMacZ = -21.63; // Accurate to 3 decimals, replaces debug weight values
    const macSize = 25.49; // Accurate to 3 decimals, replaces debug weight values

    const emptyWeight = (SimVar.GetSimVarValue("EMPTY WEIGHT", getUserUnit()));
    const emptyPosition = -28.31; // Value from flight_model.cfg
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
