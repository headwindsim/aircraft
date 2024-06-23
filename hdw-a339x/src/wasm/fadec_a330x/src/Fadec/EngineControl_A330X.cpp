// Copyright (c) 2023-2024 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

#include "logging.h"
#ifdef PROFILING
#include "ScopedTimer.hpp"
#include "SimpleProfiler.hpp"
#endif

#include "EngineControl_A330X.h"
#include "EngineRatios.hpp"
#include "Polynomials_A330X.hpp"
#include "Table1502_A330X.hpp"
#include "ThrustLimits_A330X.hpp"

#include <algorithm>

void EngineControl_A330X::initialize(MsfsHandler* msfsHandler) {
  this->msfsHandlerPtr = msfsHandler;
  this->dataManagerPtr = &msfsHandler->getDataManager();
  this->simData.initialize(dataManagerPtr);
  LOG_INFO("Fadec::EngineControl_A330X::initialize() - initialized");
}

void EngineControl_A330X::shutdown() {
  LOG_INFO("Fadec::EngineControl_A330X::shutdown()");
}

void EngineControl_A330X::update() {
#ifdef PROFILING
  profilerUpdate.start();
#endif

  // Get ATC ID from sim to be able to load and store fuel levels
  // If not yet available, request it from sim and return early
  // If available initialize the engine control data
  if (atcId.empty()) {
    simData.atcIdDataPtr->requestUpdateFromSim(msfsHandlerPtr->getTimeStamp(), msfsHandlerPtr->getTickCounter());
    if (simData.atcIdDataPtr->hasChanged()) {
      atcId = simData.atcIdDataPtr->data().atcID;
      LOG_INFO("Fadec::EngineControl_A330X::update() - received ATC ID: " + atcId);
      initializeEngineControlData();
    }
    return;
  }

  const double deltaTime          = std::max(0.002, msfsHandlerPtr->getSimulationDeltaTime());
  const double mach               = simData.simVarsDataPtr->data().airSpeedMach;
  const double pressureAltitude   = simData.simVarsDataPtr->data().pressureAltitude;
  const double ambientTemperature = simData.simVarsDataPtr->data().ambientTemperature;
  const double ambientPressure    = simData.simVarsDataPtr->data().ambientPressure;
  const double idleN3             = simData.engineIdleN3->get();

  generateIdleParameters(pressureAltitude, mach, ambientTemperature, ambientPressure);

  // Update engine states
  for (int engine = 1; engine <= 2; engine++) {
    const int engineIdx = engine - 1;

    const bool engineStarter = static_cast<bool>(simData.simVarsDataPtr->data().engineStarter[engineIdx]);
    const int  engineIgniter = static_cast<int>(simData.simVarsDataPtr->data().engineIgniter[engineIdx]);

    // determine the current engine state based on the previous state and the current ignition, starter and other parameters
    // also resets the engine timer if the engine is starting or restarting
    EngineState engineState = engineStateMachine(engine,                      //
                                                 engineIgniter,               //
                                                 engineStarter,               //
                                                 prevSimEngineN3[engineIdx],  //
                                                 idleN3,                      //
                                                 ambientTemperature);         //

    const bool   simOnGround   = msfsHandlerPtr->getSimOnGround();
    const double engineTimer   = simData.engineTimer[engineIdx]->get();
    const double simCN1        = simData.simVarsDataPtr->data().simEngineCorrectedN1[engineIdx];
    const double simN1         = simData.simVarsDataPtr->data().simEngineN1[engineIdx];
    const double simN3         = simData.simVarsDataPtr->data().simEngineN2[engineIdx];  // as the sim does not have N3, we use N2
    prevSimEngineN3[engineIdx] = simN3;

    // Update various engine values based on the current engine state
    switch (static_cast<int>(engineState)) {
      case STARTING:
      case RESTARTING:
        engineStartProcedure(engine, engineState, deltaTime, engineTimer, simN3, ambientTemperature);
        break;
      case SHUTTING:
        engineShutdownProcedure(engine, deltaTime, engineTimer, simN1, ambientTemperature);
        updateFF(engine, simCN1, mach, pressureAltitude, ambientTemperature, ambientPressure);
        break;
      default:
        updatePrimaryParameters(engine, simN1, simN3);
        double correctedFuelFlow = updateFF(engine, simCN1, mach, pressureAltitude, ambientTemperature, ambientPressure);
        updateEGT(engine, engineState, deltaTime, simCN1, correctedFuelFlow, mach, pressureAltitude, ambientTemperature, simOnGround);
        // TODO: Oil to be implemented
        // The following call is commented out because it was not yet implemented/working in the original code
        // The function is at the end of this files in its original form
        // updateOil(engine, imbalance, thrust, simN2, deltaN2, deltaTime, ambientTemperature);
        break;
    }
  }

  // Update fuel & tank data
  updateFuel(deltaTime);

  // Update thrust limits while considering the current bleed air settings (packs, nai, wai)
  const int packs = (simData.packsState[1]->get() > 0.5 || simData.packsState[2]->get() > 0.5) ? 1 : 0;
  const int nai = (simData.simVarsDataPtr->data().engineAntiIce[L] > 0.5 || simData.simVarsDataPtr->data().engineAntiIce[R] > 0.5) ? 1 : 0;
  const int wai   = simData.wingAntiIce->getAsInt64();
  updateThrustLimits(msfsHandlerPtr->getSimulationTime(), pressureAltitude, ambientTemperature, ambientPressure, mach, packs, nai, wai);

#ifdef PROFILING
  profilerUpdate.stop();
  if (msfsHandlerPtr->getTickCounter() % 100 == 0) {
    profilerUpdateThrustLimits.print();
    profilerUpdateFuel.print();
    profilerUpdateEGT.print();
    profilerUpdateFF.print();
    profilerEngineShutdownProcedure.print();
    profilerEngineStartProcedure.print();
    profilerUpdatePrimaryParameters.print();
    profilerEngineStateMachine.print();
    profilerUpdate.print();
  }
#endif
}

// =====================================================================================================================
// Private methods
// =====================================================================================================================

