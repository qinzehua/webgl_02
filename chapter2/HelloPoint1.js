let VSHADER_SOURCE = document.getElementById("vshader").innerText;
let FSHADER_SOURCE = document.getElementById("fshader").innerText;

function main() {
  const canvas = document.getElementById("example");
  const gl = getWebGLContext(canvas);

  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to intialize shaders.");
    return;
  }

  gl.clearColor(0.5, 0.5, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, 1);
}
