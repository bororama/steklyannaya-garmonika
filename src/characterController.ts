import { Scene, Mesh, TransformNode, DynamicTexture, ShadowGenerator,
        StandardMaterial, Vector3, ArcRotateCamera, UniversalCamera, Quaternion,
        Ray, Scalar, Plane, MeshBuilder, Color3, Animation, AnimationGroup} from "@babylonjs/core";
import { AdvancedDynamicTexture, InputText, Control, Rectangle, TextBlock } from "@babylonjs/gui"
import { clamp, getFadeOutAnimation } from "./utils";
import { PlayerInput } from "./inputController";



enum Animations { IDLE = 1, JUMP = 2, LAND = 3, RUN = 4 };
enum playerStates { IDLING = 1, JUMPING = 2, RUNNING = 3 };


export class Player extends TransformNode {

    public camera;
    private _camRoot;

    public scene: Scene;
    private _input : PlayerInput;
    private _inputMagnitude;

    private _moveDirection: Vector3;
    private _deltaTime: number = 0;
    private _grounded: Boolean = false;
    private _gravity: Vector3 = new Vector3();
    private _jumpCount: number = 0;

    private _state: number;

    private _animations: AnimationGroup[];
    private _currentAnim: AnimationGroup;
    private _prevAnim: AnimationGroup;


    private static readonly PLAYER_SPEED: number = 0.45;
    private static readonly JUMP_FORCE: number = 0.80;
    private static readonly GRAVITY: number = -2.8;

    //Player
    public mesh: Mesh;
    private _nameLabel: Mesh;


    //Chat-related
    private _bubble : AdvancedDynamicTexture;
    private _messageBox : Rectangle;
    private _messageText : TextBlock;


    constructor(assets: any, scene: Scene, shadowGenerator: ShadowGenerator, input : PlayerInput) {
        super("player", scene);
        this.scene = scene;
        this._setupPlayerCamera();

        this.mesh = assets.mesh;
        this.mesh.parent = this;

        shadowGenerator.addShadowCaster(assets.mesh);

        this._input = input;
        this._animations = assets.animationGroups;
        this._setUpAnimations();
        this._setUpPlayerLabel();
        this._setUpChatBox();
    }

    private _setUpChatBox() {
        let chatBoxTexture = AdvancedDynamicTexture.CreateFullscreenUI("chatbox");

       //chatBoxTexture.vOffset = 0.2;

        let input = new InputText();
        input.width = 0.2;
        input.maxWidth = 0.2;
        input.height = "40px";
        input.text = "";
        input.color = "white";
        input.background = "transparent";
        input.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        input.top = "-10%";
        //console.log("padding : ", input.margin)
        chatBoxTexture.addControl(input);

        this._bubble = AdvancedDynamicTexture.CreateFullscreenUI("bubble");
        this._messageBox = new Rectangle();
        this._messageBox.cornerRadius = 25;
        this._messageBox.thickness = 0;
        //this._messageBox.setPadding(0, 8, 0, 8);
        this._messageBox.background = "white";
        this._messageBox.height = "10%";
        this._messageBox.top = "30%";
        this._messageBox.left = "-5%";
        this._messageBox.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this._messageText = new TextBlock();

        input.onKeyboardEventProcessedObservable.add((eventData) => {
            if (eventData.key === "Enter") {
                // Get the text from the input field
                let message = input.text;
                
                // Do something with the message
                this._say(message);
                
                // Clear the input field
                input.text = "";
            }
        });
    }

    private _say(message : string) {
        //TODO abstract this into a  context (singleton if possible)
        this._messageBox.alpha = 1.0;
        this._messageBox.top = ((Math.random() * (45 - 30)) + 30).toString() + "%";
        this._messageBox.left = ((Math.random() * (5 -(-5))) - 5).toString() + "%";
        console.log("top:", this._messageBox.top);
        this._messageText.text = message;
        this._messageText.color = "black";  // Text color

        this._messageBox.addControl(this._messageText);
        let context = this._bubble.getContext();

        this._messageBox.width = (clamp((context.measureText(message).width + 24), 64, 256).toString() + "px");
        this._bubble.addControl(this._messageBox);
        let fadeOut = new AnimationGroup("fadeOut");
        fadeOut.addTargetedAnimation(getFadeOutAnimation(2000, 1.0, 0), this._messageBox);
        setTimeout(() => {
            fadeOut.play(false);
        }, 1000);
    }


    private _setUpPlayerLabel() {
        this._nameLabel = MeshBuilder.CreatePlane("label", {width: 5, height : 1}, this.scene);
        this._nameLabel.billboardMode = 7; //BILLBOARD_MODE_ALL, always facing the camera
        this._nameLabel.translate(Vector3.Up(), 4);
        this._nameLabel.parent = this.mesh;

        const labelTexture = new DynamicTexture("label-texture", { width: 32 * (5), height : 32}, this.scene);
        const textureContext = labelTexture.getContext();
        const material = new StandardMaterial("mat", this._scene);
        material.diffuseTexture = labelTexture;
        material.diffuseTexture.hasAlpha = true;
        material.emissiveColor = Color3.White();
        this._nameLabel.material = material;

        const font = "bold 16px monospace";
        labelTexture.drawText("fgata-va", (32 * 5) / 2 - textureContext.measureText("fgata-va").width, 16, font, "white", "transparent", true, true);

    }

