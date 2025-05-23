import { mat4 } from "gl-matrix";
export const drawScene = (gl, programInfo, buffers, rotation, bob, pulseStrength) => {
    // configure clear options and how depth is calculated
    gl.clearColor(0, 0, 0, 0);
    gl.clearDepth(1);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    // clear canvas and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // create a perspective matrix with 45 degree FOV, width/height
    // ratio matching the canvas, and 0.1-100 unit visibility
    const fieldOfView = (45 * Math.PI) / 180;
    const canvas = gl.canvas;
    const aspectRatio = canvas.clientWidth / canvas.clientHeight;
    const zRange = [0.1, 100];
    const projectionMatrix = mat4.create();
    // first argument is destination
    mat4.perspective(projectionMatrix, fieldOfView, aspectRatio, ...zRange);
    // place the mesh 3 units away and rotate it around the y-axis
    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [0, bob - 0.1, -3]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, Math.PI / 12, [1, 0, 0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, rotation, [0, 1, 0]);
    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);
    // tell WebGL how to pull out data from buffers to attributes
    setPositionAttribute(gl, buffers, programInfo);
    setNormalAttribute(gl, buffers, programInfo);
    setFundamentalDomainAttribute(gl, buffers, programInfo);
    // activate the index buffer (for the drawElements call later)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);
    // set shader uniforms (constants)
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix);
    gl.uniform1f(programInfo.uniformLocations.pulseStrength, pulseStrength);
    const vertexCount = buffers.vertexCount;
    const type = gl.UNSIGNED_INT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
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
function setFundamentalDomainAttribute(gl, buffers, programInfo) {
    const numComponents = 1;
    // attributes can't be bool or int
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.fundamentals);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexFundamental, numComponents, type, normalize, stride, offset);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexFundamental);
}
