// Standalone: c++ -std=c++17 -O2 scripts/fuel-trim/fuel-trim-test.cpp -o fuel-trim-test && ./fuel-trim-test
#include <cassert>
#include <iostream>
#include <limits>
#include <numeric>
#include <random>
#include "../../hdw-a339x/src/wasm/fadec_a339x/src/Fadec/FuelTrimModel.hpp"

using namespace a339x::fuel;

static void near(double a, double b, double tolerance = 1e-7) {
  assert(std::abs(a - b) <= tolerance);
}

static void check(const Input& input, const Result& result) {
  assert(result.valid);
  for (std::size_t t = 0; t < TankCount; ++t) {
    assert(std::isfinite(result.tanksGallons[t]));
    assert(result.tanksGallons[t] >= 0. && result.tanksGallons[t] <= TankCapacities[t]);
  }
  const auto& d = result.diagnostics;
  near((d.totalBeforeGallons - d.totalAfterGallons) * input.densityKgPerGallon, d.actualEngineBurnKg[0] + d.actualEngineBurnKg[1]);
  near(d.fuelMomentAfterKgFeet - d.fuelMomentBeforeKgFeet,
       -(d.actualEngineBurnKg[0] + d.actualEngineBurnKg[1]) * LongitudinalArms[1] + d.transferMomentDeltaKgFeet, 1e-6);
  for (std::size_t e = 0; e < 2; ++e) {
    assert(d.actualEngineBurnKg[e] >= 0.);
    assert(d.actualEngineBurnKg[e] <= input.engineKgPerSecond[e] * input.dtSeconds + 1e-8);
  }
}

