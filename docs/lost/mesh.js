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
    [0, 1, 2, 3],
    [0, 1, 4, 5],
    [0, 2, 4, 6],
    [1, 3, 5, 7],
    [2, 3, 6, 7],
    [4, 5, 6, 7],
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
    return [
        uy * vz - uz * vy,
        uz * vx - ux * vz,
        ux * vy - uy * vx,
    ];
};
const triangulateFaces = (faces, vertices) => {
    let newVertices = [];
    let triangles = [];
    let normals = [];
    faces.forEach(face => {
        const center = faceCenter(face, vertices);
        for (let i = 0; i < face.length; i++) {
            const vertexIndex = newVertices.length;
            const a = center;
            const b = vertices[face[i]];
            const c = vertices[face[(i + 1) % face.length]];
            const normal = computeNormal(a, b, c);
            newVertices.push(a, b, c);
            triangles.push([vertexIndex, vertexIndex + 1, vertexIndex + 2]);
            normals.push(normal, normal, normal); // flat shading
        }
    });
    // todo: should the indices be closer together?
    const flatVertices = newVertices.flat();
    const flatTriangles = triangles.flat();
    const flatNormals = normals.flat();
    return [flatVertices, flatTriangles, flatNormals];
};
export const cube = triangulateFaces(rawCubeFaces, rawCubeVertices);
console.log(cube);
