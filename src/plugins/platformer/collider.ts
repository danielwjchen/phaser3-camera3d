import { CuboidBounds, Object3D, Vector, MovableDirections, getDistance, sortObject3dListByDistance } from "./object3d";
import { Platform } from "./platform";

export class CollisionItem {
    public currentPosition: Vector;
    public nextPosition: Vector;
    public diffPosition: Vector;

    constructor(
        public object3d: Object3D,
    ) {
        this.currentPosition = this.object3d.getCurrentPosition();
        this.nextPosition = this.object3d.getNextPosition();
        this.diffPosition = this.nextPosition.getDifference(
            this.currentPosition.x, this.currentPosition.y, this.currentPosition.z
        );
    }

    public getNextPositionCuboidBounds(): CuboidBounds {
        return this.object3d.getCuboidBounds(
            this.nextPosition.x, this.nextPosition.y, this.nextPosition.z
        );
    }

    public getCurrentPositionCuboidBounds(): CuboidBounds {
        return this.object3d.getCuboidBounds(
            this.currentPosition.x, this.currentPosition.y, this.currentPosition.z
        );
    }

    public setNextPositionAfterCollision(
        overlap: Overlap, movableDirections: MovableDirections,
        isCollidingX: boolean, isCollidingY: boolean, isCollidingZ: boolean
    ): Vector {
        if (
            this.diffPosition.x === 0 
            && this.diffPosition.y === 0 
            && this.diffPosition.z === 0
        ) {
            return this.nextPosition;
        }
        if (isCollidingY) {
            if (this.diffPosition.y > 0) {
                // going UP
                this.nextPosition.y -= (overlap.y + 1);
                this.object3d.movableDirections.up = movableDirections.up;
            } else if (this.diffPosition.y < 0) {
                // going DOWN
                this.nextPosition.y += (overlap.y + 1);
                this.object3d.movableDirections.down = movableDirections.down;
            }
            return this.nextPosition;
        }

        if (isCollidingZ) {
            if (this.diffPosition.z > 0) {
                // going LEFT
                this.nextPosition.z -= (overlap.z + 1);
                this.object3d.movableDirections.left = movableDirections.left;
            } else if (this.diffPosition.z < 0) {
                // going RIGHT
                this.nextPosition.z += (overlap.z + 1);
                this.object3d.movableDirections.right = movableDirections.right;
            }
            return this.nextPosition;
        }

        if (isCollidingX) {
            if (this.diffPosition.x > 0) {
                // going FORWARD
                this.nextPosition.x -= (overlap.x + 1);
                this.object3d.movableDirections.forward = movableDirections.forward;
            } else if (this.diffPosition.x < 0) {
                // going BACKWARD
                this.nextPosition.x += (overlap.x + 1);
                this.object3d.movableDirections.backward = movableDirections.backward;
            }
            return this.nextPosition;
        }

        return this.nextPosition;
    }

    public setMovableDirectionsWithWorld(
        world: Platform, cuboidBounds: CuboidBounds
    ): void {
        this.object3d.movableDirections.backward = cuboidBounds.minX > world.x;
        this.object3d.movableDirections.forward = cuboidBounds.maxX < world.maxX;
        this.object3d.movableDirections.right = cuboidBounds.minZ > world.z;
        this.object3d.movableDirections.left = cuboidBounds.maxZ < world.maxZ;
        this.object3d.movableDirections.down = cuboidBounds.minY > world.y;
        // there is no ceiling, yet
        this.object3d.movableDirections.up = true;
    }
}

export type CollisionItemUuidMapping = {
    [key: string]: CollisionItem,
};

export type CollisionMapping = {[key: string]: CollisionItem};

function getOverlap(
    aMin: number, aMax: number, bMin: number, bMax: number
): number {
    if (aMin <= bMin && bMin <= aMax && aMax <= bMax) {
        //   |-------------|
        // aMin          aMax
        //            |-------------|
        //          bMin          bMax
        return aMax - bMin;

    } else if (bMin <= aMin && aMax <= bMax) {
        //     |-------------|
        //   aMin          aMax
        //   |-----------------|
        // bMin              bMax
        return aMax - aMin;

    } else if (bMin <= aMin && aMin <= bMax && bMax <= aMax) {
        //               |-------------|
        //             aMin          aMax
        //    |-------------|
        //  bMin          bMax
        return bMax - aMin;
    } 

    return 0;
}

class Overlap {
    private _x: number;
    private _y: number;
    private _z: number;

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    get z(): number {
        return this._z;
    }

    constructor(a: CuboidBounds, b: CuboidBounds) {
        this._x = getOverlap(a.minX, a.maxX, b.minX, b.maxX);
        this._y = getOverlap(a.minY, a.maxY, b.minY, b.maxY);
        this._z = getOverlap(a.minZ, a.maxZ, b.minZ, b.maxZ);
    }

    get isOverlapping(): boolean {
        return this._x !== 0 && this._y !== 0 && this._z !==0;
    }
}

function getIsCollidingX(a: CuboidBounds, b: CuboidBounds): boolean {
    return (
        a.minX >= b.maxX  || a.maxX <= b.minX
        && 0 !== getOverlap(a.minZ, a.maxZ, b.minZ, b.maxZ)
        && 0 !== getOverlap(a.minY, a.maxY, b.minY, b.maxY)
    );
}

