import * as THREE from 'three';

// Real formats users actually convert, one pair per category — literal,
// not abstract, so the hero reads as "this converts files" at a glance.
const BADGES = [
  { label: 'PNG', color: 0x2dd4bf },
  { label: 'JSON', color: 0xf59e0b },
  { label: 'YAML', color: 0x2dd4bf },
  { label: 'MD', color: 0xf59e0b },
  { label: 'B64', color: 0x2dd4bf },
  { label: 'HTML', color: 0xf59e0b },
  { label: 'CSV', color: 0x2dd4bf },
  { label: 'WEBP', color: 0xf59e0b },
];

function makeBadgeTexture(label, colorHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 288;
  const ctx = canvas.getContext('2d');

  const color = `#${colorHex.toString(16).padStart(6, '0')}`;
  const radius = 48;
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.arcTo(w, 0, w, h, radius);
  ctx.arcTo(w, h, 0, h, radius);
  ctx.arcTo(0, h, 0, 0, radius);
  ctx.arcTo(0, 0, w, 0, radius);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(4, 18, 15, 0.92)';
  ctx.font = '800 150px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, w / 2, h / 2 + 10);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function buildBadge({ label, color }) {
  const texture = makeBadgeTexture(label, color);
  const aspect = 512 / 288;
  const height = 1.1;
  const width = height * aspect;
  const depth = 0.09;

  const faceMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    emissiveMap: texture,
    emissive: 0xffffff,
    emissiveIntensity: 0.35,
    roughness: 0.35,
    metalness: 0.1,
  });
  const edgeMaterial = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.3,
    metalness: 0.7,
  });

  const geometry = new THREE.BoxGeometry(width, height, depth);
  // Box face order: +x, -x, +y, -y, +z, -z — texture on front/back, solid edges on the rest.
  const mesh = new THREE.Mesh(geometry, [edgeMaterial, edgeMaterial, edgeMaterial, edgeMaterial, faceMaterial, faceMaterial]);
  return mesh;
}

/**
 * Mounts a real Three.js "zero-gravity" scene: literal file-format badges
 * (PNG, JSON, MD...) drifting and tumbling as if weightless — not abstract
 * decoration. Returns a controller with `dispose()` to tear it down.
 */
export function initAntigravityScene(mountEl, pointerTargetEl = mountEl) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const width = mountEl.clientWidth;
  const height = mountEl.clientHeight;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    return { dispose() {} };
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  mountEl.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
  camera.position.set(0, 0, 9);

  scene.add(new THREE.AmbientLight(0xffffff, 0.65));
  const keyLight = new THREE.PointLight(0x2dd4bf, 5, 22);
  keyLight.position.set(-5, 3, 6);
  scene.add(keyLight);
  const fillLight = new THREE.PointLight(0xf59e0b, 4.5, 22);
  fillLight.position.set(5, -2, 5);
  scene.add(fillLight);

  const badgesGroup = new THREE.Group();
  const badges = [];
  BADGES.forEach((spec, i) => {
    const badge = buildBadge(spec);
    // Two loose rings so badges keep clear of the dropzone card in the center.
    const ring = i % 2;
    const angle = (i / BADGES.length) * Math.PI * 2;
    const radius = ring === 0 ? 4.6 : 6.4;
    badge.position.set(
      Math.cos(angle) * radius * 0.62,
      Math.sin(angle) * radius * 0.32 + (ring === 0 ? 0.6 : -0.4),
      (Math.random() - 0.5) * 2 - 1,
    );
    badge.userData = {
      bobSpeed: 0.35 + Math.random() * 0.4,
      bobPhase: Math.random() * Math.PI * 2,
      bobAmount: 0.22 + Math.random() * 0.28,
      rotSpeed: new THREE.Vector3((Math.random() - 0.5) * 0.15, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.08),
      baseY: badge.position.y,
    };
    badges.push(badge);
    badgesGroup.add(badge);
  });
  scene.add(badgesGroup);

  const particleCount = 160;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(
    particleGeo,
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.02, transparent: true, opacity: 0.3 }),
  );
  scene.add(particles);

  let pointerX = 0;
  let pointerY = 0;
  function handlePointerMove(e) {
    const rect = mountEl.getBoundingClientRect();
    pointerX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointerY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
  }
  pointerTargetEl.addEventListener('pointermove', handlePointerMove);

  let frameId = null;
  const clock = new THREE.Clock();

  function renderStaticFrame() {
    renderer.render(scene, camera);
  }

  function animate() {
    const elapsed = clock.getElapsedTime();

    badges.forEach((badge) => {
      const d = badge.userData;
      badge.position.y = d.baseY + Math.sin(elapsed * d.bobSpeed + d.bobPhase) * d.bobAmount;
      badge.rotation.x += d.rotSpeed.x * 0.01;
      badge.rotation.y += d.rotSpeed.y * 0.01;
      badge.rotation.z += d.rotSpeed.z * 0.01;
    });

    badgesGroup.rotation.y += (pointerX * 0.12 - badgesGroup.rotation.y) * 0.02;
    badgesGroup.rotation.x += (pointerY * -0.08 - badgesGroup.rotation.x) * 0.02;
    particles.rotation.y = elapsed * 0.015;

    renderer.render(scene, camera);
    frameId = requestAnimationFrame(animate);
  }

  if (prefersReducedMotion) {
    renderStaticFrame();
  } else {
    animate();
  }

  function handleResize() {
    const w = mountEl.clientWidth;
    const h = mountEl.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  const resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(mountEl);

  return {
    dispose() {
      if (frameId) cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      pointerTargetEl.removeEventListener('pointermove', handlePointerMove);
      badges.forEach((badge) => {
        badge.geometry?.dispose();
        (Array.isArray(badge.material) ? badge.material : [badge.material]).forEach((m) => {
          m.map?.dispose();
          m.emissiveMap?.dispose();
          m.dispose();
        });
      });
      particleGeo.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
