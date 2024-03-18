const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 700;
canvas.height = 900;

// global settings
// ctx.lineWidth = 10;

// canvas shadows
// ctx.shadowOffsetX = 2;
// ctx.shadowOffsetY = 2;
// ctx.shadowColor = "black";

// canvas pattern
const patternImage = document.getElementById("patternImage");
const pattern1 = ctx.createPattern(patternImage, "no-repeat");
ctx.strokeStyle = pattern1;

class Line {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
    this.history = [{ x: this.x, y: this.y }];
    // 하위 픽셀 값을 얻지 않도록 Math.floor
    this.hue = Math.floor(Math.random() * 360);
    this.lineWidth = Math.floor(Math.random() * 25 + 1);
    this.maxLength = Math.floor(Math.random() * 150 + 10);
    this.speedX = Math.random() * 1 - 0.5;
    this.speedY = 5;
    this.lifeSpan = this.maxLength * 2;
    this.breakPoint = this.lifeSpan * 0.85;
    this.timer = 0;
    this.angle = 0;
    this.va = Math.random() * 0.5 - 0.25; // velocity angle
    this.curve = 10;
    this.vc = Math.random() * 0.4 - 0.2; // velocity curve
  }
  draw(context) {
    // hsl(색조, 채도, 밝기)
    // context.strokeStyle = `hsl(${this.hue}, 100%, 50%)`;
    context.lineWidth = this.lineWidth;
    context.beginPath();
    context.moveTo(this.history[0].x, this.history[0].y);
    for (let i = 0; i < this.history.length; i++) {
      context.lineTo(this.history[i].x, this.history[i].y);
    }
    context.stroke();
  }

  update() {
    this.timer++;
    this.angle += this.va;
    this.curve += this.vc;
    if (this.timer < this.lifeSpan) {
      if (this.timer > this.breakPoint) {
        this.va *= -1.12;
      }
      this.x += Math.sin(this.angle) * this.curve;
      this.y += Math.cos(this.angle) * this.curve;
      this.history.push({ x: this.x, y: this.y });

      if (this.history.length > this.maxLength) {
        this.history.shift(); // remove the first element
      }
    } else if (this.history.length <= 1) {
      this.reset();
    } else {
      this.history.shift();
    }
  }
  reset() {
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
    this.history = [{ x: this.x, y: this.y }];
    this.timer = 0;
    this.angle = 0;
    this.curve = 0;
    this.va = Math.random() * 0.5 - 0.25; // velocity angle
  }
}

const linesArray = [];
const numberOfLines = 50;
for (let i = 0; i < numberOfLines; i++) {
  linesArray.push(new Line(canvas));
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  linesArray.forEach((line) => {
    line.draw(ctx);
    line.update(ctx);
  });

  requestAnimationFrame(animate);
}

animate();
