const vshaderCode = document.getElementById("vshader").innerHTML;
const fshaderCode = document.getElementById("fshader").innerHTML;

function main() {
  const canvas = document.getElementById("canvas");
  const gl = getWebGLContext(canvas);

  if (!initShaders(gl, vshaderCode, fshaderCode)) {
    console.log("error");
  }

  const n = initVertexBuffers(gl);
  initRotation(gl);
  draw(gl, n);
  function initVertexBuffers(gl) {
    const a_Position = gl.getAttribLocation(gl.program, "a_Position");
    const vertices = new Float32Array([0.0, 0.3, -0.3, -0.3, 0.3, -0.3]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    const n = 3;
    return n;
  }

  function initRotation(gl, ANGLE = 90, dx = 0.5) {
    var xformMatrix = new Matrix4();
    xformMatrix.setRotate(ANGLE, 0, 0, 1);
    xformMatrix.translate(dx, 0, 0);
    // xformMatrix.setTranslate(dx, 0, 0);
    // xformMatrix.rotate(ANGLE, 0, 0, 1);
    const u_xformMatrix = gl.getUniformLocation(gl.program, "u_xformMatrix");
    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix.elements);
  }

  function draw(gl, n) {
    gl.clearColor(0.5, 0.5, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
  }

  let da = 10;
  let dx = 0.05;
  canvas.addEventListener("click", () => {
    da += 10;
    dx += 0.05;
    initRotation(gl, da, dx);
    draw(gl, n);
  });
}
