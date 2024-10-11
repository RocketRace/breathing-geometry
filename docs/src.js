"use strict";
var _a;
// assumed present
const canvas = document.querySelector("#canvas");
const panic = (msg) => {
    alert(msg);
    throw new Error(msg);
};
const gl = (_a = canvas === null || canvas === void 0 ? void 0 : canvas.getContext("webgl")) !== null && _a !== void 0 ? _a : panic("Unable to initialize WebGL. Your browser or machine may not support it.");
// Set the clear color to full opaque black
gl.clearColor(0.0, 0.0, 0.0, 1.0);
// Clear with the specified color
gl.clear(gl.COLOR_BUFFER_BIT);
const shaderProgram = gl.createProgram();
gl.linkProgram(shaderProgram);
