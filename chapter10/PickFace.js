var VSHADER_SOURCE = document.getElementById("vshader").innerHTML;
var FSHADER_SOURCE = document.getElementById("fshader").innerHTML;

var canvas = document.getElementById("webgl");

function main() {
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to intialize shaders.");
    return;
  }

  var n = initVertexBuffers(gl);

  gl.clearColor(0.0, 0.0, 0.0, 1);
  gl.enable(gl.DEPTH_TEST);
  const u_MvpMatrix = gl.getUniformLocation(gl.program, "u_MvpMatrix");
  var u_PickedFace = gl.getUniformLocation(gl.program, "u_PickedFace");
  var u_ClickDown = gl.getUniformLocation(gl.program, "u_ClickDown");
  gl.uniform1i(u_PickedFace, -1);
  gl.uniform1i(u_ClickDown, 0);

  canvas.onmousedown = function (ev) {
    var x = ev.clientX,
      y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      var x_in_canvas = x - rect.left,
        y_in_canvas = rect.bottom - y;
      var face = checkFace(
        gl,
        n,
        x_in_canvas,
        y_in_canvas,
        u_ClickDown,
        u_MvpMatrix
      );
      gl.uniform1i(u_PickedFace, face);
      draw(gl, n, u_MvpMatrix);
    }
  };

  var tick = function () {
    angle = animate(angle);
    draw(gl, n, u_MvpMatrix);
    requestAnimationFrame(tick);
  };
  tick();
}

var angle = 0;

const verticx4 = new Matrix4();
verticx4.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);
verticx4.lookAt(3.0, 3.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
const modalMatrix = new Matrix4();
var g_MvpMatrix = new Matrix4();

function draw(gl, n, u_MvpMatrix) {
  modalMatrix.setRotate(angle, 1.0, 0.0, 0.0);
  g_MvpMatrix.set(verticx4).multiply(modalMatrix);
  gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function checkFace(gl, n, x, y, u_ClickDown, u_MvpMatrix) {
  var pixels = new Uint8Array(4);
  gl.uniform1i(u_ClickDown, 1);
  draw(gl, n, u_MvpMatrix);
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  gl.uniform1i(u_ClickDown, 0);

  return pixels[3];
}

function initVertexBuffers(gl) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3

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
  var colors = new Float32Array([
  0.8, 0.5, 0.2,  0.8, 0.5, 0.2,  0.8, 0.5, 0.2,  0.8, 0.5, 0.2,// v0-v1-v2-v3 front
  0.3, 1.0, 0.3,  0.3, 1.0, 0.3,  0.3, 1.0, 0.3,  0.3, 1.0, 0.3,// v0-v3-v4-v5 right
  0.6, 1.0, 1.0,  0.6, 1.0, 1.0,  0.6, 1.0, 1.0,  0.6, 1.0, 1.0,// v0-v5-v6-v1 up
  1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 0.0,// v1-v6-v7-v2 left
  1.0, 0.0, 1.0,  1.0, 0.0, 1.0,  1.0, 0.0, 1.0,  1.0, 0.0, 1.0,// v7-v4-v3-v2 down
  0.0, 1.0, 1.0,  0.0, 1.0, 1.0,  0.0, 1.0, 1.0,  0.0, 1.0, 1.0,// v4-v7-v6-v5 back
]);
  // prettier-ignore
  var faces = new Uint8Array([   // Faces
    1, 1, 1, 1,     // v0-v1-v2-v3 front
    2, 2, 2, 2,     // v0-v3-v4-v5 right
    3, 3, 3, 3,     // v0-v5-v6-v1 up
    4, 4, 4, 4,     // v1-v6-v7-v2 left
    5, 5, 5, 5,     // v7-v4-v3-v2 down
    6, 6, 6, 6,     // v4-v7-v6-v5 back
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
  const index_buffer = gl.createBuffer();

  if (!initArrayBuffer(gl, verticesPositions, 3, gl.FLOAT, "a_Position"))
    return -1;
  if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, "a_Color")) return -1;
  if (!initArrayBuffer(gl, faces, 1, gl.UNSIGNED_BYTE, "a_Face")) return -1;

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

function initArrayBuffer(gl, data, num, type, attribute) {
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  var a_attribute = gl.getAttribLocation(gl.program, attribute);

  if (a_attribute < 0) {
    console.log("Failed to get the storage location of " + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute);
  return true;
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
