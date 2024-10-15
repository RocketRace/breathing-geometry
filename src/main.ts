import { initBuffers } from "./buffer.js";
import { drawScene } from "./draw.js";

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

// "raw" meshes (not normalized or centered at the origin)

const rawTetrahedronVertices = [
    [1, 0, -1/Math.sqrt(2)],
    [-1, 0, -1/Math.sqrt(2)],
    [0, 1, 1/Math.sqrt(2)],
    [0, -1, 1/Math.sqrt(2)],
] as const;

const rawTetrahedronFaces = [
    [0, 1, 2],
    [0, 1, 3],
    [0, 2, 3],
    [1, 2, 3],
] as const;

const rawCubeVertices = [
    [0, 0, 0],
    [0, 0, 1],
    [0, 1, 0],
    [0, 1, 1],
    [1, 0, 0],
    [1, 0, 1],
    [1, 1, 0],
    [1, 1, 1],
] as const;

const rawCubeFaces = [
    [0, 1, 2, 3],
    [0, 1, 4, 5],
    [0, 2, 4, 6],
    [1, 3, 5, 7],
    [2, 3, 6, 7],
    [4, 5, 6, 7],
] as const;

const programInfo = {
    program: program,
    attribLocations: {
        vertexPosition: gl.getAttribLocation(program, "aVertexPosition"),
        vertexColor: gl.getAttribLocation(program, "aVertexColor"),
    },
    uniformLocations: {
        projectionMatrix: gl.getUniformLocation(program, "uProjectionMatrix"),
        modelViewMatrix: gl.getUniformLocation(program, "uModelViewMatrix"),
    },
};

const buffers = initBuffers(gl);

const radPerSecond = 0.5;
let squareRotation = 0.0;
let lastFrame = 0;

// Draw the scene repeatedly
const render = (nowMillis: number) => {
    const now = nowMillis * 0.001;
    const deltaTime = now - lastFrame;
    lastFrame = now;

    drawScene(gl, programInfo, buffers, squareRotation);
    squareRotation += deltaTime * radPerSecond;

    requestAnimationFrame(render);
}
requestAnimationFrame(render);
