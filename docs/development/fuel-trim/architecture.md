# Fuel and experimental trim integration

This is a simulator implementation. Automatic A330-900neo CG management is not enabled. The native trim tank is represented, and an explicitly enabled developer controller can move fuel between center and trim. See [references and assumptions](references-and-assumptions.md) for applicability and limitations.

## State ownership

| State/variable | Units | Authoritative owner and writers | Readers | Timing/initialization | Persistence/native interaction |
| --- | --- | --- | --- | --- | --- |
| `FUELSYSTEM TANK QUANTITY:1..6` | US gal | Native simulator state; native existing network/APU, bounded FADEC deltas, explicit ground EFB writes | FADEC, Rust, SD, EFB | Native visual-frame snapshot; initialization never redistributes | Native saved-flight quantities retained; optional explicit INI restoration |
| Engine fuel consumption | kg/s internally; `A32NX_ENGINE_FF:1/2` kg/h | FADEC | Engine displays, kernel, telemetry | Simulation seconds; trapezoidal previous/current flow | `engines.cfg` retains `fuel_flow_scalar=0`, preventing a second native engine burn |
| Native APU consumption / line 18 flow | US gal/h | Native APU/network | Rust APU adapter, FADEC telemetry | Native step; FADEC does not subtract it again | Already reflected in native tank reads; telemetry labels flow integration as an estimate |
| Existing center/outer transfers | US gal and native line flow | Native network and existing control bindings | FADEC observes quantities; SD reads valves | Native step | FADEC no longer infers these transfers from tank depletion |
| Experimental trim transfer | US gal/s and US gal | `FuelTrimModel.hpp`, committed through one center+trim SimConnect definition | Native mass/CG, SD, telemetry | Explicit enable, direction, target and rate; disabled/zero-rate on reload | No competing native trim lines; no hidden trim quantity cache |
| Trim pump/valve command, availability, actual state, failure | Bool / valve fraction 0..1 / mode enum | FADEC test controller; native AC1/DC1 bus indications supply availability | SD and diagnostics | Per simulation step; failed pump cannot provide flow | Generic experimental actuator assumptions, not certified aircraft hardware behavior |
| `A32NX_TOTAL_FUEL_QUANTITY`, `A32NX_TOTAL_FUEL_VOLUME` | kg, US gal | Rust `FuelSystem`, read-only native tanks | EWD, SD, MCDU, EFB, airframe | Rust tick; six tanks and native density | No independent display integration; valid density retained across unavailable reads |
| `A32NX_AIRFRAME_*` weight/CG | kg / percent MAC | Existing Rust airframe using fuel/payload moments | EFB/payload pages | Rust tick | No artificial payload fuel mass and no native CG setter |
| `A32NX_FUEL_*_DESIRED` and refuel flag | US gal / Bool | EFB targets and existing refuel class | Refuel adapter and FADEC inhibit | Ground only, including instant mode; exact bounded targets | An external-edit sequence survives a batch that starts and finishes between FADEC reads |
| `A32NX_FUEL_*_PRE` | lb | FADEC diagnostic compatibility outputs | Legacy readers and pump sound gates | After accepted writes; never used as fuel authority | Not a second persistent tank model |
| Livery INI | US gal | Explicit FADEC save/restore requests | FADEC | Stopped engines on ground, outside refueling/pause | Strict whole-file validation; temporary-file replacement; failed writes retain previous save |

The native state is read again each frame. Intentional native fuel-window changes are accepted, including airborne native edits. Their origin cannot always be inferred from a quantity snapshot: telemetry records the native net change without falsely labelling every residual as refueling. EFB batches additionally publish `A339X_FUEL_EXTERNAL_EDIT_SEQUENCE`; FADEC waits for a subsequent native sample after the sequence changes or refueling ends.

## Tank mapping and CG

| Native index | Tank | Capacity, US gal | Position, feet (longitudinal, lateral, vertical) | Rust enum index |
| ---: | --- | ---: | --- | ---: |
| 1 | Center | 10979 | -20.3, 0, 4 | 0 |
| 2 | Left inner | 11095 | -25.5, -33.8, 1.3 | 1 |
| 3 | Right inner | 11095 | -25.5, 33.8, 1.3 | 3 |
| 4 | Left outer | 964 | -41, -70, 6.1 | 2 |
| 5 | Right outer | 964 | -41, 70, 6.1 | 4 |
| 6 | Trim | 1646 | -107, 0, 23.5 | 5 |

Total remains **36,743 US gal**: `10979 + 1646` replaces the former 12,625-gallon center allocation. Existing zero unusable-capacity conventions remain. The trim arm comes from draft PR 76 and remains unvalidated.

