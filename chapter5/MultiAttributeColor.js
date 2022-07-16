const vshaderCode = document.getElementById("vshader").innerHTML;
const fshaderCode = document.getElementById("fshader").innerHTML;

function main() {
  const canvas = document.getElementById("canvas");
  const gl = getWebGLContext(canvas);
  let da = 10;

  if (!initShaders(gl, vshaderCode, fshaderCode)) {
    console.log("error");
  }
  gl.clearColor(0.5, 0.5, 0.0, 1.0);

  const n = initVertexBuffers(gl);
  initRotation(gl);
  draw(gl, n);
  function initVertexBuffers(gl) {
    const a_Position = gl.getAttribLocation(gl.program, "a_Position");
    const a_Color = gl.getAttribLocation(gl.program, "a_Color");
    // prettier-ignore
    const vertices = new Float32Array([
      0.0, 0.3, 1, 0, 0,
      -0.3, -0.3, 0, 1, 0,
      0.3, -0.3, 0, 0, 1
    ]);
    const F_ZIE = vertices.BYTES_PER_ELEMENT;
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, F_ZIE * 5, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, F_ZIE * 5, F_ZIE * 2);
    gl.enableVertexAttribArray(a_Color);

    const n = 3;
    return n;
  }

  function initRotation(gl, ANGLE = 90) {
    var xformMatrix = new Matrix4();
    // xformMatrix.setRotate(ANGLE, 0, 0, 1);
    // xformMatrix.translate(0.35, 0, 0);

    const u_xformMatrix = gl.getUniformLocation(gl.program, "u_xformMatrix");
    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix.elements);
  }

  function draw(gl, n) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
    da += 10;
    requestAnimationFrame(() => {
      initRotation(gl, da);
      draw(gl, n);
    });
  }
}
