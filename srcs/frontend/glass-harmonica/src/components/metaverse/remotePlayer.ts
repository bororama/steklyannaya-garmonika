import { GameEntity } from "./gameEntity";
import { type User } from "./shared/meta.interface"
import { Color3, Scene, StandardMaterial, GlowLayer, Material } from "@babylonjs/core";

export class RemotePlayer extends GameEntity {

    user : User;
    private _soulMaterial : Material;
    private _glowingMesh : any;

    constructor(assets : any, scene: Scene, user : User) {
        
        super(assets, scene, user.name, 'remote');
        this.user = user;
        this._soulMaterial = scene.materials.find( (m) => {
            if (m.name === "Flaming Soul")
            return true;
        })!;
        this._setGlowingMesh(assets.mesh);
        toggleMeshVisibility(this._glowingMesh, false);
    }

    showFlamingSoul() {
        console.log("APOTHEOSIS : ", this._glowingMesh);
        this._glowingMesh.position = this.mesh.position;
        toggleMeshVisibility(this.mesh, false);
        toggleMeshVisibility(this._glowingMesh, true);
    }

    hideFlamingSoul() {
        console.log("HIDE FLAMING SOUL");
        toggleMeshVisibility(this._glowingMesh, false);
        toggleMeshVisibility(this.mesh, true);
    }

    die() {
        this._glowingMesh.dispose();
        this.mesh.dispose();
        this.dispose();
    }

    private _setGlowingMesh(mesh : any) {
        this._glowingMesh = mesh.clone("FlamingSoul");
        this._glowingMesh.material = this._soulMaterial;
        const meshes = this._glowingMesh.getChildMeshes()
        meshes.forEach( (m : any)=> {
            m.material = this._soulMaterial;
        });
    }
}

function toggleMeshVisibility(mesh : any, isVisible : boolean) {
    mesh.isVisible = false;
    mesh.getChildMeshes().forEach((m : any) => {
        m.isVisible = isVisible;
    });
}