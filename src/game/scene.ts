import * as  Phaser from 'phaser';
import { 
    Character, PlatformerPlugin, Command, Direction 
} from 'src/plugins/platformer';

const RADIAN_45: number = 0.7853982;
const CAMERA_ZOOM_STEP = 0.5;

export class MainScene extends Phaser.Scene {

    private spriteName: string = 'template';
    private character: Character | undefined;
    private platformer: PlatformerPlugin | undefined;

    constructor() {
        super({
            key: 'MainScene',
        })
    }
    

    private addCameraMovements() {

        this.input.on(Phaser.Input.Events.POINTER_WHEEL, (pointer: Phaser.Input.Pointer ) => {
            let zoomTo : number = (
                pointer.deltaY > 0 
                ? this.cameras.main.zoom - CAMERA_ZOOM_STEP
                : this.cameras.main.zoom + CAMERA_ZOOM_STEP
            );
            if (zoomTo <= 1) {
                zoomTo = 1;
            }
            this.cameras.main.zoom = zoomTo;
        });

    }


    private createLinesX(
        gridSize: number, gridColor: number, start: number, end: number
    ) {
        for (let i: number = start; i >= end; i = i - 1 * gridSize) {
            this.add.line(
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
            let line = this.add.line(
                i, this.game.canvas.height / 2, 
                0, 0, 
                0, slope, 
                gridColor
            );
            line.setRotation(RADIAN_45);
            line.setOrigin(0, 0);
        }
    }

    private createPlatform() {
        let uiTopColor: number = 0x9966ff;
        let uiBottomColor: number = 0x9966ff;
        let gridColor: number = 0x0B610B;
        let yHorizon: number = this.game.canvas.height / 2;
        let yOffsetForUi: number = this.game.canvas.height / 5;

        let yStage: number = this.game.canvas.height - yOffsetForUi;
        let gridSize: number = (yHorizon - yOffsetForUi) / 5;
        this.createLinesX(gridSize, gridColor, yStage, yHorizon);
        this.createLinesZ(gridSize, gridColor, yStage, yHorizon);

        let lineTop: Phaser.GameObjects.Line = this.add.line(
            0 + this.game.canvas.width / 2, yOffsetForUi, 
            0, 0, 
            this.game.canvas.width, 0, 
            uiTopColor
        );
        // let lineTop: Phaser.GameObjects.Line = this.add.line(
        //     0 + this.game.canvas.width / 2, this.game.canvas.height - yOffsetForUi, 
        //     0, yOffsetForUi, 
        //     this.game.canvas.width, this.game.canvas.height - yOffsetForUi, 
        //     0x2966ff
        // );
    }

    preload(): void {
        this.load.animation(
            this.spriteName, 
            'assets/characters/template/animation.json',
        );
        this.load.atlas(
            'atlas', 
            'assets/characters/template/atlas.png',
            'assets/characters/template/atlas.json')
    }

    create(): void {
        this.createPlatform();
        this.addCameraMovements();
        if (!this.platformer) {
            return;

        }
        let character: Character = this.platformer.createCharacter(
            this.cameras.main.centerX, 
            this.cameras.main.centerY, 
            this.spriteName
        );
        let leftKey: Phaser.Input.Keyboard.Key = 
            this.input.keyboard.addKey('LEFT');
        let rightKey: Phaser.Input.Keyboard.Key = 
            this.input.keyboard.addKey('RIGHT');
        let upKey: Phaser.Input.Keyboard.Key = 
            this.input.keyboard.addKey('UP');
        let downKey: Phaser.Input.Keyboard.Key = 
            this.input.keyboard.addKey('DOWN');
        let runKey: Phaser.Input.Keyboard.Key = 
            this.input.keyboard.addKey('r');
        [
            leftKey,
            rightKey,
            upKey,
            downKey,
            runKey,
        ].forEach(key => {
            ['up', 'down'].forEach(eventName => {
                key.on(eventName, () => {
                    let command: Command = {
                        Up: upKey.isDown,
                        Down: downKey.isDown,
                        Left: leftKey.isDown,
                        Right: rightKey.isDown,
                    };
                    character.go(command, runKey.isDown);
                });
            });
        });
        this.input.keyboard.addKey('b').on('down', () => {
            character.attacked(100, Direction.Left);
        });
        this.input.keyboard.addKey('v').on('down', () => {
            character.attacked(100, Direction.Right);
        });
        this.input.keyboard.addKey('a').on('down', () => {
            character.attack();
        });
        this.input.keyboard.addKey('g').on('down', () => {
            character.guard();
        });
        this.input.keyboard.addKey('g').on('up', () => {
            character.stand();
        });
        this.input.keyboard.addKey('SPACE').on('down', () => {
            character.jump();
        });

        this.character = character;
    }

    update() {
        if (!this.character) { return; }
        this.character.update();
    }
}