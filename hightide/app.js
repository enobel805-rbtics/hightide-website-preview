const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#menu');
const menuLinks = [...menu.querySelectorAll('a')];
let menuOpen = false;
let menuCloseTimer;
function setMenu(open) {
  clearTimeout(menuCloseTimer);
  menuOpen = open;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.body.classList.toggle('menu-open', open);
  if (open) {
    menu.hidden = false;
    menu.getBoundingClientRect();
    requestAnimationFrame(() => menu.classList.add('menu-visible'));
    menuLinks[0].focus({preventScroll:true});
  } else {
    menu.classList.remove('menu-visible');
    menuCloseTimer=setTimeout(()=>{ if (!menuOpen) menu.hidden=true; }, matchMedia('(prefers-reduced-motion: reduce)').matches?0:450);
  }
  document.querySelector('main').inert=open;
  document.querySelector('footer').inert=open;
}
toggle.addEventListener('click', () => setMenu(!menuOpen));
menuLinks.forEach(link => link.addEventListener('click', () => {setMenu(false);}));
document.addEventListener('keydown', e => {
  if (!menuOpen) return;
  if (e.key === 'Escape') { setMenu(false); toggle.focus(); }
  if (e.key === 'Tab') {
    const focusable = [toggle, ...menuLinks];
    const first = focusable[0], last = focusable.at(-1);
    if (e.shiftKey && document.activeElement === first) {e.preventDefault();last.focus();}
    if (!e.shiftKey && document.activeElement === last) {e.preventDefault();first.focus();}
  }
});
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
if (!reduced.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {entry.target.classList.add('visible'); observer.unobserve(entry.target);}
  }), {threshold:.08});
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  document.documentElement.classList.add('js-motion');
}
const gallery = document.querySelector('.robot-gallery');
const cards = [...gallery.querySelectorAll('.robot-card')];
const previous = document.querySelector('#previous-robot');
const next = document.querySelector('#next-robot');
let galleryIndex = 0;
function updateGallery() {
  const step = cards[1].offsetLeft - cards[0].offsetLeft;
  galleryIndex = Math.round(gallery.scrollLeft / step);
  document.querySelector('#robot-count').textContent = `${String(galleryIndex + 1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
  previous.disabled = gallery.scrollLeft < 5;
  next.disabled = gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 5;
}
function moveGallery(direction) {
  const step = cards[1].offsetLeft - cards[0].offsetLeft;
  gallery.scrollBy({left:step*direction,behavior:reduced.matches?'instant':'smooth'});
}
previous.addEventListener('click',()=>moveGallery(-1));
next.addEventListener('click',()=>moveGallery(1));
gallery.addEventListener('scroll',updateGallery,{passive:true});
gallery.addEventListener('keydown',e=>{
  if (e.target !== gallery) return;
  if (e.key==='ArrowRight' || e.key==='ArrowLeft') {e.preventDefault();moveGallery(e.key==='ArrowRight'?1:-1);}
});
window.addEventListener('resize',updateGallery);
updateGallery();
const film = document.querySelector('#championship-film');
const play = document.querySelector('.film-play');
play.addEventListener('click',async()=>{
  try {await film.play();play.hidden=true;} catch {play.hidden=true;film.focus();}
});
film.addEventListener('play',()=>play.hidden=true);
film.addEventListener('ended',()=>play.hidden=false);
