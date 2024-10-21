import { initBuffers, updateBuffers } from "./buffer.js";
import { drawScene } from "./draw.js";
import { meshes } from "./mesh.js";

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

const selectMesh = (shape: string) => {
    mesh = meshes[shape];
    buffers = initBuffers(gl, mesh);
    spherificationOffset = timer;
}

const shape: HTMLFieldSetElement = document.querySelector("#shape") ?? panic("ui broken");
shape.addEventListener("change", event => {
    if (event.target instanceof HTMLInputElement) {
        selectMesh(event.target.value);
    }
})

const radPerSecond = 0.5;
const breathSpeed = 1.5;

let mesh = meshes.tetrahedron;
let buffers = initBuffers(gl, mesh);
let rotation = 0.0;
let spherificationOffset = 0.0;

let timer = 0;
let lastFrame = 0;
const render = (nowMillis: number) => {
    timer = nowMillis * 0.001;
    const deltaTime = timer - lastFrame;
    lastFrame = timer;

    const factor = (Math.sin((timer - spherificationOffset) * breathSpeed) + 1) / 2;
    mesh.spherify(factor);
    updateBuffers(gl, mesh, buffers);
    rotation += deltaTime * radPerSecond;
    
    drawScene(gl, programInfo, buffers, rotation);

    requestAnimationFrame(render);
}
requestAnimationFrame(render);
