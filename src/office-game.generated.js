import * as THREE from './vendor/three.module.js';
import {platforms,createPlayer,step,obstacleAt,cameraMovement,autoInput,GOAL_INDEX,FLOOR_INDEX,FLOOR_PUDDLE,FLOOR_CRUMBS,FAN,fanAt,CABLES,WALLS,blocked} from './physics.js';

const $=id=>document.getElementById(id);
const scene=new THREE.Scene();scene.background=new THREE.Color('#f0cfa8');scene.fog=new THREE.Fog('#f0cfa8',48,88);
const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,120);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
$('scene').append(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffecd2,0xa28670,2.6));
const sun=new THREE.DirectionalLight(0xffecd4,3.5);sun.position.set(15,18,1);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-22,right:26,top:18,bottom:-18,near:1,far:60});sun.shadow.bias=-.0005;sun.shadow.normalBias=.025;scene.add(sun);sun.target.position.set(0,1.7,-3);scene.add(sun.target);
const mat=(color,roughness=.75,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const M={cream:mat('#e8debf'),wood:mat('#ba8657'),darkwood:mat('#8c603d'),green:mat('#5f947b',.28),dark:mat('#244737'),mint:mat('#a8bca0'),metal:mat('#b9c8bc',.28,.65),coffee:mat('#442318',.2),coral:mat('#ce7752'),paper:mat('#f3e4c8'),black:mat('#23332d'),white:mat('#fff4db'),floor:mat('#e9e6d8')};
function mesh(geo,material,x=0,y=0,z=0,parent=scene){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function box(w,h,d,material,x,y,z,parent){return mesh(new THREE.BoxGeometry(w,h,d),material,x,y,z,parent);}
function cylinder(rt,rb,h,material,x,y,z,parent,segments=40){return mesh(new THREE.CylinderGeometry(rt,rb,h,segments),material,x,y,z,parent);}
function torus(r,t,material,x,y,z,parent){return mesh(new THREE.TorusGeometry(r,t,12,48),material,x,y,z,parent);}
function label(text,x,y,z,size=1.7,color='#385c46'){
  const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.font='600 38px sans-serif';ctx.textAlign='center';ctx.fillText(text,256,78);
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,depthWrite:false}));sprite.position.set(x,y,z);sprite.scale.set(size,size/4,1);scene.add(sprite);return sprite;
}
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

