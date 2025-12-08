// gigs.js
// Lade, rendere und animiere Upcoming Gigs (lokal: ./data/gigs.json)
// Änderungen:
// - Smooth, gestaffelte Transition-Delays beim Initial-Render und beim "More Events" Append
// - Ganze Section (#next-gigs) fährt beim Scrollen einmalig ein (class: section-visible)
// - Saubere, wartbare Struktur, kommentiert wie von einem strengen Lehrer

async function loadGigs() {
  const res = await fetch('./data/gigs.json');
  const gigs = await res.json();
  const today = new Date();

  // Filtere nur zukünftige Gigs, sortiere chronologisch
  const futureGigs = gigs
    .filter(g => new Date(g.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const list = document.getElementById('gig-list');
  const showMoreBtn = document.getElementById('showNextGigs');
  const gigsSection = document.getElementById('next-gigs');

  // Zustand: wieviele Elemente aktuell sichtbar sind
  let visibleCount = 3;
  // Hilfswert, damit bei "append" die Transition-Delays kontinuierlich fortlaufen
  let lastRenderedCount = 0;

  // Datum formatieren (Tag, 3-letter MONTH, Jahr)
  const formatDate = iso => {
    const d = new Date(iso);
    const month = d.toLocaleString('de-DE', { month: 'short' }).toUpperCase(); // z.B. "JAN"
    return {
      day: d.getDate(),
      month,
      year: d.getFullYear()
    };
  };

  // IntersectionObserver für einzelne Gigs -> fügt .in-view hinzu für Fade-In
  const gigObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          gigObserver.unobserve(entry.target); // einmalig animieren
        }
      });
    },
    { threshold: 0.2 }
  );

  // IntersectionObserver für die gesamte Next-Gigs-Section
  // Ziel: Section fährt einmalig smooth rein (class "section-visible") kurz bevor sie mittig ist
  const gigsSectionObserver = new IntersectionObserver(
    entries => {
      const e = entries[0];
      if (e && e.isIntersecting) {
        gigsSection.classList.add('section-visible');
        gigsSectionObserver.unobserve(gigsSection);
      }
    },
    { threshold: 0.35 } // wird getriggert, wenn ~35% der Section sichtbar sind
  );
  // Starte Beobachtung
  if (gigsSection) gigsSectionObserver.observe(gigsSection);

  /**
   * renderGigs
   * @param {boolean} append - wenn true, nur neue Einträge rendern (für "More Events")
   */
  const renderGigs = (append = false) => {
    // Bestimme Start-Index so dass Transition-Delays linear fortgesetzt werden
    const startIndex = append ? lastRenderedCount : 0;
    // Slice vom startIndex bis visibleCount (exclusive)
    const gigsToRender = futureGigs.slice(startIndex, visibleCount);

    // Wenn nicht append, leere die Liste komplett (Neuladen)
    if (!append) {
      list.innerHTML = '';
    }

    // Erzeuge DOM-Elemente für die zu rendernden Gigs
    gigsToRender.forEach((g, idx) => {
      const { day, month, year } = formatDate(g.date);
      const gigEl = document.createElement('div');
      gigEl.className = 'gig';
      // Transition-Delay: berechne anhand absoluter Position (startIndex + idx)
      const absoluteIndex = startIndex + idx;
      gigEl.style.transitionDelay = `${(absoluteIndex) * 0.12}s`; // kleiner, gleichmäßiger Rhythmus
      gigEl.dataset.date = g.date;

      gigEl.innerHTML = `
        <div class="date">
          <span>${day}</span>
          <span>${month}</span>
          <span>${year}</span>
        </div>
        <div class="info">
          <h3>${g.name}</h3>
          <p>${g.location}</p>
          <a class="ticket-button" target="_blank" href="${g.tickets}">Get Tickets</a>
        </div>`;

      // Append oder Insert abhängig vom Modus
      if (append) {
        list.appendChild(gigEl);
      } else {
        list.appendChild(gigEl);
      }

      // Beobachte das neue Gig-Element für Fade-In
      gigObserver.observe(gigEl);
    });

    // Aktualisiere Button-Visibility
    showMoreBtn.style.display = visibleCount < futureGigs.length ? 'block' : 'none';

    // Merke, wieviele bislang gerendert wurden -> wichtig für spätere Append-Delays
    lastRenderedCount = visibleCount;
  };

  // Initiales Rendern
  renderGigs();

  // "Show more" -> erhöhe visibleCount und render append-weise
  showMoreBtn.addEventListener('click', () => {
    // Wenn keine weiteren Gigs bleiben, nichts tun
    if (visibleCount >= futureGigs.length) return;

    // Erhöhe um 3 (oder bis zum Ende)
    visibleCount = Math.min(futureGigs.length, visibleCount + 3);

    // Render nur die neuen Items; append = true sorgt für korrekte Delays
    renderGigs(true);

    // Optional: sanftes Scrollen, falls nötig, damit Nutzer neue Inhalte besser sehen
    // scrollIntoView für den ersten neu geladenen Gig
    const firstNewIndex = lastRenderedCount;
    const newGig = list.children[firstNewIndex];
    if (newGig) {
      // kleine Verzögerung, damit DOM-Insert fertig ist und CSS-Transitions greifen
      setTimeout(() => {
        newGig.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  });
}

// Starte Laden
loadGigs();
