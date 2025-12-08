// mini-player.js
// Verantwortlich für:
// - Laden eines Sets (aus JSON oder API)
// - Play/Pause handling (Audio element für SoundCloud/hosted mp3)
// - Einbettung eines YouTube-Iframes für Video-Sets
// - Next-Button (navigiert zur nächsten entry in sets list)
// - Fallback-Strategie: wenn kein API-Key vorhanden, lädt sets.json

// ====== KONFIGURATION ======
const CONFIG = {
  // Pfad zur lokalen JSON-Fallback-Datei (manuell pflegbar)
  setsJsonPath: '/data/sets.json',

  // Optional: YouTube API Key & SoundCloud Client-ID (wenn du automatische fetches willst)
  youtubeApiKey: '', // TRAGE HIER EINEN KEY EIN, UM YT-AUTOFETCH ZU AKTIVIEREN
  soundcloudClientId: '' // falls vorhanden
};

// ====== STATE ======
let setsList = []; // geladen aus JSON oder API
let currentIndex = 0;

// ====== DOM-Elemente ======
const audioEl = document.getElementById('mp-audio');
const ytContainer = document.getElementById('mp-yt-container');
const playBtn = document.getElementById('mp-play');
const nextBtn = document.getElementById('mp-next');
const titleEl = document.getElementById('mp-title');
const dateEl = document.getElementById('mp-date');

// ====== Initialisierung ======
document.addEventListener('DOMContentLoaded', initMiniPlayer);

async function initMiniPlayer(){
  // Versuche: Auto-fetch (YouTube/SoundCloud) wenn API-Keys vorhanden, sonst Fallback JSON
  try {
    if (CONFIG.youtubeApiKey || CONFIG.soundcloudClientId) {
      // Hier könnte man automatische Abfragen implementieren (Beispiel: fetchLatest Youtube video)
      // Für jetzt: wir priorisieren lokale JSON, erweitern später mit API-Logik
    }
    // Lade lokale sets.json als Default
    const resp = await fetch(CONFIG.setsJsonPath);
    if (!resp.ok) throw new Error('sets.json not found — please add /data/sets.json');
    setsList = await resp.json();
    if (!Array.isArray(setsList) || setsList.length === 0) {
      console.warn('sets.json leer oder kein Array');
      applyEmptyState();
      return;
    }
    // Setze ersten Eintrag
    loadSetAtIndex(0);
  } catch (err) {
    console.error('MiniPlayer init error', err);
    applyEmptyState();
  }

  // Event-Listener
  playBtn.addEventListener('click', togglePlayPause);
  nextBtn.addEventListener('click', () => loadSetAtIndex((currentIndex + 1) % setsList.length));

  // Pause audio wenn Benutzer navigiert weg
  window.addEventListener('blur', () => audioEl.pause());
}

// ====== Helferfunktionen ======
function applyEmptyState(){
  titleEl.textContent = 'No set loaded';
  dateEl.textContent = '—';
  playBtn.textContent = '▶';
}

// Lade einen Set-Eintrag aus setsList und bereite Player vor
function loadSetAtIndex(i){
  if (!setsList || !setsList[i]) return;
  currentIndex = i;
  const set = setsList[i];

  // set erwartet: { type: 'soundcloud'|'youtube'|'file', title, uploaded_at, stream_url, videoId, poster }
  titleEl.textContent = set.title || 'Untitled Set';
  dateEl.textContent = set.uploaded_at ? new Date(set.uploaded_at).toLocaleDateString('de-DE') : '—';

  // Entferne mögliche vorherige YouTube iframe
  ytContainer.innerHTML = '';
  ytContainer.classList.remove('active');
  audioEl.pause(); audioEl.src = '';

  if (set.type === 'youtube' && set.videoId){
    // Erstelle iframe (YouTube embed) — Play öffnet das iframe
    ytContainer.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${set.videoId}?enablejsapi=1&rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="width:100%;height:100%;"></iframe>`;
    ytContainer.setAttribute('aria-hidden','false');
    // Beim ersten click öffnen wir das iframe-Panel und starten Autoplay via postMessage (YouTube API)
    playBtn.textContent = '▶';
    // Markiere als youtube: mp will open iframe on play
    audioEl.dataset.mode = 'youtube';
  } else if (set.type === 'soundcloud' && set.stream_url){
    // SoundCloud stream playback via audio element (vorausgesetzt CORS/stream erlaubt)
    audioEl.src = set.stream_url + (CONFIG.soundcloudClientId ? `?client_id=${CONFIG.soundcloudClientId}` : '');
    audioEl.dataset.mode = 'audio';
    playBtn.textContent = '▶';
  } else if (set.type === 'file' && set.file_url){
    audioEl.src = set.file_url;
    audioEl.dataset.mode = 'audio';
    playBtn.textContent = '▶';
  } else {
    // Kein abspielbarer stream - nur Metadaten anzeigen
    audioEl.dataset.mode = '';
    playBtn.textContent = '▶';
  }
}

// Play/Pause umschalter (unterstützt audio element und YouTube iframe)
function togglePlayPause(){
  const mode = audioEl.dataset.mode;
  if (mode === 'audio') {
    if (audioEl.paused) {
      audioEl.play().catch(e => console.warn('Audio play failed', e));
      playBtn.textContent = '⏸';
    } else {
      audioEl.pause();
      playBtn.textContent = '▶';
    }
  } else if (mode === 'youtube') {
    // Für YouTube-Embeds nutzen wir postMessage zum iframe, aber einfacher: öffne das panel und let iframe handle play by user click
    ytContainer.classList.toggle('active');
    // Optional: wenn iframe unterstützt Autoplay via &autoplay=1, könnte man das ergänzen (Browser-Autoplay-Policies beachten)
    playBtn.textContent = ytContainer.classList.contains('active') ? '⏸' : '▶';
  } else {
    // nichts spielbar
    console.info('No playable source for this set');
  }
}
