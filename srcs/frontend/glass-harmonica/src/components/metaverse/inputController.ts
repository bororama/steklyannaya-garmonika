import { Scene, ActionManager, ExecuteCodeAction, Scalar } from "@babylonjs/core";


export class PlayerInput {

    public inputMap : {};
    public vertical: number = 0;
    public horizontal: number = 0;
    public camera: number = 0;
    public jumping: boolean;
    public toggleChatBox: boolean;
    private _switch: boolean;

    constructor(scene: Scene) {
        scene.actionManager = new ActionManager(scene);

        this.inputMap = {};
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));

        scene.onBeforeRenderObservable.add(() => {
            this._updateFromKeyboard();
        });

        this._switch = false;
    }

    private _updateFromKeyboard(): void {

        //Jump Checks (SPACE)
        if (this.inputMap[" "]) {
            this.jumping = true;
        } 
        else {
            this.jumping = false;
        }
        
        if (this.inputMap["q"] || this.inputMap["Q"]) {
            this.camera = -1;
        }
        else if (this.inputMap["e"] || this.inputMap["E"]) {
            this.camera = 1;
        }
        else {
            this.camera = 0;
        }

        if (this.inputMap["ArrowUp"] || this.inputMap["w"] || this.inputMap["W"]) {
            this.vertical = Scalar.Lerp(this.vertical, 1, 0.15);
        }

        else if (this.inputMap["ArrowDown"] || this.inputMap["s"]|| this.inputMap["S"]) {
            this.vertical = Scalar.Lerp(this.vertical, -1, 0.15);
        }

        else 
        {
            this.vertical = 0;
        }
        
        if (this.inputMap["ArrowLeft"] || this.inputMap["a"]|| this.inputMap["A"]) {
            this.horizontal = Scalar.Lerp(this.horizontal, -1, 0.15);

        }

        else if (this.inputMap["ArrowRight"] || this.inputMap["d"]|| this.inputMap["D"]) {
            this.horizontal = Scalar.Lerp(this.horizontal, 1, 0.15);
        }

        else {
            this.horizontal = 0;
        }

        if (this.inputMap["t"] || this.inputMap["T"]) {
            console.log("this.inputMap[t] = ", this.inputMap["t"]);
            this.inputMap["t"] = false;
            if (this._switch)
                this.toggleChatBox = false;
            else {
                this.toggleChatBox = true;
                this._switch = true;
            }
        }
        
        else {
            this.toggleChatBox = false;
            this._switch = false;
        }
    }

}
