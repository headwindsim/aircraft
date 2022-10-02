export const TYPE = Object.freeze({ ECO: 0, ECO_EMERG: 1, BUSINESS: 2, PREMECO: 3 });

export const CanvasConst = Object.freeze({
    xTransform: '243px',
    yTransform: '78px',
    width: 1000,
    height: 150,
});
export interface SeatInfo {
    type: number,
    x: number,
    y: number,
    yOffset: number
}

export interface RowInfo {
    x: number,
    y: number,
    xOffset: number,
    yOffset: number,
    seats: SeatInfo[],
}

export interface PaxStationInfo {
    name: string,
    rows: RowInfo[],
    simVar: string,
    index: number,
    fill: number,
    stationIndex: number,
    position: number,
}

export interface CargoStationInfo {
    name: string,
    weight: number,
    simVar: string,
    index: number,
    stationIndex: number,
    progressBarWidth: number,
    position: number,
}

export const SeatConstants = Object.freeze({
    [TYPE.ECO]: {
        len: 16,
        wid: 16.2,
        padX: 2,
        padY: 0,
        imageX: 14,
        imageY: 14,
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
