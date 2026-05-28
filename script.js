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

const annenPolkaMelody = [
  { note: 783.99, time: 0, length: 0.18 },
  { note: 987.77, time: 0.22, length: 0.18 },
  { note: 1174.66, time: 0.44, length: 0.2 },
  { note: 1567.98, time: 0.68, length: 0.32 },
  { note: 1174.66, time: 1.04, length: 0.18 },
  { note: 987.77, time: 1.26, length: 0.18 },
  { note: 880, time: 1.48, length: 0.2 },
  { note: 783.99, time: 1.72, length: 0.42 },
  { note: 880, time: 2.26, length: 0.18 },
  { note: 1046.5, time: 2.48, length: 0.18 },
  { note: 1318.51, time: 2.7, length: 0.2 },
  { note: 1760, time: 2.94, length: 0.32 },
  { note: 1318.51, time: 3.3, length: 0.18 },
  { note: 1046.5, time: 3.52, length: 0.18 },
  { note: 987.77, time: 3.74, length: 0.2 },
  { note: 880, time: 3.98, length: 0.42 },
  { note: 783.99, time: 4.5, length: 0.2 },
  { note: 739.99, time: 4.74, length: 0.2 },
  { note: 659.25, time: 4.98, length: 0.2 },
  { note: 587.33, time: 5.22, length: 0.3 },
  { note: 659.25, time: 5.58, length: 0.2 },
  { note: 739.99, time: 5.82, length: 0.2 },
  { note: 783.99, time: 6.06, length: 0.52 }
];

const polkaBass = [
  { root: 196, chord: [392, 493.88, 587.33] },
  { root: 220, chord: [440, 523.25, 659.25] },
  { root: 146.83, chord: [293.66, 369.99, 440] },
  { root: 196, chord: [392, 493.88, 587.33] }
];

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
    gainNode.gain.linearRampToValueAtTime(isPlaying ? 0.24 : 0, audioContext.currentTime + 0.28);

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
  const bass = polkaBass[melodyIndex % polkaBass.length];

  for (let beat = 0; beat < 7; beat += 1) {
    const beatTime = now + beat * 0.92;
    playPianoNote(bass.root, beatTime, 0.26, 0.11);
    bass.chord.forEach((note) => playPianoNote(note, beatTime + 0.42, 0.22, 0.055));
  }

  annenPolkaMelody.forEach((item) => {
    playPianoNote(item.note, now + item.time, item.length, 0.18);
  });

  melodyIndex += 1;
}

function startPianoLoop() {
  window.clearInterval(pianoTimer);
  schedulePianoBar();
  pianoTimer = window.setInterval(schedulePianoBar, 6600);
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
