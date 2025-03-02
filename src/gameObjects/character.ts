import "phaser";
import { TILE_SCALE } from "../util/const";
import { BaseScene } from "../scenes/BaseScene";
import { CharacterEvent } from "./dialog";
import { Align } from "../util/align";
import { ICharacterMovement } from "./ICharacterMovement";

export class CharacterConfig 
{
    //frames in Character spritesheet are 0-53 per row

    bodyFrame?: number = 0;

    shirtFrame?: number = 6;

    pantsFrame?: number = 57;

    shoesFrame?: number = 58;

    hairFrame?: number = 19;

    dialog?: CharacterEvent;

    player?: Phaser.Types.Physics.Arcade.ArcadeColliderType;

    overlapCallback?: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback;

    eventKey?: number = 0;

    eventKeyEnd?: number = 0;

    eventName?: string;

    instance?: string;

    movement?: ICharacterMovement;
}

export class Character
{
    public spriteGroup: Phaser.Physics.Arcade.Group;

    public name: string = 'Unknown Name';

    x: number;
    y: number;

    protected created: boolean = false;
    protected destroyed: boolean = false;

    movement?: ICharacterMovement = undefined;

    overlapDialogSprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    collider: Phaser.Physics.Arcade.Collider;
    overlapCollider: Phaser.Physics.Arcade.Collider;

    config: CharacterConfig;

    protected scene: BaseScene;

    constructor(scene: BaseScene, x: number, y: number, name: string, config?: CharacterConfig | undefined | null) 
    {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.name = name;

        if(config === null || config === undefined) {
            config = new CharacterConfig();
        }
        this.config = config;
    }

    create(): Character 
    {       
        let width = parseInt(this.scene.game.config.width.toString());
        let newWidth = width * TILE_SCALE;
        let scale = newWidth / 16;

        this.spriteGroup = this.scene.physics.add.group();
        
        this.spriteGroup.create(0, 0, 'characters', this.config.bodyFrame, true, true).setScale(scale, scale).refreshBody().setPushable(false).setOrigin(0, 0);
        this.spriteGroup.create(0, 0, 'characters', this.config.shirtFrame, true, true).setScale(scale, scale).refreshBody().setPushable(false).setOrigin(0, 0);
        this.spriteGroup.create(0, 0, 'characters', this.config.pantsFrame, true, true).setScale(scale, scale).refreshBody().setPushable(false).setOrigin(0, 0);
        this.spriteGroup.create(0, 0, 'characters', this.config.shoesFrame, true, true).setScale(scale, scale).refreshBody().setPushable(false).setOrigin(0, 0);
        this.spriteGroup.create(0, 0, 'characters', this.config.hairFrame, true, true).setScale(scale, scale).refreshBody().setPushable(false).setOrigin(0, 0);
        
        this.spriteGroup.setXY(this.x, this.y).setOrigin(0, 0); 

        this.overlapDialogSprite = this.scene.physics.add.sprite(this.x, this.y, "transparent", 0);
        this.overlapDialogSprite.setSize(24, 24);
        this.overlapDialogSprite.setPushable(false);
        this.overlapDialogSprite.setOrigin(0, 0);
        
        Align.scaleToGameWidth(this.overlapDialogSprite, TILE_SCALE, this.scene); 

        if(this.config.player) 
        {
            this.collider = this.scene.physics.add.collider(this.config.player, this.spriteGroup);
            this.overlapCollider = this.scene.physics.add.overlap(this.config.player, this.overlapDialogSprite, this.config.overlapCallback);
        }

        this.movement = this.config.movement;

        if(this.movement)
        {
            this.movement.setCharacter(this);
        }

        this.created = true;

        return this;
    }

    applyScaling(obj: Phaser.GameObjects.Sprite, scale: number, scene: Phaser.Scene) 
    {
        let width = parseInt(scene.game.config.width.toString());
        let newWidth = width * scale;

        obj.displayWidth = newWidth;
        obj.scaleY = obj.scaleX;
    }

    setPositionX(x: number) 
    {
        this.spriteGroup.setX(x);
    }

    setPositionY(y: number) 
    {
        this.spriteGroup.setY(y);
    }

    setPosition(x: number, y: number) 
    {
        this.x = x;
        this.y = y;

        this.spriteGroup.setXY(x, y);
        //this.spriteGroup.refresh();
        this.overlapDialogSprite.setPosition(x, y);

        //this.spriteGroup.vel
    }

    getPosition() : Phaser.Math.Vector2
    {
        if(!this.spriteGroup || !this.spriteGroup.children || this.spriteGroup.children.getArray().length == 0)
        {
            return Phaser.Math.Vector2.ZERO;
        }
        
        return new Phaser.Math.Vector2((<any>this.spriteGroup.children.getArray()[0]).x, (<any>this.spriteGroup.children.getArray()[0]).y);
    }

    setVelocity(x: number, y: number)
    {
        if(this.destroyed)
        {
            return;
        }

        this.spriteGroup.setVelocity(x, y);
        this.overlapDialogSprite.setVelocity(x, y);
    }

    getVelocity() : Phaser.Math.Vector2
    {
        if(!this.spriteGroup || !this.spriteGroup.children || this.spriteGroup.children.getArray().length == 0)
        {
            return Phaser.Math.Vector2.ZERO;
        }
        
        return new Phaser.Math.Vector2((<any>this.spriteGroup.children.getArray()[0]).body.velocity.x, (<any>this.spriteGroup.children.getArray()[0]).body.velocity.y);
    }

    isCreated() : boolean 
    {
        return this.created;
    }

    getEventKeyTrigger(): number
    {
        return this.config.eventKey ?? 0;
    }

    getEventKeyEnd(): number
    {
        return this.config.eventKeyEnd ?? 0;
    }

    tearDown() 
    {
        if(this.created && !this.destroyed)
        {
            this.destroyed = true;

            this.collider.destroy();
            this.overlapCollider.destroy();

            if(this.spriteGroup.children)
            {
                this.spriteGroup.clear(true, true);
            }

            this.overlapDialogSprite.destroy();
        }
    }

    update(delta: number) 
    {
        if(this.destroyed)
        {
            return;
        }
        
        this.movement?.update(delta);

        let getVelocity = this.getVelocity();
        this.overlapDialogSprite.setVelocity(getVelocity.x, getVelocity.y);
    }
}