import { Mesh } from "./mesh";

export const initBuffers = (gl: WebGLRenderingContext, mesh: Mesh) => {
    // create and activate buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertices), gl.DYNAMIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertices), gl.DYNAMIC_DRAW);
    
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(mesh.triangles), gl.STATIC_DRAW);
    
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);    
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(mesh.normals),
        gl.DYNAMIC_DRAW,
    );

    const fundamentalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, fundamentalsBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(mesh.fundamentalDomain.map(b => b ? 1 : 0)),
        gl.STATIC_DRAW,
    );

    return {
        vertexCount: mesh.vertices.length / 3,
        position: positionBuffer,
        indices: indexBuffer,
        normals: normalBuffer,
        fundamentals: fundamentalsBuffer,
    };
}

export const updateBuffers = (gl: WebGLRenderingContext, mesh: Mesh, buffers: any) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertices), gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normals);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.normals), gl.DYNAMIC_DRAW);
}
