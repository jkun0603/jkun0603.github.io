function createCardTexture() {
  const tex = new THREE.TextureLoader().load('/assets/images/卡片.jpg');
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}

function createPhysics(anchorX, anchorY) {
  // Anchor (fixed point) at the top
  const anchor = { x: anchorX, y: anchorY, pinned: true, prevX: anchorX, prevY: anchorY };

  // 4 movable masses along the rope
  const segLen = 70; // px per segment
  const masses = [];
  for (let i = 0; i < 4; i++) {
    masses.push({
      x: anchorX,
      y: anchorY,
      prevX: anchorX,
      prevY: anchor.y,
      pinned: false
    });
  }

  function update(dt) {
    const gravity = 800; // px/s²
    const iterations = 8;

    // Verlet integration (with slight damping so rope settles)
    for (const m of masses) {
      if (m.pinned) continue;
      const vx = (m.x - m.prevX) * 0.997;
      const vy = (m.y - m.prevY) * 0.997;
      m.prevX = m.x;
      m.prevY = m.y;
      m.x += vx;
      m.y += vy - gravity * dt * dt; // Gravity pulls down (-y in Three.js)
    }

    // Distance constraints (anchor → mass0 → mass1 → mass2 → mass3)
    const constraints = [
      { a: anchor, b: masses[0], len: segLen },
      { a: masses[0], b: masses[1], len: segLen },
      { a: masses[1], b: masses[2], len: segLen },
      { a: masses[2], b: masses[3], len: segLen },
    ];

    for (let iter = 0; iter < iterations; iter++) {
      for (const c of constraints) {
        const dx = c.b.x - c.a.x;
        const dy = c.b.y - c.a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.001) continue;
        const diff = (c.len - dist) / dist;
        const ox = dx * diff * 0.5;
        const oy = dy * diff * 0.5;
        if (!c.a.pinned) { c.a.x -= ox; c.a.y -= oy; }
        if (!c.b.pinned) { c.b.x += ox; c.b.y += oy; }
      }
    }
  }

  // Get rope points (for rendering) including anchor
  function getPoints() {
    return [
      { x: anchor.x, y: anchor.y },
      { x: masses[0].x, y: masses[0].y },
      { x: masses[1].x, y: masses[1].y },
      { x: masses[2].x, y: masses[2].y },
      { x: masses[3].x, y: masses[3].y },
    ];
  }

  // Reset all masses to anchor position
  function reset() {
    for (const m of masses) {
      m.x = anchor.x;
      m.y = anchor.y;
      m.prevX = m.x;
      m.prevY = m.y;
    }
  }

  // Set target for last mass (during drag)
  function setTarget(x, y) {
    const last = masses[3];
    last.prevX = last.x;
    last.prevY = last.y;
    last.x = x;
    last.y = y;
    last.pinned = true;
  }

  return { masses, update, getPoints, reset, setTarget, anchor, segLen };
}

