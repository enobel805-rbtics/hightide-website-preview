import {drawHub, HUB} from './hub.js?v=2';

const section=document.querySelector('.fuel-scene');
const stage=section.querySelector('.fuel-stage');
section.querySelector('.fuel-canvas').remove();
const flight=section.querySelector('.fuel-flight');
const context=flight.getContext('2d');
const counter=section.querySelector('output');
const bar=section.querySelector('.fuel-progress');
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=v=>Math.max(0,Math.min(1,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
const mix=(a,b,t)=>a+(b-a)*t;
const mixRect=(a,b,t)=>Object.fromEntries(['x','y','w','h'].map(k=>[k,mix(a[k],b[k],t)]));
let frame=0,enterPose=null,lastFollow=false,calibration=null;

function paint(){
  frame=0;
  if(motion.matches)return;
  const shared=window.highTideRobot;
  const robot=shared?.model;
  const w=innerWidth,h=innerHeight,mobile=w<768;
  const bounds=section.getBoundingClientRect(),stageBounds=stage.getBoundingClientRect();
  const progress=clamp(-bounds.top/Math.max(1,bounds.height-h));
  const titleReveal=ease(1-bounds.top/(h*.35));
  section.querySelector('.fuel-heading').style.opacity=String(titleReveal);
  section.querySelector('.fuel-counter').style.opacity=String(titleReveal);
  const exit=ease((h-bounds.bottom)/h);
  const following=bounds.top<=h;
  if(!following){
    if(shared?.owner==='follow'){shared.owner='intro';shared.canvas.classList.remove('robot-following');shared.wake();}
    document.documentElement.classList.remove('robot-docked');
    if(shared)shared.canvas.style.opacity='1'; enterPose=null;lastFollow=false;return;
  }
  // The hero, subsystem breakdown, scoring and page companion share one CAD.
  if(robot){
    if(!lastFollow)enterPose=shared.lastPose;
    shared.owner='follow';shared.canvas.classList.add('robot-following');shared.handle.hidden=true;
  }
  lastFollow=true;
  const scale=Math.min(w/(mobile?142:200),h/(mobile?177:158)); // pixels per inch
  const floor=h*(mobile?.84:.85);
  const hubX=w*(mobile?.76:.77);
  const ppm=scale/.0254;
  const size={w:w*(mobile?.58:.43),h:h*.42};
  const scoreRect={x:w*(mobile?.19:.22)-size.w/2,y:floor-(robot?.height||.6)*ppm/2-size.h/2,w:size.w,h:size.h};
  // Fit using the renderer's normal camera, then calibrate its viewport to the
  // physical scale. Keeping the normal camera avoids clipping exploded parts.
  if(robot){
    const key=`${w}:${h}`;
    if(calibration?.key!==key){
      robot.render({rect:scoreRect,yaw:-.95,pitch:.30,explode:0,fit:0,reveal:1,highlight:{}});
      const natural=robot.scaleAt('shooter');
      calibration={key,ratio:natural>0?ppm/natural:1};
    }
    const center={x:scoreRect.x+scoreRect.w/2,y:scoreRect.y+scoreRect.h/2};
    scoreRect.w*=calibration.ratio;scoreRect.h*=calibration.ratio;
    scoreRect.x=center.x-scoreRect.w/2;scoreRect.y=center.y-scoreRect.h/2;
  }
  let rect={...scoreRect,y:scoreRect.y+Math.min(0,stageBounds.top)};
  let explode=0,fit=0,yaw=-.95+progress*.10,pitch=.30;
  if(bounds.top>0){
    const t=ease(1-bounds.top/h);
    const origin=enterPose||{rect:{x:w*.26,y:h*.02,w:w*.48,h:h*.96},yaw:.98,pitch:.24,explode:1,fit:1};
    rect=mixRect(origin.rect,scoreRect,t);
    explode=mix(origin.explode,0,t);fit=mix(origin.fit,0,t);
    yaw=mix(origin.yaw,yaw,t);pitch=mix(origin.pitch,.30,t);
  }
  if(robot){
    robot.render({rect,yaw,pitch,explode,fit,reveal:1,highlight:{}});
    const drawn=robot.drawn;
    shared.canvas.style.clipPath=`inset(${Math.max(0,drawn.y-5)}px ${Math.max(0,w-drawn.x-drawn.w-5)}px ${Math.max(0,h-drawn.y-drawn.h-5)}px ${Math.max(0,drawn.x-5)}px)`;
    shared.canvas.style.opacity=String(1-exit);
    section.dataset.model='ready';
  }
  section.dataset.follow=exit>.98?'finished':bounds.top>0?'reassembling':'scoring';
  section.dataset.progress=progress.toFixed(4);
  const clock=progress*28;
  const scored=Math.max(0,Math.min(24,Math.floor(clock-4)+1));
  counter.value=String(scored).padStart(2,'0');bar.style.transform=`scaleX(${progress})`;
  section.dataset.score=String(scored);
  if(bounds.bottom<=0||bounds.top>=h)return;
  const dpr=Math.min(devicePixelRatio||1,2);
  if(flight.width!==Math.round(w*dpr)||flight.height!==Math.round(h*dpr)){
    flight.width=Math.round(w*dpr);flight.height=Math.round(h*dpr);
  }
  context.setTransform(dpr,0,0,dpr,0,0);context.clearRect(0,0,w,h);
  const dark=document.documentElement.dataset.theme==='dark';
  const hub=drawHub(context,{x:hubX,floor,scale,dark});
  const anchor=robot?.anchor('shooter');
  const start=anchor?.visible?{x:anchor.x,y:anchor.y-stageBounds.top}:{x:w*.22,y:floor-scale*23};
  const target=hub.target;
  const arc=Math.max(h*.12,(target.x-start.x)*.4);
  // Official 5.91-inch fuel, scaled with the CAD projection and hub dimensions.
  const diameter=HUB.fuel*scale;
  const measured=robot?.scaleAt('shooter')*.150114;
  const launchRadius=(measured>0?measured:diameter)/2,arrivalRadius=diameter/2;
  for(let i=0;i<24 && bounds.top<=0;i++){
    const t=(clock-i)/4;
    if(t>=1||t<0)continue;
    const x=mix(start.x,target.x,t),y=mix(start.y,target.y,t)-4*arc*t*(1-t);
    const radius=mix(launchRadius,arrivalRadius,t);
    const glow=context.createRadialGradient(x-radius*.3,y-radius*.4,0,x,y,radius);
    glow.addColorStop(0,'#fff69a');glow.addColorStop(.55,'#f4da43');glow.addColorStop(1,'#cfa414');
    context.beginPath();context.arc(x,y,radius,0,Math.PI*2);context.fillStyle=glow;context.fill();
    context.fillStyle='#987a1735';
    for(const [dx,dy]of [[-.2,.25],[.3,.1],[0,-.35]]){context.beginPath();context.arc(x+dx*radius,y+dy*radius,Math.max(.6,radius*.065),0,Math.PI*2);context.fill();}
  }
  hub.frontRim();
  section.dataset.fuelDiameter=diameter.toFixed(1);
  section.dataset.robotFuelDiameter=(launchRadius*2).toFixed(1);
}
function requestPaint(){if(!frame)frame=requestAnimationFrame(paint);}
addEventListener('scroll',requestPaint,{passive:true});addEventListener('resize',requestPaint);
addEventListener('ripcurrent-ready',requestPaint);motion.addEventListener('change',requestPaint);
if(motion.matches){section.querySelector('.fuel-heading p').textContent='Ripcurrent sends fuel into the hub.';counter.value='24';}
requestPaint();

