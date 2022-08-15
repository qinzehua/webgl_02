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
    console.log(ev.keyCode);
    switch (ev.keyCode) {
      case 83: // 绕 z-axis 逆时针 正方向
        if (g_joint1Angle < 135.0) g_joint1Angle += ANGLE_STEP;
        break;
      case 87: // 绕 z-axis 顺时针 负方向
        if (g_joint1Angle > -135.0) g_joint1Angle -= ANGLE_STEP;
        break;
      case 68: // 字母D 绕  y-axis 逆时针 表示正旋转正方向
        g_arm1Angle = (g_arm1Angle + ANGLE_STEP) % 360;
        break;
      case 65: // 字母A 绕  y-axis 顺时针 表示负的旋转正方向
        g_arm1Angle = (g_arm1Angle - ANGLE_STEP) % 360;
        break;
      case 90: // 'ｚ'key -> the positive rotation of joint2
        g_joint2Angle = (g_joint2Angle + ANGLE_STEP) % 360;
        break;
      case 88: // 'x'key -> the negative rotation of joint2
        g_joint2Angle = (g_joint2Angle - ANGLE_STEP) % 360;
        break;
      case 86: // 'v'key -> the positive rotation of joint3
        if (g_joint3Angle < 60.0)
          g_joint3Angle = (g_joint3Angle + ANGLE_STEP) % 360;
        break;
      case 67: // 'c'key -> the nagative rotation of joint3
        if (g_joint3Angle > -60.0)
          g_joint3Angle = (g_joint3Angle - ANGLE_STEP) % 360;
        break;
      default:
        return; // Skip drawing at no effective action
    }
    draw(gl, indces.n1, u_MvpMatrix, u_NormalMatrix);
  };
  draw(gl, indces.n1, u_MvpMatrix, u_NormalMatrix);
}

function initVertexBuffers(gl) {
  // prettier-ignore
  var positions1 = [
    0.5, 1.0, 0.5, -0.5, 1.0, 0.5, -0.5, 0.0, 0.5,  0.5, 0.0, 0.5, // v0-v1-v2-v3 front
    0.5, 1.0, 0.5,  0.5, 0.0, 0.5,  0.5, 0.0,-0.5,  0.5, 1.0,-0.5, // v0-v3-v4-v5 right
    0.5, 1.0, 0.5,  0.5, 1.0,-0.5, -0.5, 1.0,-0.5, -0.5, 1.0, 0.5, // v0-v5-v6-v1 up
   -0.5, 1.0, 0.5, -0.5, 1.0,-0.5, -0.5, 0.0,-0.5, -0.5, 0.0, 0.5, // v1-v6-v7-v2 left
   -0.5, 0.0,-0.5,  0.5, 0.0,-0.5,  0.5, 0.0, 0.5, -0.5, 0.0, 0.5, // v7-v4-v3-v2 down
    0.5, 0.0,-0.5, -0.5, 0.0,-0.5, -0.5, 1.0,-0.5,  0.5, 1.0,-0.5  // v4-v7-v6-v5 back
  ];

  // prettier-ignore
  var normals1 = [
    0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0, // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0, // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0, // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  // v4-v7-v6-v5 back

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
  var r = 0.3;
  var positions2 = [];
  var indices2 = [];

  // Generate coordinates
  for (j = 0; j <= SPHERE_DIV; j++) {
    aj = (j * Math.PI) / SPHERE_DIV;
    sj = Math.sin(aj) * r;
    cj = Math.cos(aj) * r;
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
    new Uint16Array([...indices1, ...indices2]),
    gl.STATIC_DRAW
  );

  return {
    n1: indices1.length,
    n2: indices2.length,
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

var ANGLE_STEP = 3.0;
var g_arm1Angle = 0.0; // 上臂
var g_joint1Angle = 0.0; // 前臂
var g_joint2Angle = 0.0; // 手掌
var g_joint3Angle = 0.0; //手指

const mvpMatrix = new Matrix4();
var modalMatrix = new Matrix4();
const viewProjMatrix = new Matrix4();
const g_normalMatrix = new Matrix4();

viewProjMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 100.0);
viewProjMatrix.lookAt(20.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

function draw(gl, n, u_MvpMatrix, u_NormalMatrix) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // 基座
  var baseHeight = 2.0;
  modalMatrix.setTranslate(0.0, -12.0, 0.0);
  drawBox(gl, n, 10, baseHeight, 10, u_MvpMatrix, u_NormalMatrix);

  // 上臂
  var arm1Length = 10.0;
  modalMatrix.translate(0.0, baseHeight, 0.0);
  modalMatrix.rotate(g_arm1Angle, 0.0, 1.0, 0.0); //绕y轴旋转
  drawBox(gl, n, 3.0, arm1Length, 3.0, u_MvpMatrix, u_NormalMatrix);

  // 前臂
  var arm2Length = 10.0;
  modalMatrix.translate(0.0, arm1Length, 0.0);
  modalMatrix.rotate(g_joint1Angle, 0.0, 0.0, 1.0); //绕z轴旋转
  drawBox(gl, n, 4.0, arm2Length, 4.0, u_MvpMatrix, u_NormalMatrix);

  //手掌
  var palmLength = 2.0;
  modalMatrix.translate(0.0, arm2Length, 0.0);
  modalMatrix.rotate(g_joint2Angle, 0.0, 1.0, 0.0); //绕z轴旋转
  drawBox(gl, n, 2.0, palmLength, 6.0, u_MvpMatrix, u_NormalMatrix);

  modalMatrix.translate(0.0, palmLength, 0.0);
  pushMatrix(modalMatrix);
  modalMatrix.translate(0, 0, 2);
  modalMatrix.rotate(g_joint3Angle, 1.0, 0.0, 0.0);
  drawBox(gl, n, 2.0, 2, 1.0, u_MvpMatrix, u_NormalMatrix);
  modalMatrix = popMatrix();

  pushMatrix(modalMatrix);
  modalMatrix.translate(0, 0, -2);
  modalMatrix.rotate(-g_joint3Angle, 1.0, 0.0, 0.0);
  drawBox(gl, n, 2.0, 2, 1.0, u_MvpMatrix, u_NormalMatrix);
  modalMatrix = popMatrix();
}

function drawBox(gl, n, width, height, depth, u_MvpMatrix, u_NormalMatrix) {
  // 生成一个新的modalMatrix，在此基础上缩放
  // 避免影响后续方块的大小
  pushMatrix(modalMatrix);
  modalMatrix.scale(width, height, depth);
  mvpMatrix.set(viewProjMatrix).multiply(modalMatrix);
  g_normalMatrix.setInverseOf(modalMatrix);
  g_normalMatrix.transpose();

  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
  modalMatrix = popMatrix();
}

var g_matrixStack = [];
function pushMatrix(m) {
  var m2 = new Matrix4(m);
  g_matrixStack.push(m2);
}

function popMatrix() {
  return g_matrixStack.pop();
}
