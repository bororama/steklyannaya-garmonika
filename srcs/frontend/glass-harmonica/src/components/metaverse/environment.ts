import { Scene, Mesh, Vector3, Color3, MeshBuilder, SceneLoader, BaseTexture } from "@babylonjs/core";

export class Environment {
    private _scene: Scene;

    constructor(scene: Scene) {
        this._scene = scene;
    }

    public async load() {
        const jaen = await this._loadAsset("jaen.glb");
        //Loop through all environment meshes that were imported
        jaen.allMeshes.forEach((m) => {
            m.receiveShadows = true;
            m.checkCollisions = true;
            m.metadata = {tag : 'terrain', name: 'Jaén'};
        });
        jaen.env.locallyTranslate(new Vector3(600, -70, 0));
        const cathedral = await this._loadAsset("catedral.glb");
        cathedral.env.locallyTranslate(new Vector3(600, -70, 0));
        cathedral.allMeshes.forEach((m) => {
            m.receiveShadows = true;
            m.checkCollisions = true;
            m.metadata = {tag : 'GameEntity', type: 'Cathedral', name: 'Asunción de la virgen de Jaén'};
        });
    }

    private async _loadAsset(path : string) {
        const result = await SceneLoader.ImportMeshAsync(null, "/3d/", path, this._scene);

        let env = result.meshes[0];
        let allMeshes = env.getChildMeshes();
        allMeshes.forEach((mesh) => {
            if (mesh.material) {
              const activeTexture = mesh.material.getActiveTextures();
              activeTexture.forEach((texture) => {
                texture.updateSamplingMode(8); //NEAREST_NEAREST
              });
            }
        });
        return {
            env: env, //reference to our entire imported glb (meshes and transform nodes)
            allMeshes: allMeshes, // all of the meshes that are in the environment
        };
        
    }
}
