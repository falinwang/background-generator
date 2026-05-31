/* ============================================================
   Constants
   ============================================================ */
const PLATFORMS = {
  linkedin:  { label: 'Banner · 1584 × 396 px',  w: 1584, h: 396,  ring: true  },
  instagram: { label: 'Story · 1080 × 1920 px',  w: 1080, h: 1920, ring: true  },
  twitter:   { label: 'Header · 1500 × 500 px',  w: 1500, h: 500,  ring: true  },
  website:   { label: 'Hero · 1920 × 1080 px',   w: 1920, h: 1080, ring: false },
};

const CSS_DIR = {
  'right':        'to right',
  'top-right':    'to top right',
  'top':          'to top',
  'top-left':     'to top left',
  'left':         'to left',
  'bottom-left':  'to bottom left',
  'bottom':       'to bottom',
  'bottom-right': 'to bottom right',
};

const CANVAS_DIRS = {
  'right':        [0,   0.5, 1,   0.5],
  'top-right':    [0,   1,   1,   0  ],
  'top':          [0.5, 1,   0.5, 0  ],
  'top-left':     [1,   1,   0,   0  ],
  'left':         [1,   0.5, 0,   0.5],
  'bottom-left':  [1,   0,   0,   1  ],
  'bottom':       [0.5, 0,   0.5, 1  ],
  'bottom-right': [0,   0,   1,   1  ],
};

/* ============================================================
   State
   ============================================================ */
const state = {
  stops:     ['#667eea', '#f093fb'],
  direction: 'right',
  type:      'linear',
  grain:     0,
  platform:  'website',
  glow:          { enabled: false, x: 20, y: 20, intensity: 70 },
  meshPositions: [{ x: 25, y: 60 }, { x: 75, y: 35 }],
  meshChaos:     50,
};

/* ============================================================
   DOM refs
   ============================================================ */
const preview       = document.getElementById('preview');
const previewWrap   = document.getElementById('previewWrap');
const previewNoise  = document.getElementById('previewNoise');
const previewLabel  = document.getElementById('previewLabel');
const ringPreview   = document.getElementById('ringPreview');
const ringGradient  = document.getElementById('ringGradient');
const platformTabs  = document.getElementById('platformTabs');
const generateBtn   = document.getElementById('generateBtn');
const exportBtn     = document.getElementById('exportBtn');
const drawer          = document.getElementById('drawer');
const drawerBackdrop  = document.getElementById('drawerBackdrop');
const customizeBtn    = document.getElementById('customizeBtn');
const drawerClose     = document.getElementById('drawerClose');

/* ============================================================
   Gradient helpers
   ============================================================ */
function buildCSSGradient() {
  const stops = state.stops.join(', ');
  if (state.type === 'mesh') return buildMeshCSS();
  return `linear-gradient(${CSS_DIR[state.direction]}, ${stops})`;
}

function meshDarkBase() {
  const n = state.stops.length;
  const avgR = Math.round(state.stops.reduce((s, c) => s + parseInt(c.slice(1,3),16), 0) / n * 0.15);
  const avgG = Math.round(state.stops.reduce((s, c) => s + parseInt(c.slice(3,5),16), 0) / n * 0.15);
  const avgB = Math.round(state.stops.reduce((s, c) => s + parseInt(c.slice(5,7),16), 0) / n * 0.15);
  return `rgb(${avgR},${avgG},${avgB})`;
}

function buildMeshCSS() {
  // chaos 0 → blobs cover 80% (smooth), chaos 100 → 35% (patchy)
  const spread = Math.round(80 - (state.meshChaos / 100) * 45);
  const layers = state.stops.map((color, i) => {
    const pos = state.meshPositions[i] || { x: 50, y: 50 };
    return `radial-gradient(circle at ${pos.x}% ${pos.y}%, ${color} 0%, transparent ${spread}%)`;
  });
  return [...layers, meshDarkBase()].join(', ');
}

