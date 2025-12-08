// main.js
import './gigs.js';
import './navigation.js';
import './references-slider.js';

// import './techno-effects.js';


// import './mini-player.js';
// import './scroll-snap.js';

// import './image-slider.js';


// import './techno-components.js';

// main.js
document.addEventListener('DOMContentLoaded', () => { 
  const gigs = document.querySelectorAll('.gig');

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target); // nur einmal animieren
        }
      });
    },
    { threshold: 0.2 } // 20% sichtbar
  );

  gigs.forEach(gig => observer.observe(gig));
});

window.addEventListener("DOMContentLoaded", () => {
  const playBtn = document.getElementById("play-soundcloud");
  const iframe = document.getElementById("sc-player");
  const widget = SC.Widget(iframe);

  let isPlaying = false;

  const togglePlay = () => {
    if (isPlaying) {
      widget.pause();
      isPlaying = false;
      playBtn.textContent = '♪';
      playBtn.style.color = 'var(--accent-primary)';
      playBtn.style.textShadow =
        '0 0 6px var(--accent-primary), 0 0 12px var(--accent-primary)';
    } else {
      widget.play();
      isPlaying = true;
      playBtn.textContent = '■';
      playBtn.style.color = 'var(--text-main)';
      playBtn.style.textShadow =
        '0 0 8px var(--text-main), 0 0 8px var(--text-main)';
    }
  };

  playBtn.addEventListener("click", togglePlay);

  // 🔥 AUTO-KLICK NACH 2 SEK.
  setTimeout(() => {
    // extra safeguard: nur wenn button existiert
    if (playBtn) playBtn.click();
  }, 2000);
});


const nextGigsSection = document.getElementById('next-gigs');

window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset;
  
  // Faktor: kleiner Wert = subtiler Effekt, größer = krasser
  const parallaxSpeed = 0.25;

  // Hintergrund verschieben
  nextGigsSection.style.backgroundPosition = `center ${scrollTop * parallaxSpeed}px`;

  // Optional: Overlay leicht verschieben für depth effect
  const overlay = nextGigsSection.querySelector('.fade-overlay');
  if (overlay) {
    overlay.style.transform = `translateY(${scrollTop * parallaxSpeed * 0.5}px)`;
  }
});


// Warte bis der echte CTA-Button existiert UND seine Click-Handler registriert sind
const autoClickInterval = setInterval(() => {
  const btn = document.querySelector('.cta');

  if (!btn) return; // Knopf noch nicht im DOM

  // Prüfen, ob ein Click-Handler drauf sitzt (Browser-API)
  const hasHandler = getEventListeners(btn)?.click?.length > 0;

  if (!hasHandler) return; // Handler noch nicht geladen

  // Wenn wir hier sind → Button + Handler existieren
  clearInterval(autoClickInterval);

  setTimeout(() => {
    btn.click();
  }, 2000); // 2 Sek. warten, dann drücken
}, 300);

