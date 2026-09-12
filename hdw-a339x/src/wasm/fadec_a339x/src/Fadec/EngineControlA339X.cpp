// Copyright (c) 2023-2024 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

#include "logging.h"
#include "lvar_encoder.hpp"
#include "simple_assert.h"

#ifdef PROFILING
#include "ScopedTimer.hpp"
#include "SimpleProfiler.hpp"
#endif

#include "EngineControlA339X.h"
#include "EngineRatios.hpp"
#include "Polynomials_A339X.hpp"
#include "Tables1502_A339X.hpp"
#include "ThrustLimits_A339X.hpp"

#include <algorithm>
#include <numeric>
#include <sstream>

void EngineControl_A339X::initialize(MsfsHandler* msfsHandler) {
  this->msfsHandlerPtr = msfsHandler;
  this->dataManagerPtr = &msfsHandler->getDataManager();
  this->simData.initialize(dataManagerPtr);
  fuelConfiguration.setConfigFilename(FILENAME_FADEC_CONF_DIRECTORY + atcId + FILENAME_FADEC_CONF_FILE_EXTENSION);
  LOG_INFO("Fadec::EngineControl_A339X::initialize() - initialized");
}

void EngineControl_A339X::shutdown() {
  LOG_INFO("Fadec::EngineControl_A339X::shutdown()");
}

void EngineControl_A339X::update() {
#ifdef PROFILING
  profilerUpdate.start();
#endif

  bool isSimulationReady = msfsHandlerPtr->getAircraftIsReadyVar();

  if (!isSimulationReady) {
    // still request atc id so it is ready once the initialization starts
    simData.atcIdDataPtr->requestUpdateFromSim(msfsHandlerPtr->getTimeStamp(), msfsHandlerPtr->getTickCounter());
    return;
  }

  if (!fadecInitialized) {
    initializeFuelStatePath();
    initializeEngineControlData();
    fadecInitialized = true;
  }

  const double deltaTime          = std::max(0.002, msfsHandlerPtr->getSimulationDeltaTime());
  const double simTime            = msfsHandlerPtr->getSimulationTime();
  const double mach               = simData.simVarsDataPtr->data().airSpeedMach;
  const double pressureAltitude   = simData.simVarsDataPtr->data().pressureAltitude;
  const double ambientTemperature = simData.simVarsDataPtr->data().ambientTemperature;
  const double ambientPressure    = simData.simVarsDataPtr->data().ambientPressure;
  const double imbalance          = simData.engineImbalance->get();
  const double idleN3             = simData.engineIdleN3->get();

  generateIdleParameters(pressureAltitude, mach, ambientTemperature, ambientPressure);

  double simN1highest;

  for (int engine = 1; engine <= 2; engine++) {
    const int engineIdx = engine - 1;

    double simCN1 = simData.correctedN1DataPtr[engineIdx]->data().correctedN1;
    double simN1  = simData.simVarsDataPtr->data().simEngineN1[engineIdx];
    double simN3  = simData.simVarsDataPtr->data().simEngineN2[engineIdx];

    double       engineTimer   = simData.engineTimer[engineIdx]->get();
    const int    engineIgniter = static_cast<int>(simData.simVarsDataPtr->data().engineIgniter[engineIdx]);  // 0: crank, 1:norm, 2: ign
    bool         engineStarter = static_cast<bool>(simData.simVarsDataPtr->data().engineStarter[engineIdx]);
    const double engineStarterPressurized   = simData.engineStarterPressurized[engineIdx]->get();
    const double engineFuelValveOpen        = simData.simVarsDataPtr->data().engineFuelValveOpen[engineIdx];
    const bool   engineFuelValveFullyClosed = engineFuelValveOpen == 0;
    const bool   engineFuelValveFullyOpen   = engineFuelValveOpen == 1;

    // simulates delay to start valve open through fuel valve travel time
    const bool engineMasterTurnedOn  = (prevEngineMasterPos[engineIdx] < 1 && engineFuelValveFullyOpen);
    const bool engineMasterTurnedOff = (prevEngineMasterPos[engineIdx] > 0 && engineFuelValveFullyClosed);

    // starts engines if Engine Master is turned on and Starter is pressurized
    // or the engine is still spinning fast enough
    if (!engineStarter && engineFuelValveFullyOpen && (engineStarterPressurized || simN3 >= 20)) {
      simData.setStarterHeldEvent[engineIdx]->trigger(1);
      engineStarter = true;
    }
    // shuts off engines if Engine Master is turned off or starter is depressurized while N3 is below 20%
    else if (engineStarter && (engineFuelValveFullyClosed || (engineFuelValveFullyOpen && !engineStarterPressurized && simN3 < 20))) {
      simData.setStarterHeldEvent[engineIdx]->trigger(0);
      simData.setStarterEvent[engineIdx]->trigger(0);
      engineStarter = false;
    }

    const bool engineStarterTurnedOff = prevEngineStarterState[engineIdx] == 1 && !engineStarter;

    // Set & Check Engine Status for this Cycle
    EngineState engineState = engineStateMachine(engine,                  //
                                                 engineIgniter,           //
                                                 engineStarter,           //
                                                 engineStarterTurnedOff,  //
                                                 engineMasterTurnedOn,    //
                                                 engineMasterTurnedOff,   //
                                                 simN3,                   //
                                                 idleN3,                  //
                                                 ambientTemperature);     //

    switch (engineState) {
      case STARTING:
      case RESTARTING:
        if (engineStarter) {
          engineStartProcedure(engine, engineState, imbalance, deltaTime, engineTimer, simN3, pressureAltitude, ambientTemperature);
          break;
        }
      case SHUTTING:
        engineShutdownProcedure(engine, ambientTemperature, simN1, deltaTime, engineTimer);
        updateFF(engine, imbalance, simCN1, mach, pressureAltitude, ambientTemperature, ambientPressure);
        break;
      default:
        updatePrimaryParameters(engine, imbalance, simN1, simN3);
        const double correctedFuelFlow = updateFF(engine, imbalance, simCN1, mach, pressureAltitude, ambientTemperature, ambientPressure);
        updateEGT(engine, imbalance, deltaTime, msfsHandlerPtr->getSimOnGround(), engineState, simCN1, correctedFuelFlow, mach,
                  pressureAltitude, ambientTemperature);
        // updateOil(engine, imbalance, thrust, simN3, deltaN2, deltaTime, ambientTemp);
    }

    // set highest N1 from either engine
    simN1highest                      = (std::max)(simN1highest, simN1);
    prevEngineMasterPos[engineIdx]    = engineFuelValveOpen;
    prevEngineStarterState[engineIdx] = engineStarter;
  }

  // update fuel & tank data
  updateFuel(msfsHandlerPtr->getSimulationDeltaTime());

  // Obtain Bleed Variables and update Thrust Limits
  const int packs = (simData.packsState[L]->get() > 0.5 || simData.packsState[R]->get() > 0.5) ? 1 : 0;
  const int nai = (simData.simVarsDataPtr->data().engineAntiIce[L] > 0.5 || simData.simVarsDataPtr->data().engineAntiIce[R] > 0.5) ? 1 : 0;
  const int wai = simData.wingAntiIce->getAsInt64();
  updateThrustLimits(simTime, pressureAltitude, ambientTemperature, ambientPressure, mach, simN1highest, packs, nai, wai);

#ifdef PROFILING
  profilerUpdate.stop();
  if (msfsHandlerPtr->getTickCounter() % 100 == 0) {
    profilerUpdate.print();
  }
#endif
}