// Perfil de taza inspirado en el modelo original Ceramica_Menta, con interior hueco.
const cup=new THREE.Group();scene.add(cup);
const profile=[[0,0],[.32,0],[.38,.06],[.43,.65],[.44,.8],[.42,.84],[.38,.81],[.37,.7],[.32,.15],[0,.15]].map(([x,y])=>new THREE.Vector2(x,y));
mesh(new THREE.LatheGeometry(profile,48),M.green,0,0,0,cup);
const handle=torus(.25,.065,M.green,.47,.45,0,cup);handle.scale.x=.85;
const liquid=cylinder(.367,.32,.02,M.coffee,0,.17,0,cup);liquid.visible=false;
for(const x of [-.135,.135]){mesh(new THREE.SphereGeometry(.047,16,12),M.black,x,.51,.4,cup);mesh(new THREE.SphereGeometry(.015,8,6),M.white,x-.012,.526,.437,cup);}
const smile=mesh(new THREE.TorusGeometry(.095,.018,8,24,Math.PI),M.black,0,.39,.423,cup);smile.rotation.z=Math.PI;
const shadow=mesh(new THREE.CircleGeometry(.5,32),new THREE.MeshBasicMaterial({color:'#426348',transparent:true,opacity:.15,depthWrite:false}),0,1.015,0);shadow.rotation.x=-Math.PI/2;
const fragments=[];const shardGeo=new THREE.TetrahedronGeometry(.15);
const steam=[];for(let i=0;i<7;i++){const s=mesh(new THREE.SphereGeometry(.055,8,6),new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.35}),0,0,0);s.visible=false;steam.push(s);}
let state='intro',previousState='playing',player=createPlayer(),deaths=0,elapsed=0,fill=0,deathTimer=0,auto=false,lastCheckpoint=0,toastTimer=0,last=0,accumulator=0;
const keys=new Set();let jumpQueued=false;
let yaw=Math.PI/2,pitch=.48,cameraDistance=6.5,heading=Math.PI/2,worldTime=0,bestProgress=0;
const cameraSolids=scene.children.filter(o=>o.isMesh&&o.geometry?.type==='BoxGeometry');
const cameraRay=new THREE.Raycaster(),cameraOrigin=new THREE.Vector3(),cameraDirection=new THREE.Vector3();
const camTarget=new THREE.Vector3();const desired=new THREE.Vector3();const look=new THREE.Vector3();
// ===== NUEVAS MECÁNICAS (GDD): salud, grietas, cucarachas, hormigas, grifo, puntuación =====
const mug={hp:100,inv:0,dirty:0,dil:0,falls:0,shown:100,wk:''},ROACHM=1.8,CUPM=.5;
let camHold=0,shake=0,pvx=0,pvz=0,lPX=0,lPZ=0,lH=0,turnAcc=0,jumpTimes=[],shakeCd=0,dropT=1.5,ac;
const drops=[],dust=[],ants=[],att=[],roaches=[],spawners=[],rnd=Math.random,clamp=THREE.MathUtils.clamp;
const dropG=new THREE.SphereGeometry(.07,8,6),dropM=new THREE.MeshBasicMaterial({color:'#8fd0e8',transparent:true,opacity:.85}),dustG=new THREE.SphereGeometry(.05,6,5),antG=new THREE.SphereGeometry(.055,8,6),antM=mat('#1a1410',.5);
const Q=[[0,'Espresso puro','#1a0c03',1],[25,'Café americano','#3d2314',.9],[50,'Café aguado','#7a5432',.7],[75,'Agua repagada','#c4b083',.4]];
const quality=d=>Q.reduce((a,q)=>d>=q[0]?q:a,Q[0]);
function beep(f){try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.type='square';o.frequency.value=f;g.gain.value=.03;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+.1);}catch(e){}}
// Grifo representado junto al fregadero; las gotas también usan sus coordenadas.
// Taza: material propio, capa de grietas/suciedad (canvas) y líquido con color según dilución.
const cupMat=M.green.clone();cup.traverse(o=>{if(o.material===M.green)o.material=cupMat;});
const wearC=document.createElement('canvas');wearC.width=512;wearC.height=256;
const wearTex=new THREE.CanvasTexture(wearC);wearTex.colorSpace=THREE.SRGBColorSpace;
const wear=new THREE.Mesh(new THREE.LatheGeometry(profile,48),new THREE.MeshBasicMaterial({map:wearTex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));wear.scale.set(1.012,1,1.012);cup.add(wear);
const liqM=new THREE.MeshStandardMaterial({color:'#a9d3dc',roughness:.1,transparent:true,opacity:.65});liquid.material=liqM;stream.material=liqM.clone();
const foam=cylinder(.36,.36,.03,mat('#d9b27c',.9),0,.2,0,cup);foam.visible=false;
function drawWear(st,dirt){
 const g=wearC.getContext('2d');g.clearRect(0,0,512,256);let s=7;const r=()=>(s=s*16807%2147483647)/2147483647;
 g.strokeStyle='#1d1612';g.lineCap='round';
 for(let i=0;i<[0,6,16,34][st];i++){let x=r()*512,y=140+r()*85;g.lineWidth=1+st*.6;g.beginPath();g.moveTo(x,y);for(let k=0;k<4+st*2;k++){x+=(r()-.5)*26;y+=(r()-.3)*14;g.lineTo(x,y);}g.stroke();}
 if(st>=2)for(let i=0;i<10;i++){const x=r()*512;g.fillStyle='#2a1d14';g.beginPath();g.moveTo(x,140);g.lineTo(x+12,140);g.lineTo(x+4,156+r()*10);g.fill();}
 for(let i=0;i<dirt*.9;i++){const x=r()*512,y=140+r()*90,d=4+r()*10,gr=g.createRadialGradient(x,y,0,x,y,d);gr.addColorStop(0,'rgba(30,20,12,.75)');gr.addColorStop(1,'rgba(30,20,12,0)');g.fillStyle=gr;g.fillRect(x-d,y-d,d*2,d*2);}
 wearTex.needsUpdate=true;
}
// Barra de vida integrada en el panel de estado (arriba a la izquierda).
document.head.append(Object.assign(document.createElement('style'),{textContent:'#hpBox{min-width:175px}#hpBox span{display:block;font-size:10px;letter-spacing:2px;font-weight:700;color:var(--muted);margin-bottom:6px}.hpbar{height:14px;border:2px solid #8a9b88;border-radius:8px;background:#e7e5d6;overflow:hidden}.hpbar i{display:block;height:100%;width:100%;transition:opacity .1s}#hpBox small{display:block;margin-top:5px;font-size:10px;color:var(--muted)}@keyframes bl{0%,100%{opacity:1}50%{opacity:.2}}.crit{animation:bl .5s infinite}'}));
const hpBox=document.createElement('div');hpBox.id='hpBox';hpBox.innerHTML='<span>SALUD</span><div class="hpbar"><i id="hpFill"></i></div><small id="hpInfo"></small>';$('hud').prepend(hpBox);
// Brújula de objetivo: ayuda a orientarse sin convertir la cocina en un pasillo.
document.head.append(Object.assign(document.createElement('style'),{textContent:'#goalGuide{position:fixed;right:5%;top:132px;z-index:3;border:1px solid #cdd7c7;background:#faf8f0e8;padding:11px 15px;border-radius:12px;font:700 11px Outfit,system-ui;color:#305f49;letter-spacing:1px;pointer-events:none}@media(max-width:900px){#goalGuide{top:205px;font-size:10px;right:4%}}'}));
const goalGuide=document.createElement('div');goalGuide.id='goalGuide';goalGuide.hidden=true;document.body.append(goalGuide);

// ===== MEJORAS VISUALES Y MÁS DIFICULTAD =====
const spinners=[];let steamT=0;
const goalL=new THREE.PointLight('#ffe0aa',25,7.4,2);goalL.position.set(GP.x,GP.y+2,GP.z);scene.add(goalL);
const shellM=new THREE.MeshPhysicalMaterial({color:'#4a2412',roughness:.25,metalness:.2,clearcoat:1,clearcoatRoughness:.15}),antSG=new THREE.SphereGeometry(.04,8,6),legG=new THREE.BoxGeometry(.13,.006,.006);
function makeAnt(){const g=new THREE.Group();for(const [z,s] of [[-.08,1.3],[0,.8],[.07,.65]]){const m=new THREE.Mesh(antSG,antM);m.position.set(0,.04,z);m.scale.set(s*.8,s*.7,s);g.add(m);}for(const z of [-.01,.02,.05]){const l=new THREE.Mesh(legG,antM);l.position.set(0,.02,z);g.add(l);}g.scale.setScalar(1.6);return g;}
function makeRoach(pi,pts){pts=pts.map(([a,b])=>[platforms[pi].x+a,platforms[pi].z+b]);
 const g=new THREE.Group(),body=new THREE.Group(),sh=shellM.clone(),em=new THREE.MeshStandardMaterial({color:'#ffd0c0',emissive:'#ff1a00',emissiveIntensity:0}),legs=[],ants=[];g.add(body);
 mesh(new THREE.SphereGeometry(.2,16,12),sh,0,.08,-.12,body).scale.set(.85,.5,1.35);
 mesh(new THREE.SphereGeometry(.14,14,10),sh,0,.09,.15,body).scale.set(1,.6,.9);
 mesh(new THREE.SphereGeometry(.085,12,8),sh,0,.07,.3,body).scale.set(1,.7,1);
 box(.012,.012,.36,M.black,0,.19,-.1,body);
 for(const s of [-1,1]){mesh(new THREE.SphereGeometry(.028,8,6),em,s*.05,.09,.36,body);const a=box(.01,.01,.3,M.black,s*.05,.1,.5,body);a.rotation.y=s*.35;ants.push(a);
  for(const k of [0,1,2]){const pv=new THREE.Group();pv.position.set(s*.1,.06,.18-k*.13);pv.userData={s,k};box(.2,.018,.018,M.black,s*.1,0,0,pv);body.add(pv);legs.push(pv);}}
 g.position.set(pts[0][0],platforms[pi].y+.1,pts[0][1]);scene.add(g);
 roaches.push({g,body,sh,em,legs,ants,gait:0,pi,pts,wp:0,st:'PATROL',t:0,cool:0,x:pts[0][0],z:pts[0][1],hx:0,hz:1});}
function animRoach(r,dt,sp){r.gait+=dt*(2+sp*3.4);const mv=sp>0?1:.15,al=r.st==='ALERT',ch=r.st==='CHARGE';
 for(const l of r.legs){const {s,k}=l.userData;l.rotation.y=s*(.25+Math.sin(r.gait+((k+(s>0?1:0))%2)*Math.PI)*.5*mv);}
 r.ants.forEach((a,i)=>{a.rotation.x=Math.sin(r.gait*.7+i*2)*.18;});
 r.body.rotation.x+=((al?-.5:0)-r.body.rotation.x)*Math.min(1,dt*14);r.body.position.y=-.07+(ch?Math.abs(Math.sin(r.gait*2))*.03:0);
 r.em.emissiveIntensity=r.st==='PATROL'?0:2.5;r.sh.emissive.set(ch?'#6a1000':'#000000');}
function makeSpinner(pi,ox,oz){const P=platforms[pi],g=new THREE.Group(),arm=new THREE.Group(),T=new THREE.TorusGeometry(.2,.025,8,20);
 mesh(new THREE.CylinderGeometry(.14,.18,.24,16),M.metal,0,.12,0,g);g.add(arm);
 for(let i=0;i<4;i++){const a=new THREE.Group();a.rotation.y=i*Math.PI/2;arm.add(a);mesh(new THREE.BoxGeometry(.8,.05,.06),M.metal,.5,.3,0,a);mesh(T,M.metal,.9,.3,0,a).scale.set(1,1.2,1);}
 g.position.set(P.x+ox,P.y,P.z+oz);scene.add(g);spinners.push({g,arm,x:P.x+ox,z:P.z+oz,y:P.y,sp:(spinners.length%2?-1:1)*2.6});}
function spinHit(){for(const s of spinners){if(player.y>s.y+.55||player.y+.84<s.y+.1)continue;const rx=player.x-s.x,rz=player.z-s.z;
 for(let i=0;i<4;i++){const a=s.arm.rotation.y+i*Math.PI/2,dx=Math.cos(a),dz=-Math.sin(a),t=clamp(rx*dx+rz*dz,0,1.1);
  if(Math.hypot(dx*t-rx,dz*t-rz)<.32){const l=Math.hypot(rx,rz)||1;damage(22,rx/l*4,rz/l*4);break;}}}}
function fxExtra(dt){
 for(const s of spinners)s.arm.rotation.y+=s.sp*dt;
 const f=fanAt(worldTime);fanHead.rotation.y=-f.angle;windCone.rotation.y=-f.angle;fanRotor.rotation.x+=dt*24;
 windLines.forEach((m,i)=>{const a=(worldTime*3+i*.57)%FAN.range,spread=(i%3-1)*a*.16;m.position.set(f.x+f.dx*a-f.dz*spread,FAN.y+(i%2)*.2,f.z+f.dz*a+f.dx*spread);m.rotation.y=-f.angle;});
}
makeRoach(FLOOR_INDEX,[[-8,8],[-3,8]]);makeRoach(FLOOR_INDEX,[[2,1.5],[6,1.5]]);makeRoach(4,[[-1,.6],[1,.6]]);
makeSpinner(7,.9,.25);makeSpinner(22,0,0);
for(const [pi,ox,oz] of [[FLOOR_INDEX,2,3.5]]){const p=platforms[pi];spawners.push({pi,x:p.x+ox,z:p.z+oz,cd:2});}
function roach(r,dt){
 const p=platforms[r.pi],near=player.platform===r.pi&&Math.hypot(player.x-r.x,player.z-r.z)<5;let tx,tz,sp=1.5;r.cool=Math.max(0,r.cool-dt);
 if(r.st==='PATROL'){[tx,tz]=r.pts[r.wp];if(Math.hypot(tx-r.x,tz-r.z)<.12)r.wp=(r.wp+1)%r.pts.length;if(near&&!r.cool){r.st='ALERT';r.t=.3;beep(520);}}
 else if(r.st==='ALERT'){tx=player.x;tz=player.z;sp=0;if((r.t-=dt)<=0){r.st='CHARGE';r.t=1.6;}}
 else{tx=player.x+pvx*.25;tz=player.z+pvz*.25;sp=5.5;if((r.t-=dt)<=0||!near){r.st='PATROL';r.cool=1.5;}}
 const ux=tx-r.x,uz=tz-r.z,l=Math.hypot(ux,uz)||1;r.hx=ux/l;r.hz=uz/l;
 const nx=clamp(r.x+r.hx*sp*dt,p.x-p.w/2+.1,p.x+p.w/2-.1),nz=clamp(r.z+r.hz*sp*dt,p.z-p.d/2+.1,p.z+p.d/2-.1);if(r.pi!==FLOOR_INDEX||!blocked(nx,nz,{y:0})){r.x=nx;r.z=nz;}else{r.st='PATROL';r.cool=1;r.wp=(r.wp+1)%r.pts.length;}
 r.g.position.set(r.x,p.y+.1,r.z);r.g.rotation.y=Math.atan2(r.hx,r.hz);animRoach(r,dt,sp);
 if(r.st==='CHARGE'&&player.y<p.y+.4&&Math.hypot(player.x-r.x,player.z-r.z)<.5){
  const q=platforms[player.platform],ox=player.x-q.x,oz=player.z-q.z,eg=Math.abs(ox)/q.w>Math.abs(oz)/q.d?[Math.sign(ox)||1,0]:[0,Math.sign(oz)||1];
  const ix=r.hx*.5+eg[0]*.5,iz=r.hz*.5+eg[1]*.5,il=Math.hypot(ix,iz)||1,I=ROACHM/(ROACHM+CUPM)*5.5*1.3;
  damage(14,ix/il*I,iz/il*I);shake=.5;beep(160);r.st='PATROL';r.cool=2.2;}
}
function dustBurst(x,y,z,n,col='#e8dcc2',up=1.5,life=1,hor=2){for(let i=0;i<n;i++){const m=new THREE.Mesh(dustG,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.6}));m.position.set(x,y,z);scene.add(m);dust.push({m,v:new THREE.Vector3((rnd()-.5)*hor,rnd()*up,(rnd()-.5)*hor),l:life});}}
function damage(n,kx,kz){if(auto||mug.inv>0||state!=='playing')return;mug.hp=Math.max(0,mug.hp-n);mug.inv=.8;shake=.7;player.kx=kx;player.kz=kz;player.kt=.3;beep(240);dustBurst(player.x,player.y+.5,player.z,5);notify('¡Golpe! −'+Math.round(n)+' HP');}
function resetMug(full){mug.hp=100;mug.inv=0;mug.shown=100;for(const a of att)cup.remove(a.m);att.length=0;for(const a of ants)scene.remove(a.m);ants.length=0;
 for(const r of roaches){r.st='PATROL';r.cool=2.5;r.wp=0;r.x=r.pts[0][0];r.z=r.pts[0][1];r.g.position.set(r.x,platforms[r.pi].y+.1,r.z);}
 for(const s of spawners)s.cd=2;if(full){mug.dirty=mug.dil=mug.falls=0;}}
