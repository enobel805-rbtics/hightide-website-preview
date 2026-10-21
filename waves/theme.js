const root = document.documentElement;
const toggle = document.querySelector('.theme-toggle');
const themeColor = document.querySelector('meta[name="theme-color"]');
function syncTheme() {
  const dark = root.dataset.theme === 'dark';
  toggle.setAttribute('aria-pressed', String(dark));
  toggle.setAttribute('aria-label', dark ? 'Switch to teal mode' : 'Switch to dark mode');
  toggle.title = dark ? 'Switch to teal mode' : 'Switch to dark mode';
  themeColor.content = dark ? '#0a0b0c' : '#094a58';
  // Wake the saved CAD renderer so its material colors update immediately.
  dispatchEvent(new Event('scroll'));
}
toggle.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'teal' : 'dark';
  try { localStorage.setItem('hightide-waves-theme', root.dataset.theme); } catch {}
  syncTheme();
});
syncTheme();
