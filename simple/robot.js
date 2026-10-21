/* Detailed Ripcurrent viewer. Native WebGL; no network or library required. */
(() => {
  const canvas = document.getElementById('robot-canvas');
  const fallback = document.getElementById('robot-fallback');
  const rotate = document.getElementById('rotate');
  const reset = document.getElementById('reset');
  const hint = document.getElementById('robot-hint');
  function unavailable() {
    canvas.hidden = true; canvas.style.display = 'none'; fallback.hidden = false;
    document.querySelector('.robot-controls').hidden = true;
  }
  const gl = canvas.getContext('webgl', {antialias:true, alpha:true, preserveDrawingBuffer:true});
  if (!gl) { unavailable(); return; }
  const vertexSource = `attribute vec3 p;attribute vec3 n;attribute vec3 c;uniform mat4 projection;uniform mat4 view;uniform mat4 model;varying vec3 color;void main(){vec3 normal=normalize(mat3(model)*n);vec3 key=normalize(vec3(-.4,.9,.65));float light=.54+.43*max(dot(normal,key),0.)+.16*max(dot(normal,normalize(vec3(.7,.2,-.5))),0.);float spec=pow(max(dot(normal,normalize(vec3(-.2,.55,1.))),0.),38.)*.16;color=c*light+vec3(spec);gl_Position=projection*view*model*vec4(p,1.);}`;
  const fragmentSource = `precision mediump float;varying vec3 color;void main(){gl_FragColor=vec4(color,1.);}`;
  function shader(type, source) {
    const s = gl.createShader(type); gl.shaderSource(s, source); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('3D shader compilation failed');
    return s;
  }
  try {
    const program = gl.createProgram();
    gl.attachShader(program, shader(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragmentSource)); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('3D program link failed');
    gl.useProgram(program);
    const mesh = window.buildRipcurrent();
    const vertices=mesh.vertices;
    canvas.dataset.triangles=String(mesh.triangles);
    canvas.dataset.parts=String(mesh.parts);
    let showInternals=false;
    const internals=document.getElementById('internals');
    internals.addEventListener('click',()=>{showInternals=!showInternals;internals.setAttribute('aria-pressed',String(showInternals));internals.textContent=showInternals?'Show panels':'Show internals';draw();});
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
    for(const [name,offset] of [['p',0],['n',12],['c',24]]){const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,36,offset);}
    gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
    const uniforms=Object.fromEntries(['projection','view','model'].map(n=>[n,gl.getUniformLocation(program,n)]));
    let yaw=-.66,pitch=.46,distance=8.1,auto=false,visible=true,frame=0,last=0,drag=null;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    function render(time=0){
      frame=0;
      const delta=Math.min((time-last)/1000,.05);last=time;if(auto&&!drag)yaw+=delta*.25;
      const ratio=Math.min(devicePixelRatio||1,2),w=Math.round(canvas.clientWidth*ratio),h=Math.round(canvas.clientHeight*ratio);
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
      gl.viewport(0,0,w,h);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      const f=1/Math.tan(.61/2),aspect=w/h,near=.1,far=100;
      const projection=[f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0];
      const sy=Math.sin(yaw),cy=Math.cos(yaw),sx=Math.sin(pitch),cx=Math.cos(pitch);
      const model=[cy,sx*sy,-cx*sy,0,0,cx,sx,0,sy,-sx*cy,cx*cy,0,0,0,0,1];
      const view=[1,0,0,0,0,1,0,0,0,0,1,0,0,-.05,-distance,1];
      gl.uniformMatrix4fv(uniforms.projection,false,new Float32Array(projection));gl.uniformMatrix4fv(uniforms.view,false,new Float32Array(view));gl.uniformMatrix4fv(uniforms.model,false,new Float32Array(model));
      gl.drawArrays(gl.TRIANGLES,0,showInternals?mesh.solidCount:vertices.length/9);
      if(auto&&visible)frame=requestAnimationFrame(render);
    }
    function draw(){if(!frame)frame=requestAnimationFrame(render);}
    function setAuto(value){auto=value;rotate.setAttribute('aria-pressed',String(auto));rotate.textContent=auto?'Pause rotation':'Auto rotate';draw();}
    canvas.addEventListener('pointerdown',e=>{
      if(e.pointerType==='mouse'&&e.button!==0)return;
      drag={x:e.clientX,y:e.clientY,yaw,pitch,touch:e.pointerType==='touch',claimed:false};
      if(e.pointerType!=='touch')canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove',e=>{
      if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
      if(drag.touch&&!drag.claimed){if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8){drag=null;return;}if(Math.abs(dx)<8)return;drag.claimed=true;canvas.setPointerCapture(e.pointerId);}
      yaw=drag.yaw+dx*.009;pitch=Math.max(-.15,Math.min(1.1,drag.pitch+dy*.006));hint.textContent='Looking good from every angle';draw();
    });
    for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,()=>{drag=null;});
    canvas.addEventListener('wheel',e=>{e.preventDefault();distance=Math.max(4.8,Math.min(12,distance+e.deltaY*.005));draw();},{passive:false});
    canvas.addEventListener('keydown',e=>{
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'].includes(e.key))return;e.preventDefault();
      if(e.key==='ArrowLeft')yaw-=.14;if(e.key==='ArrowRight')yaw+=.14;if(e.key==='ArrowUp')pitch=Math.min(1.1,pitch+.1);if(e.key==='ArrowDown')pitch=Math.max(-.15,pitch-.1);
      if(e.key==='+'||e.key==='=')distance=Math.max(5.1,distance-.35);if(e.key==='-')distance=Math.min(10,distance+.35);if(e.key==='Home')reset.click();draw();
    });
    document.getElementById('zoom-in').addEventListener('click',()=>{distance=Math.max(4.8,distance-.65);draw();});
    document.getElementById('zoom-out').addEventListener('click',()=>{distance=Math.min(12,distance+.65);draw();});
    rotate.addEventListener('click',()=>setAuto(!auto));
    reset.addEventListener('click',()=>{yaw=-.66;pitch=.46;distance=8.1;showInternals=false;internals.setAttribute('aria-pressed','false');internals.textContent='Show internals';setAuto(false);hint.textContent='Drag to rotate · Scroll to zoom';draw();});
    reduced.addEventListener('change',()=>{if(reduced.matches)setAuto(false);});
    new ResizeObserver(draw).observe(canvas);
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)draw();}).observe(canvas);
    document.addEventListener('visibilitychange',()=>{visible=!document.hidden;if(visible)draw();});
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();if(frame)cancelAnimationFrame(frame);unavailable();});
    draw();
  } catch(error) { console.error(error); unavailable(); }
})();
