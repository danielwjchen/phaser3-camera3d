import { CuboidBounds, Object3D, Vector } from "./object3d";

export type CollisionMapping = {[key: string]: Object3D};

function doesOverlap(a: CuboidBounds, b: CuboidBounds): boolean {
    return (a.minX <= b.maxX && a.maxX >= b.minX)
        && (a.minY <= b.maxY && a.maxY >= b.minY)
        && (a.minZ <= b.maxZ && a.maxZ >= b.minZ);
}

function getBoundsOverlap(a: CuboidBounds, b: CuboidBounds): Vector {
    let result: Vector = new Vector();
    if (b.maxX < a.minX) {
        result.x = a.minX - b.maxX;
    } 
    if (b.maxX > a.maxX) {
        result.x = a.maxX - b.maxX;
    }
    if (b.minZ < a.minZ) {
        result.z = a.minZ - b.minZ;
    } 
    if (b.maxZ > a.maxZ) {
        result.z = a.maxZ - b.maxZ;
    }
    if (b.maxY < a.minY) {
        result.y = a.minY - b.minY;
    } 
    if (b.minY < a.minY) {
        result.y = a.minY - b.minY;
    } 

    return result;
}

export class Collider {

    public getCollisionMapping(object3dList: Object3D[]): CollisionMapping {
        let result: CollisionMapping = {};
        if (object3dList.length < 2) {
            return result;
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
                if (doesOverlap(cuboidBoundsA, cuboidBoundsB)) {
                    result[a.uuid] = b;
                    result[b.uuid] = a;
                }
            });
        });
        return result;
    }

}