// =============================================================================
// PRIVATE
// =============================================================================

void EngineControl_A339X::initializeFuelStatePath() {
#ifdef PROFILING
  profilerInitializeFuelStatePath.start();
#endif
  if (!fuelStatePathInitialized) {
    bool isSimulationReady = msfsHandlerPtr->getAircraftIsReadyVar();

    // Wait for instrument initialization so SimConnect can return the ATC ID.
    if (isSimulationReady) {
      if (simData.atcIdDataPtr->data().atcID[0] != '\0') {
        atcId = simData.atcIdDataPtr->data().atcID;
        LOG_INFO("Fadec::EngineControl_A339X::initializeFuelStatePath() - received ATC ID: " + atcId);
        fuelConfiguration.setConfigFilename(FILENAME_FADEC_CONF_DIRECTORY + atcId + FILENAME_FADEC_CONF_FILE_EXTENSION);
      } else {
        LOG_INFO("Fadec::EngineControl_A339X::initializeFuelStatePath() - no ATC ID received, taking default: " + atcId);
      }
      // An empty ATC ID keeps the default path.
      fuelStatePathInitialized = true;
    }
  }

#ifdef PROFILING
  profilerInitializeFuelStatePath.stop();
  if (msfsHandlerPtr->getTickCounter() % 100 == 0) {
    profilerInitializeFuelStatePath.print();
  }
#endif
}
/**
 * @brief Initializes the engine control data.
 *
 * This function initializes the engine control data for the aircraft. It is called when the ATC ID
 * is received from the simulator.
 */
void EngineControl_A339X::initializeEngineControlData() {
  LOG_INFO("Fadec::EngineControl_A339X::initializeEngineControlData()");

#ifdef PROFILING
  ScopedTimer timer("Fadec::EngineControl_A339X::initializeEngineControlData()");
#endif

  const FLOAT64 timeStamp   = msfsHandlerPtr->getTimeStamp();
  const UINT64  tickCounter = msfsHandlerPtr->getTickCounter();

  // prepare random number generator for engine imbalance
  srand(time(0));

  // Initialize Engine Imbalance
  const double imbalance = generateEngineImbalance();
  simData.engineImbalance->set(imbalance);
  const double engineImbalanced = imbalanceExtractor(imbalance, 1);
  const double oilQtyImbalance  = imbalanceExtractor(imbalance, 5) / 10;

  // Setting initial Oil with some randomness and imbalance
  const double idleOilL = (rand() % (MAX_OIL - MIN_OIL + 1) + MIN_OIL) / 10;
  simData.engineOilTotal[L]->set(idleOilL - ((engineImbalanced == 1) ? oilQtyImbalance : 0));
  const double idleOilR = (rand() % (MAX_OIL - MIN_OIL + 1) + MIN_OIL) / 10;
  simData.engineOilTotal[R]->set(idleOilR - ((engineImbalanced == 2) ? oilQtyImbalance : 0));

  const bool engine1Combustion = static_cast<bool>(simData.engineCombustion[L]->updateFromSim(timeStamp, tickCounter));
  const bool engine2Combustion = static_cast<bool>(simData.engineCombustion[R]->updateFromSim(timeStamp, tickCounter));

  double oilTemperaturePre[2];
  if (msfsHandlerPtr->getSimOnGround() && engine1Combustion && engine2Combustion) {
    oilTemperaturePre[L] = 75.0;
    oilTemperaturePre[R] = 75.0;
  } else if (!msfsHandlerPtr->getSimOnGround() && engine1Combustion && engine2Combustion) {
    oilTemperaturePre[L] = 85.0;
    oilTemperaturePre[R] = 85.0;
  } else {
    oilTemperaturePre[L] = simData.simVarsDataPtr->data().ambientTemperature;
    oilTemperaturePre[R] = simData.simVarsDataPtr->data().ambientTemperature;
  }
  simData.oilTempDataPtr[L]->data().oilTemp = oilTemperaturePre[L];
  simData.oilTempDataPtr[L]->writeDataToSim();
  simData.oilTempDataPtr[R]->data().oilTemp = oilTemperaturePre[R];
  simData.oilTempDataPtr[R]->writeDataToSim();

  // Initialize Engine State
  simData.engineState[L]->set(OFF);
  simData.engineState[R]->set(OFF);

  // Resetting Engine Timers
  simData.engineTimer[L]->set(0);
  simData.engineTimer[R]->set(0);

  initializeFuelTanks(timeStamp, tickCounter);

  // Initialize Pump State
  simData.fuelPumpState[L]->set(0);
  simData.fuelPumpState[R]->set(0);

  // Initialize Thrust Limits
  simData.thrustLimitIdle->set(0);
  simData.thrustLimitClimb->set(0);
  simData.thrustLimitFlex->set(0);
  simData.thrustLimitMct->set(0);
  simData.thrustLimitToga->set(0);
}

void EngineControl_A339X::initializeFuelTanks(FLOAT64, UINT64) {
  // Native loading (cold, running, airborne, or saved flight) is authoritative.
  // Legacy INI restoration now requires an explicit grounded developer request.
  trimState             = {};
  havePreviousFuelTotal = false;
  simData.fuelStateStatus->set(0);
}

