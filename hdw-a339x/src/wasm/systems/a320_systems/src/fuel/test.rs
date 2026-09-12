use super::*;
use std::time::Duration;
use systems::simulation::{
    test::{ReadByName, SimulationTestBed, TestBed, WriteByName},
    Aircraft,
};
use uom::si::mass::kilogram;

struct FuelTestAircraft {
    fuel: A320Fuel,
}

impl Aircraft for FuelTestAircraft {}
impl SimulationElement for FuelTestAircraft {
    fn accept<T: SimulationElementVisitor>(&mut self, visitor: &mut T) {
        self.fuel.accept(visitor);
        visitor.visit(self);
    }
}

fn bed() -> SimulationTestBed<FuelTestAircraft> {
    SimulationTestBed::new(|context| FuelTestAircraft {
        fuel: A320Fuel::new(context),
    })
}

fn near(actual: f64, expected: f64) {
    assert!((actual - expected).abs() < 1e-8, "{actual} != {expected}");
}

#[test]
fn init() {
    let mut bed = bed();
    for index in 1..=6 {
        bed.write_by_name(&format!("FUELSYSTEM TANK QUANTITY:{index}"), 0.);
        assert!(bed.contains_variable_with_name(&format!("FUELSYSTEM TANK QUANTITY:{index}")));
    }
    bed.write_by_name("FUEL WEIGHT PER GALLON", 3.);
    assert!(bed.contains_variable_with_name("FUEL WEIGHT PER GALLON"));
}

// Preserve the inherited low/high loads and five-minute duration, with A339X
// arms and modern tank indices instead of the inherited A320 CG expectations.
fn stabilized_wing_cg(inner_kg: f64, outer_kg: f64) -> f64 {
    let mut bed = bed();
    let density = systems::fuel::FUEL_GALLONS_TO_KG;
    bed.write_by_name("FUEL WEIGHT PER GALLON", density);
    for index in [2, 3] {
        bed.write_by_name(
            &format!("FUELSYSTEM TANK QUANTITY:{index}"),
            inner_kg / density,
        );
    }
    for index in [4, 5] {
        bed.write_by_name(
            &format!("FUELSYSTEM TANK QUANTITY:{index}"),
            outer_kg / density,
        );
    }
    bed.write_by_name("FUELSYSTEM TANK QUANTITY:1", 0.);
    bed.write_by_name("FUELSYSTEM TANK QUANTITY:6", 0.);
    bed.run();
    bed.run_multiple_frames(Duration::from_secs(300));
    bed.query(|aircraft| aircraft.fuel.fore_aft_center_of_gravity())
}

#[test]
fn low_fuel() {
    near(
        (stabilized_wing_cg(405., 219.) * 100.).round() / 100.,
        -30.94,
    );
}

#[test]
fn high_fuel() {
    near(
        (stabilized_wing_cg(1600., 200.) * 100.).round() / 100.,
        -27.22,
    );
}

#[test]
fn six_native_tanks_preserve_capacity_and_index_mapping() {
    let mut bed = bed();
    for index in 1..=6 {
        bed.write_by_name(
            &format!("FUELSYSTEM TANK QUANTITY:{index}"),
            index as f64 * 10.,
        );
    }
    bed.write_by_name("FUEL WEIGHT PER GALLON", 3.);
    bed.run();
    near(bed.read_by_name("TOTAL_FUEL_VOLUME"), 210.);
    near(bed.read_by_name("TOTAL_FUEL_QUANTITY"), 630.);
    near(
        A320Fuel::A320_FUEL
            .iter()
            .map(|t| t.total_capacity_gallons)
            .sum(),
        36743.,
    );
    near(
        bed.query(|a| {
            a.fuel
                .fuel_system
                .tank_mass(A320FuelTankType::LeftOuter.into())
                .get::<kilogram>()
        }),
        120.,
    );
    near(
        bed.query(|a| {
            a.fuel
                .fuel_system
                .tank_mass(A320FuelTankType::RightInner.into())
                .get::<kilogram>()
        }),
        90.,
    );
    near(
        bed.query(|a| {
            a.fuel
                .fuel_system
                .tank_mass(A320FuelTankType::Trim.into())
                .get::<kilogram>()
        }),
        180.,
    );
}

#[test]
fn center_to_trim_changes_moment_without_changing_total_fuel() {
    let mut bed = bed();
    bed.write_by_name("FUEL WEIGHT PER GALLON", 3.);
    bed.write_by_name("FUELSYSTEM TANK QUANTITY:1", 100.);
    bed.run();
    near(bed.query(|a| a.fuel.fore_aft_center_of_gravity()), -20.3);
    bed.write_by_name("FUELSYSTEM TANK QUANTITY:1", 0.);
    bed.write_by_name("FUELSYSTEM TANK QUANTITY:6", 100.);
    bed.run();
    near(bed.query(|a| a.fuel.fore_aft_center_of_gravity()), -107.);
    near(bed.read_by_name("TOTAL_FUEL_QUANTITY"), 300.);
    near(bed.read_by_name("TOTAL_FUEL_VOLUME"), 100.);
    near(bed.read_by_name("FUELSYSTEM TANK QUANTITY:6"), 100.); // Read-only native ownership.
}

#[test]
fn native_density_changes_mass_but_not_volume_or_cg() {
    let mut bed = bed();
    bed.write_by_name("FUELSYSTEM TANK QUANTITY:6", 100.);
    bed.write_by_name("FUEL WEIGHT PER GALLON", 2.8);
    bed.run();
    near(bed.read_by_name("TOTAL_FUEL_QUANTITY"), 280.);
    bed.write_by_name("FUEL WEIGHT PER GALLON", 3.2);
    bed.run();
    near(bed.read_by_name("TOTAL_FUEL_QUANTITY"), 320.);
    near(bed.read_by_name("TOTAL_FUEL_VOLUME"), 100.);
    near(bed.query(|a| a.fuel.fore_aft_center_of_gravity()), -107.);
    bed.write_by_name("FUEL WEIGHT PER GALLON", f64::NAN);
    bed.run();
    near(bed.read_by_name("TOTAL_FUEL_QUANTITY"), 320.); // Retain last valid density.
}

#[test]
fn missing_startup_density_uses_inherited_fallback() {
    let mut bed = bed();
    bed.write_by_name("FUELSYSTEM TANK QUANTITY:6", 100.);
    bed.run();
    near(
        bed.read_by_name("TOTAL_FUEL_QUANTITY"),
        100. * systems::fuel::FUEL_GALLONS_TO_KG,
    );
    near(bed.read_by_name("TOTAL_FUEL_VOLUME"), 100.);
}
