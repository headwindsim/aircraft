/**
 * TO V2 speed table
 * calls function(gross weight (t)) which returns CAS.
 * Indexes: 0 - Config 1 + F, 1 - Config 2, 2 - Config 3.
 * Sub-Indexes: 0 to 7 represent gross weight (t) in 20t steps from 100 to 240.
 */
const to = [
    [
        () => 126,
        () => 126,
        () => 126,
        () => 126,
        () => 127,
        () => 132,
        () => 137,
        () => 142,
        () => 147,
        () => 151
    ], // Conf 1 + F
    [
        () => 126,
        () => 126,
        () => 126,
        () => 126,
        (m) => 126,
        (m) => 127,
        (m) => 132,
        (m) => 137,
        (m) => 141,
        () => 146
    ], // Conf 2
    [
        () => 125,
        () => 125,
        () => 125,
        () => 125,
        () => 125,
        (m) => 125,
        (m) => 128,
        (m) => 132,
        (m) => 137,
        () => 141
    ] // Conf 3
];

/**
 * Stall speed table
 * calls function(gross weight (t), landing gear) which returns CAS.
 * Indexes: 0 - Clean config, 1 - Config 1 + F, 2 - Config 2, 3 - Config 3, 4 - Config Full, 5 - Config 1.
 * Sub-Indexes: 0 to 7 represent gross weight (t) in 20t steps from 100 to 240.
 */
const vs = [
    [
        () => 124,
        (m) => 124,
        (m) => 131,
        (m) => 138,
        (m) => 145,
        (m) => 150,
        (m) => 155,
        (m) => 161,
        (m) => 166,
        () => 172
    ], // Clean Conf
    [
        () => 93,
        (m) => 93,
        (m) => 98,
        (m) => 103,
        (m) => 108,
        (m) => 112,
        (m) => 117,
        (m) => 121,
        (m) => 125,
        () => 130
    ], // Conf 1 + F
    [
        () => 91,
        (m) => 91,
        (m) => 96,
        (m) => 101,
        (m) => 105,
        (m) => 110,
        (m) => 114,
        (m) => 119,
        (m) => 122,
        () => 126
    ], // Conf 2
    [
        (_, ldg) => 91,
        (m, ldg) => 91,
        (m, ldg) => 96,
        (m, ldg) => 101,
        (m, ldg) => 105,
        (m, ldg) => 110,
        (m, ldg) => 114,
        (m, ldg) => 119,
        (m, ldg) => 122,
        (_, ldg) => 126
    ], // Conf 3
    [
        () => 84,
        (m) => 84,
        (m) => 88,
        (m) => 93,
        (m) => 97,
        (m) => 101,
        (m) => 105,
        (m) => 109,
        (m) => 113,
        () => 116
    ], // Conf Full
    [
        () => 102,
        (m) => 102,
        (m) => 107,
        (m) => 112,
        (m) => 117,
        (m) => 123,
        (m) => 127,
        (m) => 132,
        (m) => 137,
        () => 141
    ] // Conf 1
];

/**
 * Lowest selectable Speed Table
 * calls function(gross weigh (t), landing gear) which returns CAS, automatically compensates for cg.
 * Indexes: 0 - Clean config, 1 - Config 1 + F, 2 - Config 2, 3 - Config 3, 4 - Config Full, 5 - Config 1.
 * Sub-Indexes: 0 to 7 represent gross weight (t) in 20t steps from 100 to 240.
 */
