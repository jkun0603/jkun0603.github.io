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
