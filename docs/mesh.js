// "raw" meshes (not normalized / centered at the origin)
export const rawTetrahedronVertices = [
    [1, 0, -1 / Math.sqrt(2)],
    [-1, 0, -1 / Math.sqrt(2)],
    [0, 1, 1 / Math.sqrt(2)],
    [0, -1, 1 / Math.sqrt(2)],
];
export const rawTetrahedronFaces = [
    [0, 1, 2],
    [0, 1, 3],
    [0, 2, 3],
    [1, 2, 3],
];
export const rawCubeVertices = [
    [-1, -1, -1],
    [-1, -1, 1],
    [-1, 1, -1],
    [-1, 1, 1],
    [1, -1, -1],
    [1, -1, 1],
    [1, 1, -1],
    [1, 1, 1],
];
export const rawCubeFaces = [
    [0, 1, 3, 2],
    [0, 1, 5, 4],
    [0, 2, 6, 4],
    [1, 3, 7, 5],
    [2, 3, 7, 6],
    [4, 5, 7, 6],
];
const faceCenter = (face, vertices) => {
    // compute weighted average of points to obtain the center
    // (for convex polygons, this yields a valid triangulation)
    let x_a = 0;
    let y_a = 0;
    let z_a = 0;
    face.forEach(i => {
        const [x, y, z] = vertices[i];
        x_a += x;
        y_a += y;
        z_a += z;
    });
    x_a /= face.length;
    y_a /= face.length;
    z_a /= face.length;
    return [x_a, y_a, z_a];
};
const computeNormal = ([ax, ay, az], [bx, by, bz], [cx, cy, cz]) => {
    const [ux, uy, uz] = [bx - ax, by - ay, bz - az];
    const [vx, vy, vz] = [cx - ax, cy - ay, cz - az];
    const [nx, ny, nz] = [
        uy * vz - uz * vy,
        uz * vx - ux * vz,
        ux * vy - uy * vx,
    ];
    // normalize the normal, and face it away from the origin
    const n = Math.sqrt(nx ** 2 + ny ** 2 + nz ** 2);
    if (nx * ax + ny * ay + nz * az > 0) {
        return [nx / n, ny / n, nz / n];
    }
    else {
        return [-nx / n, -ny / n, -nz / n];
    }
};
const halve = ([ax, ay, az], [bx, by, bz]) => [(ax + bx) / 2, (ay + by) / 2, (az + bz) / 2];
const triangulateFaces = (faces, vertices) => {
    let newVertices = [];
    let triangles = [];
    let normals = [];
    faces.forEach(face => {
        const center = faceCenter(face, vertices);
        for (let i = 0; i < face.length; i++) {
            const vertexIndex = newVertices.length;
            const b = vertices[face[i]];
            const c = vertices[face[(i + 1) % face.length]];
            const halfway = halve(b, c);
            newVertices.push(center, halfway, b, center, halfway, c);
            triangles.push([vertexIndex, vertexIndex + 1, vertexIndex + 2], [vertexIndex + 3, vertexIndex + 4, vertexIndex + 5]);
            const normal1 = computeNormal(center, halfway, b);
            const normal2 = computeNormal(center, halfway, c);
            normals.push(normal1, normal1, normal1, normal2, normal2, normal2); // flat shading
        }
    });
    // todo: should the indices be closer together?
    const flatVertices = newVertices.flat();
    const flatTriangles = triangles.flat();
    const flatNormals = normals.flat();
    return [flatVertices, flatTriangles, flatNormals];
};
export const tetrahedron = triangulateFaces(rawTetrahedronFaces, rawTetrahedronVertices);
export const cube = triangulateFaces(rawCubeFaces, rawCubeVertices);
