// assumed present
const canvas: HTMLCanvasElement = document.querySelector("#canvas")!;

const panic = (msg: string) => {
    alert(msg);
    throw new Error(msg)
}

const gl = canvas?.getContext("webgl") ?? panic(
    "Unable to initialize WebGL. Your browser or machine may not support it."
);

// Set the clear color to full opaque black
gl.clearColor(0.0, 0.0, 0.0, 1.0);
// Clear with the specified color
gl.clear(gl.COLOR_BUFFER_BIT);

const shaderProgram = gl.createProgram()!;
gl.linkProgram(shaderProgram);
