import { CuboidBounds, Object3D, Vector } from "./object3d";
import { Platform } from "./platform";

export class MovableDirections {
    constructor(
        public up: boolean = true,
        public down: boolean = true,
        public left: boolean = true,
        public right: boolean = true,
        public forward: boolean = true,
        public backward: boolean = true,
    ) {}
};

export class CollisionItem {

    constructor(
        public object3d: Object3D,
        public currentPosition: Vector,
        public nextPosition: Vector,
        public movableDirections: MovableDirections,
    ) {}

    public getNextPositionCuboidBounds(): CuboidBounds {
        return this.object3d.getCuboidBounds(
            this.nextPosition.x, this.nextPosition.y, this.nextPosition.z
        );
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
    public x: number;
    public y: number;
    public z: number;

    constructor(a: CuboidBounds, b: CuboidBounds) {
        this.x = getOverlap(a.minX, a.maxX, b.minX, b.maxX);
        this.y = getOverlap(a.minY, a.maxY, b.minY, b.maxY);
        this.z = getOverlap(a.minZ, a.maxZ, b.minZ, b.maxZ);
    }

    get isOverlapping(): boolean {
        return this.x !== 0 && this.y !== 0 && this.z !==0;
    }
}

function getPositionAfterCollision(
    currentPosition: Vector, nextPosition: Vector, overlap: Overlap 
): Vector {
    const diff: Vector = nextPosition.getDifference(
        currentPosition.x, currentPosition.y, currentPosition.z
    );
    const result: Vector = nextPosition.copy();
    if (diff.y > 0) {
        // going UP
        result.y -= (overlap.y + 1);
    } else if (diff.y < 0) {
        // going DOWN
        result.y += (overlap.y + 1);
    }

    if (diff.z > 0) {
        // going LEFT
        result.z -= (overlap.z + 1);
    } else if (diff.z < 0) {
        // going RIGHT
        result.z += (overlap.z + 1);
    }

    if (diff.x > 0) {
        // going FORWARD
        result.x -= (overlap.x + 1);
    } else if (diff.x < 0) {
        // going BACKWARD
        result.x += (overlap.x + 1);
    }


    return result;
}

export function getMovableDirectionsWithWorld(
    world: Platform, cuboidBounds: CuboidBounds
): MovableDirections {
    const movableDirections: MovableDirections = new MovableDirections();
    if (cuboidBounds.minX <= world.x) {
        movableDirections.backward = false;
    }
    if (cuboidBounds.maxX >= world.maxX) {
        movableDirections.forward = false;
    }
    if (cuboidBounds.minZ < world.z) {
        movableDirections.right = false;
    }
    if (cuboidBounds.maxZ >= world.maxZ) {
        movableDirections.left = false;
    }
    if (cuboidBounds.minY <= world.y) {
        movableDirections.down = false;
    }

    return movableDirections;
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
            const nextPosition: Vector = object3d.getNextPosition();
            const nextPositionCuboidBounds: CuboidBounds =
                object3d.getCuboidBounds(
                    nextPosition.x, nextPosition.y, nextPosition.z
                );
            const overlapWithWorld: Vector = 
                getBoundsOverlapWithWorld(world, nextPositionCuboidBounds);
            const item: CollisionItem = new CollisionItem(
                object3d,
                object3d.getCurrentPosition(),
                nextPosition,
                getMovableDirectionsWithWorld(world, nextPositionCuboidBounds),
            );
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
        if (object3dList.length < 2) {
            return [];
        }
        let itemUuidMap: CollisionItemUuidMapping = {};
        this.getCollisionWithWorld(world, object3dList).forEach(item => {
            itemUuidMap[item.object3d.uuid] = item;
        });

        object3dList.forEach(a => {
            object3dList.filter(item => item.uuid !== a.uuid).forEach(b => {
                const collisionKeyA: string = a.uuid + b.uuid;
                const collisionKeyB: string = b.uuid + a.uuid;
                if (collisionKeyA in collisionMapping || collisionKeyB in collisionMapping) {
                    return;
                }
                const collisionItemA: CollisionItem = itemUuidMap[a.uuid];
                const collisionItemB: CollisionItem = itemUuidMap[b.uuid];
                const cuboidBoundsA: CuboidBounds = 
                    collisionItemA.getNextPositionCuboidBounds();
                const cuboidBoundsB: CuboidBounds = 
                    collisionItemB.getNextPositionCuboidBounds();
                const overlap: Overlap = 
                    new Overlap(cuboidBoundsA, cuboidBoundsB);
                if (!overlap.isOverlapping) {
                    return;
                }
                collisionItemA.nextPosition = getPositionAfterCollision(
                    collisionItemA.currentPosition,
                    collisionItemA.nextPosition,
                    overlap
                );
                if (
                    !collisionItemB.movableDirections.up
                    || !collisionItemB.movableDirections.up
                ) {
                    collisionItemB.object3d.velocity.y = 0;
                }
                collisionItemB.nextPosition = getPositionAfterCollision(
                    collisionItemB.currentPosition,
                    collisionItemB.nextPosition,
                    overlap
                );
                if (
                    !collisionItemA.movableDirections.up
                    || !collisionItemA.movableDirections.down
                ) {
                    collisionItemB.object3d.velocity.y = 0;
                }
                collisionMapping[collisionKeyA] = collisionItemA;
                collisionMapping[collisionKeyB] = collisionItemB;

                // result[collisionKeyA] = {
                //     object3d: a,
                //     overlap: overlapA,
                //     currentPosition: currentPositionA,
                //     nextPosition: overlapA ? getPositionAfterCollision(
                //         currentPositionA, nextPositionA, overlapA
                //     ) : nextPositionA,
                //     movableDirections: new MovableDirections(),
                // };
                // result[collisionKeyB] = {
                //     object3d: b,
                //     overlap: overlapB,
                //     currentPosition: currentPositionB,
                //     nextPosition: overlapB ? getPositionAfterCollision(
                //         currentPositionB, nextPositionB, overlapB
                //     ) : nextPositionB,
                //     movableDirections: new MovableDirections(),
                // };
            });
        });
        return Object.values(itemUuidMap);
    }

}