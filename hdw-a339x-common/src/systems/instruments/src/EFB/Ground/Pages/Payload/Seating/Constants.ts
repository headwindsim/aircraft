// Copyright (c) 2023-2024 FlyByWire Simulations
// SPDX-License-Identifier: GPL-3.0

export enum SeatType {
    NarrowbodyEconomy = 0,
    NarrowbodyEconomyEmergency = 1,
    WidebodyEconomy = 2,
    WidebodyEconomyEmergency = 3,
    WidebodyBusinessFlatRight = 4,
    WidebodyBusinessFlatLeft = 5,
    WidebodySuiteRight = 6,
    WidebodySuiteLeft = 7,
    WidebodyPremiumEconomy = 8
}

export const CanvasConst = Object.freeze({
    width: 1000,
    height: 150,
});
export interface SeatInfo {
    type: number,
    x?: number,
    y?: number,
    yOffset?: number
}

export interface RowInfo {
    x?: number,
    y?: number,
    xOffset?: number,
    yOffset?: number,
    seats: SeatInfo[],
}

export interface PaxStationInfo {
    name: string,
    capacity: number,
    rows: RowInfo[],
    simVar: string,
    stationIndex: number,
    position: number,
    deck: number
}

export interface CargoStationInfo {
    name: string,
    weight: number,
    simVar: string,
    stationIndex: number,
    progressBarWidth: number,
    position: number,
}

export const SeatConstants = Object.freeze({
    [SeatType.NarrowbodyEconomy]: {
        len: 15,
        wid: 15,
        padX: 1,
        padY: 0,
        imageX: 12,
        imageY: 12,
    },
    [SeatType.NarrowbodyEconomyEmergency]: {
        len: 19.2,
        wid: 19.2,
        padX: 20,
        padY: 0,
        imageX: 25.4,
        imageY: 19.2,
    },
    [SeatType.WidebodyBusinessFlatRight]: {
        len: 20,
        wid: 17,
        padX: 10,
        padY: 0,
        imageX: 25,
        imageY: 25,
    },
    [SeatType.WidebodySuiteRight]: {
        len: 20,
        wid: 18,
        padX: 5,
        padY: 0,
        imageX: 20,
        imageY: 16,
    },
    [SeatType.WidebodyPremiumEconomy]: {
        len: 18,
        wid: 13.64,
        padX: 2,
        padY: 0,
        imageX: 18,
        imageY: 13.64,
    },
});

export const Status = Object.freeze({
    Planned: 0,
    Loaded: 1,
});
