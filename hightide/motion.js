(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const motionOK = !reduce.matches;
  document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',e=>{
    if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
    const id=link.getAttribute('href').slice(1);
    const destination=document.getElementById(id);
    if(!destination)return;
    e.preventDefault();
    history.pushState(null,'',`#${id}`);
    destination.setAttribute('tabindex','-1');
    destination.focus({preventScroll:true});
    if(id==='home') window.scrollTo({top:0,behavior:reduce.matches?'instant':'smooth'});
    else destination.scrollIntoView({behavior:reduce.matches?'instant':'smooth',block:'start'});
  }));
  const hero = document.querySelector('.hero');
  let stage;
  if (motionOK) {
    stage = document.createElement('div');
    stage.className = 'hero-stage';
    hero.before(stage);
    stage.append(hero);
    let visited = false;
    try {visited = sessionStorage.getItem('hightide-motion-visited')==='1';sessionStorage.setItem('hightide-motion-visited','1');} catch {}
    if (!visited && !location.hash) {
      const arrival = document.createElement('div');
      arrival.className='arrival-screen';
      arrival.setAttribute('aria-hidden','true');
      arrival.innerHTML='<img src="assets/logo.png" alt=""><span>A WHOLE TEAM. ONE SHARED CURRENT.</span>';
      document.body.append(arrival);
      arrival.addEventListener('animationend',e=>{if(e.target===arrival)arrival.remove();});
      setTimeout(()=>arrival.remove(),1800);
    }
  }
  const progress = document.createElement('div');
  progress.className='reading-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress);

  if (motionOK && 'IntersectionObserver' in window) {
    const types = document.querySelectorAll('.statement,.legacy-heading h2,.robot-heading h2,.community h2,.partner-heading h2,.footer-motto');
    const typeObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('type-visible');typeObserver.unobserve(e.target);}}),{threshold:.2});
    types.forEach(heading=>{
      heading.setAttribute('aria-label',heading.innerText.replace(/\s+/g,' ').trim());
      heading.classList.add('word-heading');
      const walker=document.createTreeWalker(heading,NodeFilter.SHOW_TEXT);
      const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
      let i=0;
      nodes.forEach(node=>{
        const fragment=document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(word=>{
          if(!word.trim()){fragment.append(document.createTextNode(word));return;}
          const span=document.createElement('span');span.className='word';span.setAttribute('aria-hidden','true');
          const inner=document.createElement('span');inner.className='word-inner';inner.textContent=word;
          inner.style.setProperty('--word-index',String(i++));span.append(inner);fragment.append(span);
        });
        node.replaceWith(fragment);
      });
      typeObserver.observe(heading);
    });
  }

  const photos=[...document.querySelectorAll('.photo-collage figure')];
  const clamp=(v,min=0,max=1)=>Math.min(max,Math.max(min,v));
  let framePending=false;
  const header=document.querySelector('.site-header');
  function renderScroll(){
    framePending=false;
    const viewport=innerHeight;
    header.classList.toggle('scrolled',scrollY>80);
    const scrollRange=document.documentElement.scrollHeight-viewport;
    progress.style.setProperty('--reading-progress',String(scrollRange>0?clamp(scrollY/scrollRange):0));
    if (!reduce.matches && stage) {
      const box=stage.getBoundingClientRect();
      const distance=stage.offsetHeight-hero.offsetHeight;
      const p=clamp(-box.top/Math.max(1,distance));
      hero.style.setProperty('--hero-progress',String(p));
    }
    if (!reduce.matches) photos.forEach((photo,i)=>{
      const box=photo.getBoundingClientRect();
      if(box.bottom>0&&box.top<viewport){
        const amount=(.5-(box.top+box.height/2)/viewport)*(innerWidth<600?16:36)*(i%2?-1:1);
        photo.style.setProperty('--photo-offset',`${amount.toFixed(2)}px`);
      }
    });
  }
  function queueRender(){if(!framePending){framePending=true;requestAnimationFrame(renderScroll);}}
  addEventListener('scroll',queueRender,{passive:true});addEventListener('resize',queueRender);renderScroll();
  reduce.addEventListener('change',()=>{
    if(reduce.matches){hero.style.setProperty('--hero-progress','0');photos.forEach(p=>p.style.removeProperty('--photo-offset'));document.querySelectorAll('.word-heading').forEach(h=>h.classList.add('type-visible'));}
    queueRender();
  });

  const rail=document.createElement('div');rail.className='gallery-progress';rail.setAttribute('aria-hidden','true');rail.innerHTML='<span></span>';
  const gallery=document.querySelector('.robot-gallery');gallery.after(rail);
  const hint=document.createElement('div');hint.className='gallery-hint';hint.innerHTML='<span>EXPLORE THE ARCHIVE</span><span>DRAG / SWIPE TO DISCOVER ↔</span>';rail.after(hint);
  function railUpdate(){const range=gallery.scrollWidth-gallery.clientWidth;const visible=gallery.clientWidth/gallery.scrollWidth;rail.style.setProperty('--gallery-progress',String(visible+(1-visible)*(range>0?gallery.scrollLeft/range:0)));}
  gallery.addEventListener('scroll',railUpdate,{passive:true});addEventListener('resize',railUpdate);railUpdate();
  let drag=null,suppressClick=false;
  gallery.addEventListener('dragstart',e=>e.preventDefault());
  gallery.addEventListener('pointerdown',e=>{
    if(e.pointerType!=='mouse'||e.button!==0)return;
    drag={x:e.clientX,scroll:gallery.scrollLeft,id:e.pointerId,active:false};suppressClick=false;
  });
  gallery.addEventListener('pointermove',e=>{
    if(!drag)return;
    const delta=e.clientX-drag.x;
    if(!drag.active&&Math.abs(delta)>6){drag.active=true;gallery.classList.add('is-dragging');gallery.setPointerCapture(drag.id);}
    if(drag.active){gallery.scrollLeft=drag.scroll-delta;suppressClick=true;}
  });
  function finishDrag(){if(!drag)return;if(gallery.hasPointerCapture(drag.id))gallery.releasePointerCapture(drag.id);drag=null;gallery.classList.remove('is-dragging');}
  gallery.addEventListener('pointerup',finishDrag);gallery.addEventListener('pointercancel',finishDrag);
  gallery.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopPropagation();suppressClick=false;}},true);

  if (motionOK && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    const cursor=document.createElement('div');cursor.className='editorial-cursor';cursor.setAttribute('aria-hidden','true');document.body.append(cursor);
    let targetX=0,targetY=0,x=0,y=0,cursorFrame=null,visible=false;
    function paintCursor(){
      x+=(targetX-x)*.25;y+=(targetY-y)*.25;
      cursor.style.transform=`translate3d(${x-39}px,${y-39}px,0)`;
      if(visible&&(Math.abs(targetX-x)>.2||Math.abs(targetY-y)>.2))cursorFrame=requestAnimationFrame(paintCursor);else cursorFrame=null;
    }
    document.addEventListener('pointermove',e=>{targetX=e.clientX;targetY=e.clientY;if(visible&&!cursorFrame)cursorFrame=requestAnimationFrame(paintCursor);},{passive:true});
    document.querySelectorAll('.field-card,.film-play,.photo-collage figure').forEach(el=>{
      el.classList.add('cursor-target');
      el.addEventListener('pointerenter',e=>{
        if(reduce.matches)return;
        targetX=x=e.clientX;targetY=y=e.clientY;
        cursor.textContent=el.matches('.film-play')?'PLAY ↗':el.matches('.field-card')?'EXPLORE ↗':'HIGHTIDE';
        visible=true;cursor.classList.add('cursor-visible');paintCursor();
      });
      el.addEventListener('pointerleave',()=>{visible=false;cursor.classList.remove('cursor-visible');});
    });
    document.addEventListener('pointerleave',()=>{visible=false;cursor.classList.remove('cursor-visible');});
  }
})();
