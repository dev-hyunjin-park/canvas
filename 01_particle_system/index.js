// Object-oriendted

const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
// Particle 내부에 작성하면 매번 적용되기때문에 효율성을 위해 전역에 작성한다
ctx.fillStyle = "white";
const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
gradient.addColorStop(0, "white");
gradient.addColorStop(0.5, "magenta");
gradient.addColorStop(1, "blue");
ctx.fillStyle = gradient;
ctx.strokeStyle = "white";

class Particle {
  constructor(effect) {
    this.effect = effect;
    this.radius = Math.random() * 10 + 2;
    this.x =
      this.radius + Math.random() * (this.effect.width - this.radius * 2);
    this.y =
      this.radius + Math.random() * (this.effect.height - this.radius * 2);
    this.vx = Math.random() * 1 - 0.5; // -0.5에서 0.5 사이의 랜덤 값
    this.vy = Math.random() * 1 - 0.5;
  }
  draw(context) {
    // Hue(색조): 0~360까지의 값. 0: r, 120: g, 240: b
    // Saturation(채도): 0~100%
    // Lightness(밝기): 0~100%
    // context.fillStyle = "hsl(" + this.x * 0.5 + ", 100%, 50%)";
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fill();
  }
  update() {
    this.x += this.vx;
    if (this.x > this.effect.width - this.radius || this.x < 0 + this.radius) {
      this.vx *= -1;
    }
    this.y += this.vy;
    if (this.y > this.effect.height - this.radius || this.y < 0 + this.radius) {
      this.vy *= -1;
    }
  }
}

class Effect {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.particles = [];
    this.numberOfParticles = 300;
    // 객체가 생성될 때 자동으로 해당 메서드가 호출되어 파티클들을 생성한다
    this.createParticles();
  }

  createParticles() {
    for (let i = 0; i < this.numberOfParticles; i++) {
      this.particles.push(new Particle(this));
    }
  }

  handleParticles(context) {
    this.connectParticles(context);
    this.particles.forEach((particle) => {
      particle.draw(context);
      particle.update();
    });
  }

  // 가장 가까운 입자와 선으로 연결한다
  connectParticles(context) {
    const maxDistance = 100;
    for (let a = 0; a < this.particles.length; a++) {
      for (let b = a; b < this.particles.length; b++) {
        const dx = this.particles[a].x - this.particles[b].x;
        const dy = this.particles[a].y - this.particles[b].y;
        const distance = Math.hypot(dx, dy);
        if (distance < maxDistance) {
          const opacity = 1 - distance / maxDistance; // 거리가 가까울 수록 1, 멀어질 수록 0의 값을 가진다
          // save, restore: 캔버스의 그래픽 상태를 저장하고 복원 - 매번 초기 설정을 다시 지정할 필요가 없어서 효율적
          context.save(); // 캔버스(context)의 현재 상태를 저장
          context.beginPath();
          context.globalAlpha = opacity;
          context.moveTo(this.particles[a].x, this.particles[a].y);
          context.lineTo(this.particles[b].x, this.particles[b].y);
          context.stroke();
          context.restore(); // 이전 상태로 복원. context.save() 이후의 상태로 복원하여 이전에 설정된 상태(투명도)를 다시 사용
        }
      }
    }
  }
}

const effect = new Effect(canvas);

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  effect.handleParticles(ctx);
  requestAnimationFrame(animate);
}
animate();
