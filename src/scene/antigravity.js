import * as THREE from 'three';

const SHAPE_COUNT = 7;
const PARTICLE_COUNT = 220;

function buildShape(geometry, color, emissiveIntensity) {
  const group = new THREE.Group();

  const material = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity,
    roughness: 0.25,
    metalness: 0.65,
    transparent: true,
    opacity: 0.92,
  });
  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);

  const edges = new THREE.EdgesGeometry(geometry);
  const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18 }));
  group.add(line);

  return group;
}

function randomGeometry() {
  const pick = Math.floor(Math.random() * 5);
  const scale = 0.55 + Math.random() * 0.55;
  switch (pick) {
    case 0:
      return new THREE.IcosahedronGeometry(scale, 0);
    case 1:
      return new THREE.OctahedronGeometry(scale, 0);
    case 2:
      return new THREE.TorusGeometry(scale * 0.7, scale * 0.26, 12, 32);
    case 3:
      return new THREE.TetrahedronGeometry(scale, 0);
    default:
      return new THREE.DodecahedronGeometry(scale * 0.8, 0);
  }
}

/**
 * Mounts a real Three.js "zero-gravity" scene: geometric shapes that drift,
 * bob, and slowly tumble as if weightless. Returns a controller with
 * `dispose()` to tear down the renderer/animation loop.
 */
export function initAntigravityScene(container, { accent = 0x2dd4bf, accent2 = 0xf59e0b } = {}) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const width = container.clientWidth;
  const height = container.clientHeight;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    return { dispose() {} };
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.0);

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, 9);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const keyLight = new THREE.PointLight(accent, 6, 20);
  keyLight.position.set(-4, 3, 5);
  scene.add(keyLight);
  const fillLight = new THREE.PointLight(accent2, 5, 20);
  fillLight.position.set(4, -2, 4);
  scene.add(fillLight);

  const shapesGroup = new THREE.Group();
  const shapes = [];
  for (let i = 0; i < SHAPE_COUNT; i++) {
    const color = i % 2 === 0 ? accent : accent2;
    const shape = buildShape(randomGeometry(), color, 0.35);
    shape.position.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4.5, (Math.random() - 0.5) * 4);
    shape.userData = {
      bobSpeed: 0.4 + Math.random() * 0.5,
      bobPhase: Math.random() * Math.PI * 2,
      bobAmount: 0.25 + Math.random() * 0.35,
      rotSpeed: new THREE.Vector3((Math.random() - 0.5) * 0.25, (Math.random() - 0.5) * 0.25, (Math.random() - 0.5) * 0.15),
      baseY: shape.position.y,
    };
    shapes.push(shape);
    shapesGroup.add(shape);
  }
  scene.add(shapesGroup);

  // Zero-gravity dust particles
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 14;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(
    particleGeo,
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.02, transparent: true, opacity: 0.35 }),
  );
  scene.add(particles);

  let pointerX = 0;
  let pointerY = 0;
  function handlePointerMove(e) {
    const rect = container.getBoundingClientRect();
    pointerX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointerY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
  }
  container.addEventListener('pointermove', handlePointerMove);

  let frameId = null;
  const clock = new THREE.Clock();

  function renderStaticFrame() {
    shapes.forEach((shape) => {
      shape.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    });
    renderer.render(scene, camera);
  }

  function animate() {
    const elapsed = clock.getElapsedTime();

    shapes.forEach((shape) => {
      const d = shape.userData;
      shape.position.y = d.baseY + Math.sin(elapsed * d.bobSpeed + d.bobPhase) * d.bobAmount;
      shape.rotation.x += d.rotSpeed.x * 0.01;
      shape.rotation.y += d.rotSpeed.y * 0.01;
      shape.rotation.z += d.rotSpeed.z * 0.01;
    });

    shapesGroup.rotation.y += (pointerX * 0.15 - shapesGroup.rotation.y) * 0.02;
    shapesGroup.rotation.x += (pointerY * -0.1 - shapesGroup.rotation.x) * 0.02;
    particles.rotation.y = elapsed * 0.02;

    renderer.render(scene, camera);
    frameId = requestAnimationFrame(animate);
  }

  if (prefersReducedMotion) {
    renderStaticFrame();
  } else {
    animate();
  }

  function handleResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  const resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(container);

  return {
    dispose() {
      if (frameId) cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      container.removeEventListener('pointermove', handlePointerMove);
      shapes.forEach((shape) => {
        shape.children.forEach((child) => {
          child.geometry?.dispose();
          child.material?.dispose();
        });
      });
      particleGeo.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
