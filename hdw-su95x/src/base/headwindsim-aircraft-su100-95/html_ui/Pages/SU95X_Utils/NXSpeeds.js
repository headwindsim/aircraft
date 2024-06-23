/**
 * TO V2 speed table
 * calls function(gross weight (t)) which returns CAS.
 * Indexes: 0 - Config 1 + F, 1 - Config 2, 2 - Config 3.
 * Sub-Indexes: 0 to 13 represent gross weight (t) in 2t steps from 24 to 50.
 */
const to = [
    [
        () => 129,
        () => 129,
        () => 129,
        () => 129,
        (m) => 132 + 1.99 * (m - 32),
        (m) => 136 + 1.96 * (m - 34),
        (m) => 140 + 1.92 * (m - 36),
        (m) => 144 + 1.89 * (m - 38),
        (m) => 147 + 1.85 * (m - 40),
        (m) => 151 + 1.82 * (m - 42),
        (m) => 155 + 1.79 * (m - 44),
        (m) => 158 + 1.75 * (m - 46),
        (m) => 162 + 1.72 * (m - 48),
        () => 165,
    ], // Conf 1 + F
    [
        () => 129,
        () => 129,
        () => 129,
        () => 129,
        () => 129,
        () => 129,
        () => 129,
        (m) => 130 + 1.71 * (m - 38),
        (m) => 133.5 + 1.66 * (m - 40),
        (m) => 136.5 + 1.62 * (m - 42),
        (m) => 140 + 1.58 * (m - 44),
        (m) => 143 + 1.54 * (m - 46),
        (m) => 146 + 1.5 * (m - 48),
        () => 149,
    ], // Conf 2
    // Conf 3 is removed as no information can be found regarding flaps 3 TO config
];

/**
 * Stall speed table
 * calls function(gross weight (t), landing gear) which returns CAS.
 * Indexes: 0 - Clean config, 1 - Config 1 + F, 2 - Config 2, 3 - Config 3, 4 - Config Full, 5 - Config 1.
 * Sub-Indexes: 0 to 13 represent gross weight (t) in 2t steps from 24 to 50.
 */
