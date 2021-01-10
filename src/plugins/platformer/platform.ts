import { RADIAN_45, SQRT_2 } from './constants';

export class Platform {

    constructor(
        public scene: Phaser.Scene, public width: number, public length: number
    ) {
        let gridColor: number = 0x0B610B;
        let yHorizon: number = this.width / 2;
        let yOffsetForUi: number = this.width / 5;

        let yStage: number = this.width - yOffsetForUi;
        let gridSize: number = (yHorizon - yOffsetForUi) / 5;
        this.createLinesX(gridSize, gridColor, yStage, yHorizon);
        this.createLinesZ(gridSize, gridColor, yStage, yHorizon);

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