const vls = [
    [
        () => 159,
        (m) => 159,
        (m) => 168,
        (m) => 177,
        (m) => 186,
        (m) => 192,
        (m) => 198,
        (m) => 206,
        (m) => 212,
        () => 220
    ], // Clean Config
    [
        () => 114,
        (m) => 114,
        (m) => 121,
        (m) => 127,
        (m) => 133,
        (m) => 138,
        (m) => 144,
        (m) => 149,
        (m) => 154,
        () => 160
    ], // Config 1 + F
    [
        () => 122,
        (m) => 122,
        (m) => 126,
        (m) => 135,
        (m) => 143,
        (m) => 150,
        (m) => 158,
        (m) => 165,
        (m) => 165,
        () => 165
    ], // Config 2
    [
        (_, ldg) => 118,
        (m, ldg) => 118,
        (m, ldg) => 122,
        (m, ldg) => 130,
        (m, ldg) => 138,
        (m, ldg) => 145,
        (m, ldg) => 152,
        (m, ldg) => 159,
        (m, ldg) => 159,
        (_, ldg) => 159
    ], // Config 3
    [
        () => 118,
        () => 118,
        () => 120,
        (m) => 128,
        (m) => 136,
        (m) => 143,
        (m) => 150,
        (m) => 157,
        (m) => 156,
        () => 157
    ], // Config Full
    [
        () => 138,
        (m) => 138,
        (m) => 143,
        (m) => 152,
        (m) => 162,
        (m) => 170,
        (m) => 179,
        (m) => 187,
        (m) => 187,
        () => 187
    ] // Config 1
];

/**
 * Lowest selectable Speed Table for TakeOff ONLY
 * calls function(gross weight (t)) which returns CAS.
 * Indexes: 0 - Clean config, 1 - Config 1 + F, 2 - Config 2, 3 - Config 3, 4 - Config Full, 5 - Config 1.
 * Sub-Indexes: 0 to 7 represent gross weight (t) in 20t steps from 100 to 240.
 */
const vlsTo = [
    vls[0], // Clean Config
    [
        () => 105,
        (m) => 105,
        (m) => 111,
        (m) => 116,
        (m) => 122,
        (m) => 127,
        (m) => 132,
        (m) => 137,
        (m) => 141,
        () => 147
    ], // Config 1 + F
    [
        (_) => 101,
        (m) => 101,
        (m) => 108,
        (m) => 114,
        (m) => 119,
        (m) => 125,
        (m) => 130,
        (m) => 132,
        (m) => 136,
        () => 140
    ], // Config 2
    [
        () => 101,
        (m) => 101,
        (m) => 106,
        (m) => 112,
        (m) => 116,
        (m) => 122,
        (m) => 127,
        (m) => 132,
        (m) => 136,
        () => 140
    ], // Config 3
    vls[4], // Config Full
    vls[5] // Config 1
];

/**
 * F-Speed Table
 * calls function(gross weight (t)) which returns CAS.
 * Indexes: 0 to 7 represent gross weight (t) in 20t steps from 100 to 240.
 */
const f = [
    () => 123,
    () => 123,
    () => 128,
    (m) => 137,
    (m) => 145,
    (m) => 153,
    (m) => 161,
    (m) => 168,
    (m) => 168,
    () => 168
];

/**
 * S-Speed Table
 * calls function(gross weight (t)) which returns CAS.
 * Indexes: 0 to 7 represent gross weight (t) in 20t steps from 100 to 240.
 */
const s = [
    () => 152,
    (m) => 152,
    (m) => 157,
    (m) => 168,
    (m) => 178,
    (m) => 187,
    (m) => 197,
    (m) => 205,
    (m) => 205,
    () => 205
];

/**
 * Vfe for Flaps/Slats
 * @type {number[]}
 */
const vfeFS = [
    215, // Config 1 + F
    196, // Config 2
    186, // Config 3
    180, // Config Full
    240 // Config 1
];

const Vmo = 330;
const Mmo = 0.86;

/**
 * Correct input function for cg
 * @param m {number} gross weight (t)
 * @param f {function} function to be called with cg variable
 * @param cg {number} center of gravity
 * @returns {number} cg corrected velocity (CAS)
 */
function correctCg(m, f, cg = SimVar.GetSimVarValue("CG PERCENT", "percent")) {
    return f(m, isNaN(cg) ? 24 : cg);
}

/**
 * Ensure gross weight (mass) is withing valid range
 * @param m {number} mass: gross weight
 * @returns {number} mass: gross weight
 * @private
 */
function _correctMass(m) {
    const min = 135;
    const max = 252;
    const step = 13;
    return Math.ceil(((m > max ? max : m) - min) / step);
}

/**
 * Calculate green dot speed
 * Calculation:
 * Gross weight (t) * 2 + 85 when below FL200
 * @returns {number}
 */
function _computeGD(m) {
    return m * 0.6 + 107;
}