function getIsCollidingY(a: CuboidBounds, b: CuboidBounds): boolean {
    return (
        a.minY >= b.maxY || a.maxY <= b.minY
        && 0 !== getOverlap(a.minZ, a.maxZ, b.minZ, b.maxZ)
        && 0 !== getOverlap(a.minX, a.maxX, b.minX, b.maxX)
    );
}

function getIsCollidingZ(a: CuboidBounds, b: CuboidBounds): boolean {
    return (
        a.minZ >= b.maxZ || a.maxZ <= b.minZ
        && 0 !== getOverlap(a.minX, a.maxX, b.minX, b.maxX)
        && 0 !== getOverlap(a.minY, a.maxY, b.minY, b.maxY)
    );
}

export function getBoundsOverlapWithWorld(
    world: Platform, cuboidBounds: CuboidBounds
): Vector {
    const overlap: Vector = new Vector();
    if (cuboidBounds.minX < world.x) {
        overlap.x = world.x - cuboidBounds.minX;
    } 
    if (cuboidBounds.maxX > world.maxX) {
        overlap.x = world.maxX - cuboidBounds.maxX;
    }
    if (cuboidBounds.minZ < world.z) {
        overlap.z = world.z - cuboidBounds.minZ;
    } 
    if (cuboidBounds.maxZ > world.maxZ) {
        overlap.z = world.maxZ - cuboidBounds.maxZ;
    }
    if (cuboidBounds.minY < world.y) {
        overlap.y = world.y - cuboidBounds.minY;
    } 

    return overlap;
}

export class Collider {

    constructor() {}

    public getCollisionWithWorld(
        world: Platform, object3dList: Object3D[]
    ): CollisionItem[] {
        const result: CollisionItem[] = object3dList.map(object3d => {
            const item: CollisionItem = new CollisionItem(object3d);
            const nextPositionCuboidBounds: CuboidBounds =
                item.getNextPositionCuboidBounds();
            const overlapWithWorld: Vector = 
                getBoundsOverlapWithWorld(world, nextPositionCuboidBounds);
            item.setMovableDirectionsWithWorld(world, nextPositionCuboidBounds);
            item.nextPosition.x += overlapWithWorld.x;
            item.nextPosition.y += overlapWithWorld.y;
            item.nextPosition.z += overlapWithWorld.z;

            const isOutOfBound: boolean = (
                overlapWithWorld.x !== 0 
                || overlapWithWorld.y !== 0 
                || overlapWithWorld.z !== 0
            );
            if (isOutOfBound) {
                // this is where "bounce" logic goes
                item.object3d.onCollision(new Vector(0, 0, 0));
            }
            return item;
        });
        return result;
    }

    public getCollisionMapping(
        world: Platform, object3dList: Object3D[]
    ): CollisionItem[] {
        let collisionMapping: CollisionMapping = {};
        let itemUuidMap: CollisionItemUuidMapping = {};
        this.getCollisionWithWorld(world, object3dList).forEach(item => {
            itemUuidMap[item.object3d.uuid] = item;
        });

        object3dList.forEach(a => {
            const objectsToCollide: Object3D[] =  object3dList.filter(
                item => item.uuid !== a.uuid
            );
            sortObject3dListByDistance(objectsToCollide, a)
            objectsToCollide.forEach(b => {
                const collisionKeyA: string = a.uuid + b.uuid;
                const collisionKeyB: string = b.uuid + a.uuid;
                if (
                    collisionKeyA in collisionMapping 
                    || collisionKeyB in collisionMapping
                ) {
                    return;
                }
                const collisionItemA: CollisionItem = itemUuidMap[a.uuid];
                const collisionItemB: CollisionItem = itemUuidMap[b.uuid];
                const cuboidBoundsANextPosition: CuboidBounds = 
                    collisionItemA.getNextPositionCuboidBounds();
                const cuboidBoundsBNextPosition: CuboidBounds = 
                    collisionItemB.getNextPositionCuboidBounds();
                const overlap: Overlap = new Overlap(
                    cuboidBoundsANextPosition, cuboidBoundsBNextPosition
                );
                if (!overlap.isOverlapping) {
                    return;
                }
                const cuboidBoundsACurrentPosition: CuboidBounds = 
                    collisionItemA.getCurrentPositionCuboidBounds();
                const cuboidBoundsBCurrentPosition: CuboidBounds = 
                    collisionItemB.getCurrentPositionCuboidBounds();
                const isCollidingX: boolean = getIsCollidingX(
                    cuboidBoundsACurrentPosition, cuboidBoundsBCurrentPosition
                );
                const isCollidingY: boolean = getIsCollidingY(
                    cuboidBoundsACurrentPosition, cuboidBoundsBCurrentPosition
                );
                const isCollidingZ: boolean = getIsCollidingZ(
                    cuboidBoundsACurrentPosition, cuboidBoundsBCurrentPosition
                );
                collisionItemA.setNextPositionAfterCollision(
                    overlap, collisionItemB.object3d.movableDirections, 
                    isCollidingX, isCollidingY, isCollidingZ
                );
                collisionItemB.setNextPositionAfterCollision(
                    overlap, collisionItemA.object3d.movableDirections, 
                    isCollidingX, isCollidingY, isCollidingZ
                );
                collisionMapping[collisionKeyA] = collisionItemA;
                collisionMapping[collisionKeyB] = collisionItemB;
            });
        });
        return Object.values(itemUuidMap);
    }

}