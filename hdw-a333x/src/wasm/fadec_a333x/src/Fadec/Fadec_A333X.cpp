// Copyright (c) 2023-2024 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

#include "Fadec_A333X.h"

bool Fadec_A333X::initialize() {
  engineControl.initialize(&msfsHandler);

  _isInitialized = true;
  LOG_INFO("Fadec_A333X initialized");
  return true;
}

bool Fadec_A333X::update([[maybe_unused]] sGaugeDrawData* pData) {
  if (!_isInitialized) {
    std::cerr << "Fadec_A333X::update() - not initialized" << std::endl;
    return false;
  }

  engineControl.update();

  return true;
}

bool Fadec_A333X::shutdown() {
  _isInitialized = false;
  LOG_INFO("Fadec_A333X::shutdown()");
  return true;
}
