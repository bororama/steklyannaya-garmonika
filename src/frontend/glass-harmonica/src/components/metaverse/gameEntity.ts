import { Scene, Mesh, TransformNode, DynamicTexture, ShadowGenerator,
    StandardMaterial, Vector3, ArcRotateCamera, UniversalCamera, Quaternion,
    Ray, Scalar, Plane, MeshBuilder, Color3, Animation, AnimationGroup} from "@babylonjs/core";
import { AdvancedDynamicTexture, InputText, Control, Rectangle, TextBlock } from "@babylonjs/gui"
import { clamp, getFadeOutAnimation, extent, type BoundingRect } from './utils'


enum Animations { IDLE = 1, JUMP = 2, LAND = 3, RUN = 4 };
enum playerStates { SPEAKING = 0, IDLING = 1, JUMPING = 2, RUNNING = 3 };
enum bubbleStates {INVISIBLE = 0, VISIBLE = 1}


/*
** A GameEntity has a variable position, an associated mesh with animations, a name and a dialogue bubble.
** It represents every living being in the metaverse.
*/
export class GameEntity extends TransformNode {

    public mesh: Mesh;
    public name : string;
    private _animations : AnimationGroup[];
    private _previousAnimation : AnimationGroup;
    private _currentAnimation : AnimationGroup;
    private _nameLabel: Mesh;

    //Chat-related
    private _bubble : Rectangle;
    private _messageText : TextBlock;
    private _bubbleState : number;
    private _bubbleDuration : number;

    constructor (assets : any, scene: Scene, name : string, type : string) {

        super("GameEntity", scene);
        this.name = name;
        this.mesh = assets.mesh;
        this._setUpMesh(type);
        this._animations = assets.animationGroups;
        if (this._animations.length) {
            this._previousAnimation  = this._animations[Animations.LAND];
            this._currentAnimation = this._animations[Animations.IDLE];
            console.log("animatiions ", this._animations);
            this._animations[Animations.RUN].loopAnimation = true;
            this._animations[Animations.IDLE].loopAnimation = true;
            this._currentAnimation.play(true);
        }
        this._bubbleState = bubbleStates.INVISIBLE;
        this._bubble = new Rectangle();
        this._messageText = new TextBlock();
        this._setUpBubble();
        this._nameLabel = MeshBuilder.CreatePlane("label", {width: 5, height : 1}, scene);
        this._setUpLabel();
    }

    private _setUpMesh(type : string) {
        const metadata = {tag : 'GameEntity', name : this.name, type : type};
        this.mesh.metadata = metadata;
        this.mesh.getChildMeshes().forEach( (m) => {
            m.metadata = metadata;
        });
    }

    private _setUpBubble() {
        this._bubble.cornerRadius = 12;
        this._bubble.thickness = 0;
        this._bubble.setPadding(0, 8, 0, 8);
        this._bubble.background = "white";
        this._bubble.height = "10%";
        this._bubble.top = "30%";
        this._bubble.left = "-5%";
        this._bubble.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this._bubble.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this._bubble.alpha = 0;
        //this._bubbleTexture.addControl(this._bubble);
        //this._bubble.addControl(this._messageText);
    }

    private _setUpLabel() {
        this._nameLabel.billboardMode = 7; //BILLBOARD_MODE_ALL, always facing the camera
        this._nameLabel.translate(Vector3.Up(), 4);
        this._nameLabel.isPickable = false;
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
        this.mesh.position = newPosition;
    }

    updateRotation(newRotation : Quaternion) {
        this.mesh.rotationQuaternion = newRotation;
    }


    /* this is terribly inefficient,
    only the identifying state numbers should be compared, and then
    the corresponding animation should be loaded from the this._animations array */
    updateAnimation(newState : number) {

        let currentAnimationState;

        switch (newState) {
            case (playerStates.RUNNING): {
                currentAnimationState = Animations.RUN;
                break;
            }
            case playerStates.JUMPING: {
                currentAnimationState = Animations.JUMP;
                break;
            }
            default: {
                currentAnimationState = Animations.IDLE;
                break;
            }
        }
        this._previousAnimation = this._currentAnimation;
        this._currentAnimation =  this._animations[currentAnimationState];
        if ( this._currentAnimation !== this._previousAnimation) {
            this._previousAnimation.stop();
            this._currentAnimation.play(this._currentAnimation.loopAnimation);
        }
    }

