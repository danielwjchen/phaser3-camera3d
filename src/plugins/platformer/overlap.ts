import { CuboidBounds } from "./object3d";


export function getOverlap(
    aMin: number, aMax: number, bMin: number, bMax: number
): number {
    if (aMin <= bMin && bMin <= aMax && aMax <= bMax) {
        //   |-------------|
        // aMin          aMax
        //            |-------------|
        //          bMin          bMax
        return aMax - bMin;

    } else if (bMin <= aMin && aMax <= bMax) {
        //     |-------------|
        //   aMin          aMax
        //   |-----------------|
        // bMin              bMax
        return aMax - aMin;

    } else if (bMin <= aMin && aMin <= bMax && bMax <= aMax) {
        //               |-------------|
        //             aMin          aMax
        //    |-------------|
        //  bMin          bMax
        return bMax - aMin;
    } 

    return 0;
}

export class Overlap {
    private _x: number;
    private _y: number;
    private _z: number;

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    get z(): number {
        return this._z;
    }

    constructor(a: CuboidBounds, b: CuboidBounds) {
        this._x = getOverlap(a.minX, a.maxX, b.minX, b.maxX);
        this._y = getOverlap(a.minY, a.maxY, b.minY, b.maxY);
        this._z = getOverlap(a.minZ, a.maxZ, b.minZ, b.maxZ);
    }

    get isOverlapping(): boolean {
        return this._x !== 0 && this._y !== 0 && this._z !==0;
    }
}