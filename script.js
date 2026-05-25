const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");
const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let nodes = [];

const dailyQuotes = [
  "Courage is built by continuing when the answer is not clear yet.",
  "Difficult work becomes smaller when you face it one clear step at a time.",
  "Progress belongs to the person who keeps learning after the first failure.",
  "Strong systems are built by people willing to understand the messy details.",
  "The future favours steady effort, clear thinking, and the nerve to begin."
];

const modeProfiles = {
  builder: {
    title: "Business Workflow Builder",
    summary: "Builds practical tools, automation flows, and support systems for real business problems.",
    output: "mission: reduce manual work\nstack: Python + web + Salesforce + Make.com\nsignal: practical business systems online"
  },
  automation: {
    title: "Automation Logic Designer",
    summary: "Connects forms, data, CRM records, and repeatable rules into cleaner digital workflows.",
    output: "mode: automation\ninputs: leads + reports + files\nresult: fewer manual steps, clearer handoff"
  },
  security: {
    title: "Security-Minded Builder",
    summary: "Thinks about access, risk, suspicious activity, and safer habits while supporting systems.",
    output: "mode: security\nfocus: access + data + user behaviour\nstatus: protect before optimise"
  },
  learning: {
    title: "Serious Beginner",
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

  const count = Math.max(28, Math.floor((window.innerWidth * window.innerHeight) / 12000));
  nodes = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.24,
    vy: (Math.random() - 0.5) * 0.24,
    radius: Math.random() * 1.5 + 0.5
  }));
}

function drawNetwork() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  nodes.forEach((node) => {
    node.x += node.vx;
    node.y += node.vy;

    if (node.x < -8 || node.x > window.innerWidth + 8) node.vx *= -1;
    if (node.y < -8 || node.y > window.innerHeight + 8) node.vy *= -1;

    const pullX = (pointer.x - window.innerWidth / 2) * 0.004;
    const pullY = (pointer.y - window.innerHeight / 2) * 0.004;

    ctx.beginPath();
    ctx.arc(node.x + pullX, node.y + pullY, node.radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(220, 255, 79, 0.45)";
    ctx.fill();
  });

  for (let index = 0; index < nodes.length; index += 1) {
    for (let next = index + 1; next < nodes.length; next += 1) {
      const a = nodes[index];
      const b = nodes[next];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);

      if (distance < 145) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(101, 232, 255, ${0.16 - distance / 1000})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(drawNetwork);
}

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
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!boot || !bar || reduceMotion) {
    document.body.classList.add("booted");
    return;
  }

  let progress = 0;
  const timer = window.setInterval(() => {
    progress = Math.min(100, progress + 14);
    bar.style.width = `${progress}%`;

    if (progress >= 100) {
      window.clearInterval(timer);
      window.setTimeout(() => {
        boot.classList.add("is-complete");
        document.body.classList.add("booted");
      }, 260);
    }
  }, 80);
}

function initModeSwitcher() {
  const activeMode = document.getElementById("active-mode");
  const title = document.getElementById("mode-title");
  const summary = document.getElementById("mode-summary");
  const output = document.getElementById("system-output");
  const chips = document.querySelectorAll(".mode-chip");

  if (!activeMode || !title || !summary || !output || chips.length === 0) return;

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const mode = chip.dataset.mode;
      const profile = modeProfiles[mode];

      if (!profile) return;

      chips.forEach((item) => {
        item.classList.remove("active");
        item.setAttribute("aria-pressed", "false");
      });

      chip.classList.add("active");
      chip.setAttribute("aria-pressed", "true");
      activeMode.textContent = mode;
      title.textContent = profile.title;
      summary.textContent = profile.summary;
      output.textContent = profile.output;
    });
  });
}

function initRevealObserver() {
  const items = document.querySelectorAll(".bento-card, .book-card, .contact-section");

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
    { threshold: 0.12 }
  );

  items.forEach((item) => observer.observe(item));
}

function initCardEffects() {
  const cards = document.querySelectorAll(".bento-card");

  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      card.style.setProperty("--card-x", `${x * 100}%`);
      card.style.setProperty("--card-y", `${y * 100}%`);
      card.style.setProperty("--tilt-x", `${((0.5 - y) * 4).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${((x - 0.5) * 5).toFixed(2)}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  });
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
  document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);
  document.documentElement.style.setProperty("--spot-x", `${(event.clientX / window.innerWidth) * 100}%`);
  document.documentElement.style.setProperty("--spot-y", `${(event.clientY / window.innerHeight) * 100}%`);
});

resizeCanvas();
drawNetwork();
setDailyQuote();
runBootSequence();
initModeSwitcher();
initRevealObserver();
initCardEffects();
