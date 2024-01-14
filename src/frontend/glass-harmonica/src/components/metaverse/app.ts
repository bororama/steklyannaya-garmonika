import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, HemisphericLight, Mesh, MeshBuilder, FreeCamera, Color3, Color4, Matrix, Quaternion, StandardMaterial, SceneLoader, PickingInfo, GlowLayer } from "@babylonjs/core";
import { AdvancedDynamicTexture, StackPanel, Button, TextBlock, Rectangle, Control, Image } from "@babylonjs/gui"
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Environment } from "./environment";
import { PlayerData } from "./playerData";
import { LocalPlayer } from "./localPlayer";
import { PlayerInput } from "./inputController";
import { Socket } from "socket.io-client";
import { GameEntity } from "./gameEntity";
import { RemotePlayer } from "./remotePlayer";
import { routerKey } from "vue-router";
import { type Message } from './shared/meta.interface'
import { pointCloudVertex } from "@babylonjs/core/Shaders/ShadersInclude/pointCloudVertex";

enum STATES { START = 0, GAME = 1, LOSE = 2, CUTSCENE = 3 }

let vueEmitter : (event : string, metadata : any) => void;

class Metaverse {

    playerData : PlayerData;
    gameWorld : GameWorld;

    constructor () {
    }

    async initPlayerData(locator : number, username : string) {
        this.playerData = new PlayerData(locator, username);
    }

    async initGameWorld(metaSocket: Socket) {
        if (!this.gameWorld) {
            this.gameWorld = new GameWorld(metaSocket, <PlayerData>this.playerData);
            await this.gameWorld.ready();
        }
    }
    
    
}

class GameWorld {
    private _scene: Scene;
    private _canvas: HTMLCanvasElement;
    private _engine: Engine;
    private _metaSocket: Socket;
    public  assets: any;
    private _environment: Environment | null;
    private _playerData: PlayerData | null;
    private _player: LocalPlayer | null;
    private _input: PlayerInput | null;
    private _livePlayers: Array<RemotePlayer>;
    private _yellowDevilName : string;

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
        this._yellowDevilName = 'فرانسيسكو خيسوس دي جاتا وفالديس';
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

/*
**  check the state of usability of the scene
*/

    isReady() {
        return this._scene.isReady();
    }

    async ready(){
        // run the main render loop
        await this._main();
    }

    isSceneReady(): boolean {
        return this._scene.isReady();
    }
/*
**  Methods and properties of the pop up system
*/

    private _popUpTexture : AdvancedDynamicTexture;
    private _popUpStack : StackPanel;
    private _popUpLabel : TextBlock;
    private _popUpCloseButton : Button;



    showPopUp(message : string, enableButton: boolean = true) {

        this._popUpStack.isVisible = true;
        this._popUpCloseButton.isEnabled = enableButton;
        this._popUpLabel.text = message;
    }

    closePopUp() {
        this._popUpStack.isVisible = false;
    }

    private setUpPopUpSystem() {
        this._popUpTexture = AdvancedDynamicTexture.CreateFullscreenUI('pop-up');

        this._popUpStack = new StackPanel();
        this._popUpStack.width = '300px';
        this._popUpStack.height = '200px';
        this._popUpStack.background = 'white';
        this._popUpStack.alpha = 0.8;
        this._popUpStack.paddingBottom = '20px';        
        
        this._popUpCloseButton = Button.CreateImageWithCenterTextButton('closeButton', 'Close', '');
        this._popUpCloseButton.width = '100px';
        this._popUpCloseButton.height = '40px';
        this._popUpCloseButton.color = 'white';
        this._popUpCloseButton.background = 'blue';
        this._popUpCloseButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this._popUpCloseButton.onPointerUpObservable.add(() => {
            this._popUpStack.isVisible = false;
        });
        this._popUpLabel = new TextBlock();
        this._popUpLabel.text = 'This is a pop-up!';
        this._popUpLabel.fontSize = 20;
        this._popUpLabel.height = '100px';
        this._popUpLabel.width = '300px';
        this._popUpLabel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        
        this._popUpStack.addControl(this._popUpLabel);
        this._popUpTexture.addControl(this._popUpStack);
        this._popUpStack.addControl(this._popUpCloseButton);
        this._popUpStack.isVisible = false;
    }

/*
**  Routines that interact with the livePLayers array and the local player
*/
    getLivePlayers() {
        return this._livePlayers;
    }

    setLivePlayers(u : any) {
        this._livePlayers = u;
    }

    resetLivePlayers() {
        this._livePlayers.forEach((p) => {
            p.mesh.dispose();
        });
        this._livePlayers = Array<RemotePlayer>();
    }

    /*async spawnPlayer(player: PlayerData) {

        if (this._findLivePlayer(player.user.name) !== undefined) {
            console.log(`   Player : ${player.user.name} already joined`);
            return;
        }
        if ( player && player.user.name !== this._playerData?.user.name) {
            console.log("Instancing mesh for ", player.user.name);
            const assets = await this._loadPlayerAssets(this._scene, false, 'player.glb');
            let newPlayer: any;
            newPlayer = new RemotePlayer(assets, this._scene, player.user.name);
            this._livePlayers.push(newPlayer);
        }
    }*/