double EngineControl_A339X::generateEngineImbalance() {
  // TODO: Improve by assigning an imbalance to each engine to avoid one engine always having the default values

  double imbalanceCode;

  // Be aware the encode8Int8ToDouble function only allows a 15bit value for the first parameter
  // and 7bit for the other 7 parameters

  // Decide Engine with imbalance
  const uint8_t engine = (rand() % 2) + 1;

  // Obtain EGT imbalance (Max 20 degree C)
  const uint8_t egtImbalance = (rand() % 20) + 1;

  // Obtain FF imbalance (Max 36 Kg/h)
  const uint8_t ffImbalance = (rand() % 36) + 1;

  // Obtain N3 imbalance (Max 0.3%)
  const uint8_t n3Imbalance = (rand() % 30) + 1;

  // Obtain Oil Qty imbalance (Max 2.0 qt)
  const uint8_t oilQtyImbalance = (rand() % 20) + 1;

  // Obtain Oil Pressure imbalance (Max 3.0 PSI)
  const uint8_t oilPressureImbalance = (rand() % 30) + 1;

  // Obtain Oil Pressure Random Idle (-6 to +6 PSI)
  const uint8_t oilPressureIdle = (rand() % 12) + 1;

  // Obtain Oil Temperature (85 to 95 Celsius)
  const uint8_t oilTemperature = (rand() % 10) + 86;

  imbalanceCode = LVarEncoder::encode8Int8ToDouble(engine,                //
                                                   egtImbalance,          //
                                                   ffImbalance,           //
                                                   n3Imbalance,           //
                                                   oilQtyImbalance,       //
                                                   oilPressureImbalance,  //
                                                   oilPressureIdle,       //
                                                   oilTemperature         //
  );

  LOG_INFO("Fadec::EngineControl_A339X::generateEngineImbalance() - Values:\n Engine: " +
           std::to_string(LVarEncoder::extract8Int8FromDouble(imbalanceCode, 1)) + "\n" +
           "EGT Imbalance: " + std::to_string(LVarEncoder::extract8Int8FromDouble(imbalanceCode, 2)) + "\n" +
           "FF Imbalance: " + std::to_string(LVarEncoder::extract8Int8FromDouble(imbalanceCode, 3)) + "\n" +
           "N3 Imbalance: " + std::to_string(LVarEncoder::extract8Int8FromDouble(imbalanceCode, 4)) + "\n" +
           "Oil Quantity Imbalance: " + std::to_string(LVarEncoder::extract8Int8FromDouble(imbalanceCode, 5)) + "\n" +
           "Oil Pressure Imbalance: " + std::to_string(LVarEncoder::extract8Int8FromDouble(imbalanceCode, 6)) + "\n" +
           "Oil Pressure Idle: " + std::to_string(LVarEncoder::extract8Int8FromDouble(imbalanceCode, 7)) + "\n" +
           "Oil Temperature Max: " + std::to_string(LVarEncoder::extract8Int8FromDouble(imbalanceCode, 8)));

  return imbalanceCode;
}

double EngineControl_A339X::imbalanceExtractor(double imbalanceCode, int parameter) {
  return LVarEncoder::extract8Int8FromDouble(imbalanceCode, parameter);
}

void EngineControl_A339X::generateIdleParameters(double pressAltitude, double mach, double ambientTemp, double ambientPressure) {
  const double idleCN1 = Table1502_A339X::iCN1(pressAltitude, mach, ambientTemp);
  const double idleN1  = idleCN1 * sqrt(EngineRatios::theta2(0, ambientTemp));
  const double idleN3  = Table1502_A339X::iCN2(pressAltitude, mach) * sqrt(EngineRatios::theta(ambientTemp));
  const double idleCFF = Polynomial_A339X::correctedFuelFlow(idleCN1, 0, pressAltitude);  // lbs/hr
  const double idleFF =
      idleCFF * Fadec::LBS_TO_KGS * EngineRatios::delta2(0, ambientPressure) * sqrt(EngineRatios::theta2(0, ambientTemp));  // Kg/hr
  const double idleEGT = Polynomial_A339X::correctedEGT(idleCN1, idleCFF, 0, pressAltitude) * EngineRatios::theta2(0, ambientTemp);

  simData.engineIdleN1->set(idleN1);
  simData.engineIdleN3->set(idleN3);
  simData.engineIdleFF->set(idleFF);
  simData.engineIdleEGT->set(idleEGT);
}

EngineControl_A339X::EngineState EngineControl_A339X::engineStateMachine(int    engine,                  //
                                                                         double engineIgniter,           //
                                                                         bool   engineStarter,           //
                                                                         bool   engineStarterTurnedOff,  //
                                                                         bool   engineMasterTurnedOn,    //
                                                                         bool   engineMasterTurnedOff,   //
                                                                         double simN3,                   //
                                                                         double idleN3,                  //
                                                                         double ambientTemperature) {    //
#ifdef PROFILING
  profilerEngineStateMachine.start();
#endif

  const int engineIdx = engine - 1;

  bool resetTimer = false;

  EngineState engineState = static_cast<EngineState>(simData.engineState[engineIdx]->get());

  // Current State: OFF
  if (engineState == OFF) {
    if (engineIgniter == 1 && engineStarter && simN3 > 20) {
      engineState = ON;
    } else if (engineIgniter == 2 && engineMasterTurnedOn) {
      engineState = STARTING;
    } else {
      engineState = OFF;
    }
  }
  // Current State: ON
  else if (engineState == ON) {
    if (engineStarter) {
      engineState = ON;
    } else {
      engineState = SHUTTING;
    }
  }
  // Current State: Starting.
  else if (engineState == STARTING) {
    if (engineStarter && simN3 >= (idleN3 - 0.1)) {
      engineState = ON;
      resetTimer  = true;
    } else if (engineStarterTurnedOff || engineMasterTurnedOff) {
      engineState = SHUTTING;
      resetTimer  = true;
    } else {
      engineState = STARTING;
    }
  }
  // Current State: Re-Starting.
  else if (engineState == RESTARTING) {
    if (engineStarter && simN3 >= (idleN3 - 0.1)) {
      engineState = ON;
      resetTimer  = true;
    } else if (engineStarterTurnedOff || engineMasterTurnedOff) {
      engineState = SHUTTING;
      resetTimer  = true;
    } else {
      engineState = RESTARTING;
    }
  }
  // Current State: Shutting
  else if (engineState == SHUTTING) {
    if (engineIgniter == 2 && engineMasterTurnedOn) {
      engineState = RESTARTING;
      resetTimer  = true;
    } else if (!engineStarter && simN3 < 0.05 && simData.engineEgt[engineIdx]->get() <= ambientTemperature) {
      engineState = OFF;
      resetTimer  = true;
    } else if (engineStarter && simN3 > 50) {
      engineState = RESTARTING;
      resetTimer  = true;
    } else {
      engineState = SHUTTING;
    }
  }

  simData.engineState[engineIdx]->set(engineState);
  if (resetTimer) {
    simData.engineTimer[engineIdx]->set(0);
  }

  return engineState;

#ifdef PROFILING
  profilerEngineStateMachine.stop();
  if (msfsHandlerPtr->getTickCounter() % 100 == 0) {
    profilerEngineStateMachine.print();
  }
#endif
}

