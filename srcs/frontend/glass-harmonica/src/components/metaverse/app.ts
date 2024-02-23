import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, HemisphericLight, Mesh, MeshBuilder, FreeCamera, Color3, Color4, Matrix, Quaternion, StandardMaterial, SceneLoader, PickingInfo, GlowLayer, Sound } from "@babylonjs/core";
import { AdvancedDynamicTexture, StackPanel, Button, TextBlock, Rectangle, Control, Image } from "@babylonjs/gui"
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Environment } from "./environment";
import { PlayerData } from "./playerData";
import { LocalPlayer } from "./localPlayer";
import { NPC } from "./NPC";
import { PlayerInput } from "./inputController";
import { Socket } from "socket.io-client";
import { GameEntity } from "./gameEntity";
import { RemotePlayer } from "./remotePlayer";
import { routerKey } from "vue-router";
import { type Message } from './shared/meta.interface'
import { pointCloudVertex } from "@babylonjs/core/Shaders/ShadersInclude/pointCloudVertex";

enum STATES { START = 0, GAME = 1, LOSE = 2, CUTSCENE = 3 }

let vueEmitter: (event: string, metadata: any) => void;

class Metaverse {

    playerData: PlayerData;
    gameWorld: GameWorld;

    constructor() {
    }

    async initPlayerData(id: string, username: string) {
        this.playerData = new PlayerData(id, username);
    }

    async initGameWorld(metaSocket: Socket) {
        if (!this.gameWorld) {
            this.gameWorld = new GameWorld(metaSocket, <PlayerData>this.playerData);
            await this.gameWorld.ready();
        }
    }
}