function initLanyard(container) {
  const rect = container.getBoundingClientRect();
  const W = rect.width || 250;
  const H = rect.height || 400;

  // Scene
  const scene = new THREE.Scene();

  // OrthographicCamera (1 unit = 1 px, origin at center)
  const camera = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, 0.1, 100);
  camera.position.z = 10;

  // Renderer — transparent background, premultiplied alpha off for clean compositing
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambient);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x8a9e9e, 0.6);
  scene.add(hemi);

  // Card — load image texture
  const CARD_W = 200, CARD_H = 254;
  const CARD_ATTACH_OFFSET = 135; // rope attach point above card center (half H + 8px buffer)
  const cardGeo = new THREE.PlaneGeometry(CARD_W, CARD_H);
  const cardMat = new THREE.MeshBasicMaterial({
    map: createCardTexture(),
    transparent: true,
    side: THREE.DoubleSide,
  });
  const cardMesh = new THREE.Mesh(cardGeo, cardMat);
  scene.add(cardMesh);

  // Rope as densely packed small spheres forming a beaded chain
  const ropePoints = 5;
  const SPHERE_RADIUS = 3;
  const SPHERE_SPACING = 3.6;
  const spheresPerSeg = Math.ceil(70 / SPHERE_SPACING);  // ~20 per segment
  const totalRopeSpheres = spheresPerSeg * (ropePoints - 1); // ~80
  const ropeSpheres = [];
  const sphereMat = new THREE.MeshBasicMaterial({ color: 0xD4A853 });
  for (let i = 0; i < totalRopeSpheres; i++) {
    const s = new THREE.Mesh(
      new THREE.SphereGeometry(SPHERE_RADIUS, 6, 5),
      sphereMat
    );
    s.position.z = 1;
    s.renderOrder = 1;
    scene.add(s);
    ropeSpheres.push(s);
  }

  // Physics
  const phys = createPhysics(0, H / 2); // Anchor at top of camera viewport

  // Raycaster for drag
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  // Reusable objects for drag raycasting (GC pressure fix)
  const _dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const _dragIntersect = new THREE.Vector3();

  // State
  let state = 'HIDDEN'; // HIDDEN | ENTERING | IDLE | DRAGGING | SNAPPING_BACK | EXITING
  let dragging = false;
  let dragOffset = new THREE.Vector3();
  let enterTimer = 0;
  let snapTimer = 0;

  // --- Mouse / pointer events ---
  const canvas = renderer.domElement;

  const onPointerDown = (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObject(cardMesh);
    if (hits.length > 0 && state === 'IDLE') {
      dragging = true;
      state = 'DRAGGING';
      const hit = hits[0];
      dragOffset.copy(hit.point).sub(cardMesh.position);
      canvas.style.cursor = 'grabbing';
    }
  };
  canvas.addEventListener('pointerdown', onPointerDown);

  const onPointerMove = (e) => {
    const r = canvas.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const my = -((e.clientY - r.top) / r.height) * 2 + 1;
    // Outside canvas bounds — let clicks pass through
    if (Math.abs(mx) > 1 || Math.abs(my) > 1) {
      canvas.style.pointerEvents = 'none';
      return;
    }
    pointer.x = mx;
    pointer.y = my;

    // Cursor hover — toggle canvas pointer capture only when over card
    if (state === 'IDLE') {
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(cardMesh);
      const over = hits.length > 0;
      canvas.style.pointerEvents = over ? 'auto' : 'none';
      canvas.style.cursor = over ? 'grab' : 'default';
    }

    if (dragging && state === 'DRAGGING') {
      raycaster.setFromCamera(pointer, camera);
      raycaster.ray.intersectPlane(_dragPlane, _dragIntersect);
      // Clamp to container area
      const targetX = Math.max(-W / 2 + 100, Math.min(W / 2 - 100, _dragIntersect.x - dragOffset.x));
      const targetY = Math.max(-H / 2 + 10, Math.min(H / 2 - 10, _dragIntersect.y - dragOffset.y));
      cardMesh.position.set(targetX, targetY, 0);
      // setTarget pins the last mass; offset by half card height so the card
      // body appears at the cursor, not above it
      phys.setTarget(targetX, targetY + CARD_ATTACH_OFFSET);
    }
  };
  window.addEventListener('pointermove', onPointerMove);

  const onPointerUp = () => {
    if (dragging) {
      dragging = false;
      if (phys.masses[3]) phys.masses[3].pinned = false;
      state = 'SNAPPING_BACK';
      canvas.style.cursor = 'default';
    }
  };
  window.addEventListener('pointerup', onPointerUp);

  // --- Animation loop ---
  let clock = new THREE.Clock();
  let animId = null;

  function animate() {
    animId = requestAnimationFrame(animate);
    const rawDt = clock.getDelta();
    const dt = Math.min(rawDt, 0.033); // cap at ~30fps

    const isMobile = window.innerWidth < 768;
    const hideAll = isMobile || state === 'HIDDEN';
    cardMesh.visible = !hideAll;
    for (const s of ropeSpheres) s.visible = !hideAll;
    if (hideAll) {
      canvas.style.pointerEvents = 'none';
      renderer.render(scene, camera);
      return;
    }

    // Physics with fixed timestep for stable simulation
    const PHYSICS_DT = 1 / 60;
    if (state === 'IDLE' || state === 'SNAPPING_BACK') {
      phys.update(PHYSICS_DT);
    }
    // During DRAGGING: run physics too so rope follows naturally
    if (state === 'DRAGGING') {
      phys.update(PHYSICS_DT);
    }

    // Update card position from physics (last mass)
    const pts = phys.getPoints();
    const last = pts[pts.length - 1];
    cardMesh.position.x = last.x;
    cardMesh.position.y = last.y - CARD_ATTACH_OFFSET;

    // Card rotation follows rope angle
    const prev = pts[pts.length - 2];
    const ropeAngle = Math.atan2(last.y - prev.y, last.x - prev.x);
    cardMesh.rotation.z = ropeAngle * 0.5;

    // Distribute rope spheres evenly along the entire rope (anchor → card)
    // Build segment lengths
    const segLens = [];
    let totalLen = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const dx = pts[i + 1].x - pts[i].x;
      const dy = pts[i + 1].y - pts[i].y;
      segLens.push(Math.sqrt(dx * dx + dy * dy));
      totalLen += segLens[i];
    }
    if (totalLen < 1) totalLen = 1;

    let segIdx = 0;
    let segStart = 0;
    let segEnd = segLens[0];
    for (let i = 0; i < ropeSpheres.length; i++) {
      const t = i / (ropeSpheres.length - 1);
      const targetDist = t * totalLen;
      while (targetDist > segEnd && segIdx < segLens.length - 1) {
        segIdx++;
        segStart += segLens[segIdx - 1];
        segEnd = segStart + segLens[segIdx];
      }
      const localT = (targetDist - segStart) / (segEnd - segStart || 1);
      ropeSpheres[i].position.x = pts[segIdx].x + (pts[segIdx + 1].x - pts[segIdx].x) * localT;
      ropeSpheres[i].position.y = pts[segIdx].y + (pts[segIdx + 1].y - pts[segIdx].y) * localT;
      ropeSpheres[i].position.z = 1;
      ropeSpheres[i].visible = true;
    }

    // State transitions
    switch (state) {
      case 'ENTERING': {
        enterTimer += dt;
        const dur = 1.2;
        const p = Math.min(enterTimer / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        const cy = H / 2 + Math.max(600, H * 0.5) * (1 - ease);
        phys.anchor.y = cy;
        for (let i = 0; i < phys.masses.length; i++) {
          phys.masses[i].y = cy - (i + 1) * phys.segLen;
          phys.masses[i].prevY = phys.masses[i].y;
        }
        if (p >= 1) {
          phys.anchor.y = H / 2;
          for (let i = 0; i < phys.masses.length; i++) {
            phys.masses[i].y = H / 2 - (i + 1) * phys.segLen;
            phys.masses[i].prevY = phys.masses[i].y;
          }
          state = 'IDLE';
          enterTimer = 0;
        }
        break;
      }
      case 'IDLE': {
        // No auto-exit — card stays until user drags or scrolls away
        break;
      }
      case 'SNAPPING_BACK': {
        snapTimer += dt;
        if (snapTimer > 1.0) {
          state = 'EXITING';
          snapTimer = 0;
        }
        break;
      }
      case 'EXITING': {
        const speed = 800;
        const offset = speed * dt;
        phys.anchor.y += offset;
        for (const m of phys.masses) {
          m.y += offset;
          m.prevY = m.y;
        }
        if (cardMesh.position.y > H / 2 + 200) {
          state = 'HIDDEN';
        }
        break;
      }
    }

    renderer.render(scene, camera);
  }

  // --- Public API ---
  function trigger() {
    if (state !== 'HIDDEN') return;
    state = 'ENTERING';
    const startY = H / 2 + Math.max(600, H * 0.5);
    phys.anchor.y = startY;
    for (let i = 0; i < phys.masses.length; i++) {
      phys.masses[i].x = phys.anchor.x;
      phys.masses[i].y = startY - (i + 1) * phys.segLen;
      phys.masses[i].prevX = phys.masses[i].x;
      phys.masses[i].prevY = phys.masses[i].y;
    }
    enterTimer = 0;
    snapTimer = 0;
    clock.start();
    if (!animId) animate();
  }

  function destroy() {
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerdown', onPointerDown);
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    renderer.dispose();
    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }
  }

  function skipToExit() {
    if (state !== 'HIDDEN') {
      state = 'EXITING';
      snapTimer = 0;
      dragging = false;
      canvas.style.cursor = 'default';
      if (phys.masses[3]) phys.masses[3].pinned = false;
    }
  }

  // Start animation loop immediately (cheap when HIDDEN, only renders clear)
  clock.start();
  animate();

  return { trigger, destroy, skipToExit, isHidden: () => state === 'HIDDEN' };
}

// Auto-init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('lanyard-container');
  if (!container) return;

  // Mobile: skip entirely
  if (window.innerWidth < 768) return;

  const lanyard = initLanyard(container);

  // Expose globally so main.js can trigger/skip from scroll handler
  window._lanyardCard = lanyard;

  // Skip/exit when scrolling back up past hero
  const hero = document.querySelector('.hero');
  const navbar = document.querySelector('.navbar');
  const navHeight = navbar ? navbar.offsetHeight : 60;

  if (hero) {
    window.addEventListener('scroll', () => {
      const heroRect = hero.getBoundingClientRect();
      // If hero bottom is well below navbar, card should exit
      if (heroRect.bottom > navHeight + 50 && !lanyard.isHidden()) {
        lanyard.skipToExit();
      }
    }, { passive: true });
  }

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    lanyard.destroy();
  });
});