function drawMeshCanvas(ctx, w, h) {
  ctx.fillStyle = meshDarkBase();
  ctx.fillRect(0, 0, w, h);
  // chaos 0 → large blobs (0.75×), chaos 100 → small blobs (0.35×)
  const blobR = Math.max(w, h) * (0.75 - (state.meshChaos / 100) * 0.4);
  // Draw stops in reverse so stops[0] ends up on top (matches CSS layer order)
  [...state.stops].reverse().forEach((color, ri) => {
    const i = state.stops.length - 1 - ri;
    const pos = state.meshPositions[i] || { x: 50, y: 50 };
    const cx = w * pos.x / 100;
    const cy = h * pos.y / 100;
    const pr = parseInt(color.slice(1,3), 16);
    const pg = parseInt(color.slice(3,5), 16);
    const pb = parseInt(color.slice(5,7), 16);
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, blobR);
    grd.addColorStop(0, `rgba(${pr},${pg},${pb},1)`);
    grd.addColorStop(1, `rgba(${pr},${pg},${pb},0)`); // avoid black-fade artifact
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);
  });
}

function smartRandomMesh() {
  const count = Math.random() > 0.5 ? 5 : 4;
  const baseH  = Math.random() * 360;
  const s      = 60 + Math.random() * 20;          // 60–80 %
  const l      = 45 + Math.random() * 15;          // 45–60 %
  const spread = 120 + Math.random() * 120;        // 120–240° hue spread
  return Array.from({ length: count }, (_, i) => {
    const hue = (baseH + (spread / (count - 1)) * i) % 360;
    const sV  = Math.max(45, Math.min(90, s + (Math.random() - 0.5) * 15));
    const lV  = Math.max(35, Math.min(70, l + (Math.random() - 0.5) * 15));
    return hslToHex(hue, sV, lV);
  });
}

function syncMeshPositions() {
  while (state.meshPositions.length < state.stops.length) {
    state.meshPositions.push({
      x: Math.round(15 + Math.random() * 70),
      y: Math.round(15 + Math.random() * 70),
    });
  }
  state.meshPositions.length = state.stops.length;
}

function randomMeshPositions() {
  state.meshPositions = Array.from({ length: state.stops.length }, () => ({
    x: Math.round(15 + Math.random() * 70),
    y: Math.round(15 + Math.random() * 70),
  }));
}

function buildCSSBackground() {
  const base = buildCSSGradient();
  if (!state.glow.enabled) return base;
  const { x, y, intensity } = state.glow;
  const alpha = (intensity / 100 * 0.85).toFixed(2);
  return `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,${alpha}) 0%, transparent 55%), ${base}`;
}

/* ============================================================
   Smart Random — HSL harmony
   ============================================================ */
function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)))
      .toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function smartRandom() {
  const baseH = Math.random() * 360;
  const s = 55 + Math.random() * 25;   // 55–80 %
  const l = 48 + Math.random() * 20;   // 48–68 %
  const useAnalogous = Math.random() > 0.5;

  if (useAnalogous) {
    const offset = 25 + Math.random() * 45;
    return [hslToHex(baseH, s, l), hslToHex((baseH + offset) % 360, s, l)];
  }
  // split-complementary
  const offset = 150 + Math.random() * 60;
  return [hslToHex(baseH, s, l), hslToHex((baseH + offset) % 360, s, l)];
}

/* ============================================================
   Preview renderer
   ============================================================ */
function renderPreview() {
  const grad = buildCSSBackground();
  preview.style.background = grad;
  ringGradient.style.background = grad;

  // Resize preview-wrap to fit the platform's aspect ratio
  const { w, h, label, ring } = PLATFORMS[state.platform];
  const maxW = previewWrap.parentElement.clientWidth - 32;
  const maxH = previewWrap.parentElement.clientHeight
             - previewLabel.offsetHeight
             - (ring ? ringPreview.offsetHeight + 14 : 0)
             - 60; // padding/gap

  const scale = Math.min(maxW / w, Math.max(60, maxH) / h);
  previewWrap.style.width  = `${Math.round(w * scale)}px`;
  previewWrap.style.height = `${Math.round(h * scale)}px`;
  preview.style.width  = '100%';
  preview.style.height = '100%';

  previewLabel.textContent = label;
  ringPreview.style.display = ring ? 'flex' : 'none';

  // Grain opacity
  previewNoise.style.opacity = state.grain / 100 * 0.65; // 0.65 cap keeps grain subtle at max setting
}

