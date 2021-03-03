import { Character, GAME_OBJECT_TYPE_CHARACTER } from "./character";
import { Collider, CollisionItem, getBoundsOverlapWithWorld } from "./collider";
import { Item } from "./item";
import { CuboidBounds, getProjection, Object3D, Projection, Vector } from "./object3d";
import { Platform } from "./platform";

export const PLUGIN_PLATFORMER: string = 'PlatformerPlugin';

export class PlatformerPlugin extends Phaser.Plugins.ScenePlugin {

    public platform: Platform | undefined;
    public characters: Character[] = [];
    public items: Item[] = [];
    public object3ds: Object3D[] = [];
    private graphics: Phaser.GameObjects.Graphics[] = [];
    private collider: Collider = new Collider();

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
                if (!this.platform) {
                    return;
                }
                let collisionItems: CollisionItem[] = 
                    this.collider.getCollisionMapping(this.platform, this.object3ds);
                collisionItems.forEach(item => {
                    item.object3d.update(
                        item.nextPosition.x,
                        item.nextPosition.y,
                        item.nextPosition.z,
                        item.movableDirections
                    );
                });
                this.object3ds.forEach(object3d => {
                    object3d.drawCollisionBox();
                    object3d.drawCoordinatesText();
                })
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
            this.platform, 
            x * this.platform.tileSizeInPixel, 
            y * this.platform.tileSizeInPixel, 
            z * this.platform.tileSizeInPixel,
            texture, frame, 
            runningVelocity, walkingVelocity, jumpingVelocity
        );
        this.object3ds.push(characater.object3d);
        this.characters.push(characater);
        this.scene.sys.displayList.add(characater.sprite);
        return characater;
    }

    public createItem(
        x: number, y:number, z:number,
        texture: string | Phaser.Textures.Texture, 
        frame?: string | number
    ): Item {
        if (!this.platform) {
            throw new Error('Platform is not created');
        }
        let item: Item = new Item(
            this.platform, 
            x * this.platform.tileSizeInPixel, 
            y * this.platform.tileSizeInPixel, 
            z * this.platform.tileSizeInPixel,
            texture, frame, 
        );
        this.object3ds.push(item.object3d);
        this.items.push(item);
        this.scene.sys.displayList.add(item.sprite);
        return item;
    }

    public createPlatform(
        x: number, y:number, z:number,
        width: number, length: number
    ): Platform {
        this.platform = new Platform(this.scene, x, y, z, width, length);
        return this.platform;
    }

    public createCircile(
        x: number, y: number, z: number, 
        radius: number = 2, color: number = 0xffef00
    ) {
        if (!this.platform) {
            throw new Error('Platform is not created');
        }
        let projection: Projection = getProjection(
            x * this.platform.tileSizeInPixel, 
            y * this.platform.tileSizeInPixel, 
            z * this.platform.tileSizeInPixel
        );
        let graphics: Phaser.GameObjects.Graphics = this.scene.add.graphics({
            x: this.platform.originCavansX + projection.x, 
            y: this.platform.originCavansY + projection.y,
            fillStyle: { color: color } 

        });
        let center: Phaser.Geom.Circle = new Phaser.Geom.Circle(
            0, 0, radius
        );
        graphics.fillCircleShape(center);
        this.graphics.push(graphics);
    }

}