void EngineControl_A339X::engineStartProcedure(int                     engine,
                                               EngineState             engineState,
                                               double                  imbalance,
                                               double                  deltaTime,
                                               [[maybe_unused]] double engineTimer,
                                               double                  simN3,
                                               [[maybe_unused]] double pressureAltitude,
                                               double                  ambientTemperature) {
#ifdef PROFILING
  profilerEngineStartProcedure.start();
#endif

  const int engineIdx = engine - 1;

  const double idleN1  = simData.engineIdleN1->get();
  const double idleN3  = simData.engineIdleN3->get();
  const double idleFF  = simData.engineIdleFF->get();
  const double idleEGT = simData.engineIdleEGT->get();

  // Check which engine is imbalanced and set the imbalance parameters
  double n3Imbalance      = 0;
  double ffImbalance      = 0;
  double egtImbalance     = 0;
  double engineImbalanced = imbalanceExtractor(imbalance, 1);
  if (engineImbalanced == engine) {
    n3Imbalance  = imbalanceExtractor(imbalance, 4) / 100;
    ffImbalance  = imbalanceExtractor(imbalance, 3);
    egtImbalance = imbalanceExtractor(imbalance, 2);
  }

  if (msfsHandlerPtr->getSimOnGround()) {
    simData.engineFuelUsed[engineIdx]->set(0);
  }

  // Quick Start for expedited engine start for Aircraft Presets
  if (simData.aircraftPresetQuickMode->getAsBool() && simData.correctedN2DataPtr[engineIdx]->data().correctedN2 < idleN3) {
    LOG_INFO("Fadec::EngineControl_A339X::engineStartProcedure() - Quick Start");
    simN3                                                     = idleN3;
    simData.correctedN2DataPtr[engineIdx]->data().correctedN2 = idleN3;
    simData.correctedN2DataPtr[engineIdx]->writeDataToSim();
    simData.correctedN1DataPtr[engineIdx]->data().correctedN1 = idleN1;
    simData.correctedN1DataPtr[engineIdx]->writeDataToSim();
    simData.engineN1[engineIdx]->set(idleN1);
    simData.engineN2[engineIdx]->set(idleN3 + 0.7);
    simData.engineN3[engineIdx]->set(idleN3);
    simData.engineFF[engineIdx]->set(idleFF);
    simData.engineEgt[engineIdx]->set(idleEGT);
    simData.engineState[engineIdx]->set(ON);
    return;
  }

  const double preN3Fbw       = simData.engineN3[engineIdx]->get();
  const double preEgtFbw      = simData.engineEgt[engineIdx]->get();
  const double newN3Fbw       = Polynomial_A339X::startN2(simN3, preN3Fbw, idleN3 - n3Imbalance);
  const double startN1Fbw     = Polynomial_A339X::startN1(newN3Fbw, idleN3 - n3Imbalance, idleN1);
  const double startFfFbw     = Polynomial_A339X::startFF(newN3Fbw, idleN3 - n3Imbalance, idleFF - ffImbalance);
  const double startEgtFbw    = Polynomial_A339X::startEGT(newN3Fbw, idleN3 - n3Imbalance, ambientTemperature, idleEGT - egtImbalance);
  const double shutdownEgtFbw = Polynomial_A339X::shutdownEGT(preEgtFbw, ambientTemperature, deltaTime);

  simData.engineN3[engineIdx]->set(newN3Fbw);
  simData.engineN2[engineIdx]->set(newN3Fbw + 0.7);
  simData.engineN1[engineIdx]->set(startN1Fbw);
  simData.engineFF[engineIdx]->set(startFfFbw);

  if (engineState == RESTARTING) {
    if ((std::abs)(startEgtFbw - preEgtFbw) <= 1.5) {
      simData.engineEgt[engineIdx]->set(startEgtFbw);
      simData.engineState[engineIdx]->set(STARTING);
    } else if (startEgtFbw > preEgtFbw) {
      simData.engineEgt[engineIdx]->set(preEgtFbw + (0.75 * deltaTime * (idleN3 - newN3Fbw)));
    } else {
      simData.engineEgt[engineIdx]->set(shutdownEgtFbw);
    }
  } else {
    simData.engineEgt[engineIdx]->set(startEgtFbw);
  }

  simData.oilTempDataPtr[engineIdx]->data().oilTemp = Polynomial_A339X::startOilTemp(newN3Fbw, idleN3, ambientTemperature);
  simData.oilTempDataPtr[engineIdx]->writeDataToSim();

#ifdef PROFILING
  profilerEngineStartProcedure.stop();
  if (msfsHandlerPtr->getTickCounter() % 100 == 0) {
    profilerEngineStartProcedure.print();
  }
#endif
}

void EngineControl_A339X::engineShutdownProcedure(int    engine,              //
                                                  double ambientTemperature,  //
                                                  double simN1,               //
                                                  double deltaTime,           //
                                                  double engineTimer) {       //
#ifdef PROFILING
  profilerEngineShutdownProcedure.start();
#endif

  const int engineIdx = engine - 1;

  // Quick Shutdown for expedited engine shutdown for Aircraft Presets
  if (simData.aircraftPresetQuickMode->getAsBool() && simData.correctedN2DataPtr[engineIdx]->data().correctedN2 > 0.0) {
    LOG_INFO("Fadec::EngineControl_A339X::engineShutdownProcedure() - Quick Shutdown");
    simData.correctedN2DataPtr[engineIdx]->data().correctedN2 = 0;
    simData.correctedN2DataPtr[engineIdx]->writeDataToSim();
    simData.correctedN1DataPtr[engineIdx]->data().correctedN1 = 0;
    simData.correctedN1DataPtr[engineIdx]->writeDataToSim();
    simData.engineN1[engineIdx]->set(0);
    simData.engineN2[engineIdx]->set(0);
    simData.engineN3[engineIdx]->set(0);
    simData.engineFF[engineIdx]->set(0);
    simData.engineEgt[engineIdx]->set(ambientTemperature);
    simData.engineTimer[engineIdx]->set(2.0);  // to skip the delay further down
    return;
  }

  if (engineTimer < 1.8) {
    simData.engineTimer[engineIdx]->set(engineTimer + deltaTime);
  } else {
    const double preN1Fbw  = simData.engineN1[engineIdx]->get();
    const double preN3Fbw  = simData.engineN3[engineIdx]->get();
    const double preEgtFbw = simData.engineEgt[engineIdx]->get();

    double newN1Fbw = Polynomial_A339X::shutdownN1(preN1Fbw, deltaTime);
    if (simN1 < 5 && simN1 > newN1Fbw) {  // Takes care of windmilling
      newN1Fbw = simN1;
    }
    const double newN3Fbw  = Polynomial_A339X::shutdownN2(preN3Fbw, deltaTime);
    const double newEgtFbw = Polynomial_A339X::shutdownEGT(preEgtFbw, ambientTemperature, deltaTime);

    simData.engineN1[engineIdx]->set(newN1Fbw);
    simData.engineN2[engineIdx]->set(newN3Fbw + 0.7);
    simData.engineN3[engineIdx]->set(newN3Fbw);
    simData.engineEgt[engineIdx]->set(newEgtFbw);
  }

#ifdef PROFILING
  profilerEngineShutdownProcedure.stop();
  if (msfsHandlerPtr->getTickCounter() % 100 == 0) {
    profilerEngineShutdownProcedure.print();
  }
#endif
}

