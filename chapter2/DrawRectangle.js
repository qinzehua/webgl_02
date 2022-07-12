function main() {
  console.log("--");
  const canvas = document.getElementById("example");
  const context = canvas.getContext("2d");

  context.fillStyle = "rgba(0, 0, 255, 1.0)";
  context.fillRect(120, 10, 150, 150);
}
