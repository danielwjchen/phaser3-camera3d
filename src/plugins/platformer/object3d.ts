import { SQRT_2, SQRT_2_DIV_2 } from './constants';

const COLOR_GRID: number = 0x00aa00;

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
    public coordinatesText: Phaser.GameObjects.Text | undefined;

    private _x: number = 0;
    private _y: number = 0;
    private _z: number = 0;
    private graphics: Phaser.GameObjects.Graphics | undefined;

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
        this.coordinatesText = this.sprite.scene.add.text(
            coordinatesPosition.x, coordinatesPosition.y, this.getCoordinatesText(), { color: '#00ff00' }
        ).setDepth(this.z);
    }

    private getCoordinatesTextPosition(): Projection {
        let projection: Projection = getProjection(
            this.x, this.y, this.z
        );
        projection.y += this.sprite.height / 2 + COORDINATES_TEXT_OFFSET;

        return projection;
    }

    private getCoordinatesText(): string[] {
        let projection: Projection = getProjection(
            this.x, this.y, this.z
        );
        return [
            `(${Math.round(projection.x)}, ${Math.round(projection.y)})`,
            `(${this.x}, ${this.y}, ${this.z})`,
        ];
    }

    private getPolygonBottom(): Phaser.Geom.Polygon {

        let halfLength: number = this.sprite.width / 2;
        let halfWidth: number = this.sprite.width / 2;
        let halfHeight: number = this.sprite.height / 2;

        let projection0: Projection = getProjection(
            -1 * halfLength, 
            1 * halfHeight,
            -1 * halfWidth
        );

        let projection1: Projection = getProjection(
            -1 * halfLength, 
            1 * halfHeight,
            halfWidth
        );

        let projection2: Projection = getProjection(
            halfLength, 
            1 * halfHeight,
            halfWidth
        );

        let projection3: Projection = getProjection(
            halfLength, 
            1 * halfHeight,
            -1 * halfWidth
        );

        return new Phaser.Geom.Polygon([
            projection0.x, projection0.y,
            projection1.x, projection1.y,
            projection2.x, projection2.y,
            projection3.x, projection3.y,
        ]);

    }

    private getPolygonTop(): Phaser.Geom.Polygon {

        let halfLength: number = this.sprite.width / 2;
        let halfWidth: number = this.sprite.width / 2;
        let halfHeight: number = this.sprite.height / 2;

        let projection0: Projection = getProjection(
            -1 * halfLength, 
            -1 * halfHeight,
            -1 * halfWidth
        );

        let projection1: Projection = getProjection(
            -1 * halfLength, 
            -1 * halfHeight,
            halfWidth
        );

        let projection2: Projection = getProjection(
            halfLength, 
            -1 * halfHeight,
            halfWidth
        );

        let projection3: Projection = getProjection(
            halfLength, 
            -1 * halfHeight,
            -1 * halfWidth
        );

        return new Phaser.Geom.Polygon([
            projection0.x, projection0.y,
            projection1.x, projection1.y,
            projection2.x, projection2.y,
            projection3.x, projection3.y,
        ]);

    }

    private drawCollisionBox() {
        if (!this.graphics) {
            this.graphics = this.sprite.scene.add.graphics({ 
                x: this.sprite.x, y: this.sprite.y,
                lineStyle: { width: 2, color: COLOR_GRID } 
            });
        } else {
            this.graphics.setPosition(this.sprite.x, this.sprite.y);
            this.graphics.clear();
        }
        // let polygon: Phaser.Geom.Polygon = new Phaser.Geom.Polygon([
        //     -1 * halfWidth, halfHeight,
        //     -1 * halfWidth, -1 * halfHeight,
        //     halfWidth, -1 * halfHeight,
        //     halfWidth, halfHeight,
        //     -1 * halfWidth, halfHeight,
        // ]);


        let polygons: Phaser.Geom.Polygon[] = [
            this.getPolygonBottom(),
            this.getPolygonTop()
        ];
        polygons[0].points.forEach((point, index) => {
            let line: Phaser.Geom.Line = new Phaser.Geom.Line(
                point.x, point.y,
                polygons[1].points[index].x, polygons[1].points[index].y 
            );
            
            this.graphics?.strokeLineShape(line);
        });
        polygons.forEach(polygon => {
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
        this.coordinatesText?.setPosition(
            coordinatesPosition.x, coordinatesPosition.y
        );
        this.coordinatesText?.setText(this.getCoordinatesText());
        this.drawCollisionBox();
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

}