double EngineControl_A339X::updateFF(int    engine,
                                     double imbalance,
                                     double simCN1,
                                     double mach,
                                     double pressureAltitude,
                                     double ambientTemperature,
                                     double ambientPressure) {
#ifdef PROFILING
  profilerUpdateFF.start();
#endif

  const double correctedFuelFlow = Polynomial_A339X::correctedFuelFlow(simCN1, mach, pressureAltitude);  // in lbs/hr.

  // Check which engine is imbalanced and set the imbalance parameter
  const double engineImbalanced = imbalanceExtractor(imbalance, 1);
  double       ffImbalance      = 0;
  if (engineImbalanced == engine && correctedFuelFlow >= 1) {
    ffImbalance = imbalanceExtractor(imbalance, 3);
  }

  // Checking Fuel Logic and final Fuel Flow
  double outFlow = 0;
  if (correctedFuelFlow >= 1) {
    outFlow = std::max(0.0,                                                                                  //
                       (correctedFuelFlow * Fadec::LBS_TO_KGS * EngineRatios::delta2(mach, ambientPressure)  //
                        * (std::sqrt)(EngineRatios::theta2(mach, ambientTemperature)))                       //
                           - ffImbalance);                                                                   //
  }
  simData.engineFF[engine - 1]->set(outFlow);

#ifdef PROFILING
  profilerUpdateFF.stop();
  if (msfsHandlerPtr->getTickCounter() % 100 == 0) {
    profilerUpdateFF.print();
  }
#endif

  return correctedFuelFlow;
}

void EngineControl_A339X::updatePrimaryParameters(int engine, double imbalance, double simN1, double simN3) {
#ifdef PROFILING
  profilerUpdatePrimaryParameters.start();
#endif

  const int engineIdx = engine - 1;

  // Check which engine is imbalanced and set the imbalance parameter
  const double engineImbalanced = imbalanceExtractor(imbalance, 1);
  double       n3Imbalance      = 0;
  if (engineImbalanced == engine) {
    n3Imbalance = imbalanceExtractor(imbalance, 4) / 100;
  }
  simData.engineN1[engineIdx]->set(simN1);
  simData.engineN2[engineIdx]->set((std::max)(0.0, simN3 - n3Imbalance));
  simData.engineN3[engineIdx]->set(simN3);

#ifdef PROFILING
  profilerUpdatePrimaryParameters.stop();
  if (msfsHandlerPtr->getTickCounter() % 100 == 0) {
    profilerUpdatePrimaryParameters.print();
  }
#endif
}

void EngineControl_A339X::updateEGT(int         engine,
                                    double      imbalance,
                                    double      deltaTime,
                                    double      simOnGround,
                                    EngineState engineState,
                                    double      simCN1,
                                    double      customFuelFlow,
                                    double      mach,
                                    double      pressureAltitude,
                                    double      ambientTemperature) {
#ifdef PROFILING
  profilerUpdateEGT.start();
#endif

  const int engineIdx = engine - 1;

  if (simOnGround == 1 && engineState == OFF) {
    simData.engineEgt[engineIdx]->set(ambientTemperature);
  } else {
    // Check which engine is imbalanced and set the imbalance parameter
    const double engineImbalanced = imbalanceExtractor(imbalance, 1);
    double       egtImbalance     = 0;
    if (engineImbalanced == engine) {
      egtImbalance = imbalanceExtractor(imbalance, 2);
    }
    const double correctedEGT      = Polynomial_A339X::correctedEGT(simCN1, customFuelFlow, mach, pressureAltitude);
    const double egtFbwPreviousEng = simData.engineEgt[engineIdx]->get();
    double       egtFbwActualEng   = (correctedEGT * EngineRatios::theta2(mach, ambientTemperature)) - egtImbalance;
    egtFbwActualEng                = egtFbwActualEng + (egtFbwPreviousEng - egtFbwActualEng) * (std::exp)(-0.1 * deltaTime);
    simData.engineEgt[engineIdx]->set(egtFbwActualEng);
  }

#ifdef PROFILING
  profilerUpdateEGT.stop();
  if (msfsHandlerPtr->getTickCounter() % 100 == 0) {
    profilerUpdateEGT.print();
  }
#endif
}

