// ── Hero 3D — painel solar em WebGL (Three.js) ──────────────
// Renderiza um painel solar 3D flutuando com sol e partículas de
// energia. Se WebGL/Three não estiver disponível, mantém o visual
// CSS original como fallback (classe .has-3d nunca é adicionada).
(function () {
  const wrap   = document.getElementById('hero3dWrap');
  const canvas = document.getElementById('hero3dCanvas');
  if (!wrap || !canvas || typeof THREE === 'undefined') return;

  // checa suporte a WebGL
  try {
    const test = document.createElement('canvas');
    if (!(test.getContext('webgl') || test.getContext('experimental-webgl'))) return;
  } catch (e) { return; }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Setup básico ────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
  camera.position.set(0, 0.6, 9);

  // ── Luzes ───────────────────────────────────
  scene.add(new THREE.AmbientLight(0x8fb6e8, 0.55));
  const sunLight = new THREE.PointLight(0xffc94d, 1.6, 30);
  sunLight.position.set(2.8, 2.6, 1.5);
  scene.add(sunLight);
  const fill = new THREE.DirectionalLight(0x4a9ae0, 0.5);
  fill.position.set(-3, 1, 4);
  scene.add(fill);

  // grupo principal (gira com o mouse)
  const root = new THREE.Group();
  scene.add(root);

  // ── Painel solar ────────────────────────────
  const panel = new THREE.Group();

  // moldura
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(4.6, 0.14, 3.1),
    new THREE.MeshStandardMaterial({ color: 0x222c3a, metalness: 0.7, roughness: 0.35 })
  );
  panel.add(frame);

  // células 5×3 sobre a moldura
  const COLS = 5, ROWS = 3;
  const cellW = 4.3 / COLS, cellD = 2.8 / ROWS;
  const cellGeo = new THREE.BoxGeometry(cellW - 0.07, 0.06, cellD - 0.07);
  const litCells = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const lit = (r + c) % 2 === 0;
      const mat = new THREE.MeshStandardMaterial({
        color: lit ? 0x2c7acc : 0x1a52a0,
        emissive: lit ? 0x1a72c8 : 0x0d3474,
        emissiveIntensity: lit ? 0.55 : 0.25,
        metalness: 0.85,
        roughness: 0.25
      });
      const cell = new THREE.Mesh(cellGeo, mat);
      cell.position.set(
        -4.3 / 2 + cellW / 2 + c * cellW,
        0.1,
        -2.8 / 2 + cellD / 2 + r * cellD
      );
      if (lit) litCells.push({ mat, phase: (r * COLS + c) * 0.7 });
      panel.add(cell);
    }
  }

  panel.rotation.x = 1.0;   // face das células inclinada para a câmera/sol
  panel.rotation.z = 0.08;
  panel.position.set(-0.4, -0.3, 0);
  root.add(panel);

  // ── Sol ─────────────────────────────────────
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffd34d })
  );
  sun.position.copy(sunLight.position);
  root.add(sun);

  // brilho do sol (sprite com gradiente radial)
  function glowTexture(inner, outer) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, inner);
    g.addColorStop(1, outer);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture('rgba(255,211,77,.9)', 'rgba(255,160,0,0)'),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }));
  glow.scale.set(3.4, 3.4, 1);
  glow.position.copy(sun.position);
  root.add(glow);

  // ── Partículas de energia (sol → painel) ────
  const P_COUNT = 90;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(P_COUNT * 3);
  const parts = [];
  for (let i = 0; i < P_COUNT; i++) {
    parts.push({
      t: Math.random(),
      speed: 0.004 + Math.random() * 0.006,
      ox: (Math.random() - 0.5) * 1.6,
      oz: (Math.random() - 0.5) * 1.2
    });
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const points = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0xffd34d,
    size: 0.07,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    map: glowTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0)'),
    alphaTest: 0.01
  }));
  root.add(points);

  const sunPos = sun.position, panelPos = panel.position;
  function updateParticles() {
    const arr = pGeo.attributes.position.array;
    for (let i = 0; i < P_COUNT; i++) {
      const p = parts[i];
      p.t += p.speed;
      if (p.t > 1) { p.t = 0; }
      const t = p.t;
      // curva do sol até o painel, com arco
      const x = sunPos.x + (panelPos.x + p.ox - sunPos.x) * t;
      const y = sunPos.y + (panelPos.y + 0.2 - sunPos.y) * t + Math.sin(t * Math.PI) * 0.9;
      const z = sunPos.z + (panelPos.z + p.oz - sunPos.z) * t;
      arr[i * 3] = x; arr[i * 3 + 1] = y; arr[i * 3 + 2] = z;
    }
    pGeo.attributes.position.needsUpdate = true;
  }

  // ── Poeira flutuante de fundo ───────────────
  const D_COUNT = 60;
  const dGeo = new THREE.BufferGeometry();
  const dPos = new Float32Array(D_COUNT * 3);
  for (let i = 0; i < D_COUNT; i++) {
    dPos[i * 3]     = (Math.random() - 0.5) * 12;
    dPos[i * 3 + 1] = (Math.random() - 0.5) * 8;
    dPos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
  }
  dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  const dust = new THREE.Points(dGeo, new THREE.PointsMaterial({
    color: 0x9ecbff, size: 0.045, transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  scene.add(dust);

  // ── Interação com o mouse ───────────────────
  let targetRX = 0, targetRY = 0;
  window.addEventListener('mousemove', (e) => {
    targetRY = (e.clientX / window.innerWidth - 0.5) * 0.5;
    targetRX = (e.clientY / window.innerHeight - 0.5) * 0.3;
  }, { passive: true });

  // ── Resize ──────────────────────────────────
  function resize() {
    const w = wrap.clientWidth || 420;
    const h = Math.max(wrap.clientHeight, 380);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);

  // pausa quando o hero sai da tela
  let visible = true;
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
  }).observe(wrap);

  // ── Loop de animação ────────────────────────
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    if (!visible) return;
    t += 0.01;

    // flutuação e rotação suaves
    root.position.y = Math.sin(t) * 0.18;
    root.rotation.y += (targetRY - root.rotation.y) * 0.05;
    root.rotation.x += (targetRX - root.rotation.x) * 0.05;
    panel.rotation.z = 0.08 + Math.sin(t * 0.6) * 0.04;

    // pulso do sol e das células
    const pulse = 1 + Math.sin(t * 2) * 0.07;
    glow.scale.set(3.4 * pulse, 3.4 * pulse, 1);
    litCells.forEach((c) => {
      c.mat.emissiveIntensity = 0.45 + Math.sin(t * 2 + c.phase) * 0.25;
    });

    updateParticles();
    dust.rotation.y = t * 0.02;

    renderer.render(scene, camera);
  }

  // ativa o modo 3D (esconde fallback CSS) e inicia
  wrap.classList.add('has-3d');
  resize();
  if (reduceMotion) {
    updateParticles();
    renderer.render(scene, camera); // um frame estático
  } else {
    animate();
  }
})();
