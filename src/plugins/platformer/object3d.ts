export const SQRT_2: number = 1.41421356237;

export type Projection = {
    x: number,
    y: number,
};

export class Vector {

    constructor(
        private _x: number = 0,
        private _y: number = 0,
        private _z: number = 0,
    ) {}

    set x(value: number) {
        this._x = value;
    }

    get x(): number {
        return this._x;
    }

    set y(value: number) {
        this._y = value;
    }

    get y(): number {
        return this._y;
    }

    set z(value: number) {
        this._z = value;
    }

    get z(): number {
        return this._z;
    }

    public getProjection(): Projection {
        return {
            x: this.x + this.z / SQRT_2,
            y: this.y + this.z / SQRT_2,
        };
    }

}

export class Object3D {

    public sprite: Phaser.GameObjects.Sprite;

    private _x: number = 0;
    private _y: number = 0;
    private _z: number = 0;
    private velocity: Vector;

    set x(value: number) {
        this._x = value;
    }

    get x(): number {
        return this._x;
    }

    set y(value: number) {
        this._y = value;
    }

    get y(): number {
        return this._y;
    }

    set z(value: number) {
        this._z = value;
        this.sprite.depth = value * -1;
    }

    get z(): number {
        return this._z;
    }

    constructor(
        x: number, y: number, z: number, 
        sprite: Phaser.GameObjects.Sprite,
    ) {
        this.sprite = sprite;
        this.velocity = new Vector();
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public setVelocity(x: number, y: number, z: number) {
        this.velocity.x = x;
        this.velocity.y = y;
        this.velocity.z = z;
    }

    public stop() {
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.velocity.z = 0;
    }

}