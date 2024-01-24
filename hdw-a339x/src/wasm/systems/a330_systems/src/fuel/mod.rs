// Note: Fuel system for now is still handled in MSFS. This is used for calculating fuel-related factors.

use nalgebra::Vector3;
use systems::{
    fuel::{FuelCG, FuelInfo, FuelPayload, FuelSystem, FuelTank},
    simulation::{InitContext, SimulationElement, SimulationElementVisitor},
};
use uom::si::f64::*;

#[cfg(test)]
mod test;

pub trait FuelLevel {
    fn left_inner_tank_has_fuel(&self) -> bool;
    fn right_inner_tank_has_fuel(&self) -> bool;
    fn left_outer_tank_has_fuel(&self) -> bool;
    fn right_outer_tank_has_fuel(&self) -> bool;
    fn center_tank_has_fuel(&self) -> bool;
}

pub enum A330FuelTankType {
    Center,
    LeftInner,
    LeftOuter,
    RightInner,
    RightOuter,
}

impl From<A330FuelTankType> for usize {
    fn from(value: A330FuelTankType) -> Self {
        value as usize
    }
}
impl From<usize> for A330FuelTankType {
    fn from(value: usize) -> Self {
        match value {
            0 => A330FuelTankType::Center,
            1 => A330FuelTankType::LeftInner,
            2 => A330FuelTankType::LeftOuter,
            3 => A330FuelTankType::RightInner,
            4 => A330FuelTankType::RightOuter,
            i => panic!("Cannot convert from {} to A330FuelTankType.", i),
        }
    }
}

pub struct A330Fuel {
    fuel_system: FuelSystem<5>,
}
impl A330Fuel {
    pub const A330_FUEL: [FuelInfo<'_>; 5] = [
        FuelInfo {
            fuel_tank_id: "FUEL TANK CENTER QUANTITY",
            position: (-20.3, 0., 4.),
        },
        FuelInfo {
            fuel_tank_id: "FUEL TANK LEFT MAIN QUANTITY",
            position: (-25.5, -33.8, 1.3),
        },
        FuelInfo {
            fuel_tank_id: "FUEL TANK LEFT AUX QUANTITY",
            position: (-41.0, -70.0, 6.1),
        },
        FuelInfo {
            fuel_tank_id: "FUEL TANK RIGHT MAIN QUANTITY",
            position: (-25.5, 33.8, 1.3),
        },
        FuelInfo {
            fuel_tank_id: "FUEL TANK RIGHT AUX QUANTITY",
            position: (-41.0, 70.0, 6.1),
        },
    ];

    pub fn new(context: &mut InitContext) -> Self {
        let fuel_tanks = Self::A330_FUEL.map(|f| {
            FuelTank::new(
                context,
                f.fuel_tank_id,
                Vector3::new(f.position.0, f.position.1, f.position.2),
            )
        });
        A330Fuel {
            fuel_system: FuelSystem::new(context, fuel_tanks),
        }
    }

    pub fn left_inner_tank_has_fuel_remaining(&self) -> bool {
        self.fuel_system
            .tank_has_fuel(A330FuelTankType::LeftInner.into())
    }

    fn center_tank_has_fuel(&self) -> bool {
        self.fuel_system
            .tank_has_fuel(A330FuelTankType::Center.into())
    }

    fn left_inner_tank_has_fuel(&self) -> bool {
        self.fuel_system
            .tank_has_fuel(A330FuelTankType::LeftInner.into())
    }

    fn left_outer_tank_has_fuel(&self) -> bool {
        self.fuel_system
            .tank_has_fuel(A330FuelTankType::LeftOuter.into())
    }

    fn right_inner_tank_has_fuel(&self) -> bool {
        self.fuel_system
            .tank_has_fuel(A330FuelTankType::RightInner.into())
    }

    fn right_outer_tank_has_fuel(&self) -> bool {
        self.fuel_system
            .tank_has_fuel(A330FuelTankType::RightOuter.into())
    }

    fn fore_aft_center_of_gravity(&self) -> f64 {
        self.center_of_gravity().x
    }

    fn total_load(&self) -> Mass {
        self.fuel_system.total_load()
    }

    fn center_of_gravity(&self) -> Vector3<f64> {
        self.fuel_system.center_of_gravity()
    }
}
impl FuelLevel for A330Fuel {
    fn left_inner_tank_has_fuel(&self) -> bool {
        self.left_inner_tank_has_fuel()
    }
    fn right_inner_tank_has_fuel(&self) -> bool {
        self.right_inner_tank_has_fuel()
    }
    fn left_outer_tank_has_fuel(&self) -> bool {
        self.left_outer_tank_has_fuel()
    }
    fn right_outer_tank_has_fuel(&self) -> bool {
        self.right_outer_tank_has_fuel()
    }
    fn center_tank_has_fuel(&self) -> bool {
        self.center_tank_has_fuel()
    }
}
impl FuelPayload for A330Fuel {
    fn total_load(&self) -> Mass {
        self.total_load()
    }
    fn fore_aft_center_of_gravity(&self) -> f64 {
        self.fore_aft_center_of_gravity()
    }
}
impl FuelCG for A330Fuel {
    fn center_of_gravity(&self) -> Vector3<f64> {
        self.center_of_gravity()
    }
}
impl SimulationElement for A330Fuel {
    fn accept<T: SimulationElementVisitor>(&mut self, visitor: &mut T) {
        self.fuel_system.accept(visitor);
        visitor.visit(self);
    }
}
