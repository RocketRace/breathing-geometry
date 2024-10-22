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
const gl = canvas?.getContext("webgl") ?? panic(
    "Unable to initialize WebGL. Your browser or machine may not support it."
);

const vsSource = document.querySelector("#vs")?.textContent ?? "";
const fsSource = document.querySelector("#fs")?.textContent ?? "";

const program = createProgram(vsSource, fsSource);

const programInfo = {
    program: program,
    attribLocations: {
        vertexPosition: gl.getAttribLocation(program, "aVertexPosition"),
        vertexNormal: gl.getAttribLocation(program, "aVertexNormal"),
    },
    uniformLocations: {
        projectionMatrix: gl.getUniformLocation(program, "uProjectionMatrix"),
        modelViewMatrix: gl.getUniformLocation(program, "uModelViewMatrix"),
        normalMatrix: gl.getUniformLocation(program, "uNormalMatrix"),
    },
};

const selectMesh = (shape: string): [Mesh, any] => {
    mesh = meshes[shape];
    buffers = initBuffers(gl, mesh);
    return [mesh, buffers];
}

const shape: HTMLFieldSetElement = document.querySelector("#shape") ?? panic("ui broken");
shape.addEventListener("change", event => {
    if (event.target instanceof HTMLInputElement) {
        selectMesh(event.target.value);
    }
})


let mesh: Mesh;
let buffers: any;
[mesh, buffers] = selectMesh(
    // The browser can persist selections
    document.querySelector<HTMLInputElement>('input[name="shape"]:checked')
    ?.value 
    ?? "tetrahedron"
);

const secondsPerCycle = 16;
const breathSpeed = 1;

const breathe = (time: number) => 
    (Math.sin(time * breathSpeed) + 1) / 2;

let rotation = 0;
let lastFrame = 0;
const render = (nowMillis: number) => {
    const timer = nowMillis * 0.001;
    const deltaTime = timer - lastFrame;
    lastFrame = timer;

    const breath = breathe(timer);
    const bob = breath / 10;
    mesh.spherify(breath);
    updateBuffers(gl, mesh, buffers);
    rotation += deltaTime / secondsPerCycle * 2 * Math.PI;
    
    drawScene(gl, programInfo, buffers, rotation, bob);

    requestAnimationFrame(render);
}
requestAnimationFrame(render);
