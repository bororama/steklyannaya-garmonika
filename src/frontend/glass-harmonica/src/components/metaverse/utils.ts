import { Animation } from "@babylonjs/core";

enum CONSTANTS {  FPS = 25 };

function clamp(n : number, min : number, max : number) : number {
    return Math.max(min, Math.min(n, max));
}

function getFadeOutAnimation(durationMs: number, initialOpacity : number, finalOpacity : number) : Animation {
    const animation = new Animation(
        "fadeOutAnimation",
        "alpha",
        CONSTANTS.FPS,
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const keyFrames  = []
    keyFrames.push({
        frame: 0,
        value: initialOpacity,
    });
    keyFrames.push({
        frame: (durationMs / 1000) * CONSTANTS.FPS ,
        value: finalOpacity,
    });

    animation.setKeys(keyFrames);

    return animation;
}

function getRandomUsername () : string {
    const availableNames : Array<string> = Array<string>(
        "fgata-va", 
        "javgonza",
        "pdiaz-pa", 
        "mmateo-t", 
        "guilmira", 
        "rcabezas",
        "npinto-g",
        "vicgarci",
        "crisfern",
        "agallipo",
        "tomartin",
        "vcodrean",
        "vflorez",
        "bazuara",
        "e-ligero",
        "jvacaris",
        "ahammoud",
        "priezu-m",
        "emadriga",
    );
    let pickedName : string = "anon"

    if (availableNames.length) {
        pickedName = availableNames[Math.floor(Math.random() * availableNames.length)];
    }
    
    return pickedName;
}

function numberIsInRange(n : number, min: number, max: number) : boolean {
    return (n >= min && n < max)
}

function extent(array : Array<any>, selectorCallback : ( c : any) => number) : Array<number> {
    let d : number = 0;
    let min : number = array[0];
    let max : number = array[0];

    for (let position of array ) {
        d = selectorCallback(position);
        if (d < min)
            min = d;
        if (d > max)
            max = d;
    }
    return [min, max];
}

type  BoundingRect = {
    width: number,
    height: number,
    left: number,
    top: number,
    right: number,
    bottom: number,
}

export {clamp, getFadeOutAnimation, getRandomUsername, numberIsInRange, extent, type BoundingRect};