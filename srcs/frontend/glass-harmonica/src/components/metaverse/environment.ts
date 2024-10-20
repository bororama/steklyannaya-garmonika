import { Scene, Mesh, Vector3, Color3, MeshBuilder, SceneLoader, BaseTexture } from "@babylonjs/core";

export class Environment {
    private _scene: Scene;

    constructor(scene: Scene) {
        this._scene = scene;
    }

    public async load() {
        const assets = await this._loadAsset();
        //Loop through all environment meshes that were imported
        assets.allMeshes.forEach((m) => {
            m.receiveShadows = true;
            m.checkCollisions = true;
            m.metadata = {tag : 'terrain', name: 'Jaén'};
        });
        
    }

    private async _loadAsset() {
        //const result = await SceneLoader.ImportMeshAsync(null, "/3d/", "plane.glb", this._scene);
        //const result = await SceneLoader.ImportMeshAsync(null, "/3d/", "macan.glb", this._scene);
        //const result = await SceneLoader.ImportMeshAsync(null, "/3d/", "low_poly_forest.glb", this._scene);
        const result = await SceneLoader.ImportMeshAsync(null, "/3d/", "jaen.glb", this._scene);

        let env = result.meshes[0];
        let allMeshes = env.getChildMeshes();
        env.locallyTranslate(new Vector3(600, -70, 0));
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
