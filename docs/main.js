import { initBuffers, updateBuffers } from "./buffer.js";
import { drawScene } from "./draw.js";
import { meshes } from "./mesh.js";
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
// Main program
// Initialize the canvas and context
const canvas = document.querySelector("#canvas");
const gl = canvas?.getContext("webgl") ?? panic("Unable to initialize WebGL. Your browser or machine may not support it.");
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
const selectMesh = (shape) => {
    mesh = meshes[shape];
    buffers = initBuffers(gl, mesh);
    return [mesh, buffers];
};
const shape = document.querySelector("#shape") ?? panic("ui broken");
shape.addEventListener("change", event => {
    if (event.target instanceof HTMLInputElement) {
        selectMesh(event.target.value);
    }
});
let mesh;
let buffers;
[mesh, buffers] = selectMesh(
// The browser can persist selections
document.querySelector('input[name="shape"]:checked')
    ?.value
    ?? "tetrahedron");
const secondsPerCycle = 16;
const breathSpeed = 1;
const breathe = (time) => (Math.sin(time * breathSpeed) + 1) / 2;
let rotation = 0;
let lastFrame = 0;
const render = (nowMillis) => {
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
};
requestAnimationFrame(render);
let waiter = null;
const awake = () => {
    if (waiter !== null) {
        clearTimeout(waiter);
    }
    const header = document.querySelector("header");
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
                }, 3000);
            }, 3000);
        }, 3000);
    }, 20000);
};
// Awake on load, mouse, keyboard, or focus actions
document.addEventListener("mousemove", awake);
document.addEventListener("keydown", awake);
document.addEventListener("keyup", awake);
document.addEventListener("focus", awake);
awake();
