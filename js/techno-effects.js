// techno-effects.js
// Greift die bereits vorhandene in-view Logik und löst visuelle Effekte (CSS classes) aus.
// Optional: leichter Audio-Impuls (WebAudio) — sehr kurz, subtil, nur wenn user interaction erlaubt.

document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('section.section-pulse, section.section-glitch');

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        triggerEffects(entry.target);
      }
    });
  }, { threshold: 0.65 });

  sections.forEach(s => io.observe(s));
});

// Trigger-Effekte: setze Klasse, spiele optionalen Bass-Pulse geringe Lautstärke
function triggerEffects(el) {
  el.classList.add('active');
  setTimeout(()=> el.classList.remove('active'), 900); // kurz und subtil

  // Optionaler Audio-Impuls: nur wenn Nutzer bereits Interagiert (Browser Autoplay-Regeln)
  if (window.__AUDIO_CONTEXT_ALLOWED) {
    playSubtlePulse();
  } else {
    // Erstelle eine "user interaction listener" nur einmal
    const onFirst = () => {
      window.__AUDIO_CONTEXT_ALLOWED = true;
      window.removeEventListener('click', onFirst);
    };
    window.addEventListener('click', onFirst, { once:true });
  }
}

// WebAudio minimal pulse (very short sine burst)
function playSubtlePulse(){
  try {
    const ctx = (window.__AUDIO_CTX ||= new (window.AudioContext || window.webkitAudioContext)());
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 60; // low frequency
    g.gain.value = 0.0006; // extremely low volume — just feel, not hear
    o.connect(g); g.connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0000001, ctx.currentTime + 0.18);
    setTimeout(()=> { try{o.stop();}catch(e){} }, 220);
  } catch(e){ /* fail silently */ }
}