void EngineControl_A330X::initializeEngineControlData() {
  LOG_INFO("Fadec::EngineControl_A330X::initializeEngineControlData()");

#ifdef PROFILING
  ScopedTimer timer("Fadec::EngineControl_A330X::initializeEngineControlData()");
#endif

  const FLOAT64 timeStamp   = msfsHandlerPtr->getTimeStamp();
  const UINT64  tickCounter = msfsHandlerPtr->getTickCounter();

  // Getting and saving initial N2 into pre (= previous) variables
  prevSimEngineN3[0] = simData.simVarsDataPtr->data().simEngineN2[0];
  prevSimEngineN3[1] = simData.simVarsDataPtr->data().simEngineN2[1];

  // Setting initial Oil Quantity and adding some randomness to it
  std::srand(std::time(0));
  simData.engineOilTotal[L]->set((std::rand() % (MAX_OIL - MIN_OIL + 1) + MIN_OIL) / 10);
  simData.engineOilTotal[R]->set((std::rand() % (MAX_OIL - MIN_OIL + 1) + MIN_OIL) / 10);

  // Setting initial Oil Temperature
  const bool simOnGround = msfsHandlerPtr->getSimOnGround();

  const bool engine1Combustion = static_cast<bool>(simData.engineCombustion[L]->updateFromSim(timeStamp, tickCounter));
  const bool engine2Combustion = static_cast<bool>(simData.engineCombustion[R]->updateFromSim(timeStamp, tickCounter));

  double oilTemperaturePre[2];
  if (simOnGround == 1 && engine1Combustion == 1 && engine2Combustion == 1) {
    oilTemperaturePre[L] = 75;
    oilTemperaturePre[R] = 75;
  } else if (simOnGround == 0 && engine1Combustion == 1 && engine2Combustion == 1) {
    oilTemperaturePre[L] = 85;
    oilTemperaturePre[R] = 85;
  } else {
    const double ambientTemperature = simData.simVarsDataPtr->data().ambientTemperature;
    oilTemperaturePre[L]           = ambientTemperature;
    oilTemperaturePre[R]           = ambientTemperature;
  }
  simData.oilTempDataPtr[L]->data().oilTemp = oilTemperaturePre[L];
  simData.oilTempDataPtr[L]->writeDataToSim();
  simData.oilTempDataPtr[R]->data().oilTemp = oilTemperaturePre[R];
  simData.oilTempDataPtr[R]->writeDataToSim();
  
  // Setting initial Engine State
  simData.engineState[L]->set(OFF);
  simData.engineState[R]->set(OFF);

  // Setting initial Engine Timer
  simData.engineTimer[L]->set(0);
  simData.engineTimer[R]->set(0);

  // Initialize Fuel Tanks
  const double fuelWeightGallon = simData.simVarsDataPtr->data().fuelWeightLbsPerGallon;  // weight of gallon of jet A in lbs

  const double centerQuantity   = simData.simVarsDataPtr->data().fuelTankQuantityCenter;    // gal
  const double leftQuantity     = simData.simVarsDataPtr->data().fuelTankQuantityLeft;      // gal
  const double rightQuantity    = simData.simVarsDataPtr->data().fuelTankQuantityRight;     // gal
  const double leftAuxQuantity  = simData.simVarsDataPtr->data().fuelTankQuantityLeftAux;   // gal
  const double rightAuxQuantity = simData.simVarsDataPtr->data().fuelTankQuantityRightAux;  // gal

  // only loads saved fuel quantity on C/D spawn
  if (simData.startState->updateFromSim(timeStamp, tickCounter) == 2) {
    // Load fuel configuration from file
    fuelConfiguration.setConfigFilename(FILENAME_FADEC_CONF_DIRECTORY + atcId + FILENAME_FADEC_CONF_FILE_EXTENSION);
    fuelConfiguration.loadConfigurationFromIni();

    simData.fuelCenterPre->set(fuelConfiguration.getFuelCenter() * fuelWeightGallon);      // in Pounds
    simData.fuelLeftPre->set(fuelConfiguration.getFuelLeft() * fuelWeightGallon);          // in Pounds
    simData.fuelRightPre->set(fuelConfiguration.getFuelRight() * fuelWeightGallon);        // in Pounds
    simData.fuelAuxLeftPre->set(fuelConfiguration.getFuelLeftAux() * fuelWeightGallon);    // in Pounds
    simData.fuelAuxRightPre->set(fuelConfiguration.getFuelRightAux() * fuelWeightGallon);  // in Pounds
    //simData.fuelTrimPre->set(fuelConfiguration.getFuelTrimGallons() * weightLbsPerGallon);

    // set fuel levels from configuration to the sim
    simData.fuelFeedTankDataPtr->data().fuelLeftMain  = fuelConfiguration.getFuelLeft();
    simData.fuelFeedTankDataPtr->data().fuelRightMain = fuelConfiguration.getFuelRight();
    simData.fuelFeedTankDataPtr->writeDataToSim();

    simData.fuelCandAuxDataPtr->data().fuelCenter   = fuelConfiguration.getFuelCenter();
    simData.fuelCandAuxDataPtr->data().fuelLeftAux  = fuelConfiguration.getFuelLeftAux();
    simData.fuelCandAuxDataPtr->data().fuelRightAux = fuelConfiguration.getFuelRightAux();
    //simData.fuelCandAuxDataPtr->data().fuelSystemTrim       = fuelConfiguration.getFuelTrimGallons();
    simData.fuelCandAuxDataPtr->writeDataToSim();
  }
  // on a non C/D spawn, set fuel levels from the sim
  else {
    simData.fuelCenterPre->set(centerQuantity * fuelWeightGallon);      // in Pounds
    simData.fuelLeftPre->set(leftQuantity * fuelWeightGallon);          // in Pounds
    simData.fuelRightPre->set(rightQuantity * fuelWeightGallon);        // in Pounds
    simData.fuelAuxLeftPre->set(leftAuxQuantity * fuelWeightGallon);    // in Pounds
    simData.fuelAuxRightPre->set(rightAuxQuantity * fuelWeightGallon);  // in Pounds
    //simData.fuelTrimPre->set(simData.fuelCandAuxDataPtr->data().fuelSystemTrim * weightLbsPerGallon);
  }

  // Setting initial Fuel Flow
  simData.fuelPumpState[L]->set(0);
  simData.fuelPumpState[R]->set(0);

  // Setting initial Thrust Limits
  simData.thrustLimitIdle->set(0);
  simData.thrustLimitClimb->set(0);
  simData.thrustLimitFlex->set(0);
  simData.thrustLimitMct->set(0);
  simData.thrustLimitToga->set(0);
}

