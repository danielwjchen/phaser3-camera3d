import { Character, GAME_OBJECT_TYPE_CHARACTER } from "./character";

export const PLUGIN_PLATFORMER: string = 'PlatformerPlugin';

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
}