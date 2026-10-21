(() => {
  const archive = document.querySelector('.robot-archive');
  if (!archive) return;
  archive.querySelectorAll('.compare-toggle').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => {
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      const open = button.getAttribute('aria-expanded') !== 'true';
      panel.hidden = !open;
      panel.closest('.robot-visual').classList.toggle('is-comparing', open);
      button.setAttribute('aria-expanded', String(open));
      button.innerHTML = open ? 'Close comparison <span aria-hidden="true">−</span>' : 'Compare with original <span aria-hidden="true">+</span>';
    });
  });

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const activeAnimations = new Set();
  if ('IntersectionObserver' in window) {
    const entrance = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entrance.unobserve(entry.target);
        if (motion.matches || !entry.target.animate) return;
        const parts = entry.target.querySelectorAll(':scope > .robot-visual, :scope > div > h2, :scope > div > .season-details, :scope > div > p:not(.season-details), :scope > div > .text-link');
        parts.forEach((part, index) => {
          const animation = part.animate([
            {opacity:.35, transform:'translateY(20px)'},
            {opacity:1, transform:'translateY(0)'}
          ], {duration:560,delay:Math.min(index,4)*65,easing:'cubic-bezier(.2,.7,.2,1)'});
          activeAnimations.add(animation);
          animation.finished.then(() => activeAnimations.delete(animation)).catch(() => {});
        });
      });
    }, {threshold:.12});
    archive.querySelectorAll('.robot-entry').forEach(entry => entrance.observe(entry));
    motion.addEventListener('change', () => {
      if (motion.matches) {
        activeAnimations.forEach(animation => animation.cancel());
        activeAnimations.clear();
      }
    });
    const location = new IntersectionObserver(entries => {
      const entry = entries.find(item => item.isIntersecting);
      if (!entry) return;
      archive.querySelectorAll('.year-nav a').forEach(link => {
        if (entry.target.classList.contains('robot-entry') && link.hash === '#' + entry.target.id) link.setAttribute('aria-current','location');
        else link.removeAttribute('aria-current');
      });
    }, {rootMargin:'-15% 0px -45% 0px'});
    archive.querySelectorAll('.robot-entry').forEach(entry => location.observe(entry));
    location.observe(archive.querySelector('.archive-hero'));
  }
})();
