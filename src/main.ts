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


// Shader code
const vsSource = `
attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying lowp vec4 vColor;

void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vColor = aVertexColor;
}
`;
const fsSource = `
varying lowp vec4 vColor;

void main() {
    gl_FragColor = vColor;
}
`;

// Main program

// Initialize the canvas and context
const canvas: HTMLCanvasElement = document.querySelector("#canvas")!;
const gl = canvas?.getContext("webgl") ?? panic(
    "Unable to initialize WebGL. Your browser or machine may not support it."
);

const program = createProgram(vsSource, fsSource);

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

let squareRotation = 0.0;
let lastFrame = 0;

// Draw the scene repeatedly
const render = (now_ms: number) => {
    const now = now_ms * 0.001; // convert to seconds
    const deltaTime = now - lastFrame;
    lastFrame = now;

    drawScene(gl, programInfo, buffers, squareRotation);
    squareRotation += deltaTime;

    requestAnimationFrame(render);
}
requestAnimationFrame(render);
