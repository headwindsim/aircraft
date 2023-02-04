// DO NOT TOUCH THESE VALUES
const airDistanceCoeff = math.bignumber(math.matrix([
    [9.779028e-01,9.951246e-01,-4.702127e-07,2.230098e-09,-7.407900e-13,8.863211e-17,-3.597783e-21],
    [-5.007965e-02,-1.818927e-03,-3.665975e-07,1.077488e-10,-1.188721e-14,4.487035e-19,0],
    [5.794173e-05,5.115704e-06,7.291942e-11,-4.826778e-14,3.508882e-18,0,0],
    [9.401828e-07,-1.467344e-08,1.187063e-12,-6.680338e-17,0,0,0],
    [-1.861956e-08,2.995026e-11,-7.589918e-16,0,0,0,0],
    [-7.962570e-12,-5.020335e-14,0,0,0,0,0],
    [5.854406e-13,0,0,0,0,0,0]
]));

// DO NOT TOUCH THESE VALUES
const fuelConsumedCoeff = math.bignumber(math.matrix([
    [-9.161961e+04, -1.381339e+02, -8.157919e-02, -6.058575e-06, -2.156416e-10, -4.731660e-15],
    [2.475284e+03, 3.435854e+00, 9.037147e-04, 4.428933e-08, 8.570681e-13, 0],
    [-2.507487e+01, -2.354422e-02, -3.287808e-06, -8.046320e-11, 0, 0],
    [1.186459e-01, 6.489072e-05, 3.928366e-09, 0, 0, 0],
    [-2.638919e-04, -6.332963e-08, 0, 0, 0, 0],
    [2.227639e-07, 0, 0, 0, 0, 0]
]));

// DO NOT TOUCH THESE VALUES
const timeCoeff = math.bignumber(math.matrix([
    [-3.497819e+01, 1.755135e-01, -1.483600e-04, 9.941283e-10, -1.417994e-13, 7.894638e-18],
    [8.914109e-01, 2.204460e-03,  1.234037e-06, -2.168292e-13, -1.295045e-16, 0],
    [-8.895819e-03, -2.163192e-05, -3.436463e-09, 4.931536e-15, 0, 0],
    [4.405072e-05, 6.409457e-08, 3.095191e-12, 0, 0, 0],
    [-9.955270e-08, -6.093408e-11, 0, 0, 0, 0],
    [8.197678e-11, 0, 0, 0, 0, 0]
]));

// DO NOT TOUCH THESE VALUES
const correctionsCoef = math.bignumber(math.matrix ([
    [3.115471e+02, -1.862590e+00, -1.297471e-04, -8.347624e-09, 4.460148e-13, -8.637704e-18],
    [-5.761179e+00, 3.300606e-02, 1.062724e-06, 3.429648e-11, -7.340176e-16, 0],
    [3.708191e-02, -1.866542e-04, -2.820851e-09, -3.961275e-14, 0, 0],
    [-1.110306e-04, 4.319920e-07, 2.557596e-12, 0, 0, 0],
    [1.622544e-07, -3.552638e-10, 0, 0, 0, 0],
    [-9.547702e-11, 0, 0, 0, 0, 0]
]));

// DO NOT TOUCH THESE VALUES
const altFuelConsumedCoef = math.bignumber(math.matrix([
    [-1.089836e+04, 6.235500e+01, -1.508236e-01, 2.697580e-04, -2.208460e-07, 6.749815e-11],
    [2.246672e+02, -2.165772e-01, -1.835746e-05, 1.585164e-07, -9.378779e-11, 0],
    [-1.891594e+00, 1.463576e-03, -8.055345e-07, 3.377006e-10, 0, 0],
    [7.059840e-03, -2.682427e-06, 5.727183e-11, 0, 0, 0],
    [-1.287018e-05, 2.812220e-09, 0, 0, 0, 0],
    [8.714770e-09, 0, 0, 0, 0, 0]
]));

// DO NOT TOUCH THESE VALUES
const altTimeCoef = math.bignumber(math.matrix([
    [2.627228e+01, 2.691276e-01, -6.325879e-04, 1.525719e-06, -1.443470e-09, 4.822372e-13],
    [-5.572391e-01, 1.803812e-03, -3.335068e-06, 2.814358e-09, -1.065810e-12, 0],
    [2.322011e-03, -5.881094e-06, 3.407386e-09, 7.522406e-13, 0, 0],
    [-1.636825e-06, 1.201980e-08, -9.420851e-12, 0, 0, 0],
    [-1.438232e-08, 2.916749e-12, 0, 0, 0, 0],
    [1.897618e-11, 0, 0, 0, 0, 0]
]));

