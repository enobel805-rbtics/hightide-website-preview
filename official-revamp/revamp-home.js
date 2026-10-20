(() => {
const homepageRoot = document.querySelector('.revamp-home');
const syncTheme = () => homepageRoot.dataset.theme = document.documentElement.dataset.theme || 'light';
syncTheme();
new MutationObserver(syncTheme).observe(document.documentElement, {attributes:true, attributeFilter:['data-theme']});
window.highTideIntroRequested = true;
try {
  window.highTideIntroRequested = sessionStorage.getItem('hightide-revamp-visited') !== '1';
  sessionStorage.setItem('hightide-revamp-visited', '1');
} catch (error) {}
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const reveals = document.querySelectorAll('.section, .card, .robot-entry, .split, .dark');
if (!reduced.matches && 'IntersectionObserver' in window) {
  homepageRoot.classList.add('motion-ready');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0.08});
  reveals.forEach((element, index) => {
    element.classList.add('reveal');
    if (element.classList.contains('card')) element.style.setProperty('--delay', `${index % 3 * 90}ms`);
    observer.observe(element);
  });
}
const floating = document.querySelectorAll('.hero-photo, .robot-visual');
let queued = false;
function renderScroll() {
  queued = false;
  const travel = document.documentElement.scrollHeight - innerHeight;
  homepageRoot.style.setProperty('--progress', String(travel > 0 ? scrollY / travel : 0));
  if (reduced.matches) return;
  homepageRoot.style.setProperty('--grid-shift', `${scrollY * .08}px`);
  homepageRoot.style.setProperty('--drift', `${Math.min(scrollY * .025, 25)}px`);
  floating.forEach(element => {
    const rect = element.getBoundingClientRect();
    if (rect.bottom > -100 && rect.top < innerHeight + 100) {
      const offset = Math.max(-18, Math.min(18, (innerHeight / 2 - rect.top - rect.height / 2) * .035));
      element.style.setProperty('--lift', `${offset}px`);
    }
  });
}
window.addEventListener('scroll', () => {
  if (!queued) { queued = true; requestAnimationFrame(renderScroll); }
}, {passive:true});
window.addEventListener('resize', renderScroll);
reduced.addEventListener('change', () => {
  if (reduced.matches) homepageRoot.classList.remove('motion-ready');
  renderScroll();
});
renderScroll();

// Animated tide field: a lightweight canvas behind the hero, never over content.
const tideCanvas = document.querySelector('.tide-canvas');
if (tideCanvas) {
  const context = tideCanvas.getContext('2d');
  let frame = null;
  let inView = true;
  let phase = 0;
  let lastTime = 0;
  let width = 0;
  let height = 0;
  function sizeTide() {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    width = tideCanvas.clientWidth;
    height = tideCanvas.clientHeight;
    tideCanvas.width = Math.round(width * ratio);
    tideCanvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawTide();
  }
  function drawTide() {
    context.clearRect(0, 0, width, height);
    for (let line = 0; line < 15; line++) {
      context.beginPath();
      context.strokeStyle = `rgba(0, 212, 209, ${0.07 + line * .006})`;
      context.lineWidth = 1;
      for (let x = 0; x <= width; x += 9) {
        const y = height * .72 + line * 10 + Math.sin(x / 160 + phase + line * .11) * 32 + Math.sin(x / 310 - phase * .5) * 24;
        if (x === 0) context.moveTo(x, y); else context.lineTo(x, y);
      }
      context.stroke();
    }
  }
  function animateTide(time) {
    frame = null;
    if (reduced.matches || !inView || document.hidden || homepageRoot.classList.contains('intro-running')) return;
    phase += Math.min((time - lastTime) / 1000 || 0, .05) * .45;
    lastTime = time;
    drawTide();
    frame = requestAnimationFrame(animateTide);
  }
  function syncTide() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    const introActive = homepageRoot.classList.contains('intro-running');
    homepageRoot.classList.toggle('motion-paused', reduced.matches || !inView || document.hidden || introActive);
    if (!reduced.matches && inView && !document.hidden && !introActive) {
      lastTime = performance.now();
      frame = requestAnimationFrame(animateTide);
    } else drawTide();
  }
  new ResizeObserver(sizeTide).observe(tideCanvas);
  new IntersectionObserver(entries => { inView = entries[0].isIntersecting; syncTide(); }).observe(tideCanvas);
  document.addEventListener('visibilitychange', syncTide);
  document.addEventListener('introchange', syncTide);
  reduced.addEventListener('change', syncTide);
  sizeTide();
  syncTide();
}

// The white dot bounces off the bottom, becomes the logo, then zooms open the homepage.
const brandIntro = document.querySelector('.brand-intro');
if (brandIntro) {
  let introTimer;
  brandIntro.addEventListener('animationend', event => {
    if (event.target === brandIntro) finishIntro();
  });
  function finishIntro() {
    clearTimeout(introTimer);
    brandIntro.style.visibility = 'hidden';
    brandIntro.setAttribute('aria-hidden', 'true');
    homepageRoot.classList.remove('intro-running');
    homepageRoot.classList.remove('intro-pending');
    // Let the overlay disappear before restarting the canvas and orbit layers.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.dispatchEvent(new Event('introchange'));
    }));
  }
  function playIntro() {
    if (reduced.matches || !window.highTideIntroRequested) { finishIntro(); return; }
    finishIntro();
    brandIntro.classList.remove('is-playing');
    brandIntro.style.visibility = '';
    void brandIntro.offsetWidth;
    brandIntro.classList.add('is-playing');
    brandIntro.setAttribute('aria-hidden', 'false');
    homepageRoot.classList.add('intro-running');
    document.dispatchEvent(new Event('introchange'));
    homepageRoot.classList.remove('intro-pending');
    introTimer = setTimeout(finishIntro, 3100);
  }
  document.addEventListener('keydown', event => { if (event.key === 'Escape') finishIntro(); });
  reduced.addEventListener('change', () => { if (reduced.matches) finishIntro(); });
  playIntro();
}




// Muted real ocean footage; suspend decoding while hidden or during the intro.
const oceanBackground = document.querySelector('.ocean-background');
if (oceanBackground) {
  oceanBackground.muted = true;
  const syncOcean = () => {
    if (reduced.matches || document.hidden || homepageRoot.classList.contains('intro-running')) {
      oceanBackground.pause();
    } else {
      oceanBackground.play().catch(() => {});
    }
  };
  document.addEventListener('visibilitychange', syncOcean);
  document.addEventListener('introchange', syncOcean);
  reduced.addEventListener('change', syncOcean);
  syncOcean();
}

})();