void EngineControl_A339X::updateFuel(double deltaTimeSeconds) {
  using namespace a339x::fuel;
  const auto& native = simData.simVarsDataPtr->data();
  Input       input;
  input.tanksGallons            = {native.fuelTankQuantityCenter,  native.fuelTankQuantityLeft,     native.fuelTankQuantityRight,
                                   native.fuelTankQuantityLeftAux, native.fuelTankQuantityRightAux, native.fuelTankQuantityTrim};
  input.densityKgPerGallon      = native.fuelWeightPerGallon * Fadec::LBS_TO_KGS;
  const bool paused             = msfsHandlerPtr->getPauseState() != 0 || deltaTimeSeconds <= 0.;
  input.dtSeconds               = paused ? 0. : deltaTimeSeconds;
  const bool   refuelRequested  = simData.refuelStartedByUser->getAsBool();
  const double externalSequence = simData.fuelExternalSequence->get();
  // A refuel batch may start and finish between two FADEC reads. Its sequence
  // marks that write even when the start flag is already false. Let native
  // quantity readback settle before issuing another custom quantity write.
  input.refueling            = refuelRequested || wasRefueling || externalSequence != previousExternalSequence;
  wasRefueling               = refuelRequested;
  previousExternalSequence   = externalSequence;
  input.onGround             = msfsHandlerPtr->getSimOnGround();
  input.crossfeedOpen        = native.xFeedValve > 0.;
  input.engineFeedPumpActive = {native.fuelPump1[L] > 0. || native.fuelPump2[L] > 0., native.fuelPump1[R] > 0. || native.fuelPump2[R] > 0.};
  input.trimEnabled          = simData.trimEnabled->getAsBool();
  const double command       = simData.trimCommand->get();
  input.trimCommand          = command == 0.   ? TrimCommand::Off
                               : command == 1. ? TrimCommand::Aft
                               : command == 2. ? TrimCommand::Forward
                                               : static_cast<TrimCommand>(-1);
  input.trimTargetGallons    = simData.trimTarget->get();
  input.trimRateGallonsPerSecond = simData.trimRate->get();
  input.pumpPowered              = simData.trimPumpPower->getAsBool();
  input.valvePowered             = simData.trimValvePower->getAsBool();
  input.pumpFailed               = simData.trimPumpFailed->getAsBool();
  input.valveStuck               = simData.trimValveStuck->getAsBool();
  const bool invalidTrimControl =
      input.trimEnabled &&
      (!std::isfinite(input.trimTargetGallons) || input.trimTargetGallons < 0. || input.trimTargetGallons > TankCapacities[5] ||
       !std::isfinite(input.trimRateGallonsPerSecond) || input.trimRateGallonsPerSecond < 0. ||
       !std::isfinite(input.trimRateGallonsPerSecond * input.dtSeconds) || (command != 0. && command != 1. && command != 2.));
  // An invalid developer transfer setting must never grant engines free fuel.
  if (!input.trimEnabled || invalidTrimControl) {
    input.trimEnabled              = false;
    input.trimCommand              = TrimCommand::Off;
    input.trimTargetGallons        = 0.;
    input.trimRateGallonsPerSecond = 0.;
  }

  // Native engine consumption is disabled by engines.cfg fuel_flow_scalar=0.
  // Native APU consumption and native center/outer transfers stay in this snapshot.
  // Never reconstruct those transfers from old quantities or subtract the APU twice.
  const bool freezeBurn = paused || input.refueling || native.unlimitedFuel > 0. || msfsHandlerPtr->getAircraftDevelopmentStateVar() == 2;
  for (int e = 0; e < 2; ++e) {
    const double flow = simData.engineFF[e]->get();  // kg/hour
    if (!freezeBurn && simData.engineState[e]->getAsInt64() != OFF && native.engineFuelValveOpen[e] > 0.) {
      input.engineKgPerSecond[e] = (flow + simData.enginePreFF[e]->get()) / 7200.;
    }
    simData.enginePreFF[e]->set(flow);
  }

  // Reload never loads an arbitrary old INI over a valid simulator fuel selection.
  // Explicit restore/save requests are one-shot and require stopped ground engines.
  const bool stateRequest = simData.fuelRestoreRequest->getAsBool() || simData.fuelSaveRequest->getAsBool();
  if (stateRequest) {
    const bool restore = simData.fuelRestoreRequest->getAsBool();
    simData.fuelRestoreRequest->setAndWriteToSim(0);
    simData.fuelSaveRequest->setAndWriteToSim(0);
    const bool allowed = input.onGround && !input.refueling && !paused && simData.engineState[L]->getAsInt64() == OFF &&
                         simData.engineState[R]->getAsInt64() == OFF;
    simData.fuelStateStatus->set(allowed ? 0 : -1);
    if (allowed && restore) {
      if (!fuelConfiguration.loadConfigurationFromIni()) {
        simData.fuelStateStatus->set(-2);  // Missing, invalid, or old over-capacity save; native fuel untouched.
      } else {
        simData.fuelStateDataPtr->data() = {fuelConfiguration.getFuelCenter(),   fuelConfiguration.getFuelLeft(),
                                            fuelConfiguration.getFuelRight(),    fuelConfiguration.getFuelLeftAux(),
                                            fuelConfiguration.getFuelRightAux(), fuelConfiguration.getFuelTrim()};
        if (!simData.fuelStateDataPtr->writeDataToSim()) {
          simData.fuelStateStatus->set(-4);
          return;
        }
        havePreviousFuelTotal = false;
        trimState             = {};
        simData.trimEnabled->setAndWriteToSim(0);
        simData.trimCommand->setAndWriteToSim(0);
        simData.fuelStateStatus->set(1);
      }
      return;  // Await native readback instead of immediately overwriting the restore.
    }
    if (allowed && !restore) {
      fuelConfiguration.setFuelCenter(input.tanksGallons[0]);
      fuelConfiguration.setFuelLeft(input.tanksGallons[1]);
      fuelConfiguration.setFuelRight(input.tanksGallons[2]);
      fuelConfiguration.setFuelLeftAux(input.tanksGallons[3]);
      fuelConfiguration.setFuelRightAux(input.tanksGallons[4]);
      fuelConfiguration.setFuelTrim(input.tanksGallons[5]);
      simData.fuelStateStatus->set(fuelConfiguration.saveConfigurationToIni() ? 2 : -2);
    }
  }

  Result result = step(input, trimState);
  simData.trimMode->set(static_cast<int>(result.mode));
  simData.trimFlow->set(result.valid && input.dtSeconds > 0. ? result.diagnostics.actualTransferGallons / input.dtSeconds : 0.);
  if (!result.valid) {
    simData.fuelStateStatus->set(-3);
    simData.trimPumpActive->set(0);
    return;  // Invalid native/control inputs are diagnostic faults, never silently repaired.
  }
  auto& d = result.diagnostics;
  if (invalidTrimControl) {
    result.mode = TrimMode::Fault;
    simData.fuelStateStatus->set(-3);
  }
  if (!paused && !input.refueling) {
    if (result.tanksGallons[1] != input.tanksGallons[1] || result.tanksGallons[2] != input.tanksGallons[2]) {
      simData.fuelFeedTankDataPtr->data() = {result.tanksGallons[1], result.tanksGallons[2]};
      if (!simData.fuelFeedTankDataPtr->writeDataToSim()) {
        result.tanksGallons[1] = input.tanksGallons[1];
        result.tanksGallons[2] = input.tanksGallons[2];
        d.actualEngineBurnKg   = {};
        result.mode            = TrimMode::Fault;
        simData.fuelStateStatus->set(-4);
      }
    }
    if (d.actualTransferGallons != 0.) {
      simData.trimTankDataPtr->data() = {result.tanksGallons[0], result.tanksGallons[5]};
      if (!simData.trimTankDataPtr->writeDataToSim()) {
        result.tanksGallons[0]  = input.tanksGallons[0];
        result.tanksGallons[5]  = input.tanksGallons[5];
        d.actualTransferGallons = d.transferMomentDeltaKgFeet = 0.;
        d.pumpActive                                          = false;
        result.mode                                           = TrimMode::Fault;
        simData.fuelStateStatus->set(-4);
      }
    }
    d.totalAfterGallons = std::accumulate(result.tanksGallons.begin(), result.tanksGallons.end(), 0.);
  }
  trimState = result.state;
  simData.trimMode->set(static_cast<int>(result.mode));
  simData.trimFlow->set(input.dtSeconds > 0. ? d.actualTransferGallons / input.dtSeconds : 0.);
  simData.trimValveCommand->set(d.valveCommandOpen);
  simData.trimValvePosition->set(d.valveActualPosition);
  simData.trimPumpCommand->set(d.pumpCommandOn);
  simData.trimPumpActive->set(d.pumpActive && !paused);
  const double totalKg = native.totalWeightPounds * Fadec::LBS_TO_KGS;
  // Existing aircraft MAC=23.19 ft; this diagnostic is trim-only, not a CG writer.
  const double predictedCgDelta = totalKg > 0. ? -100. * d.transferMomentDeltaKgFeet / (totalKg * 23.19) : 0.;
  simData.trimPredictedCg->set(predictedCgDelta);
  if (paused)
    return;

  // Preserve the inherited pump/cavitation sound gates in sound.xml.
  const double                time          = msfsHandlerPtr->getSimulationTime();
  const std::array<double, 2> previousInner = {simData.fuelLeftPre->get(), simData.fuelRightPre->get()};
  for (int e = 0; e < 2; ++e) {
    const int    soundState = simData.fuelPumpState[e]->getAsInt64();
    const double elapsed    = time - pumpSoundTimestamp[e];
    if (havePreviousFuelTotal && soundState == 0 && elapsed >= 1.) {
      if (previousInner[e] > 0. && input.tanksGallons[e + 1] == 0.) {
        simData.fuelPumpState[e]->set(1);
        pumpSoundTimestamp[e] = time;
      } else if (previousInner[e] == 0. && input.tanksGallons[e + 1] > 0.) {
        simData.fuelPumpState[e]->set(2);
        pumpSoundTimestamp[e] = time;
      }
    } else if ((soundState == 1 && elapsed >= 2.1) || (soundState == 2 && elapsed >= 2.7)) {
      simData.fuelPumpState[e]->set(0);
      pumpSoundTimestamp[e] = time;
    }
  }

  for (int e = 0; e < 2; ++e)
    simData.engineFuelUsed[e]->set(simData.engineFuelUsed[e]->get() + d.actualEngineBurnKg[e]);
  simData.fuelCenterPre->set(result.tanksGallons[0] * native.fuelWeightPerGallon);
  simData.fuelLeftPre->set(result.tanksGallons[1] * native.fuelWeightPerGallon);
  simData.fuelRightPre->set(result.tanksGallons[2] * native.fuelWeightPerGallon);
  simData.fuelAuxLeftPre->set(result.tanksGallons[3] * native.fuelWeightPerGallon);
  simData.fuelAuxRightPre->set(result.tanksGallons[4] * native.fuelWeightPerGallon);

  // Native edits, EFB refueling, native APU use and line storage may all affect this
  // residual. It is observed, accepted, and labelled, rather than guessed as tampering.
  const double nativeNet   = havePreviousFuelTotal ? d.totalBeforeGallons - previousFuelTotalGallons : 0.;
  previousFuelTotalGallons = d.totalAfterGallons;
  havePreviousFuelTotal    = true;
  if (!simData.fuelTelemetry->getAsBool()) {
    telemetrySamples = 0;
    telemetryElapsed = telemetryEngineKg = telemetryNativeGallons = telemetryApuGallons = 0.;
    telemetryTransferGallons = telemetryPredictedCg = 0.;
    telemetryTransitions                            = 0;
    previousTrimMode                                = static_cast<int>(result.mode);
    return;
  }
  if (telemetrySamples >= 300)
    return;  // Bounded opt-in capture; toggle off/on to restart.
  if (previousTrimMode != static_cast<int>(result.mode)) {
    const auto slot          = telemetryTransitions % telemetryModes.size();
    telemetryModes[slot]     = static_cast<int>(result.mode);
    telemetryModeTimes[slot] = time;
    ++telemetryTransitions;
    previousTrimMode = static_cast<int>(result.mode);
  }
  telemetryElapsed += input.dtSeconds;
  telemetryEngineKg += d.actualEngineBurnKg[0] + d.actualEngineBurnKg[1];
  telemetryNativeGallons += nativeNet;
  telemetryApuGallons += native.apuFuelConsumption * input.dtSeconds / 3600.;
  telemetryTransferGallons += d.actualTransferGallons;
  telemetryPredictedCg += predictedCgDelta;
  if (telemetryElapsed >= 1.) {
    std::ostringstream row;
    row.precision(12);
    row << "A339X_FUEL_DIAG t=" << msfsHandlerPtr->getSimulationTime() << " dt=" << input.dtSeconds << " window=" << telemetryElapsed
        << " tanks_gal=";
    for (const auto quantity : result.tanksGallons)
      row << quantity << ',';
    row << " total_gal=" << d.totalAfterGallons << " engine_kg=" << telemetryEngineKg << " apu_est_gal=" << telemetryApuGallons
        << " native_net_gal=" << telemetryNativeGallons << " refueling=" << input.refueling << " modeled_losses_gal=0"
        << " enabled=" << input.trimEnabled << " command=" << command << " target_gal=" << input.trimTargetGallons
        << " rate_gps=" << input.trimRateGallonsPerSecond << " pump_cmd=" << d.pumpCommandOn << " pump_power=" << input.pumpPowered
        << " pump_actual=" << d.pumpActive << " valve_cmd=" << d.valveCommandOpen << " valve_power=" << input.valvePowered
        << " valve_actual=" << d.valveActualPosition << " transfer_gal=" << telemetryTransferGallons << " cg_mac=" << native.cgPercent
        << " trim_delta_mac=" << telemetryPredictedCg << " mode=" << static_cast<int>(result.mode) << " pump_failed=" << input.pumpFailed
        << " valve_stuck=" << input.valveStuck;
    row << " transitions=" << telemetryTransitions << " recent_modes=";
    const unsigned kept = std::min<unsigned>(telemetryTransitions, telemetryModes.size());
    for (unsigned n = telemetryTransitions - kept; n < telemetryTransitions; ++n) {
      const auto slot = n % telemetryModes.size();
      row << telemetryModeTimes[slot] << ':' << telemetryModes[slot] << ',';
    }
    LOG_INFO(row.str());
    ++telemetrySamples;
    telemetryElapsed = telemetryEngineKg = telemetryNativeGallons = telemetryApuGallons = 0.;
    telemetryTransferGallons = telemetryPredictedCg = 0.;
    telemetryTransitions                            = 0;
  }
}

