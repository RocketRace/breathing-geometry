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
    [0, 0, 0],
    [0, 0, 1],
    [0, 1, 0],
    [0, 1, 1],
    [1, 0, 0],
    [1, 0, 1],
    [1, 1, 0],
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