/**
 * Corrects velocity for mach effect by adding 1kt for every 1000ft above FL200
 * @param v {number} velocity in kt (CAS)
 * @param alt {number} altitude in feet (baro)
 * @returns {number} Mach corrected velocity in kt (CAS)
 */
function _compensateForMachEffect(v, alt) {
    return Math.ceil(alt > 20000 ? v + (alt - 20000) / 1000 : v);
}

/**
 * Calculates wind component for ground speed mini
 * @param vw {number} velocity wind (headwind)
 * @returns {number} velocity wind [5, 15]
 */
function _addWindComponent(vw) {
    return Math.max(Math.min(15, vw), 5);
}

/**
 * Get difference between angles
 * @param a {number} angle a
 * @param b {number} angle b
 * @returns {number} angle diff
 * @private
 */
function _getAngleDiff(a, b) {
    return 180 - Math.abs(Math.abs(a - b) - 180);
}

/**
 * Get next flaps index for vfeFS table
 * @param fi {number} current flaps index
 * @returns {number} vfeFS table index
 * @private
 */
function _getVfeNIdx(fi) {
    switch (fi) {
        case 0: return 4;
        case 5: return 1;
        default: return fi;
    }
}

/**
 * Convert degrees Celsius into Kelvin
 * @param T {number} degrees Celsius
 * @returns {number} degrees Kelvin
 */
function _convertCtoK(T) {
    return T + 273.15;
}

/**
 * Convert Mach to True Air Speed
 * @param M {number} Mach
 * @param T {number} Kelvin
 * @returns {number} True Air Speed
 */
function _convertMachToKTas(M, T) {
    return M * 661.4786 * Math.sqrt(T / 288.15);
}

/**
 * Convert TAS to Mach
 * @param Vt {number} TAS
 * @param T {number} Kelvin
 * @returns {number} True Air Speed
 */
function _convertKTASToMach(Vt, T) {
    return Vt / 661.4786 / Math.sqrt(T / 288.15);
}

/**
 * Convert TAS to Calibrated Air Speed
 * @param Vt {number} velocity true air speed
 * @param T {number} current temperature Kelvin
 * @param p {number} current pressure hpa
 * @returns {number} Calibrated Air Speed
 */
function _convertTasToKCas(Vt, T, p) {
    return 1479.1 * Math.sqrt((p / 1013 * ((1 + 1 / (T / 288.15) * (Vt / 1479.1) ** 2) ** 3.5 - 1) + 1) ** (1 / 3.5) - 1);
}

/**
 * Convert KCAS to KTAS
 * @param Vc {number} velocity true air speed
 * @param T {number} current temperature Kelvin
 * @param p {number} current pressure hpa
 * @returns {number} Calibrated Air Speed
 */
function _convertKCasToKTAS(Vc, T, p) {
    return 1479.1 * Math.sqrt(T / 288.15 * ((1 / (p / 1013) * ((1 + 0.2 * (Vc / 661.4786) ** 2) ** 3.5 - 1) + 1) ** (1 / 3.5) - 1));
}

/**
 * Convert Mach to Calibrated Air Speed
 * @param M {number} Mach
 * @param T {number} Kelvin
 * @param p {number} current pressure hpa
 * @returns {number} Calibrated Air Speed
 */
function _convertMachToKCas(M, T, p) {
    return _convertTasToKCas(_convertMachToKTas(M, T), T, p);
}

/**
 * Get correct Vmax for Vmo and Mmo in knots
 * @returns {number} Min(Vmo, Mmo)
 * @private
 */
function _getVmo() {
    return Math.min(Vmo, _convertMachToKCas(Mmo, _convertCtoK(Simplane.getAmbientTemperature()), SimVar.GetSimVarValue("AMBIENT PRESSURE", "millibar")));
}

