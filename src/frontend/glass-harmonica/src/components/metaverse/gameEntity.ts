import { Scene, Mesh, TransformNode, DynamicTexture, ShadowGenerator,
    StandardMaterial, Vector3, ArcRotateCamera, UniversalCamera, Quaternion,
    Ray, Scalar, Plane, MeshBuilder, Color3, Animation, AnimationGroup} from "@babylonjs/core";
import { AdvancedDynamicTexture, InputText, Control, Rectangle, TextBlock } from "@babylonjs/gui"


enum Animations { IDLE = 1, JUMP = 2, LAND = 3, RUN = 4 };
enum playerStates { SPEAKING = 0, IDLING = 1, JUMPING = 2, RUNNING = 3 };
enum bubbleStates {INVISIBLE = 0, VISIBLE = 1}

export class GameEntity extends TransformNode {
    public mesh: Mesh;
    public name : string;
    private _animations : AnimationGroup;
    private _nameLabel: Mesh;

    //Chat-related
    private _bubbleTexture : AdvancedDynamicTexture;
    private _bubble : Rectangle;
    private _messageText : TextBlock;
    private _bubbleState : number;

    constructor (assets : any, scene: Scene, name : string) {
        super("GameEntity", scene);
        this.mesh = assets.mesh;
        this.name = name;
        this._animations = assets.animationGroups;
        this._bubbleState = bubbleStates.INVISIBLE;
        this._bubbleTexture = AdvancedDynamicTexture.CreateFullscreenUI("bubble");
        this._bubble = new Rectangle();
        this._messageText = new TextBlock();
        this._setUpBubble();
        this._nameLabel = MeshBuilder.CreatePlane("label", {width: 5, height : 1}, scene);
        this._setUpLabel();
    }

    private _setUpBubble() {
        this._bubble.cornerRadius = 25;
        this._bubble.thickness = 0;
        this._bubble.setPadding(0, 8, 0, 8);
        this._bubble.background = "white";
        this._bubble.height = "10%";
        this._bubble.top = "30%";
        this._bubble.left = "-5%";
        this._bubble.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this._bubble.alpha = 0;
        this._bubbleTexture.addControl(this._bubble);
    }

    private _setUpLabel() {
        this._nameLabel.billboardMode = 7; //BILLBOARD_MODE_ALL, always facing the camera
        this._nameLabel.translate(Vector3.Up(), 4);
        this._nameLabel.parent = this.mesh;

        const labelTexture = new DynamicTexture("label-texture", { width: 32 * (5), height : 32}, this._scene);
        const textureContext = labelTexture.getContext();
        const material = new StandardMaterial("mat", this._scene);
        material.diffuseTexture = labelTexture;
        material.diffuseTexture.hasAlpha = true;
        material.emissiveColor = Color3.White();
        this._nameLabel.material = material;

        const font = "bold 16px monospace";
        labelTexture.drawText(
            this.name, 
            (32 * 5) / 2 - textureContext.measureText(this.name).width, 
            16, 
            font, 
            "white", 
            "transparent", 
            true, 
            true
        );
    }

    updatePosition(newPosition : Vector3) {
        console.log("mesh.pos>>", this.mesh.position);
        console.log("mesh>>", this.mesh);
        this.mesh.position = newPosition;
    }
}