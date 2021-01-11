import { RADIAN_45, SQRT_2 } from './constants';

const COLOR_GRID: number = 0x00aa00;

export class Platform {

    constructor(
        public scene: Phaser.Scene, public width: number, public length: number
    ) {
        let yHorizon: number = this.width / 2;
        let yOffsetForUi: number = this.width / 5;

        let yStage: number = this.width - yOffsetForUi;
        let gridSize: number = (yHorizon - yOffsetForUi) / 5;
        this.createPlane();
        // this.createLinesX(gridSize, COLOR_GRID, yStage, yHorizon);
        // this.createLinesZ(gridSize, COLOR_GRID, yStage, yHorizon);

    }

    private createPlane() {
        let offset: number = (SQRT_2 / 2) * this.width;
        let startingCanvasX: number = this.scene.game.canvas.width / 2 - offset;
        let startingCanvasY: number = this.scene.game.canvas.height / 2 + this.width / 2;
        let polygon: Phaser.Geom.Polygon = new Phaser.Geom.Polygon([
            startingCanvasX, startingCanvasY,
            startingCanvasX + offset, startingCanvasY - offset,
            startingCanvasX + this.length + offset, startingCanvasY - offset,
            startingCanvasX + this.length, startingCanvasY,
            startingCanvasX, startingCanvasY,
        ]);

        let graphics = this.scene.add.graphics({ x: 0, y: 0 });

        graphics.lineStyle(2, COLOR_GRID);

        graphics.beginPath();

        graphics.moveTo(polygon.points[0].x, polygon.points[0].y);

        for (var i = 1; i < polygon.points.length; i++)
        {
            graphics.lineTo(polygon.points[i].x, polygon.points[i].y);
        }

        graphics.closePath();
        graphics.strokePath();
    }


    private createLinesX(
        gridSize: number, gridColor: number, start: number, end: number
    ) {
        for (let i: number = start; i >= end; i = i - 1 * gridSize) {
            this.scene.add.line(
                0 + this.length / 2, i, 
                0, 0, 
                this.length, 0, 
                gridColor
            );
        }
    }

    private createLinesZ(
        gridSize: number, gridColor: number, start: number, end: number
    ) {
        let height: number = start - end;
        let slope: number = height * 1.41;
        let base: number = height;
        for (
            let i: number = 0; 
            i < (this.length + base); 
            i = i + gridSize * SQRT_2
        ) {
            let line = this.scene.add.line(
                i, this.width / 2, 
                0, 0, 
                0, slope, 
                gridColor
            );
            line.setOrigin(0, 0);
            line.setRotation(RADIAN_45);
        }
    }

    public isOutOfBound(x: number, z: number, width: number, length: number): boolean {
        let result: boolean = false;
        return result;
    }

}