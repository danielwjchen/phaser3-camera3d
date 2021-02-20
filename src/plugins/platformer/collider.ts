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

export type CollisionItem = {
    object3d: Object3D,
    overlap: Vector | null,
    currentPosition: Vector,
    nextPosition: Vector,
    movableDirections: MovableDirections,
};

export type CollisionItemUuidMapping = {
    [key: string]: CollisionItem,
};

export type CollisionMapping = {[key: string]: CollisionItem};

function doesOverlap(a: CuboidBounds, b: CuboidBounds): boolean {
    return (a.minX <= b.maxX && a.maxX >= b.minX)
        && (a.minY <= b.maxY && a.maxY >= b.minY)
        && (a.minZ <= b.maxZ && a.maxZ >= b.minZ);
}

function getBoundsOverlap(a: CuboidBounds, b: CuboidBounds): Vector {
    let result: Vector = new Vector();
    if (a.minX <= b.maxX && a.maxX > b.maxX) {
        result.x = a.minX - (b.maxX + 1);
    } else if (a.maxX >= b.minX) {
        result.x = a.maxX - (b.minX - 1);
    } 
    if (a.minZ <= b.maxZ && a.maxZ > b.maxZ) {
        result.z = a.minZ - (b.maxZ + 1);
    } else if (a.maxZ >= b.minZ) {
        result.z = a.maxZ - (b.minZ - 1);
    } 
    if (a.minY <= b.maxY && a.maxY > b.maxY) {
        result.y = (a.minY - (b.maxY + 1)) * -1;
    } else if (a.maxY >= b.minY) {
        result.y = a.maxY - (b.minY - 1);
    } 

    return result;
}

function getPositionAfterCollision(
    currentPosition: Vector, nextPosition: Vector, overlap: Vector
): Vector {
    let diff: Vector = nextPosition.getDifference(
        currentPosition.x, currentPosition.y, currentPosition.z
    );
    let result: Vector = nextPosition.copy();
    if (diff.y !== 0) {
        result.y += overlap.y;
        return result;
    }

    if (diff.z !== 0) {
        result.z -= overlap.z;
        return result;
    }

    if (diff.x !== 0) {
        result.x -= overlap.x;
        return result;
    }


    return result;
}

export function getBoundsOverlapWithWorld(
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

export class Collider {

    constructor() {}

    public getCollisionWithWorld(
        world: Platform, object3dList: Object3D[]
    ): CollisionItem[] {
        let result: CollisionItem[] = object3dList.map(object3d => {
            let nextPosition: Vector = object3d.getNextPosition();
            let nextPositionCuboidBounds: CuboidBounds =
                object3d.getCuboidBounds(
                    nextPosition.x, nextPosition.y, nextPosition.z
                );
            let overlapWithWorld: Vector = getBoundsOverlapWithWorld(
                world, nextPositionCuboidBounds
            );
            let item: CollisionItem = {
                object3d: object3d,
                overlap: overlapWithWorld,
                currentPosition: object3d.getCurrentPosition(),
                nextPosition: nextPosition,
                movableDirections: {
                    up: true,
                    down: true,
                    left: true,
                    right: true,
                    forward: true,
                    backward: true,
                },

            }
            let isOutOfBound: boolean = false;
            // if (overlapWithWorld.x > ) {
            //     item.movableDirections.forward 

            // } else if (overlapWithWorld.x < 0) {
            //     item.movableDirections.backward = false;
            // }
            // if (overlapWithWorld.y > 0) {

            // } else if (overlapWithWorld.y < 0) {

            // }
            // if (overlapWithWorld.z > 0) {

            // } else if (overlapWithWorld.z < 0) {

            // }
            isOutOfBound = (
                overlapWithWorld.x !== 0 
                || overlapWithWorld.y !== 0 
                || overlapWithWorld.z !== 0
            );
            item.nextPosition.x += overlapWithWorld.x;
            item.nextPosition.y += overlapWithWorld.y;
            item.nextPosition.z += overlapWithWorld.z;

            // this is where "bounce" logic goes
            if (isOutOfBound) {
                item.object3d.onCollision(new Vector(0, 0, 0));
            }
            return item;
        });
        return result;
    }

    private getPositionsAndBounds(
        object3d: Object3D, immovableItemsMap: CollisionItemUuidMapping
    ): [Vector, Vector, CuboidBounds] {
        if (immovableItemsMap[object3d.uuid]) {
            return [
                immovableItemsMap[object3d.uuid].currentPosition,
                immovableItemsMap[object3d.uuid].nextPosition,
                object3d.getCuboidBounds(
                    immovableItemsMap[object3d.uuid].nextPosition.x,
                    immovableItemsMap[object3d.uuid].nextPosition.y,
                    immovableItemsMap[object3d.uuid].nextPosition.z
                ),
            ]
        }
        let nextPosition: Vector = object3d.getNextPosition();
        return [
            object3d.getCurrentPosition(),
            nextPosition,
            object3d.getCuboidBounds(
                nextPosition.x, nextPosition.y, nextPosition.z
            )
        ];

    }

    public getCollisionMapping(
        world: Platform, object3dList: Object3D[]
    ): CollisionItem[] {
        let result: CollisionMapping = {};
        if (object3dList.length < 2) {
            return [];
        }
        let immovableItemsMap: CollisionItemUuidMapping = {};
        this.getCollisionWithWorld(world, object3dList).forEach(item => {
            immovableItemsMap[item.object3d.uuid] = item;
        });

        object3dList.forEach(a => {
            let [
                currentPositionA, nextPositionA, cuboidBoundsA,
            ] = this.getPositionsAndBounds(a, immovableItemsMap);

            object3dList.filter(item => item.uuid !== a.uuid).forEach(b => {
                let collisionKeyA: string = a.uuid + b.uuid;
                let collisionKeyB: string = b.uuid + a.uuid;
                if (collisionKeyA in result || collisionKeyB in result) {
                    return;
                }
                let [
                    currentPositionB, nextPositionB, cuboidBoundsB,
                ] = this.getPositionsAndBounds(b, immovableItemsMap);

                let doesOverlapFlag: boolean = doesOverlap(cuboidBoundsA, cuboidBoundsB);
                let overlapA: Vector | null = doesOverlapFlag ? getBoundsOverlap(
                    cuboidBoundsA, cuboidBoundsB
                ) : null;
                result[collisionKeyA] = {
                    object3d: a,
                    overlap: overlapA,
                    currentPosition: currentPositionA,
                    nextPosition: overlapA ? getPositionAfterCollision(
                        currentPositionA, nextPositionA, overlapA
                    ) : nextPositionA,
                    movableDirections: {
                        up: true,
                        down: true,
                        left: true,
                        right: true,
                        forward: true,
                        backward: true,
                    },
                };
                let overlapB: Vector | null = doesOverlapFlag ? getBoundsOverlap(
                    cuboidBoundsB, cuboidBoundsA
                ) : null;
                result[collisionKeyB] = {
                    object3d: b,
                    overlap: overlapB,
                    currentPosition: currentPositionB,
                    nextPosition: overlapB ? getPositionAfterCollision(
                        currentPositionB, nextPositionB, overlapB
                    ) : nextPositionB,
                    movableDirections: {
                        up: true,
                        down: true,
                        left: true,
                        right: true,
                        forward: true,
                        backward: true,
                    },
                };
            });
        });
        return Object.values(result);
    }

}