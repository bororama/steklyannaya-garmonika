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
    private _animations : AnimationGroup;
    private _nameLabel: Mesh;

    //Chat-related
    private _bubbleTexture : AdvancedDynamicTexture;
    private _bubble : Rectangle;
    private _messageText : TextBlock;
    private _bubbleState : number;

    constructor (assets : any, scene: Scene, name : string) {

        super("GameEntity", scene);
        //this.mesh = assets.mesh;
        this.mesh = MeshBuilder.CreateBox("test", { width: 2, depth: 2, height: 3 });
        this.mesh.isPickable = false;
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
        this.mesh.position = newPosition;
    }

    updateRotation(newRotation : Quaternion) {
        this.mesh.rotationQuaternion = newRotation;
    }

    updateMesh(newPosition : Vector3, newRotation : Quaternion) {
        this.updatePosition(newPosition);
        this.updateRotation(newRotation);
    }

    say(message : string) {
        this._bubble.alpha = 1.0;
        this._determineBubblePosition();
        this._messageText.text = message;
        this._messageText.color = "black";
        this._bubble.addControl(this._messageText);
        let context = this._bubbleTexture.getContext();

        this._bubble.width = (clamp((context.measureText(message).width + 24), 64, 256).toString() + "px");
        let fadeOut = new AnimationGroup("fadeOut");
        this._bubbleState = bubbleStates.VISIBLE;
        fadeOut.addTargetedAnimation(getFadeOutAnimation(2000, 1.0, 0), this._bubble);
        fadeOut.onAnimationGroupEndObservable.add( () => {
            this._bubbleState = bubbleStates.INVISIBLE;
        });
        setTimeout(async () => {
            fadeOut.play(false);
        }, 1000);
    }

    private _determineBubblePosition() {
        const canvas = super.getScene().getEngine().getRenderingCanvas();
        const r : BoundingRect = this._getClientRectFromMesh();

        console.log("top :", r.top, "height: ", canvas!.clientHeight)
        console.log("what is this : ", ((r.top / canvas!.clientHeight) * 100));
        this._bubble.top = ((Math.random() * (1)) + ((r.top / canvas!.clientHeight) * 100).toString() + "%");
        this._bubble.left = ((Math.random() * (5 -(-5))) - r.left).toString() + "%";
    }

    private _getClientRectFromMesh(): BoundingRect {
        const canvas = super.getScene().getEngine().getRenderingCanvas();
        const meshVectors = this.mesh.getBoundingInfo().boundingBox.vectors
        const worldMatrix = this.mesh.getWorldMatrix()
        const transformMatrix = super.getScene().getTransformMatrix()
        const viewport = super.getScene().activeCamera!.viewport
    
        // loop though all the vectors and project them against the current camera viewport to get a set of coordinates
        const coordinates = meshVectors.map(v => {
          const proj = Vector3.Project(v, worldMatrix, transformMatrix, viewport)
          proj.x = proj.x * canvas!.clientWidth;
          proj.y = proj.y * canvas!.clientHeight;
          return proj
        })

        const [minX, maxX] = extent(coordinates, c => c.x);
        const [minY, maxY] = extent(coordinates, c => c.y);
    
        // return a ClientRect from this
        const rect: BoundingRect = {
          width: maxX - minX,
          height: maxY - minY,
          left: minX,
          top: minY,
          right: maxX,
          bottom: maxY,
        }
    
        // console.timeEnd('rectfrommesh') // on average 0.05ms
    
        return rect;
      }
    
}