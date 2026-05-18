const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");
const pointer = { x: 0, y: 0 };
let stars = [];
let links = [];
const typeTargets = document.querySelectorAll("[data-type-text]");

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.floor((window.innerWidth * window.innerHeight) / 8500);
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: Math.random() * 1.7 + 0.3,
    speed: Math.random() * 0.35 + 0.08,
    alpha: Math.random() * 0.6 + 0.25
  }));

  links = Array.from({ length: Math.max(12, Math.floor(count / 6)) }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.28,
    vy: (Math.random() - 0.5) * 0.28
  }));
}

function draw() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (const star of stars) {
    star.y += star.speed;
    if (star.y > window.innerHeight + 6) {
      star.y = -6;
      star.x = Math.random() * window.innerWidth;
    }

    const driftX = (pointer.x - window.innerWidth / 2) * 0.006;
    const driftY = (pointer.y - window.innerHeight / 2) * 0.006;

    ctx.beginPath();
    ctx.arc(star.x + driftX, star.y + driftY, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
    ctx.fill();
  }

  for (const point of links) {
    point.x += point.vx;
    point.y += point.vy;

    if (point.x < 0 || point.x > window.innerWidth) point.vx *= -1;
    if (point.y < 0 || point.y > window.innerHeight) point.vy *= -1;

    ctx.beginPath();
    ctx.arc(point.x, point.y, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(105, 231, 255, 0.55)";
    ctx.fill();
  }

  for (let index = 0; index < links.length; index += 1) {
    for (let next = index + 1; next < links.length; next += 1) {
      const a = links[index];
      const b = links[next];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);

      if (distance < 150) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(105, 231, 255, ${0.18 - distance / 900})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(draw);
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
});

async function typeLine(element, speed = 34) {
  const text = element.dataset.typeText || "";
  element.textContent = "";
  element.classList.add("is-typing");

  for (let index = 0; index <= text.length; index += 1) {
    element.textContent = text.slice(0, index);
    await new Promise((resolve) => setTimeout(resolve, speed));
  }

  element.classList.remove("is-typing");
}

async function runTypewriter() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    typeTargets.forEach((element) => {
      element.textContent = element.dataset.typeText || "";
    });
    return;
  }

  for (const element of typeTargets) {
    const speed = element.classList.contains("hero-text") ? 12 : 34;
    await typeLine(element, speed);
    await new Promise((resolve) => setTimeout(resolve, 180));
  }
}

resizeCanvas();
draw();
runTypewriter();
