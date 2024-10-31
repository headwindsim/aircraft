// Copyright (c) 2023-2024 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

#ifndef FLYBYWIRE_AIRCRAFT_FADEC_A333X_H
#define FLYBYWIRE_AIRCRAFT_FADEC_A333X_H

#include "EngineControlA333X.h"
#include "Fadec.h"

/**
 * @brief: The Fadec_A333X class is responsible for managing the FADEC system for the A333X aircraft.
 *
 * In this current implementation is only holding the EngineControl_A333X instance and is
 * responsible for calling its initialize, update and shutdown methods.
 * The actual fadec logic is implemented in the EngineControl_A333X class.
 */
class Fadec_A333X : public Fadec {
 private:
  // Engine control instance
  EngineControl_A333X engineControl{};

 public:
  /**
   * Creates a new Fadec_A333X instance and takes a reference to the MsfsHandler instance.
   * @param msfsHandler The MsfsHandler instance that is used to communicate with the simulator.
   */
  explicit Fadec_A333X(MsfsHandler& msfsHandler) : Fadec(msfsHandler) {}

  bool initialize() override;
  bool preUpdate(sGaugeDrawData*) override { return true; }
  bool update(sGaugeDrawData* pData) override;
  bool postUpdate(sGaugeDrawData*) override { return true; }
  bool shutdown() override;
};

#endif  // FLYBYWIRE_AIRCRAFT_FADEC_A333X_H
