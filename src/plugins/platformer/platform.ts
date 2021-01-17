import { SQRT_2, SQRT_2_DIV_2 } from './constants';
import { Object3D } from './object3d';

const COLOR_GRID: number = 0x00aa00;

export class Platform {

    private gridSize: integer = 40;
    private linesHorizontal: Phaser.Geom.Line[] = [];
    private linesVertical: Phaser.Geom.Line[] = [];
    private graphics: Phaser.GameObjects.Graphics;
    private polygon: Phaser.Geom.Polygon | undefined;

    private _x: number = 0;
    private _y: number = 0;
    private _z: number = 0;
    private _maxX: number;
    private _maxZ: number;
    private _originCanvasX: number;
    private _originCanvasY: number;

    public scene: Phaser.Scene;
    public width: number;
    public length: number;
    public widthInPixels: number;
    public lengthInPixels: number;

    get tileSizeInPixel(): number {
        return this.gridSize;
    }

    get x(): number {
        return this._x;
    }
    get y(): number {
        return this._y;
    }
    get z(): number {
        return this._z;
    }

    get centerZ(): number {
        return this.width / 2;
    }

    get originCavansX(): number {
        return this._originCanvasX;
    }

    get originCavansY(): number {
        return this._originCanvasY;
    }

    get maxX(): number {
        return this._maxX;
    }

    get maxZ(): number {
        return this._maxZ;
    }

    constructor(
        scene: Phaser.Scene, 
        x: number, y: number, z: number,
        width: number, length: number
    ) {
        this.scene = scene;
        this._x = x;
        this._y = y;
        this._z = z;
        this.width = width;
        this.length = length;
        this.widthInPixels = this.width * this.gridSize;
        this.lengthInPixels = this.length * this.gridSize;
        this._maxX = this.x + this.lengthInPixels;
        this._maxZ = this.z + this.widthInPixels;
        this._originCanvasX = this.scene.game.canvas.width / 2 - this.widthInPixels;
        this._originCanvasY = this.scene.game.canvas.height / 2 + this.widthInPixels / 2;
        this.graphics = this.scene.add.graphics({ 
            x: 0, y: 0 ,
            lineStyle: { width: 2, color: COLOR_GRID } 
        });

        this.createPlane();
        this.createLinesHorizontal();
        this.createLinesVertical();

    }

    private createPlane() {
        let projectedX: number = this.widthInPixels * SQRT_2_DIV_2;
        this.polygon = new Phaser.Geom.Polygon([
            this._originCanvasX, this._originCanvasY,
            this._originCanvasX + projectedX, this._originCanvasY - projectedX,
            this._originCanvasX + projectedX + this.lengthInPixels, this._originCanvasY - projectedX,
            this._originCanvasX + this.lengthInPixels, this._originCanvasY,
            this._originCanvasX, this._originCanvasY,
        ]);

        this.graphics.beginPath();

        this.graphics.moveTo(
            this.polygon.points[0].x, this.polygon.points[0].y
        );

        for (let i: number = 1; i < this.polygon.points.length; i++) {
            this.graphics.lineTo(
                this.polygon.points[i].x, this.polygon.points[i].y
            );
        }

        this.graphics.closePath();
        this.graphics.strokePath();
    }


    private createLinesHorizontal() {
        this.linesHorizontal = [];
        
        for (
            let i: number = 0; 
            i < this.width; 
            i++
        ) {
            let line: Phaser.Geom.Line = new Phaser.Geom.Line(
                this._originCanvasX + SQRT_2_DIV_2 * i * this.gridSize, 
                this._originCanvasY - SQRT_2_DIV_2 * i * this.gridSize, 
                this._originCanvasX + SQRT_2_DIV_2 * i * this.gridSize + this.lengthInPixels, 
                this._originCanvasY - SQRT_2_DIV_2 * i * this.gridSize, 
            );;
            
            this.graphics.strokeLineShape(line);
            this.linesHorizontal.push(line);
        }
    }

    private createLinesVertical() {
        this.linesVertical = [];
        for (let i: number = 1; i < this.length; i++) {
            let line: Phaser.Geom.Line = new Phaser.Geom.Line(
                this._originCanvasX + i * this.gridSize, 
                this._originCanvasY, 
                this._originCanvasX + this.width * this.gridSize * SQRT_2_DIV_2 + this.gridSize * i, 
                this._originCanvasY - this.widthInPixels * SQRT_2_DIV_2, 
            );;
            
            this.graphics.strokeLineShape(line);
            this.linesVertical.push(line);
        }
    }

    public isOutOfBound(object3d: Object3D): boolean {
        return (
            object3d.z < this.z || object3d.z + object3d.sprite.width > this.z
        ) ;
    }

    public destroy() {
        this.graphics.destroy();
    }

}