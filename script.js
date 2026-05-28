const cursorLight = document.querySelector(".cursor-light");
const playToggle = document.querySelector("#play-toggle");
const record = document.querySelector("#record");
const cinemaScene = document.querySelector(".cinema-scene");
const threeStage = document.querySelector("#three-stage");
const particleField = document.querySelector(".particle-field");
const scrollProgress = document.querySelector(".scroll-progress");
const signalOutput = document.querySelector("#signal-output");
const signalButtons = document.querySelectorAll("[data-signal]");
const tiltCards = document.querySelectorAll(".field-notes article, .proof-strip article, .quiet-section article, .signal-console");
const bootScreen = document.querySelector(".boot-screen");

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
let musicTimer;
let isPlaying = false;
let particles = [];

const ambientArp = [
  { note: 220, time: 0, length: 0.9 },
  { note: 277.18, time: 0.6, length: 0.9 },
  { note: 329.63, time: 1.2, length: 1.05 },
  { note: 440, time: 2.05, length: 1.2 },
  { note: 392, time: 3.05, length: 0.95 },
  { note: 329.63, time: 3.65, length: 1.1 },
  { note: 554.37, time: 4.6, length: 1.35 },
  { note: 493.88, time: 5.7, length: 1.45 }
];

const ambientPads = [
  { note: 55, time: 0, length: 6.4 },
  { note: 82.41, time: 0.15, length: 6.2 },
  { note: 110, time: 3.2, length: 4.8 }
];

function initBoot() {
  window.setTimeout(() => {
    document.body.classList.add("boot-complete");
    window.setTimeout(() => bootScreen?.setAttribute("hidden", ""), 700);
  }, 2200);
}

function initCursor() {
  window.addEventListener("pointermove", (event) => {
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;

    document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
    document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);
    document.documentElement.style.setProperty("--drift-x", `${x * 18}px`);
    document.documentElement.style.setProperty("--drift-y", `${y * 18}px`);

    if (!cursorLight) return;
    cursorLight.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
  });
}

function initParticles() {
  if (!particleField) return;

  for (let index = 0; index < 42; index += 1) {
    const particle = document.createElement("span");
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.setProperty("--move-x", `${Math.random() * 140 - 70}px`);
    particle.style.animationDuration = `${8 + Math.random() * 12}s`;
    particle.style.animationDelay = `${Math.random() * -14}s`;
    particle.style.opacity = `${0.22 + Math.random() * 0.5}`;
    particle.style.transform = `scale(${0.7 + Math.random() * 1.4})`;
    particleField.appendChild(particle);
    particles.push(particle);
  }
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
      delayNode.delayTime.value = 0.42;
      delayGain.gain.value = 0.24;
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
    document.body.classList.toggle("music-playing", isPlaying);
    playToggle.classList.toggle("is-playing", isPlaying);
    record?.classList.toggle("is-paused", !isPlaying);
    cinemaScene?.classList.toggle("is-live", isPlaying);
    gainNode.gain.cancelScheduledValues(audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(isPlaying ? 0.12 : 0, audioContext.currentTime + 0.6);

    if (isPlaying) {
      startAmbientLoop();
    } else {
      window.clearInterval(musicTimer);
    }
  });
}

function playSynthNote(frequency, startTime, duration, level = 0.08, type = "triangle") {
  const noteGain = audioContext.createGain();
  const tone = audioContext.createOscillator();
  const shimmer = audioContext.createOscillator();
  const filter = audioContext.createBiquadFilter();

  tone.type = type;
  shimmer.type = "sine";
  tone.frequency.value = frequency;
  shimmer.frequency.value = frequency * 1.5;
  filter.type = "lowpass";
  filter.frequency.value = type === "sawtooth" ? 760 : 1180;
  filter.Q.value = 0.9;

  noteGain.gain.setValueAtTime(0.0001, startTime);
  noteGain.gain.exponentialRampToValueAtTime(level, startTime + 0.18);
  noteGain.gain.exponentialRampToValueAtTime(level * 0.42, startTime + duration * 0.72);
  noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 1.1);

  tone.connect(filter);
  shimmer.connect(filter);
  filter.connect(noteGain);
  noteGain.connect(gainNode);
  noteGain.connect(delayNode);

  tone.start(startTime);
  shimmer.start(startTime);
  tone.stop(startTime + duration + 1.2);
  shimmer.stop(startTime + duration + 1.2);
}

function scheduleAmbientBar() {
  const now = audioContext.currentTime + 0.04;

  ambientPads.forEach((item) => {
    playSynthNote(item.note, now + item.time, item.length, 0.045, "sawtooth");
    playSynthNote(item.note * 2, now + item.time + 0.08, item.length, 0.028, "triangle");
  });

  ambientArp.forEach((item) => {
    playSynthNote(item.note, now + item.time, item.length, 0.07, "triangle");
  });
}

