// TO DO: Mouse interaction - fade out

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
      this.context = this.effect.context2;
      this.x = Math.floor(x);
      this.y = Math.floor(y);

      this.color = color;
      this.opacity = 0.2;
      this.size = this.effect.gap;
      // this.fadeSpeed = 0.02;
    }

    draw() {
      const { red, green, blue } = this.color;

      this.context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${this.opacity})`;
      this.context.fillRect(this.x, this.y, this.size, this.size);
    }
  }

  class Effect {
    constructor(width, height, context1, context2) {
      this.width = width;
      this.height = height;
      this.particlesArray1 = [];
      this.particlesArray2 = [];
      this.context1 = context1;
      this.context2 = context2;
      this.image1 = document.getElementById("image1");
      this.image2 = document.getElementById("image2");

      this.centerX = this.width * 0.5;
      this.centerY = this.height * 0.5;
      this.x = this.centerX - this.image1.width * 0.5;
      this.y = this.centerY - this.image1.height * 0.5;
      this.gap = 2;

      this.dx = 0;
      this.dy = 0;
      this.distance = 0;

      this.mouse = {
        radius: 10,
        x: undefined,
        y: undefined,
      };
      window.addEventListener("mousemove", (e) => {
        this.mouse.x = e.x;
        this.mouse.y = e.y;
      });
    }

    getImageData(ctx, arr) {
      const pixels = ctx.getImageData(0, 0, this.width, this.height).data;
      for (let y = 0; y < this.height; y += this.gap) {
        for (let x = 0; x < this.width; x += this.gap) {
          const index = (y * this.width + x) * 4;
          const red = pixels[index];
          const green = pixels[index + 1];
          const blue = pixels[index + 2];
          const alpha = pixels[index + 3];
          const color = { red, green, blue };

          if (alpha > 0) {
            arr.push(new Particle(this, x, y, color));
          }
        }
      }
    }

    init() {
      this.context1.drawImage(this.image1, this.x, this.y);
      this.context2.drawImage(this.image2, this.x, this.y);
      this.getImageData(this.context1, this.particlesArray1);
      this.getImageData(this.context2, this.particlesArray2);
    }

    draw() {
      this.particlesArray1.forEach((particle) => {
        const dx = this.mouse.x - particle.x;
        const dy = this.mouse.y - particle.y;

        particle.distance = Math.sqrt(dx * dx + dy * dy);

        if (particle.distance < this.mouse.radius) {
          particle.draw();
        }
      });
    }
  }

  const effect = new Effect(canvas1.width, canvas1.height, ctx1, ctx2);
  effect.init();

  function animate() {
    effect.draw();

    requestAnimationFrame(animate);
  }
  animate();
});
