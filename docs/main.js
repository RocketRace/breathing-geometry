import { initBuffers } from "./buffer.js";
import { drawScene } from "./draw.js";
// JS utilities
const panic = (msg) => {
    alert(msg);
    throw new Error(msg);
};
// WebGL utilities
const compileShader = (shaderSource, shaderType) => {
    const shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        panic(`Could not compile shader: ${gl.getShaderInfoLog(shader)}`);
    }
    return shader;
};
const createProgram = (vsSource, fsSource) => {
    const vs = compileShader(vsSource, gl.VERTEX_SHADER);
    const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.deleteProgram(program);
        panic(`Could not link program: ${gl.getProgramInfoLog(program)}`);
    }
    return program;
};
// Shader code
const vsSource = `
attribute vec4 aVertexPosition;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}
`;
const fsSource = `
void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`;
// Main program
// Initialize the canvas and context
const canvas = document.querySelector("#canvas");
const gl = canvas?.getContext("webgl") ?? panic("Unable to initialize WebGL. Your browser or machine may not support it.");
const program = createProgram(vsSource, fsSource);
const programInfo = {
    program: program,
    attribLocations: {
        vertexPosition: gl.getAttribLocation(program, "aVertexPosition"),
    },
    uniformLocations: {
        projectionMatrix: gl.getUniformLocation(program, "uProjectionMatrix"),
        modelViewMatrix: gl.getUniformLocation(program, "uModelViewMatrix"),
    },
};
const buffers = initBuffers(gl);
drawScene(gl, programInfo, buffers);