const vs = [
    [
        () => 119,
        (m) => 125 + 2.4 * (m - 26),
        (m) => 130 + 2.38 * (m - 28),
        (m) => 135 + 2.35 * (m - 30),
        (m) => 140 + 2.32 * (m - 32),
        (m) => 144 + 2.29 * (m - 34),
        (m) => 148 + 2.27 * (m - 36),
        (m) => 152 + 2.24 * (m - 38),
        (m) => 156 + 2.21 * (m - 40),
        (m) => 161 + 2.18 * (m - 42),
        (m) => 165 + 2.15 * (m - 44),
        (m) => 169 + 2.1 * (m - 46),
        (m) => 174 + 2.07 * (m - 48),
        () => 179,
    ], // Clean Conf
    [
        () => 95,
        (m) => 99 + 2.12 * (m - 26),
        (m) => 103 + 2.02 * (m - 28),
        (m) => 107 + 1.93 * (m - 30),
        (m) => 111 + 1.83 * (m - 32),
        (m) => 114 + 1.74 * (m - 34),
        (m) => 118 + 1.64 * (m - 36),
        (m) => 121 + 1.55 * (m - 38),
        (m) => 124 + 1.45 * (m - 40),
        (m) => 127 + 1.36 * (m - 42),
        (m) => 130 + 1.27 * (m - 44),
        (m) => 132 + 1.17 * (m - 46),
        (m) => 134 + 1.08 * (m - 48),
        () => 136,
    ], // Conf 1 + F
    [
        () => 91,
        (m) => 95 + 1.74 * (m - 26),
        (m) => 99 + 1.7 * (m - 28),
        (m) => 102 + 1.65 * (m - 30),
        (m) => 105 + 1.61 * (m - 32),
        (m) => 108 + 1.57 * (m - 34),
        (m) => 112 + 1.52 * (m - 36),
        (m) => 114 + 1.48 * (m - 38),
        (m) => 117 + 1.44 * (m - 40),
        (m) => 120 + 1.4 * (m - 42),
        (m) => 123 + 1.35 * (m - 44),
        (m) => 125 + 1.31 * (m - 46),
        (m) => 128 + 1.27 * (m - 48),
        () => 131,
    ], // Conf 2
    [
        () => 88,
        (m) => 92 + 1.85 * (m - 26),
        (m) => 96 + 1.8 * (m - 28),
        (m) => 100 + 1.74 * (m - 30),
        (m) => 103 + 1.68 * (m - 32),
        (m) => 107 + 1.62 * (m - 34),
        (m) => 109 + 1.57 * (m - 36),
        (m) => 112 + 1.51 * (m - 38),
        (m) => 115 + 1.45 * (m - 40),
        (m) => 118 + 1.39 * (m - 42),
        (m) => 121 + 1.34 * (m - 44),
        (m) => 123 + 1.28 * (m - 46),
        (m) => 126 + 1.22 * (m - 48),
        () => 129,
    ], // Conf 3
    [
        (_, ldg) => 86 - ldg,
        (m, ldg) => 90 + 1.85 * (m - 26) - ldg,
        (m, ldg) => 93 + 1.77 * (m - 28) - ldg,
        (m, ldg) => 97 + 1.69 * (m - 30) - ldg,
        (m, ldg) => 100 + 1.62 * (m - 32) - ldg,
        (m, ldg) => 103 + 1.54 * (m - 34) - ldg,
        (m, ldg) => 107 + 1.46 * (m - 36) - ldg,
        (m, ldg) => 109 + 1.38 * (m - 38) - ldg,
        (m, ldg) => 112 + 1.31 * (m - 40) - ldg,
        (m, ldg) => 114 + 1.23 * (m - 42) - ldg,
        (m, ldg) => 117 + 1.15 * (m - 44) - ldg,
        (m, ldg) => 119 + 1.07 * (m - 46) - ldg,
        (m, ldg) => 121 + 1 * (m - 48) - ldg,
        (_, ldg) => 123 - ldg,
    ], // Conf Full
    [
        (_, ldg) => 98,
        (m, ldg) => 102 + 2.33 * (m - 26) - ldg,
        (m, ldg) => 107 + 2.21 * (m - 28) - ldg,
        (m, ldg) => 111 + 2.09 * (m - 30) - ldg,
        (m, ldg) => 115 + 1.97 * (m - 32) - ldg,
        (m, ldg) => 119 + 1.85 * (m - 34) - ldg,
        (m, ldg) => 123 + 1.73 * (m - 36) - ldg,
        (m, ldg) => 126 + 1.61 * (m - 38) - ldg,
        (m, ldg) => 129 + 1.49 * (m - 40) - ldg,
        (m, ldg) => 132 + 1.38 * (m - 42) - ldg,
        (m, ldg) => 135 + 1.26 * (m - 44) - ldg,
        (m, ldg) => 137 + 1.14 * (m - 46) - ldg,
        (m, ldg) => 139 + 1.02 * (m - 48) - ldg,
        (_, ldg) => 141 - ldg,
    ], // Conf 1
];

/**
 * Lowest selectable Speed Table
 * calls function(gross weigh (t), landing gear) which returns CAS, automatically compensates for cg.
 * Indexes: 0 - Clean config, 1 - Config 1 + F, 2 - Config 2, 3 - Config 3, 4 - Config Full, 5 - Config 1.
 * Is matched to the landing speed for SSJ-100
 * Sub-Indexes: 0 to 13 represent gross weight (t) in 2t steps from 24 to 50.
 */