    async spawnPlayer(player: PlayerData) {
        if (this._findLivePlayer(player.user.name) !== undefined) {
            console.log(`Player: ${player.user.name} already joined`);
            return;
        }
    
        if (player && player.user.name !== this._playerData?.user.name) {
            console.log("Instancing mesh for ", player.user.name);
    
            try {
                const assets = await this._loadPlayerAssets(this._scene, false, 'player.glb');
                if (!assets) {
                    console.error('Failed to load player assets.');
                    return;
                }
    
                let newPlayer: any = new RemotePlayer(assets, this._scene, player.user.name);
                if (!newPlayer) {
                    console.error('Failed to instantiate RemotePlayer.');
                    return;
                }
    
                this._livePlayers.push(newPlayer);
            } catch (error) {
                console.error('Error during player spawning:', error);
            }
        }
    }
    

    removePlayer(playerToRemove : PlayerData) {
        const playerIndex = this._livePlayers.findIndex( (p) => {
            return playerToRemove.user.name === p.name;
        })
        if (playerIndex != -1) {
            this._livePlayers[playerIndex].dispose();
            this._livePlayers[playerIndex].mesh.dispose();
            this._livePlayers = this._livePlayers.splice(playerIndex, 1);
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

    private _findLivePlayer(targetPlayerName: string): RemotePlayer | undefined {
        let player = this._livePlayers.find((p) => { return p.name == targetPlayerName }) // change this for a locator

        return player;
    }

    setLocalPlayerState(state : number) {
        this._player?.setState(state);
    }

    apotheosis(name : string) {
        const player = this._findLivePlayer(name);

        if (player) {
            player.showFlamingSoul();
        }
    }

    stopApotheosis(name : string) {
        const player = this._findLivePlayer(name);
        
        if (player) {
            player.hideFlamingSoul();
        }
    }

    /*
    ** BabylonJs set-up and main render loop
    */


    private _setUpMaterials() {

        const soulMaterial = new StandardMaterial("Flaming Soul", this._scene);
        soulMaterial.diffuseColor = new Color3(1, 0, 0);
        soulMaterial.specularColor = new Color3(0, 0, 0);
        soulMaterial.emissiveColor = new Color3(1, 1, 1);

        const SoulGlow = new GlowLayer("Glowing Souls", this._scene);
        SoulGlow.customEmissiveColorSelector = function (mesh, subMesh, material, result) {
            if (mesh.material?.name === "Flaming Soul") {
              result.set(1, 1, 1, 0.6);
            } else {
              result.set(0, 0, 0, 0);
            }
        }
    }

    private _createCanvas(): HTMLCanvasElement {
        let canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "50%";
        canvas.id = "canvas";
        canvas.addEventListener('click', (e) => {
            const ray = this._scene.createPickingRay(this._scene.pointerX, this._scene.pointerY, Matrix.Identity(), this._scene.activeCamera);
            const pickInfo = this._scene.pickWithRay(ray, (m) => {
                return (m.metadata !== null && m.metadata.tag === 'GameEntity');
            });
            if (pickInfo!.hit) {
                if (pickInfo?.pickedMesh?.metadata.type === 'Devil') {
                    vueEmitter('storeRequest', {username : this._playerData!.user.name});
                }
                else {
                    vueEmitter('profileRequest', {name : pickInfo!.pickedMesh!.metadata.name});
                }
            }
        });
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
        this.setUpPopUpSystem();
        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }


    private async _setUpGameSceneAssets(scene: Scene) {
        this._environment = new Environment(scene);
        await this._environment.load(); //environment
        this.assets = await this._loadPlayerAssets(scene, true, 'player.glb'); //character
    }



    private async _goToGame() {

        this._engine.displayLoadingUI();
        this._scene.detachControl();
        let scene = new Scene(this._engine);
        scene.clearColor = new Color4(0.01568627450980392, 0.01568627450980392, 0.20392156862745098);
        scene.detachControl();
        const globalLight = new HemisphericLight("HemiLight", new Vector3(0, 1, 0), scene);
        globalLight.intensity = 1;
        this._input = new PlayerInput(scene);
        await this._setUpGameSceneAssets(scene);
        await this._initializeGameAsync(scene);
        await scene.whenReadyAsync();
        this._scene.dispose();
        this._scene = scene;
        this._engine.hideLoadingUI();
        this._scene.attachControl();
        this._setUpMaterials();
        this._instanceNPCs();
    }

    private async _initializeGameAsync(scene: Scene): Promise<void> {
        //temporary light to light the entire scene

        //Create the player
        this._player = new LocalPlayer(this.assets, scene, <PlayerInput>this._input, this._metaSocket, <PlayerData>this._playerData);
        const camera = this._player.activatePlayerCamera();
    }

    private async _instanceNPCs() {
        /*curro*/
        const assets = await this._loadPlayerAssets(this._scene, false, 'humanoid.glb');
        const curro = new GameEntity(assets, this._scene, this._yellowDevilName, 'Devil');
        curro.updatePosition(new Vector3(0, -13, 0));
    }


    /*
    ** Mesh loading
    */

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
}

async function initializeMetaverse(metaSocket: Socket, vueEmitterCallback : (event : string, metadata : any) => void) {
    const metaverse = new Metaverse();
    vueEmitter = vueEmitterCallback;
    return metaverse;
}

export { initializeMetaverse, Metaverse };