class NXSpeeds {
    /**
     * Computes Vs, Vls, Vapp, F, S and GD
     * @param m {number} mass: gross weight in t
     * @param fPos {number} flaps position
     * @param gPos {number} landing gear position
     * @param isTo {boolean} whether in takeoff config or not
     * @param wind {number} wind speed
     */
    constructor(m, fPos, gPos, isTo, wind = 0) {
        const cm = _correctMass(m);
        this.vs = vs[fPos][cm](m, gPos);
        this.vls = (isTo ? vlsTo : vls)[fPos][cm](m, gPos);
        this.vapp = this.vls + _addWindComponent(wind);
        this.f = f[cm](m);
        this.s = s[cm](m);
        this.gd = _computeGD(m);
        this.vmax = fPos === 0 ? _getVmo() : vfeFS[fPos - 1];
        this.vfeN = fPos === 4 ? 0 : vfeFS[_getVfeNIdx(fPos)];
    }

    compensateForMachEffect(alt) {
        this.vs = _compensateForMachEffect(this.vs, alt);
        this.vls = _compensateForMachEffect(this.vls, alt);
        this.gd = _compensateForMachEffect(this.gd, alt);
    }
}

class NXSpeedsTo {
    /**
     * Computes TakeOff speeds
     * @param m {number} mass: tow in t
     * @param fPos {number} flaps takeoff config
     * @param alt {number} field altitude
     */
    constructor(m = 60, fPos = 1, alt = 0) {
        this.v2 = Math.floor(to[fPos - 1][_correctMass(m)](m) + (fPos === 2 ? (Math.abs(alt * 0.0002)) : 0)) + 20;
        this.vr = this.v2 - 4;
        this.v1 = this.v2 - 5;
    }
}

class NXSpeedsApp {
    /**
     * Calculates VLS and Vapp for selected landing configuration
     * @param {number} m Projected landing mass in t
     * @param {boolean} isConf3 CONF3 if true, else FULL
     * @param {number} [wind=live measured] tower headwind component
     */
    constructor(m, isConf3, wind = (SimVar.GetSimVarValue("AIRCRAFT WIND Z", "knots") * -1)) {
        const cm = _correctMass(m);
        this.vls = vls[isConf3 ? 3 : 4][cm](m, 1);
        this.vapp = this.vls + NXSpeedsUtils.addWindComponent(wind / 3);
        this.f = f[cm](m);
        this.s = s[cm](m);
        this.gd = _computeGD(m);
        this.valid = true;
    }
}

class NXSpeedsUtils {
    /**
     * Calculates wind component for ground speed mini
     * @param vw {number} velocity wind (1/3 steady headwind)
     * @returns {number} velocity wind [5, 15]
     */
    static addWindComponent(vw = (SimVar.GetSimVarValue("AIRCRAFT WIND Z", "knots") * -1) / 3) {
        return _addWindComponent(vw);
    }

    /**
     * Calculates headwind component
     * @param v {number} velocity wind
     * @param a {number} angle: a
     * @param b {number} angle: b
     * @returns {number} velocity headwind
     */
    static getHeadwind(v, a, b) {
        return v * Math.cos(_getAngleDiff(a, b) * (Math.PI / 180));
    }

    /**
     * 1/3 * (current headwind - tower headwind)
     * @param vTwr {number} velocity tower headwind
     * @param vCur {number} velocity current headwind
     * @returns {number} head wind diff
     */
    static getHeadWindDiff(vTwr, vCur = SimVar.GetSimVarValue("AIRCRAFT WIND Z", "knots") * -1) {
        return Math.round(1 / 3 * (vCur - vTwr));
    }

    /**
     * Returns Vtarget limited by Vapp and VFE next
     * @param vapp {number} Vapp
     * @param windDiff {number} ground speed mini
     * @returns {number}
     */
    static getVtargetGSMini(vapp, windDiff) {
        return Math.max(vapp, Math.min(Math.round(vapp + windDiff), Math.round(
            SimVar.GetSimVarValue("L:A32NX_FLAPS_HANDLE_INDEX", "Number") === 4 ? Simplane.getMaxSpeed(Aircraft.A320_NEO) - 5 : Simplane.getNextFlapsExtendSpeed(Aircraft.A320_NEO)
        )));
    }

    static convertKCasToMach(
        Vc,
        T = _convertCtoK(Simplane.getAmbientTemperature()),
        p = SimVar.GetSimVarValue("AMBIENT PRESSURE", "millibar")
    ) {
        return _convertKTASToMach(_convertKCasToKTAS(Vc, T, p), T);
    }
}
