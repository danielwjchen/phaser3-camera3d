import { Character, GAME_OBJECT_TYPE_CHARACTER } from "./character";
import { Platform } from "./platform";

export const PLUGIN_PLATFORMER: string = 'PlatformerPlugin';
export const VELOCITY_GRAVITY: number = 1;

export class PlatformerPlugin extends Phaser.Plugins.ScenePlugin {

    public platform: Platform | undefined;
    public characters: Character[] = [];

    constructor(
        scene: Phaser.Scene,
        pluginManager: Phaser.Plugins.PluginManager
    ) {
        super(scene, pluginManager);
        pluginManager.registerGameObject(
            GAME_OBJECT_TYPE_CHARACTER, this.createCharacter
        );
        this.scene.events.once(Phaser.Scenes.Events.READY, () => {
            this.scene.events.on(Phaser.Scenes.Events.UPDATE, () => {
                this.characters.forEach(character => {
                    character.update();
                    // if (character.object3d.y > 0) {
                    //     character.object3d.velocity.y -= VELOCITY_GRAVITY;
                    // } else {
                    //     character.object3d.velocity.y = 0;
                    //     character.object3d.y = 0;
                    // }
                    character.object3d.update();
                });
            });
        });
    }

    public createCharacter(
        x: number, y:number, z:number,
        texture: string | Phaser.Textures.Texture, 
        frame?: string | number,
        runningVelocity: number=40, 
        walkingVelocity: number=8,
        jumpingVelocity: number=16 
    ): Character {
        if (!this.platform) {
            throw new Error('Platform is not created');
        }
        let characater: Character = new Character(
            this.platform, x, y, z, texture, frame, 
            runningVelocity, walkingVelocity, jumpingVelocity
        );
        this.characters.push(characater);
        this.scene.sys.displayList.add(characater.sprite);
        return characater;
    }

    public createPlatform(
        x: number, y:number, z:number,
        width: number, length: number
    ): Platform {
        this.platform = new Platform(this.scene, x, y, z, width, length);
        return this.platform;
    }

}