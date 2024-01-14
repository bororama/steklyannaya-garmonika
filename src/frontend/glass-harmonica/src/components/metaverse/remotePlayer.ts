import { GameEntity } from "./gameEntity";
import { Color3, Scene, StandardMaterial, GlowLayer, Material } from "@babylonjs/core";

export class RemotePlayer extends GameEntity {

    private _soulMaterial : Material;
    private _glowingMesh : any;

    constructor(assets : any, scene: Scene, name : string) {
        super(assets, scene, name, 'remote');
        this._soulMaterial = scene.materials.find( (m) => {
            if (m.name === "Flaming Soul")
            return true;
        })!;
        this._getGlowingMesh(assets.mesh);
    }


    /*these could be abtracted into a generic show hide mesh function */
showFlamingSoul() {
    console.log("APOTHEOSIS : ", this._glowingMesh);
    this._glowingMesh.position = this.mesh.position;
    this.mesh.isVisible = false;
    this.mesh.getChildMeshes().forEach( (m) => {
        m.isVisible = false;
    });
}

 hideFlamingSoul() {
     console.log("HIDE FLAMING SOUL");
     this._glowingMesh.isVisible = false;
     this._glowingMesh.getChildMeshes().forEach( (m : any) => {
        m.isVisible = false;
    });
    this.mesh.getChildMeshes().forEach( (m : any) => {
        m.isVisible = true;
    });
 }

private _getGlowingMesh(mesh : any) {
    this._glowingMesh = mesh.clone("FlamingSoul");
    this._glowingMesh.material = this._soulMaterial;
    console.log("glowing mesh0", this._glowingMesh);
    const meshes = this._glowingMesh.getChildMeshes()
    meshes.forEach( (m : any)=> {
        m.material = this._soulMaterial;
    });
    console.log("glowing mesh1", this._glowingMesh);
}

}