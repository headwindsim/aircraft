// Copyright (c) 2023-2024 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

/**
 * Determine the aircraft type using the Aircraft Title SimVar.
 * @returns {string} - the aircraft type (a32nx, a380x, other)
 */
export function getAircraftType(): string {
    const aircraftName :string = SimVar.GetSimVarValue('TITLE', 'string');
    let aircraft: string;
    if (aircraftName.includes('A330-900neo')) {
        aircraft = 'a339x';
    } else if (aircraftName.includes('A330-300ceo')) {
        aircraft = 'a333x';
    } else if (aircraftName.includes('Sukhoi')) {
        aircraft = 'su95x';
    } else {
        aircraft = 'a32nx';
    }
    return aircraft;
}
