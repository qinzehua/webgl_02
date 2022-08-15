var VSHADER_SOURCE = document.getElementById("vshader").innerHTML;
var FSHADER_SOURCE = document.getElementById("fshader").innerHTML;

var VSHADER_TEXTURE_SOURCE =
  document.getElementById("vshader-texture").innerHTML;
var FSHADER_TEXTURE_SOURCE =
  document.getElementById("fshader-texture").innerHTML;

var canvas = document.getElementById("webgl");

function main() {
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  const solideProgram = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
  solideProgram.u_MvpMatrix = gl.getUniformLocation(
    solideProgram,
    "u_MvpMatrix"
  );
  solideProgram.a_Position = gl.getAttribLocation(solideProgram, "a_Position");
  solideProgram.a_Color = gl.getAttribLocation(solideProgram, "a_Color");
  solideProgram.a_Normal = gl.getAttribLocation(solideProgram, "a_Normal");
  solideProgram.u_NormalMatrix = gl.getUniformLocation(
    solideProgram,
    "u_NormalMatrix"
  );

  const textureProgram = createProgram(
    gl,
    VSHADER_TEXTURE_SOURCE,
    FSHADER_TEXTURE_SOURCE
  );
  textureProgram.a_Position = gl.getAttribLocation(
    textureProgram,
    "a_Position"
  );
  textureProgram.a_Normal = gl.getAttribLocation(textureProgram, "a_Normal");
  textureProgram.a_TexCoord = gl.getAttribLocation(
    textureProgram,
    "a_TexCoord"
  );
  textureProgram.u_MvpMatrix = gl.getUniformLocation(
    textureProgram,
    "u_MvpMatrix"
  );
  textureProgram.u_NormalMatrix = gl.getUniformLocation(
    textureProgram,
    "u_NormalMatrix"
  );
  textureProgram.u_Sampler = gl.getUniformLocation(textureProgram, "u_Sampler");

  var cube = initVertexBuffers(gl);
  var texture = initTextures(gl, textureProgram);

  gl.clearColor(0.0, 0.0, 0.0, 1);
  gl.enable(gl.DEPTH_TEST);

  var tick = function () {
    angle = animate(angle);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawSolidCube(gl, cube, solideProgram);
    draw(gl, cube, textureProgram, texture);
    requestAnimationFrame(tick);
  };
  tick();
}

var angle = 0;
const verticx4 = new Matrix4();
verticx4.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);
verticx4.lookAt(0.0, 0.0, 15.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
const modalMatrix = new Matrix4();
var g_MvpMatrix = new Matrix4();
var g_NormalMatrix = new Matrix4();

function draw(gl, cube, textureProgram, texture) {
  gl.useProgram(textureProgram);

  initAttributeVariable(gl, textureProgram.a_Position, cube.positionBuffer);
  initAttributeVariable(gl, textureProgram.a_TexCoord, cube.texCoordsBuffer);
  initAttributeVariable(gl, textureProgram.a_Normal, cube.normalBuffer);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cube.index_buffer);

  drawCube(gl, textureProgram, cube, 2);
}

function drawSolidCube(gl, cube, solideProgram) {
  gl.useProgram(solideProgram);
  initAttributeVariable(gl, solideProgram.a_Position, cube.positionBuffer);
  initAttributeVariable(gl, solideProgram.a_Color, cube.colorBuffer);
  initAttributeVariable(gl, solideProgram.a_Normal, cube.normalBuffer);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cube.index_buffer);

  drawCube(gl, solideProgram, cube, -2);
}

function drawCube(gl, program, cube, x) {
  modalMatrix.setTranslate(x, 0.0, 0.0);
  modalMatrix.rotate(20.0, 1.0, 0.0, 0.0);
  modalMatrix.rotate(angle, 0.0, 1.0, 0.0);

  g_MvpMatrix.set(verticx4).multiply(modalMatrix);
  gl.uniformMatrix4fv(program.u_MvpMatrix, false, g_MvpMatrix.elements);

  g_NormalMatrix.setInverseOf(modalMatrix);
  g_NormalMatrix.transpose();
  gl.uniformMatrix4fv(program.u_NormalMatrix, false, g_NormalMatrix.elements);
  gl.drawElements(gl.TRIANGLES, cube.indicsLenght, gl.UNSIGNED_BYTE, 0);
}

