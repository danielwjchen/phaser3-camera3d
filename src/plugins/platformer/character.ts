import * as  Phaser from 'phaser';
import { Platform } from './platform';
import { getProjection, Vector, Object3D, Projection } from './object3d';

export enum Direction {
    Up,
    Right,
    Down,
    Left,
}

/**
 * Defines how long the character stays down when kocked out.
 */
let knockOutDelay: number = 3000;

/**
 * Defines how long the character "blinks" after knocked out.
 */
let blinkDelay: number = 5000;

/**
 * Defines how often the character "blinks".
 */
let blinkFrequency: number = 10;


export type Command = {[key in keyof typeof Direction]: boolean};

export type STATUS_ATTACK =
    'right_punch' | 'left_punch' |  'left_kick' | 'right_kick';

export type status = 'stand' | 'jump' | 'guard' | 'guard_attacked' | 'attack' |
    STATUS_ATTACK | 'fly' | 
    'falling_forward' | 'falling_backward' | 'walk' | 'run' ;

export const GAME_OBJECT_TYPE_CHARACTER: string = 'character';

export class Character {

    private currentStatus: status = 'stand';
    private directionX: Direction.Right | Direction.Left;
    private directionZ: Direction.Up | Direction.Down | null = null;
    private physicsBody: Phaser.Physics.Arcade.Body | undefined;
    private attackSequence: STATUS_ATTACK[] = [
        'right_punch',
        'left_punch',
        'left_kick',
        'right_kick',
    ];
    private nextAttackSequence: STATUS_ATTACK | null = null;
    private runningVelocity: number;
    private walkingVelocity: number;
    private jumpingVelocity: number;
    private platform: Platform;
    private isFlipped: boolean = false;

    public object3d: Object3D;
    public sprite: Phaser.GameObjects.Sprite;
    public isEnabled: boolean = true;

    constructor(
        platform: Platform,
        x: number, 
        y: number, 
        z: number,
        texture: string | Phaser.Textures.Texture, 
        frame?: string | number,
        runningVelocity: number=40, 
        walkingVelocity: number=8,
        jumpingVelocity: number=8
    ) {
        let projection: Projection = getProjection(x, y + 40, z);
        this.platform = platform;
        this.sprite = new Phaser.GameObjects.Sprite(
            this.platform.scene, 
            platform.originCavansX + projection.x, 
            platform.originCavansY + projection.y, 
            texture, frame
        );
        this.object3d = new Object3D(platform, x, y + 40, z, this.sprite);
        this.object3d.setSpritePosition();
        this.directionX = Direction.Right;
        this.runningVelocity = runningVelocity;
        this.walkingVelocity = walkingVelocity;
        this.jumpingVelocity = jumpingVelocity;
        // platform.scene.physics.world.enable(this.sprite);
        // platform.scene.add.existing(this.sprite);
        // this.physicsBody = this.sprite.body as Phaser.Physics.Arcade.Body;
        // this.physicsBody.setCollideWorldBounds(true);
        // this.physicsBody.allowGravity = false;
        this.object3d.collisionCallback = (force: Vector) => {
            this.onCollide(force);
        };
        this.fly();
    }

    /**
     * Tells character to stand
     */
    public stand(): void {
        if (this.isKnockedOut()) {
            return;
        }
        this.nextAttackSequence = null;
        // this.physicsBody.stop();
        this.object3d.stop();
        this.currentStatus = 'stand';
        this.sprite.anims.play(this.currentStatus);
    }

    private getVelocity(command: Command, isRunning: boolean): number {
        let velocity: number = 
            isRunning
            ? this.runningVelocity
            : this.walkingVelocity;
        if (
            (command.Right || command.Left) &&
            (command.Down || command.Up)
        ) {
            velocity = velocity / 2;
        }
        return velocity;
    }

    private isKnockedOut(): boolean {
        return [
            'falling_forward', 
            'falling_backward',
        ].includes(this.currentStatus);
    }

    private setFlipped(isFlipped: boolean) {
        if (this.isFlipped !== isFlipped) {
            this.sprite.flipX = !this.sprite.flipX;
        }
        this.isFlipped = isFlipped;
    }

    private changeDirection(command: Command) {
        if (command.Right && command.Down) {
            this.setFlipped(false);
        } else if (
            command.Left || command.Down
        ) {
            this.setFlipped(true);
        } else if (command.Right || command.Up) {
            this.setFlipped(false);
        }
        if (command.Right) {
            this.directionX = Direction.Right;
        } else if (command.Left) {
            this.directionX = Direction.Left;
        }
        if (command.Up) {
            this.directionZ = Direction.Up;
        } else if (command.Down) {
            this.directionZ = Direction.Down;
        }
    }

    private onAttackAnimationComplete() {
        if ((this.attackSequence as string[]).includes(this.sprite.anims.getName())) {
            if (
                this.nextAttackSequence === null ||
                this.sprite.anims.getName() === this.nextAttackSequence
            ) {
                this.nextAttackSequence = null;
                this.stand();
            } else {
                this.currentStatus = this.nextAttackSequence;
                this.nextAttackSequence = null;
                this.sprite.anims.play(this.currentStatus).once(
                    'animationcomplete',
                    () => {
                        this.onAttackAnimationComplete();
                    }
                );
            }
        }
    }

    private isInAir() {
        return -1 !== ['fly', 'jump'].indexOf(this.currentStatus);
    }

