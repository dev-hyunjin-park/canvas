const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Particle 내부에 작성하면 매번 적용되기때문에 효율성을 위해 전역에 작성한다
// let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
// gradient.addColorStop(0, "pink");
// gradient.addColorStop(0.5, "red");
// gradient.addColorStop(1, "magenta");
// ctx.fillStyle = gradient;

class Particle {
  constructor(effect, index) {
    this.effect = effect;
    this.active = true;
    this.opacity = 1;
    // Math.floor: 정수로 사용하는 것이 퍼포먼스 면에서 좋음
    this.radius = Math.floor(Math.random() * 8 + 8);
    this.minRadius = this.radius / 2;
    this.maxRadius = this.radius * 2;
    this.maxDistance = 80;
    this.x = this.effect.mouse.x + Math.random() * 20 - 10;
    this.y = this.effect.mouse.y + Math.random() * 20 - 10;
    this.initialX = this.x;
    this.initialY = this.y;
    this.vx = Math.random() * 0.1 - 0.1;
    this.vy = Math.random() * 0.1 - 0.1;
    this.index = index;
  }
  draw(context) {
    context.fillStyle = `rgba(255, 0, 100, ${this.opacity})`;
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "rgba(255, 255, 255, 0.3)";
    context.stroke();

    // bubble's reflection
    context.fillStyle = "rgba(255, 255, 255, 0.8)";
    context.beginPath();
    context.arc(
      this.x - this.radius * 0.2,
      this.y - this.radius * 0.3,
      this.radius * 0.6,
      0,
      Math.PI * 2
    );
    context.fill();
    context.fillStyle = "rgba(255, 255, 255, 1)";
    context.beginPath();
    context.arc(
      this.x - this.radius * 0.3,
      this.y - this.radius * 0.3,
      this.radius * 0.4,
      0,
      Math.PI * 2
    );
    context.fill();
  }

  update() {
    // particle이 생겨난 위치와 현재 위치 사이의 거리를 구한다
    const dx = this.x - this.initialX;
    const dy = this.y - this.initialY;
    const distance = Math.hypot(dx, dy);

    // 버블이 생겨난 위치와 현재 위치를 비교해서 100 이상이 되면 화면에 그리지 않는다
    if (distance > Math.random() * 60 + 60) {
      this.active = false;
    } else {
      // distance를 opacity 값으로 매핑해서 전달한다
      this.opacity = 1 - distance / this.maxDistance;
    }

    if (this.radius > this.minRadius) {
      this.radius -= 0.1;
    }

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < this.radius) {
      this.x = this.radius;
      this.vx *= -1;
    } else if (this.x > this.effect.width - this.radius) {
      this.x = this.effect.width - this.radius;
      this.vx *= -1;
    }
    if (this.y < this.radius) {
      this.y = this.radius;
      this.vy *= -1;
    } else if (this.y > this.effect.height - this.radius) {
      this.y = this.effect.height - this.radius;
      this.vy *= -1;
    }
  }

  reset() {
    this.x =
      this.radius + Math.random() * (this.effect.width - this.radius * 2);
    this.y =
      this.radius + Math.random() * (this.effect.height - this.radius * 2);
  }
}

class Effect {
  constructor(canvas, context) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.particles = [];
    this.numberOfParticles = 10;
    this.context = context;

    this.mouse = {
      x: 0,
      y: 0,
      pressed: false,
      radius: 20,
    };

    window.addEventListener("resize", (e) => {
      this.resize(
        e.target.window.innerWidth,
        e.target.window.innerHeight,
        this.context
      );
    });
    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.x;
      this.mouse.y = e.y;
      if (this.mouse.pressed) {
        this.createParticles();
      }
    });
    window.addEventListener("mousedown", (e) => {
      this.mouse.pressed = true;
    });
    window.addEventListener("mouseup", (e) => {
      this.mouse.pressed = false;
    });
  }

  createParticles() {
    for (let i = 0; i < this.numberOfParticles; i++) {
      if (i % 4 === 0) {
        this.particles.push(new Particle(this, i));
      }
    }
  }

  handleParticles(context) {
    this.particles.forEach((particle) => {
      if (!particle.active) return;

      particle.draw(context);
      particle.update();
    });
  }

  // 가장 가까운 입자와 선으로 연결한다
  connectParticles(context) {
    const maxDistance = 80;
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

  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;
    this.context.fillStyle = "blue";
    // 방향과 중단점을 다시 계산해야하기때문에 다시 한 번 작성한다.. -> function 만들어도 될 듯
    gradient = this.context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "pink");
    gradient.addColorStop(0.5, "red");
    gradient.addColorStop(1, "magenta");
    this.context.fillStyle = gradient;

    this.particles.forEach((particle) => {
      particle.reset();
    });
  }
}

const effect = new Effect(canvas, ctx);

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  effect.handleParticles(ctx);
  requestAnimationFrame(animate);
}
animate();
