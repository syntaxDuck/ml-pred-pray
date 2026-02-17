declare global {
    function createCanvas(w: number, h: number): p5.Image;
    function createVector(x?: number, y?: number, z?: number): p5.Vector;
    function random(min?: number, max?: number): number;
    function radians(degrees: number): number;
    function sin(angle: number): number;
    function cos(angle: number): number;
    function abs(n: number): number;
    function min(...nums: number[]): number;
    function max(...nums: number[]): number;
    function floor(n: number): number;
    function ceil(n: number): number;
    function sqrt(n: number): number;
    function pow(n: number, e: number): number;
    function constrain(n: number, min: number, max: number): number;
    function dist(x1: number, y1: number, x2: number, y2: number): number;
    function lerp(start: number, stop: number, amt: number): number;
    function map(value: number, start1: number, stop1: number, start2: number, stop2: number): number;
    function noise(x: number, y?: number, z?: number): number;
    function noiseSeed(seed: number): void;
    function randomSeed(seed: number): void;
    function background(v1: number | string, v2?: number, v3?: number, alpha?: number): void;
    function fill(v1: number | string, v2?: number, v3?: number, alpha?: number): void;
    function stroke(v1: number | string, v2?: number, v3?: number, alpha?: number): void;
    function noFill(): void;
    function noStroke(): void;
    function strokeWeight(weight: number): void;
    function textSize(size: number): void;
    function text(str: string | number, x: number, y: number): void;
    function textAlign(horizontal: string | number, vertical?: string | number): void;
    function rect(x: number, y: number, w: number, h: number): void;
    function rectMode(mode: string | number): void;
    function triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void;
    function ellipse(x: number, y: number, w: number, h?: number): void;
    function circle(x: number, y: number, d: number): void;
    function line(x1: number, y1: number, x2: number, y2: number): void;
    function point(x: number, y: number): void;
    function push(): void;
    function pop(): void;
    function translate(x: number, y: number, z?: number): void;
    function rotate(angle: number): void;
    function scale(s: number | number[]): void;
    function frameRate(fps: number): void;
    function keyPressed(): void;
    function keyTyped(): void;
    function keyReleased(): void;
    function mousePressed(): void;
    function mouseReleased(): void;
    function mouseMoved(): void;
    function mouseDragged(): void;
    function windowResized(): void;

    const width: number;
    const height: number;
    const frameCount: number;
    const key: string;
    const keyCode: number;
    const mouseX: number;
    const mouseY: number;
    const pmouseX: number;
    const pmouseY: number;
    const mouseIsPressed: boolean;
    const touchX: number;
    const touchY: number;
    const PI: number;
    const TWO_PI: number;
    const HALF_PI: number;
    const QUARTER_PI: number;
    const TAU: number;
    const E: number;
    const SQRT2: number;

    const CENTER: string;
    const LEFT: string;
    const RIGHT: string;
    const TOP: string;
    const BOTTOM: string;
    const BASELINE: string;
    const HSB: string;
    const HSL: string;
    const RGB: string;

    namespace p5 {
        class Vector {
            x: number;
            y: number;
            z: number;
            constructor(x?: number, y?: number, z?: number);
            add(v: p5.Vector | number, y?: number): p5.Vector;
            sub(v: p5.Vector | number, y?: number): p5.Vector;
            mult(n: number): p5.Vector;
            div(n: number): p5.Vector;
            mag(): number;
            magSq(): number;
            setMag(n: number): p5.Vector;
            heading(): number;
            setHeading(angle: number): p5.Vector;
            rotate(angle: number): p5.Vector;
            limit(max: number): p5.Vector;
            dist(v: p5.Vector): number;
            copy(): p5.Vector;
            set(x?: number, y?: number, z?: number): void;
            add(v: p5.Vector | number): p5.Vector;
            static fromAngle(angle: number, len?: number): p5.Vector;
        }
        class Image {
            width: number;
            height: number;
            pixels: Uint8ClampedArray;
            loadPixels(): void;
            updatePixels(): void;
            get(x?: number, y?: number, w?: number, h?: number): p5.Color | p5.Image;
            set(x: number, y: number, c: number | p5.Color): void;
            resize(w: number, h: number): void;
            copy(src: p5.Image, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void;
            filter(mode: string, val?: number): void;
            save(filename: string): void;
        }
        type Color = any;
    }
}

export {};
