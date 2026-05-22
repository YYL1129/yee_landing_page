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
    new THREE.IcosahedronGeometry(1.35, 1),
    new THREE.MeshBasicMaterial({
      color: accent,
      wireframe: true,
      transparent: true,
      opacity: 0.32
    })
  );
  group.add(core);

  const innerCore = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.72, 0),
    new THREE.MeshBasicMaterial({
      color: green,
      wireframe: true,
      transparent: true,
      opacity: 0.34
    })
  );
  group.add(innerCore);

  const orbitMaterials = [
    new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.24, wireframe: true }),
    new THREE.MeshBasicMaterial({ color: green, transparent: true, opacity: 0.22, wireframe: true }),
    new THREE.MeshBasicMaterial({ color: amber, transparent: true, opacity: 0.18, wireframe: true })
  ];

  const orbits = [2.05, 2.78, 3.42].map((radius, index) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.008, 8, 120),
      orbitMaterials[index]
    );
    ring.rotation.x = index * 0.78 + 0.62;
    ring.rotation.y = index * 0.38 + 0.18;
    group.add(ring);
    return ring;
  });

  const nodeMaterial = new THREE.MeshBasicMaterial({
    color: "#ffffff",
    transparent: true,
    opacity: 0.8
  });

  const nodes = Array.from({ length: 18 }, (_, index) => {
    const node = new THREE.Mesh(new THREE.SphereGeometry(index % 3 === 0 ? 0.055 : 0.035, 14, 14), nodeMaterial);
    const angle = (index / 18) * Math.PI * 2;
    const radius = 2.2 + (index % 4) * 0.34;
    node.userData = {
      angle,
      radius,
      speed: 0.16 + (index % 5) * 0.018,
      tilt: (index % 6) * 0.18
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

    orbits.forEach((ring, index) => {
      ring.rotation.z = elapsed * (0.08 + index * 0.028) * speed;
      ring.rotation.x += 0.0008 * (index + 1) * speed;
    });

    nodes.forEach((node) => {
      const angle = node.userData.angle + elapsed * node.userData.speed * speed;
      const radius = node.userData.radius;
      node.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle + node.userData.tilt) * 0.82,
        Math.sin(angle) * radius * 0.42
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
