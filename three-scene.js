import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js";

const canvas = document.getElementById("developer-room-3d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas) {
  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas
    });
    const clock = new THREE.Clock();
    const pointer = new THREE.Vector2(0, 0);
    const room = new THREE.Group();
    const avatar = new THREE.Group();
    const modeState = { current: "builder", accent: new THREE.Color("#d7ff3f") };

    scene.add(room);

    const palette = {
      builder: "#d7ff3f",
      automation: "#58f0ff",
      security: "#ff4fd8",
      learning: "#ff9f43"
    };

    const materials = {
      wall: new THREE.MeshStandardMaterial({ color: "#f5efe3", roughness: 0.9 }),
      floor: new THREE.MeshStandardMaterial({ color: "#f0c45a", roughness: 0.72 }),
      rug: new THREE.MeshStandardMaterial({ color: "#d7ff3f", roughness: 0.7 }),
      desk: new THREE.MeshStandardMaterial({ color: "#f7f2e8", roughness: 0.62 }),
      wood: new THREE.MeshStandardMaterial({ color: "#c9893e", roughness: 0.65 }),
      dark: new THREE.MeshStandardMaterial({ color: "#161821", roughness: 0.58 }),
      white: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.58 }),
      skin: new THREE.MeshStandardMaterial({ color: "#c58c68", roughness: 0.68 }),
      hair: new THREE.MeshStandardMaterial({ color: "#5b3827", roughness: 0.75 }),
      shirt: new THREE.MeshStandardMaterial({ color: "#10131b", roughness: 0.55 }),
      glow: new THREE.MeshStandardMaterial({
        color: "#58f0ff",
        emissive: "#58f0ff",
        emissiveIntensity: 1.3,
        roughness: 0.35
      }),
      screen: new THREE.MeshStandardMaterial({
        color: "#10131b",
        emissive: "#58f0ff",
        emissiveIntensity: 0.45,
        roughness: 0.25
      }),
      plant: new THREE.MeshStandardMaterial({ color: "#55d66b", roughness: 0.62 })
    };

    const ambient = new THREE.HemisphereLight("#fff6df", "#24304a", 2.4);
    const keyLight = new THREE.DirectionalLight("#fff7df", 2.2);
    keyLight.position.set(3.5, 6, 5);
    const accentLight = new THREE.PointLight("#d7ff3f", 3.6, 12);
    accentLight.position.set(-2.2, 2.8, 2.2);
    scene.add(ambient, keyLight, accentLight);

    function box(width, height, depth, material, x, y, z) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
      mesh.position.set(x, y, z);
      room.add(mesh);
      return mesh;
    }

    function sphere(radius, material, x, y, z, scale = [1, 1, 1]) {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 24), material);
      mesh.position.set(x, y, z);
      mesh.scale.set(...scale);
      room.add(mesh);
      return mesh;
    }

    function avatarBox(width, height, depth, material, x, y, z) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
      mesh.position.set(x, y, z);
      avatar.add(mesh);
      return mesh;
    }

    function avatarSphere(radius, material, x, y, z, scale = [1, 1, 1]) {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 24), material);
      mesh.position.set(x, y, z);
      mesh.scale.set(...scale);
      avatar.add(mesh);
      return mesh;
    }

    box(7.2, 0.16, 4.8, materials.floor, 0, -1.28, 0.45);
    box(7.2, 3.4, 0.16, materials.wall, 0, 0.35, -1.95);
    box(0.16, 3.4, 4.8, materials.wall, -3.58, 0.35, 0.45);
    box(2.8, 0.06, 2.05, materials.rug, -0.9, -1.18, 1.1).rotation.y = -0.18;

    const board = box(2.1, 1.1, 0.08, materials.wood, 1.35, 1.05, -1.83);
    board.rotation.z = 0.02;
    [["#ff7a90", -0.52, 0.18], ["#58f0ff", 0.18, -0.12], ["#ffffff", 0.52, 0.2]].forEach(([color, x, y]) => {
      const note = box(0.38, 0.45, 0.02, new THREE.MeshStandardMaterial({ color, roughness: 0.7 }), 1.35 + x, 1.05 + y, -1.76);
      note.rotation.z = x * 0.08;
    });

    box(3.3, 0.22, 1.15, materials.desk, 0.8, -0.35, 0.1);
    [-0.65, 2.25].forEach((x) => {
      [-0.38, 0.56].forEach((z) => box(0.16, 1.0, 0.16, materials.wood, x, -0.88, z));
    });

    const leftScreen = box(1.05, 0.72, 0.08, materials.screen, 0.2, 0.2, -0.45);
    leftScreen.rotation.y = 0.24;
    const rightScreen = box(1.25, 0.78, 0.08, materials.screen, 1.25, 0.23, -0.48);
    rightScreen.rotation.y = -0.18;
    [leftScreen, rightScreen].forEach((screen, screenIndex) => {
      for (let line = 0; line < 6; line += 1) {
        const lineMesh = box(
          0.45 + (line % 3) * 0.12,
          0.026,
          0.018,
          materials.glow,
          screen.position.x - 0.18 + (line % 2) * 0.08,
          screen.position.y + 0.22 - line * 0.075,
          screen.position.z + 0.075
        );
        lineMesh.rotation.y = screenIndex === 0 ? 0.24 : -0.18;
      }
    });

    box(0.9, 0.08, 0.32, materials.dark, 0.75, -0.18, 0.38);
    for (let key = 0; key < 13; key += 1) {
      box(0.042, 0.025, 0.08, materials.glow, 0.36 + key * 0.065, -0.12, 0.24 + (key % 2) * 0.1);
    }

    box(0.75, 0.14, 0.72, materials.dark, -0.78, -0.86, 0.62);
    box(0.55, 0.85, 0.16, materials.dark, -0.78, -0.42, 0.92);
    box(0.12, 0.78, 0.12, materials.dark, -0.78, -1.07, 0.62);

    avatar.position.set(-0.78, -0.45, 0.48);
    room.add(avatar);
    const torso = avatarBox(0.45, 0.68, 0.32, materials.shirt, 0, -0.02, 0);
    const head = avatarSphere(0.28, materials.skin, 0, 0.53, -0.02, [1, 1.08, 1]);
    const hair = avatarSphere(0.29, materials.hair, 0, 0.66, -0.05, [1.05, 0.66, 1.02]);
    const leftArm = avatarBox(0.15, 0.58, 0.15, materials.skin, -0.34, -0.02, -0.04);
    const rightArm = avatarBox(0.15, 0.58, 0.15, materials.skin, 0.34, -0.02, -0.04);
    leftArm.rotation.z = -0.75;
    rightArm.rotation.z = 0.75;
    avatarSphere(0.08, materials.skin, -0.48, -0.24, -0.02);
    avatarSphere(0.08, materials.skin, 0.48, -0.24, -0.02);
    avatarBox(0.16, 0.5, 0.16, materials.dark, -0.14, -0.63, 0.08).rotation.x = -0.34;
    avatarBox(0.16, 0.5, 0.16, materials.dark, 0.14, -0.63, 0.08).rotation.x = -0.34;

    box(0.44, 0.32, 0.44, new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.72 }), 2.75, -0.88, 0.62);
    sphere(0.38, materials.plant, 2.75, -0.46, 0.62, [0.45, 0.95, 0.22]).rotation.z = 0.52;
    sphere(0.34, materials.plant, 2.54, -0.52, 0.58, [0.35, 0.85, 0.2]).rotation.z = -0.7;
    sphere(0.3, materials.plant, 2.95, -0.52, 0.58, [0.35, 0.85, 0.2]).rotation.z = 0.78;

    box(1.2, 0.14, 0.22, materials.desk, -2.32, 1.18, -1.73);
    box(0.26, 0.52, 0.22, new THREE.MeshStandardMaterial({ color: "#ff9f43", roughness: 0.62 }), -2.62, 1.5, -1.65);
    box(0.24, 0.42, 0.22, new THREE.MeshStandardMaterial({ color: "#58f0ff", roughness: 0.62 }), -2.34, 1.44, -1.65);
    sphere(0.18, materials.white, -2.0, 1.42, -1.65);

    const floatingTags = [
      { text: "Python", x: -2.6, y: 0.15, z: -0.75, color: "#d7ff3f" },
      { text: "Make.com", x: 2.45, y: 0.05, z: -0.65, color: "#58f0ff" },
      { text: "Security", x: 2.35, y: 1.35, z: -1.35, color: "#ff4fd8" },
      { text: "Salesforce", x: -2.5, y: 1.4, z: -1.35, color: "#ff9f43" }
    ].map((tag) => {
      const material = new THREE.MeshStandardMaterial({
        color: tag.color,
        emissive: tag.color,
        emissiveIntensity: 0.7,
        roughness: 0.32
      });
      const chip = box(0.42 + tag.text.length * 0.045, 0.1, 0.045, material, tag.x, tag.y, tag.z);
      chip.userData.baseY = tag.y;
      return chip;
    });

    room.rotation.x = -0.2;
    room.rotation.y = -0.32;
    room.position.set(0, 0.24, 0);

    function setMode(mode) {
      if (!palette[mode]) return;
      modeState.current = mode;
      modeState.accent.set(palette[mode]);
      materials.glow.color.set(palette[mode]);
      materials.glow.emissive.set(palette[mode]);
      materials.screen.emissive.set(palette[mode]);
      accentLight.color.set(palette[mode]);
    }

    function resize() {
      const bounds = canvas.getBoundingClientRect();
      const width = Math.max(1, bounds.width);
      const height = Math.max(1, bounds.height);
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(ratio);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      const isSmall = width < 580;
      camera.position.set(isSmall ? 0.6 : 0.25, isSmall ? 1.45 : 1.25, isSmall ? 7.4 : 6.5);
      room.scale.setScalar(isSmall ? 0.74 : 0.92);
    }

    function animate() {
      const elapsed = clock.getElapsedTime();
      const speed = reduceMotion ? 0.18 : 1;
      const typing = Math.sin(elapsed * 9 * speed);

      room.rotation.y += ((-0.3 + pointer.x * 0.22) - room.rotation.y) * 0.04;
      room.rotation.x += ((-0.2 - pointer.y * 0.08) - room.rotation.x) * 0.04;
      avatar.position.y = -0.45 + Math.sin(elapsed * 2.4 * speed) * 0.025;
      head.rotation.y = pointer.x * 0.35;
      head.rotation.x = -pointer.y * 0.18;
      hair.rotation.copy(head.rotation);
      leftArm.rotation.x = -0.48 + typing * 0.08;
      rightArm.rotation.x = -0.48 - typing * 0.08;
      torso.rotation.y = Math.sin(elapsed * 1.2 * speed) * 0.035;

      floatingTags.forEach((tag, index) => {
        tag.position.y = tag.userData.baseY + Math.sin(elapsed * 1.4 + index) * 0.08;
        tag.rotation.y = -room.rotation.y;
      });

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    canvas.addEventListener("pointermove", (event) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      pointer.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    });

    canvas.addEventListener("pointerleave", () => {
      pointer.set(0, 0);
    });

    canvas.addEventListener("click", () => {
      const modes = Object.keys(palette);
      const currentIndex = modes.indexOf(modeState.current);
      const nextMode = modes[(currentIndex + 1) % modes.length];
      document.querySelector(`[data-mode="${nextMode}"]`)?.click();
    });

    document.addEventListener("profile-mode-change", (event) => {
      setMode(event.detail?.mode);
    });

    window.addEventListener("resize", resize);
    setMode("builder");
    resize();
    animate();
  } catch (error) {
    canvas.style.display = "none";
  }
}
