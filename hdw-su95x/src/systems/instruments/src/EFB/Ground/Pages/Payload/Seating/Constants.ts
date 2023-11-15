export enum SeatType {
    NarrowbodyEconomy = 0,
    NarrowbodyEconomyEmergency = 1,
    WidebodyEconomy = 2,
    WidebodyEconomyEmergency = 3,
    WidebodyBusinessFlatRight = 4,
    WidebodyBusinessFlatLeft = 5,
    WidebodySuiteRight = 6,
    WidebodySuiteLeft = 7,
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
    fill: number,
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
        len: 28.0,
        wid: 23.1,
        padX: 16,
        padY: 0,
        imageX: 39.0,
        imageY: 23.0,
    },
    [SeatType.NarrowbodyEconomyEmergency]: {
        len: 28.0,
        wid: 23.1,
        padX: 24,
        padY: 0,
        imageX: 39.0,
        imageY: 23.0,
    },
    [SeatType.WidebodyEconomy]: {
        len: 11.52,
        wid: 11.52,
        padX: 7.8,
        padY: 0,
        imageX: 15.24,
        imageY: 11.52,
    },
    [SeatType.WidebodyEconomyEmergency]: {
        len: 11.52,
        wid: 11.52,
        padX: 12,
        padY: 0,
        imageX: 15.24,
        imageY: 11.52,
    },
});

export const Status = Object.freeze({
    Planned: 0,
    Loaded: 1,
});
