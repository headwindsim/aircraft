/**
 * TO V2 speed table
 * calls function(gross weight (t)) which returns CAS.
 * Indexes: 0 - Config 1 + F, 1 - Config 2, 2 - Config 3.
 * Sub-Indexes: 0 to 12 represent gross weight (t) in 10t steps from 130 to 250.
 * BASED ON A330 FCOM 02 - 2.02.25
 */
const to = [
    [
        () => 117, // 130
        () => 121, // 140
        () => 125, // 150
        () => 130, // 160
        () => 134, // 170
        () => 137, // 180
        () => 141, // 190
        () => 145, // 200
        () => 149, // 210
        () => 152, // 220
        () => 155, // 230
        () => 159, // 240
        () => 163  // 250
    ], // Conf 1 + F
    [
        () => 113, // 130
        () => 116, // 140
        () => 119, // 150
        () => 123, // 160
        () => 126, // 170
        () => 130, // 180
        () => 133, // 190
        () => 137, // 200
        () => 141, // 210
        () => 144, // 220
        () => 147, // 230
        () => 150, // 240
        () => 153  // 250
    ], // Conf 2
    [
        () => 114, // 130
        () => 114, // 140
        () => 117, // 150
        () => 120, // 160
        () => 123, // 170
        () => 127, // 180
        () => 130, // 190
        () => 134, // 200
        () => 137, // 210
        () => 140, // 220
        () => 143, // 230
        () => 146, // 240
        () => 149  // 250
    ] // Conf 3
];

/**
 * Stall speed table
 * calls function(gross weight (t), landing gear) which returns CAS.
 * Indexes: 0 - Clean config, 1 - Config 1 + F, 2 - Config 2, 3 - Config 3, 4 - Config Full, 5 - Config 1.
 * Sub-Indexes: 0 to 12 represent gross weight (t) in 10t steps from 130 to 250.
 * BASED ON A330 FCOM 3 - 3.01.20
 */
const vs = [
    [
        () => 128, // 130
        () => 134, // 140
        () => 137, // 150
        () => 142, // 160
        () => 146, // 170
        () => 151, // 180
        () => 155, // 190
        () => 159, // 200
        () => 163, // 210
        () => 167, // 220
        () => 171, // 230
        () => 174, // 240
        () => 177  // 250
    ], // Clean Conf
    [
        () => 105, // 130
        () => 109, // 140
        () => 112, // 150
        () => 115, // 160
        () => 119, // 170
        () => 123, // 180
        () => 126, // 190
        () => 129, // 200
        () => 133, // 210
        () => 136, // 220
        () => 139, // 230
        () => 142, // 240
        () => 145  // 250
    ], // Conf 1 + F
    [
        () => 99,  // 130
        () => 103, // 140
        () => 106, // 150
        () => 110, // 160
        () => 113, // 170
        () => 117, // 180
        () => 120, // 190
        () => 123, // 200
        () => 125, // 210
        () => 128, // 220
        () => 131, // 230
        () => 134, // 240
        () => 137  // 250
    ], // Conf 2
    [
        () => 96,  // 130
        () => 99,  // 140
        () => 103, // 150
        () => 106, // 160
        () => 110, // 170
        () => 113, // 180
        () => 116, // 190
        () => 119, // 200
        () => 122, // 210
        () => 125, // 220
        () => 127, // 230
        () => 130, // 240
        () => 133  // 250
    ], // Conf 3
    [
        () => 94,  // 130
        () => 97,  // 140
        () => 100, // 150
        () => 104, // 160
        () => 107, // 170
        () => 110, // 180
        () => 113, // 190
        () => 116, // 200
        () => 119, // 210
        () => 122, // 220
        () => 124, // 230
        () => 127, // 240
        () => 130  // 250
    ], // Conf Full
    [
        () => 112, // 130
        () => 116, // 140
        () => 120, // 150
        () => 124, // 160
        () => 127, // 170
        () => 131, // 180
        () => 135, // 190
        () => 139, // 200
        () => 142, // 210
        () => 145, // 220
        () => 148, // 230
        () => 151, // 240
        () => 154  // 250
    ] // Conf 1
];

/**
 * Lowest selectable Speed Table
 * calls function(gross weigh (t), landing gear) which returns CAS, automatically compensates for cg.
 * Indexes: 0 - Clean config, 1 - Config 1 + F, 2 - Config 2, 3 - Config 3, 4 - Config Full, 5 - Config 1.
 * Sub-Indexes: 0 to 12 represent gross weight (t) in 10t steps from 130 to 250.
 * BASED ON A330 FCOM 3 - 3.04.10 (VS FLAPS * 1.18 / VS CLEAN * 1.23)
 */