const vls = [
    [
        () => 152,
        (m) => 158 + 3.09 * (m - 26),
        (m) => 164 + 3.02 * (m - 28),
        (m) => 170 + 2.94 * (m - 30),
        (m) => 176 + 2.86 * (m - 32),
        (m) => 181 + 2.79 * (m - 34),
        (m) => 187 + 2.72 * (m - 36),
        (m) => 192 + 2.64 * (m - 38),
        (m) => 198 + 2.56 * (m - 40),
        (m) => 203 + 2.49 * (m - 42),
        (m) => 208 + 2.41 * (m - 44),
        (m) => 212 + 2.34 * (m - 46),
        (m) => 217 + 2.26 * (m - 48),
        () => 221,
    ], // Clean Config
    [
        () => 117,
        (m) => 122 + 2.28 * (m - 26),
        (m) => 127 + 2.25 * (m - 28),
        (m) => 131 + 2.21 * (m - 30),
        (m) => 136 + 2.18 * (m - 32),
        (m) => 140 + 2.14 * (m - 34),
        (m) => 144 + 2.10 * (m - 36),
        (m) => 148 + 2.07 * (m - 38),
        (m) => 152 + 2.03 * (m - 40),
        (m) => 156 + 1.99 * (m - 42),
        (m) => 160 + 1.96 * (m - 44),
        (m) => 164 + 1.92 * (m - 46),
        (m) => 168 + 1.88 * (m - 48),
        () => 172,
    ], // Config 1 + F
    [
        () => 115,
        (m) => 120 + 2.25 * (m - 26),
        (m) => 125 + 2.2 * (m - 28),
        (m) => 129 + 2.14 * (m - 30),
        (m) => 133 + 2.08 * (m - 32),
        (m) => 137 + 2.03 * (m - 34),
        (m) => 141 + 1.97 * (m - 36),
        (m) => 145 + 1.91 * (m - 38),
        (m) => 149 + 1.86 * (m - 40),
        (m) => 152 + 1.8 * (m - 42),
        (m) => 156 + 1.74 * (m - 44),
        (m) => 159 + 1.68 * (m - 46),
        (m) => 163 + 1.63 * (m - 48),
        () => 166,
    ], // Config 2
    [
        () => 113,
        (m) => 118 + 2.25 * (m - 26),
        (m) => 123 + 2.2 * (m - 28),
        (m) => 127 + 2.14 * (m - 30),
        (m) => 131 + 2.08 * (m - 32),
        (m) => 135 + 2.03 * (m - 34),
        (m) => 139 + 1.97 * (m - 36),
        (m) => 143 + 1.91 * (m - 38),
        (m) => 147 + 1.86 * (m - 40),
        (m) => 150 + 1.8 * (m - 42),
        (m) => 154 + 1.74 * (m - 44),
        (m) => 157 + 1.68 * (m - 46),
        (m) => 161 + 1.63 * (m - 48),
        () => 164,
    ], // Config 3
    [
        () => 111,
        (m) => 115 + 2.15 * (m - 26),
        (m) => 119 + 2.1 * (m - 28),
        (m) => 123 + 2.05 * (m - 30),
        (m) => 128 + 2 * (m - 32),
        (m) => 131 + 1.94 * (m - 34),
        (m) => 135 + 1.89 * (m - 36),
        (m) => 139 + 1.84 * (m - 38),
        (m) => 143 + 1.79 * (m - 40),
        (m) => 146 + 1.74 * (m - 42),
        (m) => 150 + 1.69 * (m - 44),
        (m) => 153 + 1.64 * (m - 46),
        (m) => 156 + 1.58 * (m - 48),
        () => 159,
    ], // Config Full
    [
        () => 133,
        (m) => 138 + 2.48 * (m - 26),
        (m) => 143 + 2.4 * (m - 28),
        (m) => 148 + 2.32 * (m - 30),
        (m) => 152 + 2.24 * (m - 32),
        (m) => 156 + 2.16 * (m - 34),
        (m) => 161 + 2.09 * (m - 36),
        (m) => 165 + 2.01 * (m - 38),
        (m) => 169 + 1.93 * (m - 40),
        (m) => 173 + 1.85 * (m - 42),
        (m) => 176 + 1.77 * (m - 44),
        (m) => 180 + 1.69 * (m - 46),
        (m) => 183 + 1.61 * (m - 48),
        () => 186,
    ], // Config 1
];

