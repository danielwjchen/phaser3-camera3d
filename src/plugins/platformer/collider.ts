import { Object3D, Vector } from "./object3d";

export interface ICollider {

    isEnabled: boolean;
    object3d: Object3D;

    onCollide(force: Vector): void;

}