import { SQRT_2_DIV_2 } from './constants';

const COLOR_GRID: number = 0x00aa00;

export class Platform {

    private gridSize: integer = 40;
    private linesHorizontal: Phaser.Geom.Line[] = [];
    private linesVertical: Phaser.Geom.Line[] = [];
    private graphics: Phaser.GameObjects.Graphics;

    public scene: Phaser.Scene;
    public width: number;
    public length: number;
    public widthInPixels: number;
    public lengthInPixels: number;
    public startingCanvasX: number;
    public startingCanvasY: number;

    constructor(
        scene: Phaser.Scene, width: number, length: number
    ) {
        this.scene = scene;
        this.width = width;
        this.length = length;
        this.widthInPixels = this.width * this.gridSize;
        this.lengthInPixels = this.length * this.gridSize;
        this.startingCanvasX = this.scene.game.canvas.width / 2 - this.widthInPixels;
        this.startingCanvasY = this.scene.game.canvas.height / 2 + this.widthInPixels / 2;
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
        let polygon: Phaser.Geom.Polygon = new Phaser.Geom.Polygon([
            this.startingCanvasX, this.startingCanvasY,
            this.startingCanvasX + projectedX, this.startingCanvasY - projectedX,
            this.startingCanvasX + projectedX + this.lengthInPixels, this.startingCanvasY - projectedX,
            this.startingCanvasX + this.lengthInPixels, this.startingCanvasY,
            this.startingCanvasX, this.startingCanvasY,
        ]);

        this.graphics.beginPath();

        this.graphics.moveTo(polygon.points[0].x, polygon.points[0].y);

        for (let i: number = 1; i < polygon.points.length; i++) {
            this.graphics.lineTo(polygon.points[i].x, polygon.points[i].y);
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
                this.startingCanvasX + SQRT_2_DIV_2 * i * this.gridSize, 
                this.startingCanvasY - SQRT_2_DIV_2 * i * this.gridSize, 
                this.startingCanvasX + SQRT_2_DIV_2 * i * this.gridSize + this.lengthInPixels, 
                this.startingCanvasY - SQRT_2_DIV_2 * i * this.gridSize, 
            );;
            
            this.graphics.strokeLineShape(line);
            this.linesHorizontal.push(line);
        }
    }

    private createLinesVertical() {
        this.linesVertical = [];
        for (let i: number = 1; i < this.length; i++) {
            let line: Phaser.Geom.Line = new Phaser.Geom.Line(
                this.startingCanvasX + i * this.gridSize, 
                this.startingCanvasY, 
                this.startingCanvasX + this.width * this.gridSize * SQRT_2_DIV_2 + this.gridSize * i, 
                this.startingCanvasY - this.widthInPixels * SQRT_2_DIV_2, 
            );;
            
            this.graphics.strokeLineShape(line);
            this.linesVertical.push(line);
        }
    }

    public isOutOfBound(x: number, z: number, width: number, length: number): boolean {
        let result: boolean = false;
        return result;
    }

}