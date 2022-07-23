var VSHADER_SOURCE = document.getElementById("vshader").innerHTML;
var FSHADER_SOURCE = document.getElementById("fshader").innerHTML;

function main() {
  var canvas = document.getElementById("webgl");

  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to intialize shaders.");
    return;
  }

  // Set the vertex information
  var indces = initVertexBuffers(gl);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  const u_MvpMatrix = gl.getUniformLocation(gl.program, "u_MvpMatrix");
  const u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
  document.onkeydown = (ev) => {
    switch (ev.keyCode) {
      case 38:
        if (g_joint1Angle < 135.0) g_joint1Angle += ANGLE_STEP;
        break;
      case 40:
        if (g_joint1Angle > -135.0) g_joint1Angle -= ANGLE_STEP;
        break;
      case 39:
        g_arm1Angle = (g_arm1Angle + ANGLE_STEP) % 360;
        break;
      case 37:
        g_arm1Angle = (g_arm1Angle - ANGLE_STEP) % 360;
        break;
      default:
        return; // Skip drawing at no effective action
    }
    draw(gl, indces, u_MvpMatrix, u_NormalMatrix);
  };
  draw(gl, indces, u_MvpMatrix, u_NormalMatrix);
}

function initVertexBuffers(gl) {
  // prettier-ignore
  var positions1 = [
    1.5, 10.0, 1.5, -1.5, 10.0, 1.5, -1.5,  0.0, 1.5,  1.5,  0.0, 1.5, // v0-v1-v2-v3 front
    1.5, 10.0, 1.5,  1.5,  0.0, 1.5,  1.5,  0.0,-1.5,  1.5, 10.0,-1.5, // v0-v3-v4-v5 right
    1.5, 10.0, 1.5,  1.5, 10.0,-1.5, -1.5, 10.0,-1.5, -1.5, 10.0, 1.5, // v0-v5-v6-v1 up
   -1.5, 10.0, 1.5, -1.5, 10.0,-1.5, -1.5,  0.0,-1.5, -1.5,  0.0, 1.5, // v1-v6-v7-v2 left
   -1.5,  0.0,-1.5,  1.5,  0.0,-1.5,  1.5,  0.0, 1.5, -1.5,  0.0, 1.5, // v7-v4-v3-v2 down
    1.5,  0.0,-1.5, -1.5,  0.0,-1.5, -1.5, 10.0,-1.5,  1.5, 10.0,-1.5  // v4-v7-v6-v5 back
  ];

  // prettier-ignore
  var normals1 = [
    0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0, // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0, // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0, // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0  // v4-v7-v6-v5 back
  ];

  // prettier-ignore
  var indices1 =[
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ];

  var SPHERE_DIV = 24;

  var i, ai, si, ci;
  var j, aj, sj, cj;
  var p1, p2;

  var positions2 = [];
  var indices2 = [];

  // Generate coordinates
  for (j = 0; j <= SPHERE_DIV; j++) {
    aj = (j * Math.PI) / SPHERE_DIV;
    sj = Math.sin(aj);
    cj = Math.cos(aj);
    for (i = 0; i <= SPHERE_DIV; i++) {
      ai = (i * 2 * Math.PI) / SPHERE_DIV;
      si = Math.sin(ai);
      ci = Math.cos(ai);

      positions2.push(si * sj); // X
      positions2.push(cj); // Y
      positions2.push(ci * sj); // Z
    }
  }

  // Generate indices
  for (j = 0; j < SPHERE_DIV; j++) {
    for (i = 0; i < SPHERE_DIV; i++) {
      p1 = j * (SPHERE_DIV + 1) + i;
      p2 = p1 + (SPHERE_DIV + 1);

      indices2.push(p1);
      indices2.push(p2);
      indices2.push(p1 + 1);

      indices2.push(p1 + 1);
      indices2.push(p2);
      indices2.push(p2 + 1);
    }
  }

  // Write the vertex property to buffers (coordinates and normals)
  const pos = new Float32Array([...positions1, ...positions2]);
  if (!initArrayBuffer(gl, "a_Position", pos, gl.FLOAT, 3)) return -1;
  if (
    !initArrayBuffer(
      gl,
      "a_Normal",
      new Float32Array([...normals1, ...positions2]),
      gl.FLOAT,
      3
    )
  )
    return -1;

  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log("Failed to create the buffer object");
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint8Array([...indices1, ...indices2]),
    gl.STATIC_DRAW
  );

  return {
    n1: indices1.length,
    n2: indices2.length,
    size: pos.BYTES_PER_ELEMENT,
  };
}

function initArrayBuffer(gl, attribute, data, type, num) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log("Failed to create the buffer object");
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log("Failed to get the storage location of " + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);
  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return true;
}

var canvas = document.getElementById("webgl");
var angle = 10;
var ANGLE_STEP = 3.0;
var g_arm1Angle = -90.0;
var g_joint1Angle = -10.0;
var arm1Length = 10.0;

const mvpMatrix = new Matrix4();
const modalMatrix = new Matrix4();
const viewProjMatrix = new Matrix4();
const g_normalMatrix = new Matrix4();

viewProjMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 100.0);
viewProjMatrix.lookAt(20.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

function draw(gl, indces, u_MvpMatrix, u_NormalMatrix) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  modalMatrix.setTranslate(0.0, -12.0, 0.0);
  modalMatrix.rotate(g_arm1Angle, 0.0, 1.0, 0.0);
  mvpMatrix.set(viewProjMatrix).multiply(modalMatrix);
  g_normalMatrix.setInverseOf(modalMatrix);
  g_normalMatrix.transpose();
  drawBox(gl, indces.n1, 0, u_MvpMatrix, u_NormalMatrix);

  modalMatrix.translate(0.0, arm1Length, 0.0);
  modalMatrix.rotate(g_joint1Angle, 0.0, 0.0, 1.0);
  modalMatrix.scale(1.3, 1.0, 1.3); // Make it a little thicker
  mvpMatrix.set(viewProjMatrix).multiply(modalMatrix);
  g_normalMatrix.setInverseOf(modalMatrix);
  g_normalMatrix.transpose();

  drawBox(gl, indces.n1, 0, u_MvpMatrix, u_NormalMatrix);

  // modalMatrix.rotate(g_joint1Angle, 0.0, 0.0, 1.0);
  // mvpMatrix.set(viewProjMatrix).multiply(modalMatrix);
  // g_normalMatrix.setInverseOf(modalMatrix);
  // g_normalMatrix.transpose();
  // drawBox(gl, indces.n2, indces.n1 * 2, u_MvpMatrix, u_NormalMatrix);
}

function drawBox(gl, n, offset, u_MvpMatrix, u_NormalMatrix) {
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, offset);
}
