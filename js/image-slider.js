// image-slider.js
// Simple slider with autoplay, prev/next and active class toggling.
// Also parallax on mouse move.

document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('image-slider');
  if (!slider) return;
  const slides = Array.from(slider.querySelectorAll('.slide'));
  const prevBtn = slider.querySelector('.slider-prev');
  const nextBtn = slider.querySelector('.slider-next');
  let current = 0;
  const setActive = idx => {
    slides.forEach((s,i)=> s.classList.toggle('active', i===idx));
    current = idx;
  }
  setActive(0);

  // autoplay
  let autoplay = setInterval(()=> {
    setActive((current+1) % slides.length);
  }, 5200);

  // controls
  if (prevBtn) prevBtn.addEventListener('click', () => {
    clearInterval(autoplay);
    setActive((current - 1 + slides.length) % slides.length);
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    clearInterval(autoplay);
    setActive((current + 1) % slides.length);
  });

  // parallax on mousemove (subtle)
  slider.addEventListener('mousemove', (ev) => {
    const rect = slider.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    const dx = (ev.clientX - cx) / rect.width;
    const dy = (ev.clientY - cy) / rect.height;
    slides.forEach((s,i)=>{
      const depth = (i === current) ? 18 : 8;
      s.style.transform = `translate3d(${dx*depth}px, ${dy*depth}px, 0) scale(${i===current ? 1 : 0.86})`;
    });
  });

  slider.addEventListener('mouseleave', ()=> {
    slides.forEach((s,i)=> s.style.transform = '');
  });

  // swipe for touch devices
  let touchStartX = null;
  slider.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; clearInterval(autoplay); });
  slider.addEventListener('touchend', e => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setActive((current+1)%slides.length);
      else setActive((current-1+slides.length)%slides.length);
    }
    touchStartX = null;
  });
});