const shopEvent = new Event("openShop");


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
    private _livePlayers: Array<RemotePlayer>;
    private _yellowDevilName: string;
    private _yellowDevil: NPC | any;
    private _NPCS: Array<NPC> | any;
    private _ready : boolean;

    constructor(metaSocket: Socket, playerData: PlayerData) {
        this._canvas = this._createCanvas();
        this._metaSocket = metaSocket;
        // initialize babylon scene and engine
        this._engine = new Engine(this._canvas, false);
        this._engine.setHardwareScalingLevel(6);
        this._scene = new Scene(this._engine);
        this._playerData = playerData,
            this._player = null;
        this._input = null;
        this._livePlayers = new Array();
        this._NPCS = new Array();
        this._ready = false;
        this._environment = null;
        this._yellowDevilName = 'فرانسيسكو خيسوس دي جاتا وفالديس';
        //Events for debugging
        window.addEventListener("keydown", (ev) => {
            // Shift+ctrl+I
            if (ev.shiftKey && ev.ctrlKey && ev.keyCode === 73) {
                if (this._scene.debugLayer.isVisible()) {
                    this._scene.debugLayer.hide();
                } else {
                    this._scene.debugLayer.show();
                }
            }

            else if (ev.key === "l") {
                console.log("Player position : ",
                    `${this._player!.mesh.position.x}, ${this._player!.mesh.position.y}, ${this._player!.mesh.position.z}`)
            }

            else if (ev.key === "r") {
                console.log("Player rotation : ", `${this._player!.mesh.rotationQuaternion}`);
            }

            else if (ev.key === "R") {
                this._player!.mesh.position = Vector3.Zero();
            }

            /*else if ( ev.key === "p") {
                this.showPopUp("This is a pop up");
            }

            else if ( ev.key === "P") {
                this.showPopUp("This is a pop up with a longer text so that we can see how it goes. I want it to be longer still, and hope there's no issue");
            }*/
        });
    }

    /*
    **  check the state of usability of the scene
    */

    isReady() {
        return this._ready;
    }

    async ready() {
        // run the main render loop
        await this._main();
    }

    isSceneReady(): boolean {
        return this._scene.isReady();
    }


    /*
    **  Methods and properties of the pop up system
    */

    private _popUpTexture: AdvancedDynamicTexture;
    private _popUpStack: StackPanel;
    private _popUpLabel: TextBlock;
    private _popUpCloseButton: Button;



    showPopUp(message: string, enableButton: boolean = true) {

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
        this._popUpStack.width = '80%';
        this._popUpStack._automaticSize = true;
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
        this._popUpLabel.fontSize = 10;
        this._popUpLabel.height = '100px';
        this._popUpLabel.width = '300px';
        this._popUpLabel.textWrapping = 1;
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

    setLivePlayers(u: any) {
        this._livePlayers = u;
    }

    resetLivePlayers() {
        this._livePlayers.forEach((p) => {
            p.mesh.dispose();
        });
        this._livePlayers = Array<RemotePlayer>();
    }

    async spawnPlayer(player: PlayerData) {
        if (this._findLivePlayer(player.user.id) !== undefined) {
            console.log(`Player: ${player.user.name} already joined`);
            return;
        }

        if (player && player.user.name !== this._playerData?.user.name) {
            console.log("Instancing mesh for ", player.user.name);

            try {
                this._scene.executeWhenReady( async () => {
                    const assets = await this._loadPlayerAssets(this._scene, false, 'player.glb');
                    if (!assets) {
                        console.error('Failed to load player assets.');
                        return;
                    }
                    let newPlayer: any = new RemotePlayer(assets, this._scene, player.user);
                    if (!newPlayer) {
                        console.error('Failed to instantiate RemotePlayer.');
                        return;
                    }
                    this._livePlayers.push(newPlayer);
                    console.log("instanced")

                });

            } catch (error) {
                console.error('Error during player spawning:', error);
            }
        }
    }


    removePlayer(playerToRemove: PlayerData) {
        const playerIndex = this._livePlayers.findIndex((p) => {
            return playerToRemove.user.id === p.user.id;
        });
        if (playerIndex != -1) {
            this._livePlayers[playerIndex].die();
            this._livePlayers.splice(playerIndex, 1);
        }
    }

    applyRemotePlayerUpdate(p: PlayerData) {

        let player = this._findLivePlayer(p.user.id);
        player?.updateMesh(
            new Vector3(p.position[0], p.position[1], p.position[2]),
            new Quaternion(p.rotation[0], p.rotation[1], p.rotation[2], p.rotation[3]),
            p.state
        );
    }

    makeRemotePlayerSay(m: Message) {

        let player = this._findLivePlayer(m.user.id);
        if (player) {
            console.log(" player that's sayin' all this ", player);
            player.say(m.text);
        }
    }

    private _findLivePlayer(targetPlayerId: string): RemotePlayer | undefined {
        let player = this._livePlayers.find((p) => { return p.user.id == targetPlayerId }) // change this for a locator

        return player;
    }

    setLocalPlayerState(state: number) {
        this._player?.setState(state);
    }

    changeLocalPlayerName(newName: string) {
        this._player.updateName(newName);
    }

    changeRemotePlayerName(id: string, newName: string) {
        let player = this._findLivePlayer(id);

        if (player) {
            console.log("changingName of remote player ", player);
            player.updateName(newName);
        }
    }

    apotheosis(name: string) {
        const player = this._findLivePlayer(name);

        if (player) {
            player.showFlamingSoul();
        }
    }

    stopApotheosis(name: string) {
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
        canvas.id = "metaverse";
        canvas.addEventListener('click', (e) => {
            const ray = this._scene.createPickingRay(this._scene.pointerX, this._scene.pointerY, Matrix.Identity(), this._scene.activeCamera);
            const pickInfo = this._scene.pickWithRay(ray, (m) => {
                return (m.metadata !== null && m.metadata.tag === 'GameEntity');
            });
            if (pickInfo!.hit) {
                if (pickInfo?.pickedMesh?.metadata.type === 'Devil') {
                    console.log("Emitter ", vueEmitter);
                    vueEmitter('storeRequest', { userId: this._playerData!.user.id });
                }
                else if (pickInfo?.pickedMesh?.metadata.type === 'remote') {
                    vueEmitter('profileRequest', { name: pickInfo!.pickedMesh!.metadata.name });
                }
                else {
                    let NPC = this._NPCS.find((npc: any) => { return npc.name === pickInfo!.pickedMesh!.metadata.name })
                    console.log(NPC.name, ": About to saySomething()");
                    NPC.saySomething();
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
        window.addEventListener('keydown', () => {
            this._setUpMusic();
        }, { once: true })
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
        await this._instanceAllNpcs();
        this._ready = true;
    }

    private async _initializeGameAsync(scene: Scene): Promise<void> {
        //temporary light to light the entire scene

        //Create the player
        this._player = new LocalPlayer(this.assets, scene, <PlayerInput>this._input, this._metaSocket, <PlayerData>this._playerData);
        const camera = this._player.activatePlayerCamera();
    }

    private async _instanceAllNpcs() {
        /*curro*/
        let assets: any = await this._loadPlayerAssets(this._scene, false, 'curro1.glb');
        assets["height"] = 5;
        this._yellowDevil = new NPC(assets, this._scene, this._yellowDevilName, 'Devil',
            new Vector3(-141.20595719108053, -73.68085679880434, 329.60593356864916),
            new Quaternion(0, 0.99, 0, -0.89)
        );

        /*guille*/
        assets = await this._loadPlayerAssets(this._scene, false, 'escultura1.glb');
        assets["height"] = 6;
        this._NPCS.push(
            new NPC(assets, this._scene, 'Guillermo', 'angel',
                new Vector3(-259.19837561453, 47.69347184924647, -181.9513474067934),
                new Quaternion(0, 0.8, 0),
                [
                    "Buy 'El aquelarre de Celia'",
                    "Read 'El aquelarre de Celia'",
                    "The Falcon has spread its wings.",
                    "Climb down this hill, find your destiny",
                    "Be careful in this God-forsaken land",
                    "Do it for Him",
                    "The wings of liberty glide across the sky",
                    "Offer your heart",
                    "MARCH ON",
                    "I like you. I want you",
                    "*frowns*",
                ]
            )
        );

        /*Nico*/
        assets = await this._loadPlayerAssets(this._scene, false, 'nico1.glb');
        assets["height"] = 5;
        this._NPCS.push(
            new NPC(assets, this._scene, 'Botticelli', 'artist',
                new Vector3(-75.93741380345205, -73.29292600487902, 229.75875289758943),
                new Quaternion(0, -0.186713555771165, 0, 0.9824143973351003),
                [
                    "Oh ¿Es eso una armónica de cristal?...",
                    "Ten cuidado con las sonrisas en el desierto...",
                    "El desierto solía ser una rosaleda hace mucho mucho tiempo....",
                    "...Solían florecer con el tañer de las campanas ... PING PONG...",
                    "¿Eres fan de Schnittke?...",
                    "El ángel de la montaña parece agresivo a veces, pero es nuestro ángel...",
                    "Si entregas tu corazón a este sitio, podrás ver a los dioses...",
                    "Ignora a mi hermano pequeño si lo vas saltando entre árboles...",
                    "*Dibujando una de las esculturas de la Catedral*",
                    "*Bostezando*",
                    "*Infusionando te*",
                ])
        );

        /*Jav*/
        assets = await this._loadPlayerAssets(this._scene, false, 'jav1.glb');
        this._NPCS.push(
            new NPC(assets, this._scene, 'Botticello', 'scientist',
                new Vector3(-81.97072654511088, -73.63999168465243, 231.13467107770862),
                new Quaternion(0, -0.186713555771165, 0, 0.9824143973351003),
                [
                    "Ten cuidado al hablar sobre ciertas personas mientras estés aquí...",
                    "Nuestro Ángel protector? Yo lo hago todo por él.",
                    "Sí, sí. Perdón para todos! Salvo a los corruptos.",
                    "¿Te has detenido a observar los mosaicos?",
                    "Las vistas son maravillosas desde la altura de los árboles.",
                    "Si hablas con mi hermano, recuérdale que tiene que pintar.",
                    "*Dibujando una especie de formula en la arena*",
                    "*Sorbiendo de su mate*",
                    "Extraño las flores..."
                ]
            )
        );

        /*Guitarra1*/
        assets = await this._loadPlayerAssets(this._scene, false, 'guitarra1.glb');
        assets["height"] = 5;
        this._NPCS.push(
            new NPC(assets, this._scene, 'Pablo', 'bard',
                new Vector3(-79.48917234424871, -73.79349910868692, 268.8783399458853),
                new Quaternion(0, 0.9620386395130945, 0, 0.27291327568178436),
                [
                    "♫♩La arena del desierto no para de ensuciar mi guitarra♪♫",
                    "♫♩Temo al gato de ojos amarillos♪♫",
                    "♫♩Escogí la música sobre la cimitarra♪♫",
                    "♫♩Bella tierra de جَيَّان , tierra que me vio nacer♪♫",
                    "♫♩El hambre, los colmillos♪♫",
                    "*Afinando la guitarra*",
                    "*golpeando la caja de la guitarra*",
                    "*Cambiando una cuerda*",
                    "♫♩ !¿Y esa música horrible?! Debería ir a escucharla de cercaaaa♪♫",
                ]
            )
        );
        //Player rotation :  {X: 0 Y: 0.15132534047226934 Z: 0 W: 0.9884840116718889}
        //Player position :  -262.9376075888921, 49.41932127911506, -188.31524453127705
    }


    private _setUpMusic() {
        Engine.audioEngine!.useCustomUnlockedButton = true;
        window.addEventListener('click', () => {
            if (Engine.audioEngine!.unlocked) {
                Engine.audioEngine!.unlock();
            }
        }, { once: true });

        const overWorldTheme = new Sound("overworld theme", "/sounds/glassHarmonica.mp3", this._scene, null, {
            loop: true,
            autoplay: true,
        });
        const evilTheme = new Sound("Evil theme", "/sounds/shopMusic.mp3", this._scene, null, {
            loop: true,
            autoplay: true,
            //distanceModel : "exponential",
        });

        evilTheme.attachToMesh(this._yellowDevil.mesh);

        console.log("theme : ", evilTheme, "mesh position", this._yellowDevil.mesh.position);
    }


    /*
    ** Mesh loading
    */

    private async _loadPlayerModel(scene: Scene, collisionMesh: Mesh | null, path: string) {

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

    private async _loadPlayerAssets(scene: Scene, checkCollisions: boolean, modelPath: string) {
        //collision mesh
        const outer = await MeshBuilder.CreateBox("outer", { width: 1, depth: 1, height: 1 }, scene);
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
            popUpCallback: this.showPopUp,
        }
    }
}

async function initializeMetaverse(metaSocket: Socket, vueEmitterCallback: (event: string, metadata: any) => void) {
    const metaverse = new Metaverse();
    vueEmitter = vueEmitterCallback;
    return metaverse;
}

export { initializeMetaverse, Metaverse };