void EngineControl_A339X::updateThrustLimits(double                  simulationTime,
                                             double                  pressureAltitude,
                                             double                  ambientTemperature,
                                             double                  ambientPressure,
                                             double                  mach,
                                             [[maybe_unused]] double simN1highest,
                                             int                     packs,
                                             int                     nai,
                                             int                     wai) {
#ifdef PROFILING
  profilerUpdateThrustLimits.start();
#endif

  const double flexTemp        = simData.airlinerToFlexTemp->get();
  const double pressAltitude   = simData.simVarsDataPtr->data().pressureAltitude;
  const double thrustLimitType = simData.thrustLimitType->get();

  if (!isTransitionActive && thrustLimitType != 3 /* FLEX */) {
    latchedFlexTemperature = flexTemp;
  }

  double to      = 0;
  double ga      = 0;
  double toga    = 0;
  double clb     = 0;
  double mct     = 0;
  double flex_to = 0;
  double flex_ga = 0;
  double flex    = 0;

  // Write all N1 Limits
  to = ThrustLimits_A339X::limitN1(0, (std::min)(16600.0, pressAltitude), ambientTemperature, ambientPressure, 0, packs, nai, wai);
  ga = ThrustLimits_A339X::limitN1(1, (std::min)(16600.0, pressAltitude), ambientTemperature, ambientPressure, 0, packs, nai, wai);
  if (latchedFlexTemperature > 0) {
    flex_to = ThrustLimits_A339X::limitN1(0, (std::min)(16600.0, pressAltitude), ambientTemperature, ambientPressure,
                                          latchedFlexTemperature, packs, nai, wai);
    flex_ga = ThrustLimits_A339X::limitN1(1, (std::min)(16600.0, pressAltitude), ambientTemperature, ambientPressure,
                                          latchedFlexTemperature, packs, nai, wai);
  }
  clb = ThrustLimits_A339X::limitN1(2, pressAltitude, ambientTemperature, ambientPressure, 0, packs, nai, wai);
  mct = ThrustLimits_A339X::limitN1(3, pressAltitude, ambientTemperature, ambientPressure, 0, packs, nai, wai);

  // transition between TO and GA limit -----------------------------------------------------------------------------
  double machFactorLow = (std::max)(0.0, (std::min)(1.0, (mach - 0.04) / 0.04));
  toga                 = to + (ga - to) * machFactorLow;
  flex                 = flex_to + (flex_ga - flex_to) * machFactorLow;

  // adaption of CLB due to FLX limit if necessary ------------------------------------------------------------------
  if (prevThrustLimitType != 3 && thrustLimitType == 3) {
    wasFlexActive = true;
  } else if (thrustLimitType == 4) {
    wasFlexActive = false;
  }

  if (wasFlexActive && !isTransitionActive && thrustLimitType == 1) {
    isTransitionActive  = true;
    transitionStartTime = simulationTime;
    transitionFactor    = 0.2;
    // transitionFactor = (clb - flex) / transitionTime;
  } else if (!wasFlexActive) {
    isTransitionActive  = false;
    transitionStartTime = 0;
    transitionFactor    = 0;
  }

  double deltaThrust = 0;
  if (isTransitionActive) {
    double timeDifference = (std::max)(0.0, (simulationTime - transitionStartTime) - TRANSITION_WAIT_TIME);
    if (timeDifference > 0 && clb > flex) {
      deltaThrust = (std::min)(clb - flex, timeDifference * transitionFactor);
    }
    if (flex + deltaThrust >= clb) {
      wasFlexActive      = false;
      isTransitionActive = false;
    }
  }

  if (wasFlexActive) {
    clb = (std::min)(clb, flex) + deltaThrust;
  }

  prevThrustLimitType = thrustLimitType;

  // thrust transitions for MCT and TOGA ----------------------------------------------------------------------------

  // get factors
  const double machFactor         = (std::max)(0.0, (std::min)(1.0, ((mach - 0.37) / 0.05)));
  const double altitudeFactorLow  = (std::max)(0.0, (std::min)(1.0, ((pressureAltitude - 16600) / 500)));
  const double altitudeFactorHigh = (std::max)(0.0, (std::min)(1.0, ((pressureAltitude - 25000) / 500)));

  // adapt thrust limits
  if (pressureAltitude >= 25000) {
    mct  = (std::max)(clb, mct + (clb - mct) * altitudeFactorHigh);
    toga = mct;
  } else {
    if (mct > toga) {
      mct  = toga + (mct - toga) * (std::min)(1.0, altitudeFactorLow + machFactor);
      toga = mct;
    } else {
      toga = toga + (mct - toga) * (std::min)(1.0, altitudeFactorLow + machFactor);
    }
  }

  // write limits ---------------------------------------------------------------------------------------------------
  simData.thrustLimitIdle->set(simData.engineIdleN1->get());
  simData.thrustLimitToga->set(toga);
  simData.thrustLimitFlex->set(flex);
  simData.thrustLimitClimb->set(clb);
  simData.thrustLimitMct->set(mct);

#ifdef PROFILING
  profilerUpdateThrustLimits.stop();
  if (msfsHandlerPtr->getTickCounter() % 100 == 0) {
    profilerUpdateThrustLimits.print();
  }
#endif
}

