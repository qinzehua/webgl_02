function main() {
  const canvas = document.getElementById("example");
  const gl = getWebGLContext(canvas);
  gl.clearColor(1, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
}
