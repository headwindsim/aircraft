export const TYPE = Object.freeze({ ECO: 0, ECO_EMERG: 1, BUSINESS: 2, PREMECO: 3 });

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
    [TYPE.ECO]: {
        len: 15,
        wid: 15,
        padX: 1,
        padY: 0,
        imageX: 12,
        imageY: 12,
    },
    [TYPE.ECO_EMERG]: {
        len: 19.2,
        wid: 19.2,
        padX: 20,
        padY: 0,
        imageX: 25.4,
        imageY: 19.2,
    },
    [TYPE.BUSINESS]: {
        len: 20,
        wid: 17,
        padX: 10,
        padY: 0,
        imageX: 25,
        imageY: 25,
    },
    [TYPE.PREMECO]: {
        len: 20,
        wid: 18,
        padX: 5,
        padY: 0,
        imageX: 20,
        imageY: 16,
    },
});

export const Status = Object.freeze({
    Planned: 0,
    Loaded: 1,
});
