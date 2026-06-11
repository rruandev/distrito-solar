// ── Placa solar 3D que viaja pelo site no scroll ────────────
// Cria um canvas fixo (atrás do header, acima do conteúdo) com uma
// placa solar 3D que gira e atravessa a tela de um lado para o outro
// conforme o usuário rola a página. Desativada no mobile e quando o
// usuário prefere movimento reduzido.
(function () {
  if (typeof THREE === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 880) return; // mobile: tela pequena demais

  try {
    const test = document.createElement('canvas');
    if (!(test.getContext('webgl') || test.getContext('experimental-webgl'))) return;
  } catch (e) { return; }

  // ── Canvas fixo cobrindo a viewport ─────────
  const canvas = document.createElement('canvas');
  canvas.id = 'scroll3dCanvas';
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;' +
    'z-index:90;opacity:0;transition:opacity .6s ease;';
  document.body.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
  camera.position.set(0, 0, 10);

  scene.add(new THREE.AmbientLight(0xffffff, 0.75));
  const key = new THREE.DirectionalLight(0xfff1c4, 1.1);
  key.position.set(4, 6, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x4a9ae0, 0.6);
  rim.position.set(-5, -2, 4);
  scene.add(rim);

  // ── Placa solar ─────────────────────────────
  const panel = new THREE.Group();

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.1, 2.2),
    new THREE.MeshStandardMaterial({ color: 0x2b3645, metalness: 0.8, roughness: 0.3 })
  );
  panel.add(frame);

  const COLS = 4, ROWS = 3;
  const gridW = 3.0, gridD = 2.0;
  const cellW = gridW / COLS, cellD = gridD / ROWS;
  const cellGeo = new THREE.BoxGeometry(cellW - 0.06, 0.05, cellD - 0.06);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const mat = new THREE.MeshStandardMaterial({
        color: 0x1a52a0,
        emissive: 0x1a72c8,
        emissiveIntensity: 0.35,
        metalness: 0.9,
        roughness: 0.2
      });
      const cell = new THREE.Mesh(cellGeo, mat);
      cell.position.set(
        -gridW / 2 + cellW / 2 + c * cellW,
        0.08,
        -gridD / 2 + cellD / 2 + r * cellD
      );
      panel.add(cell);
    }
  }

  // verso escuro para quando a placa estiver de costas
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(2.9, 0.04, 1.9),
    new THREE.MeshStandardMaterial({ color: 0x16202e, metalness: 0.4, roughness: 0.7 })
  );
  back.position.y = -0.08;
  panel.add(back);

  scene.add(panel);

  // ── Scroll → progresso suavizado ────────────
  let target = 0, smooth = 0;
  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    target = max > 0 ? window.scrollY / max : 0;
    // aparece depois de começar a rolar, some perto do rodapé
    canvas.style.opacity = (window.scrollY > 250 && target < 0.96) ? '1' : '0';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  // largura visível no plano z=0 (para a placa ir de um lado ao outro)
  function viewHalfWidth() {
    const h = Math.tan((camera.fov * Math.PI / 180) / 2) * camera.position.z;
    return h * camera.aspect;
  }

  // ── Loop ────────────────────────────────────
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    if (document.hidden) return;
    t += 0.01;
    smooth += (target - smooth) * 0.07;

    const p = smooth;
    const amp = viewHalfWidth() * 0.62;

    // serpenteia: direita → esquerda → direita... conforme rola
    panel.position.x = Math.sin(p * Math.PI * 4) * amp;
    panel.position.y = Math.cos(p * Math.PI * 5) * 1.6 + Math.sin(t * 1.2) * 0.12;
    panel.position.z = Math.sin(p * Math.PI * 6) * 1.5;

    // giro contínuo guiado pelo scroll + leve giro ocioso
    panel.rotation.y = p * Math.PI * 10 + t * 0.15;
    panel.rotation.x = 0.55 + Math.sin(p * Math.PI * 3) * 0.45;
    panel.rotation.z = Math.sin(p * Math.PI * 2) * 0.25;

    renderer.render(scene, camera);
  }
  animate();
})();
