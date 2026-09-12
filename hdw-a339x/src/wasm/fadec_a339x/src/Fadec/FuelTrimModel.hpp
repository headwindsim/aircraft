// SPDX-License-Identifier: GPL-3.0
#pragma once

#include <algorithm>
#include <array>
#include <cmath>
#include <cstddef>

// Fuel volumes are native US gallons. This model does not own initialization,
// persistence, refueling, APU consumption, or existing native transfer paths.
namespace a339x::fuel {
inline constexpr std::size_t                   TankCount = 6;
inline constexpr std::array<double, TankCount> TankCapacities{10979., 11095., 11095., 964., 964., 1646.};
// Experimental trim arm from PR 76, pending simulator/aircraft validation.
inline constexpr std::array<double, TankCount> LongitudinalArms{-20.3, -25.5, -25.5, -41., -41., -107.};

enum class TrimCommand { Off, Aft, Forward };
enum class TrimMode { Off, Holding, Aft, Forward, Inhibited, Fault, Limit };

struct State {
  double valvePosition = 0.;
};

struct Input {
  std::array<double, TankCount> tanksGallons{};
  double                        dtSeconds          = 0.;
  double                        densityKgPerGallon = 0.;
  std::array<double, 2>         engineKgPerSecond{};
  bool                          crossfeedOpen = false;
  std::array<bool, 2>           engineFeedPumpActive{};
  bool                          trimEnabled              = false;
  bool                          refueling                = false;
  bool                          onGround                 = true;
  bool                          pumpPowered              = false;
  bool                          pumpFailed               = false;
  bool                          valvePowered             = false;
  bool                          valveStuck               = false;
  TrimCommand                   trimCommand              = TrimCommand::Off;
  double                        trimTargetGallons        = 0.;
  double                        trimRateGallonsPerSecond = 0.;
};

struct Diagnostics {
  double                totalBeforeGallons = 0.;
  double                totalAfterGallons  = 0.;
  std::array<double, 2> actualEngineBurnKg{};
  double                actualTransferGallons     = 0.;  // Positive aft, negative forward.
  bool                  valveCommandOpen          = false;
  double                valveActualPosition       = 0.;
  bool                  pumpCommandOn             = false;
  bool                  pumpActive                = false;
  double                fuelMomentBeforeKgFeet    = 0.;
  double                fuelMomentAfterKgFeet     = 0.;
  double                transferMomentDeltaKgFeet = 0.;
};

struct Result {
  bool                          valid = false;
  std::array<double, TankCount> tanksGallons{};
  State                         state{};
  TrimMode                      mode = TrimMode::Fault;
  Diagnostics                   diagnostics{};
};

inline Result step(const Input& in, const State& state) {
  Result out;
  out.tanksGallons       = in.tanksGallons;
  out.state              = state;
  const auto nonnegative = [](double x) { return std::isfinite(x) && x >= 0.; };
  // Reject the entire step; independent clamps would create or destroy fuel.
  if (!nonnegative(in.dtSeconds) || !std::isfinite(in.densityKgPerGallon) || in.densityKgPerGallon <= 0. ||
      !nonnegative(state.valvePosition) || state.valvePosition > 1. || !nonnegative(in.trimTargetGallons) ||
      in.trimTargetGallons > TankCapacities[5] || !nonnegative(in.trimRateGallonsPerSecond) ||
      (in.trimCommand != TrimCommand::Off && in.trimCommand != TrimCommand::Aft && in.trimCommand != TrimCommand::Forward)) {
    return out;
  }
  for (std::size_t t = 0; t < TankCount; ++t) {
    if (!nonnegative(in.tanksGallons[t]) || in.tanksGallons[t] > TankCapacities[t])
      return out;
  }
  std::array<double, 2> requestedGallons{};
  for (std::size_t e = 0; e < 2; ++e) {
    if (!nonnegative(in.engineKgPerSecond[e]))
      return out;
    requestedGallons[e] = in.engineKgPerSecond[e] * in.dtSeconds / in.densityKgPerGallon;
    if (!nonnegative(requestedGallons[e]))
      return out;
  }
  const double transferBudget = in.trimRateGallonsPerSecond * in.dtSeconds;
  if (!nonnegative(transferBudget) || !std::isfinite(requestedGallons[0] + requestedGallons[1]) ||
      !std::isfinite(in.densityKgPerGallon * 36743. * 107.))
    return out;

  out.valid   = true;
  auto& d     = out.diagnostics;
  auto& tanks = out.tanksGallons;
  for (std::size_t t = 0; t < TankCount; ++t) {
    d.totalBeforeGallons += tanks[t];
    d.fuelMomentBeforeKgFeet += tanks[t] * in.densityKgPerGallon * LongitudinalArms[t];
  }

  // Closed crossfeed preserves the existing local gravity/suction feed.
  // The adapter supplies zero demand for an off engine or closed engine valve.
  // Open crossfeed is an ideal shared manifold: powered supplies serve both
  // engine demands proportionally, including when the available fuel runs out.
  std::array<double, 2> burnGallons{};
  if (!in.crossfeedOpen) {
    for (std::size_t e = 0; e < 2; ++e) {
      burnGallons[e] = std::min(tanks[e + 1], requestedGallons[e]);
      tanks[e + 1] -= burnGallons[e];
    }
  } else {
    const double need      = requestedGallons[0] + requestedGallons[1];
    const double left      = in.engineFeedPumpActive[0] ? tanks[1] : 0.;
    const double right     = in.engineFeedPumpActive[1] ? tanks[2] : 0.;
    const double available = left + right;
    const double draw      = std::min(need, available);
    if (draw > 0.) {
      const double fromLeft = std::min(left, draw * (left / available));
      tanks[1] -= fromLeft;
      tanks[2] -= std::min(right, draw - fromLeft);
      burnGallons[0] = draw * (requestedGallons[0] / need);
      burnGallons[1] = draw - burnGallons[0];
    }
  }
  for (std::size_t e = 0; e < 2; ++e)
    d.actualEngineBurnKg[e] = burnGallons[e] * in.densityKgPerGallon;

  const bool        selected      = in.trimEnabled && in.trimCommand != TrimCommand::Off;
  const bool        aft           = in.trimCommand == TrimCommand::Aft;
  const bool        inhibited     = in.refueling || (in.onGround && aft);
  const bool        targetPending = aft ? tanks[5] < in.trimTargetGallons : tanks[5] > in.trimTargetGallons;
  const std::size_t source        = aft ? 0 : 5;
  const std::size_t destination   = aft ? 5 : 0;
  const bool        limited       = tanks[source] <= 0. || tanks[destination] >= TankCapacities[destination];
  const bool        request       = selected && !inhibited && targetPending && !limited;
  d.valveCommandOpen              = request;
  d.pumpCommandOn                 = request;
  // ponytail: ideal instantaneous powered valve, unpowered/stuck holds position;
  // replace with measured actuator timing and fail position when established.
  if (in.dtSeconds > 0. && in.valvePowered && !in.valveStuck)
    out.state.valvePosition = request ? 1. : 0.;
  d.valveActualPosition = out.state.valvePosition;
  d.pumpActive          = request && in.pumpPowered && !in.pumpFailed;

  if (!selected)
    out.mode = TrimMode::Off;
  else if (inhibited)
    out.mode = TrimMode::Inhibited;
  else if (in.pumpFailed || in.valveStuck)
    out.mode = TrimMode::Fault;
  else if (!in.pumpPowered || !in.valvePowered)
    out.mode = TrimMode::Inhibited;
  else if (!targetPending)
    out.mode = TrimMode::Holding;
  else if (limited)
    out.mode = TrimMode::Limit;
  else
    out.mode = TrimMode::Holding;

  // No passive path is modeled. A failed pump cannot transfer through an open
  // valve. A stuck-open valve can still pass powered flow when commanded.
  if (d.pumpActive && d.valveActualPosition > 0.) {
    const double toTarget = std::abs(in.trimTargetGallons - tanks[5]);
    const double amount =
        std::min({transferBudget * d.valveActualPosition, toTarget, tanks[source], TankCapacities[destination] - tanks[destination]});
    tanks[source] -= amount;
    tanks[destination] += amount;
    d.actualTransferGallons = aft ? amount : -amount;
    if (amount > 0. && !in.pumpFailed && !in.valveStuck && in.valvePowered) {
      out.mode = aft ? TrimMode::Aft : TrimMode::Forward;
    }
  }
  d.transferMomentDeltaKgFeet = d.actualTransferGallons * in.densityKgPerGallon * (LongitudinalArms[5] - LongitudinalArms[0]);
  for (std::size_t t = 0; t < TankCount; ++t) {
    d.totalAfterGallons += tanks[t];
    d.fuelMomentAfterKgFeet += tanks[t] * in.densityKgPerGallon * LongitudinalArms[t];
  }
  return out;
}
}  // namespace a339x::fuel