void EngineControl_A330X::generateIdleParameters(double pressAltitude, double mach, double ambientTemperature, double ambientPressure) {
  const double idleCN1 = Table1502_A330X::iCN1(pressAltitude, mach, ambientTemperature);
  const double idleN1  = idleCN1 * sqrt(EngineRatios::theta2(0, ambientTemperature));
  const double idleN3  = Table1502_A330X::iCN3(pressAltitude, mach) * sqrt(EngineRatios::theta(ambientTemperature));
  const double idleCFF = Polynomial_A330X::correctedFuelFlow(idleCN1, 0, pressAltitude);
  const double idleFF =
      idleCFF * Fadec::LBS_TO_KGS * EngineRatios::delta2(0, ambientPressure) * sqrt(EngineRatios::theta2(0, ambientTemperature));
  const double idleEGT = Polynomial_A330X::correctedEGT(idleCN1, idleCFF, 0, pressAltitude) * EngineRatios::theta2(0, ambientTemperature);

  simData.engineIdleN1->set(idleN1);
  simData.engineIdleN3->set(idleN3);
  simData.engineIdleFF->set(idleFF);
  simData.engineIdleEGT->set(idleEGT);
}

EngineControl_A330X::EngineState EngineControl_A330X::engineStateMachine(int    engine,
                                                                         int    engineIgniter,
                                                                         bool   engineStarter,
                                                                         double simN3,
                                                                         double idleN3,
                                                                         double ambientTemperature) {
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
    } else if (engineIgniter == 2 && engineStarter) {
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
    } else if (!engineStarter) {
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
    } else if (!engineStarter) {
      engineState = SHUTTING;
      resetTimer  = true;
    } else {
      engineState = RESTARTING;
    }
  }
  // Current State: Shutting
  else if (engineState == SHUTTING) {
    if (engineIgniter == 2 && engineStarter) {
      engineState = RESTARTING;
      resetTimer  = true;
    } else if (!engineStarter && simN3 < 0.05 && simData.engineEgt[engineIdx]->get() <= ambientTemperature) {
      engineState = OFF;
      resetTimer  = true;
    } else if (engineStarter == 1 && simN3 > 50) {
      engineState = RESTARTING;
      resetTimer  = true;
    } else {
      engineState = SHUTTING;
    }
  }

  simData.engineState[engineIdx]->set(static_cast<int>(engineState));
  if (resetTimer) {
    simData.engineTimer[engineIdx]->set(0);
  }

#ifdef PROFILING
  profilerEngineStateMachine.stop();
#endif

  return static_cast<EngineState>(engineState);
}

void EngineControl_A330X::engineStartProcedure(int         engine,
                                               EngineState engineState,
                                               double      deltaTime,
                                               double      engineTimer,
                                               double      simN3,
                                               double      ambientTemperature) {
#ifdef PROFILING
  profilerEngineStartProcedure.start();
#endif

  const int engineIdx = engine - 1;

  const double idleN1  = simData.engineIdleN1->get();
  const double idleN3  = simData.engineIdleN3->get();
  const double idleFF  = simData.engineIdleFF->get();
  const double idleEGT = simData.engineIdleEGT->get();

  // delay to simulate the delay between master-switch setting and actual engine start
  if (engineTimer < 1.7) {
    if (msfsHandlerPtr->getSimOnGround()) {
      simData.engineFuelUsed[engineIdx]->set(0);
    }
    simData.engineTimer[engineIdx]->set(engineTimer + deltaTime);
    simData.engineCorrectedN3DataPtr[engineIdx]->data().correctedN3 = 0;
    simData.engineCorrectedN3DataPtr[engineIdx]->writeDataToSim();
  }
  // engine start procedure after the delay
  else {
    const double preN3Fbw  = simData.engineN3[engineIdx]->get();
    const double preEgtFbw = simData.engineEgt[engineIdx]->get();
    const double newN3Fbw  = Polynomial_A330X::startN3(simN3, preN3Fbw, idleN3);

    const double startN1Fbw  = Polynomial_A330X::startN1(newN3Fbw, idleN3, idleN1);
    const double startFfFbw  = Polynomial_A330X::startFF(newN3Fbw, idleN3, idleFF);
    const double startEgtFbw = Polynomial_A330X::startEGT(newN3Fbw, idleN3, ambientTemperature, idleEGT);

    const double shutdownEgtFbw = Polynomial_A330X::shutdownEGT(preEgtFbw, ambientTemperature, deltaTime);

    simData.engineN3[engineIdx]->set(newN3Fbw);
    simData.engineN2[engineIdx]->set(newN3Fbw + 0.7);  // 0.7 seems to be an arbitrary offset to get N2 from N3
    simData.engineN1[engineIdx]->set(startN1Fbw);
    simData.engineFF[engineIdx]->set(startFfFbw);

    if (engineState == RESTARTING) {
      if ((std::abs)(startEgtFbw - preEgtFbw) <= 1.5) {
        simData.engineEgt[engineIdx]->set(startEgtFbw);
        simData.engineState[engineIdx]->set(STARTING);
      } else if (startEgtFbw > preEgtFbw) {
        // calculation and constant values unclear in original code
        simData.engineEgt[engineIdx]->set(preEgtFbw + (0.75 * deltaTime * (idleN3 - newN3Fbw)));
      } else {
        simData.engineEgt[engineIdx]->set(shutdownEgtFbw);
      }
    } else {
      simData.engineEgt[engineIdx]->set(startEgtFbw);
    }

    simData.oilTempDataPtr[engineIdx]->data().oilTemp = Polynomial_A330X::startOilTemp(newN3Fbw, idleN3, ambientTemperature);
    simData.oilTempDataPtr[engineIdx]->writeDataToSim();
  }

#ifdef PROFILING
  profilerEngineStartProcedure.stop();
#endif
}

