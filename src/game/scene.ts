import * as  Phaser from 'phaser';

import { Character, Command, Direction } from './character';

export class MainScene extends Phaser.Scene {

    private spriteName: string = 'template';
    private character: Character;
    private leftKey: Phaser.Input.Keyboard.Key;
    private rightKey: Phaser.Input.Keyboard.Key;
    private upKey: Phaser.Input.Keyboard.Key;
    private downKey: Phaser.Input.Keyboard.Key;
    private runKey: Phaser.Input.Keyboard.Key;

    constructor() {
        super({
            key: 'MainScene',
        })
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
        this.character = new Character(
            this, 
            this.cameras.main.centerX, 
            this.cameras.main.centerY, 
            this.spriteName
        );
        this.leftKey = this.input.keyboard.addKey('LEFT');
        this.rightKey = this.input.keyboard.addKey('RIGHT');
        this.upKey = this.input.keyboard.addKey('UP');
        this.downKey = this.input.keyboard.addKey('DOWN');
        this.runKey = this.input.keyboard.addKey('r');
        [
            this.leftKey,
            this.rightKey,
            this.upKey,
            this.downKey,
            this.runKey,
        ].forEach(key => {
            ['up', 'down'].forEach(eventName => {
                key.on(eventName, () => {
                    let command: Command = {
                        Up: this.upKey.isDown,
                        Down: this.downKey.isDown,
                        Left: this.leftKey.isDown,
                        Right: this.rightKey.isDown,
                    };
                    this.character.go(command, this.runKey.isDown);

                });
            });
        });
        this.input.keyboard.addKey('b').on('down', () => {
            this.character.attacked(100, Direction.Left);
        });
        this.input.keyboard.addKey('v').on('down', () => {
            this.character.attacked(100, Direction.Right);
        });
        this.input.keyboard.addKey('a').on('down', () => {
            this.character.attack();
        });
        this.input.keyboard.addKey('g').on('down', () => {
            this.character.guard();
        });
        this.input.keyboard.addKey('g').on('up', () => {
            this.character.stand();
        });
        this.input.keyboard.addKey('SPACE').on('down', () => {
            this.character.jump();
        });
    }

    update() {
        this.character.update();
    }
}