/*
 * Previous code - call to it was already commented out and this function was not in use.
 * Keeping it to make completing/fixing it easier.
 * It is not migrated to the cpp framework yet.
 *
 * /// <summary>
/// FBW Oil Qty, Pressure and Temperature (in Quarts, PSI and degree Celsius)
/// Updates Oil with realistic values visualized in the SD
/// </summary>
void updateOil(int engine, double imbalance, double thrust, double simN3, double deltaN2, double deltaTime, double ambientTemp) {
  double steadyTemperature;
  double thermalEnergy;
  double oilTemperaturePre;
  double oilQtyActual;
  double oilTotalActual;
  double oilQtyObjective;
  double oilBurn;
  double oilIdleRandom;
  double oilPressure;

//--------------------------------------------
// Engine Reading
//--------------------------------------------
if (engine == 1) {
steadyTemperature = simVars->getEngine1EGT();
thermalEnergy = thermalEnergy1;
oilTemperaturePre = oilTemperatureLeftPre;
oilQtyActual = simVars->getEngine1Oil();
oilTotalActual = simVars->getEngine1OilTotal();
} else {
steadyTemperature = simVars->getEngine2EGT();
thermalEnergy = thermalEnergy2;
oilTemperaturePre = oilTemperatureRightPre;
oilQtyActual = simVars->getEngine2Oil();
oilTotalActual = simVars->getEngine2OilTotal();
}

//--------------------------------------------
// Oil Temperature
//--------------------------------------------
if (simOnGround == 1 && engineState == 0 && ambientTemp > oilTemperaturePre - 10) {
oilTemperature = ambientTemp;
} else {
if (steadyTemperature > oilTemperatureMax) {
  steadyTemperature = oilTemperatureMax;
}
thermalEnergy = (0.995 * thermalEnergy) + (deltaN2 / deltaTime);
oilTemperature = poly->oilTemperature(thermalEnergy, oilTemperaturePre, steadyTemperature, deltaTime);
}

//--------------------------------------------
// Oil Quantity
//--------------------------------------------
// Calculating Oil Qty as a function of thrust
oilQtyObjective = oilTotalActual * (1 - poly->oilGulpPct(thrust));
oilQtyActual = oilQtyActual - (oilTemperature - oilTemperaturePre);

// Oil burnt taken into account for tank and total oil
oilBurn = (0.00011111 * deltaTime);
oilQtyActual = oilQtyActual - oilBurn;
oilTotalActual = oilTotalActual - oilBurn;

//--------------------------------------------
// Oil Pressure
//--------------------------------------------
// Engine imbalance
engineImbalanced = imbalanceExtractor(imbalance, 1);
paramImbalance = imbalanceExtractor(imbalance, 6) / 10;
oilIdleRandom = imbalanceExtractor(imbalance, 7) - 6;

// Checking engine imbalance
if (engineImbalanced != engine) {
paramImbalance = 0;
}

oilPressure = poly->oilPressure(simN3) - paramImbalance + oilIdleRandom;

//--------------------------------------------
// Engine Writing
//--------------------------------------------
if (engine == 1) {
thermalEnergy1 = thermalEnergy;
oilTemperatureLeftPre = oilTemperature;
simVars->setEngine1Oil(oilQtyActual);
simVars->setEngine1OilTotal(oilTotalActual);
SimConnect_SetDataOnSimObject(hSimConnect, DataTypesID::OilTempLeft, SIMCONNECT_OBJECT_ID_USER, 0, 0, sizeof(double),
                              &oilTemperature);
SimConnect_SetDataOnSimObject(hSimConnect, DataTypesID::OilPsiLeft, SIMCONNECT_OBJECT_ID_USER, 0, 0, sizeof(double), &oilPressure);
} else {
thermalEnergy2 = thermalEnergy;
oilTemperatureRightPre = oilTemperature;
simVars->setEngine2Oil(oilQtyActual);
simVars->setEngine2OilTotal(oilTotalActual);
SimConnect_SetDataOnSimObject(hSimConnect, DataTypesID::OilTempRight, SIMCONNECT_OBJECT_ID_USER, 0, 0, sizeof(double),
                              &oilTemperature);
SimConnect_SetDataOnSimObject(hSimConnect, DataTypesID::OilPsiRight, SIMCONNECT_OBJECT_ID_USER, 0, 0, sizeof(double), &oilPressure);
}
}

 */
