import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js";

const canvas = document.getElementById("tech-orbit-3d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas) {
  try {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas
  });
  const pointer = new THREE.Vector2(0, 0);
  const clock = new THREE.Clock();
  const group = new THREE.Group();
  const accent = new THREE.Color("#69e7ff");
  const green = new THREE.Color("#8dffb5");
  const amber = new THREE.Color("#ffd166");

  scene.add(group);

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.15, 2),
    new THREE.MeshBasicMaterial({
      color: accent,
      wireframe: true,
      transparent: true,
      opacity: 0.28
    })
  );
  group.add(core);

  const innerCore = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.9, 0.9, 2, 2, 2),
    new THREE.MeshBasicMaterial({
      color: green,
      wireframe: true,
      transparent: true,
      opacity: 0.34
    })
  );
  group.add(innerCore);

  const frameMaterials = [
    new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.24, wireframe: true }),
    new THREE.MeshBasicMaterial({ color: green, transparent: true, opacity: 0.22, wireframe: true }),
    new THREE.MeshBasicMaterial({ color: amber, transparent: true, opacity: 0.18, wireframe: true })
  ];

  const frames = [2.4, 3.15, 3.85].map((size, index) => {
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(size, size * 0.62, size * 0.2, 1, 1, 1),
      frameMaterials[index]
    );
    frame.rotation.x = index * 0.42 + 0.16;
    frame.rotation.y = index * 0.36 + 0.24;
    group.add(frame);
    return frame;
  });

  const nodeMaterial = new THREE.MeshBasicMaterial({
    color: "#ffffff",
    transparent: true,
    opacity: 0.8
  });

  const nodes = Array.from({ length: 18 }, (_, index) => {
    const node = new THREE.Mesh(new THREE.SphereGeometry(index % 3 === 0 ? 0.055 : 0.035, 14, 14), nodeMaterial);
    const column = index % 6;
    const row = Math.floor(index / 6);
    node.userData = {
      baseX: (column - 2.5) * 0.72,
      baseY: (row - 1) * 0.72,
      baseZ: ((index % 4) - 1.5) * 0.42,
      speed: 0.16 + (index % 5) * 0.018,
      phase: (index / 18) * Math.PI * 2
    };
    group.add(node);
    return node;
  });

  const particlesGeometry = new THREE.BufferGeometry();
  const particleCount = 180;
  const positions = new Float32Array(particleCount * 3);

  for (let index = 0; index < particleCount; index += 1) {
    positions[index * 3] = (Math.random() - 0.5) * 14;
    positions[index * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[index * 3 + 2] = (Math.random() - 0.5) * 8;
  }

  particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(
    particlesGeometry,
    new THREE.PointsMaterial({
      color: accent,
      size: 0.018,
      transparent: true,
      opacity: 0.45
    })
  );
  scene.add(particles);

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(ratio);
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    const isSmall = window.innerWidth < 720;
    camera.position.set(isSmall ? 1.8 : 3.2, isSmall ? 0.4 : 0.2, isSmall ? 8.2 : 7);
    group.position.set(isSmall ? 1.1 : 2.65, isSmall ? -1.4 : -0.35, -1.4);
    group.scale.setScalar(isSmall ? 0.7 : 1);
  }

  function animate() {
    const elapsed = clock.getElapsedTime();
    const speed = reduceMotion ? 0.08 : 1;

    core.rotation.x = elapsed * 0.18 * speed + pointer.y * 0.18;
    core.rotation.y = elapsed * 0.24 * speed + pointer.x * 0.2;
    innerCore.rotation.x = -elapsed * 0.28 * speed;
    innerCore.rotation.z = elapsed * 0.34 * speed;

    frames.forEach((frame, index) => {
      frame.rotation.z = Math.sin(elapsed * 0.24 + index) * 0.25;
      frame.rotation.x += 0.0007 * (index + 1) * speed;
      frame.rotation.y += 0.0009 * (index + 1) * speed;
    });

    nodes.forEach((node) => {
      node.position.set(
        node.userData.baseX + Math.sin(elapsed * node.userData.speed + node.userData.phase) * 0.14,
        node.userData.baseY + Math.cos(elapsed * node.userData.speed + node.userData.phase) * 0.14,
        node.userData.baseZ + Math.sin(elapsed * 0.22 + node.userData.phase) * 0.42
      );
    });

    particles.rotation.y = elapsed * 0.015 * speed;
    particles.rotation.x = pointer.y * 0.03;
    group.rotation.y = pointer.x * 0.08;
    group.rotation.x = -pointer.y * 0.05;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (event) => {
    pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
  });

  resize();
  animate();
  } catch (error) {
    canvas.style.display = "none";
  }
}
