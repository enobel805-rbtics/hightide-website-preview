// Simplified, projected 3D model from FIRST GE-26300 sheet 4 and Manual 5.4.
// All vertices are inches: 47 square base, 49.75 body, 72 rim, 120.36 net.
export const HUB = Object.freeze({base:47,body:49.75,rim:72,opening:41.7,net:120.36,fuel:5.91});

export function drawHub(ctx, {x, floor, scale, dark}) {
  const yaw=-.32, pitch=.17, cy=Math.cos(yaw), sy=Math.sin(yaw);
  const cp=Math.cos(pitch), sp=Math.sin(pitch);
  const project=([a,b,c])=>({x:x+(a*cy-c*sy)*scale,y:floor+(-b*cp+(a*sy+c*cy)*sp)*scale});
  const ink=dark?'#b5bdc2':'#8fd9d4';
  const fill=dark?'#101214':'#0a4651';
  const face=(points,fillColor=fill,alpha=1,stroke=ink)=>{
    ctx.save();ctx.globalAlpha=alpha;ctx.beginPath();points.map(project).forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();
    if(fillColor){ctx.fillStyle=fillColor;ctx.fill();}ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();ctx.restore();
  };
  const line=(points,alpha=1,width=1,color=ink)=>{
    ctx.save();ctx.globalAlpha=alpha;ctx.beginPath();points.map(project).forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
    ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();ctx.restore();
  };
  // Backstop: wider than the body, leaning behind the opening, not a basket.
  const net=[[-29.205,49.75,-23.5],[29.205,49.75,-23.5],[29.205,120.36,-33.76],[-29.205,120.36,-33.76]];
  face(net,dark?'#090b0c':'#06333d',.95);
  for(let u=0;u<=1.001;u+=.1){
    const xx=-29.205+u*58.41;
    line([[xx,49.75,-23.5],[xx,120.36,-33.76]],.16,.6);
    const yy=49.75+u*(120.36-49.75),zz=-23.5-u*10.26;
    line([[-29.205,yy,zz],[29.205,yy,zz]],.16,.6);
  }
  line([net[0],net[3],net[2],net[1]],.85,2);
  // Square chassis, open side rails and the solid alliance-facing panel.
  face([[-23.5,0,-23.5],[23.5,0,-23.5],[23.5,49.75,-23.5],[-23.5,49.75,-23.5]],fill);
  face([[23.5,0,-23.5],[23.5,0,23.5],[23.5,49.75,23.5],[23.5,49.75,-23.5]],fill);
  for(const yy of [2,15,31,49.75])line([[23.5,yy,-23.5],[23.5,yy,23.5]],.7,1.4);
  for(const zz of [-21,21])line([[23.5,0,zz],[23.5,49.75,zz]],.8,1.4);
  face([[-23.5,0,23.5],[23.5,0,23.5],[23.5,49.75,23.5],[-23.5,49.75,23.5]],dark?'#141719':'#0a4e5a');
  face([[-23.5,49.75,-23.5],[23.5,49.75,-23.5],[23.5,49.75,23.5],[-23.5,49.75,23.5]],fill);
  // Front panel and pair of AprilTag mounting plates at 44.25 inches.
  face([[-20,7,23.6],[20,7,23.6],[20,34,23.6],[-20,34,23.6]],dark?'#1a2023':'#105767',.8);
  for(const xx of [-14,0]){
    face([[xx-5.25,39,23.65],[xx+5.25,39,23.65],[xx+5.25,49.5,23.65],[xx-5.25,49.5,23.65]],'#d9dedf',1,'#d9dedf');
    face([[xx-4,40.2,23.7],[xx+4,40.2,23.7],[xx+4,48.3,23.7],[xx-4,48.3,23.7]],'#111517',1,'#111517');
    for(const [dx,dy] of [[-2,0],[0,2],[2,-2]])face([[xx+dx-1,44.25+dy-1,23.75],[xx+dx+1,44.25+dy-1,23.75],[xx+dx+1,44.25+dy+1,23.75],[xx+dx-1,44.25+dy+1,23.75]],'#d9dedf',1,'#d9dedf');
  }
  // Six flat polycarbonate funnel faces and a hexagonal, horizontal mouth.
  const ring=(radius,height)=>Array.from({length:6},(_,i)=>[Math.cos(i*Math.PI/3)*radius,height,Math.sin(i*Math.PI/3)*radius]);
  const outer=ring(41.932/Math.sqrt(3),72);
  const inner=ring(14,49.75);
  face(inner,dark?'#030405':'#04272f');
  for(const i of [3,4,5,0,1,2]){let next=(i+1)%6;face([outer[i],outer[next],inner[next],inner[i]],dark?'#252c30':'#1a5963',.55);}
  line([...outer,outer[0]],1,1.7);
  // Alliance light bars sit along the top chassis angles.
  line([[-23.5,50.5,23.6],[23.5,50.5,23.6]],.85,2.5,'#00b6ae');
  for(const xx of [-29.205,29.205])line([[xx,49.75,-23.5],[xx,120.36,-33.76]],.9,1.6);
  const target=project([0,72,0]);
  return {target,project,frontRim:()=>line([outer[0],outer[1],outer[2],outer[3]],1,1.7)};
}