// Original comment: Engine Shutdown Procedure - TEMPORARY SOLUTION
void EngineControl_A330X::engineShutdownProcedure(int    engine,
                                                  double deltaTime,
                                                  double engineTimer,
                                                  double simN1,
                                                  double ambientTemperature) {
#ifdef PROFILING
  profilerEngineShutdownProcedure.start();
#endif

  const int engineIdx = engine - 1;

  // delay to simulate the delay between master-switch setting and actual engine shutdown
  if (engineTimer < 1.8) {
    simData.engineTimer[engineIdx]->set(engineTimer + deltaTime);
  } else {
    const double preN1Fbw  = simData.engineN1[engineIdx]->get();
    const double preN3Fbw  = simData.engineN3[engineIdx]->get();
    const double preEgtFbw = simData.engineEgt[engineIdx]->get();

    double newN1Fbw = Polynomial_A330X::shutdownN1(preN1Fbw, deltaTime);
    if (simN1 < 5 && simN1 > newN1Fbw) {  // Takes care of windmilling
      newN1Fbw = simN1;
    }
    const double newN3Fbw  = Polynomial_A330X::shutdownN3(preN3Fbw, deltaTime);
    const double newEgtFbw = Polynomial_A330X::shutdownEGT(preEgtFbw, ambientTemperature, deltaTime);

    simData.engineN1[engineIdx]->set(newN1Fbw);
    simData.engineN2[engineIdx]->set(newN3Fbw + 0.7);
    simData.engineN3[engineIdx]->set(newN3Fbw);
    simData.engineEgt[engineIdx]->set(newEgtFbw);
  }

#ifdef PROFILING
  profilerEngineShutdownProcedure.stop();
#endif
}

int EngineControl_A330X::updateFF(int    engine,
                                  double simCN1,
                                  double mach,
                                  double pressureAltitude,
                                  double ambientTemperature,
                                  double ambientPressure) {
#ifdef PROFILING
  profilerUpdateFF.start();
#endif

  const double correctedFuelFlow = Polynomial_A330X::correctedFuelFlow(simCN1, mach, pressureAltitude);  // in lbs/hr.

  // Checking Fuel Logic and final Fuel Flow
  double outFlow = 0;  // kg/hour
  if (correctedFuelFlow >= 1) {
    outFlow = std::max(0.0,                                                                                  //
                         (correctedFuelFlow * Fadec::LBS_TO_KGS * EngineRatios::delta2(mach, ambientPressure)  //
                          * (std::sqrt)(EngineRatios::theta2(mach, ambientTemperature))));
  }
  simData.engineFF[engine - 1]->set(outFlow);

#ifdef PROFILING
  profilerUpdateFF.stop();
#endif

  return correctedFuelFlow;
}

void EngineControl_A330X::updatePrimaryParameters(int engine, double simN1, double simN3) {
#ifdef PROFILING
  profilerUpdatePrimaryParameters.start();
#endif

  const int engineIdx = engine - 1;

  simData.engineN1[engineIdx]->set(simN1);
  simData.engineN2[engineIdx]->set(simN3 > 0 ? simN3 + 0.7 : simN3);
  simData.engineN3[engineIdx]->set(simN3);

#ifdef PROFILING
  profilerUpdatePrimaryParameters.stop();
#endif
}

void EngineControl_A330X::updateEGT(int          engine,
                                    double       engineState,
                                    double       deltaTime,
                                    double       simCN1,
                                    int          correctedFuelFlow,
                                    const double mach,
                                    const double pressureAltitude,
                                    const double ambientTemperature,
                                    bool         simOnGround) {
#ifdef PROFILING
  profilerUpdateEGT.start();
#endif

  const int engineIdx = engine - 1;

  if (simOnGround && engineState == 0) {
    simData.engineEgt[engineIdx]->set(ambientTemperature);
  } else {
    const double correctedEGT    = Polynomial_A330X::correctedEGT(simCN1, correctedFuelFlow, mach, pressureAltitude);
    const double egtFbwPrevious  = simData.engineEgt[engineIdx]->get();
    double       egtFbwActualEng = (correctedEGT * EngineRatios::theta2(mach, ambientTemperature));
    egtFbwActualEng              = egtFbwActualEng + (egtFbwPrevious - egtFbwActualEng) * (std::exp)(-0.1 * deltaTime);
    simData.engineEgt[engineIdx]->set(egtFbwActualEng);
  }

#ifdef PROFILING
  profilerUpdateEGT.stop();
#endif
}

