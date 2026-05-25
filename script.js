const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");
const pointer = { x: 0, y: 0 };
let stars = [];
let links = [];
const dailyQuotes = [
  "Courage is built by continuing when the answer is not clear yet.",
  "Difficult work becomes smaller when you face it one clear step at a time.",
  "Progress belongs to the person who keeps learning after the first failure.",
  "Strong systems are built by people willing to understand the messy details.",
  "The future favours steady effort, clear thinking, and the nerve to begin."
];
const modeProfiles = {
  builder: {
    summary: "Building practical tools, automation flows, and support systems for real business problems.",
    output: "mission: reduce manual work\nstack: Python + web + Salesforce + Make.com\nsignal: practical business systems online"
  },
  automation: {
    summary: "Connecting forms, data, CRM records, and repeatable rules into cleaner digital workflows.",
    output: "mode: automation\ninputs: leads + reports + files\nresult: fewer manual steps, clearer handoff"
  },
  security: {
    summary: "Thinking about access, risk, suspicious activity, and safer habits when building or supporting systems.",
    output: "mode: security\nfocus: access + data + user behaviour\nstatus: protect before optimise"
  },
  learning: {
    summary: "Still learning across many fields, but willing to ask clearly, test ideas, and understand the real problem.",
    output: "mode: learning\nmethod: explore + test + improve\nmindset: beginner, but serious"
  }
};

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

function setDailyQuote() {
  const quote = document.getElementById("daily-quote");
  const source = document.getElementById("daily-quote-source");

  if (!quote || !source) return;

  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = new Date() - start;
  const day = Math.floor(diff / 86400000);
  quote.textContent = dailyQuotes[day % dailyQuotes.length];
  source.textContent = "Churchill-inspired daily reflection";
}

function runBootSequence() {
  const boot = document.querySelector(".boot-screen");
  const bar = document.querySelector(".boot-progress span");
  const percent = document.getElementById("boot-percent");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!boot || !bar || !percent || reduceMotion) {
    document.body.classList.add("booted");
    return;
  }

  let progress = 0;
  const bootTimer = window.setInterval(() => {
    progress = Math.min(100, progress + Math.floor(Math.random() * 16) + 9);
    bar.style.width = `${progress}%`;
    percent.textContent = `${progress}%`;

    if (progress >= 100) {
      window.clearInterval(bootTimer);
      window.setTimeout(() => {
        boot.classList.add("is-complete");
        document.body.classList.add("booted");
      }, 360);
    }
  }, 130);
}

function initModeSwitcher() {
  const activeMode = document.getElementById("active-mode");
  const summary = document.getElementById("mode-summary");
  const output = document.getElementById("system-output");
  const chips = document.querySelectorAll(".mode-chip");

  if (!activeMode || !summary || !output || chips.length === 0) return;

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const mode = chip.dataset.mode;
      const profile = modeProfiles[mode];

      if (!profile) return;

      chips.forEach((item) => item.classList.remove("active"));
      chips.forEach((item) => item.setAttribute("aria-pressed", "false"));
      chip.classList.add("active");
      chip.setAttribute("aria-pressed", "true");
      activeMode.textContent = mode;
      summary.textContent = profile.summary;
      output.textContent = profile.output;
    });
  });
}

function initRevealObserver() {
  const items = document.querySelectorAll(
    ".timeline article, .skill-matrix article, .featured-skill, .library-console, .quote-section blockquote, .contact-section"
  );

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  items.forEach((item) => observer.observe(item));
}

function initCardTilt() {
  const cards = document.querySelectorAll(".timeline article, .skill-matrix article");

  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--tilt-x", `${(-y * 5).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(x * 6).toFixed(2)}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  });
}

resizeCanvas();
draw();
setDailyQuote();
runBootSequence();
initModeSwitcher();
initRevealObserver();
initCardTilt();
