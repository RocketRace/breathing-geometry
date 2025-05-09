import { initBuffers, updateBuffers } from "./buffer.js";
import { drawScene } from "./draw.js";
import { Mesh, meshes } from "./mesh.js";

// JS utilities
const panic = (msg: string) => {
    alert(msg);
    throw new Error(msg)
}

// WebGL utilities
const compileShader = (shaderSource: string, shaderType: number) => {
    const shader = gl.createShader(shaderType)!;
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        panic(`Could not compile shader: ${gl.getShaderInfoLog(shader)}`);
    }
    return shader;
}
const createProgram = (vsSource: string, fsSource: string) => {
    const vs = compileShader(vsSource, gl.VERTEX_SHADER);
    const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.deleteProgram(program);
        panic(`Could not link program: ${gl.getProgramInfoLog(program)}`);
    }
    return program;
}


// Main program

// Initialize the canvas and context
const canvas: HTMLCanvasElement = document.querySelector("#canvas")!;
const gl = canvas?.getContext("webgl2") ?? canvas?.getContext("webgl") ?? panic(
    "Unable to initialize WebGL. Your browser or machine may not support it."
);
// gradual degradation helps
console.log("Using", gl.getParameter(gl.VERSION))
if (gl.getParameter(gl.VERSION) == "WebGL 1.0") {
    if (gl.getExtension("OES_element_index_uint") === null) {
        panic(
            "Unable to initialize WebGL. Your browser or machine may not support it, or only supports an old version."
        );
    }
}

const vsSource = document.querySelector("#vs")?.textContent ?? "";
const fsSource = document.querySelector("#fs")?.textContent ?? "";

const program = createProgram(vsSource, fsSource);

const programInfo = {
    program: program,
    attribLocations: {
        vertexPosition: gl.getAttribLocation(program, "aVertexPosition"),
        vertexNormal: gl.getAttribLocation(program, "aVertexNormal"),
        vertexFundamental: gl.getAttribLocation(program, "aVertexFundamental")
    },
    uniformLocations: {
        projectionMatrix: gl.getUniformLocation(program, "uProjectionMatrix"),
        modelViewMatrix: gl.getUniformLocation(program, "uModelViewMatrix"),
        normalMatrix: gl.getUniformLocation(program, "uNormalMatrix"),
        pulseStrength: gl.getUniformLocation(program, "uPulseStrength"),
    },
};

const selectMesh = (shape: string | null, visible: boolean | null): [Mesh, any] => {
    meshName = shape ?? meshName;
    domainVisible = visible ?? domainVisible;
    mesh = meshes[meshName][domainVisible ? "true" : "false"];
    buffers = initBuffers(gl, mesh);
    return [mesh, buffers];
}

const shape: HTMLFieldSetElement = document.querySelector("#shape") ?? panic("ui broken");
shape.addEventListener("change", event => {
    if (event.target instanceof HTMLInputElement) {
        if (event.target.type == "radio") {
            selectMesh(event.target.value, null);
        }
        else {
            selectMesh(null, event.target.checked);
        }
    }
})

let meshName: string;
let domainVisible: boolean;
let mesh: Mesh;
let buffers: any;
[mesh, buffers] = selectMesh(
    // The browser can persist selections
    document.querySelector<HTMLInputElement>('input[name="shape"]:checked')
        ?.value
    ?? "tetrahedron",
    document.querySelector<HTMLInputElement>('input[name="domain"]')
        ?.checked
    ?? false,

);

// Breathing parameters
const paused = false;
const secondsPerCycle = 16;
const breathSpeed = 0.6;
const breathCurve = 1.3;
const bobFactor = 0.1;
const pulsePerBreath = 2.5;

const breathe = (time: number) => {
    // Makes the great dodecahedron look a little nicer as it expands
    const fudgeFactor = meshName == "greatDodecahedron" ? 0.98 : 1;
    // sin(a * sin(x)) is a nice way to flatten a sine
    return (Math.sin(breathCurve * Math.sin(time * breathSpeed - Math.PI / 2)) / 
           (2 * Math.sin(breathCurve)) + 0.5) * fudgeFactor;
}

const pulse = (time: number) => 
    (Math.sin(breathCurve * Math.sin(time * breathSpeed * pulsePerBreath) /
        (2 * Math.sin(breathCurve))) + 0.5) / 8 + 3/4

let rotation = 0;
let lastFrame = 0;
const render = (nowMillis: number) => {
    const timer = paused ? 0 : nowMillis * 0.001;
    const deltaTime = timer - lastFrame;
    lastFrame = timer;

    const breath = breathe(timer);
    const bob = breath * bobFactor;
    const pulseStrength = pulse(timer);
    mesh.spherify(breath);
    updateBuffers(gl, mesh, buffers);
    rotation += deltaTime / secondsPerCycle * 2 * Math.PI;

    drawScene(gl, programInfo, buffers, rotation, bob, pulseStrength);

    requestAnimationFrame(render);
}
requestAnimationFrame(render);

let waiter: number | null = null;
const awake = () => {
    if (waiter !== null) {
        clearTimeout(waiter);
    }
    const header = document.querySelector<HTMLElement>("header");
    header?.classList.remove("asleep");
    document.body.classList.remove("asleep");
    document.title = "Breathing Geometry";
    waiter = setTimeout(() => {
        header?.classList.add("asleep");
        document.body.classList.add("asleep");
        // Nesting for the cute animation :)
        waiter = setTimeout(() => {
            document.title = "Breathing Geometry (z)";
            waiter = setTimeout(() => {
                document.title = "Breathing Geometry (zz)";
                waiter = setTimeout(() => {
                    document.title = "Breathing Geometry (zzz)";
                }, 3_000);
            }, 3_000);
        }, 3_000);
    }, 20_000);
}

// Awake on load, mouse, keyboard, or touch actions
document.addEventListener("mousemove", awake);
document.addEventListener("keydown", awake);
document.addEventListener("keyup", awake);
document.addEventListener("touchstart", awake);
awake();









































//louna was here :D