void EngineControl_A330X::updateFuel(double deltaTimeSeconds) {
#ifdef PROFILING
  profilerUpdateFuel.start();
#endif

  bool uiFuelTamper = false;

  const double pumpStateLeft          = simData.fuelPumpState[L]->get();
  const double pumpStateRight         = simData.fuelPumpState[R]->get();
  const bool   xfrCenterLeftManual    = simData.simVarsDataPtr->data().xfrCenterManual[L] > 1.5;                              // junction 4
  const bool   xfrCenterRightManual   = simData.simVarsDataPtr->data().xfrCenterManual[R] > 1.5;                              // junction 5
  const bool   xfrCenterLeftAuto      = simData.simVarsDataPtr->data().xfrValveCenterAuto[L] > 0.0 && !xfrCenterLeftManual;   // valve 11
  const bool   xfrCenterRightAuto     = simData.simVarsDataPtr->data().xfrValveCenterAuto[R] > 0.0 && !xfrCenterRightManual;  // valve 12
  const bool   xfrValveCenterLeftOpen = simData.simVarsDataPtr->data().xfrValveCenterOpen[L] > 0.0                            //
                                      && (xfrCenterLeftAuto || xfrCenterLeftManual);                                          // valve 9
  const bool xfrValveCenterRightOpen = simData.simVarsDataPtr->data().xfrValveCenterOpen[R] > 0.0                             //
                                       && (xfrCenterRightAuto || xfrCenterRightManual);                                       // valve 10
  const double xfrValveOuterLeft1    = simData.simVarsDataPtr->data().xfrValveOuter1[L];                                      // valve 6
  const double xfrValveOuterRight1   = simData.simVarsDataPtr->data().xfrValveOuter1[R];                                      // valve 7
  const double xfrValveOuterLeft2    = simData.simVarsDataPtr->data().xfrValveOuter2[L];                                      // valve 4
  const double xfrValveOuterRight2   = simData.simVarsDataPtr->data().xfrValveOuter2[R];                                      // valve 5
  const double lineLeftToCenterFlow  = simData.simVarsDataPtr->data().lineToCenterFlow[L];
  const double lineRightToCenterFlow = simData.simVarsDataPtr->data().lineToCenterFlow[R];

  const double engine1PreFF = simData.enginePreFF[L]->get();
  const double engine2PreFF = simData.enginePreFF[R]->get();

  const double engine1FF = simData.engineFF[L]->get();  // kg/hour
  const double engine2FF = simData.engineFF[R]->get();  // kg/hour

  /// weight of one gallon of fuel in pounds
  const double weightLbsPerGallon = simData.simVarsDataPtr->data().fuelWeightLbsPerGallon;

  double fuelLeftPre     = simData.fuelLeftPre->get();            // Pounds
  double fuelRightPre    = simData.fuelRightPre->get();           // Pounds
  double fuelAuxLeftPre  = simData.fuelAuxLeftPre->get();         // Pounds
  double fuelAuxRightPre = simData.fuelAuxRightPre->get();        // Pounds
  double fuelCenterPre   = simData.fuelCenterPre->get();          // Pounds
  //double fuelTrimPre       = simData.fuelTrimPre->get();        // Pounds

  const double leftQuantity     = simData.simVarsDataPtr->data().fuelTankQuantityLeft * weightLbsPerGallon;      // Pounds
  const double rightQuantity    = simData.simVarsDataPtr->data().fuelTankQuantityRight * weightLbsPerGallon;     // Pounds
  const double leftAuxQuantity  = simData.simVarsDataPtr->data().fuelTankQuantityLeftAux * weightLbsPerGallon;   // Pounds
  const double rightAuxQuantity = simData.simVarsDataPtr->data().fuelTankQuantityRightAux * weightLbsPerGallon;  // Pounds
  const double centerQuantity   = simData.simVarsDataPtr->data().fuelTankQuantityCenter * weightLbsPerGallon;    // Pounds
  //const double trimQty       = simData.simVarsDataPtr->data().fuelSystemTrim * weightLbsPerGallon;            // Pounds

  const double fuelTotalActual = leftQuantity + rightQuantity + leftAuxQuantity + rightAuxQuantity + centerQuantity;    // Pounds
  const double fuelTotalPre    = fuelLeftPre + fuelRightPre + fuelAuxLeftPre + fuelAuxRightPre + fuelCenterPre;         // Pounds
  const double deltaFuelRate   = (std::abs)(fuelTotalActual - fuelTotalPre) / (weightLbsPerGallon * deltaTimeSeconds);  // Pounds/ sec

  const EngineState engine1State = static_cast<EngineState>(simData.engineState[L]->get());
  const EngineState engine2State = static_cast<EngineState>(simData.engineState[R]->get());

  const double xFeedValve  = simData.simVarsDataPtr->data().xFeedValve;
  const double leftPump1   = simData.simVarsDataPtr->data().fuelPump1[L];
  const double rightPump1  = simData.simVarsDataPtr->data().fuelPump1[R];
  const double leftPump2   = simData.simVarsDataPtr->data().fuelPump2[L];
  const double rightPump2  = simData.simVarsDataPtr->data().fuelPump2[R];
  const double apuNpercent = simData.apuRpmPercent->get();

  int isTankClosed = 0;

  /// Delta time for this update in hours
  const double deltaTimeHours = deltaTimeSeconds / 3600;

  // Pump State Logic for Left Wing
  // TODO: unclear why a timer is used here
  const double time        = msfsHandlerPtr->getSimulationTime();
  const double elapsedLeft = time - pumpStateLeftTimeStamp;
  if (pumpStateLeft == 0 && elapsedLeft >= 1.0) {
    if (fuelLeftPre - leftQuantity > 0 && leftQuantity == 0) {
      pumpStateLeftTimeStamp = time;
      simData.fuelPumpState[L]->set(1);
    } else if (fuelLeftPre == 0 && leftQuantity - fuelLeftPre > 0) {
      pumpStateLeftTimeStamp = time;
      simData.fuelPumpState[L]->set(2);
    } else {
      simData.fuelPumpState[L]->set(0);
    }
  } else if (pumpStateLeft == 1 && elapsedLeft >= 2.1) {
    pumpStateLeftTimeStamp = time;
    simData.fuelPumpState[L]->set(0);
  } else if (pumpStateLeft == 2 && elapsedLeft >= 2.7) {
    pumpStateLeftTimeStamp = time;
    simData.fuelPumpState[L]->set(0);
  }

  // Pump State Logic for Right Wing
  // TODO: unclear why a timer is used here
  const double elapsedRight = time - pumpStateRightTimeStamp;
  if (pumpStateRight == 0 && (elapsedRight >= 1.0)) {
    if (fuelRightPre - rightQuantity > 0 && rightQuantity == 0) {
      pumpStateRightTimeStamp = time;
      simData.fuelPumpState[R]->set(1);
    } else if (fuelRightPre == 0 && rightQuantity - fuelRightPre > 0) {
      pumpStateRightTimeStamp = time;
      simData.fuelPumpState[R]->set(2);
    } else {
      simData.fuelPumpState[R]->set(0);
    }
  } else if (pumpStateRight == 1 && elapsedRight >= 2.1) {
    pumpStateRightTimeStamp = time;
    simData.fuelPumpState[R]->set(0);
  } else if (pumpStateRight == 2 && elapsedRight >= 2.7) {
    pumpStateRightTimeStamp = time;
    simData.fuelPumpState[R]->set(0);
  }

  // Checking for in-game UI Fuel tampering
  const bool   isReadyVar          = msfsHandlerPtr->getAircraftIsReadyVar();
  const double refuelRate          = simData.refuelRate->get();
  const double refuelStartedByUser = simData.refuelStartedByUser->get();
  if ((isReadyVar && !refuelStartedByUser && deltaFuelRate > FUEL_RATE_THRESHOLD) ||
      (isReadyVar && refuelStartedByUser && deltaFuelRate > FUEL_RATE_THRESHOLD && refuelRate < 2)) {
    uiFuelTamper = true;
  }

  //--------------------------------------------
  // Main Fuel Burn Logic
  //--------------------------------------------
  const FLOAT64 aircraftDevelopmentStateVar = msfsHandlerPtr->getAircraftDevelopmentStateVar();

  if (uiFuelTamper && aircraftDevelopmentStateVar == 0) {
    simData.fuelLeftPre->set(fuelLeftPre);          // in Pounds
    simData.fuelRightPre->set(fuelRightPre);        // in Pounds
    simData.fuelAuxLeftPre->set(fuelAuxLeftPre);    // in Pounds
    simData.fuelAuxRightPre->set(fuelAuxRightPre);  // in Pounds
    simData.fuelCenterPre->set(fuelCenterPre);      // in Pounds
    //simData.fuelTrimPre->set(fuelTrimPre);              // Pounds

    simData.fuelFeedTankDataPtr->data().fuelLeftMain  = (fuelLeftPre / weightLbsPerGallon);
    simData.fuelFeedTankDataPtr->data().fuelRightMain = (fuelRightPre / weightLbsPerGallon);
    simData.fuelFeedTankDataPtr->writeDataToSim();

    simData.fuelCandAuxDataPtr->data().fuelCenter   = (fuelCenterPre / weightLbsPerGallon);
    simData.fuelCandAuxDataPtr->data().fuelLeftAux  = (fuelAuxLeftPre / weightLbsPerGallon);
    simData.fuelCandAuxDataPtr->data().fuelRightAux = (fuelAuxRightPre / weightLbsPerGallon);
    //simData.fuelTankDataPtr->data().fuelSystemTrim       = fuelTrimPre / weightLbsPerGallon;
    simData.fuelCandAuxDataPtr->writeDataToSim();

  }
  // Detects refueling from the EFB
  else if (!uiFuelTamper && refuelStartedByUser == 1) {
    simData.fuelLeftPre->set(leftQuantity);          // in Pounds
    simData.fuelRightPre->set(rightQuantity);        // in Pounds
    simData.fuelAuxLeftPre->set(leftAuxQuantity);    // in Pounds
    simData.fuelAuxRightPre->set(rightAuxQuantity);  // in Pounds
    simData.fuelCenterPre->set(centerQuantity);      // in Pounds
    //simData.fuelTrimPre->set(trimQty);
  } else {
    if (uiFuelTamper) {
      fuelLeftPre     = leftQuantity;      // Pounds
      fuelRightPre    = rightQuantity;     // Pounds
      fuelAuxLeftPre  = leftAuxQuantity;   // Pounds
      fuelAuxRightPre = rightAuxQuantity;  // Pounds
      fuelCenterPre   = centerQuantity;    // Pounds
      //fuelTrimPre       = trimQty;        // in Pounds
    }
    //-----------------------------------------------------------
    // Cross-feed Logic
    // isTankClosed = 0, x-feed valve closed
    // isTankClosed = 1, left tank does not supply fuel
    // isTankClosed = 2, right tank does not supply fuel
    // isTankClosed = 3, left & right tanks do not supply fuel
    // isTankClosed = 4, both tanks supply fuel
    if (xFeedValve > 0.0) {
      if (leftPump1 == 0 && leftPump2 == 0 && rightPump1 == 0 && rightPump2 == 0)
        isTankClosed = 3;
      else if (leftPump1 == 0 && leftPump2 == 0)
        isTankClosed = 1;
      else if (rightPump1 == 0 && rightPump2 == 0)
        isTankClosed = 2;
      else
        isTankClosed = 4;
    }

    double xfrCenterToLeft  = 0;
    double xfrCenterToRight = 0;
    double xfrAuxLeft       = 0;
    double xfrAuxRight      = 0;

    double fuelFlowRateChange   = 0;  // was m in the original code
    double previousFuelFlowRate = 0;  // was b in the original code
    double fuelBurn1            = 0;  // in kg
    double fuelBurn2            = 0;  // in kg
    double apuBurn1             = 0;
    double apuBurn2             = 0;
    
    //--------------------------------------------
    // Left Engine and Wing routine
    if (fuelLeftPre > 0) {
      // Cycle Fuel Burn for Engine 1
      if (aircraftDevelopmentStateVar != 2) {
        fuelFlowRateChange   = (engine1FF - engine1PreFF) / deltaTimeHours;
        previousFuelFlowRate = engine1PreFF;
        fuelBurn1            = (fuelFlowRateChange * pow(deltaTimeHours, 2) / 2) + (previousFuelFlowRate * deltaTimeHours);  // KG
      }
      // Fuel transfer routine for Left Wing
      if (xfrValveOuterLeft1 > 0.0 || xfrValveOuterLeft2 > 0.0) {
        xfrAuxLeft = fuelAuxLeftPre - leftAuxQuantity;
      }
    } else {
      fuelBurn1   = 0;
      fuelLeftPre = 0;
    }

    //--------------------------------------------
    // Right Engine and Wing routine
    if (fuelRightPre > 0) {
      // Cycle Fuel Burn for Engine 2
      if (aircraftDevelopmentStateVar != 2) {
        fuelFlowRateChange   = (engine2FF - engine2PreFF) / deltaTimeHours;
        previousFuelFlowRate = engine2PreFF;
        fuelBurn2            = (fuelFlowRateChange * pow(deltaTimeHours, 2) / 2) + (previousFuelFlowRate * deltaTimeHours);  // KG
      }
      // Fuel transfer routine for Right Wing
      if (xfrValveOuterRight1 > 0.0 || xfrValveOuterRight2 > 0.0) {
        xfrAuxRight = fuelAuxRightPre - rightAuxQuantity;
      }
    } else {
      fuelBurn2    = 0;
      fuelRightPre = 0;
    }

    /// apu fuel consumption for this frame in pounds
    double apuFuelConsumption = simData.simVarsDataPtr->data().apuFuelConsumption * weightLbsPerGallon * deltaTimeHours;

    // check if APU is actually running instead of just the ASU which doesn't consume fuel
    if (apuNpercent <= 0.0) {
      apuFuelConsumption = 0.0;
    }

    apuBurn1 = apuFuelConsumption;
    apuBurn2 = 0;

    //--------------------------------------------
    // Fuel used accumulators
    double fuelUsedLeft  = simData.engineFuelUsed[L]->get() + fuelBurn1;
    double fuelUsedRight = simData.engineFuelUsed[R]->get() + fuelBurn2;

    //--------------------------------------------
    // Cross-feed fuel burn routine
    // If fuel pumps for a given tank are closed,
    // all fuel will be burnt on the other tank
    switch (isTankClosed) {
      case 1:
        fuelBurn2 = fuelBurn1 + fuelBurn2;
        fuelBurn1 = 0;
        apuBurn1  = 0;
        apuBurn2  = apuFuelConsumption;
        break;
      case 2:
        fuelBurn1 = fuelBurn1 + fuelBurn2;
        fuelBurn2 = 0;
        break;
      case 3:
        fuelBurn1 = 0;
        fuelBurn2 = 0;
        apuBurn1  = apuFuelConsumption * 0.5;
        apuBurn2  = apuFuelConsumption * 0.5;
        break;
      case 4:
        apuBurn1 = apuFuelConsumption * 0.5;
        apuBurn2 = apuFuelConsumption * 0.5;
        break;
      default:
        break;
    }

    //--------------------------------------------
    // Center Tank transfer routine
    double lineFlowRatio = 0;
    if (xfrValveCenterLeftOpen && xfrValveCenterRightOpen) {
      if (lineLeftToCenterFlow < 0.1 && lineRightToCenterFlow < 0.1)
        lineFlowRatio = 0.5;
      else
        lineFlowRatio = lineLeftToCenterFlow / (lineLeftToCenterFlow + lineRightToCenterFlow);

      xfrCenterToLeft  = (fuelCenterPre - centerQuantity) * lineFlowRatio;
      xfrCenterToRight = (fuelCenterPre - centerQuantity) * (1 - lineFlowRatio);
    } else if (xfrValveCenterLeftOpen)
      xfrCenterToLeft = fuelCenterPre - centerQuantity;
    else if (xfrValveCenterRightOpen)
      xfrCenterToRight = fuelCenterPre - centerQuantity;

    //--------------------------------------------
    // Final Fuel levels for left and right inner tanks
    const double fuelLeft  = (fuelLeftPre - (fuelBurn1 * Fadec::KGS_TO_LBS)) + xfrAuxLeft + xfrCenterToLeft - apuBurn1;     // Pounds
    const double fuelRight = (fuelRightPre - (fuelBurn2 * Fadec::KGS_TO_LBS)) + xfrAuxRight + xfrCenterToRight - apuBurn2;  // Pounds

    // Setting new pre-cycle conditions
    simData.enginePreFF[L]->set(engine1FF);
    simData.enginePreFF[R]->set(engine2FF);

    simData.engineFuelUsed[L]->set(fuelUsedLeft);
    simData.engineFuelUsed[R]->set(fuelUsedRight);

    simData.fuelAuxLeftPre->set(leftAuxQuantity);
    simData.fuelAuxRightPre->set(rightAuxQuantity);
    simData.fuelCenterPre->set(centerQuantity);

    simData.fuelLeftPre->set(fuelLeft);    // in Pounds
    simData.fuelRightPre->set(fuelRight);  // in Pounds
    //simData.fuelTrimPre->set(trimQty);

    simData.fuelFeedTankDataPtr->data().fuelLeftMain  = (fuelLeft / weightLbsPerGallon);
    simData.fuelFeedTankDataPtr->data().fuelRightMain = (fuelRight / weightLbsPerGallon);
    simData.fuelFeedTankDataPtr->writeDataToSim();
  }

  // Will save the current fuel quantities if on the ground AND engines being shutdown
  // AND 5 seconds have passed since the last save
if (msfsHandlerPtr->getSimOnGround() && (msfsHandlerPtr->getSimulationTime() - lastFuelSaveTime) > FUEL_SAVE_INTERVAL &&
      (engine1State == OFF || engine1State == SHUTTING || engine2State == OFF || engine2State == SHUTTING)) {
    fuelConfiguration.setFuelLeft(simData.fuelLeftPre->get() / weightLbsPerGallon);
    fuelConfiguration.setFuelRight(simData.fuelRightPre->get() / weightLbsPerGallon);
    fuelConfiguration.setFuelCenter(simData.fuelCenterPre->get() / weightLbsPerGallon);
    fuelConfiguration.setFuelLeftAux(simData.fuelAuxLeftPre->get() / weightLbsPerGallon);
    fuelConfiguration.setFuelRightAux(simData.fuelAuxRightPre->get() / weightLbsPerGallon);
    //fuelConfiguration.setFuelTrimGallons(simData.fuelTankDataPtr->data().fuelSystemTrim);
    
    fuelConfiguration.saveConfigurationToIni();
    lastFuelSaveTime = msfsHandlerPtr->getSimulationTime();
  }

#ifdef PROFILING
  profilerUpdateFuel.stop();
#endif
}