    /**
     * Commands character to go.
     */
    public go(command: Command, isRunning: boolean = false): void {
        this.nextAttackSequence = null;
        if (this.isKnockedOut() || this.isInAir()) {
            return;
        }
        if (this.currentStatus === 'guard') {
            this.changeDirection(command);
            return;
        }
        let hasDirection: boolean = 
            Object.values(command).reduce((
                accumulator: boolean, 
                currentValue: boolean
                ) => {
                return accumulator || currentValue;
            });
        if (!hasDirection) {
            if (this.currentStatus !== 'stand') {
                this.stand();
            }
            return;
        }
        this.changeDirection(command);
        this.currentStatus = isRunning ? 'run' : 'walk';
        this.sprite.anims.play(this.currentStatus, true);
        let velocity = this.getVelocity(command, isRunning);
        let velocityX: number = 0;
        if (command.Right) {
            this.directionX = Direction.Right;
            velocityX += velocity;
        } else if (command.Left) {
            this.directionX = Direction.Left;
            velocityX -= velocity;
        }
        let velocityZ: number = 0;
        if (command.Up) {
            this.directionZ = Direction.Up;
            velocityZ += velocity;
        }
        if (command.Down) {
            this.directionZ = Direction.Down;
            velocityZ -= velocity;
        }
        if (velocityX === 0 && velocityZ === 0) {
            this.stand();
        } else {
            // this.physicsBody.setVelocity(
            //     velocityX, velocityZ
            // );
            this.object3d.velocity.x = velocityX;
            this.object3d.velocity.z = velocityZ;
        }
    }


    public jump() {
        if (this.isKnockedOut() || this.isInAir()) {
            return;
        }
        this.nextAttackSequence = null;
        this.currentStatus = 'jump';
        this.sprite.anims.play(this.currentStatus).once('animationcomplete',  () => {
            if (this.sprite.anims.getName() === 'jump') {
                this.object3d.velocity.y = this.jumpingVelocity;
                this.fly();
            }
        });
    }

    public fly() {
        this.currentStatus = 'fly';
        this.sprite.anims.play(this.currentStatus);
    }

    public attack() {
        let currentAttackSequenceIndex: number = 
            (this.attackSequence as string[]).indexOf(this.currentStatus);
        if (
            currentAttackSequenceIndex === -1 && 
            !['walk', 'stand', 'run'].includes(this.currentStatus)
        ) {
            return;
        }
        let attackSequence: STATUS_ATTACK = this.attackSequence[0];
        if (
            currentAttackSequenceIndex !== -1 &&
            (currentAttackSequenceIndex + 1) < this.attackSequence.length
        ) {
            attackSequence = this.attackSequence[currentAttackSequenceIndex + 1];
        }
        if (!(this.attackSequence as string[]).includes(this.sprite.anims.getName())) {
            let velocity: number = this.walkingVelocity / 2;
            if (this.directionX === Direction.Left) {
                velocity *= -1;

            }
            // this.physicsBody.setVelocityX(velocity);
            this.object3d.velocity.x = velocity;
            this.currentStatus = attackSequence;
            this.sprite.anims.play(this.currentStatus).once(
                'animationcomplete',  
                () => {
                    this.onAttackAnimationComplete();
                }
            );
        } else {
            this.nextAttackSequence = attackSequence;
        }
    }

    public attacked(damage: number, directionX: Direction): void {
        if (this.isKnockedOut()) {
            return;
        }
        let isAttackedFromBehind = this.directionX === directionX;
        if (this.currentStatus === 'guard' && !isAttackedFromBehind) {
            this.currentStatus = 'guard_attacked';
            if (directionX === Direction.Right) {
                // this.physicsBody.setVelocityX(this.walkingVelocity * 0.25);
                this.object3d.velocity.x = this.walkingVelocity * 0.25;
            } else {
                // this.physicsBody.setVelocityX(this.walkingVelocity * -0.25);
                this.object3d.velocity.x = this.walkingVelocity * -0.25;
            }
            this.sprite.anims.play(this.currentStatus).once('animationcomplete', () => {
                // this.physicsBody.setVelocityX(0);
                this.object3d.velocity.x = 0;
                if (this.sprite.anims.getName() !== 'guard_attacked') {
                    return;
                }
                this.guard();
            });
        } else {
            if (directionX === Direction.Right) {
                // this.physicsBody.setVelocityX(this.walkingVelocity);
                this.object3d.velocity.x = this.walkingVelocity;
                if (this.directionX === Direction.Right) {
                    this.currentStatus = 'falling_forward'
                } else {
                    this.currentStatus = 'falling_backward'
                }
            } else {
                // this.physicsBody.setVelocityX(this.walkingVelocity * -1);
                this.object3d.velocity.x = this.walkingVelocity * -1;
                if (this.directionX === Direction.Right) {
                    this.currentStatus = 'falling_backward'
                } else {
                    this.currentStatus = 'falling_forward'
                }
            }
            this.sprite.anims.play(this.currentStatus).once('animationcomplete', () => {
                this.nextAttackSequence = null;
                // this.physicsBody.stop();
                this.object3d.stop();
                this.sprite.scene.time.addEvent({
                    delay: knockOutDelay,
                    callback: () => {
                        this.stand()
                        this.nextAttackSequence = null;
                        this.object3d.stop();
                        this.currentStatus = 'stand';
                        this.sprite.anims.play(this.currentStatus);
                    },
                });
            });
        }
    }

    public guard() {
        if (this.isKnockedOut()) {
            return;
        }
        this.nextAttackSequence = null;
        this.object3d.stop();
        this.currentStatus = 'guard';
        this.sprite.anims.play(this.currentStatus);
    }

    public onCollide(force: Vector): void {
        if (force.x === 0 && force.y === 0 && force.z === 0) {
            this.object3d.stop();
            if (!this.isKnockedOut()) {
                this.stand();
            }
            if (
                this.currentStatus === 'jump' 
                && this.object3d.y ===  this.sprite.height / 2
            ) {
                this.stand();
            }
        }

    }

}