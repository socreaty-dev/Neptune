/* techno-components.js
   Hardtechno Animation Pack - JS Controller
   -----------------------------------------
   Responsibilities:
   - Populate & control the fixed control panel (theme + font switching)
   - Persist user choices to localStorage
   - IntersectionObservers to trigger section effects (laser sweep, reveal)
   - Parallax handler for hero video(s)
   - Glitch randomizer + utility helpers
   - Toggleable global layers (noise, scanlines)

   Usage:
   - Include this file as module after techno-components.css and after the HTML content.
   - Ensure index.html contains a control panel with #themeSelect, #fontSelect and #resetTheme.
*/

/* =============================
   CONFIG: themes & fonts
   ============================= */
const THEMES = [
  'dark-void', 'futuristic-chrome', 'industrial-rust', 'neon-cyberwave', 'rave-acid',
  'digital-matrix', 'psycho-techno', 'warehouse-techno', 'void-pulse', 'circuit-grid'
];

// Mapping font display name -> CSS font-family value (should be loaded via <link> or @font-face)
const FONTS = {
  'Orbitron': "'Orbitron', sans-serif",
  'Oxanium': "'Oxanium', sans-serif",
  'Bruno Ace SC': "'Bruno Ace SC', sans-serif",
  'Exo 2': "'Exo 2', sans-serif",
  'Teko': "'Teko', sans-serif",
  'Space Grotesk': "'Space Grotesk', sans-serif",
  'Rajdhani': "'Rajdhani', sans-serif",
  'Silkscreen': "'Silkscreen', sans-serif",
  'Sarpanch': "'Sarpanch', sans-serif",
  'Audiowide': "'Audiowide', sans-serif"
};

const LS_KEYS = {
  theme: 'techno_theme',
  font: 'techno_font'
};

/* =============================
   HELPERS
   ============================= */
function qs(sel, ctx = document) { return ctx.querySelector(sel); }
function qsa(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }

function setTheme(themeName) {
  if (!themeName) return;
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem(LS_KEYS.theme, themeName);
}

function setFont(fontCssValue) {
  if (!fontCssValue) return;
  document.documentElement.style.setProperty('--font-techno', fontCssValue);
  localStorage.setItem(LS_KEYS.font, fontCssValue);
}