/* ============================================================
   Platform tab switching
   ============================================================ */
platformTabs.addEventListener('click', e => {
  const tab = e.target.closest('.tab');
  if (!tab) return;
  platformTabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  state.platform = tab.dataset.platform;
  renderPreview();
});

/* ============================================================
   Drawer open / close
   ============================================================ */
function openDrawer() {
  drawer.classList.add('open');
  drawerBackdrop.classList.add('visible');
  document.body.classList.add('drawer-open');
  drawer.setAttribute('aria-hidden', 'false');
  customizeBtn.setAttribute('aria-expanded', 'true');
  drawerClose.focus();
}

function closeDrawer() {
  drawer.classList.remove('open');
  drawerBackdrop.classList.remove('visible');
  document.body.classList.remove('drawer-open');
  drawer.setAttribute('aria-hidden', 'true');
  customizeBtn.setAttribute('aria-expanded', 'false');
  customizeBtn.focus();
  // Re-render preview after layout shift settles
  setTimeout(renderPreview, 310);
}

customizeBtn.addEventListener('click', openDrawer);
drawerClose.addEventListener('click', closeDrawer);
drawerBackdrop.addEventListener('click', closeDrawer);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
});

/* ============================================================
   Color stop controls
   ============================================================ */
const colorStopsEl = document.getElementById('colorStops');
const addStopBtn   = document.getElementById('addStop');

function renderColorStops() {
  colorStopsEl.innerHTML = '';
  state.stops.forEach((color, i) => {
    const well = document.createElement('div');
    well.className = 'stop-well';

    const input = document.createElement('input');
    input.type  = 'color';
    input.value = color;
    input.setAttribute('aria-label', `Color stop ${i + 1}`);
    input.addEventListener('input', () => {
      state.stops[i] = input.value;
      renderPreview();
    });

    well.appendChild(input);

    if (state.stops.length > 2) {
      const removeBtn = document.createElement('button');
      removeBtn.className = 'stop-remove';
      removeBtn.textContent = '×';
      removeBtn.setAttribute('aria-label', `Remove color stop ${i + 1}`);
      removeBtn.addEventListener('click', () => {
        state.stops.splice(i, 1);
        state.meshPositions.splice(i, 1);
        renderColorStops();
        renderPreview();
      });
      well.appendChild(removeBtn);
    }

    colorStopsEl.appendChild(well);
  });

  addStopBtn.style.display = state.stops.length >= 4 ? 'none' : '';
}

addStopBtn.addEventListener('click', () => {
  if (state.stops.length >= 4) return;
  // Interpolate a new stop between the last two
  const last = state.stops[state.stops.length - 1];
  const prev = state.stops[state.stops.length - 2];
  const mix = mixHex(prev, last, 0.5);
  state.stops.push(mix);
  syncMeshPositions(); // add a random position for the new stop
  renderColorStops();
  renderPreview();
});

function mixHex(a, b, t) {
  const parse = hex => [
    parseInt(hex.slice(1,3), 16),
    parseInt(hex.slice(3,5), 16),
    parseInt(hex.slice(5,7), 16),
  ];
  const [ar,ag,ab] = parse(a);
  const [br,bg,bb] = parse(b);
  const r = Math.round(ar + (br-ar)*t).toString(16).padStart(2,'0');
  const g = Math.round(ag + (bg-ag)*t).toString(16).padStart(2,'0');
  const bv= Math.round(ab + (bb-ab)*t).toString(16).padStart(2,'0');
  return `#${r}${g}${bv}`;
}

/* ============================================================
   Direction grid
   ============================================================ */
const directionGrid = document.getElementById('directionGrid');

