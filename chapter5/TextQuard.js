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
      -0.3, 0.3,0,1,
      -0.3, -0.3, 0, 0,
      0.3, 0.3, 1,1,
      0.3, -0.3, 1,0,
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
    const texture = gl.createTexture();
    const u_Sampler = gl.getUniformLocation(gl.program, "u_Sampler");
    const image = new Image();
    image.onload = function () {
      loadTexture(gl, n, texture, u_Sampler, image);
    };
    image.src = "../resources/sky.JPG";
    return true;
  }

  function loadTexture(gl, n, texture, u_Sampler, image) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis

    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler, 0);

    gl.clear(gl.COLOR_BUFFER_BIT); // Clear <canvas>

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
  }
}
