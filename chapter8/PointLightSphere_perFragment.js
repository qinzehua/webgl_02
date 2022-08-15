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

  var n = initVertexBuffers(gl);

  // 设置清除的背景色
  gl.clearColor(0.0, 0.0, 0.0, 1);
  //深度测试
  gl.enable(gl.DEPTH_TEST);

  const u_MvpMatrix = gl.getUniformLocation(gl.program, "u_MvpMatrix");
  const u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
  const u_LightPosition = gl.getUniformLocation(gl.program, "u_LightPosition");
  const u_EnvLight = gl.getUniformLocation(gl.program, "u_EnvLight");
  const u_TanslateMatrix = gl.getUniformLocation(
    gl.program,
    "u_TanslateMatrix"
  );

  gl.uniform3f(u_EnvLight, 0.2, 0.2, 0.2);

  const verticx4 = new Matrix4();
  //设置投影方式
  verticx4.setPerspective(30, canvas.width / canvas.height, 1, 100);
  // 设置视点
  verticx4.lookAt(0, 0, 6, 0, 0, 0, 0, 1, 0);

  let angle = 0;
  const rotateMatrix = new Matrix4();
  var mvpMatrix = new Matrix4();
  const normalMatrix = new Matrix4();

  let y = -15;
  function tick() {
    y += 0.01;
    angle = animate(angle);
    //点光源位置
    gl.uniform3f(u_LightPosition, 1, y, 0);

    // 投影+视点+旋转矩阵
    rotateMatrix.setRotate(angle, 0, 1, 0);
    mvpMatrix.set(verticx4).multiply(rotateMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    // 旋转矩阵的逆转置矩阵
    normalMatrix.setInverseOf(rotateMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    // 旋转矩阵
    gl.uniformMatrix4fv(u_TanslateMatrix, false, rotateMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(tick);
  }
  tick();
}

function initVertexBuffers(gl) {
  var SPHERE_DIV = 24;

  var i, ai, si, ci;
  var j, aj, sj, cj;
  var p1, p2;

  var positions = [];
  var indices = [];

  // Generate coordinates
  for (j = 0; j <= SPHERE_DIV; j++) {
    aj = (j * Math.PI) / SPHERE_DIV;
    sj = Math.sin(aj);
    cj = Math.cos(aj);
    for (i = 0; i <= SPHERE_DIV; i++) {
      ai = (i * 2 * Math.PI) / SPHERE_DIV;
      si = Math.sin(ai);
      ci = Math.cos(ai);

      positions.push(si * sj); // X
      positions.push(cj); // Y
      positions.push(ci * sj); // Z
    }
  }

  // Generate indices
  for (j = 0; j < SPHERE_DIV; j++) {
    for (i = 0; i < SPHERE_DIV; i++) {
      p1 = j * (SPHERE_DIV + 1) + i;
      p2 = p1 + (SPHERE_DIV + 1);

      indices.push(p1);
      indices.push(p2);
      indices.push(p1 + 1);

      indices.push(p1 + 1);
      indices.push(p2);
      indices.push(p2 + 1);
    }
  }

  initArrayBuffer(gl, "a_Position", new Float32Array(positions), gl.FLOAT, 3);
  initArrayBuffer(gl, "a_Normal", new Float32Array(positions), gl.FLOAT, 3);

  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log("Failed to create the buffer object");
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  return indices.length;
}

// Rotation angle (degrees/second)
var ANGLE_STEP = 30.0;
// Last time that this function was called
var g_last = Date.now();
function animate(angle) {
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  // Update the current rotation angle (adjusted by the elapsed time)
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return (newAngle %= 360);
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

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return true;
}
