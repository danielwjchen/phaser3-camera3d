export const SQRT_2: number = 1.41421356237;

export type Projection = {
    x: number,
    y: number,
};

const COORDINATES_TEXT_OFFSET: number = 20;

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

}

export function getProjection(x: number, y: number, z: number): Projection {
    return {
        x: x + z / SQRT_2,
        y: y - z / SQRT_2,
    };
}

export class Object3D {

    public sprite: Phaser.GameObjects.Sprite;
    public velocity: Vector;
    public coordinatesPlatform: Phaser.GameObjects.Text | undefined;
    public coordinatesCanvas: Phaser.GameObjects.Text| undefined;

    private _x: number = 0;
    private _y: number = 0;
    private _z: number = 0;

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
        let coordinatesPosition = this.getCoordinatesTextPosition();
        this.coordinatesCanvas = this.sprite.scene.add.text(
            coordinatesPosition.x, coordinatesPosition.y, this.getCoordinatesCanvas(), { color: '#00ff00' }
        ).setDepth(this.z);
        this.coordinatesPlatform = this.sprite.scene.add.text(
            coordinatesPosition.x, coordinatesPosition.y + COORDINATES_TEXT_OFFSET, this.getCoordinatesPlatform(), { color: '#00ff00' }
        ).setDepth(this.z);
    }

    private getCoordinatesTextPosition(): Projection {
        let projection: Projection = getProjection(
            this.x, this.y, this.z
        );
        projection.y += this.sprite.height / 2 + COORDINATES_TEXT_OFFSET;

        return projection;
    }

    private getCoordinatesCanvas(): string {
        let projection: Projection = getProjection(
            this.x, this.y, this.z
        );
        return `(${projection.x}, ${projection.y})`;
    }

    private getCoordinatesPlatform(): string {
        return `(${this.x}, ${this.y}, ${this.z})`;
    }

    public setSpritePosition() {
        let projection: Projection = getProjection(
            this.x, this.y, this.z
        );
        this.sprite.setPosition(projection.x, projection.y)
    }

    public setVelocity(x: number, y: number, z: number) {
        this.velocity.x = x;
        this.velocity.y = y;
        this.velocity.z = z;
    }

    public update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.z += this.velocity.z;
        this.setSpritePosition();
        let coordinatesPosition = this.getCoordinatesTextPosition();
        this.coordinatesCanvas?.setPosition(coordinatesPosition.x, coordinatesPosition.y);
        this.coordinatesPlatform?.setPosition(coordinatesPosition.x, coordinatesPosition.y + COORDINATES_TEXT_OFFSET);
    }

    public stop() {
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.velocity.z = 0;
        this.setSpritePosition();
    }

}