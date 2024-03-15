// 구현 방식
// 1. 캔버스1에 이미지1, 캔버스2에 이미지2를 겹쳐서 그린다 (같은 이미지)
// 2. 위에 겹쳐진 캔버스2의 채도를 떨어트린다
// 3. 마우스 위치에 따라 캔버스2의 이미지 픽셀 위치를 변경해서 캔버스1의 이미지(원래 색상을 가진 캔버스)가 보이게 만든다

window.addEventListener("load", function () {
  const canvas1 = document.getElementById("canvas1");
  const ctx1 = canvas1.getContext("2d");
  canvas1.width = window.innerWidth;
  canvas1.height = window.innerHeight;

  const canvas2 = document.getElementById("canvas2");
  const ctx2 = canvas2.getContext("2d");
  canvas2.width = window.innerWidth;
  canvas2.height = window.innerHeight;

  class Particle {
    constructor(effect, x, y, color) {
      this.effect = effect;
      this.x = x;
      this.y = y;
      this.originX = Math.floor(x); // 하위 픽셀 값을 얻지 않도록
      this.originY = Math.floor(y);
      this.color = color;
      this.opacity = 1;
      this.size = this.effect.gap;
      this.vx = 0;
      this.vy = 0;
      this.ease = 0.05;
      this.dx = 0;
      this.dy = 0;
      this.distance = 0;
      this.angle = 0;
      this.friction = 0.5;
    }

    draw(context) {
      const { red, green, blue } = this.color;
      context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${this.opacity})`;
      context.fillRect(this.x, this.y, this.size, this.size);
    }

    update() {
      // 마우스의 현재 위치와 파티클의 위치 사이의 거리를 계산한다
      this.dx = this.effect.mouse.x - this.x;
      this.dy = this.effect.mouse.y - this.y;
      this.distance = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
      // 거리가 가까울 수록 더 큰 힘을 작용한다
      this.force = -this.effect.mouse.radius / this.distance;
      this.opacity = 1 - this.effect.mouse.radius / this.distance;
      if (this.opacity < 0) {
        this.opacity = 0;
      }

      if (this.distance < this.effect.mouse.radius) {
        this.angle = Math.atan2(this.dy, this.dx);
        this.vx += Math.cos(this.angle);
        this.vy += Math.sin(this.angle);
      }

      this.x += (this.vx *= this.friction) + (this.originX - this.x);
      this.y += (this.vy *= this.friction) + (this.originY - this.y);
    }
  }

  class Effect {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.particlesArray = [];
      this.image1 = document.getElementById("image1");
      this.image2 = document.getElementById("image2");
      this.desaturateAmount = 0.3;
      this.centerX = this.width * 0.5;
      this.centerY = this.height * 0.5;
      this.x = this.centerX - this.image1.width * 0.5;
      this.y = this.centerY - this.image1.height * 0.5;
      this.gap = 2;
      this.mouse = {
        radius: 30,
        x: undefined,
        y: undefined,
      };
      this.color;
      window.addEventListener("mousemove", (e) => {
        this.mouse.x = e.x;
        this.mouse.y = e.y;
      });
    }

    init(context1, context2) {
      context1.drawImage(this.image1, this.x, this.y);
      context2.drawImage(this.image2, this.x, this.y);

      const pixels = context2.getImageData(0, 0, this.width, this.height).data;

      for (let y = 0; y < this.height; y += this.gap) {
        for (let x = 0; x < this.width; x += this.gap) {
          const index = (y * this.width + x) * 4;
          // * desaturatedAmount로 채도를 낮춘다
          const red = pixels[index] * this.desaturateAmount;
          const green = pixels[index + 1] * this.desaturateAmount;
          const blue = pixels[index + 2] * this.desaturateAmount;
          const alpha = pixels[index + 3];

          const color = { red, green, blue };
          if (alpha > 0) {
            this.particlesArray.push(new Particle(this, x, y, color));
          }
        }
      }
    }

    draw(context) {
      this.particlesArray.forEach((particle) => particle.draw(context));
    }

    update() {
      this.particlesArray.forEach((particle) => particle.update());
    }
  }

  const effect = new Effect(canvas2.width, canvas2.height);
  effect.init(ctx1, ctx2);

  function animate() {
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    effect.draw(ctx2);
    effect.update();
    requestAnimationFrame(animate);
  }
  animate();
});
