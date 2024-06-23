// Copyright (c) 2023-2024 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

#ifndef FLYBYWIRE_AIRCRAFT_FADEC_A330X_H
#define FLYBYWIRE_AIRCRAFT_FADEC_A330X_H

#include "EngineControl_A330X.h"
#include "Fadec.h"

/**
 * @brief: The Fadec_A330X class is responsible for managing the FADEC system for the A330X aircraft.
 *
 * In this current implementation is only holding the EngineControl_A330X instance and is
 * responsible for calling its initialize, update and shutdown methods.
 * The actual fadec logic is implemented in the EngineControl_A330X class.
 */
class Fadec_A330X : public Fadec {
 private:
  // Engine control instance
  EngineControl_A330X engineControl{};

 public:
  /**
   * Creates a new Fadec_A33NX instance and takes a reference to the MsfsHandler instance.
   * @param msfsHandler The MsfsHandler instance that is used to communicate with the simulator.
   */
  explicit Fadec_A330X(MsfsHandler& msfsHandler) : Fadec(msfsHandler) {}

  bool initialize() override;
  bool preUpdate(sGaugeDrawData*) override { return true; }
  bool update(sGaugeDrawData* pData) override;
  bool postUpdate(sGaugeDrawData*) override { return true; }
  bool shutdown() override;
};

#endif  // FLYBYWIRE_AIRCRAFT_FADEC_A330X_H
