// "raw" meshes (not normalized / centered at the origin)
const rawTetrahedronVertices = [
    [Math.sqrt(8 / 9), -1 / 3, 0] as const,
    [-Math.sqrt(2 / 9), -1 / 3, Math.sqrt(2 / 3)] as const,
    [-Math.sqrt(2 / 9), -1 / 3, -Math.sqrt(2 / 3)] as const,
    [0, 1, 0] as const,
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

const b = 2 / (1 + Math.sqrt(5));
const rawIcosahedronVertices = [
    [0, b, -1] as const,
    [b, 1, 0] as const,
    [-b, 1, 0] as const,
    [0, b, 1] as const,
    [0, -b, 1] as const,
    [-1, 0, b] as const,
    [0, -b, -1] as const,
    [1, 0, -b] as const,
    [1, 0, b] as const,
    [-1, 0, -b] as const,
    [b, -1, 0] as const,
    [-b, -1, 0] as const,
];

const rawIcosahedronFaces = [
    [2, 1, 0] as const,
    [1, 2, 3] as const,
    [5, 4, 3] as const,
    [4, 8, 3] as const,
    [7, 6, 0] as const,
    [6, 9, 0] as const,
    [11, 10, 4] as const,
    [10, 11, 6] as const,
    [9, 5, 2] as const,
    [5, 9, 11] as const,
    [8, 7, 1] as const,
    [7, 8, 10] as const,
    [2, 5, 3] as const,
    [8, 1, 3] as const,
    [9, 2, 0] as const,
    [1, 7, 0] as const,
    [11, 9, 6] as const,
    [7, 10, 6] as const,
    [5, 11, 4] as const,
    [10, 8, 4] as const,
];

// I calculated out these both on paper!
const rawSmallStellatedDodecahedronFaces = [
    [2, 8, 0, 3, 7] as const,
    [3, 0, 5, 1, 9] as const,
    [1, 6, 2, 7, 9] as const,
    [1, 10, 0, 8, 6] as const,
    [4, 1, 5, 8, 2] as const,
    [0, 11, 2, 6, 5] as const,
    [4, 7, 3, 10, 1] as const,
    [11, 0, 10, 9, 7] as const,
    [4, 2, 11, 3, 9] as const,
    [10, 5, 8, 11, 3] as const,
    [4, 6, 5, 10, 9] as const,
    [11, 8, 6, 4, 7] as const,
];
const rawGreatIcosahedronFaces = [
    [8, 0, 5] as const,
    [4, 7, 2] as const,
    [3, 10, 0] as const,
    [8, 6, 2] as const,
    [5, 1, 6] as const,
    [3, 7, 9] as const,
    [4, 1, 9] as const,
    [3, 0, 11] as const,
    [2, 7, 11] as const,
    [9, 1, 10] as const,
    [1, 4, 6] as const,
    [1, 5, 10] as const,
    [8, 2, 11] as const,
    [2, 6, 4] as const,
    [5, 0, 10] as const,
    [0, 8, 11] as const,
    [3, 11, 7] as const,
    [9, 7, 4] as const,
    [3, 9, 10] as const,
];

type Vertex = readonly [number, number, number, boolean];
type Triangle = readonly [number, number, number];
type Normal = readonly [number, number, number];
type Face = readonly number[];

const scaleVertices = (vertices: Vertex[]): Vertex[] => {
    let max = 0;
    vertices.forEach(vertex => {
        const [x, y, z, _] = vertex;
        const n = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
        max = Math.max(max, n);
    });
    let scaledVertices: Vertex[] = []
    vertices.forEach(vertex => {
        const [x, y, z, f] = vertex;
        scaledVertices.push([x / max, y / max, z / max, f]);
    })
    return scaledVertices;
}

const faceCenter = (face: Face, vertices: Vertex[]): Vertex => {
    // compute weighted average of points to obtain the center
    // (for convex polygons, this yields a valid triangulation)
    let x_a = 0;
    let y_a = 0;
    let z_a = 0;
    let f_a = true;
    face.forEach(i => {
        const [x, y, z, f] = vertices[i];
        x_a += x;
        y_a += y;
        z_a += z;
        f_a &&= f;
    });
    x_a /= face.length;
    y_a /= face.length;
    z_a /= face.length;
    // center is in the FD if all points are
    return [x_a, y_a, z_a, f_a];
}

const computeNormal = ([ax, ay, az, af]: Vertex, [bx, by, bz, bf]: Vertex, [cx, cy, cz, cf]: Vertex): Normal => {
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

const normalize = ([x, y, z]: number[]): Normal => {
    const n = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
    return [x / n, y / n, z / n]
}

const halve = (a: Vertex, b: Vertex): Vertex =>
    // not technically true either ---> NOT TRUE ---> midpoint is in the FD if both endpoints are
    // see halveCorrectly for a correct implementation
    // see vLerp for a discussion
    vLerp(a, b, 0.5);
    // [(ax + bx) / 2, (ay + by) / 2, (az + bz) / 2, af && bf];

const halveCorrectly = (a: Vertex, b: Vertex, fundamentalEdges: Set<string>, newFundamentalEdges: Set<string>): Vertex => {
    const [ax, ay, az, af] = a;
    const [bx, by, bz, bf] = b;
    // midpoint is in the FD if edges are
    const f = fundamentalEdges.has(edgeKey(a, b));
    const v = [(ax + bx) / 2, (ay + by) / 2, (az + bz) / 2, f] as const;
    // then mark the new generation as having both halves of the old edge separately
    // hey why the hell is this stateful logic in the seemingly pure function named "halveCorrectly"???
    // oh well it works, gamedev logic tm
    if (f) {
        newFundamentalEdges.add(edgeKey(a, v));
        newFundamentalEdges.add(edgeKey(v, b));
    }
    return v
}

// some real fucked up shit
// louna confirms: fucked up shit
const edgeKey = ([ax, ay, az, af]: Vertex, [bx, by, bz, bf]: Vertex): string =>
    [[ax, ay, az].toString(), [bx, by, bz].toString()].sort().toString()

const lerp = (a: number, b: number, factor: number): number => a * (1 - factor) + b * factor;

const vLerp = ([ax, ay, az, af]: Vertex, [bx, by, bz, bf]: Vertex, factor: number): Vertex =>
    [lerp(ax, bx, factor), lerp(ay, by, factor), lerp(az, bz, factor), af && bf] // placeholder _f due to bad design
    // halve is vLerp with a constant factor 0.5 (a fairly natural specialization)
    // the "incorrectness" only comes from the unsound introduction of _f field checking,
    // which is correctly pointed out as problematic in halveCorrectly

export class Mesh {
    baseVertices: number[]
    vertices: number[]
    normals: number[]
    triangles: number[]
    fundamentalDomain: boolean[]
    // string representing stringified vertex pair excluding f field
    // fundamentalEdges: Set<[Vertex, Vertex]>
    fundamentalEdges: Set<string>
    constructor(rawVertices: Vertex[], rawFaces: Face[], withFundamentalDomain: boolean) {
        const scaledVertices = scaleVertices(rawVertices);
        let vertices: Vertex[] = [];
        let triangles: Triangle[] = [];
        let normals: Normal[] = [];
        let fundamentalEdges: Set<string> = new Set();
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
                fundamentalEdges.add(edgeKey(center, halfway));
                fundamentalEdges.add(edgeKey(center, b));
                fundamentalEdges.add(edgeKey(center, c));
                fundamentalEdges.add(edgeKey(halfway, b));
                fundamentalEdges.add(edgeKey(halfway, c));
                const normal1 = computeNormal(center, halfway, b);
                const normal2 = computeNormal(center, halfway, c);
                normals.push(normal1, normal1, normal1, normal2, normal2, normal2); // flat shading
            }
        });
        // todo: should the indices be closer together?
        const flatVertices = [...vertices.flat().filter(x => typeof x === "number")]
        // we will later erase the fundamental domain here and move it into its own extra verts
        const fundamentalDomain = [...vertices.flat().filter(x => typeof x === "boolean")]
        this.baseVertices = [...flatVertices];
        this.fundamentalDomain = fundamentalDomain;
        this.fundamentalEdges = fundamentalEdges;
        this.vertices = [...flatVertices];
        this.triangles = triangles.flat();
        this.normals = normals.flat();
        // veins are all connected to the origin
        // the maximum amount of subdivisions until we cap out at 65536 vertices
        // fixme: ^this doesn't actually apply anymore now that there's extra triangles in the fundamental domain!
        const autoSubdivisionFactor = Math.floor(Math.log2((2 ** 16) / this.triangles.length - 2));
        this.subdivide(autoSubdivisionFactor);
        // time for the the fundamental domain submesh now that the surface is nicely subdivided
        // it's so jank fr
        const extraFlatVertices: number[] = [];
        const extraFundamentalDomain: boolean[] = [];
        const extraNormals: number[] = [];
        const extraTriangles: number[] = [];
        const extraOffset = this.baseVertices.length / 3;
        if (withFundamentalDomain) {
            const veinFactor = 0.35;
            for (let i = 0; i < this.triangles.length; i+=3) {
                const j = i + 1;
                const k = i + 2;
                const ti = this.triangles[i];
                const tj = this.triangles[j];
                const tk = this.triangles[k];
                // 3 rotations
                const options = [[ti, tj, tk], [tj, tk, ti], [tk, ti, tj]];
                for (let oi = 0; oi < options.length; oi++) {
                    const [ia, ib, ic] = options[oi];
                    const ax = this.baseVertices[3 * ia];
                    const ay = this.baseVertices[3 * ia + 1];
                    const az = this.baseVertices[3 * ia + 2];
                    const af = this.fundamentalDomain[ia];
                    const a = [ax, ay, az, af] as const;
                    const bx = this.baseVertices[3 * ib];
                    const by = this.baseVertices[3 * ib + 1];
                    const bz = this.baseVertices[3 * ib + 2];
                    const bf = this.fundamentalDomain[ib];
                    const b = [bx, by, bz, bf] as const;
                    const cx = this.baseVertices[3 * ic];
                    const cy = this.baseVertices[3 * ic + 1];
                    const cz = this.baseVertices[3 * ic + 2];
                    const cf = this.fundamentalDomain[ic];
                    const c = [cx, cy, cz, cf] as const;
                    const eab = this.fundamentalEdges.has(edgeKey(a, b));
                    const eac = this.fundamentalEdges.has(edgeKey(a, c));
                    const ebc = this.fundamentalEdges.has(edgeKey(b, c));
    
                    const addTriangle = ([ax, ay, az, af]: Vertex, [bx, by, bz, bf]: Vertex, [cx, cy, cz, cf]: Vertex) => {
                        const newIndex = extraOffset + extraFlatVertices.length / 3;
                        extraFlatVertices.push(ax, ay, az);
                        extraNormals.push(1, 0, 0);
                        extraFundamentalDomain.push(af);
                        extraFlatVertices.push(bx, by, bz);
                        extraNormals.push(1, 0, 0);
                        extraFundamentalDomain.push(bf);
                        extraFlatVertices.push(cx, cy, cz);
                        extraNormals.push(1, 0, 0);
                        extraFundamentalDomain.push(cf);
                        extraTriangles.push(newIndex, newIndex + 1, newIndex + 2);
                    };
    
                    // The cases we care about (up to permutation):
                    // a) fundamental edge a<->b, nothing for c
                    // (type 1 edges)
                    if (eab && !eac && !ebc) {
                        const [nax, nay, naz, naf] = vLerp(a, c, veinFactor);
                        const [nbx, nby, nbz, nbf] = vLerp(b, c, veinFactor);
                        const [abx, aby, abz, abf] = halve(a, b);
                        // shrink
                        this.baseVertices[3 * ia] = nax;
                        this.baseVertices[3 * ia + 1] = nay;
                        this.baseVertices[3 * ia + 2] = naz;
                        this.baseVertices[3 * ib] = nbx;
                        this.baseVertices[3 * ib + 1] = nby;
                        this.baseVertices[3 * ib + 2] = nbz;
                        // new
                        addTriangle([ax, ay, az, true], [abx, aby, abz, true], [nax, nay, naz, false]);
                        addTriangle([abx, aby, abz, true], [bx, by, bz, true], [nbx, nby, nbz, false]);
                        addTriangle([nax, nay, naz, false], [abx, aby, abz, true], [nbx, nby, nbz, false]);
                    }
                    // b) fundamental edges for both a<->c and b<->c, but not b<->c
                    // (corners)
                    else if (eac && ebc && !eab) {
                        const [nax, nay, naz, naf] = vLerp(a, b, veinFactor); // these go inwards now
                        const [nbx, nby, nbz, nbf] = vLerp(b, a, veinFactor);
                        const ca = vLerp(c, a, veinFactor);
                        const cb = vLerp(c, b, veinFactor);
                        const [ncx, ncy, ncz, ncf] = vLerp(ca, b, veinFactor); // doublerp
                        const caa = halve(ca, a);
                        const cbb = halve(cb, b);
                        // shrink
                        this.baseVertices[3 * ia] = nax;
                        this.baseVertices[3 * ia + 1] = nay;
                        this.baseVertices[3 * ia + 2] = naz;
                        this.baseVertices[3 * ib] = nbx;
                        this.baseVertices[3 * ib + 1] = nby;
                        this.baseVertices[3 * ib + 2] = nbz;
                        this.baseVertices[3 * ic] = ncx;
                        this.baseVertices[3 * ic + 1] = ncy;
                        this.baseVertices[3 * ic + 2] = ncz;
                        // new
                        addTriangle(c, caa, [ncx, ncy, ncz, false]);
                        addTriangle(c, cbb, [ncx, ncy, ncz, false]);
                        addTriangle(a, caa, [nax, nay, naz, false]);
                        addTriangle(b, cbb, [nbx, nby, nbz, false]);
                        addTriangle([ncx, ncy, ncz, false], caa, [nax, nay, naz, false]);
                        addTriangle([ncx, ncy, ncz, false], cbb, [nbx, nby, nbz, false]);
                    }
                    // c) no fundamental edges within a,b,c and only c is part of a fundamental edge
                    // (type 2 edges)
                    else if (!eab && !eac && !ebc && cf && !af && !bf) {
                        const [nax, nay, naz, naf] = vLerp(c, a, veinFactor);
                        const [nbx, nby, nbz, nbf] = vLerp(c, b, veinFactor);
                        const [abx, aby, abz, abf] = halve(a, b);
                        // shrink
                        this.baseVertices[3 * ib] = abx;
                        this.baseVertices[3 * ib + 1] = aby;
                        this.baseVertices[3 * ib + 2] = abz;
                        this.baseVertices[3 * ic] = nax;
                        this.baseVertices[3 * ic + 1] = nay;
                        this.baseVertices[3 * ic + 2] = naz;
                        // new
                        addTriangle(c, [nax, nay, naz, false], [nbx, nby, nbz, false]);
                        addTriangle([nax, nay, naz, false], [abx, aby, abz, false], [nbx, nby, nbz, false]);
                        addTriangle([abx, aby, abz, false], b, [nbx, nby, nbz, false]);
                    }
                    // d) no fundamental edges with a,b,c and only a and c are part of a fundamental edge
                    // (type 3 edges)
                    else if (!eab && !eac && !ebc && !cf && af && bf) {
                        const [abx, aby, abz, abf] = vLerp(a, b, veinFactor);
                        const [bax, bay, baz, baf] = vLerp(b, a, veinFactor);
                        const ac = vLerp(a, c, veinFactor);
                        const bc = vLerp(b, c, veinFactor);
                        const m = halve(ac, bc);
                        // shrink
                        this.baseVertices[3 * ia] = ac[0];
                        this.baseVertices[3 * ia + 1] = ac[1];
                        this.baseVertices[3 * ia + 2] = ac[2];
                        this.baseVertices[3 * ib] = bc[0];
                        this.baseVertices[3 * ib + 1] = bc[1];
                        this.baseVertices[3 * ib + 2] = bc[2];
                        // new
                        addTriangle(a, [abx, aby, abz, false], ac);
                        addTriangle(b, bc, [bax, bay, baz, false]);
                        addTriangle([abx, aby, abz, false], [bax, bay, baz, false], m);
                        addTriangle([abx, aby, abz, false], m, ac);
                        addTriangle([bax, bay, baz, false], bc, m);
                    }
                    // There is a 5th and 6th case (all 3 fundamental edges, or otherwise all 3 corners
                    // in a fundamental edge) but that won't happen with positive subdivision depth
                    // And of of course there is the trivial case I don't have to do anything about (nothing)
                };
            }
        }
        this.vertices = [...this.vertices, ...extraFlatVertices];
        this.baseVertices = [...this.baseVertices, ...extraFlatVertices];
        this.fundamentalDomain = [...this.fundamentalDomain, ...extraFundamentalDomain];
        for (let i = 0; i < extraOffset; i++) {
            this.fundamentalDomain[i] = false;
        }
        this.normals = [...this.normals, ...extraNormals];
        this.triangles = [...this.triangles, ...extraTriangles];
        this.recomputeNormals();
    }
    subdivide(exponent: number) {
        if (exponent == 0) {
            return;
        }
        let newVertices: Vertex[] = [];
        let newTriangles: Triangle[] = [];
        let newNormals: Normal[] = [];
        let newFundamentalEdges: Set<string> = new Set();
        for (let i = 0; i < this.triangles.length; i += 3) {
            const ia = this.triangles[i] * 3;
            const a = [
                this.baseVertices[ia],
                this.baseVertices[ia + 1],
                this.baseVertices[ia + 2],
                this.fundamentalDomain[ia / 3],
            ] as const;
            const ib = this.triangles[i + 1] * 3;
            const b = [
                this.baseVertices[ib],
                this.baseVertices[ib + 1],
                this.baseVertices[ib + 2],
                this.fundamentalDomain[ib / 3],
            ] as const;
            const ic = this.triangles[i + 2] * 3;
            const c = [
                this.baseVertices[ic],
                this.baseVertices[ic + 1],
                this.baseVertices[ic + 2],
                this.fundamentalDomain[ic / 3],
            ] as const;
            const n = [
                this.normals[ia],
                this.normals[ia + 1],
                this.normals[ia + 2],
            ] as const;
            // A is the split line, and halfway between B and C is the new vertex. 
            // Then create triangles with the halfway as the new A
            const halfway = halveCorrectly(b, c, this.fundamentalEdges, newFundamentalEdges);
            if (this.fundamentalEdges.has(edgeKey(a, b))) {
                newFundamentalEdges.add(edgeKey(a, b));
            }
            if (this.fundamentalEdges.has(edgeKey(a, c))) {
                newFundamentalEdges.add(edgeKey(a, c));
            }
            const index = newVertices.length;
            newVertices.push(halfway, a, b, halfway, a, c);
            newNormals.push(n, n, n, n, n, n);
            newTriangles.push(
                [index, index + 1, index + 2],
                [index + 3, index + 4, index + 5],
            );
        }
        const flatVertices = [...newVertices.flat().filter(x => typeof x === "number")]
        const fundamentalDomain = [...newVertices.flat().filter(x => typeof x === "boolean")]
        this.baseVertices = [...flatVertices];
        this.vertices = [...flatVertices];
        this.fundamentalDomain = fundamentalDomain;
        this.fundamentalEdges = newFundamentalEdges;
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
                [this.vertices[ia], this.vertices[ia + 1], this.vertices[ia + 2], this.fundamentalDomain[ia / 3]],
                [this.vertices[ib], this.vertices[ib + 1], this.vertices[ib + 2], this.fundamentalDomain[ib / 3]],
                [this.vertices[ic], this.vertices[ic + 1], this.vertices[ic + 2], this.fundamentalDomain[ic / 3]],
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

const sortFace = (face: Face, vertices: Vertex[]): Face => {
    const [cx, cy, cz] = faceCenter(face, vertices);
    let [rx, ry, rz] = vertices[face[0]];
    let sortedFace = [face[0]];
    let remaining = [...face.slice(1)];
    const len = remaining.length;
    for (let i = 0; i < len; i++) {
        let naiveAngles: [number, number, number][] = [];
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
}

const dualMesh = (originalVertices: Vertex[], originalFaces: Face[], withFundamentalDomain: boolean): Mesh => {
    const scaledVertices = scaleVertices(originalVertices);
    let vertices: Vertex[] = [];
    let faces: Face[] = [];
    originalFaces.forEach(face => {
        const newVertex = faceCenter(face, scaledVertices);
        vertices.push(newVertex);
    });
    originalVertices.forEach((_, vi) => {
        let newFace: number[] = [];
        originalFaces.forEach((face, fi) => {
            if (face.includes(vi)) {
                newFace.push(fi);
            }
        })
        faces.push([...newFace]);
    });
    let sortedFaces = faces.map(face => sortFace(face, vertices));

    return new Mesh(vertices, sortedFaces, withFundamentalDomain);
}

const bothMeshes = (vertices: Vertex[], faces: Face[]): Record<"true" | "false", Mesh> => ({
    // string booleans? suspect
    "true": new Mesh(vertices, faces, true),
    "false": new Mesh(vertices, faces, false),
})

const bothDualMeshes = (vertices: Vertex[], faces: Face[]): Record<"true" | "false", Mesh> => ({
    "true": dualMesh(vertices, faces, true),
    "false": dualMesh(vertices, faces, false),
})

const tetrahedron = bothMeshes(rawTetrahedronVertices.map(x => [...x, true]), rawTetrahedronFaces);
const cube = bothMeshes(rawCubeVertices.map(x => [...x, true]), rawCubeFaces);
const octahedron = bothDualMeshes(rawCubeVertices.map(x => [...x, true]), rawCubeFaces);
const dodecahedron = bothDualMeshes(rawIcosahedronVertices.map(x => [...x, true]), rawIcosahedronFaces);
const icosahedron = bothMeshes(rawIcosahedronVertices.map(x => [...x, true]), rawIcosahedronFaces);
// and the special
const greatDodecahedron = bothDualMeshes(rawIcosahedronVertices.map(x => [...x, true]), rawSmallStellatedDodecahedronFaces);

export const meshes: Record<string, Record<"true" | "false", Mesh>> = {
    tetrahedron: tetrahedron,
    cube: cube,
    octahedron: octahedron,
    dodecahedron: dodecahedron,
    icosahedron: icosahedron,
    greatDodecahedron: greatDodecahedron
};
