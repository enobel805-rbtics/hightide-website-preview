// Every fuel position and score is a pure function of scroll distance. Scrolling
// backward rewinds the shot; idle scrolling never launches extra balls.
const section = document.querySelector('.fuel-scene');
const stage = section.querySelector('.fuel-stage');
const canvas = section.querySelector('.fuel-canvas');
const flight = section.querySelector('.fuel-flight');
const context = flight.getContext('2d');
const counter = section.querySelector('output');
const bar = section.querySelector('.fuel-progress');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = value => Math.max(0, Math.min(1, value));
let robot, progress = 0, frame = 0, visible = false;

function paint() {
  frame = 0;
  const bounds = section.getBoundingClientRect();
  const w = stage.clientWidth, h = stage.clientHeight;
  visible = bounds.top < innerHeight && bounds.bottom > 0;
  progress = clamp(-bounds.top / Math.max(1, bounds.height - h));
  if (!visible || motion.matches) return;
  const mobile = w < 768;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  if (flight.width !== Math.round(w * dpr) || flight.height !== Math.round(h * dpr)) {
    flight.width = Math.round(w * dpr); flight.height = Math.round(h * dpr);
  }
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, w, h);
  // Aim the assembled CAD at the hub, with only a small tracking motion.
  robot?.render({rect:{x:w*.015,y:h*(mobile?.40:.30),w:w*(mobile?.65:.58),h:h*(mobile?.48:.58)},
    yaw:-.95 + progress*.10, pitch:.30, explode:0, fit:0, reveal:1, highlight:{}});
  const anchor = robot?.anchor('shooter');
  const start = anchor?.visible ? {x:anchor.x+w*.025,y:anchor.y-h*.015} : {x:w*.34,y:h*.56};
  const target = {x:w*(mobile?.84:.80), y:h*(mobile?.511:.471)};
  const arc = h*(mobile?.23:.30);
  // A quiet trajectory ties the CAD to the hub, without adding visual chrome.
  context.beginPath(); context.moveTo(start.x,start.y);
  context.quadraticCurveTo((start.x+target.x)/2,Math.min(start.y,target.y)-arc*2,target.x,target.y);
  context.strokeStyle=document.documentElement.dataset.theme==='dark'?'#ffffff28':'#8fd9d428'; context.lineWidth=1; context.setLineDash([2,9]); context.stroke(); context.setLineDash([]);
  const clock = progress * 28;
  let scored = 0;
  for (let i=0;i<24;i++) {
    const t = (clock-i)/4;
    if(t>=1){ scored++; continue; }
    if(t<0)continue;
    const x=start.x+(target.x-start.x)*t;
    const y=start.y+(target.y-start.y)*t - 4*arc*t*(1-t);
    const radius=(mobile?4.5:7)*(1-.28*t);
    const glow=context.createRadialGradient(x-radius*.3,y-radius*.4,0,x,y,radius);
    glow.addColorStop(0,'#fff69a');glow.addColorStop(.55,'#f4da43');glow.addColorStop(1,'#cfa414');
    context.beginPath();context.arc(x,y,radius,0,Math.PI*2);context.fillStyle=glow;context.fill();
  }
  // A brief expanding rim at the exact arrival point makes a made shot clear.
  const arrival = clock-4;
  if(arrival>=0 && arrival<24){
    const phase=arrival-Math.floor(arrival);
    context.beginPath();context.ellipse(target.x,target.y,10+phase*18,3+phase*5,0,0,Math.PI*2);
    context.strokeStyle=`rgba(244,218,67,${(1-phase)*.8})`;context.lineWidth=2;context.stroke();
  }
  counter.value=String(scored).padStart(2,'0');
  bar.style.transform=`scaleX(${progress})`;
  section.dataset.score=String(scored);
  section.dataset.progress=progress.toFixed(4);
}
function requestPaint(){ if(!frame)frame=requestAnimationFrame(paint); }
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;requestPaint();},{rootMargin:'100px'}).observe(section);
addEventListener('scroll',requestPaint,{passive:true});
addEventListener('resize',requestPaint);
motion.addEventListener('change',requestPaint);

async function loadModel(){
  if(motion.matches)return;
  try{
    const {createRobot}=await import('./assets/robot-BXv_fBBL.js');
    robot=await createRobot(canvas);
    section.dataset.model='ready';
  }catch(error){
    console.warn('Scoring uses the saved Ripcurrent still because WebGL is unavailable.',error);
    canvas.hidden=true;
  }
  requestPaint();
}
new IntersectionObserver((entries,observer)=>{
  if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();loadModel();}
},{rootMargin:'700px'}).observe(section);
if(motion.matches){
  section.querySelector('.fuel-heading p').textContent='Ripcurrent sends fuel into the hub.';
  counter.value='24';
}
requestPaint();
