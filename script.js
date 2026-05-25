const canvas = document.getElementById("neural-field");
const ctx = canvas.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let width = 0;
let height = 0;
let particles = [];
let pointer = { x: 0, y: 0, active: false };

const quotes = [
  ["Courage is built by continuing when the answer is not clear yet.", "Churchill-inspired daily reflection"],
  ["Improve the system, then improve yourself with it.", "Daily systems note"],
  ["A beginner who keeps testing becomes dangerous in the best way.", "Learning note"],
  ["The task is not to look smart. The task is to understand.", "Practical reminder"]
];

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.floor(Math.min(120, Math.max(48, width / 12)));
  particles = Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.38,
    vy: (Math.random() - 0.5) * 0.38,
    size: index % 7 === 0 ? 2.2 : 1.1
  }));
}

function drawField() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(8, 9, 13, 0.12)";
  ctx.fillRect(0, 0, width, height);

  particles.forEach((particle) => {
    if (!reduceMotion) {
      particle.x += particle.vx;
      particle.y += particle.vy;
    }

    if (particle.x < 0 || particle.x > width) particle.vx *= -1;
    if (particle.y < 0 || particle.y > height) particle.vy *= -1;

    if (pointer.active) {
      const dx = pointer.x - particle.x;
      const dy = pointer.y - particle.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 170 && distance > 1) {
        particle.x -= dx * 0.0016;
        particle.y -= dy * 0.0016;
      }
    }

    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(200, 255, 47, 0.72)";
    ctx.fill();
  });

  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const a = particles[i];
      const b = particles[j];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance < 125) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(69, 232, 255, ${0.16 - distance / 900})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(drawField);
}

function setDailyQuote() {
  const quote = quotes[new Date().getDate() % quotes.length];
  document.getElementById("daily-quote").textContent = quote[0];
  document.getElementById("daily-source").textContent = quote[1];
}

function bindMissionOrb() {
  const label = document.getElementById("focus-label");
  const buttons = document.querySelectorAll(".mission-orb button");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      label.textContent = button.dataset.focus;
    });
  });
}

function bindSkillMap() {
  const output = document.getElementById("skill-output");
  const buttons = document.querySelectorAll(".skill-grid button");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      output.value = `${button.textContent}: ${button.dataset.skill}`;
      output.textContent = output.value;
    });
  });
}

function revealOnScroll() {
  const items = document.querySelectorAll(".panel, .contact-panel, .mission-orb");
  items.forEach((item) => item.classList.add("reveal"));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("in-view");
    });
  }, { threshold: 0.16 });
  items.forEach((item) => observer.observe(item));
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("pointermove", (event) => {
  pointer = { x: event.clientX, y: event.clientY, active: true };
});
window.addEventListener("pointerleave", () => {
  pointer.active = false;
});

resizeCanvas();
setDailyQuote();
bindMissionOrb();
bindSkillMap();
revealOnScroll();
drawField();
