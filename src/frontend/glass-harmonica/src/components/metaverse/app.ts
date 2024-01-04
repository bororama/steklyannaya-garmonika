import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, HemisphericLight, Mesh, MeshBuilder, FreeCamera, Color4, Matrix, Quaternion, StandardMaterial, SceneLoader } from "@babylonjs/core";
import { AdvancedDynamicTexture, StackPanel, Button, TextBlock, Rectangle, Control, Image } from "@babylonjs/gui"
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Environment } from "./environment";
import { PlayerData } from "./playerData";
import { LocalPlayer } from "./localPlayer";
import { PlayerInput } from "./inputController";
import { Socket } from "socket.io-client";
import { GameEntity } from "./gameEntity";
import { routerKey } from "vue-router";
import { type Message } from './shared/meta.interface'

enum STATES { START = 0, GAME = 1, LOSE = 2, CUTSCENE = 3 }

class Metaverse {

    playerData : PlayerData;
    gameWorld : GameWorld;

    constructor () {
    }

    async initPlayerData(locator : number, username : string) {
        this.playerData = new PlayerData(locator, username);
    }

    async initGameWorld(metaSocket: Socket) {
        this.gameWorld = new GameWorld(metaSocket, <PlayerData>this.playerData);
        await this.gameWorld.ready();
    }
}

class GameWorld {
    private _scene: Scene;
    private _canvas: HTMLCanvasElement;
    private _engine: Engine;
    private _metaSocket: Socket;
    public assets: any;
    private _environment: Environment | null;
    private _playerData: PlayerData | null;
    private _player: LocalPlayer | null;
    private _input: PlayerInput | null;
    private _livePlayers: Array<GameEntity>;

    constructor(metaSocket: Socket, playerData : PlayerData) {
        this._canvas = this._createCanvas();
        this._metaSocket = metaSocket;
        // initialize babylon scene and engine
        this._engine = new Engine(this._canvas, true);
        this._scene = new Scene(this._engine);
        this._playerData = playerData,
        this._player = null;
        this._input = null;
        this._livePlayers = new Array();
        this._environment = null;

        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+ctrl+I
            if (ev.shiftKey && ev.ctrlKey && ev.keyCode === 73) {
                if (this._scene.debugLayer.isVisible()) {
                    this._scene.debugLayer.hide();
                } else {
                    this._scene.debugLayer.show();
                }
            }
        });


    }

    async ready(){
        // run the main render loop
        await this._main();
    }
    //SOCKETS

    async spawnPlayers(playersToSpawn: Array<PlayerData>) {
        for (let player of playersToSpawn) {
            if (player.user.locator !== this._playerData?.user.locator) {
                console.log(player.user.name, " spawned in the world");
                const assets = await this._loadPlayerAssets(this._scene, false, 'player.glb');
                let newPlayer: any;
                newPlayer = new GameEntity(assets, this._scene, player.user.name);
                this._livePlayers.push(newPlayer);
            }
        }
    }

    applyRemotePlayerUpdate(p: PlayerData) {

        let player = this._findLivePlayer(p.user.name);
        player?.updateMesh(
            new Vector3(p.position[0], p.position[1], p.position[2]),
            new Quaternion(p.rotation[0], p.rotation[1], p.rotation[2], p.rotation[3]),
            p.state
        );
    }

    makeRemotePlayerSay(m : Message) {
        let player = this._findLivePlayer(m.user.name);
        if (player) {
            player.say(m.text);
        }
    }

    isSceneReady(): boolean {
        return this._scene.isReady();
    }

    private _findLivePlayer(targetPlayerName: string): GameEntity | undefined {
        let player = this._livePlayers.find((p) => { return p.name == targetPlayerName }) // change this for a locator

        return player;
    }

    private _createCanvas(): HTMLCanvasElement {
        let canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "50%";
        canvas.id = "canvas";
        document.body.appendChild(canvas);

        return canvas;
    }

    private async _main() {
        await this._goToGame();

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
            this._goToGame();
        });

        //--SCENE FINISHED LOADING--
        await scene.whenReadyAsync();
        this._engine.hideLoadingUI(); //when the scene is ready, hide loading
        //lastly set the current state to the lose state and set the scene to the lose scene
        this._scene.dispose();
        this._scene = scene;
    }

    private async _setUpGameSceneAssets(scene: Scene) {
        this._environment = new Environment(scene);
        await this._environment.load(); //environment
        this.assets = await this._loadPlayerAssets(scene, true, 'player.glb'); //character
    }


    private _goToGameGUIHelper(scene: Scene) {

        //--GUI--
        const playerUI = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        //dont detect any inputs from this ui while the game is loading

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
    }


    private async _goToGame() {

        this._engine.displayLoadingUI();
        this._scene.detachControl();
        let scene = new Scene(this._engine);
        scene.clearColor = new Color4(0.01568627450980392, 0.01568627450980392, 0.20392156862745098);
        scene.detachControl();
        this._goToGameGUIHelper(scene);
        const light0 = new HemisphericLight("HemiLight", new Vector3(0, 1, 0), scene);
        this._input = new PlayerInput(scene);
        await this._setUpGameSceneAssets(scene);
        await this._initializeGameAsync(scene);
        await scene.whenReadyAsync();
        this._scene.dispose();
        this._scene = scene;
        this._engine.hideLoadingUI();
        this._scene.attachControl();
    }


    private async _loadPlayerModel(scene: Scene, collisionMesh: Mesh | null, path : string) {

        const importedMesh = await SceneLoader.ImportMeshAsync(null, "/3d/", path, scene);
        const body = importedMesh.meshes[0];
        if (collisionMesh) {
            body.parent = collisionMesh;
        }
        body.isPickable = false;
        body.getChildMeshes().forEach(m => {
            m.isPickable = false;
        })
        body.translate(Vector3.Up(), -0.6);

        return importedMesh;
    }

    private async _loadPlayerAssets(scene: Scene, checkCollisions : boolean, modelPath : string) {
        //collision mesh
        const outer = MeshBuilder.CreateBox("outer", { width: 1, depth: 1, height: 1 }, scene);
        outer.isVisible = false;
        outer.isPickable = false;
        outer.checkCollisions = checkCollisions;
        outer.bakeTransformIntoVertices(Matrix.Translation(0, 0, 0))
        outer.ellipsoid = new Vector3(1, 1, 1); // the ellipsoid is used for collisions by BAB
        outer.ellipsoidOffset = new Vector3(0, outer.ellipsoid._y / 2, 0);
        outer.rotationQuaternion = new Quaternion(0, 1, 0, 0);
        //    let debugRay = MeshBuilder.CreateDashedLines("debugray", {points: [new Vector3(0,0,0), new Vector3(0,-1,0)]})
        //    debugRay.parent = outer;
        //    debugRay.isPickable = false;
        //    debugRay.checkCollisions = false;
        let importedMesh: any = await this._loadPlayerModel(scene, outer, modelPath);

        return {
            mesh: outer as Mesh,
            animationGroups: importedMesh.animationGroups,
        }
    }


    private async _initializeGameAsync(scene: Scene): Promise<void> {
        //temporary light to light the entire scene

        //Create the player
        this._player = new LocalPlayer(this.assets, scene, <PlayerInput>this._input, this._metaSocket, <PlayerData>this._playerData);
        const camera = this._player.activatePlayerCamera();
    }
}

async function initializeMetaverse(metaSocket: Socket) {
    const metaverse = new Metaverse();
    return metaverse;
}

export { initializeMetaverse, Metaverse };