function initAttributeVariable(gl, a_attribute, buffer) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute);
}

function initVertexBuffers(gl) {
  // prettier-ignore
  var verticesPositions = new Float32Array([
    1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
    1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
    1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
   -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
   -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
    1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
  ]);

  // prettier-ignore
  var normals = new Float32Array([   // Normal
  0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,     // v0-v1-v2-v3 front
  1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,     // v0-v3-v4-v5 right
  0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,     // v0-v5-v6-v1 up
 -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,     // v1-v6-v7-v2 left
  0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,     // v7-v4-v3-v2 down
  0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0      // v4-v7-v6-v5 back
]);

  // prettier-ignore
  var colors = new Float32Array([
  0.8, 0.5, 0.2,  0.8, 0.5, 0.2,  0.8, 0.5, 0.2,  0.8, 0.5, 0.2,// v0-v1-v2-v3 front
  0.3, 1.0, 0.3,  0.3, 1.0, 0.3,  0.3, 1.0, 0.3,  0.3, 1.0, 0.3,// v0-v3-v4-v5 right
  0.6, 1.0, 1.0,  0.6, 1.0, 1.0,  0.6, 1.0, 1.0,  0.6, 1.0, 1.0,// v0-v5-v6-v1 up
  1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 0.0,// v1-v6-v7-v2 left
  1.0, 0.0, 1.0,  1.0, 0.0, 1.0,  1.0, 0.0, 1.0,  1.0, 0.0, 1.0,// v7-v4-v3-v2 down
  0.0, 1.0, 1.0,  0.0, 1.0, 1.0,  0.0, 1.0, 1.0,  0.0, 1.0, 1.0,// v4-v7-v6-v5 back
]);

  // prettier-ignore
  var texCoords = new Float32Array([   // Texture coordinates
1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v0-v1-v2-v3 front
0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v0-v3-v4-v5 right
1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    // v0-v5-v6-v1 up
1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v1-v6-v7-v2 left
0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    // v7-v4-v3-v2 down
0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0     // v4-v7-v6-v5 back
]);

  // prettier-ignore
  var indices = new Uint8Array([
    0, 1, 2,   0, 2, 3,    // front
    4, 5, 6,   4, 6, 7,    // right
    8, 9,10,   8,10,11,    // up
   12,13,14,  12,14,15,    // left
   16,17,18,  16,18,19,    // down
   20,21,22,  20,22,23     // back
  ]);

  var o = {};
  o.positionBuffer = prepareArrayBuffer(gl, verticesPositions, 3, gl.FLOAT);
  o.colorBuffer = prepareArrayBuffer(gl, colors, 3, gl.FLOAT);
  o.normalBuffer = prepareArrayBuffer(gl, normals, 3, gl.FLOAT);
  o.texCoordsBuffer = prepareArrayBuffer(gl, texCoords, 2, gl.FLOAT);

  o.index_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.index_buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  o.indicsLenght = indices.length;
  return o;
}

function initTextures(gl, program) {
  var texture = gl.createTexture();

  var image = new Image();

  image.onload = function () {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.useProgram(program);
    gl.uniform1i(program.u_Sampler, 0);

    gl.bindTexture(gl.TEXTURE_2D, null);
  };

  image.src = "../resources/orange.jpg";

  return texture;
}

function prepareArrayBuffer(gl, data, num, type) {
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  buffer.num = num;
  buffer.type = type;
  return buffer;
}

var ANGLE_STEP = 30.0;
var g_last = Date.now();
function animate(angle) {
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return (newAngle %= 360);
}
