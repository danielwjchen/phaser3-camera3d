import * as  Phaser from 'phaser';
import { 
    Character, PlatformerPlugin, Command, Direction, Platform 
} from 'src/plugins/platformer';
import { Item } from 'src/plugins/platformer/item';

const CAMERA_ZOOM_STEP = 0.5;

export class MainScene extends Phaser.Scene {

    private spriteName: string = 'template';
    private character: Character | undefined;
    private platformer: PlatformerPlugin | undefined;
    private leftKey: Phaser.Input.Keyboard.Key | undefined;
    private rightKey: Phaser.Input.Keyboard.Key | undefined;
    private upKey: Phaser.Input.Keyboard.Key | undefined;
    private downKey: Phaser.Input.Keyboard.Key | undefined;
    private runKey: Phaser.Input.Keyboard.Key | undefined;

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
    
    private createUiTop() {
        let uiTopColor: number = 0x9966ff;
        let yOffsetForUi: number = this.game.canvas.height / 5;

        this.add.line(
            0 + this.game.canvas.width / 2, yOffsetForUi, 
            0, 0, 
            this.game.canvas.width, 0, 
            uiTopColor
        );

    }

    preload(): void {
        this.load.animation(
            this.spriteName, 
            'assets/characters/template/animation.json',
        );
        this.load.animation(
            'boulder', 
            'assets/items/boulder/animation.json',
        );
        this.load.atlas(
            'atlas', 
            'assets/characters/template/atlas.png',
            'assets/characters/template/atlas.json')
        this.load.atlas(
            'item_atlas', 
            'assets/items/boulder/atlas.png',
            'assets/items/boulder/atlas.json')
    }

    create(): void {
        this.createUiTop();
        this.addCameraMovements();
        if (!this.platformer) {
            return;
        }
        let world: Platform = this.platformer.createPlatform(0, 0, 0, 6, 16);
        let character: Character = this.platformer.createCharacter(
            1, 0, world.centerZ,
            this.spriteName
        );
        let item: Item = this.platformer.createItem(3, 5, 2, 'boulder');
        // this.platformer.createCircile(1, 1, world.centerZ);
        // this.platformer.createCircile(1, 0 ,0);
        // this.platformer.createCircile(0, 0 ,0);
        // this.platformer.createCircile(0, 1, 0);
        // this.platformer.createCircile(0, 0, 1);
        // this.platformer.createCircile(1, 0, 1);
        // this.platformer.createCircile(1, 1, 1);
        this.leftKey = 
            this.input.keyboard.addKey('LEFT');
        this.rightKey = 
            this.input.keyboard.addKey('RIGHT');
        this.upKey = 
            this.input.keyboard.addKey('UP');
        this.downKey = 
            this.input.keyboard.addKey('DOWN');
        this.runKey = 
            this.input.keyboard.addKey('r');

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
        this.cameras.main.centerOn(
            this.character.sprite.x, this.character.sprite.y
        );
        let command: Command = {
            Up: this?.upKey?.isDown || false,
            Down: this?.downKey?.isDown || false,
            Left: this?.leftKey?.isDown || false,
            Right: this?.rightKey?.isDown || false,
        };
        this.character.go(command, this?.runKey?.isDown || false);
    }
}