directionGrid.addEventListener('click', e => {
  const btn = e.target.closest('.dir-btn');
  if (!btn) return;
  directionGrid.querySelectorAll('.dir-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  state.direction = btn.dataset.dir;
  renderPreview();
});

/* ============================================================
   Type tabs
   ============================================================ */
const typeTabs    = document.getElementById('typeTabs');
const meshOptions = document.getElementById('meshOptions');

typeTabs.addEventListener('click', e => {
  const btn = e.target.closest('.type-btn');
  if (!btn) return;
  typeTabs.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  state.type = btn.dataset.type;
  // Direction only meaningful for linear
  directionGrid.style.opacity = state.type === 'linear' ? '1' : '0.35';
  directionGrid.style.pointerEvents = state.type === 'linear' ? '' : 'none';
  // Chaos only meaningful for mesh
  meshOptions.style.opacity = state.type === 'mesh' ? '1' : '0.35';
  meshOptions.style.pointerEvents = state.type === 'mesh' ? '' : 'none';
  renderPreview();
});

/* ============================================================
   Presets
   ============================================================ */
const PRESETS = [
  { name: 'Aurora',   stops: ['#667eea', '#764ba2'],             dir: 'bottom-right' },
  { name: 'Blush',    stops: ['#f093fb', '#f5576c'],             dir: 'right'        },
  { name: 'Ocean',    stops: ['#4facfe', '#00f2fe'],             dir: 'bottom-right' },
  { name: 'Mint',     stops: ['#43e97b', '#38f9d7'],             dir: 'right'        },
  { name: 'Peach',    stops: ['#fa709a', '#fee140'],             dir: 'bottom-right' },
  { name: 'Lavender', stops: ['#a18cd1', '#fbc2eb'],             dir: 'right'        },
  { name: 'Sand',     stops: ['#ffecd2', '#fcb69f'],             dir: 'bottom'       },
  { name: 'Slate',    stops: ['#2d3436', '#636e72'],             dir: 'right'        },
  { name: 'Midnight', stops: ['#0f0c29', '#302b63', '#24243e'], dir: 'bottom-right' },
  { name: 'Coral',    stops: ['#ff9a9e', '#fad0c4'],             dir: 'right'        },
  { name: 'Forest',   stops: ['#134e5e', '#71b280'],             dir: 'bottom-right' },
  { name: 'Gold',     stops: ['#f7971e', '#ffd200'],             dir: 'right'        },
];

const presetsGrid = document.getElementById('presetsGrid');

PRESETS.forEach(preset => {
  const btn = document.createElement('button');
  btn.className = 'preset-swatch';
  btn.style.background = `linear-gradient(to right, ${preset.stops.join(', ')})`;
  btn.setAttribute('aria-label', `Preset: ${preset.name}`);
  btn.addEventListener('click', () => {
    state.stops     = [...preset.stops];
    state.direction = preset.dir;
    state.type      = 'linear';
    // Sync UI
    renderColorStops();
    directionGrid.querySelectorAll('.dir-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.dir === preset.dir)
    );
    typeTabs.querySelectorAll('.type-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.type === 'linear')
    );
    directionGrid.style.opacity = '1';
    directionGrid.style.pointerEvents = '';
    renderPreview();
  });
  presetsGrid.appendChild(btn);
});

/* ============================================================
   Grain slider
   ============================================================ */
const grainSlider = document.getElementById('grainSlider');
const grainValue  = document.getElementById('grainValue');

grainSlider.addEventListener('input', () => {
  state.grain = Number(grainSlider.value);
  const pct = `${state.grain}%`;
  grainValue.textContent = pct;
  grainSlider.setAttribute('aria-valuetext', pct);
  // Update the CSS custom property used by the slider track fill
  grainSlider.style.setProperty('--fill', pct);
  renderPreview();
});

/* ============================================================
   Chaos slider (mesh only)
   ============================================================ */
const chaosSlider = document.getElementById('chaosSlider');
const chaosValue  = document.getElementById('chaosValue');

chaosSlider.style.setProperty('--fill', '50%');

chaosSlider.addEventListener('input', () => {
  state.meshChaos = Number(chaosSlider.value);
  const pct = `${state.meshChaos}%`;
  chaosValue.textContent = pct;
  chaosSlider.setAttribute('aria-valuetext', pct);
  chaosSlider.style.setProperty('--fill', pct);
  renderPreview();
});

/* ============================================================
   Glow controls
   ============================================================ */
const glowToggle      = document.getElementById('glowToggle');
const glowControls    = document.getElementById('glowControls');
const glowGrid        = document.getElementById('glowGrid');
const glowIntensityEl = document.getElementById('glowIntensity');
const glowValueEl     = document.getElementById('glowValue');

glowToggle.addEventListener('change', () => {
  state.glow.enabled = glowToggle.checked;
  glowControls.classList.toggle('active', glowToggle.checked);
  renderPreview();
});

glowGrid.addEventListener('click', e => {
  const btn = e.target.closest('.glow-btn');
  if (!btn) return;
  glowGrid.querySelectorAll('.glow-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  state.glow.x = Number(btn.dataset.gx);
  state.glow.y = Number(btn.dataset.gy);
  renderPreview();
});

glowIntensityEl.addEventListener('input', () => {
  state.glow.intensity = Number(glowIntensityEl.value);
  const pct = `${state.glow.intensity}%`;
  glowValueEl.textContent = pct;
  glowIntensityEl.style.setProperty('--fill', pct);
  renderPreview();
});

// Init slider fill
glowIntensityEl.style.setProperty('--fill', '70%');

/* ============================================================
   Canvas rendering utilities
   ============================================================ */
function buildCanvasGradient(ctx, w, h) {
  const stops = state.stops;
  const n = stops.length;
  const [x0r, y0r, x1r, y1r] = CANVAS_DIRS[state.direction];
  const grad = ctx.createLinearGradient(x0r * w, y0r * h, x1r * w, y1r * h);
  stops.forEach((color, i) => grad.addColorStop(i / (n - 1), color));
  return grad;
}

function applyGlow(ctx, w, h) {
  if (!state.glow.enabled) return;
  const { x, y, intensity } = state.glow;
  const cx = w * x / 100;
  const cy = h * y / 100;
  const r = Math.max(w, h) * 0.6;
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  const alpha = (intensity / 100 * 0.85).toFixed(2);
  grd.addColorStop(0, `rgba(255,255,255,${alpha})`);
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);
}

function applyGrain(ctx, w, h, intensity) {
  if (intensity === 0) return;
  // Generate greyscale pixel noise
  const imgData = ctx.createImageData(w, h);
  const buf = imgData.data;
  for (let i = 0; i < buf.length; i += 4) {
    const v = Math.random() * 255 | 0;
    buf[i] = buf[i + 1] = buf[i + 2] = v;
    buf[i + 3] = 255;
  }
  const tmp = document.createElement('canvas');
  tmp.width = w; tmp.height = h;
  tmp.getContext('2d').putImageData(imgData, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = intensity * 0.45;   // 100% slider → 0.45 overlay opacity
  ctx.drawImage(tmp, 0, 0);
  ctx.restore();
}

async function renderAsset(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');

  if (state.type === 'mesh') {
    drawMeshCanvas(ctx, w, h);
  } else {
    ctx.fillStyle = buildCanvasGradient(ctx, w, h);
    ctx.fillRect(0, 0, w, h);
  }

  applyGlow(ctx, w, h);
  applyGrain(ctx, w, h, state.grain / 100);
  return canvas;
}

async function renderProfileRing(size) {
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (state.type === 'mesh') {
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    drawMeshCanvas(ctx, size, size);
    ctx.restore();
  } else {
    // Fill gradient circle
    ctx.fillStyle = buildCanvasGradient(ctx, size, size);
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  applyGlow(ctx, size, size);
  applyGrain(ctx, size, size, state.grain / 100);

  // Punch transparent inner hole (78 % of radius = realistic ring width)
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.39, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,1)';
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  return canvas;
}

/* ============================================================
   Text file generators
   ============================================================ */
function generateCSS() {
  const grad = buildCSSBackground(); // includes glow layer if enabled
  const vars = state.stops
    .map((c, i) => `  --brand-color-${i + 1}: ${c};`)
    .join('\n');
  return `:root {\n${vars}\n  --brand-gradient: ${grad};\n}\n\n` +
    `.brand-gradient { background: var(--brand-gradient); }\n` +
    `.brand-hero     { background: var(--brand-gradient); min-height: 100vh; }\n`;
}

function generateBrandMd() {
  const grad = buildCSSGradient();
  const stopLines = state.stops.map((c, i) => `- Stop ${i + 1}: ${c}`).join('\n');
  const cssVars = state.stops
    .map((c, i) => `--brand-color-${i + 1}: ${c};`).join('\n') +
    `\n--brand-gradient: ${grad};\n--brand-grain: ${state.grain}%;`;
  const dirLabel = CSS_DIR[state.direction] || state.direction;
  const grainNote = state.grain > 0
    ? `\n- The grain texture (${state.grain}%) adds warmth and analogue depth` : '';
  const glowNote = state.glow.enabled
    ? `\n- A white glow point (${state.glow.intensity}% intensity) at position ${state.glow.x}% ${state.glow.y}%` : '';

  return `# My Brand Gradient\n\n` +
    `## Palette\n${stopLines}\n- Direction: ${dirLabel}\n- Type: ${state.type}\n- Grain: ${state.grain}%\n\n` +
    `## CSS\nbackground: ${grad};\n\n` +
    `## CSS Variables\n${cssVars}\n\n` +
    `## AI Prompt\nMy personal brand uses a ${state.type} gradient (${state.stops.join(' → ')}), ` +
    `applied ${dirLabel}${state.grain > 0 ? ` with ${state.grain}% grain texture` : ''}.\n\n` +
    `When generating visuals or copy for my brand:\n` +
    `- Use these exact hex values for color consistency\n` +
    `- Mood: modern, creative, tech-forward, distinctive${grainNote}${glowNote}\n` +
    `- Avoid flat, neon, or high-saturation interpretations\n`;
}

/* ============================================================
   Export
   ============================================================ */
const EXPORT_ASSETS = [
  { folder: 'linkedin',  file: 'banner-1584x396.png',      w: 1584, h: 396,  ring: false },
  { folder: 'linkedin',  file: 'profile-ring-800x800.png', w: 800,  h: 800,  ring: true  },
  { folder: 'instagram', file: 'story-1080x1920.png',      w: 1080, h: 1920, ring: false },
  { folder: 'instagram', file: 'post-1080x1080.png',       w: 1080, h: 1080, ring: false },
  { folder: 'instagram', file: 'profile-ring-800x800.png', w: 800,  h: 800,  ring: true  },
  { folder: 'twitter',   file: 'header-1500x500.png',      w: 1500, h: 500,  ring: false },
  { folder: 'twitter',   file: 'profile-ring-400x400.png', w: 400,  h: 400,  ring: true  },
  { folder: 'website',   file: 'hero-1920x1080.png',       w: 1920, h: 1080, ring: false },
];

async function canvasToBlob(canvas) {
  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

async function exportKit() {
  exportBtn.textContent = 'Building kit…';
  exportBtn.classList.add('loading');

  try {
    const zip = new JSZip();

    for (const asset of EXPORT_ASSETS) {
      const canvas = asset.ring
        ? await renderProfileRing(asset.w)
        : await renderAsset(asset.w, asset.h);
      const blob = await canvasToBlob(canvas);
      zip.folder(asset.folder).file(asset.file, blob);
    }

    zip.folder('website').file('gradient.css', generateCSS());
    zip.file('brand.md', generateBrandMd());

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'my-brand-kit.zip');
  } finally {
    exportBtn.textContent = 'Export Brand Kit ↓';
    exportBtn.classList.remove('loading');
  }
}

exportBtn.addEventListener('click', exportKit);

/* ============================================================
   Init
   ============================================================ */
function init() {
  renderColorStops();
  renderPreview();
}

generateBtn.addEventListener('click', () => {
  if (state.type === 'mesh') {
    state.stops = smartRandomMesh(); // 4–5 harmonious colors
    randomMeshPositions();
  } else {
    state.stops = smartRandom();
  }
  renderPreview();
  if (typeof renderColorStops === 'function') renderColorStops();
});

let _resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(renderPreview, 120);
});
init();
