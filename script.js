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
  platform:  'linkedin',
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
  if (state.type === 'linear') {
    return `linear-gradient(${CSS_DIR[state.direction]}, ${stops})`;
  }
  if (state.type === 'radial') {
    return `radial-gradient(circle at center, ${stops})`;
  }
  return `conic-gradient(from 0deg at center, ${stops})`;
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
  const grad = buildCSSGradient();
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
   Init
   ============================================================ */
function init() {
  renderColorStops();
  renderPreview();
}

generateBtn.addEventListener('click', () => {
  state.stops = smartRandom();
  renderPreview();
  if (typeof renderColorStops === 'function') renderColorStops();
});

window.addEventListener('resize', renderPreview);
init();
