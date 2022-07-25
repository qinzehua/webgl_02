var VSHADER_SOURCE = document.getElementById("vshader").innerHTML;
var FSHADER_SOURCE = document.getElementById("fshader").innerHTML;

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

  var cube = initVertexBuffers(gl);

  gl.clearColor(0.0, 0.0, 0.0, 1);
  gl.enable(gl.DEPTH_TEST);

  var tick = function () {
    angle = animate(angle);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawSolidCube(gl, cube, solideProgram);
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

function drawSolidCube(gl, cube, solideProgram) {
  gl.useProgram(solideProgram);
  initAttributeVariable(gl, solideProgram.a_Position, cube.positionBuffer);
  initAttributeVariable(gl, solideProgram.a_Color, cube.colorBuffer);
  initAttributeVariable(gl, solideProgram.a_Normal, cube.normalBuffer);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cube.index_buffer);

  modalMatrix.setTranslate(-2, 0.0, 0.0);
  modalMatrix.rotate(20.0, 1.0, 0.0, 0.0);
  modalMatrix.rotate(angle, 0.0, 1.0, 0.0);

  g_MvpMatrix.set(verticx4).multiply(modalMatrix);
  gl.uniformMatrix4fv(solideProgram.u_MvpMatrix, false, g_MvpMatrix.elements);

  g_NormalMatrix.setInverseOf(modalMatrix);
  g_NormalMatrix.transpose();
  gl.uniformMatrix4fv(
    solideProgram.u_NormalMatrix,
    false,
    g_NormalMatrix.elements
  );
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

  o.index_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.index_buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  o.indicsLenght = indices.length;
  return o;
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