// DO NOT TOUCH THESE VALUES
const altCorrectionsCoeff = math.bignumber(math.matrix([
    [2.473819e+01, 6.885651e-02, -7.568240e-05, 1.415272e-07, -1.645350e-10, 6.854526e-14],
    [-7.123797e-01, -9.232159e-05, -2.441712e-07, 9.079133e-10, -4.849859e-13, 0],
    [7.107355e-03, 1.063695e-06, -2.708469e-09, 1.116054e-12, 0, 0],
    [-3.341277e-05, 1.640541e-09, 1.485871e-13, 0, 0, 0],
    [7.184791e-08, -7.265666e-13, 0, 0, 0, 0],
    [-5.981672e-11, 0, 0, 0, 0, 0]
]));

// DO NOT TOUCH THESE VALUES
const holdingFFCoeff = math.bignumber(math.matrix([
    [1.826328e+04, -5.403272e+02, 7.199338e+00, -5.025826e-02, 1.977122e-04, -4.144865e-07, 3.608388e-10],
    [-1.432111e+02, 2.633272e+00, -1.943797e-02, 7.464789e-05, -1.602546e-07, 1.616421e-10, 0],
    [1.437683e+00, -1.941702e-02, 8.453197e-05, -1.185258e-07, -8.187800e-12, 0, 0],
    [-7.606324e-03, 8.534331e-05, -2.959640e-07, 3.290314e-10, 0, 0, 0],
    [1.753325e-05, -1.358419e-07, 2.320078e-10, 0, 0, 0, 0],
    [-1.934846e-08, 8.274778e-11, 0, 0, 0, 0, 0],
    [7.600440e-12, 0, 0, 0, 0, 0, 0]
]));

// DO NOT TOUCH THESE VALUES
const userAltTimeCoeff = math.bignumber(math.matrix([
    [7.641852e+01, 8.578479e-03, -1.738324e-08, 2.589187e-11, 4.794262e-17, -4.150524e-20],
    [-1.837969e+00, 5.120364e-05, -4.508556e-09, -1.721519e-13, 9.927574e-18, 0],
    [1.617139e-02, -1.967313e-07, 4.217980e-11, -8.552452e-16, 0, 0],
    [-6.691829e-05, -1.998896e-10, -3.741640e-14, 0, 0, 0],
    [1.323101e-07, 6.998883e-13, 0, 0, 0, 0],
    [-1.009242e-10, 0, 0, 0, 0, 0]
]));

/**
 * @param {number}value - the value to build the matrix from
 * @returns {math.matrix} return a 7x7 matrix for A predictors
 */
const _buildAMatrix7 = (value) => {
    return math.bignumber(math.matrix([
        [1, value ** 1, value ** 2, value ** 3, value ** 4, value ** 5, value ** 6],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0],
    ]));
};

/**
 * @param {number}value - the value to build the matrix from
 * @returns {math.matrix} return a 6x6 matrix for A predictors
 */
const _buildAMatrix6 = (value) => {
    return math.bignumber(math.matrix([
        [1, value ** 1, value ** 2, value ** 3, value ** 4, value ** 5],
        [0,0,0,0,0,0],
        [0,0,0,0,0,0],
        [0,0,0,0,0,0],
        [0,0,0,0,0,0],
        [0,0,0,0,0,0],
    ]));
};

/**
 * @param {number}value - the value to build the matrix from
 * @returns {math.matrix} return a 7x7 matrix for B predictors
 */
const _buildBMatrix7 = (value) => {
    return math.bignumber(math.matrix([
        [1,0,0,0,0,0,0],
        [value ** 1,0,0,0,0,0,0],
        [value ** 2,0,0,0,0,0,0],
        [value ** 3,0,0,0,0,0,0],
        [value ** 4,0,0,0,0,0,0],
        [value ** 5,0,0,0,0,0,0],
        [value ** 6,0,0,0,0,0,0],
    ]));
};

/**
 * @param {number}value - the value to build the matrix from
 * @returns {math.matrix} return a 6x6 matrix for B predictors
 */
const _buildBMatrix6 = (value) => {
    return math.bignumber(math.matrix([
        [1,0,0,0,0,0],
        [value ** 1,0,0,0,0,0],
        [value ** 2,0,0,0,0,0],
        [value ** 3,0,0,0,0,0],
        [value ** 4,0,0,0,0,0],
        [value ** 5,0,0,0,0,0],
    ]));
};
//TODO Refactor this when you have time
class A32NX_FuelPred {

