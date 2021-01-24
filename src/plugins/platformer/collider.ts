import { CuboidBounds, Object3D, Vector } from "./object3d";

export type CollisionItem = {
    object3d: Object3D,
    overlap: Vector,
    nextPosition: Vector,
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
    if (a.minY >= b.maxY) {
        result.y = a.minY - (b.maxY + 1);
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
        result.y -= overlap.y;
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

export class Collider {

    public getCollisionMapping(object3dList: Object3D[]): CollisionItem[] {
        let result: CollisionMapping = {};
        if (object3dList.length < 2) {
            return [];
        }
        object3dList.forEach((a, index) => {
            if (result[a.uuid]) {
                return;
            }
            let nextPositionA: Vector = 
                a.getNextPosition();
            let cuboidBoundsA: CuboidBounds = a.getCuboidBounds(
                nextPositionA.x, nextPositionA.y, nextPositionA.z
            );
            object3dList.slice(index + 1).forEach(b => {
                let nextPositionB: Vector = 
                    b.getNextPosition();
                let cuboidBoundsB: CuboidBounds = b.getCuboidBounds(
                    nextPositionB.x, nextPositionB.y, nextPositionB.z
                );

                if (!doesOverlap(cuboidBoundsA, cuboidBoundsB)) {
                    return;
                }
                let overlapA: Vector = getBoundsOverlap(
                    cuboidBoundsA, cuboidBoundsB
                );
                result[a.uuid] = {
                    object3d: a,
                    overlap: overlapA,
                    nextPosition: getPositionAfterCollision(
                        a.getCurrentPosition(), nextPositionA, overlapA
                    ),
                };
                let overlapB: Vector = getBoundsOverlap(
                    cuboidBoundsB, cuboidBoundsA
                );
                result[b.uuid] = {
                    object3d: b,
                    overlap: overlapB,
                    nextPosition: getPositionAfterCollision(
                        b.getCurrentPosition(), nextPositionB, overlapB
                    ),
                };
            });
        });
        return Object.values(result);
    }

}