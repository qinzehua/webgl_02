const vshaderCode = document.getElementById("vshader").innerText;
const fshaderCode = document.getElementById("fshader").innerText;

function main() {
  const canvas = document.getElementById("example");
  const gl = getWebGLContext(canvas);

  if (!initShaders(gl, vshaderCode, fshaderCode)) {
    console.log("error");
  }

    const a_Position = gl.getAttribLocation(gl.program, "a_Position");
    const u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
    gl.clearColor(0.0, 0.0, 1.0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var points = [];
    var g_colors = [];
    canvas.addEventListener("mouseup", (event) => {
      const clientX = event.clientX;
      const clientY = event.clientY;
      const {
        left: canvasLeft,
        top: canvasTop,
        width,
        height,
      } = canvas.getBoundingClientRect();
      const x = (clientX - canvasLeft - width / 2) / (width / 2);
      const y = (height / 2 - (clientY - canvasTop)) / (height / 2);
      points.push([x, y]);
      if (x >= 0.0 && y >= 0.0) {
        g_colors.push([1.0, 0.0, 0.0, 1.0]); // Red
      } else if (x < 0.0 && y < 0.0) {
        g_colors.push([0.0, 1.0, 0.0, 1.0]); // Green
      } else {
        g_colors.push([1.0, 1.0, 1.0, 1.0]); // White
      }

      gl.clear(gl.COLOR_BUFFER_BIT);

      for (let i = 0; i < points.length; i++) {
        const [a, b] = points[i];

        gl.vertexAttrib3f(a_Position, a, b, 0.0);
        gl.uniform4f(
          u_FragColor,
          g_colors[i][0],
          g_colors[i][1],
          g_colors[i][2],
          g_colors[i][3]
        );
        gl.drawArrays(gl.POINTS, 0, 1);
      }
    });
}
