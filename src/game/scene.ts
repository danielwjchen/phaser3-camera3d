import * as  Phaser from 'phaser';

import { Character, Command, Direction } from './character';

export class MainScene extends Phaser.Scene {

    private spriteName: string = 'template';
    private character: Character | undefined;

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
        let character: Character = new Character(
            this, 
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