
export const PLATFORMER_PLUGIN: string = 'PlatFormerPlugin';

export class PlatformerPlugin extends Phaser.Plugins.ScenePlugin {

    constructor(
        scene: Phaser.Scene,
        pluginManager: Phaser.Plugins.PluginManager
    ) {
        super(scene, pluginManager);
    }
}