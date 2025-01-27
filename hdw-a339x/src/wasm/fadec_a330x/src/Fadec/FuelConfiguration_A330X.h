// Copyright (c) 2023-2024 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

#ifndef FLYBYWIRE_AIRCRAFT_FUELCONFIGURATION_A330X_H
#define FLYBYWIRE_AIRCRAFT_FUELCONFIGURATION_A330X_H

#include <string>

#define INI_SECTION_FUEL "FUEL"
#define INI_SECTION_FUEL_CENTER_QTY "FUEL_CENTER_QTY"
#define INI_SECTION_FUEL_LEFT_OUTER_QTY "FUEL_LEFT_OUTER_QTY"
#define INI_SECTION_FUEL_LEFT_INNER_QTY "FUEL_LEFT_INNER_QTY"
#define INI_SECTION_FUEL_RIGHT_INNER_QTY "FUEL_RIGHT_INNER_QTY"
#define INI_SECTION_FUEL_RIGHT_OUTER_QTY "FUEL_RIGHT_OUTER_QTY"
// #define INI_SECTION_FUEL_TRIM_QTY "FUEL_TRIM_QTY" // TODO: ADD TRIM

/**
 * @class FuelConfiguration
 * @brief This struct represents the fuel configuration for the aircraft.
 *
 * This class provides methods to load and save the fuel configuration from/to an INI file.
 * It also provides getter and setter methods for each fuel tank quantity.
 */
class FuelConfiguration_A330X {
  // Fuel tank default quantities in gallons
  static constexpr double fuelLeftInnerDefault = 1645.0;                // tank 2
  static constexpr double fuelRightInnerDefault = fuelLeftInnerDefault; // tank 3

  static constexpr double fuelCenterDefault = 0;                        // tank 1
  static constexpr double fuelLeftOuterDefault = 0;                     // tank 4
  static constexpr double fuelRightOuterDefault = fuelLeftOuterDefault; // tank 5
  // static constexpr double fuelTrimDefault = 0;  // tank 6 // TODO: ADD TRIM

 private:
  // Actual fuel tank quantities in gallons
  double fuelCenterGallons = fuelCenterDefault;
  double fuelLeftOuterGallons = fuelLeftOuterDefault;
  double fuelLeftInnerGallons = fuelLeftInnerDefault;
  double fuelRightOuterGallons = fuelRightOuterDefault;
  double fuelRightInnerGallons = fuelRightInnerDefault;
  // double fuelTrimGallons = fuelTrimDefault; // TODO: ADD TRIM

  std::string configFilename{"A330X-default-fuel-config.ini"};

 public:
  /**
   * @brief Returns the filename of the INI file to use for loading and saving the fuel configuration.
   */
  std::string getConfigFilename() const { return configFilename; }

  /**
   * @brief Sets the filename of the INI file to use for loading and saving the fuel configuration.
   *
   * This must to be done before calling loadConfigurationFromIni or saveConfigurationToIni otherwise
   * the default filename will be used.
   *
   * @param configFilename The filename of the INI file to use for loading and saving the fuel configuration.
   */
  void setConfigFilename(const std::string& configFilename) { this->configFilename = configFilename; }

  /**
   * @brief Loads the fuel configuration from an INI file.
   *
   * This method reads the INI file specified in the configFilename member variable and updates the fuel quantities accordingly.
   * If the INI file cannot be read, an error message is logged and the method returns without making any changes.
   */
  void loadConfigurationFromIni();

  /**
   * @brief Saves the current fuel configuration to an INI file.
   *
   * This method writes the current fuel quantities to the INI file specified in the configFilename member variable.
   * If the INI file cannot be written, an error message is logged.
   */
  void saveConfigurationToIni();

 public:

  double getFuelCenterGallons() const { return fuelCenterGallons; }
  double getFuelLeftOuterGallons() const { return fuelLeftOuterGallons; }
  double getFuelLeftInnerGallons() const { return fuelLeftInnerGallons; }
  double getFuelRightInnerGallons() const { return fuelRightInnerGallons; }
  double getFuelRightOuterGallons() const { return fuelRightOuterGallons; }
  // double getFuelTrimGallons() const { return fuelTrimGallons; } // TODO: ADD TRIM

  void setFuelCenterGallons(double fuelCenterGallons) { this->fuelCenterGallons = fuelCenterGallons; }
  void setFuelLeftOuterGallons(double fuelLeftOuterGallons) { this->fuelLeftOuterGallons = fuelLeftOuterGallons; }
  void setFuelLeftInnerGallons(double fuelLeftInnerGallons) { this->fuelLeftInnerGallons = fuelLeftInnerGallons; }
  void setFuelRightInnerGallons(double fuelRightInnerGallons) { this->fuelRightInnerGallons = fuelRightInnerGallons; }
  void setFuelRightOuterGallons(double fuelRightOuterGallons) { this->fuelRightOuterGallons = fuelRightOuterGallons; }
  // void setFuelTrimGallons(double fuelTrimGallons) { this->fuelTrimGallons = fuelTrimGallons; } // TODO: ADD TRIM

  std::string toString() const;
};

#endif  // FLYBYWIRE_AIRCRAFT_FUELCONFIGURATION_A330X_H