    /**
     * Computes a flight time when a user inputs they're own weight for alternate fuel
     * @param {number} fuel - fuel in kg e.g 1200KG
     * @param {number} flightLevel - Flight Level in raw form e.g FL120 = 120
     * @return {number} predicted flight time
     */
    static computeUserAltTime(fuel, flightLevel) {
        const fuelMatrix = _buildAMatrix6(fuel);
        const flightLevelMatrix = _buildBMatrix6(flightLevel);
        const mmOfFuelFL = math.multiply(flightLevelMatrix, fuelMatrix);
        return (Math.round(math.sum(math.dotMultiply(userAltTimeCoeff, mmOfFuelFL))));
    }

    /**
     * Computes Air Distance in NM using computed polynomial coefficients
     * @param {number} groundDistance - ground distance in NM e.g 200
     * @param {number} windComponent - wind in KTs, HD should be identified with a negative number
     * e.g HD150 == -150 vice versa for tailwind
     * @returns {number} computedAirDistance in NM
     */
    static computeAirDistance(groundDistance, windComponent) {
        const groundMatrix = _buildAMatrix7(groundDistance);
        const windMatrix = _buildBMatrix7(windComponent);

        const mmOfGroundWind = math.multiply(windMatrix, groundMatrix);
        return (Math.round(math.sum(math.dotMultiply(airDistanceCoeff,mmOfGroundWind))));
    }

    /**
     *
     * @param {number} weight - ZFW weight of the aircraft in padded form e.g 53,000KG = 53
     * @param {number} flightLevel - Flight level in padded form without any alpha chracters e.g FL250 = 250
     * @return {number} predicted fuel flow for one engine per hour e.g result = 600, then 600kg for 30 minutes of holding
     */
    static computeHoldingTrackFF(weight, flightLevel) {
        const weightMatrix = _buildAMatrix7(weight);
        const flightLevelMatrix = _buildBMatrix7(flightLevel);
        const mmOfWeightFL = math.multiply(flightLevelMatrix, weightMatrix);
        return (Math.round(math.sum(math.dotMultiply(holdingFFCoeff,mmOfWeightFL))));
    }

    /**
     * Computes time, fuel and corrections needed for a trip or alternate //TODO work on a new method name
     * @param {number} airDistance - air distance in NM e.g 200
     * @param {number} flightLevel - cruising flight level e.g FL290 == 290
     * @param {computations} computation - ENUM of either TIME, FUEL or CORRECTIONS
     * @param {boolean} alternate - States whether this computations is for an alternate destination or not
     * @returns {number} fuel consumed in KG
     */
    static computeNumbers(airDistance, flightLevel, computation, alternate) {
        const airDistanceMatrix = _buildAMatrix6(airDistance);
        const flightLevelMatrix = _buildBMatrix6(flightLevel);
        const mmOfDistFL = math.multiply(flightLevelMatrix, airDistanceMatrix);
        //TODO Create logic for handling 200NM and FL390 = 0
        switch (computation) {
            case this.computations.FUEL:
                return (Math.round(math.sum(math.dotMultiply((alternate ? altFuelConsumedCoef : fuelConsumedCoeff), mmOfDistFL))));
            case this.computations.TIME:
                return (Math.round(math.sum(math.dotMultiply((alternate ? altTimeCoef : timeCoeff), mmOfDistFL))));
            case this.computations.CORRECTIONS:
                return (Math.round(math.sum(math.dotMultiply((alternate ? altCorrectionsCoeff : correctionsCoef), mmOfDistFL))));
        }
    }

    constructor() {
    }
}

A32NX_FuelPred.refWeight = 127;

A32NX_FuelPred.computations = {
    TIME:"time",
    FUEL:"fuel",
    CORRECTIONS:"corrections"
};

A32NX_FuelPred.correction = {
    LOW_AIR_CONDITIONING : -0.005,
    ENGINE_ANTI_ICE_ON : 0.015,
    TOTAL_ANTI_ICE_ON : 0.03,
};

A32NX_FuelPred.altCorrection = {
    LOW_AIR_CONDITIONING: -0.005,
    ENGINE_ANTI_ICE_ON: 0.03,
    TOTAL_ANTI_ICE_ON: 0.05,
    LOW_AIR_CONDITIONING_HIGH_FL: -0.005,
    ENGINE_ANTI_ICE_ON_HIGH_FL : 0.03,
    TOTAL_ANTI_ICE_ON_HIGH_FL : 0.05
};
