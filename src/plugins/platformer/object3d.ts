export const SQRT_2: number = 1.41421356237;

export type Projection = {
    x: number,
    y: number,
};

export class Velocity {

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
        let result: Projection = {
            x: this.x + this.z / SQRT_2,
            y: this.y + this.z / SQRT_2,
        };

        return result;
    }

}

export class Object3D {

    public sprite: Phaser.GameObjects.Sprite;

    private _x: number = 0;
    private _y: number = 0;
    private _z: number = 0;
    private velocity: Velocity;

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
        scene: Phaser.Scene,
        x: number, y: number, z: number, 
        texture: string | Phaser.Textures.Texture, frame: string | number
    ) {
        this.sprite = new Phaser.GameObjects.Sprite(scene, x, y, texture, frame);
        this.velocity = new Velocity();
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public setVelocity(x: number, y: number, z: number) {
        this.velocity.x = x;
        this.velocity.y = y;
        this.velocity.z = z;
    }

}