# Build, validation and simulator checks

Run these commands from the repository root in PowerShell 7.2 or later. The build uses the pinned development image, lockfile and submodule revisions.

```powershell
git submodule update --init --recursive
./scripts/fuel-trim/Build-A339X.ps1
./scripts/fuel-trim/Build-A339X.ps1 -SkipSetup
./scripts/fuel-trim/Test-A339XFuel.ps1
./scripts/fuel-trim/Test-Deployment.ps1
```

`Build-A339X.ps1` copies the aircraft overrides, runs the regression checks, builds the instruments and WASM modules, and validates the package inventory. `-SkipSetup` reuses installed dependencies. `Test-A339XFuel.ps1` requires generated Rust sources that match the overrides.

Use `-Baseline` only from the upstream source revision selected by `-BaselineRef` (default `upstream/main`). A feature checkout is not a baseline. Build records under `.fuel-trim-local` contain the source revision, dirty-state check, submodule revisions, image digest, command results and package hashes.

The copy step replaces generated directories. The wrapper then cleans the affected Cargo packages to prevent binaries from being reused after timestamp-preserving source copies. Build and deployment are separate commands.

## Automated coverage

| Area | Checks |
| --- | --- |
| Fuel model | Tank bounds, conservation, crossfeed, pump/valve failures, power loss, refuel inhibition, target holding and recovery |
| Timing | Equal simulated duration at 60 Hz, 20 Hz, 1 Hz and 8-second steps; pause and zero-time updates |
| Long runs | 50,000 fixed-seed updates with an independent mass ledger, external fuel changes and injected faults |
| Persistence | Missing, partial, malformed and over-capacity saves; five-tank compatibility; fractional round trips; failed-write preservation |
| Refueling | REAL, FAST and INSTANT modes; fill and defuel; asymmetric loads; shared flow budgets; batch ordering; cancellation when a request becomes ineligible |
| Rust fuel accounting | Six-tank mass, density, moment and inherited low/high-load cases |
| STEP ALTS | Explicit SimBrief step parsing, matching against final route legs, edit validation, same-fix edits, removal and FCU synchronization |
| Takeoff reports | Flight/runway matching, missing or invalid results, weight limits, units, literal report text, timeout, retry and stale-response handling |
| Speed checks | Interpolated stall speeds, control-speed endpoints, unrounded minimum margins and unavailable-data warnings |
| VNAV | Invalid and stalled predictions, partial-profile rejection, step transitions, acceleration clipping, descent joins, reset/recovery and signed wind |
| Compatibility | 22 legacy fuel-prediction results checked against the installed mathjs API, including signed zero |
| Deployment | Package identity, dependencies, hashes, path checks, backup preservation, partial-copy recovery, rollback and tampering rejection |

The VNAV tests include 120 weight/altitude/temperature/Mach combinations. These test numerical integrity, not aircraft performance calibration. Module tests use simulator stubs; they do not reproduce a complete flight.

Fuel-model tolerances are `1e-7 kg` per step, `1e-6 kg*ft` for moment, `1e-5 kg` for cumulative mass and `1e-5 US gal` for equal-duration distributions. Rust density and moment checks use `1e-8` absolute tolerance.

## Results and known failures

The full aircraft build and package validation pass. The package inventory contains 855 aircraft files and three companion files. MCDU typechecking passes with no diagnostics. The shared EFB typecheck retains three existing A320/SU95 component errors, down from seven. Four legacy files retain their existing formatting or unused-variable lint diagnostics.

The broader Rust library comparison recorded 448 passing, 17 failing and nine ignored tests at baseline, versus 454 passing, 15 failing and nine ignored after the fuel changes. No new failing case names were introduced. Two inherited fuel tests used A320 CG positions; their load scenarios were retained with the A339 tank positions. Remaining failures concern air conditioning, payload assumptions and flap tests. Full logs remain in `.fuel-trim-local/logs`.

Simulator observations confirm aircraft loading, powered cockpit displays and a refueling indication. The flight and failure scenarios below still need to be run on the current build.

## Install and restore

Create `.fuel-trim-local/deployment.json` with the verified `userCfgPath`, `communityPath` and `backupRoot`. Steam installations also need `steamAppManifestPath` when their core packages reside outside the configured package root. Keep backups outside simulator-scanned folders.

Use the artifact path printed by a successful modified build:

