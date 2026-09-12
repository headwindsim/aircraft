# A339X fuel trim references and assumptions

Checked September 11, 2026. This document distinguishes published aircraft data from inherited simulation values and experimental mechanics. The implementation is not a validated A330-900neo fuel control schedule.

## Published aircraft data

[EASA Type Certificate Data Sheet A.004, Issue 69, December 19, 2025](https://www.easa.europa.eu/en/downloads/7518/en), A330-941 section, page 91, gives the following capacities. Masses in that table use a stated density of 0.8 kg/L.

| Tank group | Usable volume, L | Usable mass at 0.8 kg/L, kg | Separate unusable volume, L |
| --- | ---: | ---: | ---: |
| Wing aggregate | 91,300 | 73,040 | 190 |
| Center | 41,560 | 33,248 | 83 |
| Trim | 6,230 | 4,984 | 6 |
| Total | 139,090 | 111,272 | 279 |

The Issue 69 values were checked against the indexed table. [Issue 56, April 6, 2020](https://www.easa.europa.eu/sites/default/files/dfu/A330%20EASA%20TCDS%20A.004%20-%20Issue%2056.pdf), A330-941 section, page 89, independently contains the same capacities. The wing aggregate does not establish the individual inner and outer tank split or their moment arms.

[Airbus A330 Facts and Figures, February 2026](https://mediaassets.airbus.com/pm_38_788_788340-gyrr8y4m44.pdf) also lists 139,090 L for the A330-900. Capacity publications do not establish pump delivery rates, valve timing, transfer priorities, or automatic CG targets.

## Existing PR 76

[Headwind aircraft PR 76](https://github.com/headwindsim/aircraft/pull/76), "add initial implementation of trim tank logic," by [masterrob94](https://github.com/masterrob94), was an unmerged draft when checked at `b68a49fb186ce31e540614ae2b5bbed1989dd432`. Its testing instructions were incomplete.

The [actual diff](https://github.com/headwindsim/aircraft/pull/76/files) provides useful precedents for native tank index 6, a trim quantity persistence field, and previous-quantity tracking. It does not implement an automatic CG schedule. It also has material gaps:

- It adds a 1,646 US gal trim tank without reducing the 12,625 US gal center capacity, increasing the aircraft's total fuel capacity.
- It adds a `FuelTrim` enum and local-variable accessors without completing the native SimConnect trim data definition and write path.
- Its forward pump is not an endpoint of any added fuel line. The proposed trim junction has no complete forward route delivering trim fuel to an inner or center tank.
- It introduces pump/valve indices without the corresponding electrical configuration changes.
- Its trim tank priority of 4 would fill trim first in the native fuel window, because higher native priority fills first.
- Its trim persistence fallback of 1,617 US gal differs from the new default of 823 US gal.

The new implementation therefore does not treat that draft as a tested reference implementation.

## Inherited simulation constants

The native tank order is center, left inner, right inner, left outer, right outer, trim.

| Tank | Usable simulation capacity, US gal | Longitudinal position, ft | Basis |
| --- | ---: | ---: | --- |
| Center | 10,979 | -20.3 | Existing center capacity minus the new trim allocation; inherited position |
| Left inner | 11,095 | -25.5 | Existing aircraft configuration |
| Right inner | 11,095 | -25.5 | Existing aircraft configuration |
| Left outer | 964 | -41 | Existing aircraft configuration |
| Right outer | 964 | -41 | Existing aircraft configuration |
| Trim | 1,646 | -107 | Rounded trim capacity and experimental position from PR 76 |
| Total | 36,743 | | Existing total retained |

The split is exactly `10,979 + 1,646 = 12,625` US gal. It preserves the existing rounded total of 36,743 US gal and the inherited wing split. It is not an exact conversion of every EASA liter capacity. Existing `UnusableCapacity:0` conventions are retained; this change does not separately simulate the EASA unusable quantities.

The complete trim position `-107, 0, 23.5` feet comes from PR 76 and is unvalidated. It must be checked against the aircraft's datum, geometry, and native weight debug display before treating measured CG movement as representative of the real aircraft. The C++ kernel uses its longitudinal component for moment diagnostics.

The aircraft-specific Rust fuel reader now uses native `FUEL WEIGHT PER GALLON` in kilograms for each tank's mass and sums tank volumes directly. Before a valid density is available, it retains the inherited startup fallback of approximately 3.039075693483925 kg/US gal. After a valid reading, unavailable or invalid density readings retain the last valid value. The C++ kernel receives native density through its adapter. The published 0.8 kg/L mass table is a reference density, not a mandate to overwrite the simulator's fuel density.

## SDK semantics

- [MSFS 2024 dependency definition](https://docs.flightsimulator.com/msfs2024/retail/sdk-tools/package-tool/package-tool-xml-properties/#dependency): the XML dependency version is prescribed as `0.1.0`. No authoritative evidence was found defining the resulting JSON dependency version as a runtime minimum or making 2020 and 2024 core-package version sequences comparable. Deployment checks local presence, preserves declarations and warns about version differences; only a real simulator load can establish compatibility.
- [Native fuel-system configuration](https://docs.flightsimulator.com/html/Content_Configuration/SimObjects/Aircraft_SimO/flight_model/fuel_system.htm): `Tank.N` capacity is gallons; position is datum-relative feet ordered longitudinal Z, lateral X, vertical Y. Larger priorities fill first and are consumed last when skipping time. Native pump and valve electrical indices refer to the matching circuit type index, not the circuit's overall ordinal.
- [Fuel SimVars](https://docs.flightsimulator.com/html/Programming_Tools/SimVars/Aircraft_SimVars/Aircraft_Fuel_Variables.htm): with fuel-system version 4, `FUELSYSTEM TANK QUANTITY:N` uses the actual `Tank.N` index and returns usable fuel in gallons. `FUELSYSTEM TANK TOTAL QUANTITY:N` includes unusable fuel.
- [Weight and balance](https://docs.flightsimulator.com/html/mergedProjects/How_To_Make_An_Aircraft/Contents/Files/Flight_Model/Weight_And_Balance.htm): native tank mass and position affect aircraft weight and CG.
- [Flight-model SimVars](https://docs.flightsimulator.com/html/Programming_Tools/SimVars/Aircraft_SimVars/Aircraft_FlightModel_Variables.htm): `CG PERCENT` describes longitudinal CG relative to reference chord, with default units `Percent Over 100`. Callers must explicitly respect the requested unit conversion.
- [Microsoft SU9 release notes](https://www.flightsimulator.com/release-notes-1-25-7-0-sim-update-ix-now-available/): fuel-system tank level SimVars became settable. Native write/readback and CG behavior still require verification in the target simulator.

## Engineering approximations in the test controller

The custom controller is opt-in and disabled by default. The developer supplies the trim rate in US gal/s; its default is zero. There is no claimed aircraft-performance rate and no automatic CG target schedule. Direction and target trim volume are explicit test inputs. The target bounds transfer, rather than an invented Airbus CG threshold or altitude schedule.

The modeled trim path connects center and trim directly. This is a conservative software test path, not a claim about the real aircraft's complete piping, pump, collector-cell, or transfer sequence. Existing native center/outer transfers and native APU consumption remain separate owners. The kernel does not subtract APU fuel a second time.

Trim transfer requires a command, an eligible target, pump power, a healthy pump, and actual valve opening. Transfer conserves center-plus-trim volume and is bounded by elapsed simulation time, supplied rate, target, donor content, and receiver capacity. Refueling inhibits trim transfer. Aft transfer on the ground is inhibited as an experimental test policy; this is not asserted as the real aircraft's operating logic.

Valve command and actual position are distinct. A powered, healthy valve moves instantly to its command during a positive-time step. An unpowered or stuck valve retains its previous actual position. These are explicit approximations pending actuator timing and failure-position evidence. Pump failure or lost pump power prevents modeled trim flow. There is no passive trim path in this model. A stuck-open or unpowered-open valve can still pass commanded flow if the pump remains powered and healthy. A fault or inhibited mode label therefore does not itself prove that actual flow is zero; inspect the actual pump, valve, transfer, and tank diagnostics.

Closed crossfeed retains inherited local gravity/suction consumption semantics; the adapter is responsible for suppressing engine requests when the engine is off or its fuel valve is closed. Open crossfeed is an ideal shared manifold: powered feed tanks serve both engine demands proportionally, including a shortage. It does not model hydraulic resistance, tank pressure, unequal line lengths, or real engine starvation transients.

Invalid input rejects the whole step without independently clamping tank quantities or overwriting the incoming state. Initialization, saved fuel loading, and external refueling must provide a complete valid native snapshot. The kernel's bounded last-step diagnostics report actual served engine consumption and actual trim transfer, not requested quantities.

## Unknowns and required validation

No authoritative A330-900neo operating schedule was established for CG targets, transfer thresholds, hysteresis, altitude gates, descent preparation, minimum reserves, transfer rates, valve travel/failure positions, or detailed electrical dependencies. A330ceo documents do not automatically establish neo applicability. These values must remain explicitly unknown or experimental until neo-specific evidence is available.

Deterministic C++ checks exercise finite input handling, boundaries, conservation, moment direction, power/failure recovery, refuel inhibition, zero-time steps, and 50,000 variable-time updates. They validate the implemented arithmetic and policies. They do not certify the real aircraft model or prove simulator readback, native CG changes, cockpit controls, engine starvation, persistence, or full-flight behavior.
