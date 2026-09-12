// Links the production FuelConfiguration_A339X.cpp; no persistence substitutes.
#include <array>
#include <chrono>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <iterator>
#include <limits>
#include <string>
#include "FuelConfiguration_A339X.h"

namespace fs         = std::filesystem;
static int  failures = 0;
static void expect(bool value, const char* message) {
  if (!value) {
    ++failures;
    std::cerr << "FAIL: " << message << '\n';
  }
}
static std::array<double, 6> quantities(const FuelConfiguration_A339X& state) {
  return {state.getFuelCenter(),  state.getFuelLeft(),     state.getFuelRight(),
          state.getFuelLeftAux(), state.getFuelRightAux(), state.getFuelTrim()};
}
static void write(const fs::path& path, const std::string& content) {
  std::ofstream stream(path);
  stream << content;
  stream.close();
  expect(!stream.fail(), "test fixture written");
}
static std::string read(const fs::path& path) {
  std::ifstream stream(path);
  return {std::istreambuf_iterator<char>(stream), std::istreambuf_iterator<char>()};
}
static std::string ini(const std::string& center, const std::string& trim = "") {
  return "[FUEL]\nFUEL_CENTER_QUANTITY=" + center +
         "\nFUEL_LEFT_QUANTITY=200\nFUEL_RIGHT_QUANTITY=300\nFUEL_LEFT_AUX_QUANTITY=40\nFUEL_RIGHT_AUX_QUANTITY=50\n" + trim;
}

int main() {
  const fs::path directory =
      fs::temp_directory_path() / ("a339x-fuel-state-" + std::to_string(std::chrono::steady_clock::now().time_since_epoch().count()));
  fs::create_directory(directory);
  const fs::path          file = directory / "fuel.ini";
  FuelConfiguration_A339X firstSave;
  firstSave.setConfigFilename((directory / "new" / "nested" / "fuel.ini").string());
  expect(firstSave.saveConfigurationToIni(), "first save creates missing parent directories");
  FuelConfiguration_A339X state;
  state.setConfigFilename(file.string());
  const auto original = quantities(state);
  expect(!state.loadConfigurationFromIni(), "missing save rejected");
  expect(quantities(state) == original, "missing save preserves state");
  write(file, "[FUEL]\nFUEL_CENTER_QUANTITY=100\n");
  expect(!state.loadConfigurationFromIni(), "partial save rejected");
  expect(quantities(state) == original, "partial save preserves all state");

  write(file, ini("100"));
  expect(state.loadConfigurationFromIni(), "legacy five-tank save accepted");
  expect(quantities(state) == std::array<double, 6>{100., 200., 300., 40., 50., 0.}, "legacy missing trim means zero");
  write(file, ini("100", "FUEL_TRIM_QUANTITY=600\n"));
  expect(state.loadConfigurationFromIni(), "six-tank save accepted");
  const auto valid = quantities(state);
  expect(valid[5] == 600., "trim restored");

  const auto invalid = [&](const std::string& content, const char* message) {
    write(file, content);
    expect(!state.loadConfigurationFromIni(), message);
    expect(quantities(state) == valid, "invalid save preserves entire previous state");
    // Keep later rejection tests independent if a defective parser changed state.
    write(file, ini("100", "FUEL_TRIM_QUANTITY=600\n"));
    expect(state.loadConfigurationFromIni(), "restore valid test state");
  };
  invalid(ini("12625"), "old center exceeding split capacity rejected");
  invalid(ini("-1"), "negative quantity rejected");
  invalid(ini("nan"), "nonfinite center rejected");
  invalid(ini("junk"), "invalid center rejected");
  invalid(ini("100junk"), "numeric prefix with trailing junk rejected");
  invalid(ini("100", "FUEL_TRIM_QUANTITY=broken\n"), "invalid present trim must not default to zero");
  invalid(ini("100", "FUEL_TRIM_QUANTITY=\n"), "empty present trim must not default to zero");
  invalid(ini("100", "FUEL_TRIM_QUANTITY=1647\n"), "over-capacity trim rejected");

  expect(state.saveConfigurationToIni(), "valid six-tank save succeeds");
  expect(!fs::exists(file.string() + ".tmp"), "successful save leaves no temporary file");
  FuelConfiguration_A339X restored;
  restored.setConfigFilename(file.string());
  expect(restored.loadConfigurationFromIni() && quantities(restored) == valid, "six-tank round trip");
  state.setFuelTrim(700.);
  expect(state.saveConfigurationToIni(), "existing file replaced on second save");
  expect(restored.loadConfigurationFromIni() && restored.getFuelTrim() == 700., "second save replaces contents");
  state.setFuelTrim(600.1234567890123);
  expect(state.saveConfigurationToIni(), "fractional save succeeds");
  expect(restored.loadConfigurationFromIni() && restored.getFuelTrim() == state.getFuelTrim(), "fractional double round trip");

  const std::string secondSave = read(file);
  state.setFuelTrim(1647.);
  expect(!state.saveConfigurationToIni(), "over-capacity save refused");
  expect(read(file) == secondSave, "rejected save leaves previous file byte-for-byte intact");
  state.setFuelTrim(std::numeric_limits<double>::quiet_NaN());
  expect(!state.saveConfigurationToIni(), "NaN save refused");
  expect(read(file) == secondSave, "NaN save preserves previous file");
  state.setFuelTrim(800.);
  fs::create_directory(file.string() + ".tmp");
  expect(!state.saveConfigurationToIni(), "temporary output failure reported");
  expect(read(file) == secondSave, "temporary output failure preserves previous file");
#ifdef __linux__
  fs::remove(file.string() + ".tmp");
  fs::create_symlink("/dev/full", file.string() + ".tmp");
  expect(!state.saveConfigurationToIni(), "flush failure is reported");
  expect(read(file) == secondSave, "flush failure preserves previous file");
#endif

  fs::remove_all(directory);
  if (failures == 0)
    std::cout << "fuel-state: production persistence checks passed\n";
  return failures == 0 ? 0 : 1;
}