int main() {
  Input in;
  in.tanksGallons       = {5000., 10000., 10000., 964., 964., 500.};
  in.densityKgPerGallon = 3.;
  in.dtSeconds          = 1.;
  State state;
  auto  r = step(in, state);
  check(in, r);
  assert(r.tanksGallons == in.tanksGallons);  // No initialization/refuel/APU overwrite.
  in.engineKgPerSecond    = {3., 6.};
  in.engineFeedPumpActive = {true, true};
  r                       = step(in, state);
  check(in, r);
  near(r.tanksGallons[1], 9999.);
  near(r.tanksGallons[2], 9998.);
  in.engineFeedPumpActive = {false, false};
  r                       = step(in, state);
  check(in, r);
  near(r.tanksGallons[1], 9999.);  // Closed-crossfeed suction feed is retained.
  near(r.tanksGallons[2], 9998.);
  in.crossfeedOpen = true;
  r                = step(in, state);
  assert(r.tanksGallons == in.tanksGallons);
  in.engineFeedPumpActive = {true, false};
  r                       = step(in, state);
  check(in, r);
  near(r.tanksGallons[1], 9997.);
  near(r.tanksGallons[2], 10000.);
  in.tanksGallons[1] = 0.5;
  r                  = step(in, state);
  check(in, r);
  near(r.diagnostics.actualEngineBurnKg[0] + r.diagnostics.actualEngineBurnKg[1], 1.5);
  near(r.diagnostics.actualEngineBurnKg[0], 0.5);
  near(r.diagnostics.actualEngineBurnKg[1], 1.0);

  in.engineKgPerSecond        = {0., 0.};
  in.trimEnabled              = true;
  in.trimCommand              = TrimCommand::Aft;
  in.trimTargetGallons        = 800.;
  in.trimRateGallonsPerSecond = 100.;
  in.pumpPowered = in.valvePowered = true;
  r                                = step(in, state);
  assert(r.mode == TrimMode::Inhibited && r.tanksGallons == in.tanksGallons);
  in.onGround = false;
  r           = step(in, state);
  check(in, r);
  near(r.diagnostics.actualTransferGallons, 100.);
  assert(r.diagnostics.transferMomentDeltaKgFeet < 0.);  // Negative arm means aft CG.
  state        = r.state;
  in.refueling = true;
  r            = step(in, state);
  assert(r.tanksGallons == in.tanksGallons && !r.diagnostics.pumpActive);
  in.refueling  = false;
  in.pumpFailed = true;
  r             = step(in, state);
  assert(r.mode == TrimMode::Fault && r.tanksGallons == in.tanksGallons);
  in.pumpFailed = false;
  in.valveStuck = true;
  r             = step(in, State{});
  assert(r.mode == TrimMode::Fault && r.tanksGallons == in.tanksGallons);
  r = step(in, state);  // Explicit stuck-open valve passes powered flow.
  check(in, r);
  assert(r.mode == TrimMode::Fault && r.diagnostics.actualTransferGallons > 0.);
  in.valveStuck  = false;
  in.pumpPowered = in.valvePowered = false;
  r                                = step(in, state);
  assert(r.tanksGallons == in.tanksGallons && r.state.valvePosition == 1.);
  in.pumpPowered = in.valvePowered = true;
  in.dtSeconds                     = 100.;
  r                                = step(in, state);
  check(in, r);
  near(r.tanksGallons[5], 800.);  // Target stops transfer without overshoot.
  in.tanksGallons = r.tanksGallons;
  r               = step(in, r.state);
  assert(r.mode == TrimMode::Holding && r.tanksGallons == in.tanksGallons);
  in.trimCommand       = TrimCommand::Forward;
  in.trimTargetGallons = 0.;
  r                    = step(in, r.state);
  check(in, r);
  near(r.tanksGallons[5], 0.);
  assert(r.diagnostics.transferMomentDeltaKgFeet > 0.);
  in.tanksGallons[0] = TankCapacities[0];
  r                  = step(in, state);
  assert(r.mode == TrimMode::Limit && r.tanksGallons == in.tanksGallons);
  in.dtSeconds = 0.;
  r            = step(in, State{0.5});
  check(in, r);
  assert(r.tanksGallons == in.tanksGallons && r.state.valvePosition == 0.5);

  const Input valid = in;
  for (int fault = 0; fault < 12; ++fault) {
    in = valid;
    State prior{0.5};
    switch (fault) {
      case 0:
        in.dtSeconds = -1.;
        break;
      case 1:
        in.tanksGallons[5] = TankCapacities[5] + 1.;
        break;
      case 2:
        in.tanksGallons[1] = -1.;
        break;
      case 3:
        in.densityKgPerGallon = 0.;
        break;
      case 4:
        in.engineKgPerSecond[0] = std::numeric_limits<double>::infinity();
        break;
      case 5:
        in.trimRateGallonsPerSecond = std::numeric_limits<double>::quiet_NaN();
        break;
      case 6:
        in.trimTargetGallons = -1.;
        break;
      case 7:
        prior.valvePosition = 2.;
        break;
      case 8:
        in.trimCommand = static_cast<TrimCommand>(99);
        break;
      case 9:
        in.dtSeconds                = std::numeric_limits<double>::max();
        in.trimRateGallonsPerSecond = 2.;
        break;
      case 10:
        in.dtSeconds            = 2.;
        in.engineKgPerSecond[0] = std::numeric_limits<double>::max();
        break;
      case 11:
        in.densityKgPerGallon = std::numeric_limits<double>::max();
        break;
    }
    r = step(in, prior);
    assert(!r.valid && r.tanksGallons == in.tanksGallons && r.state.valvePosition == prior.valvePosition);
  }

  // Same simulated hour at 60/20/1 Hz and eight-second accelerated steps.
  // These are test timings, not an extra simulation-rate multiplier.
  std::array<double, 6> reference{};
  for (double dt : {1., 1. / 60., 1. / 20., 8.}) {
    Input timed;
    timed.tanksGallons       = {5000., 10000., 10000., 964., 964., 0.};
    timed.densityKgPerGallon = 3.;
    timed.engineKgPerSecond  = {0.3, 0.6};
    timed.trimEnabled = timed.pumpPowered = timed.valvePowered = true;
    timed.onGround                                             = false;
    timed.trimCommand                                          = TrimCommand::Aft;
    timed.trimTargetGallons                                    = 1000.;
    timed.trimRateGallonsPerSecond                             = 0.5;
    State  timedState;
    double remaining = 3600.;
    while (remaining > 0.) {
      timed.dtSeconds     = std::min(dt, remaining);
      const auto advanced = step(timed, timedState);
      check(timed, advanced);
      timed.tanksGallons = advanced.tanksGallons;
      timedState         = advanced.state;
      remaining -= timed.dtSeconds;
    }
    if (dt == 1.)
      reference = timed.tanksGallons;
    for (std::size_t t = 0; t < TankCount; ++t)
      near(timed.tanksGallons[t], reference[t], 1e-5);
    near(timed.tanksGallons[1], 9640., 1e-5);
    near(timed.tanksGallons[2], 9280., 1e-5);
    near(timed.tanksGallons[5], 1000.);
  }

  // Fixed-seed long-haul sequence: variable simulation step, external native
  // snapshot changes, target reversal, refuel inhibition, and fault recovery.
  std::mt19937                           random(339);
  std::uniform_real_distribution<double> unit(0., 1.);
  in                      = valid;
  in.tanksGallons         = TankCapacities;
  in.engineFeedPumpActive = {true, true};
  state                   = {};
  long double ledgerKg    = std::accumulate(in.tanksGallons.begin(), in.tanksGallons.end(), 0.L) * in.densityKgPerGallon;
  for (int n = 0; n < 50000; ++n) {
    in.dtSeconds                = n % 97 == 0 ? 0. : unit(random) * 20.;
    in.engineKgPerSecond        = {unit(random) * 1.5, unit(random) * 1.5};
    in.crossfeedOpen            = n % 3 == 0;
    in.refueling                = n % 101 == 0;
    in.trimCommand              = n % 211 < 100 ? TrimCommand::Aft : TrimCommand::Forward;
    in.trimTargetGallons        = in.trimCommand == TrimCommand::Aft ? 1600. : 0.;
    in.trimRateGallonsPerSecond = 0.75;
    in.pumpPowered              = n % 17 != 0;
    in.valvePowered             = n % 19 != 0;
    in.pumpFailed               = n % 31 == 0;
    in.valveStuck               = n % 37 == 0;
    if (n % 1000 == 0) {  // Simulates receiving a fresh externally edited snapshot.
      const auto before = std::accumulate(in.tanksGallons.begin(), in.tanksGallons.end(), 0.L);
      for (std::size_t t = 0; t < TankCount; ++t)
        in.tanksGallons[t] = unit(random) * TankCapacities[t];
      ledgerKg += (std::accumulate(in.tanksGallons.begin(), in.tanksGallons.end(), 0.L) - before) * in.densityKgPerGallon;
    }
    r = step(in, state);
    check(in, r);
    ledgerKg -= r.diagnostics.actualEngineBurnKg[0] + r.diagnostics.actualEngineBurnKg[1];
    near(r.diagnostics.totalAfterGallons * in.densityKgPerGallon, static_cast<double>(ledgerKg), 1e-5);
    if (in.pumpFailed || !in.pumpPowered || in.refueling)
      near(r.diagnostics.actualTransferGallons, 0.);
    in.tanksGallons = r.tanksGallons;
    state           = r.state;
  }
  std::cout << "fuel-trim: deterministic checks and 50000 variable-step updates passed\n";
}
