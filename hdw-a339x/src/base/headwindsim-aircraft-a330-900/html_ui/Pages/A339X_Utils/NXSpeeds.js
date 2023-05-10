/**
 * TO V2 speed table
 * calls function(gross weight (t)) which returns CAS.
 * Indexes: 0 - Config 1 + F, 1 - Config 2, 2 - Config 3.
 * Sub-Indexes: 0 to 12 represent gross weight (t) in 10t steps from 130 to 250.
 * BASED ON A330 FCOM 02 - 2.02.25
 */
const to = [
    [
        () => 146, // 130
        () => 146, // 140
        () => 146, // 150
        () => 145, // 160
        () => 145, // 170
        () => 149, // 180
        () => 153, // 190
        () => 157, // 200
        () => 161, // 210
        () => 164, // 220
        () => 164, // 230
        () => 167, // 240
        () => 168  // 250
    ], // Conf 1 + F
    [
        () => 143, // 130
        () => 143, // 140
        () => 143, // 150
        () => 143, // 160
        () => 142, // 170
        () => 142, // 180
        () => 146, // 190
        () => 150, // 200
        () => 154, // 210
        () => 157, // 220
        () => 161, // 230
        () => 165, // 240
        () => 165  // 250
    ], // Conf 2
    [
        () => 141, // 130
        () => 141, // 140
        () => 141, // 150
        () => 140, // 160
        () => 140, // 170
        () => 139, // 180
        () => 141, // 190
        () => 145, // 200
        () => 148, // 210
        () => 151, // 220
        () => 166, // 230
        () => 166, // 240
        () => 166  // 250
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
        () => 127, // 130
        () => 131, // 140
        () => 136, // 150
        () => 141, // 160
        () => 145, // 170
        () => 149, // 180
        () => 153, // 190
        () => 157, // 200
        () => 161, // 210
        () => 165, // 220
        () => 169, // 230
        () => 172, // 240
        () => 176  // 250
    ], // Clean Conf
    [
        () => 111, // 130
        () => 111, // 140
        () => 115, // 150
        () => 119, // 160
        () => 123, // 170
        () => 126, // 180
        () => 130, // 190
        () => 133, // 200
        () => 136, // 210
        () => 139, // 220
        () => 142, // 230
        () => 146, // 240
        () => 148  // 250
    ], // Conf 1 + F
    [
        () => 108, // 130
        () => 108, // 140
        () => 113, // 150
        () => 116, // 160
        () => 120, // 170
        () => 124, // 180
        () => 127, // 190
        () => 130, // 200
        () => 133, // 210
        () => 136, // 220
        () => 139, // 230
        () => 142, // 240
        () => 144  // 250
    ], // Conf 2
    [
        () => 107, // 130
        () => 107, // 140
        () => 109, // 150
        () => 111, // 160
        () => 114, // 170
        () => 118, // 180
        () => 121, // 190
        () => 124, // 200
        () => 127, // 210
        () => 130, // 220
        () => 132, // 230
        () => 135, // 240
        () => 138  // 250
    ], // Conf 3
    [
        () => 102, // 130
        () => 102, // 140
        () => 104, // 150
        () => 106, // 160
        () => 109, // 170
        () => 112, // 180
        () => 115, // 190
        () => 118, // 200
        () => 121, // 210
        () => 124, // 220
        () => 127, // 230
        () => 130, // 240
        () => 133  // 250
    ], // Conf Full
    [
        () => 132, // 130
        () => 136, // 140
        () => 142, // 150
        () => 147, // 160
        () => 151, // 170
        () => 155, // 180
        () => 159, // 190
        () => 164, // 200
        () => 168, // 210
        () => 172, // 220
        () => 176, // 230
        () => 180, // 240
        () => 184  // 250
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
        () => 156, // 130
        () => 161, // 140
        () => 167, // 150
        () => 173, // 160
        () => 178, // 170
        () => 183, // 180
        () => 188, // 190
        () => 193, // 200
        () => 198, // 210
        () => 203, // 220
        () => 208, // 230
        () => 212, // 240
        () => 217  // 250
    ], // Clean Config
    [
        () => 131, // 130
        () => 131, // 140
        () => 136, // 150
        () => 140, // 160
        () => 145, // 170
        () => 149, // 180
        () => 153, // 190
        () => 157, // 200
        () => 161, // 210
        () => 164, // 220
        () => 168, // 230
        () => 172, // 240
        () => 175  // 250
    ], // Config 1 + F
    [
        () => 127, // 130
        () => 128, // 140
        () => 133, // 150
        () => 137, // 160
        () => 142, // 170
        () => 146, // 180
        () => 150, // 190
        () => 153, // 200
        () => 157, // 210
        () => 161, // 220
        () => 164, // 230
        () => 167, // 240
        () => 170  // 250
    ], // Config 2
    [
        () => 126, // 130
        () => 126, // 140
        () => 129, // 150
        () => 131, // 160
        () => 135, // 170
        () => 139, // 180
        () => 143, // 190
        () => 146, // 200
        () => 150, // 210
        () => 153, // 220
        () => 156, // 230
        () => 159, // 240
        () => 163  // 250
    ], // Config 3
    [
        () => 126, // 130
        () => 126, // 140
        () => 128, // 150
        () => 130, // 160
        () => 134, // 170
        () => 138, // 180
        () => 142, // 190
        () => 145, // 200
        () => 149, // 210
        () => 152, // 220
        () => 156, // 230
        () => 160, // 240
        () => 163  // 250
    ], // Config Full
    [
        () => 141, // 130
        () => 146, // 140
        () => 151, // 150
        () => 157, // 160
        () => 162, // 170
        () => 166, // 180
        () => 171, // 190
        () => 175, // 200
        () => 180, // 210
        () => 184, // 220
        () => 189, // 230
        () => 193, // 240
        () => 197  // 250
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
    [
        () => 143, // 130
        () => 148, // 140
        () => 153, // 150
        () => 159, // 160
        () => 164, // 170
        () => 168, // 180
        () => 173, // 190
        () => 177, // 200
        () => 182, // 210
        () => 186, // 220
        () => 191, // 230
        () => 195, // 240
        () => 199  // 250
    ], // Clean Config
    [
        () => 125, // 130
        () => 125, // 140
        () => 130, // 150
        () => 134, // 160
        () => 139, // 170
        () => 143, // 180
        () => 147, // 190
        () => 150, // 200
        () => 154, // 210
        () => 157, // 220
        () => 161, // 230
        () => 165, // 240
        () => 168 // 250
    ], // Config 1 + F
    [
        () => 122, // 130
        () => 123, // 140
        () => 127, // 150
        () => 131, // 160
        () => 136, // 170
        () => 140, // 180
        () => 144, // 190
        () => 147, // 200
        () => 150, // 210
        () => 154, // 220
        () => 157, // 230
        () => 160, // 240
        () => 163 // 250
    ], // Config 2
    [
        () => 121, // 130
        () => 121, // 140
        () => 124, // 150
        () => 125, // 160
        () => 129, // 170
        () => 133, // 180
        () => 137, // 190
        () => 140, // 200
        () => 144, // 210
        () => 147, // 220
        () => 149, // 230
        () => 152, // 240
        () => 156  // 250
    ], // Config 3
    [
        () => 116, // 130
        () => 116, // 140
        () => 118, // 150
        () => 119, // 160
        () => 123, // 170
        () => 127, // 180
        () => 130, // 190
        () => 133, // 200
        () => 137, // 210
        () => 140, // 220
        () => 143, // 230
        () => 147, // 240
        () => 150  // 250
    ], // Config Full
    [
        () => 149, // 130
        () => 154, // 140
        () => 160, // 150
        () => 166, // 160
        () => 170, // 170
        () => 175, // 180
        () => 180, // 190
        () => 185, // 200
        () => 190, // 210
        () => 194, // 220
        () => 199, // 230
        () => 203, // 240
        () => 208  // 250
    ], // Config 1
];

/**
 * F-Speed Table
 * calls function(gross weight (t)) which returns CAS.
 * Indexes: 0 to 12 represent gross weight (t) in 10t steps from 130 to 250.
 * BASED ON A330 FCOM 3 - 3.04.10 (VS 1+F * 1.18)
 */
const f = [
    () => 131, // 130
    () => 131, // 140
    () => 136, // 150
    () => 140, // 160
    () => 145, // 170
    () => 149, // 180
    () => 153, // 190
    () => 157, // 200
    () => 161, // 210
    () => 164, // 220
    () => 168, // 230
    () => 172, // 240
    () => 175 // 250
];

/**
 * S-Speed Table
 * calls function(gross weight (t)) which returns CAS.
 * Indexes: 0 to 12 represent gross weight (t) in 10t steps from 130 to 250.
 * BASED ON A330 FCOM 3 - 3.04.10 (VS CLEAN * 1.21)
 */
const s = [
    () => 156, // 130
    () => 162, // 140
    () => 168, // 150
    () => 173, // 160
    () => 179, // 170
    () => 184, // 180
    () => 189, // 190
    () => 194, // 200
    () => 199, // 210
    () => 203, // 220
    () => 203, // 230
    () => 203, // 240
    () => 203 // 250
];

/**
 * MINIMUM CONTROL SPEEDS
 * TEMP NOT USED - BASED ON VIR A330-941 FCOM LIM-AG-SPD P 3/4
 *
**/
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
 * Gross weight (t) * 0.6 + 107 when below FL200
 * BASED ON A330 FCOM 3 - 3.04.10
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
        this.v2 = Math.floor(to[fPos - 1][_correctMass(m)](m) + (fPos === 2 ? (Math.abs(alt * 0.0002)) : 0));
        this.vr = (this.v2 - 7) + fPos;
        this.v1 = this.vr - 2;

        if(m >= 230) {
            this.v1 = (this.vr - 8) + fPos;
        }
    }
}

class NXSpeedsApp {
    /**
     * Calculates VLS and Vapp for selected landing configuration
     * @param {number} m Projected landing mass in t
     * @param {boolean} isConf3 CONF3 if true, else FULL
     * @param {number} [wind=0] tower headwind component
     */
    constructor(m, isConf3, wind = 0) {
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