function startAmbientLoop() {
  window.clearInterval(musicTimer);
  scheduleAmbientBar();
  musicTimer = window.setInterval(scheduleAmbientBar, 7200);
}

function initSignals() {
  signalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      signalButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      signalOutput.textContent = signals[button.dataset.signal];
      signalOutput.classList.remove("is-pulsing");
      window.requestAnimationFrame(() => signalOutput.classList.add("is-pulsing"));
    });
  });
}

function initScrollProgress() {
  if (!scrollProgress) return;

  const updateProgress = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    scrollProgress.style.transform = `scaleX(${Math.min(progress, 1)})`;
  };

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
}

function initTiltCards() {
  tiltCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      card.style.setProperty("--tilt-x", `${y * -5}deg`);
      card.style.setProperty("--tilt-y", `${x * 5}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  });
}

function makePanelTexture(lines = 5) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "rgba(5, 10, 16, 0.86)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(143, 216, 255, 0.5)";
  ctx.lineWidth = 3;
  ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);

  for (let index = 0; index < lines; index += 1) {
    const y = 54 + index * 32;
    const width = 250 + Math.sin(index * 1.7) * 72;
    const gradient = ctx.createLinearGradient(48, y, 430, y);
    gradient.addColorStop(0, "rgba(143, 216, 255, 0.95)");
    gradient.addColorStop(1, "rgba(143, 216, 255, 0.08)");
    ctx.fillStyle = gradient;
    ctx.fillRect(48, y, width, 10);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function initThreeHero() {
  if (!threeStage || !window.THREE) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05070b, 0.08);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0.4, 9);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  threeStage.appendChild(renderer.domElement);
  threeStage.classList.add("is-ready");

  const softBlue = new THREE.Color("#8fd8ff");
  const cream = new THREE.Color("#f5f0e8");
  const dark = new THREE.Color("#111922");

  scene.add(new THREE.AmbientLight(0x8fd8ff, 0.78));

  const keyLight = new THREE.SpotLight(0x8fd8ff, 10.5, 24, Math.PI / 3.2, 0.72, 1.2);
  keyLight.position.set(-4.8, 4.2, 5.8);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(0xf5f0e8, 6.2, 16);
  rimLight.position.set(4.4, 1.7, 3.8);
  scene.add(rimLight);

  const frontLight = new THREE.PointLight(0x8fd8ff, 5.2, 12);
  frontLight.position.set(0.8, -0.5, 5.5);
  scene.add(frontLight);

  const room = new THREE.Group();
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x0b1017,
    roughness: 0.82,
    metalness: 0.08,
    transparent: true,
    opacity: 0.92
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 9), wallMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -2.1, -0.6);
  floor.receiveShadow = true;
  room.add(floor);

  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), wallMaterial);
  backWall.position.set(0, 1, -4.1);
  backWall.receiveShadow = true;
  room.add(backWall);

  const windowBars = new THREE.Group();
  const barMaterial = new THREE.MeshStandardMaterial({ color: 0xdde5ea, roughness: 0.45, metalness: 0.1, transparent: true, opacity: 0.22 });
  for (let index = 0; index < 5; index += 1) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.045, 4.1, 0.04), barMaterial);
    bar.position.set(-6 + index * 0.58, 0.8, -3.95);
    windowBars.add(bar);
  }
  room.add(windowBars);
  scene.add(room);

  const figure = new THREE.Group();
  const suit = new THREE.MeshStandardMaterial({ color: 0x314559, roughness: 0.48, metalness: 0.2 });
  const highlight = new THREE.MeshStandardMaterial({ color: 0x7c95a8, roughness: 0.45, metalness: 0.22 });

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 32, 32), highlight);
  head.position.set(0, 0.96, 0);
  head.castShadow = true;
  figure.add(head);

  const bodyGeometry = THREE.CapsuleGeometry
    ? new THREE.CapsuleGeometry(0.44, 0.86, 8, 20)
    : new THREE.CylinderGeometry(0.44, 0.54, 1.5, 24);
  const body = new THREE.Mesh(bodyGeometry, suit);
  body.position.set(0, 0.05, 0);
  body.rotation.z = -0.18;
  body.castShadow = true;
  figure.add(body);

  const limbGeometry = THREE.CapsuleGeometry
    ? new THREE.CapsuleGeometry(0.12, 0.82, 8, 18)
    : new THREE.CylinderGeometry(0.12, 0.12, 1.05, 18);
  [
    [-0.62, 0.2, 0.05, 0.9, 0.1, -0.76],
    [0.68, 0.15, 0.02, 1.05, 0.1, 0.82],
    [-0.32, -0.78, 0.03, 0.85, 0.1, 0.52],
    [0.5, -0.78, 0.02, 0.86, 0.1, -0.68]
  ].forEach(([x, y, z, sx, sy, rz]) => {
    const limb = new THREE.Mesh(limbGeometry, suit);
    limb.position.set(x, y, z);
    limb.scale.set(sx, 1, sy);
    limb.rotation.z = rz;
    limb.castShadow = true;
    figure.add(limb);
  });

  figure.position.set(1.15, 0.62, 0.8);
  figure.rotation.set(-0.08, -0.32, -0.35);
  figure.scale.setScalar(1.58);
  scene.add(figure);

  const panelMaterial = new THREE.MeshStandardMaterial({
    map: makePanelTexture(5),
    color: cream,
    roughness: 0.25,
    metalness: 0.16,
    emissive: softBlue,
    emissiveIntensity: 0.78,
    transparent: true,
    opacity: 0.92
  });

  const panels = new THREE.Group();
  [
    [-1.2, 1.0, 0.15, -0.18, -0.35, 0.04, 1.35],
    [3.2, 0.25, -0.5, 0.1, 0.42, -0.05, 0.92],
    [-3.55, 0.12, 0.45, 0.12, -0.22, 0.12, 0.82]
  ].forEach(([x, y, z, rx, ry, rz, scale]) => {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.82, 0.06), panelMaterial);
    panel.position.set(x, y, z);
    panel.rotation.set(rx, ry, rz);
    panel.scale.setScalar(scale);
    panel.castShadow = true;
    panels.add(panel);
  });
  scene.add(panels);

  const orbitMaterial = new THREE.MeshBasicMaterial({
    color: 0x8fd8ff,
    transparent: true,
    opacity: 0.24
  });
  const orbit = new THREE.Mesh(new THREE.TorusGeometry(3.7, 0.01, 16, 180), orbitMaterial);
  orbit.position.set(0.4, 0.1, -0.6);
  orbit.rotation.set(1.16, 0.08, -0.28);
  scene.add(orbit);

  const objectMaterial = new THREE.MeshStandardMaterial({ color: 0x8fd8ff, roughness: 0.5, metalness: 0.28, transparent: true, opacity: 0.38 });
  const objects = new THREE.Group();
  [
    new THREE.IcosahedronGeometry(0.38, 0),
    new THREE.BoxGeometry(0.75, 0.22, 0.06),
    new THREE.TorusGeometry(0.32, 0.025, 12, 48)
  ].forEach((geometry, index) => {
    const mesh = new THREE.Mesh(geometry, objectMaterial);
    mesh.position.set(-3 + index * 3.2, 1.6 - index * 0.7, -0.35 - index * 0.5);
    mesh.rotation.set(index * 0.5, index * -0.4, index * 0.3);
    objects.add(mesh);
  });
  scene.add(objects);

  const clock = new THREE.Clock();
  let pointerX = 0;
  let pointerY = 0;

  const resize = () => {
    const rect = threeStage.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / Math.max(rect.height, 1);
    camera.updateProjectionMatrix();
  };

  const onPointerMove = (event) => {
    pointerX = event.clientX / window.innerWidth - 0.5;
    pointerY = event.clientY / window.innerHeight - 0.5;
  };

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  resize();

  const animate = () => {
    const t = clock.getElapsedTime();
    figure.position.x = 1.15 + Math.sin(t * 0.52) * 0.18;
    figure.position.y = 0.62 + Math.sin(t * 0.85) * 0.42;
    figure.rotation.z = -0.34 + Math.sin(t * 0.62) * 0.16;
    figure.rotation.y = -0.24 + Math.sin(t * 0.58) * 0.18;

    panels.children.forEach((panel, index) => {
      panel.position.y += Math.sin(t * 1.2 + index) * 0.0042;
      panel.rotation.z += Math.sin(t * 0.9 + index) * 0.0022;
    });

    objects.children.forEach((object, index) => {
      object.rotation.x += 0.004 + index * 0.001;
      object.rotation.y += 0.006 + index * 0.001;
      object.position.y += Math.sin(t * 1.4 + index) * 0.004;
    });

    orbit.rotation.z += 0.002;

    camera.position.x += (pointerX * 0.72 - camera.position.x) * 0.04;
    camera.position.y += (0.4 - pointerY * 0.42 - camera.position.y) * 0.04;
    camera.lookAt(0.1, 0.05, -0.7);

    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  };

  animate();
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

  items.forEach((item, index) => {
    item.classList.add("reveal");
    item.style.transitionDelay = `${Math.min(index, 4) * 0.04}s`;
    observer.observe(item);
  });
}

record?.classList.add("is-paused");
initBoot();
initCursor();
initParticles();
initAudio();
initSignals();
initScrollProgress();
initTiltCards();
initThreeHero();
initScrollReveal();
