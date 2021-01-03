const RADIAN_45: number = 0.7853982;

export class Platform {
    public scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        let gridColor: number = 0x0B610B;
        let yHorizon: number = this.scene.game.canvas.height / 2;
        let yOffsetForUi: number = this.scene.game.canvas.height / 5;

        let yStage: number = this.scene.game.canvas.height - yOffsetForUi;
        let gridSize: number = (yHorizon - yOffsetForUi) / 5;
        this.createLinesX(gridSize, gridColor, yStage, yHorizon);
        this.createLinesZ(gridSize, gridColor, yStage, yHorizon);

    }


    private createLinesX(
        gridSize: number, gridColor: number, start: number, end: number
    ) {
        for (let i: number = start; i >= end; i = i - 1 * gridSize) {
            this.scene.add.line(
                0 + this.scene.game.canvas.width / 2, i, 
                0, 0, 
                this.scene.game.canvas.width, 0, 
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
        for (let i: number = 0; i < (this.scene.game.canvas.width + base); i = i + gridSize) {
            let line = this.scene.add.line(
                i, this.scene.game.canvas.height / 2, 
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