// Orden por fotograma: temporizadores/spawners → física → colisiones → estados → shaders → cámara.
function preStep(dt){
 pvx=pvx*.8+(player.x-lPX)/dt*.2;pvz=pvz*.8+(player.z-lPZ)/dt*.2;lPX=player.x;lPZ=player.z;
 turnAcc=turnAcc*Math.exp(-dt*1.5)+Math.abs(Math.atan2(Math.sin(heading-lH),Math.cos(heading-lH)));lH=heading;
 mug.inv=Math.max(0,mug.inv-dt);shakeCd-=dt;
 dropT-=dt;if(dropT<=0){dropT=.7+rnd()*1.1;const m=new THREE.Mesh(dropG,dropM);m.scale.y=1.5;m.position.set(SINK.x+(rnd()-.5)*.2,SINK.y+1.1,SINK.z-.8);scene.add(m);drops.push({m,vy:0});}
 if(auto)return;
 for(const r of roaches)roach(r,dt);spinHit();
 for(const s of spawners){if(player.platform!==s.pi)continue;s.cd-=dt;if(s.cd<=0){s.cd=5;for(let i=0,n=3+Math.floor(rnd()*3);i<n&&ants.length+att.length<10;i++){const m=makeAnt();m.position.set(s.x,platforms[s.pi].y+.05,s.z);scene.add(m);ants.push({m,pi:s.pi});}}}
 for(let i=ants.length-1;i>=0;i--){const a=ants[i],p=a.m.position,dx=player.x-p.x,dz=player.z-p.z,d=Math.hypot(dx,dz)||1;
  if(player.platform!==a.pi){scene.remove(a.m);ants.splice(i,1);continue;}
  p.x+=dx/d*1.3*dt;p.z+=dz/d*1.3*dt;a.m.rotation.y=Math.atan2(dx,dz);
  if(d<.5&&player.y<platforms[a.pi].y+.3&&att.length<10){scene.remove(a.m);ants.splice(i,1);cup.add(a.m);att.push({m:a.m,a:rnd()*6.28,s:(rnd()-.5)*2,p:rnd()*6,h:.3});notify('¡Hormigas! Salta varias veces o gira bruscamente para sacudirlas');}}
 jumpTimes=jumpTimes.filter(x=>worldTime-x<1);
 if(att.length&&shakeCd<=0&&(jumpTimes.length>=3||turnAcc>5.5)){for(let i=0,n=Math.max(1,Math.ceil(att.length*.3));i<n;i++)cup.remove(att.pop().m);jumpTimes=[];turnAcc=0;shakeCd=.4;shake=.3;dustBurst(player.x,player.y+.5,player.z,4);}
 player.speedMul=1-att.length*.05;
 if(player.platform===FLOOR_INDEX&&Math.hypot(player.x-FLOOR_PUDDLE.x,player.z-FLOOR_PUDDLE.z)<FLOOR_PUDDLE.r)player.speedMul*=.7;
}
let hazardHintUntil=0;
function postStep(res,dt){
 if(!auto&&worldTime>hazardHintUntil&&(res.wind||res.cable)){notify(res.wind?'¡Viento! Espera el giro o busca cobertura.':'Cable: te frena. Salta para cruzarlo.');hazardHintUntil=worldTime+4;}

 if(player.kt>0)player.kt-=dt;else if(player.kx||player.kz){const f=Math.exp(-dt*9);player.kx*=f;player.kz*=f;}
 if(auto)return;
 if(att.length){mug.hp=Math.max(0,mug.hp-att.length*.5*dt);mug.dirty=Math.min(100,mug.dirty+att.length*1.5*dt);}
 if(player.grounded&&player.platform===FLOOR_INDEX){
   if(Math.hypot(player.x-FLOOR_PUDDLE.x,player.z-FLOOR_PUDDLE.z)<FLOOR_PUDDLE.r)mug.dil=Math.min(100,mug.dil+3*dt);
   if(Math.hypot(player.x-FLOOR_CRUMBS.x,player.z-FLOOR_CRUMBS.z)<FLOOR_CRUMBS.r)mug.dirty=Math.min(100,mug.dirty+4*dt);
 }
 if(res.hit){const o=obstacleAt(worldTime),vr=Math.hypot(pvx,pvz-3*Math.cos(2.4*worldTime))+1.5;damage(vr*8,0,(Math.sign(player.z-o.z)||1)*3.5);}
 if(mug.hp<25&&mug.hp>0&&rnd()<dt*8)dustBurst(player.x,player.y+.8,player.z,1);
}
function fx(dt){fxExtra(dt);
 for(let i=drops.length-1;i>=0;i--){const d=drops[i],p=d.m.position;d.vy-=18*dt;p.y+=d.vy*dt;
  if(state==='playing'&&Math.hypot(p.x-player.x,p.z-player.z)<.36&&p.y<player.y+.84&&p.y>player.y+.55){
   mug.dil=Math.min(100,mug.dil+12);dustBurst(p.x,p.y,p.z,6,'#a9d3dc',1.5,.5);
   if(att.length){for(const a of att)cup.remove(a.m);att.length=0;notify('¡El agua limpia se llevó a las hormigas! · Dilución '+mug.dil+'%');}else notify('Una gota cayó en la taza · Dilución '+mug.dil+'%');
   scene.remove(d.m);drops.splice(i,1);}
  else if(p.y<SINK.y+.06){dustBurst(p.x,SINK.y+.06,p.z,4,'#a9d3dc',1.2,.5);scene.remove(d.m);drops.splice(i,1);}}
 for(let i=dust.length-1;i>=0;i--){const d=dust[i];d.l-=dt;d.m.position.addScaledVector(d.v,dt);d.m.material.opacity=Math.max(0,Math.min(.6,d.l*.6));if(d.l<=0){scene.remove(d.m);dust.splice(i,1);}}
 for(const a of att){a.a+=a.s*dt;a.h=.12+.5*(.5+.5*Math.sin(worldTime*2+a.p));a.m.position.set(Math.cos(a.a)*.43,a.h,Math.sin(a.a)*.43);a.m.rotation.y=-a.a;}
}
function visuals(t,dt){
 mug.shown+=(mug.hp-mug.shown)*(1-Math.exp(-dt*8));const hp=mug.hp,f=$('hpFill');
 f.style.width=Math.max(0,mug.shown)+'%';f.style.opacity=hp>0?1:0;f.style.background=hp>=65?'#2e7d32':hp>=30?'#f57f17':'#d50000';f.parentElement.classList.toggle('crit',hp>0&&hp<30);
 $('hpInfo').textContent=`${att.length?'🐜 '+att.length+' · ':''}Suciedad ${Math.round(mug.dirty)}% · Dilución ${Math.round(mug.dil)}%`;
 const st=hp>=75?0:hp>=50?1:hp>=25?2:3,wk=st+':'+Math.floor(mug.dirty/4);
 if(wk!==mug.wk){mug.wk=wk;drawWear(st,mug.dirty);cupMat.roughness=.15+st*.12;cupMat.metalness=.05;}
 if(state==='playing'){cup.visible=mug.inv<=0||Math.floor(t*12)%2===0;if(hp<25)cup.rotation.z+=Math.sin(t*9)*.03;}
 const serving=state==='serving'||state==='won';liquid.scale.set(1,1,1);
 if(!serving){liquid.visible=mug.dil>0&&cup.visible;liquid.position.y=.17+mug.dil/100*.22;liqM.color.set('#a9d3dc');liqM.opacity=.65;foam.visible=false;return;}
 const q=quality(mug.dil);liquid.visible=true;liqM.color.set(q[2]);liqM.opacity=q[3];stream.material.color.set(q[2]);
 foam.visible=q[0]<50;foam.scale.set(q[0]?.55:1,1,q[0]?.55:1);foam.position.y=liquid.position.y+.02;
 if(q[0]===75)liquid.scale.set(1+Math.sin(t*14)*.03,1,1+Math.cos(t*13)*.03);
}
function showScore(){
 const hp=Math.round(mug.hp),d=Math.round(mug.dirty),w=Math.round(mug.dil),a=(100-hp)*40,b=d*35,c=w*50,e=mug.falls*500,t=Math.max(0,10000-a-b-c-e);
 const r=t>=9000?['S','Maestro Barista']:t>=7500?['A','Excelente']:t>=5500?['B','Aceptable']:t>=3000?['C','Deficiente']:['D','Desastre'];
 const row=(l,v)=>`<tr><td>${l}</td><td style="text-align:right">${v}</td></tr>`;
 $('resultText').innerHTML=`Tu café: <b>${quality(mug.dil)[1]}</b> · ${clockText(elapsed)}<table style="width:100%;margin:14px 0;font-size:13px">${row('Puntaje base','10.000')}${row('Daño físico ('+(100-hp)+' HP)','−'+a)}${row('Suciedad ('+d+'%)','−'+b)}${row('Dilución ('+w+'%)','−'+c)}${row('Caídas ('+mug.falls+')','−'+e)}${row('<b>Puntaje final</b>','<b>'+t.toLocaleString('es')+'</b>')}</table><b style="font-size:18px">Rango ${r[0]} · ${r[1]}</b>`;
}
// ===== TELEMETRÍA (alimenta el dashboard) =====
// Muestreo cada 200 ms de tiempo de juego (≈5 puntos/s en vez de 60). Envío único por partida (POST asíncrono).
const TEL={url:(window.TELEMETRY_URL||(location.protocol.startsWith('http')?location.origin:'http://localhost:3000'))+'/api/partidas',level:'oficina-02-plano',pts:[],acc:0,sid:'',sent:true,last:'',who:null};
const uid=()=>crypto.randomUUID?crypto.randomUUID():'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>((c==='x'?Math.random()*16:8+Math.random()*4)|0).toString(16));
function telWho(){let id='',name='';try{id=localStorage.cp_player_id||'';name=localStorage.cp_username||'';if(!id)localStorage.cp_player_id=id=uid();if(!name)localStorage.cp_username=name=(prompt('Tu nombre de jugador (aparecerá en el dashboard):','')||'').trim().slice(0,24)||'Jugador-'+id.slice(0,4);}catch(e){id=id||uid();name=name||'Jugador';}return{id,name};}
function calcScore(){const hp=Math.round(mug.hp),d=Math.round(mug.dirty),w=Math.round(mug.dil),t=Math.max(0,10000-(100-hp)*40-d*35-w*50-mug.falls*500);return{t,hp,d,w,r:t>=9000?'S':t>=7500?'A':t>=5500?'B':t>=3000?'C':'D'};}
function telSample(){TEL.pts.push({x:+player.x.toFixed(2),y:+player.y.toFixed(2),z:+player.z.toFixed(2),t:+elapsed.toFixed(2)});}
function telStart(){TEL.pts=[];TEL.acc=0;TEL.last='';TEL.sent=auto;if(auto)return;TEL.who=telWho();TEL.sid=uid();telSample();}
function telTick(dt){if(TEL.sent||state!=='playing')return;TEL.acc+=dt;if(TEL.acc>=.2){TEL.acc-=.2;telSample();}}
function telSend(how,res){
 if(TEL.sent||TEL.pts.length<2)return;TEL.sent=true;if(!res&&elapsed<3)return;   // ignora reinicios accidentales (<3 s)
 telSample();const s=calcScore(),r=res||(TEL.last.startsWith('caída')?'derrota_caida':TEL.last?'derrota_ruptura':'abandono'),win=r==='victoria';let pts=TEL.pts;
 if(how==='beacon')while(JSON.stringify(pts).length>55000)pts=pts.filter((_,i)=>i%2===0);   // sendBeacon admite ~64 KB
 const body=JSON.stringify({player_id:TEL.who.id,username:TEL.who.name,session_id:TEL.sid,level_id:TEL.level,timestamp:new Date().toISOString(),
  result:r,
  metrics:{score:win?s.t:0,duration_seconds:+elapsed.toFixed(1),hp_final:s.hp,falls_count:mug.falls,dirty_percentage:s.d,dilution_percentage:s.w,rating_rank:win?s.r:'D'},trajectory:pts});
 try{if(how==='beacon'&&navigator.sendBeacon)navigator.sendBeacon(TEL.url,new Blob([body],{type:'text/plain;charset=UTF-8'}));
  else fetch(TEL.url,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body,keepalive:body.length<60000}).catch(()=>console.warn('Telemetría: no se pudo contactar con el servidor'));}catch(e){}}
