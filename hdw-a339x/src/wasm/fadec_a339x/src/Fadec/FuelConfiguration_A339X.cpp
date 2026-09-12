// Copyright (c) 2023-2024 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

#include "FuelConfiguration_A339X.h"
#include <cerrno>
#include <cstdio>
#include <cstring>
#include <fstream>
#include <iomanip>
#include <limits>
#include <sstream>
#include "FuelTrimModel.hpp"
#include "inih/ini_fbw.h"
#include "logging.h"

bool FuelConfiguration_A339X::loadConfigurationFromIni() {
  if (configFilename.empty())
    return false;
  mINI::INIStructure ini;
  mINI::INIFile      file(configFilename);
  if (!file.read(ini))
    return false;
  const double missing = std::numeric_limits<double>::quiet_NaN();
  auto         read    = [&](const char* key, double fallback) {
    if (!ini.has(INI_SECTION_FUEL) || !ini.get(INI_SECTION_FUEL).has(key))
      return fallback;
    std::istringstream value(ini.get(INI_SECTION_FUEL).get(key));
    double             quantity = missing;
    if (!(value >> quantity))
      return missing;
    value >> std::ws;
    return value.eof() ? quantity : missing;
  };
  a339x::fuel::Input input;
  input.densityKgPerGallon = 1.;  // Only validate volumes; no simulation occurs here.
  input.tanksGallons       = {read(INI_SECTION_FUEL_CENTER_QUANTITY, missing),    read(INI_SECTION_FUEL_LEFT_QUANTITY, missing),
                              read(INI_SECTION_FUEL_RIGHT_QUANTITY, missing),     read(INI_SECTION_FUEL_LEFT_AUX_QUANTITY, missing),
                              read(INI_SECTION_FUEL_RIGHT_AUX_QUANTITY, missing), read(INI_SECTION_FUEL_TRIM_QUANTITY, 0.)};
  if (!a339x::fuel::step(input, {}).valid) {
    LOG_ERROR("A339X fuel save invalid or exceeds the six-tank capacities; native fuel preserved.");
    return false;
  }
  fuelCenter   = input.tanksGallons[0];
  fuelLeft     = input.tanksGallons[1];
  fuelRight    = input.tanksGallons[2];
  fuelLeftAux  = input.tanksGallons[3];
  fuelRightAux = input.tanksGallons[4];
  fuelTrim     = input.tanksGallons[5];
  return true;
}

bool FuelConfiguration_A339X::saveConfigurationToIni() {
  if (configFilename.empty())
    return false;
  a339x::fuel::Input input;
  input.densityKgPerGallon = 1.;
  input.tanksGallons       = {fuelCenter, fuelLeft, fuelRight, fuelLeftAux, fuelRightAux, fuelTrim};
  if (!a339x::fuel::step(input, {}).valid)
    return false;
  mINI::INIStructure ini;
  mINI::INIFile      original(configFilename);
  original.read(ini);
  const auto volume = [](double quantity) {
    std::ostringstream text;
    text << std::setprecision(17) << quantity;
    return text.str();
  };
  ini[INI_SECTION_FUEL][INI_SECTION_FUEL_CENTER_QUANTITY]    = volume(fuelCenter);
  ini[INI_SECTION_FUEL][INI_SECTION_FUEL_LEFT_QUANTITY]      = volume(fuelLeft);
  ini[INI_SECTION_FUEL][INI_SECTION_FUEL_RIGHT_QUANTITY]     = volume(fuelRight);
  ini[INI_SECTION_FUEL][INI_SECTION_FUEL_LEFT_AUX_QUANTITY]  = volume(fuelLeftAux);
  ini[INI_SECTION_FUEL][INI_SECTION_FUEL_RIGHT_AUX_QUANTITY] = volume(fuelRightAux);
  ini[INI_SECTION_FUEL][INI_SECTION_FUEL_TRIM_QUANTITY]      = volume(fuelTrim);
  const std::string temporary                                = configFilename + ".tmp";
  // The inherited mkdir helper compares the return value with EEXIST instead
  // of errno and creates only one level. Use the same SDK-supported primitive.
  for (auto separator = temporary.find_first_of("/\\", 1); separator != std::string::npos;
       separator      = temporary.find_first_of("/\\", separator + 1)) {
    if (mkdir(temporary.substr(0, separator).c_str(), 0777) != 0 && errno != EEXIST)
      return false;
  }
  // Check close/flush before replacing the original; the inherited generator does not.
  std::ofstream output(temporary, std::ios::binary | std::ios::trunc);
  for (const auto& section : ini) {
    output << '[' << section.first << "]\n";
    for (const auto& entry : section.second) {
      auto key = entry.first;
      mINI::INIStringUtil::replace(key, "=", "\\=");
      output << key << '=' << entry.second << '\n';
    }
  }
  output.close();
  if (!output || std::rename(temporary.c_str(), configFilename.c_str()) != 0) {
    LOG_ERROR("A339X fuel save failed; previous save retained.");
    return false;
  }
  return true;
}

std::string FuelConfiguration_A339X::toString() const {
  std::ostringstream out;
  out << "FuelConfiguration_A339X: center=" << fuelCenter << " left=" << fuelLeft << " right=" << fuelRight << " leftAux=" << fuelLeftAux
      << " rightAux=" << fuelRightAux << " trim=" << fuelTrim;
  return out.str();
}
