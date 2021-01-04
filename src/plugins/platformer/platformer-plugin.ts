import { Character, GAME_OBJECT_TYPE_CHARACTER } from "./character";
import { Platform } from "./platform";

export const PLUGIN_PLATFORMER: string = 'PlatformerPlugin';

export class PlatformerPlugin extends Phaser.Plugins.ScenePlugin {

    public platform: Platform | undefined;

    constructor(
        scene: Phaser.Scene,
        pluginManager: Phaser.Plugins.PluginManager
    ) {
        super(scene, pluginManager);
        pluginManager.registerGameObject(
            GAME_OBJECT_TYPE_CHARACTER, this.createCharacter
        );
    }

    public createCharacter(
        x: number, y:number, z:number,
        texture: string | Phaser.Textures.Texture, 
        frame?: string | number,
        runningVelocity: number=400, 
        walkingVelocity: number=100,
        jumpingVelocity: number=200 
    ): Character {
        if (!this.platform) {
            throw new Error('Platform is not created');
        }
        let characater: Character = new Character(
            this.platform, x, y, z, texture, frame, 
            runningVelocity, walkingVelocity, jumpingVelocity
        );
        this.scene.sys.displayList.add(characater.sprite);
        return characater;
    }

    public createPlatform() {
        this.platform = new Platform(this.scene);
    }

}