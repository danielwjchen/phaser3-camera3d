import { GRAVITY, SQRT_2 } from './constants';
import { Platform } from './platform';
import { v4 as uuidv4 } from 'uuid';

const COLOR_GRID: number = 0x00aa00;

export class MovableDirections {
    constructor(
        public up: boolean = true,
        public down: boolean = true,
        public left: boolean = true,
        public right: boolean = true,
        public forward: boolean = true,
        public backward: boolean = true,
    ) {}
};

export type Projection = {
    x: number,
    y: number,
};

const COORDINATES_TEXT_OFFSET: number = 20;

export interface IVector {
    x: number;
    y: number;
    z: number;
}

export function sortObject3dListByDistance(object3dList: Object3D[], object3d: Object3D) {
    object3dList.sort((a, b) => {
        const distanceFromA: number = getDistance(object3d, a);
        const distanceFromB: number = getDistance(object3d, b);
        if (distanceFromA < distanceFromB) {
            return -1;
        }
        if (distanceFromA > distanceFromB) {
            return 1;
        }

        return 0;
    });
}

export class Vector implements IVector {

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

    copy(): Vector {
        return new Vector(this.x, this.y, this.z);
    }

    equals(x: number, y: number, z: number) : boolean {
        return this._x === x && this._y === y && this._z === z;
    }

    getDifference(x: number, y: number, z: number) : Vector {
        return new Vector(this.x - x, this.y - y, this.z - z);
    }

}

export class CuboidBounds {
    public maxX: number = 0;
    public maxY: number = 0;
    public maxZ: number = 0;
    public minX: number = 0;
    public minY: number = 0;
    public minZ: number = 0;
}

export function getProjection(x: number, y: number, z: number): Projection {
    return {
        x: x + z / SQRT_2,
        y: -1 * y - z / SQRT_2,
    };
}

export function getDistance(a: IVector, b: IVector): number {
    return Math.sqrt((b.x - a.x) ^ 2 + (b.y - a.y) ^ 2 + (b.z - a.z) ^ 2);
}

export class Object3D implements IVector {

    public platform: Platform;
    public velocity: Vector;
    public coordinatesText: Phaser.GameObjects.Text | undefined;
    public sprite: Phaser.GameObjects.Sprite;
    public collisionCallback: ((force: Vector) => void) | undefined;
    public movableDirections: MovableDirections = new MovableDirections();

    private _uuid: string;
    private _x: number = 0;
    private _y: number = 0;
    private _z: number = 0;
    private _velocityMax: Vector;
    private graphics: Phaser.GameObjects.Graphics | undefined;
    private polygons: Phaser.Geom.Polygon[] = [];
    private halfLength: number = 0;
    private halfWidth: number = 0;
    private halfHeight: number = 0;

    get uuid(): string {
        return this._uuid;
    }

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

    get velocityMax(): Vector {
        return this._velocityMax;
    }

    constructor(
        platform: Platform,
        x: number, y: number, z: number, 
        sprite: Phaser.GameObjects.Sprite,
    ) {
        this._uuid = uuidv4();
        this.platform = platform;
        this.sprite = sprite;
        this.setSpriteDimensions();
        this.velocity = new Vector();
        this._velocityMax = new Vector();
        this._velocityMax.x = this.sprite.width;
        this._velocityMax.y = this.sprite.width;
        this._velocityMax.z = this.sprite.height;
        this.x = x;
        this.y = y;
        this.z = z;
        const coordinatesPosition = this.getCoordinatesTextPosition();
        this.coordinatesText = this.sprite.scene.add.text(
            coordinatesPosition.x, coordinatesPosition.y, 
            this.getCoordinatesText(), { color: '#00ff00' }
        ).setDepth(this.z);
        this.setColliderBox();
    }

    private setSpriteDimensions() {
        this.halfLength = this.sprite.width / 4;
        this.halfWidth = this.sprite.width / 4;
        this.halfHeight = this.sprite.height / 2;
    }

    private getCoordinatesTextPosition(): Projection {
        const projection: Projection = getProjection(
            this.x, this.y, this.z
        );
        projection.y += this.sprite.height / 2 + COORDINATES_TEXT_OFFSET;

        return projection;
    }

    private getCoordinatesText(): string[] {
        const projection: Projection = getProjection(
            this.x, this.y, this.z
        );
        return [
            `(${Math.round(projection.x)}, ${Math.round(projection.y)})`,
            `(${Math.round(this.x)}, ${Math.round(this.y)}, ${Math.round(this.z)})`,
        ];
    }

    private getPolygonBottom(): Phaser.Geom.Polygon {
        const projection0: Projection = getProjection(
            -1 * this.halfLength, 
            1 * this.halfHeight,
            -1 * this.halfWidth
        );

        const projection1: Projection = getProjection(
            -1 * this.halfLength, 
            1 * this.halfHeight,
            this.halfWidth
        );

        const projection2: Projection = getProjection(
            this.halfLength, 
            1 * this.halfHeight,
            this.halfWidth
        );

        const projection3: Projection = getProjection(
            this.halfLength, 
            1 * this.halfHeight,
            -1 * this.halfWidth
        );

        return new Phaser.Geom.Polygon([
            projection0.x, projection0.y,
            projection1.x, projection1.y,
            projection2.x, projection2.y,
            projection3.x, projection3.y,
        ]);

    }

