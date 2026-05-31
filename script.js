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
   Init
   ============================================================ */
function init() {
  renderPreview();
}

window.addEventListener('resize', renderPreview);
init();
