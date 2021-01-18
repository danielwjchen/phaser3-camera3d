import { getProjection, Vector, Object3D, Projection } from './object3d';
import { Platform } from "./platform";

export class Item {

    private platform: Platform;

    public object3d: Object3D;
    public sprite: Phaser.GameObjects.Sprite;
    public isEnabled: boolean = true;

    constructor(
        platform: Platform,
        x: number, 
        y: number, 
        z: number,
        texture: string | Phaser.Textures.Texture, 
        frame?: string | number,
    ) {
        let projection: Projection = getProjection(x, y + 40, z);
        this.platform = platform;
        this.sprite = new Phaser.GameObjects.Sprite(
            this.platform.scene, 
            platform.originCavansX + projection.x, 
            platform.originCavansY + projection.y, 
            texture, frame
        );
        this.object3d = new Object3D(platform, x, y + 40, z, this.sprite);
        this.object3d.setSpritePosition();
        this.sprite.anims.play('idle')
    }

    public onCollide(force: Vector): void {
        if (force.x === 0 && force.y === 0 && force.z === 0) {
            this.object3d.stop();
        }
    }

}