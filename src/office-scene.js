// Fragmento del escenario, incorporado por build.js dentro del motor compartido.
scene.background=new THREE.Color('#dce8e4');scene.fog=new THREE.Fog('#dce8e4',55,100);
const walnut=mat('#856044'),warmWood=mat('#cba275'),iron=mat('#6c8085',.4,.5),panel=mat('#809e97'),trim=mat('#d3e0d8');
const FLOOR_Y=0,SINK=platforms[0],GP=platforms[GOAL_INDEX];
box(40,.25,22,mat('#c7d0ca'),0,-.13,0);
for(let x=-19;x<20;x+=2)for(let z=-10;z<11;z+=2){const m=box(1.97,.015,1.97,mat((x+z)%4?'#c4cec9':'#bdc8c2'),x,.004,z);m.castShadow=false;}
box(40,7,.2,mat('#e9e9dc'),0,3.5,-11);
// El lateral izquierdo se mantiene bajo para no ocultar el inicio a la cámara.
box(.2,.6,22,trim,-20,.3,0);box(.2,.6,22,trim,20,.3,0);
box(40,.14,.15,iron,0,.15,-10.85);
for(const x of [-14,-4,6,16]){box(6,3,.08,mat('#a4c9d1',.25),x,4.5,-10.86);for(const dx of [-3,0,3])box(.07,3.2,.12,trim,x+dx,4.5,-10.75);box(6,.08,.12,trim,x,4.5,-10.75);}
for(const p of platforms){
 if(p.floor)continue;
 if(['sink','goal','desk'].includes(p.kind)){
  box(p.w,.22,p.d,warmWood,p.x,p.y-.11,p.z);
  if(p.kind==='sink')box(p.w-.15,p.y-.22,p.d-.1,trim,p.x,(p.y-.22)/2,p.z);
  else {for(const sx of [-1,1])for(const sz of [-1,1])box(.14,p.y-.22,.14,iron,p.x+sx*(p.w/2-.2),(p.y-.22)/2,p.z+sz*(p.d/2-.2));
   // Panel inferior: marca visualmente el volumen de colisión del escritorio.
   box(p.w-.25,p.y-.35,.1,panel,p.x,(p.y-.35)/2,p.z-p.d/2+.12);
  }
 }else if(p.kind==='chair'){
  box(p.w,.22,p.d,mat('#467c78'),p.x,p.y-.11,p.z);
  cylinder(.1,.13,p.y-.2,iron,p.x,(p.y-.2)/2,p.z);
  for(let k=0;k<5;k++){const a=k*Math.PI*2/5,leg=box(1.5,.09,.09,iron,p.x,.12,p.z);leg.rotation.y=a;const wheel=cylinder(.12,.12,.12,M.black,p.x+Math.cos(a)*.7,.12,p.z+Math.sin(a)*.7);wheel.rotation.z=Math.PI/2;}
  // Asientos sin respaldo alto: dejan libre la superficie de salto.
 }else if(p.kind==='back'){
  box(p.w,.2,p.d,mat('#467c78'),p.x,p.y-.1,p.z);
  for(const dx of [-.5,.5])box(.09,p.y,.09,iron,p.x+dx,p.y/2,p.z);
 }else if(p.kind==='bookcase'){
  box(.13,p.y,p.d,walnut,p.x-p.w/2+.065,p.y/2,p.z);
  for(const dz of [-1,1])box(p.w,p.y,.12,walnut,p.x,p.y/2,p.z+dz*(p.d/2-.06));
  for(const y of [.15,1.3,2.5,3.6,p.y]){
   box(p.w,.16,p.d,walnut,p.x,y-.08,p.z);
   if(y<p.y)for(let j=0;j<12;j++){const colors=['#4d7777','#c59a5a','#a65d4d','#dcd4b1'];box(.8,.65+(j%3)*.1,.38,mat(colors[j%4]),p.x+.35,y+.35,p.z-p.d/2+.5+j*.58);}
  }
 }else if(p.kind==='shelf'){
  box(p.w,.16,p.d,warmWood,p.x,p.y-.08,p.z);
  box(.1,p.y,.12,iron,p.x-p.w/2+.1,p.y/2,p.z-p.d/2+.1);
 }else{box(p.w,p.y,p.d,mat('#c7ae80'),p.x,p.y/2,p.z);box(.15,.012,p.d,M.paper,p.x,p.y+.006,p.z);}
}
for(const q of WALLS){box(q.w,q.y,q.d,panel,q.x,q.y/2,q.z);box(q.w+.04,.09,q.d+.04,trim,q.x,q.y,q.z);}
for(const i of [4,5,6,7]){
 const p=platforms[i],x=p.x,z=p.z-.6;
 box(1.75,1.08,.15,M.black,x,p.y+.86,z);box(1.57,.86,.025,mat('#8dc4ce',.2),x,p.y+.87,z+.09);
 box(.12,.35,.12,iron,x,p.y+.22,z);box(.6,.07,.4,iron,x,p.y+.035,z);
 box(1.3,.06,.45,M.cream,x,p.y+.03,z+.65);for(let j=0;j<4;j++)box(1.1,.012,.018,iron,x,p.y+.067,z+.5+j*.08);
 box(.22,.07,.33,M.cream,x+1,p.y+.04,z+.6);box(.5,1,.65,M.black,x-1.65,p.y+.5,z);
 for(let j=0;j<3;j++)box(.65,.025,.8,M.paper,x+1.4,p.y+.03+j*.027,z-.4);
 label('0'+(i-3),x,p.y+1.85,z,1,'#395b58');
}
box(2,.04,2.6,iron,SINK.x,SINK.y+.02,SINK.z-.5);box(1.7,.045,2.25,M.black,SINK.x,SINK.y+.045,SINK.z-.5);
const tap=torus(.35,.065,M.metal,SINK.x,SINK.y+.8,SINK.z-.8);tap.rotation.y=Math.PI/2;
box(.12,.7,.12,M.metal,SINK.x,SINK.y+.35,SINK.z-1.15);
label('01 / FREGADERO',SINK.x,SINK.y+1.9,0,3);
box(1.9,2.17,.73,M.dark,GP.x,GP.y+1.08,GP.z-1.03);
box(2,.4,1.62,M.green,GP.x,GP.y+2.19,GP.z-.62);
box(.83,.26,.35,M.metal,GP.x,GP.y+1.68,GP.z-.23);cylinder(.065,.065,.3,M.metal,GP.x,GP.y+1.48,GP.z-.1);
const plate=cylinder(.71,.73,.07,M.metal,GP.x,GP.y+.04,GP.z);
const stream=cylinder(.04,.06,.5,M.coffee,GP.x,GP.y+1,GP.z);stream.visible=false;
label('CAFÉ / META',GP.x,GP.y+3,GP.z,3.5);
for(const [x,z,text] of [[-14,2,'BAJA POR LA SILLA'],[13.9,2.7,'SUBE POR LAS REPISAS']])label(text,x,2.5,z,3.6);
for(const i of [18,19,20,21,23,24,25,26,27]){const p=platforms[i];label('↑',p.x,p.y+.35,p.z,.7,'#d39b43');}
const puddle=mesh(new THREE.CircleGeometry(FLOOR_PUDDLE.r,32),new THREE.MeshBasicMaterial({color:'#70b6c2',transparent:true,opacity:.5}),FLOOR_PUDDLE.x,.025,FLOOR_PUDDLE.z);puddle.rotation.x=-Math.PI/2;
for(let i=0;i<18;i++)box(.09,.035,.1,M.coffee,FLOOR_CRUMBS.x+Math.sin(i*2.4)*i/20,.02,FLOOR_CRUMBS.z+Math.cos(i*2.4)*i/20);
for(const c of CABLES){box(c.w,.09,c.d,M.black,c.x,.045,c.z);box(.45,.14,.32,M.paper,c.x+c.w/2,.07,c.z+c.d/2);}
// Aspiradora patrullera; su posición viene de obstacleAt(), igual que la colisión.
const rollingPin=new THREE.Group();scene.add(rollingPin);
cylinder(.6,.62,.35,M.dark,0,0,0,rollingPin);cylinder(.18,.18,.1,M.coral,0,.2,0,rollingPin);
box(.5,.07,.08,M.white,0,.03,.58,rollingPin);
// Ventilador oscilante: cabeza, aspas y cono comparten fanAt().
const fanHead=new THREE.Group();scene.add(fanHead);fanHead.position.set(FAN.x,FAN.y,FAN.z);
cylinder(.45,.5,.12,iron,FAN.x,.06,FAN.z);cylinder(.07,.08,FAN.y,iron,FAN.x,FAN.y/2,FAN.z);
const fanRotor=new THREE.Group();fanHead.add(fanRotor);
const guard=torus(.65,.045,iron,0,0,0,fanHead);guard.rotation.y=Math.PI/2;
for(let k=0;k<8;k++){const a=k*Math.PI/4,bar=box(.045,1.25,.025,iron,0,0,0,fanHead);bar.rotation.x=a;}
for(let k=0;k<3;k++){const a=k*Math.PI*2/3,blade=box(.07,.52,.22,M.mint,.06,Math.cos(a)*.25,Math.sin(a)*.25,fanRotor);blade.rotation.x=a;}
const windLines=[];for(let i=0;i<14;i++){const line=box(.7,.018,.018,new THREE.MeshBasicMaterial({color:'#d1f8f1',transparent:true,opacity:.45}),0,0,0);line.castShadow=false;windLines.push(line);}
const coneVertices=[];for(let i=0;i<20;i++){const a=-FAN.halfAngle+i/20*FAN.halfAngle*2,b=a+FAN.halfAngle/10;coneVertices.push(0,0,0,Math.cos(a)*FAN.range,0,Math.sin(a)*FAN.range,Math.cos(b)*FAN.range,0,Math.sin(b)*FAN.range);}
const coneGeo=new THREE.BufferGeometry();coneGeo.setAttribute('position',new THREE.Float32BufferAttribute(coneVertices,3));
const windCone=new THREE.Mesh(coneGeo,new THREE.MeshBasicMaterial({color:'#64cbbd',side:THREE.DoubleSide,transparent:true,opacity:.12,depthWrite:false}));windCone.position.set(FAN.x,.03,FAN.z);scene.add(windCone);
label('VIENTO · ESPERA EL GIRO',7,3.1,-.3,4);
