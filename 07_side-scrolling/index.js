class Particle {
  constructor(effect) {
    this.effect = effect;
    // Math.floor: 정수로 사용하는 것이 퍼포먼스 면에서 좋음
    this.radius = Math.floor(Math.random() * 6 + 1);
    this.imageSize = this.radius * 8;
    this.halfImageSize = this.imageSize * 0.5;
    this.minRadius = this.radius;
    this.maxRadius = this.radius * 3;
    this.x =
      this.imageSize +
      Math.random() * (this.effect.width - this.effect.maxDistance * 4);
    this.y =
      this.imageSize +
      Math.random() * (this.effect.height - this.imageSize * 2);
    this.vx = -1;
    this.pushX = 0;
    this.pushY = 0;
    this.friction = 0.95;

    this.image = document.getElementById("star");
  }
  draw(context) {
    context.drawImage(
      this.image,
      this.x - this.halfImageSize,
      this.y - this.halfImageSize,
      this.imageSize,
      this.imageSize
    );
  }
  update() {
    if (this.effect.mouse.pressed) {
      // particle과 마우스 위치 사이의 거리를 구한다
      const dx = this.x - this.effect.mouse.x;
      const dy = this.y - this.effect.mouse.y;
      const distance = Math.hypot(dx, dy);
      const force = this.effect.mouse.radius / distance;

      if (distance < this.effect.mouse.radius) {
        const angle = Math.atan2(dy, dx);
        this.pushX += Math.cos(angle) * force;
        this.pushY += Math.cos(angle) * force;
      }
    }

    this.x += (this.pushX *= this.friction) + this.vx;
    this.y += this.pushY *= this.friction;

    if (this.x < -this.imageSize - this.effect.maxDistance) {
      this.x = this.effect.width + this.imageSize + this.effect.maxDistance;
      this.y =
        this.imageSize +
        Math.random() * (this.effect.height - this.imageSize * 2);
    }
  }

  reset() {
    this.x =
      this.imageSize +
      Math.random() * (this.effect.width - this.effect.maxDistance * 4);
    this.y =
      this.imageSize +
      Math.random() * (this.effect.height - this.imageSize * 2);
  }
}

class Whale {
  constructor(effect) {
    this.effect = effect;
    this.x = this.effect.width * 0.5;
    this.y = this.effect.height * 0.5;
    this.image = document.getElementById("whale2");
    this.angle = 0;
    this.va = 0.01; // velocity of angle
    this.curve = this.effect.height * 0.2;
    this.spriteWidth = 420;
    this.spriteHeight = 285;
    this.frameX = 0;
    this.maxFrame = 38;
    this.frameTimer = 0;
    this.frameInterval = 1000 / 55;
  }

  draw(context) {
    context.save();
    context.translate(this.x, this.y);
    context.rotate(Math.cos(this.angle));
    context.drawImage(
      this.image,
      this.frameX * this.spriteWidth,
      0 * this.spriteHeight,
      this.spriteWidth,
      this.spriteHeight,
      0 - this.spriteWidth * 0.5,
      0 - this.spriteHeight * 0.5,
      this.spriteWidth,
      this.spriteHeight
    );
    context.restore();
  }

  update(deltaTime) {
    this.angle += this.va;
    this.y = this.effect.height * 0.5 + Math.sin(this.angle) * this.curve;
    if (this.angle > Math.PI * 2) {
      this.angle = 0;
    }
    // fps
    if (this.frameTimer > this.frameInterval) {
      this.frameX < this.maxFrame ? this.frameX++ : (this.frameX = 0);
      this.frameTimer = 0;
    } else {
      this.frameTimer += deltaTime;
    }
  }
}

class Effect {
  constructor(canvas, context) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.particles = [];
    this.numberOfParticles = 100;
    this.context = context;
    this.maxDistance = 110;
    this.whale = new Whale(this);

    // 객체가 생성될 때 자동으로 해당 메서드가 호출되어 파티클들을 생성한다
    this.createParticles();

    this.mouse = {
      x: 0,
      y: 0,
      pressed: false,
      radius: 60,
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

  handleParticles(context, deltaTime) {
    this.whale.draw(context);
    this.whale.update(deltaTime);
    this.connectParticles(context);
    this.particles.forEach((particle) => {
      particle.draw(context);
      particle.update();
    });
  }

  // 가장 가까운 입자와 선으로 연결한다
  connectParticles(context) {
    for (let a = 0; a < this.particles.length; a++) {
      for (let b = a; b < this.particles.length; b++) {
        const dx = this.particles[a].x - this.particles[b].x;
        const dy = this.particles[a].y - this.particles[b].y;
        const distance = Math.hypot(dx, dy);
        if (distance < this.maxDistance) {
          const opacity = 1 - distance / this.maxDistance; // 거리가 가까울 수록 1, 멀어질 수록 0의 값을 가진다
          // save, restore: 캔버스의 그래픽 상태를 저장하고 복원 - 매번 초기 설정을 다시 지정할 필요가 없어서 효율적
          context.save(); // 캔버스(context)의 현재 상태를 저장
          context.beginPath();
          context.globalAlpha = opacity;
          context.moveTo(this.particles[a].x, this.particles[a].y);
          context.lineTo(this.particles[b].x, this.particles[b].y);
          context.strokeStyle = "white";
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
    this.whale.x = this.width * 0.4;
    this.whale.y = this.height * 0.5;
    this.whale.curve = this.height * 0.2;

    this.particles.forEach((particle) => {
      particle.reset();
    });
  }
}

// 이미지를 포함한 모든 종속 리소스가 로드된 후에 초기화
window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const effect = new Effect(canvas, ctx);

  let lastTime = 0;
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime; // 이전 프레임과 현재 프레임 사이의 시간 간격
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    effect.handleParticles(ctx, deltaTime);
    requestAnimationFrame(animate);
  }

  animate();
});
