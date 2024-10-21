export const initBuffers = (gl, mesh) => {
    // create and activate buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertices), gl.DYNAMIC_DRAW);
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.triangles), gl.STATIC_DRAW);
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.normals), gl.DYNAMIC_DRAW);
    return {
        vertexCount: mesh.vertices.length / 3,
        position: positionBuffer,
        indices: indexBuffer,
        normals: normalBuffer,
    };
};
export const updateBuffers = (gl, mesh, buffers) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertices), gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normals);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.normals), gl.DYNAMIC_DRAW);
};
