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

function isOverlapping(a: CuboidBounds, b: CuboidBounds): boolean {
    return (a.minX <= b.maxX && a.maxX >= b.minX)
        && (a.minY <= b.maxY && a.maxY >= b.minY)
        && (a.minZ <= b.maxZ && a.maxZ >= b.minZ);
}

function getBoundsOverlap(
    currentPositionA: Vector, cuboidBoundsA: CuboidBounds, 
    currentPositionB: Vector, cuboidBoundsB: CuboidBounds
): Vector {
    const result: Vector = new Vector();
    if (currentPositionA.x > currentPositionB.x) {
        if (cuboidBoundsA.minX < cuboidBoundsB.maxX) {
            result.x = cuboidBoundsB.maxX - cuboidBoundsA.minX + 1;
        }
    } else if (currentPositionA.x < currentPositionB.x) {
        if (cuboidBoundsA.maxX >= cuboidBoundsB.minX) {
            result.x = cuboidBoundsA.maxX - cuboidBoundsB.minX - 1;
        }
    }
    if (currentPositionA.y > currentPositionB.y) {
        if (cuboidBoundsA.minY < cuboidBoundsB.maxY) {
            result.y = cuboidBoundsB.maxY - cuboidBoundsA.minY + 1;
        }
    } else if (currentPositionA.y < currentPositionB.y) {
        if (cuboidBoundsA.maxY >= cuboidBoundsB.minY) {
            result.y = cuboidBoundsA.maxY - cuboidBoundsB.minY - 1;
        }
    }
    if (currentPositionA.z > currentPositionB.z) {
        if (cuboidBoundsA.minZ < cuboidBoundsB.maxZ) {
            result.z = cuboidBoundsB.maxZ - cuboidBoundsA.minZ + 1;
        }
    } else if (currentPositionA.z < currentPositionB.z) {
        if (cuboidBoundsA.maxZ >= cuboidBoundsB.minZ) {
            result.z = cuboidBoundsA.maxZ - cuboidBoundsB.minZ - 1;
        }
    }
    // if (cuboidBoundsA.minX <= cuboidBoundsB.maxX && cuboidBoundsA.maxX > cuboidBoundsB.maxX) {
    //     result.x = cuboidBoundsA.minX - (cuboidBoundsB.maxX + 1);
    // } else if (cuboidBoundsA.maxX >= cuboidBoundsB.minX) {
    //     result.x = cuboidBoundsA.maxX - (cuboidBoundsB.minX - 1);
    // } 
    // if (cuboidBoundsA.minZ <= cuboidBoundsB.maxZ && cuboidBoundsA.maxZ > cuboidBoundsB.maxZ) {
    //     result.z = cuboidBoundsA.minZ - (cuboidBoundsB.maxZ + 1);
    // } else if (cuboidBoundsA.maxZ >= cuboidBoundsB.minZ) {
    //     result.z = cuboidBoundsA.maxZ - (cuboidBoundsB.minZ - 1);
    // } 
    // if (cuboidBoundsA.minY <= cuboidBoundsB.maxY && cuboidBoundsA.maxY > cuboidBoundsB.maxY) {
    //     result.y = (cuboidBoundsA.minY - (cuboidBoundsB.maxY + 1)) * -1;
    // } else if (cuboidBoundsA.maxY >= cuboidBoundsB.minY) {
    //     result.y = cuboidBoundsA.maxY - (cuboidBoundsB.minY - 1);
    // } 

    return result;
}

function getPositionAfterCollision(
    currentPosition: Vector, nextPosition: Vector, overlap: Vector
): Vector {
    const diff: Vector = nextPosition.getDifference(
        currentPosition.x, currentPosition.y, currentPosition.z
    );
    const result: Vector = nextPosition.copy();
    if (diff.y !== 0) {
        result.y += overlap.y;
    }

    if (diff.z !== 0) {
        result.z -= overlap.z;
    }

    if (diff.x !== 0) {
        result.x -= overlap.x;
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
                const doesOverlapFlag: boolean = isOverlapping(cuboidBoundsA, cuboidBoundsB);
                const overlapA: Vector | null = doesOverlapFlag ? getBoundsOverlap(
                    collisionItemA.currentPosition, cuboidBoundsA, 
                    collisionItemB.currentPosition, cuboidBoundsB
                ) : null;
                const overlapB: Vector | null = doesOverlapFlag ? getBoundsOverlap(
                    collisionItemB.currentPosition, cuboidBoundsB, 
                    collisionItemA.currentPosition, cuboidBoundsA
                ) : null;
                if (overlapA !== null) {
                    collisionItemA.nextPosition = getPositionAfterCollision(
                        collisionItemA.currentPosition,
                        collisionItemA.nextPosition,
                        overlapA
                    );
                    if (
                        !collisionItemB.movableDirections.up
                        || !collisionItemB.movableDirections.up
                    ) {
                        collisionItemB.object3d.velocity.y = 0;
                    }
                }
                if (overlapB !== null) {
                    collisionItemB.nextPosition = getPositionAfterCollision(
                        collisionItemB.currentPosition,
                        collisionItemB.nextPosition,
                        overlapB
                    );
                    if (
                        !collisionItemA.movableDirections.up
                        || !collisionItemA.movableDirections.down
                    ) {
                        collisionItemB.object3d.velocity.y = 0;
                    }
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