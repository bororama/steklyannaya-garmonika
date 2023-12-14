import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, HemisphericLight, Mesh, MeshBuilder, FreeCamera, Color4, Color3, Matrix, Quaternion, StandardMaterial, SceneLoader, PointLight, ShadowGenerator } from "@babylonjs/core";
import { AdvancedDynamicTexture, StackPanel, Button, TextBlock, Rectangle, Control, Image } from "@babylonjs/gui"
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Environment } from "./environment";
import { PlayerData } from "./playerData";
import { Player } from "./localPlayer";
import { PlayerInput } from "./inputController";
import { Socket } from "socket.io-client";

enum STATES { START = 0, GAME = 1, LOSE = 2, CUTSCENE = 3 }

class Metaverse {
    private _scene: Scene;
    private _gamescene: Scene;


    private _canvas: HTMLCanvasElement;
    private _engine: Engine;
    private _metaSocket : Socket;

    public  assets : any;
    private _state: number = 0;
    private _environment: Environment | null;
    private _playerData : PlayerData;

    private _player: Player;
    private _input : PlayerInput;



    constructor( metaSocket : Socket ) {
        this._canvas = this._createCanvas();
        this._metaSocket = metaSocket;

        // initialize babylon scene and engine
        this._engine = new Engine(this._canvas, true);
        this._scene = new Scene(this._engine);
        this._gamescene = new Scene(this._engine);
        this._playerData = new PlayerData(-1, "anon");
        this._environment = null;

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

    initPlayerData(locator : number, username : string) {
        this._playerData = new PlayerData(locator, username);
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

    private async _setUpGame() {

        console.log("SET UP");
        this._gamescene = new Scene(this._engine);
        // create environment
        const environment = new Environment(this._gamescene);
        this._environment = environment; //class variable for App
        await this._environment.load(); //environment
        await this._loadCharacterAssets(this._gamescene); //character

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
            this._goToGame();
            scene.detachControl(); //observables disabled
        });

        //--SCENE FINISHED LOADING--
        await this._setUpGame();

        this._engine.hideLoadingUI();
        //lastly set the current state to the start state and set the scene to the start scene
        this._scene.dispose();
        this._scene = scene;
        this._state = STATES.START;

    }

    async   loadLocalPlayerModel(scene : Scene, collisionMesh : Mesh) {
        
        const importedMesh =  await SceneLoader.ImportMeshAsync(null, "/3d/", "player.glb", scene);
        //const root = result.meshes[0];
        //body is our actual player mesh
        const body = importedMesh.meshes[0];
        body.parent = collisionMesh;
        body.isPickable = false;
        body.getChildMeshes().forEach(m => {
            m.isPickable = false;
        })
        body.translate(Vector3.Up(), -0.6);

        return importedMesh;
    }

    async   loadCharacter(scene : Scene) {
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
    
        let importedMesh : any = await this.loadLocalPlayerModel(scene, outer);

        return {
            mesh: outer as Mesh,
            animationGroups: importedMesh.animationGroups,
        }
    }

    private async _loadCharacterAssets(scene : Scene) {

        return this.loadCharacter(scene).then(assets => {
            this.assets = assets;
        })

    }

    private async _initializeGameAsync(scene : Scene): Promise<void> {
        //temporary light to light the entire scene
        const light0 = new HemisphericLight("HemiLight", new Vector3(0, 1, 0), scene);

        //Create the player
        this._player = new Player(this.assets, scene, this._input, this._metaSocket, <PlayerData>this._playerData);
        const camera = this._player.activatePlayerCamera();
    }
}

function initializeMetaverse(metaSocket : Socket) : Metaverse {
    const metaverseInstance = new Metaverse(metaSocket);
    return metaverseInstance;
}

export {initializeMetaverse, Metaverse};

/*static async #getSocketHost() {
    const currentURL = new URL(window.location.href);
    let host = currentURL.host;

    if (currentURL.port) {
        host = host.replace(`:${currentURL.port}`, '');
    }

    return host;
}
*/