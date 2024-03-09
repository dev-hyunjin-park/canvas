const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Particle 내부에 작성하면 매번 적용되기때문에 효율성을 위해 전역에 작성한다
const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
gradient.addColorStop(0, "white");
gradient.addColorStop(0.5, "gold");
gradient.addColorStop(1, "orangered");
ctx.fillStyle = gradient;
ctx.strokeStyle = "white";

class Particle {
  constructor(effect) {
    this.effect = effect;
    // Math.floor: 정수로 사용하는 것이 퍼포먼스 면에서 좋음
    this.radius = Math.floor(Math.random() * 10 + 1);
    this.x =
      this.radius + Math.random() * (this.effect.width - this.radius * 2);
    this.y =
      this.radius + Math.random() * (this.effect.height - this.radius * 2);
    this.vx = Math.random() * 1 - 0.5; // -0.5에서 0.5 사이의 랜덤 값
    this.vy = Math.random() * 1 - 0.5;
    this.pushX = 0;
    this.pushY = 0;
    this.friction = 0.7; // friction 값은 항상 1보다 작아야함!
  }
  draw(context) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fill();
  }
  update() {
    if (this.effect.mouse.pressed) {
      // particle과 마우스 위치 사이의 거리를 구한다
      const dx = this.x - this.effect.mouse.x;
      const dy = this.y - this.effect.mouse.y;
      const distance = Math.hypot(dx, dy);

      // 마우스에 가까운 파티클일 수록 빠르게 움직인다
      const force = this.effect.mouse.radius / distance;

      // 파티클의 위치가 마우스 가까이 있다면, 두 지점 사이의 각도를 이용해서 마우스 커서의 방향으로 파티클을 이동한다
      if (distance < this.effect.mouse.radius) {
        const angle = Math.atan2(dy, dx);
        this.pushX += Math.cos(angle) * force;
        this.pushY += Math.sin(angle) * force;
      }
    }
    // 마찰(0.95)을 곱해주면 애니메이션이 진행됨에 따라 점점 속도가 줄어들게 된다
    this.x += (this.pushX *= this.friction) + this.vx;
    this.y += (this.pushY *= this.friction) + this.vy;

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
    this.numberOfParticles = 300;
    this.context = context;
    // 객체가 생성될 때 자동으로 해당 메서드가 호출되어 파티클들을 생성한다
    this.createParticles();

    this.mouse = {
      x: 0,
      y: 0,
      pressed: false,
      radius: 200,
    };

    window.addEventListener("resize", (e) => {
      this.resize(
        e.target.window.innerWidth,
        e.target.window.innerHeight,
        this.context
      );
    });
    window.addEventListener("mousemove", (e) => {
      // if (this.mouse.pressed) {
      this.mouse.x = e.x;
      this.mouse.y = e.y;
      // }
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
    const gradient = this.context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "white");
    gradient.addColorStop(0.5, "gold");
    gradient.addColorStop(1, "orangered");
    this.context.fillStyle = gradient;
    this.context.strokeStyle = "white";
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
