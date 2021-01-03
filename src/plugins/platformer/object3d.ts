export class Object3D {

    public sprite: Phaser.GameObjects.Sprite;

    private _z: number = 0;

    set z(value: number) {
        this._z = value;
        this.sprite.depth = value * -1;
    }

    get z(): number {
        return this._z;
    }

    constructor(
        scene: Phaser.Scene,
        x: number, y: number, z: number, 
        texture: string | Phaser.Textures.Texture, frame: string | number
    ) {
        this.sprite = new Phaser.GameObjects.Sprite(scene, x, y, texture, frame);
        this.z = z;
    }

}