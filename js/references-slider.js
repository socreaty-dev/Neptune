const ticker = document.getElementById('img-ticker');
let speed = 1.5; // Pixel pro Frame, anpassen
let offset = 0;

// Dupliziere Track für lückenloses Endlosen
ticker.innerHTML += ticker.innerHTML; 

function animate() {
  offset -= speed;

  // Gesamte Track-Breite (halbe, weil wir dupliziert haben)
  const totalWidth = ticker.scrollWidth / 2;

  if (Math.abs(offset) >= totalWidth) {
    offset = 0;
  }

  ticker.style.transform = `translateX(${offset}px)`;
  requestAnimationFrame(animate);
}

// Animation starten, wenn Bilder geladen
window.addEventListener('load', () => {
  animate();
});