/* Inject a Google Fonts link tag if needed (safe to call multiple times) */
function loadGoogleFonts() {
  // Adjust the families as needed; using many weights for production is heavier.
  const href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Oxanium:wght@200;400;700&family=Bruno+Ace+SC&family=Exo+2:wght@200;400;700&family=Teko:wght@300;600&family=Space+Grotesk:wght@300;600&family=Rajdhani:wght@300;600&family=Silkscreen&family=Sarpanch:wght@400;700&family=Audiowide&display=swap';
  if (!document.querySelector(`link[href^="${href.split('?')[0]}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
}

/* =============================
   CONTROL PANEL UI
   ============================= */
function populateControlPanel() {
  const themeSelect = qs('#themeSelect');
  const fontSelect = qs('#fontSelect');

  // populate themes
  THEMES.forEach(t => {
    const o = document.createElement('option');
    o.value = t; o.textContent = t.replace('-', ' ').toUpperCase();
    themeSelect.appendChild(o);
  });

  // populate fonts
  Object.keys(FONTS).forEach(fname => {
    const o = document.createElement('option');
    o.value = FONTS[fname]; o.textContent = fname;
    fontSelect.appendChild(o);
  });

  // restore from localStorage
  const savedTheme = localStorage.getItem(LS_KEYS.theme) || document.documentElement.getAttribute('data-theme') || THEMES[0];
  const savedFont = localStorage.getItem(LS_KEYS.font) || getComputedStyle(document.documentElement).getPropertyValue('--font-techno').trim() || FONTS['Orbitron'];

  themeSelect.value = savedTheme;
  fontSelect.value = savedFont;

  // event bindings
  themeSelect.addEventListener('change', (e) => setTheme(e.target.value));
  fontSelect.addEventListener('change', (e) => setFont(e.target.value));

  // reset button
  const resetBtn = qs('#resetTheme');
  if (resetBtn) resetBtn.addEventListener('click', () => {
    localStorage.removeItem(LS_KEYS.theme);
    localStorage.removeItem(LS_KEYS.font);
    // fallback defaults
    setTheme(THEMES[0]);
    setFont(FONTS['Orbitron']);
    themeSelect.value = THEMES[0];
    fontSelect.value = FONTS['Orbitron'];
  });
}

/* =============================
   LAYER CONTROLS (noise / scanlines)
   ============================= */
function ensureGlobalLayers() {
  // Create a noise overlay (single shared element)
  if (!qs('.__global_noise')) {
    const noise = document.createElement('div');
    noise.className = '__global_noise noise-layer absolute-cover';
    document.body.appendChild(noise);
  }

  // allow toggling scanlines by adding class .scanlines to sections or body
  if (!document.body.classList.contains('body-noise')) {
    document.body.classList.add('body-noise');
  }
}

/* =============================
   OBSERVERS & ANIMATIONS
   ============================= */
function initLaserObserver() {
  const sections = qsa('.laser-section');
  if (sections.length === 0) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('laser-active');
      }
    });
  }, { threshold: 0.15 });

  sections.forEach(s => obs.observe(s));
}

function initParallax() {
  const videos = qsa('.parallax-video');
  if (videos.length === 0) return;

  // throttle with requestAnimationFrame pattern
  let latestY = 0; let ticking = false;
  window.addEventListener('scroll', () => {
    latestY = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(() => {
        videos.forEach(v => {
          // smaller translate for subtle effect
          const rect = v.getBoundingClientRect();
          const mid = rect.top + rect.height / 2 - window.innerHeight / 2;
          const offset = mid * -0.08; // tune multiplier
          v.style.transform = `translateY(${offset}px) scale(1.05)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* =============================
   GLITCH RANDOMIZER
   - occasionally retriggers the glitch animation
   ============================= */
function initGlitchRandomizer() {
  const glitchEls = qsa('.glitch');
  if (glitchEls.length === 0) return;

  // Ensure each glitch element carries data-text for pseudo-layers
  glitchEls.forEach(el => {
    if (!el.hasAttribute('data-text')) {
      el.setAttribute('data-text', el.textContent.trim());
    }
  });

  // Periodically toggle a small reflow to retrigger CSS animations on a random element
  setInterval(() => {
    const arr = qsa('.glitch');
    if (!arr.length) return;
    arr.forEach(el => {
      if (Math.random() < 0.06) {
        el.style.animation = 'none';
        // force reflow
        void el.offsetWidth;
        el.style.animation = '';
      }
    });
  }, 700);
}

/* =============================
   QUICK ACCESSIBILITY: reduce motion
   ============================= */
function respectReducedMotion() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('*').forEach(node => {
      node.style.animationDuration = '0.001ms';
      node.style.transitionDuration = '0.001ms';
    });
  }
}

/* =============================
   BOOTSTRAP / INIT
   ============================= */
function init() {
  loadGoogleFonts();
  populateControlPanel();
  ensureGlobalLayers();
  initLaserObserver();
  initParallax();
  initGlitchRandomizer();
  respectReducedMotion();

  // set initial theme & font from storage (or default)
  const savedTheme = localStorage.getItem(LS_KEYS.theme) || document.documentElement.getAttribute('data-theme') || THEMES[0];
  const savedFont = localStorage.getItem(LS_KEYS.font) || getComputedStyle(document.documentElement).getPropertyValue('--font-techno').trim() || FONTS['Orbitron'];

  setTheme(savedTheme);
  setFont(savedFont);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else { init(); }

/* =============================
   Optional helpers exported (if using modules elsewhere)
   ============================= */
export { setTheme, setFont, THEMES, FONTS };
