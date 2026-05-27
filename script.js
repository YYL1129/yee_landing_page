const cursorLight = document.querySelector(".cursor-light");
const playToggle = document.querySelector("#play-toggle");
const record = document.querySelector("#record");
const signalOutput = document.querySelector("#signal-output");
const signalButtons = document.querySelectorAll("[data-signal]");

const signals = {
  it: "IT Ops: support, access control, troubleshooting, file workflows, and process improvement.",
  python: "Python: scripts, data checks, automation helpers, report generation, backup review, and repeatable workflows.",
  salesforce: "Salesforce: property CRM workflow thinking across lead, account, opportunity, booking, order, SPA, and dashboards.",
  make: "Make.com: connector logic from forms or social channels into clean automated actions and CRM-ready data.",
  security: "Security: access control, suspicious activity thinking, least privilege, backup awareness, and practical risk reduction.",
  ml: "Machine Learning: practical learning around data preparation, signals, risk labels, model workflow, and business-use framing."
};

let audioContext;
let gainNode;
let oscillatorA;
let oscillatorB;
let isPlaying = false;

function initCursor() {
  window.addEventListener("pointermove", (event) => {
    if (!cursorLight) return;
    cursorLight.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
  });
}

function initAudio() {
  playToggle?.addEventListener("click", async () => {
    if (!audioContext) {
      audioContext = new AudioContext();
      gainNode = audioContext.createGain();
      oscillatorA = audioContext.createOscillator();
      oscillatorB = audioContext.createOscillator();

      oscillatorA.type = "sine";
      oscillatorB.type = "triangle";
      oscillatorA.frequency.value = 74;
      oscillatorB.frequency.value = 111;

      gainNode.gain.value = 0;
      oscillatorA.connect(gainNode);
      oscillatorB.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillatorA.start();
      oscillatorB.start();
    }

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    isPlaying = !isPlaying;
    playToggle.classList.toggle("is-playing", isPlaying);
    record.classList.toggle("is-paused", !isPlaying);
    gainNode.gain.linearRampToValueAtTime(isPlaying ? 0.035 : 0, audioContext.currentTime + 0.22);
  });
}

function initSignals() {
  signalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      signalButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      signalOutput.textContent = signals[button.dataset.signal];
    });
  });
}

function initScrollReveal() {
  const items = document.querySelectorAll(".field-notes article, .signal-board, .proof-strip article, .quiet-section article, .contact");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.18 }
  );

  items.forEach((item) => {
    item.classList.add("reveal");
    observer.observe(item);
  });
}

record?.classList.add("is-paused");
initCursor();
initAudio();
initSignals();
initScrollReveal();
