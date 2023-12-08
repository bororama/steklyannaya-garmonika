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
        "agallipo",
        "tomartin",
        "crisfern",
        "vcodrean",
        "v-florez",
        "bazuara-",
        "e-ligero",
        "jvacaris",
    );
    let pickedName : string = "anon"

    if (availableNames.length) {
        pickedName = availableNames[Math.floor(Math.random() * availableNames.length)];
        availableNames.filter(name => name === pickedName);
    }
    
    return pickedName;
}

export {clamp, getFadeOutAnimation, getRandomUsername}