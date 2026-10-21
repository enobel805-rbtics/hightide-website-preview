/* Detailed original Ripcurrent reconstruction from Team 4414's 2026 CAD renders.
   Coordinates are visual estimates; this is not a dimensional CAD export. */
window.buildRipcurrent = () => {
  const data=[],panels=[];let target=data,parts=0;
  const C={cyan:[.015,.68,.75],aluminum:[.69,.74,.77],steel:[.42,.48,.51],black:[.105,.125,.14],carbon:[.14,.16,.17],rubber:[.055,.065,.072],red:[.78,.105,.14],white:[.95,.96,.93],orange:[.92,.36,.05],yellow:[.86,.72,.13],blue:[.025,.27,.55],copper:[.64,.31,.13],green:[.03,.6,.25]};
  const sub=(a,b)=>a.map((v,i)=>v-b[i]),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>{const n=Math.hypot(...a)||1;return a.map(v=>v/n)},add=(a,b)=>a.map((v,i)=>v+b[i]);
  function tri(a,b,c,color,normals){const n=norm(cross(sub(b,a),sub(c,a)));[a,b,c].forEach((p,i)=>target.push(...p,...(normals?normals[i]:n),...color));}
  function quad(a,b,c,d,col){tri(a,b,c,col);tri(a,c,d,col);}
  function box(x,y,z,w,h,d,col){parts++;const p=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(([a,b,c])=>[x+a*w/2,y+b*h/2,z+c*d/2]);for(const f of [[4,5,6,7],[1,0,3,2],[0,4,7,3],[5,1,2,6],[7,6,2,3],[0,1,5,4]])quad(...f.map(i=>p[i]),col);}
  function beam(a,b,w,col,d=w){parts++;const n=norm(sub(b,a));let u=norm(cross(n,Math.abs(n[1])>.95?[1,0,0]:[0,1,0])),v=norm(cross(n,u));const corners=p=>[[1,1],[-1,1],[-1,-1],[1,-1]].map(([s,t])=>p.map((c,i)=>c+u[i]*s*w/2+v[i]*t*d/2));const p=corners(a),q=corners(b);for(let i=0;i<4;i++)quad(p[i],p[(i+1)%4],q[(i+1)%4],q[i],col);quad(...p,col);quad(...q,col);}
  function cyl(x,y,z,r,len,axis,col,N=24){parts++;const a=axis==='x'?0:axis==='y'?1:2,b=(a+1)%3,c=(a+2)%3,base=[x,y,z];const p=(angle,t)=>{const q=base.slice();q[a]+=t;q[b]+=Math.cos(angle)*r;q[c]+=Math.sin(angle)*r;return q},n=t=>{const q=[0,0,0];q[b]=Math.cos(t);q[c]=Math.sin(t);return q};for(let i=0;i<N;i++){const t=i*Math.PI*2/N,u=(i+1)*Math.PI*2/N;const A=p(t,-len/2),B=p(u,-len/2),D=p(t,len/2),E=p(u,len/2);tri(A,B,E,col,[n(t),n(u),n(u)]);tri(A,E,D,col,[n(t),n(u),n(t)]);const lo=base.slice(),hi=base.slice();lo[a]-=len/2;hi[a]+=len/2;tri(lo,B,A,col);tri(hi,D,E,col);}}
  function ring(x,y,z,outer,inner,h,col,N=72){parts++;for(let i=0;i<N;i++){const a=i*Math.PI*2/N,b=(i+1)*Math.PI*2/N;const p=(t,r,v)=>[x+Math.cos(t)*r,y+v,z+Math.sin(t)*r];quad(p(a,outer,h/2),p(b,outer,h/2),p(b,inner,h/2),p(a,inner,h/2),col);quad(p(a,outer,-h/2),p(b,outer,-h/2),p(b,outer,h/2),p(a,outer,h/2),col);quad(p(b,inner,-h/2),p(a,inner,-h/2),p(a,inner,h/2),p(b,inner,h/2),col);quad(p(a,inner,-h/2),p(b,inner,-h/2),p(b,outer,-h/2),p(a,outer,-h/2),col);}}
  function tube(points,r,col,N=8){parts++;for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],d=norm(sub(b,a)),u=norm(cross(d,Math.abs(d[1])>.95?[1,0,0]:[0,1,0])),v=norm(cross(d,u));const p=(q,t)=>q.map((c,j)=>c+r*(Math.cos(t)*u[j]+Math.sin(t)*v[j]));for(let k=0;k<N;k++)quad(p(a,k*2*Math.PI/N),p(a,(k+1)*2*Math.PI/N),p(b,(k+1)*2*Math.PI/N),p(b,k*2*Math.PI/N),col);}}
  function bolt(x,y,z,axis='y',r=.018){cyl(x,y,z,r,.013,axis,C.steel,6);cyl(x,y,z,r*.37,.015,axis,C.black,6);}
  function motor(x,y,z,axis='y',scale=1){cyl(x,y,z,.085*scale,.22*scale,axis,C.black,32);for(const t of [-.12,.12]){const p=[x,y,z];p[axis==='x'?0:axis==='y'?1:2]+=t*scale;cyl(...p,.089*scale,.018*scale,axis,C.aluminum,24);}const p=[x,y,z];p[axis==='x'?0:axis==='y'?1:2]+=.145*scale;cyl(...p,.025*scale,.06*scale,axis,C.steel,16);}
  function gear(x,y,z,r,h,axis,col,teeth=28){cyl(x,y,z,r*.91,h,axis,col,48);cyl(x,y,z,r*.34,h+.02,axis,C.steel,24);for(let i=0;i<teeth;i++){const t=i*Math.PI*2/teeth;if(axis==='y')beam([x+Math.cos(t)*r*.86,y,z+Math.sin(t)*r*.86],[x+Math.cos(t)*r,y,z+Math.sin(t)*r],.025,col,h);else if(axis==='x')beam([x,y+Math.cos(t)*r*.86,z+Math.sin(t)*r*.86],[x,y+Math.cos(t)*r,z+Math.sin(t)*r],h,col,.025);}}
  function curve(x,y,z,r,start,end,steps=30){return Array.from({length:steps+1},(_,i)=>{const t=start+(end-start)*i/steps;return[x+Math.cos(t)*r,y,z+Math.sin(t)*r]});}
  function truss(a,b,height,col){beam(a,b,.045,col);const count=Math.max(2,Math.round(Math.hypot(...sub(b,a))/.3));for(let i=0;i<count;i++){const p=a.map((v,j)=>v+(b[j]-v)*i/count),q=a.map((v,j)=>v+(b[j]-v)*(i+1)/count);beam([p[0],p[1]-height,p[2]],q,.022,col);beam(p,[q[0],q[1]-height,q[2]],.022,col);}beam([a[0],a[1]-height,a[2]],[b[0],b[1]-height,b[2]],.035,col);}
  // Perforated aluminum drive rails, crossmembers, floor and electronics.
  for(const x of [-.98,.98]){box(x,-.7,0,.075,.14,2.65,C.cyan);for(let z=-1.22;z<1.24;z+=.11){cyl(x+Math.sign(x)*.04,-.69,z,.02,.003,'x',C.black,12);bolt(x,-.623,z,'y',.012);}}
  for(const z of [-1.22,1.22]){box(0,-.7,z,2.02,.14,.07,C.cyan);for(let x=-.88;x<.9;x+=.11)bolt(x,-.623,z,'y',.012);}
  for(const z of [-.68,.68]){box(0,-.71,z,1.9,.11,.06,C.aluminum);for(let x=-.85;x<.9;x+=.12)cyl(x,-.65,z,.016,.008,'y',C.black,12);}
  box(0,-.76,0,1.78,.025,2.28,C.carbon);
  for(let i=0;i<12;i++){const x=-.8+i*.14;beam([x,-.739,-1.1],[Math.min(.85,x+.4),-.739,1.1],.006,C.steel);}
  box(-.75,-.55,.08,.3,.3,.68,C.black);box(-.75,-.389,.08,.25,.025,.58,C.yellow);
  for(const z of [-.15,.29]){cyl(-.75,-.35,z,.025,.05,'y',C.copper);tube([[-.75,-.33,z],[-.65,-.3,z+.08],[-.45,-.34,z+.14],[-.4,-.55,.45]],.015,z<0?C.red:C.black);}
  box(.72,-.59,.13,.25,.12,.58,C.black);for(let i=0;i<9;i++){box(.72,-.515,-.1+i*.055,.18,.025,.035,C.blue);bolt(.72,-.496,-.1+i*.055,'y',.009);}
  box(.65,-.49,-.65,.23,.07,.26,C.aluminum);for(let i=0;i<4;i++)bolt(.65+(i%2-.5)*.15,-.445,-.65+(Math.floor(i/2)-.5)*.17,'y',.014);
  // Four complete swerve pods: tread, hub, plate, gear train and dual motors.
  for(const x of [-.89,.89])for(const z of [-1.02,1.02]){
    cyl(x,-.87,z,.235,.17,'x',C.rubber,48);cyl(x+Math.sign(x)*.09,-.87,z,.135,.018,'x',C.aluminum,32);cyl(x+Math.sign(x)*.103,-.87,z,.052,.024,'x',C.black,24);
    for(let t=0;t<34;t++){const a=t*Math.PI*2/34;beam([x-.08,-.87+Math.cos(a)*.237,z+Math.sin(a)*.237],[x+.08,-.87+Math.cos(a+.035)*.237,z+Math.sin(a+.035)*.237],.015,C.black);}
    for(let i=0;i<5;i++){const a=i*Math.PI*2/5;bolt(x+Math.sign(x)*.113,-.87+Math.cos(a)*.092,z+Math.sin(a)*.092,'x',.014);}
    box(x,-.62,z,.35,.045,.4,C.black);box(x,-.44,z,.35,.035,.4,C.black);ring(x,-.41,z,.15,.1,.025,C.aluminum,32);gear(x,-.46,z,.15,.025,'y',C.black,28);
    for(const dx of [-.13,.13])for(const dz of [-.15,.15]){cyl(x+dx,-.525,z+dz,.015,.17,'y',C.aluminum,12);bolt(x+dx,-.41,z+dz,'y',.018);}
    motor(x*.86,-.33,z*.87,'y',.7);motor(x*.88,-.52,z*.72,'x',.72);
  }
  // Rounded red fabric bumpers, separate pads, seams and mounting cones.
  for(const z of [-1.43,1.43]){box(0,-.5,z,2.2,.34,.21,C.red);box(0,-.318,z,2.18,.025,.16,C.red);for(const x of [-.76,0,.76])box(x,-.5,z+Math.sign(z)*.108,.008,.32,.008,C.black);}
  for(const x of [-1.2,1.2]){box(x,-.5,0,.22,.34,2.66,C.red);for(const z of [-.85,0,.85])box(x+Math.sign(x)*.112,-.5,z,.008,.32,.008,C.black);}
  for(const x of [-1.1,1.1])for(const z of [-1.33,1.33])cyl(x,-.5,z,.12,.34,'y',C.red,32);
  for(const x of [-1.04,1.04])for(const z of [-.99,.99]){cyl(x,-.27,z,.055,.13,'y',C.aluminum,16);bolt(x,-.2,z,'y',.03);}
  // Cyan corner towers and upper structural trusses, with genuine open geometry.
  for(const x of [-1.06,1.06]){
    for(const z of [-1.22,1.22]){const p=[x,-.26,z],q=[x,1.03,z];beam(p,q,.052,C.cyan);beam([x-Math.sign(x)*.2,-.26,z],[x-Math.sign(x)*.2,1.03,z],.045,C.cyan);for(let y=-.2;y<.95;y+=.23){beam([x,y,z],[x-Math.sign(x)*.2,y+.21,z],.025,C.cyan);beam([x-Math.sign(x)*.2,y,z],[x,y+.21,z],.025,C.cyan);bolt(x,y,z+Math.sign(z)*.029,'z',.014);}}
    truss([x,1.04,-1.2],[x,1.04,1.2],.12,C.cyan);
  }
  truss([-1.06,1.04,-1.22],[1.06,1.04,-1.22],.13,C.cyan);
  // Side panels are a separate draw range for the 'Show internals' control.
  target=panels;
  for(const x of [-1.055,1.055]){
    box(x,.37,0,.016,1.25,1.88,C.carbon);
    for(let z=-.84;z<.85;z+=.07)beam([x+Math.sign(x)*.011,-.22,z],[x+Math.sign(x)*.011,.96,z+.12],.0035,C.steel);
  }
  box(0,.36,-1.22,1.75,1.24,.016,C.carbon);
  // Front intake extension panels, recessed center and carbon reinforcement.
  for(const x of [-1.01,1.01]){box(x,.27,1.49,.035,1.06,.41,C.carbon);box(x,.29,1.71,.06,1.1,.04,C.aluminum);}
  box(0,.82,1.69,1.95,.38,.025,C.carbon);
  target=panels;
  for(const x of [-1.071,1.071])for(let z=-.83;z<.9;z+=.16)for(const y of [-.22,.94])bolt(x,y,z,'x',.014);
  for(const x of [-1.04,1.04])for(let y=-.22;y<.91;y+=.14)bolt(x,y,1.72,'z',.018);
  target=data;
  // Intake: shafts, flanged compliant wheels, lower bar, belt drives and guards.
  for(const [z,y] of [[1.23,-.12],[1.48,-.2],[1.7,-.29]]){
    cyl(0,y,z,.026,2.07,'x',C.aluminum,20);
    for(let x=-.84;x<=.85;x+=.185){cyl(x,y,z,.096,.13,'x',C.rubber,28);cyl(x-.066,y,z,.104,.013,'x',C.cyan,24);cyl(x+.066,y,z,.104,.013,'x',C.cyan,24);cyl(x,y,z,.034,.145,'x',C.aluminum,16);}
    for(const x of [-.99,.99]){cyl(x,y,z,.065,.04,'x',C.aluminum,20);bolt(x+Math.sign(x)*.027,y,z,'x',.027);}
  }
  for(const x of [-.99,.99]){
    beam([x,-.05,1.15],[x,-.31,1.78],.055,C.aluminum);motor(x,-.06,1.35,'x',.8);
    for(let i=0;i<25;i++){const t=i/24;box(x+Math.sign(x)*.09,-.1-t*.2,1.25+t*.46,.02,.023,.037,C.black);}
    cyl(x,-.11,1.25,.083,.04,'x',C.black,32);cyl(x,-.3,1.72,.083,.04,'x',C.black,32);
    beam([x,-.35,1.75],[x,-.35,1.9],.07,C.aluminum);
  }
  // Annular dye rotor and a densely ribbed six-spoke feeder floor.
  const rz=-.08;
  ring(.12,-.12,rz,.84,.61,.05,C.black,96);ring(.12,-.08,rz,.8,.77,.028,C.aluminum,96);
  for(let i=0;i<16;i++){
    const t=i*Math.PI*2/16;beam([.12+Math.cos(t)*.23,-.12,rz+Math.sin(t)*.23],[.12+Math.cos(t)*.78,-.12,rz+Math.sin(t)*.78],.026,C.black);
    bolt(.12+Math.cos(t)*.79,-.04,rz+Math.sin(t)*.79,'y',.015);
    if(i%2===0){const x=.12+Math.cos(t)*.67,z=rz+Math.sin(t)*.67;box(x,.015,z,.08,.23,.04,C.black);bolt(x,.14,z,'y',.013);}
  }
  cyl(.12,-.035,rz,.21,.15,'y',C.black,48);gear(.12,-.18,rz,.26,.035,'y',C.black,48);
  for(let i=0;i<5;i++){
    const a=i*Math.PI*2/5;beam([.12,-.02,rz],[.12+Math.cos(a)*.58,-.02,rz+Math.sin(a)*.58],.065,C.black);
    cyl(.12+Math.cos(a)*.43,.025,rz+Math.sin(a)*.43,.055,.08,'y',C.rubber,20);
  }
  for(const [x,z] of [[.65,-.64],[.76,-.4],[.84,-.15]]){motor(x,-.17,z,'y',.85);gear(x,-.3,z,.12,.025,'y',C.black,24);}
  const belt=curve(.12,-.26,rz,.75,-.7,2.8,60);tube(belt,.018,C.rubber,6);
  // Central vertical ball elevator, supports, belts and transmission.
  const tx=.12,tz=-.27;
  for(const x of [tx-.22,tx+.22]){
    beam([x,-.04,tz-.17],[x,.88,tz-.17],.05,C.black);
    beam([x,-.04,tz+.16],[x,.88,tz+.16],.045,C.black);
    for(let y=.04;y<.83;y+=.13){beam([x,y,tz-.17],[x,y+.12,tz+.16],.019,C.black);bolt(x,y,tz+.18,'z',.012);}
  }
  for(const y of [.08,.32,.56,.8]){cyl(tx,y,tz,.17,.32,'x',C.rubber,36);cyl(tx-.18,y,tz,.075,.035,'x',C.aluminum,24);cyl(tx+.18,y,tz,.075,.035,'x',C.aluminum,24);}
  for(const x of [tx-.235,tx+.235]){tube([[x,.06,tz-.05],[x,.82,tz-.05],[x,.85,tz+.04],[x,.07,tz+.04],[x,.06,tz-.05]],.012,C.black);motor(x,.3,tz-.25,'x',.8);}
  // Two-layer turret bearing and detailed geared slewing ring.
  ring(tx,.88,tz,.51,.39,.045,C.aluminum,96);ring(tx,.94,tz,.54,.4,.045,C.black,96);ring(tx,.975,tz,.49,.445,.015,C.aluminum,96);
  for(let i=0;i<64;i++){
    const t=i*Math.PI*2/64;beam([tx+Math.cos(t)*.51,.93,tz+Math.sin(t)*.51],[tx+Math.cos(t)*.555,.93,tz+Math.sin(t)*.555],.017,C.black,.026);
    if(i%4===0)bolt(tx+Math.cos(t)*.475,1.0,tz+Math.sin(t)*.475,'y',.014);
  }
  motor(tx+.54,.79,tz-.19,'y',.85);gear(tx+.54,.94,tz-.19,.095,.035,'y',C.black,20);
  const chain=curve(tx,.84,tz,.6,.1,4.9,40);for(let i=0;i<chain.length-1;i++)beam(chain[i],chain[i+1],.055,i%2?C.black:C.steel,.035);
  tube([[tx+.47,.7,tz],[tx+.63,.66,tz+.05],[tx+.67,.48,tz+.1],[tx+.65,.14,tz+.15]],.018,C.red);
  // Skeletonized shooter sides, adjustable hood, four flywheel motors.
  for(const x of [tx-.28,tx+.28]){
    truss([x,1.0,tz+.3],[x,1.46,tz-.27],.1,C.black);
    beam([x,.99,tz-.32],[x,1.46,tz-.27],.065,C.black);
    for(let i=0;i<5;i++){const z=tz+.23-i*.11,y=1.04+i*.08;bolt(x+Math.sign(x-tx)*.032,y,z,'x',.017);}
    for(const [y,z] of [[1.13,tz+.04],[1.35,tz-.19]]){cyl(x,y,z,.14,.13,'x',C.rubber,40);cyl(x+Math.sign(x-tx)*.07,y,z,.07,.026,'x',C.aluminum,24);}
    motor(x+Math.sign(x-tx)*.13,1.04,tz-.2,'x',.85);motor(x+Math.sign(x-tx)*.13,1.28,tz-.3,'x',.85);
    gear(x+Math.sign(x-tx)*.045,1.2,tz-.19,.09,.02,'x',C.black,24);
  }
  for(let i=0;i<12;i++){
    const t=i/11,y=1.12+Math.sin(t*1.25)*.34,z=tz+.13-t*.51;
    beam([tx-.26,y,z],[tx+.26,y,z],.025,C.aluminum);
    if(i<11)quad([tx-.255,y,z],[tx+.255,y,z],[tx+.255,1.12+Math.sin((i+1)/11*1.25)*.34,tz+.13-(i+1)/11*.51],[tx-.255,1.12+Math.sin((i+1)/11*1.25)*.34,tz+.13-(i+1)/11*.51],C.black);
  }
  cyl(tx,1.42,tz-.3,.045,.59,'x',C.aluminum,24);cyl(tx,1.42,tz-.3,.08,.39,'x',C.rubber,32);
  // Sensor camera, radio, RSL and realistic routed cable bundles.
  box(-.76,.89,-1.14,.15,.11,.08,C.black);cyl(-.76,.89,-1.088,.035,.025,'z',C.blue,24);
  box(.8,-.08,-1.19,.14,.14,.11,C.black);cyl(.8,.05,-1.19,.04,.1,'y',C.orange,24);
  box(-.76,-.31,-.91,.24,.06,.19,C.black);beam([-.86,-.29,-.91],[-.86,.07,-.96],.015,C.black);
  for(let i=0;i<8;i++){
    const x=-.72+i*.035;const points=[[x,-.33,.37],[x,-.43,.62],[x+.1,-.56,.75],[.55-i*.025,-.55,.76],[.67,-.43,.34-i*.04]];
    tube(points,.009,i%3===0?C.red:i%3===1?C.black:C.orange,6);
  }
  // A small number of fuel balls, leaving the detailed mechanisms visible.
  function sphere(x,y,z,r){const N=24,M=14;for(let j=0;j<M;j++)for(let i=0;i<N;i++){const p=(a,b)=>[x+Math.sin(a)*Math.cos(b)*r,y+Math.cos(a)*r,z+Math.sin(a)*Math.sin(b)*r];const a=j*Math.PI/M,b=(j+1)*Math.PI/M,c=i*Math.PI*2/N,d=(i+1)*Math.PI*2/N;const A=p(a,c),B=p(b,c),D=p(a,d),E=p(b,d);if(j>0)tri(A,B,D,C.yellow,[norm(sub(A,[x,y,z])),norm(sub(B,[x,y,z])),norm(sub(D,[x,y,z]))]);if(j<M-1)tri(D,B,E,C.yellow,[norm(sub(D,[x,y,z])),norm(sub(B,[x,y,z])),norm(sub(E,[x,y,z]))]);}}
  for(const [x,z] of [[-.57,-.65],[.63,.49],[-.4,.58]])sphere(x,.12,z,.165);
  // Bumper numbers are crisp white geometric lettering, front, rear and sides.
  const glyphs={4:['101','101','111','001','001'],1:['010','110','010','010','111']};
  function number(origin,u,v){const scale=.043;[4,4,1,4].forEach((d,i)=>glyphs[d].forEach((row,j)=>[...row].forEach((bit,k)=>{if(bit==='1'){const x=(i*4+k-7)*scale,y=(2-j)*scale;const p=origin.map((a,n)=>a+u[n]*x+v[n]*y);beam(p.map((a,n)=>a-u[n]*scale*.46),p.map((a,n)=>a+u[n]*scale*.46),scale*.91,C.white,.006);}})));}
  // Flat quads keep the numbers readable on vertical pad faces.
  function labelNumber(o,u,v){const s=.044;[4,4,1,4].forEach((d,i)=>glyphs[d].forEach((row,j)=>[...row].forEach((b,k)=>{if(b==='1'){const x=(i*4+k-7)*s,y=(2-j)*s;const p=(a,b)=>o.map((c,n)=>c+u[n]*(x+a*s*.49)+v[n]*(y+b*s*.49));quad(p(-1,-1),p(1,-1),p(1,1),p(-1,1),C.white);}})));}
  labelNumber([0,-.49,1.543],[1,0,0],[0,1,0]);labelNumber([0,-.49,-1.543],[-1,0,0],[0,1,0]);
  labelNumber([1.313,-.49,0],[0,0,-1],[0,1,0]);labelNumber([-1.313,-.49,0],[0,0,1],[0,1,0]);
  return {vertices:new Float32Array([...data,...panels]),solidCount:data.length/9,panelCount:panels.length/9,parts,triangles:(data.length+panels.length)/27};
};