const vls = [
    [
        () => 157, // 130
        () => 165, // 140
        () => 169, // 150
        () => 175, // 160
        () => 180, // 170
        () => 186, // 180
        () => 191, // 190
        () => 196, // 200
        () => 200, // 210
        () => 206, // 220
        () => 210, // 230
        () => 214, // 240
        () => 218  // 250
    ], // Clean Config
    [
        () => 124, // 130
        () => 129, // 140
        () => 132, // 150
        () => 136, // 160
        () => 140, // 170
        () => 145, // 180
        () => 149, // 190
        () => 152, // 200
        () => 157, // 210
        () => 160, // 220
        () => 164, // 230
        () => 168, // 240
        () => 171  // 250
    ], // Config 1 + F
    [
        () => 117, // 130
        () => 122, // 140
        () => 125, // 150
        () => 130, // 160
        () => 133, // 170
        () => 117, // 180
        () => 138, // 190
        () => 145, // 200
        () => 148, // 210
        () => 151, // 220
        () => 155, // 230
        () => 158, // 240
        () => 162  // 250
    ], // Config 2
    [
        () => 113, // 130
        () => 117,  // 140
        () => 122, // 150
        () => 125, // 160
        () => 130, // 170
        () => 133, // 180
        () => 137, // 190
        () => 140, // 200
        () => 144, // 210
        () => 147, // 220
        () => 150, // 230
        () => 153, // 240
        () => 157  // 250
    ], // Config 3
    [
        () => 111, // 130
        () => 114, // 140
        () => 118, // 150
        () => 123, // 160
        () => 126, // 170
        () => 130, // 180
        () => 133, // 190
        () => 137, // 200
        () => 140, // 210
        () => 144, // 220
        () => 146, // 230
        () => 150, // 240
        () => 153  // 250
    ], // Config Full
    [
        () => 132, // 130
        () => 137, // 140
        () => 141, // 150
        () => 146, // 160
        () => 149, // 170
        () => 155, // 180
        () => 159, // 190
        () => 164, // 200
        () => 168, // 210
        () => 171, // 220
        () => 175, // 230
        () => 178, // 240
        () => 182  // 250
    ] // Config 1
];

/**
 * Lowest selectable Speed Table for TakeOff ONLY
 * calls function(gross weight (t)) which returns CAS.
 * Indexes: 0 - Clean config, 1 - Config 1 + F, 2 - Config 2, 3 - Config 3, 4 - Config Full, 5 - Config 1.
 * Sub-Indexes: 0 to 12 represent gross weight (t) in 10t steps from 130 to 250.
 * BASED ON A330 FCOM 3 - 3.04.10 (VS * 1.13)
 */
const vlsTo = [
    vls[0], // Clean Config
    [
        () => 119, // 130
        () => 123, // 140
        () => 127, // 150
        () => 130, // 160
        () => 134, // 170
        () => 139, // 180
        () => 142, // 190
        () => 146, // 200
        () => 150, // 210
        () => 154, // 220
        () => 157, // 230
        () => 160, // 240
        () => 164  // 250
    ], // Config 1 + F
    [
        () => 112,  // 130
        () => 116, // 140
        () => 120, // 150
        () => 124, // 160
        () => 128, // 170
        () => 132, // 180
        () => 136, // 190
        () => 139, // 200
        () => 141, // 210
        () => 145, // 220
        () => 148, // 230
        () => 151, // 240
        () => 155  // 250
    ], // Config 2
    [
        () => 108, // 130
        () => 112, // 140
        () => 116, // 150
        () => 120, // 160
        () => 124, // 170
        () => 128, // 180
        () => 131, // 190
        () => 134, // 200
        () => 138, // 210
        () => 141, // 220
        () => 144, // 230
        () => 147, // 240
        () => 150  // 250
    ], // Config 3
    vls[4], // Config Full
    vls[5] // Config 1
];

/**
 * F-Speed Table
 * calls function(gross weight (t)) which returns CAS.
 * Indexes: 0 to 12 represent gross weight (t) in 10t steps from 130 to 250.
 * BASED ON A330 FCOM 3 - 3.04.10 (VS 1+F * 1.18)
 */
const f = [
    () => 124, // 130
    () => 129, // 140
    () => 132, // 150
    () => 136, // 160
    () => 140, // 170
    () => 145, // 180
    () => 149, // 190
    () => 152, // 200
    () => 157, // 210
    () => 160, // 220
    () => 164, // 230
    () => 168, // 240
    () => 171  // 250
];

