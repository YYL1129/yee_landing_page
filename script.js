const canvas = document.getElementById("silk-canvas");
const ctx = canvas.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let width = 0;
let height = 0;
let tick = 0;
let pointer = { x: 0, y: 0 };

const quotes = [
  ["Courage is built by continuing when the answer is not clear yet.", "Churchill-inspired daily reflection"],
  ["The task is not to look smart. The task is to understand.", "Practical reminder"],
  ["A beginner who keeps testing becomes stronger than a person who only talks.", "Learning note"],
  ["Turn pressure into a process. Turn process into progress.", "Daily systems note"]
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
}

function drawSilk() {
  ctx.clearRect(0, 0, width, height);
  const colours = [
    "rgba(231, 47, 47, 0.34)",
    "rgba(36, 107, 254, 0.28)",
    "rgba(25, 168, 107, 0.24)"
  ];

  colours.forEach((colour, ribbon) => {
    ctx.beginPath();
    ctx.lineWidth = 2 + ribbon;
    ctx.strokeStyle = colour;

    for (let x = -80; x <= width + 80; x += 18) {
      const base = height * (0.24 + ribbon * 0.19);
      const y =
        base +
        Math.sin((x + tick * (0.7 + ribbon * 0.2)) * 0.008 + ribbon * 1.8) * 44 +
        Math.sin((x + pointer.x) * 0.017) * 12;

      if (x === -80) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  });

  if (!reduceMotion) tick += 1;
  requestAnimationFrame(drawSilk);
}

function setQuote() {
  const quote = quotes[new Date().getDate() % quotes.length];
  document.getElementById("daily-quote").textContent = quote[0];
  document.getElementById("daily-source").textContent = quote[1];
}

function bindSkills() {
  const output = document.getElementById("skill-detail");
  const buttons = document.querySelectorAll(".skill-board button");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      output.textContent = `${button.textContent}: ${button.dataset.detail}`;
    });
  });
}

function revealOnScroll() {
  const items = document.querySelectorAll(
    ".method-section, .skills-section, .proof-section, .learning-section, .contact-section, .nameplate"
  );
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
  pointer = { x: event.clientX, y: event.clientY };
});

resizeCanvas();
setQuote();
bindSkills();
revealOnScroll();
drawSilk();
