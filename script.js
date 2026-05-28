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
let delayNode;
let delayGain;
let compressor;
let pianoTimer;
let melodyIndex = 0;
let isPlaying = false;

const beethovenMelody = [
  { note: 659.25, time: 0, length: 0.22 },
  { note: 622.25, time: 0.28, length: 0.22 },
  { note: 659.25, time: 0.56, length: 0.22 },
  { note: 622.25, time: 0.84, length: 0.22 },
  { note: 659.25, time: 1.12, length: 0.22 },
  { note: 493.88, time: 1.44, length: 0.24 },
  { note: 587.33, time: 1.74, length: 0.24 },
  { note: 523.25, time: 2.04, length: 0.24 },
  { note: 440, time: 2.38, length: 0.58 },
  { note: 261.63, time: 3.18, length: 0.24 },
  { note: 329.63, time: 3.48, length: 0.24 },
  { note: 440, time: 3.78, length: 0.24 },
  { note: 493.88, time: 4.12, length: 0.58 },
  { note: 329.63, time: 4.86, length: 0.24 },
  { note: 415.3, time: 5.16, length: 0.24 },
  { note: 493.88, time: 5.46, length: 0.24 },
  { note: 523.25, time: 5.8, length: 0.58 }
];

const beethovenBass = [
  { note: 220, time: 0, length: 0.72 },
  { note: 329.63, time: 0.72, length: 0.52 },
  { note: 440, time: 1.42, length: 0.52 },
  { note: 164.81, time: 2.38, length: 0.72 },
  { note: 329.63, time: 3.18, length: 0.52 },
  { note: 415.3, time: 4.12, length: 0.52 },
  { note: 130.81, time: 5.8, length: 0.88 }
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
      delayNode = audioContext.createDelay(2);
      delayGain = audioContext.createGain();
      compressor = audioContext.createDynamicsCompressor();

      gainNode.gain.value = 0;
      delayNode.delayTime.value = 0.28;
      delayGain.gain.value = 0.16;
      compressor.threshold.value = -26;
      compressor.knee.value = 24;
      compressor.ratio.value = 6;
      compressor.attack.value = 0.012;
      compressor.release.value = 0.32;

      delayNode.connect(delayGain);
      delayGain.connect(delayNode);
      delayNode.connect(gainNode);
      gainNode.connect(compressor);
      compressor.connect(audioContext.destination);
    }

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    isPlaying = !isPlaying;
    playToggle.classList.toggle("is-playing", isPlaying);
    record.classList.toggle("is-paused", !isPlaying);
    gainNode.gain.cancelScheduledValues(audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(isPlaying ? 0.16 : 0, audioContext.currentTime + 0.4);

    if (isPlaying) {
      startPianoLoop();
    } else {
      window.clearInterval(pianoTimer);
    }
  });
}

function playPianoNote(frequency, startTime, duration, level = 0.16) {
  const noteGain = audioContext.createGain();
  const tone = audioContext.createOscillator();
  const shimmer = audioContext.createOscillator();
  const filter = audioContext.createBiquadFilter();

  tone.type = "sine";
  shimmer.type = "sine";
  tone.frequency.value = frequency;
  shimmer.frequency.value = frequency * 2;
  filter.type = "lowpass";
  filter.frequency.value = 1450;
  filter.Q.value = 0.6;

  noteGain.gain.setValueAtTime(0.0001, startTime);
  noteGain.gain.exponentialRampToValueAtTime(level, startTime + 0.055);
  noteGain.gain.exponentialRampToValueAtTime(level * 0.52, startTime + duration * 0.55);
  noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.72);

  tone.connect(filter);
  shimmer.connect(filter);
  filter.connect(noteGain);
  noteGain.connect(gainNode);
  noteGain.connect(delayNode);

  tone.start(startTime);
  shimmer.start(startTime);
  tone.stop(startTime + duration + 0.82);
  shimmer.stop(startTime + duration + 0.82);
}

function schedulePianoBar() {
  const now = audioContext.currentTime + 0.04;

  beethovenBass.forEach((item) => {
    playPianoNote(item.note, now + item.time, item.length + 0.3, 0.07);
    playPianoNote(item.note * 2, now + item.time + 0.05, item.length + 0.16, 0.032);
  });

  beethovenMelody.forEach((item) => {
    playPianoNote(item.note, now + item.time, item.length + 0.42, 0.12);
  });

  melodyIndex += 1;
}

function startPianoLoop() {
  window.clearInterval(pianoTimer);
  schedulePianoBar();
  pianoTimer = window.setInterval(schedulePianoBar, 6800);
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