/**
 * Lowest selectable Speed Table for TakeOff ONLY
 * calls function(gross weight (t)) which returns CAS.
 * Indexes: 0 - Clean config, 1 - Config 1 + F, 2 - Config 2, 3 - Config 3, 4 - Config Full, 5 - Config 1.
 * Is matched to the landing speed for SSJ-100
 * Sub-Indexes: 0 to 13 represent gross weight (t) in 2t steps from 24 to 50.
 */
const vlsTo = [
    vls[0], // Clean Config
    [
        () => 135,
        (m) => 141 + 2.62 * (m - 26),
        (m) => 146 + 2.58 * (m - 28),
        (m) => 151 + 2.54 * (m - 30),
        (m) => 156 + 2.5 * (m - 32),
        (m) => 161 + 2.45 * (m - 34),
        (m) => 166 + 2.41 * (m - 36),
        (m) => 171 + 2.37 * (m - 38),
        (m) => 175 + 2.33 * (m - 40),
        (m) => 180 + 2.29 * (m - 42),
        (m) => 184 + 2.25 * (m - 44),
        (m) => 189 + 2.2 * (m - 44),
        (m) => 193 + 2.16 * (m - 44),
        () => 198,
    ], // Config 1 + F
    [
        () => 104,
        (m) => 108 + 2.06 * (m - 26),
        (m) => 112 + 2.01 * (m - 28),
        (m) => 116 + 1.95 * (m - 30),
        (m) => 120 + 1.90 * (m - 32),
        (m) => 124 + 1.85 * (m - 34),
        (m) => 127 + 1.80 * (m - 36),
        (m) => 131 + 1.75 * (m - 38),
        (m) => 134 + 1.70 * (m - 40),
        (m) => 138 + 1.64 * (m - 42),
        (m) => 141 + 1.59 * (m - 44),
        (m) => 144 + 1.54 * (m - 46),
        (m) => 147 + 1.49 * (m - 48),
        () => 150,
    ], // Config 2
    [
        () => 96,
        (m) => 100 + 1.90 * (m - 26),
        (m) => 104 + 1.85 * (m - 28),
        (m) => 107 + 1.80 * (m - 30),
        (m) => 111 + 1.75 * (m - 32),
        (m) => 114 + 1.7 * (m - 34),
        (m) => 118 + 1.65 * (m - 36),
        (m) => 121 + 1.60 * (m - 38),
        (m) => 124 + 1.55 * (m - 40),
        (m) => 127 + 1.50 * (m - 42),
        (m) => 130 + 1.45 * (m - 44),
        (m) => 133 + 1.39 * (m - 46),
        (m) => 136 + 1.34 * (m - 48),
        () => 138,
    ], // Config 3
    vls[4], // Config Full
    vls[5], // Config 1
];

/**
 * F-Speed Table
 * calls function(gross weight (t)) which returns CAS.
 * roughly extrapolate from flaps 3 config stall speed multiply by k (1.32 to 1.36) as per airbus definition
 * k = 1.32 is chosen
 * Indexes: 0 to 13 represent gross weight (t) in 2t steps from 24 to 50.
 */
const f = [
    () => 127,
    (m) => 127,
    (m) => 127,
    (m) => 131 + 1.6 * (m - 30),
    (m) => 136 + 1.64 * (m - 32),
    (m) => 140 + 1.68 * (m - 34),
    (m) => 145 + 1.72 * (m - 36),
    (m) => 148 + 1.76 * (m - 38),
    (m) => 151 + 1.80 * (m - 40),
    (m) => 155 + 1.84 * (m - 42),
    (m) => 159 + 1.88 * (m - 44),
    (m) => 162 + 1.92 * (m - 46),
    (m) => 166 + 1.96 * (m - 48),
    () => 170,
];

/**
 * S-Speed Table
 * calls function(gross weight (t)) which returns CAS.
 * roughly extrapolate from clean config stall speed multiply by k (1.21 to 1.25) as per airbus definition
 * k = 1.21 is chosen
 * Indexes: 0 to 13 represent gross weight (t) in 2t steps from 24 to 50.
 */