    updateMesh(newPosition : Vector3, newRotation : Quaternion, newState : number) {
        this.updatePosition(newPosition);
        this.updateRotation(newRotation);
        this.updateAnimation(newState);
    }

    say(message : string) {
        let bubbleTexture = AdvancedDynamicTexture.CreateFullscreenUI("bubble");
        bubbleTexture.removeControl(this._bubble);
        this._bubble.removeControl(this._messageText);
        this._bubble.alpha = 1.0;
        const r : BoundingRect = this._getClientRectFromMesh();
        this._determineBubblePosition(r);
        this._determineBubbleFontSize(r);
        this._messageText.textWrapping = 1;
        this._messageText.text = message;
        this._messageText.color = "black";
        this._messageText.resizeToFit = true;
        this._bubble.adaptHeightToChildren = true;
        this._bubble.addControl(this._messageText);
        let context = bubbleTexture.getContext();
        this._bubble.width = (clamp((context.measureText(message).width + 24), 64, 1024).toString() + "px");
        //this._bubble.height = (this._messageText.fontSizeInPixels * 2).toString() + "px";
        bubbleTexture.addControl(this._bubble);
       // let fadeOut = new AnimationGroup("fadeOut");
       // this._bubbleState = bubbleStates.VISIBLE;
       // fadeOut.addTargetedAnimation(getFadeOutAnimation(2000, 1.0, 0), this._bubble);
       // fadeOut.onAnimationGroupEndObservable.add( () => {
       //     this._bubbleState = bubbleStates.INVISIBLE;
       // });
        setTimeout(async () => {
            //fadeOut.play(false);
            bubbleTexture.removeControl(this._bubble);
        }, 750);
    }

    private _determineBubblePosition(r : BoundingRect) {
        const canvas = super.getScene().getEngine().getRenderingCanvas();

        this._bubble.top = ((Math.random() * (6) + ((r.top / canvas!.clientHeight) * 100) - 16).toString() + "%");
        this._bubble.left = ((Math.random() * (5) + ((r.left / canvas!.clientWidth) * 100)).toString() + "%");
    }

    private _determineBubbleFontSize(r : BoundingRect) {
        const canvas  = super.getScene().getEngine().getRenderingCanvas();
        const boundingRectArea : number = r.width * r.height;
        const canvasArea : number = canvas!.clientWidth * canvas!.clientHeight;
        const proportion : number = boundingRectArea / canvasArea;
        const fontSize : number = clamp(1024 * ((proportion) - Math.pow(proportion / 2, 2)), 8, 22);
        this._messageText.fontSize = fontSize;
    }

    private _getClientRectFromMesh(): BoundingRect {
        const canvas = super.getScene().getEngine().getRenderingCanvas();
        const meshVectors = this.mesh.getBoundingInfo().boundingBox.vectors
        const worldMatrix = this.mesh.getWorldMatrix()
        const transformMatrix = super.getScene().getTransformMatrix()
        const viewport = super.getScene().activeCamera!.viewport
        const coordinates = meshVectors.map(v => {
          const proj = Vector3.Project(v, worldMatrix, transformMatrix, viewport)
          proj.x = proj.x * canvas!.clientWidth;
          proj.y = proj.y * canvas!.clientHeight;
          return proj
        })
        const [minX, maxX] = extent(coordinates, c => c.x);
        const [minY, maxY] = extent(coordinates, c => c.y);
        const rect: BoundingRect = {
          width: maxX - minX,
          height: maxY - minY,
          left: minX,
          top: minY,
          right: maxX,
          bottom: maxY,
        }
        console.table(rect);
        return rect;
      }
    
}