// DO NOT TOUCH THESE VALUES
const airDistanceCoeff = math.bignumber(
  math.matrix([
    [9.779028e-1, 9.951246e-1, -4.702127e-7, 2.230098e-9, -7.4079e-13, 8.863211e-17, -3.597783e-21],
    [-5.007965e-2, -1.818927e-3, -3.665975e-7, 1.077488e-10, -1.188721e-14, 4.487035e-19, 0],
    [5.794173e-5, 5.115704e-6, 7.291942e-11, -4.826778e-14, 3.508882e-18, 0, 0],
    [9.401828e-7, -1.467344e-8, 1.187063e-12, -6.680338e-17, 0, 0, 0],
    [-1.861956e-8, 2.995026e-11, -7.589918e-16, 0, 0, 0, 0],
    [-7.96257e-12, -5.020335e-14, 0, 0, 0, 0, 0],
    [5.854406e-13, 0, 0, 0, 0, 0, 0],
  ]),
);

// DO NOT TOUCH THESE VALUES
const fuelConsumedCoeff = math.bignumber(
  math.matrix([
    [-9.161961e4, -1.381339e2, -8.157919e-2, -6.058575e-6, -2.156416e-10, -4.73166e-15],
    [2.475284e3, 3.435854, 9.037147e-4, 4.428933e-8, 8.570681e-13, 0],
    [-2.507487e1, -2.354422e-2, -3.287808e-6, -8.04632e-11, 0, 0],
    [1.186459e-1, 6.489072e-5, 3.928366e-9, 0, 0, 0],
    [-2.638919e-4, -6.332963e-8, 0, 0, 0, 0],
    [2.227639e-7, 0, 0, 0, 0, 0],
  ]),
);

// DO NOT TOUCH THESE VALUES
const timeCoeff = math.bignumber(
  math.matrix([
    [-3.497819e1, 1.755135e-1, -1.4836e-4, 9.941283e-10, -1.417994e-13, 7.894638e-18],
    [8.914109e-1, 2.20446e-3, 1.234037e-6, -2.168292e-13, -1.295045e-16, 0],
    [-8.895819e-3, -2.163192e-5, -3.436463e-9, 4.931536e-15, 0, 0],
    [4.405072e-5, 6.409457e-8, 3.095191e-12, 0, 0, 0],
    [-9.95527e-8, -6.093408e-11, 0, 0, 0, 0],
    [8.197678e-11, 0, 0, 0, 0, 0],
  ]),
);

// DO NOT TOUCH THESE VALUES
const correctionsCoef = math.bignumber(
  math.matrix([
    [3.115471e2, -1.86259, -1.297471e-4, -8.347624e-9, 4.460148e-13, -8.637704e-18],
    [-5.761179, 3.300606e-2, 1.062724e-6, 3.429648e-11, -7.340176e-16, 0],
    [3.708191e-2, -1.866542e-4, -2.820851e-9, -3.961275e-14, 0, 0],
    [-1.110306e-4, 4.31992e-7, 2.557596e-12, 0, 0, 0],
    [1.622544e-7, -3.552638e-10, 0, 0, 0, 0],
    [-9.547702e-11, 0, 0, 0, 0, 0],
  ]),
);

// DO NOT TOUCH THESE VALUES
const altFuelConsumedCoef = math.bignumber(
  math.matrix([
    [-1.571043e4, 5.257092e1, -9.903038e-2, 1.69445e-4, -1.249483e-7, 3.296024e-11],
    [3.631312e2, -2.924318e-1, 8.134303e-5, -8.686386e-8, 4.504395e-11, 0],
    [-3.071606, 1.802242e-3, -1.936804e-7, -3.826465e-11, 0, 0],
    [1.181541e-2, -4.84766e-6, 4.272724e-10, 0, 0, 0],
    [-2.119183e-5, 4.407512e-9, 0, 0, 0, 0],
    [1.449335e-8, 0, 0, 0, 0, 0],
  ]),
);

// DO NOT TOUCH THESE VALUES
const altTimeCoef = math.bignumber(
  math.matrix([
    [-1.193071e1, 1.979053e-1, -2.121728e-4, 5.848221e-7, -4.531123e-10, 1.082834e-13],
    [5.313365e-1, 1.103979e-3, -1.590365e-6, -6.108075e-10, 6.77853e-13, 0],
    [-6.971177e-3, -4.794461e-6, 1.056466e-8, -3.170493e-12, 0, 0],
    [3.725848e-5, -5.374077e-9, -6.575239e-12, 0, 0, 0],
    [-8.258858e-8, 1.583685e-11, 0, 0, 0, 0],
    [6.645085e-11, 0, 0, 0, 0, 0],
  ]),
);

// DO NOT TOUCH THESE VALUES
const altCorrectionsCoeff = math.bignumber(
  math.matrix([
    [1.763742e1, 5.941845e-2, -1.138968e-5, -2.817395e-8, 3.939682e-11, -1.598564e-14],
    [-5.161422e-1, -2.222699e-4, 2.18796e-7, -2.978784e-11, 1.790163e-14, 0],
    [5.410081e-3, 9.776159e-7, -7.556183e-10, -1.171516e-13, 0, 0],
    [-2.605041e-5, -1.835557e-9, 1.453374e-12, 0, 0, 0],
    [5.887368e-8, 6.000201e-13, 0, 0, 0, 0],
    [-4.99481e-11, 0, 0, 0, 0, 0],
  ]),
);