```powershell
./scripts/fuel-trim/Deploy-A339X.ps1 -ArtifactPath '<artifact path>' -WhatIf
./scripts/fuel-trim/Deploy-A339X.ps1 -ArtifactPath '<artifact path>'

./scripts/fuel-trim/Restore-A339X.ps1 -RecordPath '<deployment-record.json path>' -WhatIf
./scripts/fuel-trim/Restore-A339X.ps1 -RecordPath '<deployment-record.json path>'
```

Deployment requires MSFS to be closed. It verifies package identity, layouts, assets and hashes before staging a replacement and backup. Recovery uses the recorded inventories to distinguish a partial installation from unrelated or modified files. `initial-deployment-record.txt` preserves the first rollback reference.

The bundled lock-highlight dependency is set to the aircraft version produced by the same build. External Microsoft dependency declarations are retained. A version mismatch produces a warning after local dependency presence is verified; cross-generation version numbers alone are not treated as a compatibility test. See [SDK references](references-and-assumptions.md#sdk-semantics).

## Simulator test plan

Record the build ID, conditions, native tank readback and screenshots for each case. These are development tests, not an aircraft operating checklist.

1. Load cold-and-dark, running, airborne and saved-flight states. Compare all six native tanks with the SD, tablet, total fuel and gross weight. Initialization must preserve the supplied quantities.
2. Fill and defuel through the tablet in each mode, including zero, partial, full and asymmetric loads. Start engines or leave the ground during an active request; refueling must stop and engine consumption must continue. Check independent changes through the simulator fuel UI.
3. With experimental trim disabled, compare engine fuel-used counters and native fuel loss. Run the APU separately and check that its consumption is counted once.
4. Isolate the experimental center/trim path from native center transfer. Supply pump and valve power, set a target 100 US gal above the current trim quantity, rate 1 US gal/s, aft command and enable. Aft transfer requires airborne state in this model. Compare tank changes, total mass, moment diagnostics and native `CG PERCENT` read in Percent units.
5. Inject pump failure, loss of pump power and stuck-open/stuck-closed valves. Verify actual flow and indications. Then command forward transfer and check donor-empty, receiver-full and target limits. Disable the controller after the test.
6. Compare equal simulated durations at normal and accelerated rates. Pause and resume. Verify telemetry stops after 300 rows and restarts only after capture is toggled.
7. With engines stopped and refueling inactive, save, change and restore fuel. Check six-tank readback, a valid five-tank save and rejection of an over-capacity legacy center tank. Failed saves must preserve the previous file.
8. Import an OFP with Detailed Navlog and Plan Stepclimbs enabled. Compare STEP ALTS with the OFP, edit an altitude, move a step to the same fix and clear one. At a planned step, use the FCU to select and initiate the climb; check modes and predictions.
9. Generate an A339 OFP with Runway Analysis enabled, import the matching flight, then select **Performance > Takeoff > Import latest report**. Compare each runway result with the source report. Change the flight context and check invalidation.
10. Check KSEA 16L with the supplied regression case: 230.2 t, CONF 1, V1/VR/V2 148/155/161 kt. Match weather, thrust and configuration to the OFP. Verify too-low speeds and unavailable inputs produce the appropriate data checks.
11. Exercise valid climb, cruise, step and descent profiles, then missing or infeasible inputs. Verify partial predictions and stale guidance are cleared, constraints remain in the plan, and corrected inputs allow a new computation.

The trim arm, actuator assumptions, performance tables and automatic CG behavior still need aircraft-specific validation. The tablet imports generated results; it does not provide a native takeoff calculation engine or insert values into the MCDU. [Operational evidence and limits](operational-evidence.md) lists the supporting references.

## Docker startup

`Start-A339XBuildEnvironment.ps1` handles the [Docker Desktop stale-socket failure](https://github.com/docker/desktop-feedback/issues/460) seen on Windows. It returns immediately for a healthy engine. If Desktop is fully stopped, it preserves the two checked runtime directories before starting Docker. If Desktop processes remain after a failed start, quit Desktop first.

```powershell
./scripts/fuel-trim/Start-A339XBuildEnvironment.ps1 -WhatIf
./scripts/fuel-trim/Start-A339XBuildEnvironment.ps1
```

Builds call this helper automatically. It does not change Docker settings or remove images. The ordinary Desktop launcher can still encounter the upstream failure.
