// "raw" meshes (not normalized / centered at the origin)
export const rawTetrahedronVertices = [
    [1, 0, -1 / Math.sqrt(2)] as const,
    [-1, 0, -1 / Math.sqrt(2)] as const,
    [0, 1, 1 / Math.sqrt(2)] as const,
    [0, -1, 1 / Math.sqrt(2)] as const,
];

export const rawTetrahedronFaces = [
    [0, 1, 2] as const,
    [0, 1, 3] as const,
    [0, 2, 3] as const,
    [1, 2, 3] as const,
];

export const rawCubeVertices = [
    [-1, -1, -1] as const,
    [-1, -1, 1] as const,
    [-1, 1, -1] as const,
    [-1, 1, 1] as const,
    [1, -1, -1] as const,
    [1, -1, 1] as const,
    [1, 1, -1] as const,
    [1, 1, 1] as const,
];

export const rawCubeFaces = [
    [0, 1, 3, 2] as const,
    [0, 1, 5, 4] as const,
    [0, 2, 6, 4] as const,
    [1, 3, 7, 5] as const,
    [2, 3, 7, 6] as const,
    [4, 5, 7, 6] as const,
];

type Vertex = readonly [number, number, number];
type Triangle = readonly [number, number, number];
type Normal = readonly [number, number, number];
type Face = readonly number[];

const faceCenter = (face: Face, vertices: Vertex[]): Vertex => {
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
}

const computeNormal = ([ax, ay, az]: Vertex, [bx, by, bz]: Vertex, [cx, cy, cz]: Vertex): Normal => {
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
    } else {
        return [-nx / n, -ny / n, -nz / n];
    }
}

const triangulateFaces = (faces: Face[], vertices: Vertex[]): [number[], number[], number[]] => {
    let newVertices: Vertex[] = [];
    let triangles: Triangle[] = [];
    let normals: Normal[] = [];
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
}

export const tetrahedron = triangulateFaces(rawTetrahedronFaces, rawTetrahedronVertices);
export const cube = triangulateFaces(rawCubeFaces, rawCubeVertices);