// DO NOT TOUCH THESE VALUES
const holdingFFCoeff = math.bignumber(
  math.matrix([
    [1.826328e4, -5.403272e2, 7.199338, -5.025826e-2, 1.977122e-4, -4.144865e-7, 3.608388e-10],
    [-1.432111e2, 2.633272, -1.943797e-2, 7.464789e-5, -1.602546e-7, 1.616421e-10, 0],
    [1.437683, -1.941702e-2, 8.453197e-5, -1.185258e-7, -8.1878e-12, 0, 0],
    [-7.606324e-3, 8.534331e-5, -2.95964e-7, 3.290314e-10, 0, 0, 0],
    [1.753325e-5, -1.358419e-7, 2.320078e-10, 0, 0, 0, 0],
    [-1.934846e-8, 8.274778e-11, 0, 0, 0, 0, 0],
    [7.60044e-12, 0, 0, 0, 0, 0, 0],
  ]),
);

// DO NOT TOUCH THESE VALUES
const userAltTimeCoeff = math.bignumber(
  math.matrix([
    [8.343296e1, 3.150677e-2, -7.217543e-6, 7.881656e-10, -3.31816e-14, 4.684663e-19],
    [-2.655681, 1.33268e-4, 4.578915e-9, -1.499822e-12, 4.752258e-17, 0],
    [2.167311e-2, -9.457384e-7, 7.305311e-11, -9.87893e-16, 0, 0],
    [-8.203351e-5, 1.045678e-9, -6.95703e-14, 0, 0, 0],
    [1.537776e-7, 4.543417e-15, 0, 0, 0, 0],
    [-1.137157e-10, 0, 0, 0, 0, 0],
  ]),
);

/**
 * @param {number}value - the value to build the matrix from
 * @returns {math.matrix} return a 7x7 matrix for A predictors
 */
const _buildAMatrix7 = (value) => {
  return math.bignumber(
    math.matrix([
      [1, value ** 1, value ** 2, value ** 3, value ** 4, value ** 5, value ** 6],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ]),
  );
};

/**
 * @param {number}value - the value to build the matrix from
 * @returns {math.matrix} return a 6x6 matrix for A predictors
 */
const _buildAMatrix6 = (value) => {
  return math.bignumber(
    math.matrix([
      [1, value ** 1, value ** 2, value ** 3, value ** 4, value ** 5],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
    ]),
  );
};

/**
 * @param {number}value - the value to build the matrix from
 * @returns {math.matrix} return a 7x7 matrix for B predictors
 */
const _buildBMatrix7 = (value) => {
  return math.bignumber(
    math.matrix([
      [1, 0, 0, 0, 0, 0, 0],
      [value ** 1, 0, 0, 0, 0, 0, 0],
      [value ** 2, 0, 0, 0, 0, 0, 0],
      [value ** 3, 0, 0, 0, 0, 0, 0],
      [value ** 4, 0, 0, 0, 0, 0, 0],
      [value ** 5, 0, 0, 0, 0, 0, 0],
      [value ** 6, 0, 0, 0, 0, 0, 0],
    ]),
  );
};

/**
 * @param {number}value - the value to build the matrix from
 * @returns {math.matrix} return a 6x6 matrix for B predictors
 */
const _buildBMatrix6 = (value) => {
  return math.bignumber(
    math.matrix([
      [1, 0, 0, 0, 0, 0],
      [value ** 1, 0, 0, 0, 0, 0],
      [value ** 2, 0, 0, 0, 0, 0],
      [value ** 3, 0, 0, 0, 0, 0],
      [value ** 4, 0, 0, 0, 0, 0],
      [value ** 5, 0, 0, 0, 0, 0],
    ]),
  );
};

//A330 Factor
const factor = 0.84;

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
    return Math.round(math.sum(math.dotMultiply(userAltTimeCoeff, mmOfFuelFL)) * factor);
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
    return Math.round(math.sum(math.dotMultiply(airDistanceCoeff, mmOfGroundWind)));
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
    return Math.round(math.sum(math.dotMultiply(holdingFFCoeff, mmOfWeightFL)) * factor);
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
        return Math.round(
          math.sum(math.dotMultiply(alternate ? altFuelConsumedCoef : fuelConsumedCoeff, mmOfDistFL)) * factor,
        );
      case this.computations.TIME:
        return Math.round(math.sum(math.dotMultiply(alternate ? altTimeCoef : timeCoeff, mmOfDistFL)));
      case this.computations.CORRECTIONS:
        return Math.round(math.sum(math.dotMultiply(alternate ? altCorrectionsCoeff : correctionsCoef, mmOfDistFL)));
    }
  }

  constructor() {}
}

A32NX_FuelPred.refWeight = 127;

A32NX_FuelPred.computations = {
  TIME: 'time',
  FUEL: 'fuel',
  CORRECTIONS: 'corrections',
};

A32NX_FuelPred.correction = {
  LOW_AIR_CONDITIONING: -0.005,
  ENGINE_ANTI_ICE_ON: 0.015,
  TOTAL_ANTI_ICE_ON: 0.03,
};

A32NX_FuelPred.altCorrection = {
  LOW_AIR_CONDITIONING: -0.005,
  ENGINE_ANTI_ICE_ON: 0.03,
  TOTAL_ANTI_ICE_ON: 0.05,
  LOW_AIR_CONDITIONING_HIGH_FL: -0.005,
  ENGINE_ANTI_ICE_ON_HIGH_FL: 0.03,
  TOTAL_ANTI_ICE_ON_HIGH_FL: 0.05,
};
