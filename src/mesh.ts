// "raw" meshes (not normalized / centered at the origin)
const rawTetrahedronVertices = [
    [1, 0, -1 / Math.sqrt(2)] as const,
    [-1, 0, -1 / Math.sqrt(2)] as const,
    [0, 1, 1 / Math.sqrt(2)] as const,
    [0, -1, 1 / Math.sqrt(2)] as const,
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
    constructor(rawVertices: Vertex[], rawFaces: Face[]) {
        let vertices: Vertex[] = [];
        let triangles: Triangle[] = [];
        let normals: Normal[] = [];
        rawFaces.forEach(face => {
            const center = faceCenter(face, rawVertices);
            for (let i = 0; i < face.length; i++) {
                const vertexIndex = vertices.length;
                const b = rawVertices[face[i]];
                const c = rawVertices[face[(i + 1) % face.length]];
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
        this.vertices = this.baseVertices = vertices.flat();
        this.triangles = triangles.flat();
        this.normals = normals.flat();
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
            // this.normals[ia] = this.normals[ia + 1] = this.normals[ia + 2] = n1;
            // this.normals[ib] = this.normals[ib + 1] = this.normals[ib + 2] = n2;
            // this.normals[ic] = this.normals[ic + 1] = this.normals[ic + 2] = n3;
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

export const tetrahedron = new Mesh(rawTetrahedronVertices, rawTetrahedronFaces);
export const cube = new Mesh(rawCubeVertices, rawCubeFaces);
