function createCardTexture() {
  const scale = 2; // retina
  const W = 180 * scale;
  const H = 252 * scale;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Utility: rounded rect
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // Card body
  roundRect(0, 0, W, H, 16);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.fill();
  ctx.strokeStyle = '#DCD9CD';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Photo area
  const ph = { x: W * 0.15, y: H * 0.08, w: W * 0.7, h: H * 0.36 };
  roundRect(ph.x, ph.y, ph.w, ph.h, 12);
  const grad = ctx.createLinearGradient(ph.x, ph.y, ph.x, ph.y + ph.h);
  grad.addColorStop(0, '#F0EDE6');
  grad.addColorStop(1, '#E8E5DA');
  ctx.fillStyle = grad;
  ctx.fill();

  // Abstract geometric pattern in photo area
  ctx.save();
  ctx.beginPath();
  ctx.rect(ph.x, ph.y, ph.w, ph.h);
  ctx.clip();

  const cx = ph.x + ph.w / 2;
  const cy = ph.y + ph.h / 2;

  // Large circle (warm accent)
  ctx.fillStyle = 'rgba(138, 158, 158, 0.25)';
  ctx.beginPath();
  ctx.arc(cx - 10, cy - 15, ph.w * 0.28, 0, Math.PI * 2);
  ctx.fill();

  // Small circle
  ctx.fillStyle = 'rgba(138, 158, 158, 0.15)';
  ctx.beginPath();
  ctx.arc(cx + 25, cy + 10, 20, 0, Math.PI * 2);
  ctx.fill();

  // Triangle
  ctx.fillStyle = 'rgba(90, 122, 122, 0.2)';
  ctx.beginPath();
  ctx.moveTo(cx + 5, cy - 40);
  ctx.lineTo(cx + 40, cy - 5);
  ctx.lineTo(cx - 30, cy - 5);
  ctx.closePath();
  ctx.fill();

  // Decorative lines
  ctx.strokeStyle = 'rgba(138, 158, 158, 0.3)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const lx = ph.x + ph.w * 0.15 + i * 25;
    ctx.beginPath();
    ctx.moveTo(lx, ph.y + ph.h * 0.7);
    ctx.lineTo(lx + 15, ph.y + ph.h * 0.7 + 10);
    ctx.stroke();
  }

  // Small dots
  ctx.fillStyle = 'rgba(90, 122, 122, 0.35)';
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(ph.x + ph.w * 0.2 + i * 30, ph.y + ph.h * 0.85, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // Name
  ctx.fillStyle = '#34332E';
  ctx.font = `bold ${Math.round(27 * scale)}px "Inter", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✦ 青桔', W / 2, H * 0.54);

  // Motto line 1
  ctx.fillStyle = '#7D7A72';
  ctx.font = `${Math.round(16 * scale)}px "Inter", sans-serif`;
  ctx.fillText('学习创造', W / 2, H * 0.625);
  ctx.fillText('戒骄戒躁', W / 2, H * 0.675);

  // Divider
  ctx.strokeStyle = '#DCD9CD';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W * 0.25, H * 0.75);
  ctx.lineTo(W * 0.75, H * 0.75);
  ctx.stroke();

  // Footer info
  ctx.fillStyle = '#B5B2A8';
  ctx.font = `${Math.round(13 * scale)}px monospace`;
  ctx.fillText('ID: 0001', W / 2, H * 0.83);
  ctx.fillText('2026 — 2027', W / 2, H * 0.89);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createPhysics(anchorX, anchorY) {
  // Anchor (fixed point) at the top
  const anchor = { x: anchorX, y: anchorY, pinned: true, prevX: anchorX, prevY: anchorY };

  // 3 movable masses along the rope
  const segLen = 55; // px per segment
  const masses = [];
  for (let i = 0; i < 3; i++) {
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

    // Verlet integration
    for (const m of masses) {
      if (m.pinned) continue;
      const vx = m.x - m.prevX;
      const vy = m.y - m.prevY;
      m.prevX = m.x;
      m.prevY = m.y;
      m.x += vx;
      m.y += vy - gravity * dt * dt; // Gravity pulls down (-y in Three.js)
    }

    // Distance constraints (anchor → mass0 → mass1 → mass2)
    const constraints = [
      { a: anchor, b: masses[0], len: segLen },
      { a: masses[0], b: masses[1], len: segLen },
      { a: masses[1], b: masses[2], len: segLen },
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
    const last = masses[2];
    last.prevX = last.x;
    last.prevY = last.y;
    last.x = x;
    last.y = y;
    last.pinned = true;
  }

  return { masses, update, getPoints, reset, setTarget, anchor };
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

  // Card texture
  const texture = createCardTexture();
  const cardGeo = new THREE.PlaneGeometry(180, 252);
  const cardMat = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    roughness: 0.4,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
  const cardMesh = new THREE.Mesh(cardGeo, cardMat);
  scene.add(cardMesh);

  // Rope — line through anchor + 3 masses
  const ropePoints = 4;
  const ropePositions = new Float32Array(ropePoints * 3);
  const ropeGeo = new THREE.BufferGeometry();
  ropeGeo.setAttribute('position', new THREE.BufferAttribute(ropePositions, 3));
  const ropeMat = new THREE.LineBasicMaterial({ color: 0xF0EDE6, transparent: true, opacity: 0.8 });
  const rope = new THREE.Line(ropeGeo, ropeMat);
  scene.add(rope);

  // Physics
  const phys = createPhysics(0, H / 2 - 10); // Anchor at top of container

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
  let stabilizeTimer = 0;
  let idleTimer = 0;

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
    pointer.x = mx;
    pointer.y = my;

    // Cursor hover
    if (state === 'IDLE') {
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(cardMesh);
      canvas.style.cursor = hits.length > 0 ? 'grab' : 'default';
    }

    if (dragging && state === 'DRAGGING') {
      raycaster.setFromCamera(pointer, camera);
      raycaster.ray.intersectPlane(_dragPlane, _dragIntersect);
      // Clamp to container area
      const targetX = Math.max(-W / 2 + 90, Math.min(W / 2 - 90, _dragIntersect.x - dragOffset.x));
      const targetY = Math.max(-H / 2 + 10, Math.min(H / 2 - 10, _dragIntersect.y - dragOffset.y));
      cardMesh.position.set(targetX, targetY, 0);
      // setTarget pins the last mass; offset by half card height so the card
      // body appears at the cursor, not above it
      phys.setTarget(targetX, targetY + 126);
    }
  };
  canvas.addEventListener('pointermove', onPointerMove);

  const onPointerUp = () => {
    if (dragging) {
      dragging = false;
      phys.masses[2].pinned = false;
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
    if (isMobile || state === 'HIDDEN') {
      cardMesh.visible = false;
      rope.visible = false;
      renderer.render(scene, camera);
      return;
    }

    cardMesh.visible = true;
    rope.visible = true;

    // Physics update (runs during DRAGGING too — setTarget pins the last mass
    // while constraints propagate through intermediate masses for natural rope stretch)
    if (state === 'ENTERING' || state === 'IDLE' || state === 'DRAGGING' || state === 'SNAPPING_BACK') {
      phys.update(dt);
    }

    // Update card position from physics (last mass)
    const pts = phys.getPoints();
    const last = pts[pts.length - 1];
    // Card hangs from the top-center, so its position is offset by half height
    cardMesh.position.x = last.x;
    cardMesh.position.y = last.y - 126; // half card height

    // Card rotation follows rope angle
    const prev = pts[pts.length - 2];
    const ropeAngle = Math.atan2(last.y - prev.y, last.x - prev.x);
    cardMesh.rotation.z = ropeAngle * 0.5;

    // Update rope geometry
    const pos = rope.geometry.attributes.position.array;
    for (let i = 0; i < pts.length; i++) {
      pos[i * 3] = pts[i].x;
      pos[i * 3 + 1] = pts[i].y;
      pos[i * 3 + 2] = 0;
    }
    rope.geometry.attributes.position.needsUpdate = true;

    // State transitions
    switch (state) {
      case 'ENTERING': {
        // Check if masses have settled
        let totalVel = 0;
        for (const m of phys.masses) {
          totalVel += Math.abs(m.x - m.prevX) + Math.abs(m.y - m.prevY);
        }
        if (totalVel < 1.5) {
          stabilizeTimer += dt;
          if (stabilizeTimer > 0.5) {
            state = 'IDLE';
            stabilizeTimer = 0;
          }
        } else {
          stabilizeTimer = 0;
        }
        break;
      }
      case 'IDLE': {
        // No auto-exit — card stays as viewport decoration
        break;
      }
      case 'SNAPPING_BACK': {
        let totalVel = 0;
        for (const m of phys.masses) {
          totalVel += Math.abs(m.x - m.prevX) + Math.abs(m.y - m.prevY);
        }
        stabilizeTimer += dt;
        if (totalVel < 1.5 && stabilizeTimer > 0.8) {
          state = 'EXITING';
          stabilizeTimer = 0;
        }
        break;
      }
      case 'EXITING': {
        // Smoothly move everything upward
        const speed = 600; // px/s
        const offset = speed * dt;
        for (const p of pts) {
          p.y -= offset;
        }
        cardMesh.position.y -= offset;
        if (cardMesh.position.y < -H / 2 - 200) {
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
    phys.reset();
    stabilizeTimer = 0;
    idleTimer = 0;
    clock.start();
    if (!animId) animate();
  }

  function destroy() {
    window.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
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
      idleTimer = 0;
      dragging = false;
      canvas.style.cursor = 'default';
      if (phys.masses[2]) phys.masses[2].pinned = false;
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

  // Find the "最近项目" section (the first .section that contains #featuredProjects)
  const section = document.querySelector('#featuredProjects')?.closest('.section');
  if (!section) return;

  let introCleared = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // Don't trigger until intro overlay is gone
        if (!introCleared) {
          const overlay = document.getElementById('intro-overlay');
          if (overlay && overlay.style.visibility !== 'hidden') return;
          introCleared = true;
        }

        if (entry.isIntersecting) {
          // Section entered viewport — card drops from top-right
          lanyard.trigger();
        } else {
          // Section left viewport — card exits
          lanyard.skipToExit();
        }
      });
    },
    { threshold: 0.1 }
  );

  observer.observe(section);

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    observer.disconnect();
    lanyard.destroy();
  });
});