void EngineControl_A330X::updateThrustLimits(double simulationTime,
                                             double pressureAltitude,
                                             double ambientTemperature,
                                             double ambientPressure,
                                             double mach,
                                             int    packs,
                                             int    nai,
                                             int    wai) {
#ifdef PROFILING
  profilerUpdateThrustLimits.start();
#endif

  const double flexTemp      = simData.airlinerToFlexTemp->get();
  const double pressAltitude = simData.simVarsDataPtr->data().pressureAltitude;

  // Write all N1 Limits
  const double altitude = (std::min)(16600.0, pressAltitude);
  const double to       = ThrustLimits_A330X::limitN1(0, altitude, ambientTemperature, ambientPressure, 0, packs, nai, wai);
  const double ga       = ThrustLimits_A330X::limitN1(1, altitude, ambientTemperature, ambientPressure, 0, packs, nai, wai);
  double       flex_to  = 0;
  double       flex_ga  = 0;
  if (flexTemp > 0) {
    flex_to = ThrustLimits_A330X::limitN1(0, altitude, ambientTemperature, ambientPressure, flexTemp, packs, nai, wai);
    flex_ga = ThrustLimits_A330X::limitN1(1, altitude, ambientTemperature, ambientPressure, flexTemp, packs, nai, wai);
  }
  double clb = ThrustLimits_A330X::limitN1(2, pressAltitude, ambientTemperature, ambientPressure, 0, packs, nai, wai);
  double mct = ThrustLimits_A330X::limitN1(3, pressAltitude, ambientTemperature, ambientPressure, 0, packs, nai, wai);

  // transition between TO and GA limit -----------------------------------------------------------------------------
  const double machFactorLow = (std::max)(0.0, (std::min)(1.0, (mach - 0.04) / 0.04));
  const double flex          = flex_to + (flex_ga - flex_to) * machFactorLow;
  double       toga          = to + (ga - to) * machFactorLow;

  // adaption of CLB due to FLX limit if necessary ------------------------------------------------------------------
  const double thrustLimitType = simData.thrustLimitType->get();
  if ((prevThrustLimitType != 3 && thrustLimitType == 3) || (prevFlexTemperature == 0 && flexTemp > 0)) {
    wasFlexActive = true;
  } else if ((flexTemp == 0) || (thrustLimitType == 4)) {
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
      wasFlexActive = false;
      isTransitionActive = false;
    }
  }

  if (wasFlexActive) {
    clb = (std::min)(clb, flex) + deltaThrust;
  }

  prevThrustLimitType = thrustLimitType;
  prevFlexTemperature = flexTemp;

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
#endif
}

