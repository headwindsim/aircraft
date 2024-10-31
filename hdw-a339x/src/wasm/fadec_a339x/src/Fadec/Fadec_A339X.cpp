// Copyright (c) 2023-2024 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

#include "Fadec_A339X.h"

bool Fadec_A339X::initialize() {
  engineControl.initialize(&msfsHandler);

  _isInitialized = true;
  LOG_INFO("Fadec_A339X initialized");
  return true;
}

bool Fadec_A339X::update([[maybe_unused]] sGaugeDrawData* pData) {
  if (!_isInitialized) {
    std::cerr << "Fadec_A339X::update() - not initialized" << std::endl;
    return false;
  }

  engineControl.update();

  return true;
}

bool Fadec_A339X::shutdown() {
  _isInitialized = false;
  LOG_INFO("Fadec_A339X::shutdown()");
  return true;
}
