// assumed present
const canvas: HTMLCanvasElement = document.querySelector("#canvas")!;

const panic = (msg: string) => {
    alert(msg);
    throw new Error(msg)
}

const gl = canvas?.getContext("webgl") ?? panic(
    "Unable to initialize WebGL. Your browser or machine may not support it."
);

// utility functions

const compileShader = (shaderSource: string, shaderType: number) => {
    const shader = gl.createShader(shaderType)!;  
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      panic(`Could not compile shader: ${gl.getShaderInfoLog(shader)}`);
    }
    return shader;
}
const createProgram = (vertexShaderSource: string, fragmentShaderSource: string) => {
    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
    const shaderProgram = gl.createProgram()!;
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        panic(`Could not link program: ${gl.getProgramInfoLog(shaderProgram)}`);
    }
    return shaderProgram;
}

// Set the clear color to full opaque black
gl.clearColor(0.0, 0.0, 0.0, 1.0);
// Clear with the specified color
gl.clear(gl.COLOR_BUFFER_BIT);

const vertexShaderSource = ``;
const fragmentShaderSource = ``;

const program = createProgram(vertexShaderSource, fragmentShaderSource);