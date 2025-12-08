// scroll-snap.js
// Diese Datei stellt programmatische Scroll-Funktionalität bereit,
// sowie eine helper-Funktion `scrollToSection(id)` die im HTML verwendet wird.

export function scrollToSection(id){
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Wenn du globale Verfügbarkeit möchtest:
window.scrollToSection = scrollToSection;

// Optional: beobachte sections und füge class in-view (wird für Animationen gebraucht)
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('section, header');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('in-view');
      else e.target.classList.remove('in-view');
    });
  }, { threshold: 0.5 });
  sections.forEach(s => io.observe(s));
});