    private _setUpAnimations(): void {
        this.scene.stopAllAnimations();
        this._animations[Animations.RUN].loopAnimation = true;
        this._animations[Animations.IDLE].loopAnimation = true;
        this._currentAnim = this._animations[Animations.IDLE];
        this._prevAnim = this._animations[Animations.LAND];

    }

    private _switchAnimations(): void {
        switch (this._state) {
            case (playerStates.RUNNING): {
                this._currentAnim = this._animations[Animations.RUN];
                break;
            }
            case playerStates.JUMPING: {
                this._currentAnim = this._animations[Animations.JUMP];
                break;
            }
            default: {
                this._currentAnim = this._animations[Animations.IDLE];
                break;
            }
        }
        if (this._currentAnim !== this._prevAnim) {
            this._prevAnim.stop();
            this._currentAnim.play(this._currentAnim.loopAnimation);
            this._prevAnim = this._currentAnim
        }
    }

    private _setupPlayerCamera(): UniversalCamera {
        this._camRoot = new TransformNode("root");
        this._camRoot.position = new Vector3(0, 0, 0);
        this.camera = new ArcRotateCamera("cam", (2 * Math.PI) - (Math.PI / 2), 1.2, 35, this._camRoot.position, this.scene);
        this.camera.fov = 0.4;
        this.camera.parent = this._camRoot;
        this.scene.activeCamera = this.camera;

        return this.camera;
    }

    private _updateCamera(): void {
        this._camRoot.position =  new Vector3(this.mesh.position.x, this.mesh.position.y + 2, this.mesh.position.z);
        if (this._input.camera !== 0) {
            console.log("rotate this");
            this._camRoot.rotation = new Vector3(this._camRoot.rotation.x, this._camRoot.rotation.y + ((0.6 * this._input.camera) * this._deltaTime));
        }
    }


    public activatePlayerCamera(): UniversalCamera {
        this.scene.registerBeforeRender(() => {

            this._beforeRenderUpdate();
            this._updateCamera();

        })
        return this.camera;
    }

    private _beforeRenderUpdate(): void {
        this._deltaTime = this.scene.getEngine().getDeltaTime() / 1000.0;
        this._processInput();
        this._updateCharacter();
        this._switchAnimations();
    }

    private _processInput() {

        let correctedVertical = this._camRoot.forward.scaleInPlace(this._input.vertical);
        let correctedHorizontal = this._camRoot.right.scaleInPlace(this._input.horizontal);

        this._moveDirection = (correctedHorizontal.addInPlace(correctedVertical).normalize());
        this._inputMagnitude = clamp(Math.abs(this._input.horizontal) + Math.abs(this._input.vertical), 0, 1);
    }

    private _floorRaycast(raycastlen: number): Vector3 {
        let raycastFloorPos = new Vector3(this.mesh.position.x, this.mesh.position.y - 0.05, this.mesh.position.z);
        let ray = new Ray(raycastFloorPos, Vector3.Up().scale(-1), raycastlen);

        let predicate = function (mesh) {
            return mesh.isPickable && mesh.isEnabled();
        }
        let pick = this.scene.pickWithRay(ray, predicate);
        if (pick.hit) {
            return pick.getNormal();
        } else {
            return Vector3.Zero();
        }
    }

    private _isGrounded(): Boolean {
        let rayLen: number = 1;
        let surfaceNormal: Vector3;
        let dotProduct: number;

        surfaceNormal = this._floorRaycast(rayLen);
        if (!surfaceNormal.equals(Vector3.Zero())) {
            dotProduct = Vector3.Dot(surfaceNormal, new Vector3(0, -rayLen, 0).normalize());
            return true;
        }
        return false;
    }


    private _setMeshTransformations() {
        this._moveDirection = this._moveDirection.scaleInPlace(this._inputMagnitude * Player.PLAYER_SPEED);

        if (this._inputMagnitude > 0) {
            let angle = Math.atan2(this._input.horizontal, this._input.vertical);
            angle += this._camRoot.rotation.y;
            let targ = Quaternion.FromEulerAngles(0, angle, 0);
            this.mesh.rotationQuaternion = Quaternion.Slerp(this.mesh.rotationQuaternion, targ, 10 * this._deltaTime);
            if ( this._state !== playerStates.JUMPING) {
                this._state = playerStates.RUNNING;
            }
        }
        else if (this._grounded) {
            this._state = playerStates.IDLING;
        }
        if (this._input.jumping) {
            this._state = playerStates.JUMPING;
        }

    }

    private _addGravity() {
        this._gravity = this._gravity.addInPlace(Vector3.Up().scale(this._deltaTime * Player.GRAVITY));
        this._gravity.y = Math.max(this._gravity.y, -Player.JUMP_FORCE);
        this._grounded = false;
    }

    private _jump() {
        this._state = playerStates.JUMPING;
        this._gravity.y = Player.JUMP_FORCE;
        this._jumpCount--;
    }

    private _groundCharacter() {
        if (this._state !== playerStates.RUNNING)
            this._state = playerStates.IDLING;
        this._gravity.y = 0;
        this._grounded = true;
        this._jumpCount = 1;
        this._input.jumping = false;
    }

    private _updateCharacter() {

        const isGrounded: Boolean = this._isGrounded();

        this._setMeshTransformations();
        if (!isGrounded) {
            this._addGravity();
        }
        else if (this._input.jumping && this._jumpCount > 0){
            this._jump();
        }
        else {
            this._groundCharacter();
        }

        this.mesh.moveWithCollisions(this._moveDirection.addInPlace(this._gravity));
    }
}
