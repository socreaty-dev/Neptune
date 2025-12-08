function scrollToSection(id) {
  const element = document.getElementById(id);
  if (!element) return;

  const start = window.pageYOffset;
  const end = element.offsetTop;
  const distance = end - start;
  const duration = 1000; // 1 Sekunde
  let startTime = null;

  function animateScroll(currentTime) {
    if (!startTime) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);

    // EaseInOutQuad für smoothes Scrollen
    const ease = progress < 0.5
      ? 2 * progress * progress
      : -1 + (4 - 2 * progress) * progress;

    window.scrollTo(0, start + distance * ease);

    if (timeElapsed < duration) {
      requestAnimationFrame(animateScroll);
    }
  }

  requestAnimationFrame(animateScroll);
}

window.scrollToSection = scrollToSection;
