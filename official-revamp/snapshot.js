/* Restore silent looping backgrounds, with still-image fallbacks. */
const backgroundMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('wix-video.local-background-animation').forEach(function (container) {
  const video = container.querySelector('video');
  if (!video) return;
  const showVideo = () => container.classList.add('is-playing');
  const showPoster = () => container.classList.remove('is-playing');
  video.muted = true;
  video.addEventListener('playing', showVideo);
  video.addEventListener('error', showPoster);
  const updateMotion = function () {
    video.autoplay = !backgroundMotionPreference.matches;
    if (backgroundMotionPreference.matches) {
      video.pause();
      showPoster();
    } else {
      video.play().catch(showPoster);
    }
  };
  backgroundMotionPreference.addEventListener('change', updateMotion);
  updateMotion();
});

/* The same saved appearance follows visitors across all local pages. */
const siteThemeToggle = document.querySelector('.site-theme-toggle');
function applySiteTheme(theme) {
  const dark = theme === 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  if (siteThemeToggle) {
    siteThemeToggle.setAttribute('aria-checked', String(dark));
    siteThemeToggle.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    siteThemeToggle.querySelector('.theme-mode-label').textContent = dark ? 'Dark' : 'Light';
  }
}
applySiteTheme(document.documentElement.dataset.theme);
siteThemeToggle?.addEventListener('click', function () {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applySiteTheme(theme);
  try { localStorage.setItem('hightide-site-theme', theme); } catch (error) { /* Toggle still works without storage. */ }
});
window.addEventListener('storage', function (event) {
  if (event.key === 'hightide-site-theme') applySiteTheme(event.newValue);
});

/* Restore the official Resources dropdown without the Wix runtime. */
document.querySelectorAll('wix-dropdown-menu li').forEach(function (item) {
  const submenu = item.querySelector(':scope > ul');
  const trigger = item.querySelector(':scope > [role="button"]');
  if (!submenu || !trigger) return;
  const setOpen = function (open) {
    item.classList.toggle('resources-open', open);
    submenu.setAttribute('aria-hidden', String(!open));
    submenu.style.display = open ? 'block' : 'none';
    trigger.setAttribute('aria-expanded', String(open));
    submenu.querySelectorAll('a').forEach(a => a.tabIndex = open ? 0 : -1);
  };
  let pointerHovered = false;
  const toggle = event => setOpen(pointerHovered && event?.detail > 0 ? true : trigger.getAttribute('aria-expanded') !== 'true');
  item.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') {
      pointerHovered = true;
      setOpen(true);
    }
  });
  item.addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse') {
      pointerHovered = false;
      if (!item.contains(document.activeElement)) setOpen(false);
    }
  });
  trigger.addEventListener('click', toggle);
  item.querySelector(':scope > button')?.addEventListener('click', toggle);
  trigger.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      submenu.querySelector('a')?.focus();
    }
  });
  item.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      setOpen(false);
      trigger.focus();
    }
  });
  item.addEventListener('focusout', function (event) {
    if (!item.contains(event.relatedTarget)) setOpen(false);
  });
  document.addEventListener('click', function (event) {
    if (!item.contains(event.target)) setOpen(false);
  });
  setOpen(false);
});

/* Allow the original mobile menu to work in the static snapshot. */
document.addEventListener('click', function (event) {
  const button = event.target.closest('[data-testid="hamburger"]');
  if (!button) return;
  const open = button.getAttribute('aria-expanded') !== 'true';
  button.setAttribute('aria-expanded', String(open));
  document.querySelectorAll('[data-testid="mobile-menu"]').forEach(function (menu) {
    menu.style.display = open ? 'block' : 'none';
  });
});

// Keep the original contact fields; composing a message uses the visitor's email app.
// No message is sent by this page.
document.querySelectorAll('#SITE_FOOTER form').forEach(function (form) {
  const address = document.querySelector('#SITE_FOOTER a[href^="mailto:"]');
  if (!address) return;
  const button = form.querySelector('button');
  if (button) {
    button.type = 'submit';
    button.setAttribute('aria-label', 'Send — open an email draft');
  }
  const note = document.createElement('p');
  note.className = 'contact-email-note';
  note.textContent = 'Send opens a draft in your email app. Review it there before sending.';
  form.insertAdjacentElement('afterend', note);
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const value = name => form.querySelector('input[name="' + name + '"]')?.value.trim() || '';
    const subject = value('subject') || 'HighTide website inquiry';
    const body = 'Name: ' + value('name-*') + '\nEmail: ' + value('email') + '\n\n' + value('message');
    window.location.href = address.getAttribute('href') + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
});
