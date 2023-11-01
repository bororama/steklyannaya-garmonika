import { Scene, ActionManager, ExecuteCodeAction, Scalar } from "@babylonjs/core";


export class PlayerInput {

    public inputMap;
    public vertical: number = 0;
    public horizontal: number = 0;
    public camera: number = 0;
    public jumping

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
    }

    private _updateFromKeyboard(): void {

        //Jump Checks (SPACE)
        if (this.inputMap[" "]) {
            this.jumping = true;
        } 
        else {
            this.jumping = false;
        }

        if (this.inputMap["q"]) {
            this.camera = -1;
        }
        else if (this.inputMap["e"]) {
            this.camera = 1;
        }
        else {
            this.camera = 0;
        }

        if (this.inputMap["ArrowUp"] || this.inputMap["w"]) {
            this.vertical = Scalar.Lerp(this.vertical, 1, 0.15);
        }
        else if (this.inputMap["ArrowDown"] || this.inputMap["s"]) {
            this.vertical = Scalar.Lerp(this.vertical, -1, 0.15);
        }
        else 
        {
            this.vertical = 0;
        }

        if (this.inputMap["ArrowLeft"] || this.inputMap["a"]) {
            this.horizontal = Scalar.Lerp(this.horizontal, -1, 0.15);

        }
        else if (this.inputMap["ArrowRight"] || this.inputMap["d"]) {
            this.horizontal = Scalar.Lerp(this.horizontal, 1, 0.15);
        }
        else {
            this.horizontal = 0;
        }


    }

}
