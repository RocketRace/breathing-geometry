import { initBuffers, updateBuffers } from "./buffer.js";
import { drawScene } from "./draw.js";
import { cube, tetrahedron } from "./mesh.js";

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

let mesh = tetrahedron;
let buffers = initBuffers(gl, mesh);

const radPerSecond = 0.5;
let rotation = 0.0;
let lastFrame = 0;

// Draw the scene repeatedly
const render = (nowMillis: number) => {
    const now = nowMillis * 0.001;
    const deltaTime = now - lastFrame;
    lastFrame = now;

    const factor = (Math.sin(now * 1.5) + 1) / 2;
    mesh.spherify(factor);
    updateBuffers(gl, mesh, buffers);
    drawScene(gl, programInfo, buffers, rotation);
    rotation += deltaTime * radPerSecond;

    requestAnimationFrame(render);
}
requestAnimationFrame(render);