const s = [
    () => 162,
    (m) => 162,
    (m) => 162,
    (m) => 168 + 2.07 * (m - 30),
    (m) => 175 + 2.18 * (m - 32),
    (m) => 180 + 2.29 * (m - 34),
    (m) => 185 + 2.40 * (m - 36),
    (m) => 190 + 2.51 * (m - 38),
    (m) => 195 + 2.62 * (m - 40),
    (m) => 201 + 2.72 * (m - 42),
    (m) => 207 + 2.83 * (m - 44),
    (m) => 212 + 2.94 * (m - 46),
    (m) => 218 + 3.05 * (m - 48),
    () => 223,
];

const vmca = [
    [-2000, 115],
    [0, 114],
    [2000, 114],
    [4000, 113],
    [6000, 112],
    [8000, 109],
    [10000, 106],
    [12000, 103],
    [14100, 99],
    [15100, 97],
];

const vmcg = [ // 1+F, 2, 3 all the same
    [-2000, 117],
    [0, 116],
    [2000, 116],
    [4000, 115],
    [6000, 114],
    [8000, 112],
    [10000, 109],
    [12000, 106],
    [14100, 102],
    [15100, 101],
];

/**
 * Vfe for Flaps/Slats
 * @type {number[]}
 * Changed based on SSJ100 FCOM
 */
const vfeFS = [
    210, // Config 1 + F
    200, // Config 2
    190, // Config 3
    180, // Config Full
    250, // Config 1
];

const Vmo = 308;
const Mmo = 0.81;

/**
 * Correct input function for cg
 * @param m {number} gross weight (t)
 * @param f {function} function to be called with cg variable
 * @param cg {number} center of gravity
 * @returns {number} cg corrected velocity (CAS)
 *  Changed bsed on SSJ100 FCOM
 */
function correctCg(m, f, cg = SimVar.GetSimVarValue('CG PERCENT', 'percent')) {
    return f(m, isNaN(cg) ? 15 : cg);
}

/**
 * Ensure gross weight (mass) is withing valid range
 * @param m {number} mass: gross weight
 * @returns {number} mass: gross weight
 * @private
 * Changed bsed on SSJ100 FCOM
 */
function _correctMass(m) {
    return Math.ceil(((m > 50 ? 50 : m) - 24) / 2);
}

/**
 * Calculate green dot speed
 * Calculation:
 * Based on SSJ100 FCOM
 * @returns {number}
 */
function _computeGD(m) {
    return ((m * 1.25 + 169) > 215) ? (m * 1.25 + 169) : 215;
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
    return Math.min(Vmo, _convertMachToKCas(Mmo, _convertCtoK(Simplane.getAmbientTemperature()), SimVar.GetSimVarValue('AMBIENT PRESSURE', 'millibar')));
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
        this.gd = _compensateForMachEffect(this.gd, alt); // green dot in SSJ-100 seems to be not mac compesated but i added it back for now
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
        this.v2 = Math.floor(to[fPos - 1][_correctMass(m)](m) + (fPos === 2 ? (Math.abs(alt * 0.0002)) : 0));
        this.vr = this.v2 - ((fPos == 2) ? 4 : 2); // rougly extrapolating from SU95 fcom
        this.v1 = this.v2 - ((fPos == 2) ? 5 : 3); // rougly extrapolating from SU95 fcom
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
    static addWindComponent(vw = (SimVar.GetSimVarValue('AIRCRAFT WIND Z', 'knots') * -1) / 3) {
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
    static getHeadWindDiff(vTwr, vCur = SimVar.GetSimVarValue('AIRCRAFT WIND Z', 'knots') * -1) {
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
            SimVar.GetSimVarValue('L:A32NX_FLAPS_HANDLE_INDEX', 'Number') === 4 ? SimVar.GetSimVarValue('L:A32NX_SPEEDS_VMAX', 'Number') - 5 : SimVar.GetSimVarValue('L:A32NX_SPEEDS_VFEN', 'Number'),
        )));
    }

    static convertKCasToMach(
        Vc,
        T = _convertCtoK(Simplane.getAmbientTemperature()),
        p = SimVar.GetSimVarValue('AMBIENT PRESSURE', 'millibar'),
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