/*
 * Previous code - call to it was already commented out and this function was not in use.
 * Keeping it to make completing/fixing it easier.
 * It is not migrated to the cpp framework yet.
 *
/// <summary>
/// FBW Oil Qty, Pressure and Temperature (in Quarts, PSI and degree Celsius)
/// Updates Oil with realistic values visualized in the SD
/// </summary>
void updateOil(int engine, double thrust, double simN3, double deltaN3, double deltaTime, double ambientTemp) {
  double steadyTemperature;
  double thermalEnergy;
  double oilTemperaturePre;
  double oilQtyActual;
  double oilTotalActual;
  double oilQtyObjective;
  double oilBurn;
  double oilPressureIdle;
  double oilPressure;

  //--------------------------------------------
  // Engine Reading
  //--------------------------------------------
  if (engine == 1) {
    steadyTemperature = simVars->getEngine1EGT();
    thermalEnergy = thermalEnergy1;
    oilTemperaturePre = oilTemperatureEngine1Pre;
    oilQtyActual = simVars->getEngine1Oil();
    oilTotalActual = simVars->getEngine1TotalOil();
  } else if (engine == 2) {
    steadyTemperature = simVars->getEngine2EGT();
    thermalEnergy = thermalEnergy2;
    oilTemperaturePre = oilTemperatureEngine2Pre;
    oilQtyActual = simVars->getEngine2Oil();
    oilTotalActual = simVars->getEngine2TotalOil();
  } else if (engine == 3) {
    steadyTemperature = simVars->getEngine3EGT();
    thermalEnergy = thermalEnergy3;
    oilTemperaturePre = oilTemperatureEngine3Pre;
    oilQtyActual = simVars->getEngine3Oil();
    oilTotalActual = simVars->getEngine3TotalOil();
  } else {
    steadyTemperature = simVars->getEngine4EGT();
    thermalEnergy = thermalEnergy4;
    oilTemperaturePre = oilTemperatureEngine4Pre;
    oilQtyActual = simVars->getEngine4Oil();
    oilTotalActual = simVars->getEngine4TotalOil();
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
    thermalEnergy = (0.995 * thermalEnergy) + (deltaN3 / deltaTime);
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
  oilPressureIdle = 0;

  oilPressure = poly->oilPressure(simN3) + oilPressureIdle;

  //--------------------------------------------
  // Engine Writing
  //--------------------------------------------
  if (engine == 1) {
    thermalEnergy1 = thermalEnergy;
    oilTemperatureEngine1Pre = oilTemperature;
    simVars->setEngine1Oil(oilQtyActual);
    simVars->setEngine1TotalOil(oilTotalActual);
    SimConnect_SetDataOnSimObject(hSimConnect, DataTypesID::OilTempEngine1, SIMCONNECT_OBJECT_ID_USER, 0, 0, sizeof(double),
                                  &oilTemperature);
    SimConnect_SetDataOnSimObject(hSimConnect, DataTypesID::OilPsiEngine1, SIMCONNECT_OBJECT_ID_USER, 0, 0, sizeof(double), &oilPressure);
  } else if (engine == 2) {
    thermalEnergy2 = thermalEnergy;
    oilTemperatureEngine2Pre = oilTemperature;
    simVars->setEngine2Oil(oilQtyActual);
    simVars->setEngine2TotalOil(oilTotalActual);
    SimConnect_SetDataOnSimObject(hSimConnect, DataTypesID::OilTempEngine2, SIMCONNECT_OBJECT_ID_USER, 0, 0, sizeof(double),
                                  &oilTemperature);
    SimConnect_SetDataOnSimObject(hSimConnect, DataTypesID::OilPsiEngine2, SIMCONNECT_OBJECT_ID_USER, 0, 0, sizeof(double), &oilPressure);
  } else if (engine == 3) {
    thermalEnergy3 = thermalEnergy;
    oilTemperatureEngine3Pre = oilTemperature;
    simVars->setEngine3Oil(oilQtyActual);
    simVars->setEngine3TotalOil(oilTotalActual);
    SimConnect_SetDataOnSimObject(hSimConnect, DataTypesID::OilTempEngine3, SIMCONNECT_OBJECT_ID_USER, 0, 0, sizeof(double),
                                  &oilTemperature);
    SimConnect_SetDataOnSimObject(hSimConnect, DataTypesID::OilPsiEngine3, SIMCONNECT_OBJECT_ID_USER, 0, 0, sizeof(double), &oilPressure);
  } else {
    thermalEnergy4 = thermalEnergy;
    oilTemperatureEngine4Pre = oilTemperature;
    simVars->setEngine4Oil(oilQtyActual);
    simVars->setEngine4TotalOil(oilTotalActual);
    SimConnect_SetDataOnSimObject(hSimConnect, DataTypesID::OilTempEngine4, SIMCONNECT_OBJECT_ID_USER, 0, 0, sizeof(double),
                                  &oilTemperature);
    SimConnect_SetDataOnSimObject(hSimConnect, DataTypesID::OilPsiEngine4, SIMCONNECT_OBJECT_ID_USER, 0, 0, sizeof(double), &oilPressure);
  }
}

 */
