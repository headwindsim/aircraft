// Copyright (c) 2023-2024 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

#include "Fadec_A330X.h"

bool Fadec_A330X::initialize() {
  engineControl.initialize(&msfsHandler);

  _isInitialized = true;
  LOG_INFO("Fadec_A330X initialized");
  return true;
}

bool Fadec_A330X::update([[maybe_unused]] sGaugeDrawData* pData) {
  if (!_isInitialized) {
    std::cerr << "Fadec_A330X::update() - not initialized" << std::endl;
    return false;
  }

  engineControl.update();

  return true;
}

bool Fadec_A330X::shutdown() {
  _isInitialized = false;
  LOG_INFO("Fadec_A330X::shutdown()");
  return true;
}
