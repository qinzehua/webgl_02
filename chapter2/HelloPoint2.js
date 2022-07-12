let VSHADER_SOURCE = document.getElementById("vshader").innerText;
let FSHADER_SOURCE = document.getElementById("fshader").innerText;

function main() {
  const canvas = document.getElementById("example");
  const gl = getWebGLContext(canvas);

  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to intialize shaders.");
    return;
  }

  var a_Position = gl.getAttribLocation(gl.program, "a_Position");
  var a_PointSize = gl.getAttribLocation(gl.program, "a_PointSize");

  if (a_Position < 0 || a_PointSize < 0) {
    console.log("---error---");
    return;
  }

  gl.vertexAttrib3f(a_Position, 0.3, 0.0, 0.0);
  gl.vertexAttrib1f(a_PointSize, 10.0);

  gl.clearColor(0.5, 0.5, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, 1);
}
