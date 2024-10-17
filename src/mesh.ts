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
    [0, 0, 0] as const,
    [0, 0, 1] as const,
    [0, 1, 0] as const,
    [0, 1, 1] as const,
    [1, 0, 0] as const,
    [1, 0, 1] as const,
    [1, 1, 0] as const,
    [1, 1, 1] as const,
];

export const rawCubeFaces = [
    [0, 1, 2, 3] as const,
    [0, 1, 4, 5] as const,
    [0, 2, 4, 6] as const,
    [1, 3, 5, 7] as const,
    [2, 3, 6, 7] as const,
    [4, 5, 6, 7] as const,
];

type Vertex = readonly [number, number, number];
type Triangle = readonly [number, number, number];
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

const triangulateFaces = (faces: Face[], vertices: Vertex[]): [Vertex[], Triangle[]] => {
    let newVertices = [...vertices];
    let newTriangles: Triangle[] = [];
    faces.forEach(face => {
        const centerIndex = newVertices.length;
        newVertices.push(faceCenter(face, vertices));
        for (let i = 0; i < face.length; i++) {
            const firstPoint = face[i];
            const secondPoint = face[(i + 1) % face.length];
            newTriangles.push([firstPoint, secondPoint, centerIndex]);
        }
    });
    // todo: should the indices be closer together?

    return [newVertices, newTriangles];
}

console.log(triangulateFaces(rawCubeFaces, rawCubeVertices));
