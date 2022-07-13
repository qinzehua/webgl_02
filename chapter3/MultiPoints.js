const vshaderCode = document.getElementById("vshader").innerHTML;
const fshaderCode = document.getElementById("fshader").innerHTML;

function main() {
  const canvas = document.getElementById("canvas");
  const gl = getWebGLContext(canvas);

  if (!initShaders(gl, vshaderCode, fshaderCode)) {
    console.log("error");
  }

  const n = initVertexBuffers(gl);
  gl.clearColor(0.5, 0.5, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);

  function initVertexBuffers(gl) {
    const a_Position = gl.getAttribLocation(gl.program, "a_Position");
    const vertices = new Float32Array([
      -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, -0.5,
    ]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    const n = 4;
    return n;
  }
}
