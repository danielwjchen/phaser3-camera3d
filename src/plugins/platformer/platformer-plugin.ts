import { Character, GAME_OBJECT_TYPE_CHARACTER } from "./character";

export const PLUGIN_PLATFORMER: string = 'PlatformerPlugin';
const RADIAN_45: number = 0.7853982;

export class PlatformerPlugin extends Phaser.Plugins.ScenePlugin {

    constructor(
        scene: Phaser.Scene,
        pluginManager: Phaser.Plugins.PluginManager
    ) {
        super(scene, pluginManager);
        pluginManager.registerGameObject(
            GAME_OBJECT_TYPE_CHARACTER, Character
        );
    }

    public createCharacter(
        x: number, y:number,
        texture: string | Phaser.Textures.Texture, 
        frame?: string | number,
        runningVelocity: number=400, 
        walkingVelocity: number=100,
        jumpingVelocity: number=200 
    ): Character {
        let characater: Character = new Character(
            this.scene, x, y, texture, frame, 
            runningVelocity, walkingVelocity, jumpingVelocity
        );
        this.scene.sys.displayList.add(characater);
        return characater;
    }


    private createLinesX(
        gridSize: number, gridColor: number, start: number, end: number
    ) {
        for (let i: number = start; i >= end; i = i - 1 * gridSize) {
            this.scene.add.line(
                0 + this.game.canvas.width / 2, i, 
                0, 0, 
                this.game.canvas.width, 0, 
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
        for (let i: number = 0; i < (this.game.canvas.width + base); i = i + gridSize) {
            let line = this.scene.add.line(
                i, this.game.canvas.height / 2, 
                0, 0, 
                0, slope, 
                gridColor
            );
            line.setRotation(RADIAN_45);
            line.setOrigin(0, 0);
        }
    }

    public createPlatform() {
        let gridColor: number = 0x0B610B;
        let yHorizon: number = this.game.canvas.height / 2;
        let yOffsetForUi: number = this.game.canvas.height / 5;

        let yStage: number = this.game.canvas.height - yOffsetForUi;
        let gridSize: number = (yHorizon - yOffsetForUi) / 5;
        this.createLinesX(gridSize, gridColor, yStage, yHorizon);
        this.createLinesZ(gridSize, gridColor, yStage, yHorizon);

    }

}