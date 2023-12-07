import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, HemisphericLight, Mesh, MeshBuilder, FreeCamera, Color4, Color3, Matrix, Quaternion, StandardMaterial, SceneLoader, PointLight, ShadowGenerator } from "@babylonjs/core";
import { AdvancedDynamicTexture, StackPanel, Button, TextBlock, Rectangle, Control, Image } from "@babylonjs/gui"
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Environment } from "./environment";
import { Player } from "./localPlayer";
import { PlayerInput } from "./inputController";
import { Socket } from "socket.io-client";

enum STATES { START = 0, GAME = 1, LOSE = 2, CUTSCENE = 3 }

class Metaverse {
    private _scene: Scene;
    private _cutScene: Scene;

    private _gamescene: Scene;


    private _canvas: HTMLCanvasElement;
    private _engine: Engine;
    private _metaSocket : Socket;

    private _state: number = 0;
    public assets;
    private _environment: Environment;
    private _player: Player;

    private _input;


    constructor( metaSocket : Socket ) {
        this._canvas = this._createCanvas();
        this._metaSocket = metaSocket;

        // initialize babylon scene and engine
        this._engine = new Engine(this._canvas, true);
        this._scene = new Scene(this._engine);


        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+I
            if (ev.shiftKey && ev.keyCode === 73) {
                if (this._scene.debugLayer.isVisible()) {
                    this._scene.debugLayer.hide();
                } else {
                    this._scene.debugLayer.show();
                }
            }
        });

        // run the main render loop
        this._main();
    }

    private _createCanvas(): HTMLCanvasElement {
        let canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "50%";
        canvas.id = "canvas";
        document.body.appendChild(canvas);

        return canvas;
    }

    private async _main(): Promise<void> {
        await this._goToStart();

        // Register a render loop to repeatedly render the scene
        this._engine.runRenderLoop(() => {
            /* switch (this._state) {
                 case STATES.START:
                     this._scene.render();
                     break;
                 case STATES.CUTSCENE:
                     this._scene.render();
                     break;
                 case STATES.GAME:
                     this._scene.render();
                     break;
                 case STATES.LOSE:
                     this._scene.render();
                     break;
                 default: break;
             }*/
            this._scene.render();
        });

        //resize if the screen is resized/rotated
        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }

    private async _goToLose(): Promise<void> {
        this._engine.displayLoadingUI();

        //--SCENE SETUP--
        this._scene.detachControl();
        let scene = new Scene(this._engine);
        scene.clearColor = new Color4(0.3, 0.3, 0.3, 1);
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), scene);
        camera.setTarget(Vector3.Zero());

        //--GUI--
        const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        const mainBtn = Button.CreateSimpleButton("mainmenu", "MAIN MENU");
        mainBtn.width = 0.2;
        mainBtn.height = "40px";
        mainBtn.color = "white";
        guiMenu.addControl(mainBtn);
        //this handles interactions with the start button attached to the scene
        mainBtn.onPointerUpObservable.add(() => {
            this._goToStart();
        });

        //--SCENE FINISHED LOADING--
        await scene.whenReadyAsync();
        this._engine.hideLoadingUI(); //when the scene is ready, hide loading
        //lastly set the current state to the lose state and set the scene to the lose scene
        this._scene.dispose();
        this._scene = scene;
        this._state = STATES.LOSE;
    }

    private async _goToCutScene() {
        this._engine.displayLoadingUI();
        //--SETUP SCENE--
        //dont detect any inputs from this ui while the game is loading
        this._scene.detachControl();
        this._cutScene = new Scene(this._engine);
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 1), this._cutScene);
        camera.setTarget(Vector3.Zero());
        this._cutScene.clearColor = new Color4(1, 0, 0, 1);

        //--GUI--
        const cutScene = AdvancedDynamicTexture.CreateFullscreenUI("cutscene");

        //--PROGRESS DIALOGUE--
        const next = Button.CreateSimpleButton("next", "NEXT");
        next.color = "white";
        next.thickness = 0;
        next.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        next.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        next.width = "64px";
        next.height = "64px";
        next.top = "-3%";
        next.left = "-12%";
        cutScene.addControl(next);



        next.onPointerUpObservable.add(() => {
            this._goToGame();
        });


        await this._cutScene.whenReadyAsync();
        this._engine.hideLoadingUI();
        this._scene.dispose();
        this._state = STATES.CUTSCENE;
        this._scene = this._cutScene;

        let finishedLoading = false;
        await this._setUpGame().then((res) => {
            finishedLoading = true;
        });
        this._engine.hideLoadingUI();
    }

    private async _setUpGame() {
        //create scene
        let scene = new Scene(this._engine);
        this._gamescene = scene;

        // create environment
        const environment = new Environment(scene);
        this._environment = environment; //class variable for App
        await this._environment.load(); //environment
        await this._loadCharacterAssets(scene); //character

    }

    private async _goToGame() {
        //--SETUP SCENE--
        this._scene.detachControl();
        let scene = this._gamescene;
        scene.clearColor = new Color4(0.01568627450980392, 0.01568627450980392, 0.20392156862745098); // a color that fit the overall color scheme better

        //--GUI--
        const playerUI = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        //dont detect any inputs from this ui while the game is loading
        scene.detachControl();

        //create a simple button
        const loseBtn = Button.CreateSimpleButton("lose", "LOSE");
        loseBtn.width = 0.2
        loseBtn.height = "40px";
        loseBtn.color = "white";
        loseBtn.top = "-14px";
        loseBtn.thickness = 0;
        loseBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        playerUI.addControl(loseBtn);


        //this handles interactions with the start button attached to the scene
        loseBtn.onPointerDownObservable.add(() => {
            this._goToLose();
            scene.detachControl(); //observables disabled
        });


        //--INPUT--
        this._input = new PlayerInput(scene); //detect keyboard/mobile inputs
        //primitive character and setting
        await this._initializeGameAsync(scene);

        //--WHEN SCENE FINISHED LOADING--
        await scene.whenReadyAsync();
        scene.getMeshByName("outer").position = new Vector3(0, 3, 0);
        //get rid of start scene, switch to gamescene and change states
        this._scene.dispose();
        this._state = STATES.GAME;
        this._scene = scene;
        this._engine.hideLoadingUI();
        //the game is ready, attach control back
        this._scene.attachControl();
    }

    private async _goToStart() {
        this._engine.displayLoadingUI();
        //SCENE SET-UP
        this._scene.detachControl();
        let scene = new Scene(this._engine);
        scene.clearColor = new Color4(0, 1, 0, 1);
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), scene);
        camera.setTarget(Vector3.Zero());

        //create a fullscreen ui for all of our GUI elements
        const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        guiMenu.idealHeight = 720; //fit our fullscreen ui to this height

        //create a simple button
        const startBtn = Button.CreateSimpleButton("start", "PRESS START");
        startBtn.width = 0.2;
        startBtn.height = "40px";
        startBtn.color = "white";
        startBtn.top = "-14px";
        startBtn.thickness = 0;
        startBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        guiMenu.addControl(startBtn);

        //this handles interactions with the start button attached to the scene
        startBtn.onPointerDownObservable.add(() => {
            this._goToCutScene();
            scene.detachControl(); //observables disabled
        });

        //--SCENE FINISHED LOADING--
        await scene.whenReadyAsync();
        this._engine.hideLoadingUI();
        //lastly set the current state to the start state and set the scene to the start scene
        this._scene.dispose();
        this._scene = scene;
        this._state = STATES.START;

    }

    private async _loadCharacterAssets(scene) {
        async function loadCharacter() {
            //collision mesh
            const outer = MeshBuilder.CreateBox("outer", { width: 1, depth: 1, height: 1}, scene);
            outer.isVisible = false;
            outer.isPickable = false;
            outer.checkCollisions = true;

            outer.bakeTransformIntoVertices(Matrix.Translation(0, 0, 0))

            //for collisions
            outer.ellipsoid = new Vector3(1, 1, 1);
            outer.ellipsoidOffset = new Vector3(0, outer.ellipsoid._y / 2, 0);

            outer.rotationQuaternion = new Quaternion(0, 1, 0, 0);

        //    //debugging ray
        //    let debugRay = MeshBuilder.CreateDashedLines("debugray", {points: [new Vector3(0,0,0), new Vector3(0,-1,0)]})
        //    debugRay.parent = outer;
        //    debugRay.isPickable = false;
        //    debugRay.checkCollisions = false;
        


            return SceneLoader.ImportMeshAsync(null, "/3d/", "player.glb", scene).then((result) => {
                const root = result.meshes[0];
                //body is our actual player mesh
                const body = root;
                body.parent = outer;
                body.isPickable = false;
                body.getChildMeshes().forEach(m => {
                    m.isPickable = false;
                })
                body.translate(Vector3.Up(), -0.6);

                return {
                    mesh: outer as Mesh,
                    animationGroups: result.animationGroups,
                }
            });
        }
        return loadCharacter().then(assets => {
            this.assets = assets;
        })

    }

    private async _initializeGameAsync(scene : Scene): Promise<void> {
        //temporary light to light the entire scene
        var light0 = new HemisphericLight("HemiLight", new Vector3(0, 1, 0), scene);

        const light = new PointLight("sparklight", new Vector3(0, 0, 0), scene);
        light.diffuse = new Color3(0.08627450980392157, 0.10980392156862745, 0.15294117647058825);
        light.intensity = 5;
        light.radius = 1000;

        const shadowGenerator = new ShadowGenerator(1024, light);
        shadowGenerator.darkness = 0.6;

        //Create the player
        this._player = new Player(this.assets, scene, shadowGenerator, this._input, this._metaSocket);
        const camera = this._player.activatePlayerCamera();


    }
}

const initializeMetaverse = (metaSocket : Socket) => {
    new Metaverse(metaSocket);
}

export {initializeMetaverse};

/*static async #getSocketHost() {
    const currentURL = new URL(window.location.href);
    let host = currentURL.host;

    if (currentURL.port) {
        host = host.replace(`:${currentURL.port}`, '');
    }

    return host;
}
*/