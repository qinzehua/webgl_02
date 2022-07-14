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
    const vertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    const n = 4;
    return n;
  }

  function initRotation(gl, ANGLE = 10, dx = 0.1) {
    var radian = (Math.PI * ANGLE) / 180.0;
    const cosB = Math.cos(radian);
    const sinB = Math.sin(radian);

    //prettier-ignore
    /* [
        cosB,-sinB,0,0,
        sinB,cosB, 0,0,
        0,   0,    1,0,
        0,   0,    0,0
    ]*/
    const xformMatri = new Float32Array([
        cosB,sinB,0,0,
        -sinB,cosB,0,0,
        0,   0,    1,0,
        dx,   0,    0,1
    ])
    console.log(xformMatri);
    const u_xformMatrix = gl.getUniformLocation(gl.program, "u_xformMatrix");
    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatri);
  }

  function draw(gl, n) {
    gl.clearColor(0.5, 0.5, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
  }

  let da = 10;
  let dx = 0.1;
  canvas.addEventListener("click", () => {
    da += 10;
    dx += 0.1;
    initRotation(gl, da, dx);
    draw(gl, n);
  });
}