The datum is `(0,0,0)` and negative longitudinal coordinates are aft. A center-to-trim transfer produces moment change `gallons * kgPerGallon * (-107 - -20.3)`. It changes native tank mass distribution without changing total mass. The diagnostic percent-MAC delta is `-100 * momentChange / (nativeGrossMassKg * 23.19)`, using the existing Rust MAC. The native aircraft's reference-chord calculation still needs comparison in MSFS; this diagnostic is not a native CG write or a validated target schedule.

## Controller and integration boundaries

Modes are `0 Off`, `1 Holding`, `2 Aft`, `3 Forward`, `4 Inhibited`, `5 Fault`, `6 Limit`. A directional target prevents overshoot. Reaching a target holds; empty donor/full receiver limits; refueling inhibits all trim transfer; aft transfer on ground is inhibited. Changing the command or target deliberately changes the requested direction. No altitude, descent, automatic CG schedule or undocumented hysteresis is invented.

The test pump uses AC1 availability and the test valve uses DC1 availability. These assignments, the ideal instantaneous powered valve and its retained position when unpowered/stuck are explicit engineering approximations. No electrical current draw or passive trim route is claimed. Stuck-open valves can pass commanded powered flow; pump failure prevents that flow. The actual transfer indication follows accepted quantity writes, not merely a mode label.

Native write failures are checked. Failed feed writes do not accrue reported consumption; failed trim writes do not accrue reported transfer. Restore uses a single six-tank data definition. SimConnect acceptance is not proof of subsequent simulator readback, so runtime validation remains necessary.

Malformed inactive trim controls cannot suspend otherwise valid engine consumption. Invalid native quantities/density cause a diagnostic fault without independent clamps. Native tank capacity/position contracts are tested against C++, Rust and adapter indices.

Durable changes live under `hdw-a339x` and `hdw-a339x-common`. The latter contains aircraft-specific copies of inherited shared fuel and EFB files, because the build combines whole-file overrides. `build-a339x` and `build-common` remain disposable.

## Persistence

Cold, running, airborne and reload initialization keep the simulator's supplied quantities. Existing five-tank INI saves can be explicitly restored with absent trim interpreted as zero. A present malformed trim value is rejected. Old saves whose center exceeds 10,979 gallons are rejected intact; they are not silently split into trim. Native legacy saved-flight migration beyond the quantities supplied by MSFS is not implemented.

Save and restore are developer requests, not new cockpit procedures. Automatic per-livery INI overwrite was removed so it cannot destroy an older save before an intentional restore. Native simulator flight persistence remains available. A successful save retains enough decimal precision for double round trips.

## Diagnostics

The existing SDK local-variable developer interface is the control surface. No restricted model assets are modified and no new real-aircraft ECAM checklist is claimed.

| LVar (prefix `L:` when used from JavaScript) | Meaning |
| --- | --- |
| `A339X_TRIM_EXPERIMENTAL_ENABLE` | 0 disabled, 1 enabled; resets to 0 on reload |
| `A339X_TRIM_COMMAND` | 0 off, 1 aft, 2 forward |
| `A339X_TRIM_TARGET_GALLONS` | Desired trim quantity, 0..1646 |
| `A339X_TRIM_RATE_GPS` | Developer-supplied US gal/s; defaults to 0, no claimed aircraft rate |
| `A339X_TRIM_PUMP_FAILED`, `A339X_TRIM_VALVE_STUCK` | Effective fault injection, 0/1 |
| `A339X_TRIM_STATE`, `A339X_TRIM_FLOW_GPS` | Mode and signed actual requested native transfer rate, positive aft |
| `A339X_TRIM_PUMP_COMMAND`, `A339X_TRIM_PUMP_ACTIVE` | Command versus available pumping |
| `A339X_TRIM_VALVE_COMMAND`, `A339X_TRIM_VALVE_POSITION` | Command versus actual modeled opening |
| `A339X_TRIM_PREDICTED_CG_DELTA` | Trim-only predicted percent-MAC change for this step |
| `A339X_FUEL_RESTORE_REQUEST`, `A339X_FUEL_SAVE_REQUEST` | One-shot explicit ground state operations |
| `A339X_FUEL_STATE_STATUS` | Last state/validation result: 0 initialized, 1 restore accepted, 2 saved, -1 inhibited, -2 invalid/I/O save, -3 invalid inputs, -4 native write failed |
| `A339X_FUEL_TELEMETRY_ENABLE` | Opt-in `A339X_FUEL_DIAG` console capture |

Telemetry emits at most one row per simulated second and stops after 300 rows; toggle off/on for a new capture. It records timestamp/timestep/window, all tank quantities, total, engine consumption, estimated APU use, native net change, refueling, modeled losses (zero), command/target/rate, power, pump/valve actual state, transfer, native CG, predicted trim CG delta and faults. A bounded 16-entry transition buffer includes transition times/modes and a count so dropped old transitions are apparent. No per-frame file writes or unbounded history are added.
