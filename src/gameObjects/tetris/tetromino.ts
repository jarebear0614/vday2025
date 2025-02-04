import { TetrominoWallKickData } from "./tetrominoFactory";

export enum RotationState
{
    /// The rotation state from the default rotation to the clockwise rotation
    Kick_0R, 
    
    /// The rotation state from the right clockwise rotation state to the default rotation state
    Kick_R0, 
    
    /// The clockwise rotation state to the state of rotation that is 2 rotations from the default state. That is, either two clock wise rotations or two counter clock wise rotations
    Kick_R2, 
    
    /// The 2 rotation state to the clockwise rotations tate
    Kick_2R, 
    
    /// The 2 rotation state to the counter clockwise rotation state
    Kick_2L, 
    
    /// The counter clockwise rotation state to the 2 rotation state
    Kick_L2, 
    
    /// The counter clockwise state to the default rotation state
    Kick_L0, 
    
    /// The default rotation state moving to the counter clockwise rotation state. That is, one counter clockwise from the default took place
    Kick_0L
}

export class TetrominoTransform implements Phaser.GameObjects.Components.Transform
{
    scene: Phaser.Scene;
    tetromino: Tetromino;
    group: Phaser.Physics.Arcade.StaticGroup;    

    hasTransformComponent: boolean;
    x: number;
    y: number;
    z: number;
    w: number;
    scale: number;
    scaleX: number;
    scaleY: number;
    angle: number;
    rotation: number;

    constructor(scene: Phaser.Scene, tetromino: Tetromino, inX?: number, inY?: number)
    {
        this.scene = scene;
        this.tetromino = tetromino;
        this.x = inX ?? 0;
        this.y = inY ?? 0;

        this.group = this.scene.physics.add.staticGroup();
        
        for(let i = 0; i < 4; ++i)
        {
            let mino = this.tetromino.get(i);
            this.group.create(mino.x * 32, mino.y * 32, 'minos', tetromino.getTetrominoType());
        }

        this.setPosition(this.x, this.y);
    }

    setPosition(x?: number, y?: number, z?: number, w?: number): this {
        this.x = x ?? 0;
        this.y = y ?? this.x;

        let childrenArray = this.group.children.getArray();
        for(let i = 0; i < childrenArray.length; ++i) 
        {
            let child = <unknown>childrenArray[i] as Phaser.GameObjects.Components.Transform;
            let mino = this.tetromino.get(i);
            child.setPosition(this.x + mino.x * 32, this.y + mino.y * 32);
        }

        return this;
    }

    copyPosition(source: Phaser.Types.Math.Vector2Like | Phaser.Types.Math.Vector3Like | Phaser.Types.Math.Vector4Like): this {
        throw new Error("Method not implemented.");
    }
    setRandomPosition(x?: number, y?: number, width?: number, height?: number): this {
        throw new Error("Method not implemented.");
    }
    setRotation(radians?: number): this {
        throw new Error("Method not implemented.");
    }
    setAngle(degrees?: number): this {
        throw new Error("Method not implemented.");
    }
    setScale(x?: number, y?: number): this {
        throw new Error("Method not implemented.");
    }
    setX(value?: number): this {
        this.x = value ?? 0;
        this.group.setX(this.x);
        return this;
    }
    setY(value?: number): this {
        this.y = value ?? 0;
        this.group.setY(this.y);
        return this;
    }
    setZ(value?: number): this {
        throw new Error("Method not implemented.");
    }
    setW(value?: number): this {
        throw new Error("Method not implemented.");
    }
    getLocalTransformMatrix(tempMatrix?: Phaser.GameObjects.Components.TransformMatrix): Phaser.GameObjects.Components.TransformMatrix {
        throw new Error("Method not implemented.");
    }
    getWorldTransformMatrix(tempMatrix?: Phaser.GameObjects.Components.TransformMatrix, parentMatrix?: Phaser.GameObjects.Components.TransformMatrix): Phaser.GameObjects.Components.TransformMatrix {
        throw new Error("Method not implemented.");
    }
    getLocalPoint(x: number, y: number, point?: Phaser.Math.Vector2, camera?: Phaser.Cameras.Scene2D.Camera): Phaser.Math.Vector2 {
        throw new Error("Method not implemented.");
    }
    getParentRotation(): number {
        throw new Error("Method not implemented.");
    }
}

export class Tetromino
{
    private rotationMatrix: Phaser.Math.Vector2[][];

    private currentRotation: number = 0;

    private currentRotationState: RotationState;

    private wallKickData: TetrominoWallKickData;

    private tetrominoType: number;

    public transform: TetrominoTransform;

    constructor(scene: Phaser.Scene, rotationMatrix: Phaser.Math.Vector2[][], wallKickData: TetrominoWallKickData, type: number)
    {
        this.rotationMatrix = rotationMatrix;
        this.wallKickData = wallKickData;
        this.tetrominoType = type;
        this.transform = new TetrominoTransform(scene, this);
    }

    public get(i: number): Phaser.Math.Vector2
    {
        return this.rotationMatrix[this.currentRotation][i];
    }

    public getWallKickData(): TetrominoWallKickData
    {
        return this.wallKickData;
    }

    public getTetrominoType(): number
    {
        return this.tetrominoType;
    }

    public getRotationMatrix(): Phaser.Math.Vector2[][]
    {
        return this.rotationMatrix;
    }

    public rotateClockwise()
    {
        switch (this.currentRotation)
        {
            case 0:
                this.currentRotationState = RotationState.Kick_0R;
                break;
            case 1:
                this.currentRotationState = RotationState.Kick_R2;
                break;
            case 2:
                this.currentRotationState = RotationState.Kick_2L;
                break;
            case 3:
                this.currentRotationState = RotationState.Kick_L0;
                break;
        }

        this.currentRotation = ++this.currentRotation % this.rotationMatrix.length;
    }

    public rotateCounterClockwise()
    {
        switch (this.currentRotation)
        {
            case 0:
                this.currentRotationState = RotationState.Kick_0L;
                break;
            case 1:
                this.currentRotationState = RotationState.Kick_L2;
                break;
            case 2:
                this.currentRotationState = RotationState.Kick_2R;
                break;
            case 3:
                this.currentRotationState = RotationState.Kick_R0;
                break;
        }

        if (--this.currentRotation == -1)
            this.currentRotation = 3;
    }

    public resetRotation()
    {
        this.currentRotation = 0;
    }

    public getMinoAtPosition(mino: number)
    {
        return this.get(mino);
    }

    public getRotationState()
    {
        return this.currentRotationState;
    }
}