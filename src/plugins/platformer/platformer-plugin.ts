import { Character, GAME_OBJECT_TYPE_CHARACTER } from "./character";
import { Collider, CollisionItem } from "./collider";
import { Item } from "./item";
import { CuboidBounds, getProjection, Object3D, Projection, Vector } from "./object3d";
import { Platform } from "./platform";

export const PLUGIN_PLATFORMER: string = 'PlatformerPlugin';

function getBoundsOverlapWithWorld(
    world: Platform, cuboidBounds: CuboidBounds
): Vector {
    let result: Vector = new Vector();
    if (cuboidBounds.minX < world.x) {
        result.x = world.x - cuboidBounds.minX;
    } 
    if (cuboidBounds.maxX > world.maxX) {
        result.x = world.maxX - cuboidBounds.maxX;
    }
    if (cuboidBounds.minZ < world.z) {
        result.z = world.z - cuboidBounds.minZ;
    } 
    if (cuboidBounds.maxZ > world.maxZ) {
        result.z = world.maxZ - cuboidBounds.maxZ;
    }
    if (cuboidBounds.minY < world.y) {
        result.y = world.y - cuboidBounds.minY;
    } 

    return result;
}

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
        let emptyCollideVector = new Vector(0, 0, 0);
        this.scene.events.once(Phaser.Scenes.Events.READY, () => {
            this.scene.events.on(Phaser.Scenes.Events.UPDATE, () => {
                this.object3ds.forEach(object3d => {
                    let nextPosition: Vector = 
                        object3d.getNextPosition();
                    let nextPositionCuboidBounds: CuboidBounds =
                        object3d.getCuboidBounds(
                            nextPosition.x, nextPosition.y, nextPosition.z
                        );
                    let isOutOfBound: boolean = false;
                    if (this.platform) {
                        let boundsOverlap: Vector = getBoundsOverlapWithWorld(
                            this.platform, nextPositionCuboidBounds
                        );
                        isOutOfBound = (
                            boundsOverlap.x !== 0 
                            || boundsOverlap.y !== 0 
                            || boundsOverlap.z !== 0
                        );
                        nextPosition.x += boundsOverlap.x;
                        nextPosition.y += boundsOverlap.y;
                        nextPosition.z += boundsOverlap.z;
                    }
                    if (isOutOfBound) {
                        object3d.onCollision(emptyCollideVector);
                    }
                    object3d.update(
                        nextPosition.x, nextPosition.y, nextPosition.z
                    );
                });
                let collisionItems: CollisionItem[] = 
                    this.collider.getCollisionMapping(this.object3ds);
                collisionItems.forEach(item => {
                    if (item.nextPosition.equals(
                        item.currentPosition.x, item.currentPosition.y, 
                        item.currentPosition.z
                    )) {
                        return;
                    }
                    item.object3d.update(
                        item.nextPosition.x,
                        item.nextPosition.y,
                        item.nextPosition.z,
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