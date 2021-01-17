import { Character, GAME_OBJECT_TYPE_CHARACTER } from "./character";
import { CuboidBounds, getProjection, Projection, Vector } from "./object3d";
import { Platform } from "./platform";

export const PLUGIN_PLATFORMER: string = 'PlatformerPlugin';

function isOutOfBounds(platform: Platform, cuboidBounds: CuboidBounds): boolean {
    if (
        cuboidBounds.minX < platform.x 
        // || object3d.minY < platform.y 
        || cuboidBounds.minZ < platform.z
    ) {
        return true;
    }

    if (
        cuboidBounds.maxX > (platform.x + platform.lengthInPixels)
        || cuboidBounds.maxZ > (platform.z + platform.widthInPixels)
    ) {
        return true;
    }

    return false;
}

function getBoundsOverlap(platform: Platform, cuboidBounds: CuboidBounds): Vector {
    let result: Vector = new Vector();
    if (cuboidBounds.minX < platform.x) {
        result.x = platform.x - cuboidBounds.minX;
    } 
    if (cuboidBounds.maxX > platform.maxX) {
        result.x = platform.maxX - cuboidBounds.maxX;
    }
    if (cuboidBounds.minZ < platform.z) {
        result.z = platform.z - cuboidBounds.minZ;
    } 
    if (cuboidBounds.maxZ > platform.maxZ) {
        result.z = platform.maxZ - cuboidBounds.maxZ;
    }
    if (cuboidBounds.minY < platform.y) {
        result.y = platform.y - cuboidBounds.minY;
    } 

    return result;
}

export class PlatformerPlugin extends Phaser.Plugins.ScenePlugin {

    public platform: Platform | undefined;
    public characters: Character[] = [];
    private graphics: Phaser.GameObjects.Graphics[] = [];

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
                this.characters.forEach(character => {
                    let nextPosition: Vector = 
                        character.object3d.getNextPosition();
                    let nextPositionCuboidBounds: CuboidBounds =
                        character.object3d.getCuboidBounds(
                            nextPosition.x, nextPosition.y, nextPosition.z
                        );
                    let isOutOfBound: boolean = false;
                    if (this.platform) {
                        let boundsOverlap: Vector = getBoundsOverlap(
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
                        character.onCollide(emptyCollideVector);
                    }
                    character.object3d.update(
                        nextPosition.x, nextPosition.y, nextPosition.z
                    );
                    character.object3d.drawCollisionBox();
                    character.object3d.drawCoordinatesText();
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
            this.platform, 
            x * this.platform.tileSizeInPixel, 
            y * this.platform.tileSizeInPixel, 
            z * this.platform.tileSizeInPixel,
            texture, frame, 
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