addEventListener('pagehide',()=>telSend('beacon'));
function notify(text){$('toast').textContent=text;$('toast').classList.add('show');toastTimer=3;}
function clockText(t){return `${Math.floor(t/60).toString().padStart(2,'0')}:${Math.floor(t%60).toString().padStart(2,'0')}`;}
function clearFragments(){for(const f of fragments)scene.remove(f.mesh);fragments.length=0;}
function start(isAuto=false){telSend();auto=isAuto;yaw=Math.PI/2;pitch=.48;heading=Math.PI/2;worldTime=0;hazardHintUntil=0;player=createPlayer();player.demo=isAuto;deaths=0;elapsed=0;fill=0;deathTimer=0;lastCheckpoint=0;bestProgress=0;accumulator=0;keys.clear();jumpQueued=false;resetMug(true);telStart();clearFragments();cup.visible=true;liquid.visible=false;stream.visible=false;state='playing';$('intro').hidden=true;$('hud').hidden=false;$('overlay').hidden=true;$('touchControls').hidden=false;document.body.classList.add('playing');goalGuide.hidden=false;document.activeElement?.blur();notify(auto?'Recorrido guiado · cruza la tarja saltando por los trastes':'Baja del fregadero por la silla. Cruza el pasillo y escala las repisas.');}
function home(){telSend();resetMug(true);state='intro';auto=false;keys.clear();clearFragments();player=createPlayer();fill=0;cup.visible=true;liquid.visible=false;stream.visible=false;steam.forEach(s=>s.visible=false);$('intro').hidden=false;$('hud').hidden=true;$('overlay').hidden=true;$('touchControls').hidden=true;document.body.classList.remove('playing');goalGuide.hidden=true;}
function pause(){if(state==='paused'){state=previousState;$('overlay').hidden=true;return;}if(!['playing','dead','serving'].includes(state))return;previousState=state;state='paused';keys.clear();jumpQueued=false;$('resultEyebrow').textContent='UN MOMENTO PARA RESPIRAR';$('resultTitle').textContent='En pausa.';$('resultText').textContent='Tu café puede esperar un momento.';$('resume').innerHTML='Continuar <span>↗</span>';$('overlay').hidden=false;}
function die(reason){state='dead';deaths++;TEL.last=reason;if(reason==='caída'||reason==='caída alta')mug.falls++;if(reason==='hp'){dustBurst(player.x,player.y+.4,player.z,26);shake=.8;}deathTimer=1.15;cup.visible=reason==='agua';notify(reason==='hp'?'¡La taza se rompió! Volvemos al último punto de control.':reason==='caída alta'?'¡Caída demasiado alta! La taza se rompió. Baja usando los muebles.':reason==='caída'?'¡Te caíste fuera de la cocina!':reason==='agua'?'¡La taza se hundió en la tarja! Regresas al último checkpoint.':reason==='lata'?'¡Una lata cayó sobre la taza y la rompió!':'¡Ups! Volvemos al último punto de control.');for(let i=0;i<(reason==='agua'?0:18);i++){const m=mesh(shardGeo,M.green,player.x,Math.max(player.y,.1)+.3,player.z);m.scale.set(.6+Math.random(),.6+Math.random(),.6+Math.random());fragments.push({mesh:m,v:new THREE.Vector3((Math.random()-.5)*4,2+Math.random()*3,(Math.random()-.5)*4)});}}
function win(){state='won';stream.visible=false;$('resultEyebrow').textContent=auto?'RECORRIDO COMPLETADO':'MISIÓN CUMPLIDA';$('resultTitle').textContent='Ahora sí, un café.';$('resultText').textContent=`Llegaste en ${clockText(elapsed)} con ${deaths} ${deaths===1?'ruptura':'rupturas'}. Tu taza está llena. Completaste la oficina.`;$('resume').innerHTML='Continuar a la obra <span>↗</span>';showScore();telSend('fetch','victoria');$('overlay').hidden=false;}
function input(){
 if(auto)return autoInput(player);
 const right=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
 const forward=Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown'));
 const v={...cameraMovement(right,forward,yaw),jump:jumpQueued};jumpQueued=false;if(v.jump)jumpTimes.push(worldTime);return v;
}
function tick(dt){fx(dt);telTick(dt);
 if(['playing','dead','serving','intro'].includes(state))worldTime+=dt;
 if(state==='playing'){
  if(!auto)yaw+=(Number(keys.has('KeyE'))-Number(keys.has('KeyQ')))*dt*1.7;
  elapsed+=dt;const movement=input();
  if(Math.hypot(movement.x,movement.z)>.05){const target=Math.atan2(movement.x,movement.z);heading+=Math.atan2(Math.sin(target-heading),Math.cos(target-heading))*Math.min(1,dt*14);}
  preStep(dt);const result=step(player,movement,dt,worldTime);postStep(result,dt);
  if(result.fallDamage&&!auto&&!result.dead){damage(result.fallDamage,0,0);notify('Caída fuerte: ¡cuidado con la altura! −'+result.fallDamage+' HP');}
  if(player.checkpoint!==lastCheckpoint){lastCheckpoint=player.checkpoint;notify('Punto de control guardado ✓');}
  if(result.dead)die(result.reason);else if(mug.hp<=0)die('hp');else if(result.goal){state='serving';player.x=platforms[GOAL_INDEX].x;player.z=platforms[GOAL_INDEX].z;liquid.visible=true;stream.visible=true;notify('Un momento… preparando tu café');}
 }else if(state==='dead'){
  elapsed+=dt;deathTimer-=dt;
  for(const f of fragments){f.v.y-=12*dt;f.mesh.position.addScaledVector(f.v,dt);f.mesh.rotation.x+=dt*3;f.mesh.rotation.z+=dt*2;if(f.mesh.position.y<-1.5){f.mesh.position.y=-1.5;f.v.y=Math.abs(f.v.y)*.3;}}
  if(deathTimer<=0){clearFragments();player=createPlayer(player.checkpoint);resetMug(false);cup.visible=true;state='playing';keys.clear();jumpQueued=false;}
 }else if(state==='serving'){elapsed+=dt;fill=Math.min(1,fill+dt/2.8);liquid.position.y=.17+fill*.55;const top=GP.y+1.43;const bottom=player.y+liquid.position.y;stream.scale.y=top-bottom;stream.position.y=(top+bottom)/2;if(fill===1)win();}
 if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)$('toast').classList.remove('show');}
}
function supportHeight(x,z,y){
  let best=platforms[FLOOR_INDEX].y;
  for(const p of platforms){if(p.floor||p.y>y+.08)continue;
    if(Math.abs(x-p.x)<=p.w/2+.1&&Math.abs(z-p.z)<=p.d/2+.1)best=Math.max(best,p.y);
  }
  return best;
}
function render(now){requestAnimationFrame(render);const dt=Math.min((now-last)/1000,.05);last=now;
 if(state!=='paused'){accumulator+=dt;while(accumulator>=1/120){tick(1/120);accumulator-=1/120;}}
 const t=now/1000;
 if(drag||keys.has('KeyQ')||keys.has('KeyE'))camHold=2.5;else camHold=Math.max(0,camHold-dt);
 // La cámara no obliga a seguir la curva antigua: exploración libre con Q/E o arrastre.
 cup.position.set(player.x,player.y,player.z);
 if(state==='dead'&&TEL.last==='agua'){
  const sunk=Math.max(0,Math.min(1,(1.15-deathTimer)/1.15));
  cup.position.y=SINK.y-.15-sunk*1.75;
  cup.rotation.z=Math.sin(t*7)*.12;
 }
 if(state==='intro'){cup.position.set(platforms[0].x,platforms[0].y+Math.sin(t*2)*.035,platforms[0].z);cup.rotation.set(0,Math.sin(t*.6)*.18,Math.sin(t*1.7)*.03);}else{cup.rotation.set(player.grounded?0:player.vy*.018,heading,0);}
 const groundY=supportHeight(player.x,player.z,player.y);shadow.position.set(player.x,groundY+.025,player.z);shadow.visible=cup.visible&&state!=='dead';shadow.material.opacity=.18*Math.max(0,1-(player.y-groundY)/3);
 
 const obstacle=obstacleAt(worldTime);rollingPin.position.set(obstacle.x,obstacle.y,obstacle.z);rollingPin.rotation.y=worldTime*.8;
 steam.forEach((s,i)=>{s.visible=fill>.5;if(s.visible){const a=(t*.5+i/7)%1;s.position.set(player.x+Math.sin(t+i)*.12,player.y+.8+a*.8,player.z);s.material.opacity=(1-a)*.25;}});
 if(state==='intro'){
   const mobile=innerWidth<700;desired.set(mobile?4:3,mobile?46:37,mobile?44:34);look.set(0,0,0);
  }else{
   const height=platforms[player.platform].y;
   const horizontal=cameraDistance*Math.cos(pitch);
   desired.set(player.x-Math.sin(yaw)*horizontal,Math.max(player.y,height)+1.1+cameraDistance*Math.sin(pitch),player.z+Math.cos(yaw)*horizontal);
   look.set(player.x+Math.sin(yaw)*1.5,player.y+.8,player.z-Math.cos(yaw)*1.5);
   cameraOrigin.set(player.x,player.y+1.05,player.z);cameraDirection.copy(desired).sub(cameraOrigin);
   const distance=cameraDirection.length();cameraRay.set(cameraOrigin,cameraDirection.normalize());cameraRay.far=distance;
   const hit=cameraRay.intersectObjects(cameraSolids,false)[0];
   if(hit)desired.copy(cameraOrigin).addScaledVector(cameraDirection,Math.max(.6,hit.distance-.25));
 }
 camera.fov=THREE.MathUtils.lerp(camera.fov,state==='intro'?36:60,1-Math.exp(-dt*5));camera.updateProjectionMatrix();
 camera.position.lerp(desired,1-Math.exp(-dt*8));camTarget.lerp(look,1-Math.exp(-dt*4));camera.lookAt(camTarget);if(shake>0){camera.rotation.x+=(Math.random()-.5)*shake*.04;camera.rotation.y+=(Math.random()-.5)*shake*.04;shake=Math.max(0,shake-dt*2.2);}
 $('time').textContent=clockText(elapsed);$('deaths').textContent=deaths;bestProgress=Math.max(bestProgress,[0,18,38,58,78,90][player.checkpointRank]||0);
 $('progress').textContent=`${state==='won'?100:bestProgress}%`;
 const gx=GP.x-player.x,gz=GP.z-player.z,angle=(Math.atan2(gx*Math.cos(yaw)+gz*Math.sin(yaw),gx*Math.sin(yaw)-gz*Math.cos(yaw))+Math.PI*2)%(Math.PI*2);
 goalGuide.textContent=`☕ ${['↑','↗','→','↘','↓','↙','←','↖'][Math.round(angle/(Math.PI/4))%8]}  CAFETERA · ${Math.round(Math.hypot(gx,gz))} u`;
 goalGuide.hidden=state==='intro'||state==='won';
 visuals(t,dt);$('stageLabel').innerHTML=`<span>NIVEL 02 · LA OFICINA</span> ${state==='serving'?`LLENANDO ${Math.round(fill*100)}%`:platforms[player.platform].name.toUpperCase()}`;
 renderer.render(scene,camera);
}
camera.position.set(3,37,34);camTarget.set(0,0,0);requestAnimationFrame(render);
$('play').onclick=()=>start();$('demo').onclick=()=>start(true);$('pause').onclick=pause;$('restart').onclick=()=>start(auto);$('resume').onclick=()=>state==='won'?location.assign(new URL(location.protocol==='file:'?'../obra/index.html':'../obra/',location.href)):pause();$('home').onclick=home;
$('help').onclick=()=>{if(['playing','dead','serving'].includes(state))pause();$('helpDialog').showModal();};$('closeHelp').onclick=()=>$('helpDialog').close();
const movement=new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyQ','KeyE']);
addEventListener('keydown',e=>{if($('helpDialog').open||e.target instanceof HTMLButtonElement&&['Space','Enter'].includes(e.code))return;if(movement.has(e.code)){if(state==='intro')return;e.preventDefault();keys.add(e.code);if(e.code==='Space'&&!e.repeat)jumpQueued=true;}if(!e.repeat){if(e.code==='KeyC'){yaw=Math.PI/2;pitch=.48;}if(e.code==='KeyP'||e.code==='Escape')pause();if(e.code==='KeyR'&&state!=='intro')start(auto);}});
addEventListener('keyup',e=>keys.delete(e.code));
addEventListener('blur',()=>{keys.clear();jumpQueued=false;if(['playing','dead','serving'].includes(state))pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&['playing','dead','serving'].includes(state))pause();});
for(const button of document.querySelectorAll('[data-key]')){button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);keys.add(button.dataset.key);if(button.dataset.key==='Space')jumpQueued=true;});for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,()=>keys.delete(button.dataset.key));}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();if(['playing','dead','serving'].includes(state))pause();$('loadError').textContent='La conexión gráfica se interrumpió. Recarga la página para continuar.';$('loadError').hidden=false;});

