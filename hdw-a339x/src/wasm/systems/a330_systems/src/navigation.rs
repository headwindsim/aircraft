use systems::navigation::ala52b::{
    Ala52BAircraftInstallationDelay, Ala52BRadioAltimeter, Ala52BTransceiverPair,
};
use systems::navigation::radio_altimeter::AntennaInstallation;
use systems::shared::ElectricalBusType;
use systems::simulation::{
    InitContext, SimulationElement, SimulationElementVisitor, UpdateContext,
};
use uom::si::f64::Length;
use uom::si::length::{foot, meter};

pub struct A330RadioAltimeters {
    radio_altimeter_1: A330RadioAltimeter,
    radio_altimeter_2: A330RadioAltimeter,
}

impl A330RadioAltimeters {
    pub fn new(context: &mut InitContext) -> Self {
        Self {
            radio_altimeter_1: A330RadioAltimeter::new(
                context,
                1,
                ElectricalBusType::AlternatingCurrent(1),
                AntennaInstallation::new(
                    // Sim alt over ground minus RA height over ground
                    Length::new::<foot>(18.976) - Length::new::<meter>(2.39),
                    // Aft distance from Sim CG
                    Length::new::<meter>(11.89),
                    // Electric length of the antennas and cable modeling some material variation
                    Length::new::<foot>(22.4),
                ),
                AntennaInstallation::new(
                    Length::new::<foot>(18.976) - Length::new::<meter>(2.39),
                    Length::new::<meter>(11.19),
                    Length::new::<foot>(22.4),
                ),
            ),
            radio_altimeter_2: A330RadioAltimeter::new(
                context,
                2,
                ElectricalBusType::AlternatingCurrent(2),
                AntennaInstallation::new(
                    Length::new::<foot>(18.976) - Length::new::<meter>(2.49),
                    Length::new::<meter>(13.27),
                    Length::new::<foot>(23.4),
                ),
                AntennaInstallation::new(
                    Length::new::<foot>(18.976) - Length::new::<meter>(2.49),
                    Length::new::<meter>(13.96),
                    Length::new::<foot>(23.4),
                ),
            ),
        }
    }

    pub fn update(&mut self, context: &UpdateContext) {
        self.radio_altimeter_1.update(context);
        self.radio_altimeter_2.update(context);
    }
}

impl SimulationElement for A330RadioAltimeters {
    fn accept<T: SimulationElementVisitor>(&mut self, visitor: &mut T) {
        self.radio_altimeter_1.accept(visitor);
        self.radio_altimeter_2.accept(visitor);

        visitor.visit(self);
    }
}

pub struct A330RadioAltimeter {
    radio_altimeter: Ala52BRadioAltimeter,
    transceivers: Ala52BTransceiverPair,
}

impl A330RadioAltimeter {
    fn new(
        context: &mut InitContext,
        number: usize,
        powered_by: ElectricalBusType,
        transmitter: AntennaInstallation,
        receiver: AntennaInstallation,
    ) -> Self {
        Self {
            radio_altimeter: Ala52BRadioAltimeter::new(
                context,
                number,
                Ala52BAircraftInstallationDelay::FiftySevenFeet,
                powered_by,
            ),
            transceivers: Ala52BTransceiverPair::new(context, transmitter, receiver),
        }
    }

    fn update(&mut self, context: &UpdateContext) {
        self.radio_altimeter.update(context, &self.transceivers);
    }
}

impl SimulationElement for A330RadioAltimeter {
    fn accept<T: SimulationElementVisitor>(&mut self, visitor: &mut T) {
        self.transceivers.accept(visitor);
        self.radio_altimeter.accept(visitor);

        visitor.visit(self);
    }
}
