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
let pianoTimer;
let melodyIndex = 0;
let isPlaying = false;

const venicePiano = [
  { note: 392, time: 0, length: 0.72 },
  { note: 493.88, time: 0.78, length: 0.52 },
  { note: 587.33, time: 1.28, length: 0.86 },
  { note: 523.25, time: 2.1, length: 0.58 },
  { note: 440, time: 2.72, length: 0.82 },
  { note: 349.23, time: 3.62, length: 0.62 },
  { note: 392, time: 4.2, length: 1.1 },
  { note: 329.63, time: 5.42, length: 0.82 }
];

const bassNotes = [196, 220, 174.61, 196];

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
      gainNode.gain.value = 0;
      gainNode.connect(audioContext.destination);
    }

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    isPlaying = !isPlaying;
    playToggle.classList.toggle("is-playing", isPlaying);
    record.classList.toggle("is-paused", !isPlaying);
    gainNode.gain.cancelScheduledValues(audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(isPlaying ? 0.28 : 0, audioContext.currentTime + 0.28);

    if (isPlaying) {
      startPianoLoop();
    } else {
      window.clearInterval(pianoTimer);
    }
  });
}

function playPianoNote(frequency, startTime, duration, level = 0.22) {
  const noteGain = audioContext.createGain();
  const tone = audioContext.createOscillator();
  const shimmer = audioContext.createOscillator();
  const filter = audioContext.createBiquadFilter();

  tone.type = "triangle";
  shimmer.type = "sine";
  tone.frequency.value = frequency;
  shimmer.frequency.value = frequency * 2.01;
  filter.type = "lowpass";
  filter.frequency.value = 2400;

  noteGain.gain.setValueAtTime(0.0001, startTime);
  noteGain.gain.exponentialRampToValueAtTime(level, startTime + 0.025);
  noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  tone.connect(filter);
  shimmer.connect(filter);
  filter.connect(noteGain);
  noteGain.connect(gainNode);

  tone.start(startTime);
  shimmer.start(startTime);
  tone.stop(startTime + duration + 0.08);
  shimmer.stop(startTime + duration + 0.08);
}

function schedulePianoBar() {
  const now = audioContext.currentTime + 0.04;
  const bass = bassNotes[melodyIndex % bassNotes.length];

  playPianoNote(bass, now, 1.8, 0.12);
  playPianoNote(bass * 1.5, now + 0.04, 1.4, 0.08);

  venicePiano.forEach((item) => {
    playPianoNote(item.note, now + item.time, item.length, 0.18);
  });

  melodyIndex += 1;
}

function startPianoLoop() {
  window.clearInterval(pianoTimer);
  schedulePianoBar();
  pianoTimer = window.setInterval(schedulePianoBar, 6400);
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
