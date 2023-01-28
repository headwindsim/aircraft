export class BitFlags {
    flags: number[];

    constructor(float: number[]) {
        this.flags = [];
        this.setFlags(float);
    }

    setFlags(float: number[]): void {
        this.flags = float;
    }

    getBitIndex(bit: number): boolean {
        const f = Math.floor(bit / 31);
        const b = bit % 31;

        return ((this.flags[f] >> b) & 1) !== 0;
    }

    toggleBitIndex(bit: number): void {
        const f = Math.floor(bit / 31);
        const b = bit % 31;

        this.flags[f] ^= (1 << b);
    }

    toDouble(): number[] {
        return this.flags;
    }

    toString(): string {
        const values =  this.flags.map(flag => flag.toString(2));
        return (`[ ${values.join(' | ')} ]`);
    }
}
