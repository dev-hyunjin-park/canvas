// 1. 이미지 데이터로 픽셀 정보를 조작한다
// 2. 밝기에 따라 다른 스피드로 흘러내리는 파티클들을 만든다

const myImage = document.getElementById("image");

window.addEventListener("load", () => {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx.drawImage(myImage, 0, 0, canvas.width, canvas.height);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let particlesArray = [];
  const numberOfParticles = 5000;

  // x, y 좌표와 함께 이미지의 각 픽셀의 밝기 값을 저장한다
  let mappedImage = [];

  for (let y = 0; y < canvas.height; y++) {
    // 각 픽셀 정보(밝기)를 한 줄씩 나눠서 row에 저장한다
    let row = [];
    // y1 [x1, x2, x3, ... ]
    // y2 [x1, x2, x3, ... ]
    // 정보를 꺼내올 때는 mappedImage[y index][x index]
    for (let x = 0; x < canvas.width; x++) {
      const index = (y * canvas.width + x) * 4;
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      const brightness = calculateRelativeBrightness(red, green, blue);
      // brightness를 굳이 배열로 저장해야하는 이유가 있을까..?
      const cell = [(cellBrightness = brightness)];
      row.push(cell);
      // 또 다른 배열을 만들어서 픽셀의 실제 색상을 저장하고 사용할 수도 있다
    }
    mappedImage.push(row);
  }

  // 상대 밝기 계산
  function calculateRelativeBrightness(red, green, blue) {
    return (
      Math.sqrt(
        red * red * 0.299 + green * green * 0.587 + blue * blue * 0.114
      ) / 100
    );
  }

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.speed = 0;
      this.velocity = Math.random() * 0.5;
      // this.size = Math.random() * 1.5 + 1;
      this.size = 1;
      this.position1 = Math.floor(this.y);
      this.position2 = Math.floor(this.x);
    }
    update() {
      this.position1 = Math.floor(this.y);
      this.position2 = Math.floor(this.x);
      this.speed = mappedImage[this.position1][this.position2][0]; // brightness
      this.movement = 2.5 - this.speed + this.velocity;
      // 2.5 - this.speed: 밝기가 0에 가까운(어두운) 파티클일 수록 빠르게 움직인다
      // + this.velocity: random한 움직임을 위해
      this.y += this.movement;

      // 파티클 위치가 캔버스를 벗어나면 초기화
      if (this.y > canvas.height) {
        this.y = 0;
        this.x = Math.random() * canvas.width;
      }
    }
    draw() {
      ctx.beginPath();
      ctx.fillStyle = "white";
      // x, y, size, start angle, end angle
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function init() {
    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push(new Particle());
    }
  }
  init();
  function animate() {
    // ctx.drawImage(myImage, 0, 0, canvas.width, canvas.height);

    ctx.globalAlpha = 0.05;
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
      ctx.globalAlpha = particlesArray[i].speed * 0.2;
      particlesArray[i].draw();
    }
    requestAnimationFrame(animate);
  }
  animate();
});
