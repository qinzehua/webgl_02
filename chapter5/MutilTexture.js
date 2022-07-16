const vshaderCode = document.getElementById("vshader").innerHTML;
const fshaderCode = document.getElementById("fshader").innerHTML;

function main() {
  const canvas = document.getElementById("canvas");
  const gl = getWebGLContext(canvas);

  if (!initShaders(gl, vshaderCode, fshaderCode)) {
    console.log("error");
  }
  gl.clearColor(0.5, 0.5, 0.0, 1.0);

  const n = initVertexBuffers(gl);
  initTexture(gl, n);

  function initVertexBuffers(gl) {
    const a_Position = gl.getAttribLocation(gl.program, "a_Position");
    const a_TextureCoord = gl.getAttribLocation(gl.program, "a_TextureCoord");
    // prettier-ignore
    const vertices = new Float32Array([
      -0.5, 0.5,0,1,
      -0.5, -0.5, 0, 0,
      0.5, 0.5, 1,1,
      0.5, -0.5, 1,0,
    ]);
    const F_ZIE = vertices.BYTES_PER_ELEMENT;
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, F_ZIE * 4, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.vertexAttribPointer(
      a_TextureCoord,
      2,
      gl.FLOAT,
      false,
      F_ZIE * 4,
      F_ZIE * 2
    );
    gl.enableVertexAttribArray(a_TextureCoord);

    return 4;
  }
  function initTexture(gl, n) {
    const texture0 = gl.createTexture();
    const u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
    const image0 = new Image();
    image0.onload = function () {
      loadTexture(gl, n, texture0, u_Sampler0, image0, 0);
    };
    image0.src = "../resources/sky.JPG";

    const texture1 = gl.createTexture();
    const u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1");
    const image1 = new Image();
    image1.onload = function () {
      loadTexture(gl, n, texture1, u_Sampler1, image1, 1);
    };
    image1.src = "../resources/circle.gif";
    return true;
  }

  let g_textUnit0 = false,
    g_textUnit1 = 0;
  function loadTexture(gl, n, texture, u_Sampler, image, textUnit) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis

    // Enable texture
    if (textUnit == 0) {
      gl.activeTexture(gl.TEXTURE0);
      g_textUnit0 = true;
    } else {
      gl.activeTexture(gl.TEXTURE1);
      g_textUnit1 = true;
    }
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler, textUnit);

    gl.clear(gl.COLOR_BUFFER_BIT); // Clear <canvas>

    if (g_textUnit1 && g_textUnit0) {
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
    }
  }
}
