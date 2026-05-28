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
    if (isPlaying) {
      stopAmbient();
      return;
    }

    await startAmbient();
  });

  window.setTimeout(() => {
    startAmbient(true);
  }, 2800);
}

function setupAudioGraph() {
  if (audioContext) return;

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

async function startAmbient(isAutoplay = false) {
  try {
    setupAudioGraph();

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    isPlaying = true;
    document.body.classList.toggle("music-blocked", false);
    document.body.classList.toggle("music-playing", true);
    playToggle?.classList.toggle("is-playing", true);
    record?.classList.toggle("is-paused", false);
    cinemaScene?.classList.toggle("is-live", true);
    gainNode.gain.cancelScheduledValues(audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.8);
    startAmbientLoop();
  } catch (error) {
    if (isAutoplay) {
      document.body.classList.add("music-blocked");
    }
  }
}

function stopAmbient() {
  if (!audioContext || !gainNode) return;

  isPlaying = false;
  document.body.classList.toggle("music-playing", false);
  playToggle?.classList.toggle("is-playing", false);
  record?.classList.toggle("is-paused", true);
  cinemaScene?.classList.toggle("is-live", false);
  gainNode.gain.cancelScheduledValues(audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
  window.clearInterval(musicTimer);
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
  scene.fog = new THREE.FogExp2(0x06101f, 0.055);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 1.35, 8.6);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  threeStage.appendChild(renderer.domElement);
  threeStage.classList.add("is-ready");

  const softBlue = new THREE.Color("#8fd8ff");

  scene.add(new THREE.AmbientLight(0x8fd8ff, 0.62));

  const keyLight = new THREE.SpotLight(0x8fd8ff, 8.2, 26, Math.PI / 3, 0.78, 1.1);
  keyLight.position.set(-4.8, 5.2, 4.8);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(0x3d7dff, 5.4, 18);
  rimLight.position.set(4.6, 1.8, 2.8);
  scene.add(rimLight);

  const horizonLight = new THREE.PointLight(0x8fd8ff, 6.8, 22);
  horizonLight.position.set(0, 0.3, -4.8);
  scene.add(horizonLight);

  const world = new THREE.Group();
  world.position.set(1.15, 0.78, 0.2);
  world.rotation.set(-0.03, -0.12, 0.02);
  world.scale.setScalar(1.08);
  scene.add(world);

  const terrainGeometry = new THREE.PlaneGeometry(18, 10, 120, 48);
  const position = terrainGeometry.attributes.position;
  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index);
    const y = position.getY(index);
    const wave = Math.sin(x * 0.9 + y * 0.55) * 0.18 + Math.cos(x * 0.38) * 0.12;
    position.setZ(index, wave);
  }
  position.needsUpdate = true;
  terrainGeometry.computeVertexNormals();

  const terrainMaterial = new THREE.MeshStandardMaterial({
    color: 0x07101d,
    roughness: 0.9,
    metalness: 0.1,
    transparent: true,
    opacity: 0.96
  });
  const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
  terrain.rotation.x = -Math.PI / 2;
  terrain.position.set(0, -1.58, -0.8);
  terrain.receiveShadow = true;
  world.add(terrain);

  const grid = new THREE.GridHelper(18, 38, 0x8fd8ff, 0x24506e);
  grid.position.set(0, -1.31, -0.8);
  grid.material.transparent = true;
  grid.material.opacity = 0.52;
  grid.material.depthWrite = false;
  world.add(grid);

  const hubMaterial = new THREE.MeshBasicMaterial({
    color: 0x8fd8ff,
    transparent: true,
    opacity: 0.82,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const hub = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 2), hubMaterial);
  hub.position.set(-1.1, -0.72, 0.45);
  world.add(hub);

  const trailGroup = new THREE.Group();
  const trailMaterials = [];
  const makeTrail = (offset, width, opacity, color = 0x8fd8ff) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-8.2, -1.34, 3.9 + offset),
      new THREE.Vector3(-4.6, -1.08, 1.1 + offset * 0.35),
      new THREE.Vector3(-1.4, -0.9, -0.4),
      new THREE.Vector3(2.4, -1.05, -1.0 - offset * 0.22),
      new THREE.Vector3(7.8, -1.22, -2.6 - offset)
    ]);
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 96, width * 1.8, 8, false), material);
    trailMaterials.push(material);
    trailGroup.add(mesh);
  };

  [-0.44, -0.26, -0.08, 0.12, 0.32, 0.54].forEach((offset, index) => {
    makeTrail(offset, index === 2 ? 0.028 : 0.014, index === 2 ? 0.98 : 0.48);
  });
  makeTrail(-1.15, 0.016, 0.5, 0x3d7dff);
  makeTrail(1.08, 0.016, 0.42, 0x6be7ff);
  world.add(trailGroup);

  const cubeGroup = new THREE.Group();
  const cubeMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a78ff,
    emissive: softBlue,
    emissiveIntensity: 0.55,
    roughness: 0.22,
    metalness: 0.08,
    transparent: true,
    opacity: 0.72
  });
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: 0x8fd8ff,
    transparent: true,
    opacity: 0.82
  });
  [
    [-2.8, 0.1, -1.8, 1.45],
    [0.55, -0.34, -1.0, 0.62],
    [3.2, -0.02, -2.05, 1.08],
    [-4.9, -0.62, 0.4, 0.34]
  ].forEach(([x, y, z, scale], index) => {
    const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), cubeMaterial);
    cube.position.set(x, y, z);
    cube.scale.setScalar(scale);
    cube.rotation.set(0.18 * index, 0.28 * index, 0.08 * index);
    cube.castShadow = true;
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(cube.geometry), edgeMaterial);
    cube.add(edges);
    cubeGroup.add(cube);
  });
  world.add(cubeGroup);

  const pulseMaterial = new THREE.MeshBasicMaterial({
    color: 0x8fd8ff,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const pulse = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.012, 16, 180), pulseMaterial);
  pulse.position.set(-0.8, -1.05, 0.5);
  pulse.rotation.set(1.32, 0, -0.18);
  world.add(pulse);

  const towerMaterial = new THREE.MeshBasicMaterial({
    color: 0x8fd8ff,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const towerEdges = new THREE.LineBasicMaterial({
    color: 0x8fd8ff,
    transparent: true,
    opacity: 0.66
  });
  const towers = new THREE.Group();
  [
    [-5.6, -0.8, 0.7, 1.4],
    [-3.7, -0.82, -0.6, 0.95],
    [2.7, -0.92, -1.4, 1.7],
    [5.1, -0.9, -2.4, 1.15]
  ].forEach(([x, y, z, height]) => {
    const tower = new THREE.Mesh(new THREE.BoxGeometry(0.58, height, 0.58), towerMaterial);
    tower.position.set(x, y + height / 2, z);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(tower.geometry), towerEdges);
    tower.add(edges);
    towers.add(tower);
  });
  world.add(towers);

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

    trailMaterials.forEach((material, index) => {
      material.opacity = 0.28 + Math.sin(t * 1.8 + index * 0.7) * 0.16 + (index === 2 ? 0.48 : 0);
    });

    cubeGroup.children.forEach((cube, index) => {
      cube.rotation.x += 0.002 + index * 0.0008;
      cube.rotation.y += 0.004 + index * 0.0006;
      cube.position.y += Math.sin(t * 0.9 + index) * 0.0035;
      cube.material.emissiveIntensity = 0.42 + Math.sin(t * 1.2 + index) * 0.18;
    });

    hub.rotation.x += 0.008;
    hub.rotation.y += 0.012;
    hub.scale.setScalar(1 + Math.sin(t * 2.4) * 0.12);
    towers.children.forEach((tower, index) => {
      tower.position.y += Math.sin(t * 1.1 + index) * 0.002;
      tower.rotation.y += 0.002;
    });
    terrain.position.z = -0.8 + Math.sin(t * 0.22) * 0.18;
    grid.position.z = terrain.position.z;
    trailGroup.position.z = Math.sin(t * 0.26) * 0.18;
    pulse.rotation.z += 0.005;
    pulse.scale.setScalar(1 + Math.sin(t * 1.8) * 0.08);
    world.rotation.y = -0.12 + Math.sin(t * 0.18) * 0.08;

    camera.position.x += (pointerX * 0.82 - camera.position.x) * 0.04;
    camera.position.y += (1.35 - pointerY * 0.48 - camera.position.y) * 0.04;
    camera.lookAt(0.8, -0.1, -1.2);

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