// Arrastre libre: ratón o un dedo sobre la escena. No requiere capturar el cursor.
let drag=null;
renderer.domElement.style.touchAction='none';
renderer.domElement.addEventListener('pointerdown',e=>{if(state!=='playing'||auto)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId);});
renderer.domElement.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId||state!=='playing')return;yaw-=(e.clientX-drag.x)*.006;pitch=THREE.MathUtils.clamp(pitch+(e.clientY-drag.y)*.004,.2,1.05);drag.x=e.clientX;drag.y=e.clientY;});
for(const event of ['pointerup','pointercancel','lostpointercapture'])renderer.domElement.addEventListener(event,()=>drag=null);
renderer.domElement.addEventListener('wheel',e=>{if(state!=='playing')return;e.preventDefault();cameraDistance=THREE.MathUtils.clamp(cameraDistance+e.deltaY*.004,3.5,9);},{passive:false});

function nextLevel(){location.href=new URL(location.protocol==='file:'?'../oficina/index.html':'../oficina/',location.href).href;}

if(new URLSearchParams(location.search).get('test')==='1')window.__coffee={get state(){return state},get player(){return player},get mug(){return mug},get time(){return worldTime},get camera(){return camera},get scene(){return scene},start,tick,win,pause,get telemetry(){return TEL}};
