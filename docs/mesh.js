// "raw" meshes (not normalized / centered at the origin)
const rawTetrahedronVertices = [
    [Math.sqrt(8 / 9), 0, -1 / 3],
    [-Math.sqrt(2 / 9), Math.sqrt(2 / 3), -1 / 3],
    [-Math.sqrt(2 / 9), -Math.sqrt(2 / 3), -1 / 3],
    [0, 0, 1],
];
const rawTetrahedronFaces = [
    [0, 1, 2],
    [0, 1, 3],
    [0, 2, 3],
    [1, 2, 3],
];
const rawCubeVertices = [
    [-1, -1, -1],
    [-1, -1, 1],
    [-1, 1, -1],
    [-1, 1, 1],
    [1, -1, -1],
    [1, -1, 1],
    [1, 1, -1],
    [1, 1, 1],
];
const rawCubeFaces = [
    [0, 1, 3, 2],
    [0, 1, 5, 4],
    [0, 2, 6, 4],
    [1, 3, 7, 5],
    [2, 3, 7, 6],
    [4, 5, 7, 6],
];
const rawOctahedronVertices = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
    [-1, 0, 0],
    [0, -1, 0],
    [0, 0, -1],
];
const rawOctahedronFaces = [
    [0, 1, 2],
    [0, 1, 5],
    [0, 4, 2],
    [0, 4, 5],
    [3, 1, 2],
    [3, 1, 5],
    [3, 4, 2],
    [3, 4, 5],
];
const a = 1;
const b = 2 / (1 + Math.sqrt(5));
const rawIcosahedronVertices = [
    [0, b, -a],
    [b, a, 0],
    [-b, a, 0],
    [0, b, a],
    [0, -b, a],
    [-a, 0, b],
    [0, -b, -a],
    [a, 0, -b],
    [a, 0, b],
    [-a, 0, -b],
    [b, -a, 0],
    [-b, -a, 0],
];
const rawIcosahedronFaces = [
    [2, 1, 0],
    [1, 2, 3],
    [5, 4, 3],
    [4, 8, 3],
    [7, 6, 0],
    [6, 9, 0],
    [11, 10, 4],
    [10, 11, 6],
    [9, 5, 2],
    [5, 9, 11],
    [8, 7, 1],
    [7, 8, 10],
    [2, 5, 3],
    [8, 1, 3],
    [9, 2, 0],
    [1, 7, 0],
    [11, 9, 6],
    [7, 10, 6],
    [5, 11, 4],
    [10, 8, 4],
];
const scaleVertices = (vertices) => {
    let max = 0;
    vertices.forEach(vertex => {
        const [x, y, z] = vertex;
        const n = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
        max = Math.max(max, n);
    });
    let scaledVertices = [];
    vertices.forEach(vertex => {
        const [x, y, z] = vertex;
        scaledVertices.push([x / max, y / max, z / max]);
    });
    return scaledVertices;
};
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
    if (nx * ax + ny * ay + nz * az > 0) {
        return normalize([nx, ny, nz]);
    }
    else {
        return normalize([-nx, -ny, -nz]);
    }
};
const normalize = ([x, y, z]) => {
    const n = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
    return [x / n, y / n, z / n];
};
const halve = ([ax, ay, az], [bx, by, bz]) => [(ax + bx) / 2, (ay + by) / 2, (az + bz) / 2];
const lerp = (a, b, factor) => a * (1 - factor) + b * factor;
export class Mesh {
    constructor(rawVertices, rawFaces) {
        const scaledVertices = scaleVertices(rawVertices);
        let vertices = [];
        let triangles = [];
        let normals = [];
        rawFaces.forEach(face => {
            const center = faceCenter(face, scaledVertices);
            for (let i = 0; i < face.length; i++) {
                const vertexIndex = vertices.length;
                const b = scaledVertices[face[i]];
                const c = scaledVertices[face[(i + 1) % face.length]];
                const halfway = halve(b, c);
                vertices.push(center, halfway, b, center, halfway, c);
                triangles.push([vertexIndex, vertexIndex + 1, vertexIndex + 2], [vertexIndex + 3, vertexIndex + 4, vertexIndex + 5]);
                const normal1 = computeNormal(center, halfway, b);
                const normal2 = computeNormal(center, halfway, c);
                normals.push(normal1, normal1, normal1, normal2, normal2, normal2); // flat shading
            }
        });
        // todo: should the indices be closer together?
        this.baseVertices = [...vertices.flat()];
        this.vertices = vertices.flat();
        this.triangles = triangles.flat();
        this.normals = normals.flat();
        // the maximum amount of subdivisions until we cap out at 65536 vertices
        const autoSubdivisionFactor = Math.floor(Math.log2((2 ** 16) / this.triangles.length - 2));
        this.subdivide(autoSubdivisionFactor);
    }
    subdivide(exponent) {
        if (exponent == 0) {
            return;
        }
        let newVertices = [];
        let newTriangles = [];
        let newNormals = [];
        for (let i = 0; i < this.triangles.length; i += 3) {
            const ia = this.triangles[i] * 3;
            const a = [
                this.baseVertices[ia],
                this.baseVertices[ia + 1],
                this.baseVertices[ia + 2],
            ];
            const ib = this.triangles[i + 1] * 3;
            const b = [
                this.baseVertices[ib],
                this.baseVertices[ib + 1],
                this.baseVertices[ib + 2],
            ];
            const ic = this.triangles[i + 2] * 3;
            const c = [
                this.baseVertices[ic],
                this.baseVertices[ic + 1],
                this.baseVertices[ic + 2],
            ];
            const n = [
                this.normals[ia],
                this.normals[ia + 1],
                this.normals[ia + 2],
            ];
            // A is the split line, and halfway between B and C is the new vertex. 
            // Then create triangles with the halfway as the new A
            const halfway = halve(b, c);
            const index = newVertices.length;
            newVertices.push(halfway, a, b, halfway, a, c);
            newNormals.push(n, n, n, n, n, n);
            newTriangles.push([index, index + 1, index + 2], [index + 3, index + 4, index + 5]);
        }
        this.baseVertices = [...newVertices.flat()];
        this.vertices = newVertices.flat();
        this.triangles = newTriangles.flat();
        this.normals = newNormals.flat();
        this.subdivide(exponent - 1);
    }
    recomputeNormals() {
        for (let i = 0; i < this.triangles.length; i += 3) {
            const ia = this.triangles[i] * 3;
            const ib = this.triangles[i + 1] * 3;
            const ic = this.triangles[i + 2] * 3;
            const [n1, n2, n3] = computeNormal([this.vertices[ia], this.vertices[ia + 1], this.vertices[ia + 2]], [this.vertices[ib], this.vertices[ib + 1], this.vertices[ib + 2]], [this.vertices[ic], this.vertices[ic + 1], this.vertices[ic + 2]]);
            this.normals[ia] = this.normals[ib] = this.normals[ic] = n1;
            this.normals[ia + 1] = this.normals[ib + 1] = this.normals[ic + 1] = n2;
            this.normals[ia + 2] = this.normals[ib + 2] = this.normals[ic + 2] = n3;
        }
    }
    spherify(factor) {
        for (let i = 0; i < this.vertices.length; i += 3) {
            const x = this.baseVertices[i];
            const y = this.baseVertices[i + 1];
            const z = this.baseVertices[i + 2];
            const [xs, ys, zs] = normalize([x, y, z]);
            this.vertices[i] = lerp(x, xs, factor);
            this.vertices[i + 1] = lerp(y, ys, factor);
            this.vertices[i + 2] = lerp(z, zs, factor);
        }
        this.recomputeNormals();
    }
}
const sortFace = (face, vertices) => {
    const [cx, cy, cz] = faceCenter(face, vertices);
    let [rx, ry, rz] = vertices[face[0]];
    let sortedFace = [face[0]];
    let remaining = [...face.slice(1)];
    const len = remaining.length;
    for (let i = 0; i < len; i++) {
        let naiveAngles = [];
        remaining.forEach((vertexIndex, remIndex) => {
            let [ix, iy, iz] = vertices[vertexIndex];
            let dot = (ix - cx) * (rx - cx) + (iy - cy) * (ry - cy) + (iz - cz) * (rz - cz);
            let im = Math.sqrt((ix - cx) ** 2 + (iy - cy) ** 2 + (iz - cz) ** 2);
            let rm = Math.sqrt((rx - cx) ** 2 + (ry - cy) ** 2 + (rz - cz) ** 2);
            naiveAngles.push([Math.acos(dot / im / rm), vertexIndex, remIndex]);
        });
        // inefficient but idc here
        naiveAngles.sort((a, b) => a[0] - b[0]);
        const [_, minVertex, remIndex] = naiveAngles[0];
        sortedFace.push(minVertex);
        [rx, ry, rz] = vertices[minVertex];
        remaining.splice(remIndex, 1);
    }
    return sortedFace;
};
const dualMesh = (originalVertices, originalFaces) => {
    const scaledVertices = scaleVertices(originalVertices);
    let vertices = [];
    let faces = [];
    originalFaces.forEach(face => {
        const newVertex = faceCenter(face, scaledVertices);
        vertices.push(newVertex);
    });
    originalVertices.forEach((_, vi) => {
        let newFace = [];
        originalFaces.forEach((face, fi) => {
            if (face.includes(vi)) {
                newFace.push(fi);
            }
        });
        faces.push([...newFace]);
    });
    const sortedFaces = faces.map(face => sortFace(face, vertices));
    return new Mesh(vertices, sortedFaces);
};
const tetrahedron = new Mesh(rawTetrahedronVertices, rawTetrahedronFaces);
const cube = new Mesh(rawCubeVertices, rawCubeFaces);
const octahedron = new Mesh(rawOctahedronVertices, rawOctahedronFaces);
const dodecahedron = dualMesh(rawIcosahedronVertices, rawIcosahedronFaces);
const icosahedron = new Mesh(rawIcosahedronVertices, rawIcosahedronFaces);
export const meshes = {
    tetrahedron: tetrahedron,
    cube: cube,
    octahedron: octahedron,
    dodecahedron: dodecahedron,
    icosahedron: icosahedron,
};
