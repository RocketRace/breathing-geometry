// "raw" meshes (not normalized / centered at the origin)
const rawTetrahedronVertices = [
    [Math.sqrt(8/9), 0, -1/3] as const,
    [-Math.sqrt(2/9), Math.sqrt(2/3), -1/3] as const,
    [-Math.sqrt(2/9), -Math.sqrt(2/3), -1/3] as const,
    [0, 0, 1] as const,
];

const rawTetrahedronFaces = [
    [0, 1, 2] as const,
    [0, 1, 3] as const,
    [0, 2, 3] as const,
    [1, 2, 3] as const,
];

const rawCubeVertices = [
    [-1, -1, -1] as const,
    [-1, -1, 1] as const,
    [-1, 1, -1] as const,
    [-1, 1, 1] as const,
    [1, -1, -1] as const,
    [1, -1, 1] as const,
    [1, 1, -1] as const,
    [1, 1, 1] as const,
];

const rawCubeFaces = [
    [0, 1, 3, 2] as const,
    [0, 1, 5, 4] as const,
    [0, 2, 6, 4] as const,
    [1, 3, 7, 5] as const,
    [2, 3, 7, 6] as const,
    [4, 5, 7, 6] as const,
];

const rawOctahedronVertices = [
    [1, 0, 0] as const,
    [0, 1, 0] as const,
    [0, 0, 1] as const,
    [-1, 0, 0] as const,
    [0, -1, 0] as const,
    [0, 0, -1] as const,
];

const rawOctahedronFaces = [
    [0, 1, 2] as const,
    [0, 1, 5] as const,
    [0, 4, 2] as const,
    [0, 4, 5] as const,
    [3, 1, 2] as const,
    [3, 1, 5] as const,
    [3, 4, 2] as const,
    [3, 4, 5] as const,
];

type Vertex = readonly [number, number, number];
type Triangle = readonly [number, number, number];
type Normal = readonly [number, number, number];
type Face = readonly number[];

const scaleVertices = (vertices: Vertex[]): Vertex[] => {
    let max = 0;
    vertices.forEach(vertex => {
        const [x, y, z] = vertex;
        const n = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
        max = Math.max(max, n);
    });
    let scaledVertices: Vertex[] = []
    vertices.forEach(vertex => {
        const [x, y, z] = vertex;
        scaledVertices.push([x / max, y / max, z / max]);
    })
    return scaledVertices;
}

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
    if (nx * ax + ny * ay + nz * az > 0) {
        return normalize([nx, ny, nz]);
    } else {
        return normalize([-nx, -ny, -nz]);
    }
}

const normalize = ([x, y, z]: Vertex): Normal => {
    const n = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
    return [x / n, y / n, z / n]
}

const halve = ([ax, ay, az]: Vertex, [bx, by, bz]: Vertex): Vertex => [(ax + bx) / 2, (ay + by) / 2, (az + bz) / 2];

const lerp = (a: number, b: number, factor: number): number => a * (1 - factor) + b * factor;

export class Mesh {
    baseVertices: number[]
    vertices: number[]
    normals: number[]
    triangles: number[]
    constructor(rawVertices: Vertex[], rawFaces: Face[], subdivision: number) {
        const scaledVertices = scaleVertices(rawVertices);
        let vertices: Vertex[] = [];
        let triangles: Triangle[] = [];
        let normals: Normal[] = [];
        rawFaces.forEach(face => {
            const center = faceCenter(face, scaledVertices);
            for (let i = 0; i < face.length; i++) {
                const vertexIndex = vertices.length;
                const b = scaledVertices[face[i]];
                const c = scaledVertices[face[(i + 1) % face.length]];
                const halfway = halve(b, c);

                vertices.push(center, halfway, b, center, halfway, c);
                triangles.push(
                    [vertexIndex, vertexIndex + 1, vertexIndex + 2],
                    [vertexIndex + 3, vertexIndex + 4, vertexIndex + 5],
                );
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
        this.subdivide(subdivision);
    }
    subdivide(exponent: number) {
        if (exponent == 0) {
            return;
        }
        let newVertices: Vertex[] = [];
        let newTriangles: Triangle[] = [];
        let newNormals: Normal[] = [];
        for (let i = 0; i < this.triangles.length; i += 3) {
            const ia = this.triangles[i] * 3;
            const a = [
                this.baseVertices[ia],
                this.baseVertices[ia + 1],
                this.baseVertices[ia + 2],
            ] as const;
            const ib = this.triangles[i + 1] * 3;
            const b = [
                this.baseVertices[ib],
                this.baseVertices[ib + 1],
                this.baseVertices[ib + 2],
            ] as const;
            const ic = this.triangles[i + 2] * 3;
            const c = [
                this.baseVertices[ic],
                this.baseVertices[ic + 1],
                this.baseVertices[ic + 2],
            ] as const;
            const n = [
                this.normals[ia],
                this.normals[ia + 1],
                this.normals[ia + 2],
            ] as const;
            // A is the split line, and halfway between B and C is the new vertex. 
            // Then create triangles with the halfway as the new A
            const halfway = halve(b, c);
            const index = newVertices.length;
            newVertices.push(halfway, a, b, halfway, a, c);
            newNormals.push(n, n, n, n, n, n);
            newTriangles.push(
                [index, index + 1, index + 2],
                [index + 3, index + 4, index + 5],
            );
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
            const [n1, n2, n3] = computeNormal(
                [this.vertices[ia], this.vertices[ia + 1], this.vertices[ia + 2]],
                [this.vertices[ib], this.vertices[ib + 1], this.vertices[ib + 2]],
                [this.vertices[ic], this.vertices[ic + 1], this.vertices[ic + 2]],
            )
            this.normals[ia] = this.normals[ib] = this.normals[ic] = n1;
            this.normals[ia + 1] = this.normals[ib + 1] = this.normals[ic + 1] = n2;
            this.normals[ia + 2] = this.normals[ib + 2] = this.normals[ic + 2] = n3;
        }
    }
    spherify(factor: number) {
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

const subdivisionFactor = 8;
export const tetrahedron = new Mesh(rawTetrahedronVertices, rawTetrahedronFaces, subdivisionFactor);
export const cube = new Mesh(rawCubeVertices, rawCubeFaces, subdivisionFactor);
export const octahedron = new Mesh(rawOctahedronVertices, rawOctahedronFaces, subdivisionFactor);
