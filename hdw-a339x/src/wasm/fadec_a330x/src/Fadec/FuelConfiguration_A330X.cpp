// Copyright (c) 2023-2024 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

#include <iostream>
#include <string>

#include "inih/ini.h"
#include "inih/ini_type_conversion.h"

#include "logging.h"

#include "FuelConfiguration_A330X.h"

void FuelConfiguration_A330X::loadConfigurationFromIni() {
  if (configFilename.empty()) {
    LOG_ERROR("Fadec::FuelConfiguration_A330X: no configuration file specified -> using default fuel"
              " quantities. Use setConfigFilename() to set the configuration file)");
    return;
  }

  LOG_INFO("Fadec::FuelConfiguration_A330X: loading configuration file " + configFilename);

  mINI::INIStructure ini;
  mINI::INIFile iniFile(configFilename);

  if (!iniFile.read(ini)) {
    LOG_ERROR("Fadec::FuelConfiguration_A330X: failed to read configuration file \"" + configFilename + "\" due to error \"" +
              strerror(errno) + "\" -> using default fuel quantities.");
    return;
  }

  fuelCenter = mINI::INITypeConversion::getDouble(ini, INI_SECTION_FUEL, INI_SECTION_FUEL_CENTER_QUANTITY, fuelCenterDefault);
  fuelLeft = mINI::INITypeConversion::getDouble(ini, INI_SECTION_FUEL, INI_SECTION_FUEL_LEFT_QUANTITY, fuelLeftDefault);
  fuelRight = mINI::INITypeConversion::getDouble(ini, INI_SECTION_FUEL, INI_SECTION_FUEL_RIGHT_QUANTITY, fuelRightDefault);
  fuelLeftAux = mINI::INITypeConversion::getDouble(ini, INI_SECTION_FUEL, INI_SECTION_FUEL_LEFT_AUX_QUANTITY, fuelLeftAuxDefault);
  fuelRightAux = mINI::INITypeConversion::getDouble(ini, INI_SECTION_FUEL, INI_SECTION_FUEL_RIGHT_AUX_QUANTITY, fuelRightAuxDefault);
  //fuelTrimGallons       = mINI::INITypeConversion::getDouble(ini, INI_SECTION_FUEL, INI_SECTION_FUEL_TRIM_QTY, fuelTrimDefault);

  LOG_DEBUG("Fadec::FuelConfiguration_A330X: loaded fuel configuration from " + configFilename + " with the following values:");
  LOG_DEBUG("Fadec::FuelConfiguration_A330X: " + this->toString());
}

void FuelConfiguration_A330X::saveConfigurationToIni() {
  LOG_DEBUG("Fadec::FuelConfiguration_A330X: saving configuration file " + configFilename);

  mINI::INIStructure ini;
  mINI::INIFile iniFile(configFilename);

  // Do not check a possible error since the file may not exist yet
  iniFile.read(ini);

  ini[INI_SECTION_FUEL][INI_SECTION_FUEL_CENTER_QUANTITY] = std::to_string(this->fuelCenter);
  ini[INI_SECTION_FUEL][INI_SECTION_FUEL_LEFT_QUANTITY] = std::to_string(this->fuelLeft);
  ini[INI_SECTION_FUEL][INI_SECTION_FUEL_RIGHT_QUANTITY] = std::to_string(this->fuelRight);
  ini[INI_SECTION_FUEL][INI_SECTION_FUEL_LEFT_AUX_QUANTITY] = std::to_string(this->fuelLeftAux);
  ini[INI_SECTION_FUEL][INI_SECTION_FUEL_RIGHT_AUX_QUANTITY] = std::to_string(this->fuelRightAux);
  //ini[INI_SECTION_FUEL][INI_SECTION_FUEL_TRIM_QTY]        = std::to_string(this->fuelTrimGallons);

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
  oss << "FuelConfiguration_A330X: { "
      << "fuelCenter: " << fuelCenter        //
      << ", fuelLeft: " << fuelLeft          //
      << ", fuelRight: " << fuelRight        //
      << ", fuelLeftAux: " << fuelLeftAux    //
      << ", fuelRightAux: " << fuelRightAux  //
      // << ", fuelTrimGallons: " << fuelTrimGallons  //
      << " }";
  return oss.str();
}