/**
 * S-Speed Table
 * calls function(gross weight (t)) which returns CAS.
 * Indexes: 0 to 12 represent gross weight (t) in 10t steps from 130 to 250.
 * BASED ON A330 FCOM 3 - 3.04.10 (VS CLEAN * 1.21)
 */
const s = [
    () => 155, // 130
    () => 162, // 140
    () => 166, // 150
    () => 172, // 160
    () => 177, // 170
    () => 183, // 180
    () => 188, // 190
    () => 192, // 200
    () => 197, // 210
    () => 202, // 220
    () => 207, // 230
    () => 211, // 240
    () => 214  // 250
];

const vmca = [
    [0, 129],
    [2000, 127],
    [4000, 125],
    [6000, 122],
    [8000, 117]
];

const vmcg = [ // 1+F, 2, 3 all the same
    [0, 129],
    [2000, 127],
    [4000, 125],
    [6000, 122],
    [8000, 118]
];

/**
 * Vfe for Flaps/Slats
 * @type {number[]}
 * BASED ON A330 FCOM 3 - 3.01.20
 */
const vfeFS = [
    215, // Config 1 + F
    196, // Config 2
    186, // Config 3
    180, // Config Full
    240 // Config 1
];

/**
 * BASED ON A330 FCOM 3 - 3.01.20
 */

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
    return f(m, isNaN(cg) ? 25 : cg);
}

/**
 * Ensure gross weight (mass) is withing valid range
 * @param m {number} mass: gross weight
 * @returns {number} mass: gross weight
 * @private
 */
function _correctMass(m) {
    const min = 130;
    const max = 250;
    const step = 10;
    return Math.ceil(((m > max ? max : m) - min) / step);
}

/**
 * Calculate green dot speed
 * Calculation:
 * Gross weight (t) * 0.6 + 106 when below FL200
 * BASED ON A330 FCOM 3 - 3.04.10
 * @returns {number}
 */
function _computeGD(m) {
    return m * 0.6 + 106;
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
function _getdiffAngle(a, b) {
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
    constructor(m = 132, fPos = 1, alt = 0) {
        this.v2 = Math.floor(to[fPos - 1][_correctMass(m)](m) + (fPos === 2 ? (Math.abs(alt * 0.0002)) : 0)) + 5;
        this.vr = this.v2 - 4;
        this.v1 = this.vr - 2;
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
        return v * Math.cos(_getdiffAngle(a, b) * (Math.PI / 180));
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
            SimVar.GetSimVarValue("L:A32NX_FLAPS_HANDLE_INDEX", "Number") === 4 ? SimVar.GetSimVarValue("L:A32NX_SPEEDS_VMAX", "Number") - 5 : SimVar.GetSimVarValue("L:A32NX_SPEEDS_VFEN", "Number")
        )));
    }

    static convertKCasToMach(
        Vc,
        T = _convertCtoK(Simplane.getAmbientTemperature()),
        p = SimVar.GetSimVarValue("AMBIENT PRESSURE", "millibar")
    ) {
        return _convertKTASToMach(_convertKCasToKTAS(Vc, T, p), T);
    }

    /** @private */
    static interpolateTable(table, alt) {
        if (alt <= table[0][0]) {
            return vmca[0][1];
        }
        if (alt >= table[table.length - 1][0]) {
            table[table.length - 1][1];
        }
        for (let i = 0; i < table.length - 1; i++) {
            if (alt >= table[i][0] && alt <= table[i + 1][0]) {
                const d = (alt - table[i][0]) / (table[i + 1][0] - table[i][0]);
                return Avionics.Utils.lerpAngle(table[i][1], table[i + 1][1], d);
            }
        }
    }

    /**
     * Get VMCA (minimum airborne control speed) for a given altitude
     * @param {number} altitude Altitude in feet
     * @returns VMCA in knots
     */
    static getVmca(altitude) {
        return this.interpolateTable(vmca, altitude);
    }

    /**
     * Get VMCG (minimum ground control speed) for a given altitude
     * @param {number} altitude Altitude in feet
     * @returns VMCG in knots
     */
    static getVmcg(altitude) {
        return this.interpolateTable(vmcg, altitude);
    }

    /**
     * Get Vs1g for the given config
     *
     * @param {number} mass mass of the aircraft in tons
     * @param {number} conf 0 - Clean config, 1 - Config 1 + F, 2 - Config 2, 3 - Config 3, 4 - Config Full, 5 - Config 1.
     * @param {boolean} gearDown true if the gear is down
     */
    static getVs1g(mass, conf, gearDown) {
        return vs[conf][_correctMass(mass)](mass, gearDown ? 1 : 0);
    }
}
