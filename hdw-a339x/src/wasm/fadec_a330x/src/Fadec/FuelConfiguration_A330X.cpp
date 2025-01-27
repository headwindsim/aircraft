// Copyright (c) 2023-2024 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

#include <iostream>
#include <string>

#include "inih/ini_fbw.h"
#include "inih/ini_type_conversion.h"

#include "logging.h"

#include "FuelConfiguration_A330X.h"

void FuelConfiguration_A330X::loadConfigurationFromIni() {
  LOG_INFO("Fadec::FuelConfiguration: loading configuration file " + configFilename);

  mINI::INIStructure ini;
  mINI::INIFile      iniFile(configFilename);

  if (!iniFile.read(ini)) {
    LOG_ERROR("Fadec::FuelConfiguration_A330X: failed to read configuration file " + configFilename + " due to error \"" + strerror(errno) +
              "\" -> using default fuel quantities.");
    return;
  }

  fuelCenterGallons = mINI::INITypeConversion::getDouble(ini, INI_SECTION_FUEL, INI_SECTION_FUEL_CENTER_QTY, fuelCenterDefault);
  fuelLeftOuterGallons = mINI::INITypeConversion::getDouble(ini, INI_SECTION_FUEL, INI_SECTION_FUEL_LEFT_OUTER_QTY, fuelLeftOuterDefault);
  fuelLeftInnerGallons = mINI::INITypeConversion::getDouble(ini, INI_SECTION_FUEL, INI_SECTION_FUEL_LEFT_INNER_QTY, fuelLeftInnerDefault);
  fuelRightInnerGallons = mINI::INITypeConversion::getDouble(ini, INI_SECTION_FUEL, INI_SECTION_FUEL_RIGHT_INNER_QTY, fuelRightInnerDefault);
  fuelRightOuterGallons = mINI::INITypeConversion::getDouble(ini, INI_SECTION_FUEL, INI_SECTION_FUEL_RIGHT_OUTER_QTY, fuelRightOuterDefault);
  // fuelTrimGallons = mINI::INITypeConversion::getDouble(ini, INI_SECTION_FUEL, INI_SECTION_FUEL_TRIM_QTY, fuelTrimDefault); // TODO: ADD TRIM

  LOG_DEBUG("Fadec::FuelConfiguration_A330X: loaded fuel configuration from " + configFilename + " with the following values:");
  LOG_DEBUG("Fadec::FuelConfiguration_A330X: " + this->toString());
}

void FuelConfiguration_A330X::saveConfigurationToIni() {
  LOG_DEBUG("Fadec::FuelConfiguration_A330X: saving configuration file " + configFilename);

  mINI::INIStructure ini;
  mINI::INIFile      iniFile(configFilename);

  // Do not check a possible error since the file may not exist yet
  iniFile.read(ini);

  ini[INI_SECTION_FUEL][INI_SECTION_FUEL_CENTER_QTY]  = std::to_string(this->fuelCenterGallons);
  ini[INI_SECTION_FUEL][INI_SECTION_FUEL_LEFT_OUTER_QTY]  = std::to_string(this->fuelLeftOuterGallons);
  ini[INI_SECTION_FUEL][INI_SECTION_FUEL_LEFT_INNER_QTY]  = std::to_string(this->fuelLeftInnerGallons);
  ini[INI_SECTION_FUEL][INI_SECTION_FUEL_RIGHT_INNER_QTY] = std::to_string(this->fuelRightInnerGallons);
  ini[INI_SECTION_FUEL][INI_SECTION_FUEL_RIGHT_OUTER_QTY] = std::to_string(this->fuelRightOuterGallons);
  // ini[INI_SECTION_FUEL][INI_SECTION_FUEL_TRIM_QTY]        = std::to_string(this->fuelTrimGallons); // TODO: ADD TRIM

  if (!iniFile.write(ini, true)) {
    LOG_ERROR("Fadec::FuelConfiguration_A330X: failed to write engine conf " + configFilename + " due to error \"" + strerror(errno) +
              "\"");
    return;
  }

  LOG_DEBUG("Fadec::FuelConfiguration_A330X: saved fuel configuration to " + configFilename + " with the following values:");
  LOG_DEBUG("Fadec::FuelConfiguration_A330X: " + this->toString());
}

std::string FuelConfiguration_A330X::toString() const {
  std::ostringstream oss;
  oss << "FuelConfiguration_A330X { "
      << "\n"
      << "  fuelCenter: " << fuelCenterGallons << "\n"
      << "  fuelLeftOuter: " << fuelLeftOuterGallons << "\n"
      << "  fuelLeftInner: " << fuelLeftInnerGallons << "\n"
      << "  fuelRightInner: " << fuelRightInnerGallons << "\n"
      << "  fuelRightOuter: " << fuelRightOuterGallons << "\n"
      // << "  fuelTrim: " << fuelTrimGallons << "\n" // TODO: ADD TRIM
      << "}";
  return oss.str();
}