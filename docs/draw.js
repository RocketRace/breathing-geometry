import { mat4 } from "gl-matrix";
export const drawScene = (gl, programInfo, buffers, rotation) => {
    // configure clear options and how depth is calculated
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    // clear canvas and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // create a perspective matrix with 45 degree FOV, width/height
    // ratio matching the canvas, and 0.1-100 unit visibility
    const fieldOfView = (45 * Math.PI) / 180;
    const canvas = gl.canvas;
    const aspectRatio = canvas.clientWidth / canvas.clientHeight;
    const zRange = [0.1, 100.0];
    const projectionMatrix = mat4.create();
    // first argument is destination
    mat4.perspective(projectionMatrix, fieldOfView, aspectRatio, ...zRange);
    // place the cube 6 units away and rotated around the z-axis
    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -6.0]);
    mat4.rotate(modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    rotation * 0.7, // amount to rotate in radians
    [0, 1, 0]);
    mat4.rotate(modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    rotation * 0.3, // amount to rotate in radians
    [1, 0, 0]);
    mat4.rotate(modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    rotation * 0.5, // amount to rotate in radians
    [0, 0, 1]);
    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);
    // tell WebGL how to pull out data from buffers to attributes
    setPositionAttribute(gl, buffers, programInfo);
    // setColorAttribute(gl, buffers, programInfo);
    setNormalAttribute(gl, buffers, programInfo);
    // activate the index buffer (for the drawElements call later)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);
    // set shader uniforms (constants)
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix);
    {
        const vertexCount = buffers.vertexCount;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
};
// how to compute vertexPosition from the buffers given
const setPositionAttribute = (gl, buffers, programInfo) => {
    const numComponents = 3; // this is a vec4 but only for math reasons
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0; // "default" stride
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
};
// how to compute vertexColor from the buffers given
const setColorAttribute = (gl, buffers, programInfo) => {
    const numComponents = 4; // RGBA
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, numComponents, type, normalize, stride, offset);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
};
// Tell WebGL how to pull out the normals from
// the normal buffer into the vertexNormal attribute.
function setNormalAttribute(gl, buffers, programInfo) {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normals);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexNormal, numComponents, type, normalize, stride, offset);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
}
