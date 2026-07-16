import { Renderer, Program, Mesh, Color, Triangle } from 'https://esm.sh/ogl@1.0.11';

const vertexShader = `#version 100
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `#version 100
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform bool uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform bool uTransparent;

varying vec2 vUv;

#define NUM_LAYER 4.0
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.05 * uGlowIntensity) / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uGlowIntensity;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uGlowIntensity;
  m *= smoothstep(1.0, 0.2, d);
  return m;
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);
  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + offset;
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);

      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;

      float star = Star(gv - offset - pad, flareSize);
      vec3 color = base;

      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      star *= twinkle;

      col += star * size * color;
    }
  }
  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;

  vec2 mouseNorm = uMouse - vec2(0.5);

  if (uAutoCenterRepulsion > 0.0) {
    vec2 centerUV = vec2(0.0, 0.0);
    float centerDist = length(uv - centerUV);
    vec2 repulsion = normalize(uv - centerUV) * (uAutoCenterRepulsion / (centerDist + 0.1));
    uv += repulsion * 0.05;
  } else if (uMouseRepulsion) {
    vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;
    float mouseDist = length(uv - mousePosUV);
    vec2 repulsion = normalize(uv - mousePosUV) * (uRepulsionStrength / (mouseDist + 0.1));
    uv += repulsion * 0.05 * uMouseActiveFactor;
  } else {
    vec2 mouseOffset = mouseNorm * 0.1 * uMouseActiveFactor;
    uv += mouseOffset;
  }

  float autoRotAngle = uTime * uRotationSpeed;
  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));
  uv = autoRot * uv;
  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

  vec3 col = vec3(0.0);
  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    float depth = fract(i + uStarSpeed * uSpeed);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.32) * fade;
  }

  if (uTransparent) {
    float alpha = length(col);
    alpha = smoothstep(0.0, 0.3, alpha);
    alpha = min(alpha, 1.0);
    gl_FragColor = vec4(col, alpha);
  } else {
    gl_FragColor = vec4(col, 1.0);
  }
}
`;

function initGalaxy() {
  const overlay = document.getElementById('intro-overlay');
  if (!overlay) return;

  const container = document.createElement('div');
  container.className = 'galaxy-canvas-wrap';
  overlay.prepend(container);

  const renderer = new Renderer({
    alpha: true,
    premultipliedAlpha: false,
    antialias: false,
  });
  const gl = renderer.gl;

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h);
    program.uniforms.uResolution.value = new Color(w, h, w / h);
  }

  const program = new Program(gl, {
    vertex: vertexShader,
    fragment: fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: new Color(1, 1, 1) },
      uFocal: { value: new Float32Array([0.5, 0.5]) },
      uRotation: { value: new Float32Array([1.0, 0.0]) },
      uStarSpeed: { value: 0.5 },
      uDensity: { value: 1.0 },
      uHueShift: { value: 140 },
      uSpeed: { value: 1.0 },
      uMouse: { value: new Float32Array([0.5, 0.5]) },
      uGlowIntensity: { value: 0.3 },
      uSaturation: { value: 0.0 },
      uMouseRepulsion: { value: true },
      uTwinkleIntensity: { value: 0.3 },
      uRotationSpeed: { value: 0.1 },
      uRepulsionStrength: { value: 2.0 },
      uMouseActiveFactor: { value: 0.0 },
      uAutoCenterRepulsion: { value: 0.0 },
      uTransparent: { value: true },
    },
  });

  const geometry = new Triangle(gl);
  const mesh = new Mesh(gl, { geometry, program });

  container.appendChild(gl.canvas);
  resize();

  // Mouse tracking
  const rawMouse = { x: 0.5, y: 0.5 };
  const smoothMouse = { x: 0.5, y: 0.5 };
  let mouseActive = 0;
  let smoothActive = 0;

  function updateMouse(clientX, clientY) {
    const rect = overlay.getBoundingClientRect();
    rawMouse.x = (clientX - rect.left) / rect.width;
    rawMouse.y = 1.0 - (clientY - rect.top) / rect.height;
    mouseActive = 1.0;
  }

  function onMouseMove(e) { updateMouse(e.clientX, e.clientY); }
  function onTouchMove(e) {
    const t = e.touches[0];
    if (t) updateMouse(t.clientX, t.clientY);
  }
  function onMouseLeave() { mouseActive = 0; }

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('mouseleave', onMouseLeave);

  // Animation loop
  let rafId;
  let isVisible = true;

  function loop(time) {
    rafId = requestAnimationFrame(loop);

    // Check visibility
    const hidden = overlay.style.visibility === 'hidden';
    if (hidden) {
      if (isVisible) {
        isVisible = false;
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      return;
    }
    if (!isVisible) isVisible = true;

    program.uniforms.uTime.value = time * 0.001;
    program.uniforms.uStarSpeed.value = (time * 0.001 * 0.5) / 10.0;

    // Smooth mouse
    const lerp = 0.05;
    smoothMouse.x += (rawMouse.x - smoothMouse.x) * lerp;
    smoothMouse.y += (rawMouse.y - smoothMouse.y) * lerp;
    smoothActive += (mouseActive - smoothActive) * lerp;

    program.uniforms.uMouse.value[0] = smoothMouse.x;
    program.uniforms.uMouse.value[1] = smoothMouse.y;
    program.uniforms.uMouseActiveFactor.value = smoothActive;

    renderer.render({ scene: mesh });
  }
  rafId = requestAnimationFrame(loop);

  // Resize (debounced)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 100);
  });

  // Cleanup on scroll-away via MutationObserver
  // (loop already handles visibility, but we keep observer for good measure)
  const obs = new MutationObserver(() => {
    if (overlay.style.visibility === 'hidden') {
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
  });
  obs.observe(overlay, { attributes: true, attributeFilter: ['style'] });

  // Return destroy function
  return function destroy() {
    cancelAnimationFrame(rafId);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('mouseleave', onMouseLeave);
    obs.disconnect();
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    container.remove();
  };
}

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initGalaxy());
} else {
  initGalaxy();
}
