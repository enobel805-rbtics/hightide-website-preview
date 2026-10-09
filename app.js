try { sessionStorage.setItem("hightide-visited", "1"); } catch {}
const themeToggle = document.querySelector('.theme-toggle');
function applyTheme(theme) {
  const dark = theme === 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  themeToggle?.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
  themeToggle?.setAttribute('title', `Switch to ${dark ? 'light' : 'dark'} mode`);
}
applyTheme(document.documentElement.dataset.theme);
themeToggle?.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(theme);
  try { localStorage.setItem('hightide-theme', theme); } catch {}
});
window.addEventListener('storage', event => {
  if (event.key === 'hightide-theme') applyTheme(event.newValue);
});
const toggle = document.querySelector('.menu');
const nav = document.querySelector('#navigation');
toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = open ? 'Close' : 'Menu';
  nav.classList.toggle('open', open);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('open')) {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = 'Menu';
    toggle.focus();
  }
});

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const reveals = document.querySelectorAll('.section, .card, .robot-entry, .split, .dark');
if (!reduced.matches && 'IntersectionObserver' in window) {
  document.body.classList.add('motion-ready');
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
  document.documentElement.style.setProperty('--progress', String(travel > 0 ? scrollY / travel : 0));
  if (reduced.matches) return;
  document.body.style.setProperty('--grid-shift', `${scrollY * .08}px`);
  document.documentElement.style.setProperty('--drift', `${Math.min(scrollY * .025, 25)}px`);
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
  if (reduced.matches) document.body.classList.remove('motion-ready');
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
    if (reduced.matches || !inView || document.hidden || document.body.classList.contains('intro-running')) return;
    phase += Math.min((time - lastTime) / 1000 || 0, .05) * .45;
    lastTime = time;
    drawTide();
    frame = requestAnimationFrame(animateTide);
  }
  function syncTide() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    const introActive = document.body.classList.contains('intro-running');
    document.body.classList.toggle('motion-paused', reduced.matches || !inView || document.hidden || introActive);
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
    document.body.classList.remove('intro-running');
    document.documentElement.classList.remove('intro-pending');
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
    document.body.classList.add('intro-running');
    document.dispatchEvent(new Event('introchange'));
    document.documentElement.classList.remove('intro-pending');
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
    if (reduced.matches || document.hidden || document.body.classList.contains('intro-running')) {
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