    private getPolygonTop(): Phaser.Geom.Polygon {
        const projection0: Projection = getProjection(
            -1 * this.halfLength, 
            -1 * this.halfHeight,
            -1 * this.halfWidth
        );

        const projection1: Projection = getProjection(
            -1 * this.halfLength, 
            -1 * this.halfHeight,
            this.halfWidth
        );

        const projection2: Projection = getProjection(
            this.halfLength, 
            -1 * this.halfHeight,
            this.halfWidth
        );

        const projection3: Projection = getProjection(
            this.halfLength, 
            -1 * this.halfHeight,
            -1 * this.halfWidth
        );

        return new Phaser.Geom.Polygon([
            projection0.x, projection0.y,
            projection1.x, projection1.y,
            projection2.x, projection2.y,
            projection3.x, projection3.y,
        ]);

    }

    private setColliderBox() {
        this.polygons = [
            this.getPolygonTop(),
            this.getPolygonBottom(),
        ];
    }

    public getCurrentPosition(): Vector {
        return new Vector(this.x, this.y, this.z);
    }

    public getCuboidBounds(x: number, y: number, z: number): CuboidBounds {
        const result = new CuboidBounds();
        result.minX = x - this.halfLength;
        result.minY = y - this.halfHeight;
        result.minZ = z - this.halfWidth;
        result.maxX = x + this.halfLength;
        result.maxY = y + this.halfHeight;
        result.maxZ = z + this.halfWidth;
        return result;
    }

    public drawCollisionBox() {
        const projection: Projection = getProjection(this.x, this.y, this.z);
        if (!this.graphics) {
            this.graphics = this.sprite.scene.add.graphics({ 
                x: this.platform.originCavansX + projection.x, 
                y: this.platform.originCavansY + projection.y,
                lineStyle: { width: 2, color: COLOR_GRID } 
            });
        } else {
            this.graphics.setPosition(
                this.platform.originCavansX + projection.x, 
                this.platform.originCavansY + projection.y
            );
            this.graphics.clear();
        }
        this.graphics.moveTo(
            this.platform.originCavansX + projection.x, 
            this.platform.originCavansY + projection.y
        );
        const center: Phaser.Geom.Circle = new Phaser.Geom.Circle(
            0, 0, 2
        );
        this.graphics.strokeCircleShape(center);


        this.polygons[0].points.forEach((point, index) => {
            const line: Phaser.Geom.Line = new Phaser.Geom.Line(
                point.x, point.y,
                this.polygons[1].points[index].x, 
                this.polygons[1].points[index].y 
            );
            
            this.graphics?.strokeLineShape(line);
        });
        this.polygons.forEach(polygon => {
            this.graphics?.beginPath();

            this.graphics?.moveTo(
                polygon.points[0].x, polygon.points[0].y
            );

            for (let i: number = 1; i < polygon.points.length; i++) {
                this.graphics?.lineTo(
                    polygon.points[i].x, polygon.points[i].y
                );
            }

            this.graphics?.closePath();
            this.graphics?.strokePath();
        })
    }

    public drawCoordinatesText() {
        const coordinatesPosition = this.getCoordinatesTextPosition();
        this.coordinatesText?.setPosition(
            this.platform.originCavansX + coordinatesPosition.x, 
            this.platform.originCavansY + coordinatesPosition.y
        );
        this.coordinatesText?.setText(this.getCoordinatesText());
    }

    public setSpritePosition() {
        const projection: Projection = getProjection(
            this.x, this.y, this.z
        );
        this.sprite.setPosition(
            this.platform.originCavansX + projection.x, 
            this.platform.originCavansY + projection.y
        );
    }

    public setVelocity(x: number, y: number, z: number) {
        this.velocity.x = x;
        this.velocity.y = y;
        this.velocity.z = z;
    }
    
    public getNextPosition(): Vector {
        const result: Vector = new Vector();
        result.x = this.x + this.velocity.x;
        result.y = this.y + this.velocity.y;
        result.z = this.z + this.velocity.z;
        return result;
    }

    private getVelocityWithinMax(velocity: number, velocityMax: number): number {
        if (Math.abs(velocity) > velocityMax) {
            return velocity > 0 ? velocityMax : velocityMax * -1;
        } 
        return velocity;
    }

    public update(
        x: number, y: number, z: number
    ) {
        this.x = x;
        this.y = y;
        this.z = z;
        if (this.movableDirections.down) {
            this.velocity.y -= GRAVITY;
        } else {
            this.velocity.y = 0;
        }
        this.velocity.x = this.getVelocityWithinMax(this.velocity.x, this.velocityMax.x);
        this.velocity.y = this.getVelocityWithinMax(this.velocity.y, this.velocityMax.y);
        this.velocity.z = this.getVelocityWithinMax(this.velocity.z, this.velocityMax.z);

        this.setSpriteDimensions();
        this.setSpritePosition();
        this.setColliderBox();
    }

    public stop() {
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.velocity.z = 0;
        this.setSpritePosition();
    }

    public destroy() {
        this.graphics?.destroy();
    }

    public onCollision(force: Vector) {
        if (!this.collisionCallback) {
            return;
        }
        this.collisionCallback(force);
    }

}