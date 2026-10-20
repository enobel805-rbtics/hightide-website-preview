/* Restore the saved appearance before the page is painted. */
try {
  document.documentElement.dataset.theme = localStorage.getItem('hightide-site-theme') === 'dark' ? 'dark' : 'light';
} catch (error) {
  document.documentElement.dataset.theme = 'light';
}
