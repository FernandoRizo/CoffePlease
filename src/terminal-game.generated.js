import * as THREE from './vendor/three.module.js';
import {platforms,createPlayer,step,obstacleAt,cameraMovement,autoInput,GOAL_INDEX,FLOOR_INDEX,FLOOR_PUDDLE,FLOOR_CRUMBS,CONVEYORS,SUITCASES,CURTAINS,PUSHERS,ANT_SPAWNS,suitcaseAt,curtainAt} from './physics.js';

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
// Coffee Please — Nivel 06 «Terminal internacional: zona de comidas y filtro de seguridad».
// Fragmento de escena incorporado por build-airport.js dentro del motor compartido (src/game.js).
// Todo lo que se mueve consulta las mismas funciones deterministas que la colisión (suitcaseAt, curtainAt).
scene.background=new THREE.Color('#cfe2ee');scene.fog=new THREE.Fog('#cfe2ee',62,125);
const SINK=platforms[0],ST=platforms[0],GP=platforms[GOAL_INDEX];
const floorM=mat('#d9dee1',.14,.18),lineM=mat('#bcc5ca',.3,.1),wallM=mat('#eef1f2'),steel=mat('#98a5ac',.3,.7),darkSteel=mat('#4b565c',.4,.6),
 creamM=mat('#ebe3d2'),woodT=mat('#bb8c60'),woodD=mat('#7a5236'),redM=mat('#c4472f'),yellowM=mat('#f2b632'),blueM=mat('#3f78a8'),tealM=mat('#4d9a94'),
 rubberM=mat('#2b3236',.85),skyM=new THREE.MeshBasicMaterial({color:'#bfe1f3'}),planeM=mat('#f4f6f7',.35,.2),
 glassT=new THREE.MeshBasicMaterial({color:'#7fd5e6',transparent:true,opacity:.2,depthWrite:false,side:THREE.DoubleSide});
// ── Sala: suelo pulido (mortal), ventanal con aviones y zócalos bajos ──
box(48,.3,24,floorM,0,-.15,0);
for(let x=-21.6;x<24;x+=2.4){box(.05,.012,24,lineM,x,.006,0).castShadow=false;}
for(let z=-9.6;z<12;z+=2.4){box(48,.012,.05,lineM,0,.006,z).castShadow=false;}
for(let x=-22;x<24;x+=4)for(const z of [-11.3,11.3]){const s=box(2.2,.012,.5,yellowM,x,.008,z);s.castShadow=false;}
box(48,10,.3,wallM,0,5,-12.15);
box(.3,.9,24,creamM,-24,.45,0);box(.3,.9,24,creamM,24,.45,0);
{const g=new THREE.Group();scene.add(g);
 for(let k=0;k<7;k++){box(6.2,5.4,.08,skyM,-18+k*6,5.4,-11.96,g);box(.18,5.6,.14,steel,-21+k*6,5.4,-11.9,g);}
 box(48,.2,.16,steel,0,2.65,-11.9,g);box(48,.2,.16,steel,0,8.1,-11.9,g);
 for(const [px,pz,sc] of [[-8,-17,1],[15,-19,1.15]]){
  const a=new THREE.Group();a.position.set(px,4.3,pz);a.scale.setScalar(sc);g.add(a);
  const f=cylinder(1.3,1.3,15,planeM,0,0,0,a);f.rotation.z=Math.PI/2;
  const nose=mesh(new THREE.SphereGeometry(1.3,20,14),planeM,7.5,0,0,a);nose.scale.set(1.4,1,1);
  box(3,.22,10.5,planeM,.5,-.35,0,a);box(2.2,.2,4.2,planeM,-6.6,.1,0,a);box(2.4,3,.2,blueM,-6.8,1.8,0,a);
  for(const z of [-2.8,2.8]){const e=cylinder(.55,.55,2,steel,1.6,-1.1,z,a);e.rotation.z=Math.PI/2;}
  for(let w=0;w<8;w++)mesh(new THREE.SphereGeometry(.13,8,6),skyM,5.3-w*1.2,.45,1.3,a);
 }
 const board=box(9,2.6,.2,mat('#1c2830'),-6,7,-11.7,g);
 for(let r=0;r<4;r++)box(7.6,.12,.05,r%2?yellowM:mat('#7fd5e6'),-6,7.75-r*.5,-11.58,g);
}
label('SALIDAS · DEPARTURES',-6,8.6,-11.5,5.4,'#1c4a5a');
// Sillas de la plaza al fondo (InstancedMesh: mobiliario repetitivo en una sola llamada de dibujo).
{const seatsP=[],backsP=[];for(let r=0;r<2;r++)for(let k=0;k<14;k++){const x=-21.5+k*1.6+(r?.8:0),z=-8.6-r*1.7;seatsP.push([x,.55,z,0,.9,.1,.9]);backsP.push([x,1.05,z-.4,0,.9,.9,.12]);}
 const sg=new THREE.BoxGeometry(1,1,1);
 for(const list of [seatsP,backsP]){const im=new THREE.InstancedMesh(sg,list===seatsP?redM:darkSteel,list.length),d=new THREE.Object3D();
  list.forEach((it,i)=>{d.position.set(it[0],it[1],it[2]);d.scale.set(it[4],it[5],it[6]);d.updateMatrix();im.setMatrixAt(i,d.matrix);});
  im.castShadow=true;im.receiveShadow=true;scene.add(im);}
 const legs=new THREE.InstancedMesh(new THREE.CylinderGeometry(.06,.06,.5,8),steel,28),d2=new THREE.Object3D();
 seatsP.forEach((it,i)=>{d2.position.set(it[0],.25,it[2]);d2.updateMatrix();legs.setMatrixAt(i,d2.matrix);});scene.add(legs);}
// ── Plataformas: cada tipo coincide con su volumen de colisión ──
const terminalBelts=[],terminalSuitcases=[],terminalCurtains=[];
function beltTexture(w){const c=document.createElement('canvas');c.width=64;c.height=64;const g=c.getContext('2d');
 g.fillStyle='#363c41';g.fillRect(0,0,64,64);g.fillStyle='#4a5258';g.fillRect(0,0,30,64);g.fillStyle='#21262a';g.fillRect(30,0,4,64);g.fillStyle='#f2b632';g.fillRect(0,0,64,3);g.fillRect(0,61,64,3);
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.repeat.set(w,1);return t;}
function counterBlock(q,topM,baseM){box(q.w-.06,q.y-.2,q.d-.06,baseM,q.x,(q.y-.2)/2,q.z);box(q.w+.08,.2,q.d+.08,topM,q.x,q.y-.1,q.z);}
function pedestal(q,m){cylinder(.16,.2,q.y-.2,m,q.x,(q.y-.2)/2,q.z);cylinder(Math.min(q.w,q.d)*.38,Math.min(q.w,q.d)*.42,.1,m,q.x,.05,q.z);}
for(let i=0;i<platforms.length;i++){
 const q=platforms[i];if(q.floor)continue;
 if(q.kind==='counter'||q.kind==='goal'){counterBlock(q,i===5?woodT:steel,q.kind==='goal'?mat('#2c4a42'):creamM);
  box(q.w-.2,.9,.06,glassT,q.x,q.y-.7,q.z+q.d/2-.02);}
 else if(q.kind==='stool'){box(q.w,.22,q.d,redM,q.x,q.y-.11,q.z);pedestal(q,steel);}
 else if(q.kind==='table'){box(q.w,.16,q.d,i===8?steel:woodT,q.x,q.y-.08,q.z);box(q.w+.06,.05,q.d+.06,i===8?darkSteel:woodD,q.x,q.y-.17,q.z);pedestal(q,darkSteel);}
 else if(q.kind==='longtable'){box(q.w,.18,q.d,woodT,q.x,q.y-.09,q.z);
  for(const sx of [-1,1])for(const sz of [-1,1])box(.18,q.y-.18,.18,woodD,q.x+sx*(q.w/2-.3),(q.y-.18)/2,q.z+sz*(q.d/2-.25));
  box(q.w-.5,.12,.12,woodD,q.x,.5,q.z);}
 else if(q.kind==='cart'){box(q.w,.14,q.d,steel,q.x,q.y-.07,q.z);box(q.w-.2,.1,q.d-.2,steel,q.x,q.y*.5,q.z);
  for(const sx of [-1,1])for(const sz of [-1,1]){cylinder(.05,.05,q.y,darkSteel,q.x+sx*(q.w/2-.1),q.y/2,q.z+sz*(q.d/2-.1));const w=cylinder(.2,.2,.12,rubberM,q.x+sx*(q.w/2-.1),.2,q.z+sz*(q.d/2-.1));w.rotation.x=Math.PI/2;}
  const h=cylinder(.04,.04,q.w,darkSteel,q.x,q.y+.55,q.z-q.d/2+.1);h.rotation.z=Math.PI/2;
  for(const sx of [-1,1])cylinder(.04,.04,.55,darkSteel,q.x+sx*(q.w/2-.1),q.y+.27,q.z-q.d/2+.1);}
 else if(q.kind==='manual'){counterBlock(q,steel,darkSteel);for(let k=0;k<3;k++)box(.7,.2,.5,k%2?blueM:redM,q.x-.7+k*.7,q.y+.1,q.z-.5);
  box(.9,.04,.6,creamM,q.x,q.y+.02,q.z+.6);label('REVISIÓN MANUAL',q.x,q.y+1.4,q.z-1.4,2.2,'#2f4f5c');}
 else if(q.kind==='conveyor'){
  const v=q.conv.vx,tex=beltTexture(q.w);
  const top=new THREE.Mesh(new THREE.PlaneGeometry(q.w,q.d),new THREE.MeshStandardMaterial({map:tex,roughness:.85}));
  top.rotation.x=-Math.PI/2;top.position.set(q.x,q.y+.012,q.z);top.receiveShadow=true;scene.add(top);
  box(q.w,.26,q.d,darkSteel,q.x,q.y-.14,q.z);
  for(const sz of [-1,1])box(q.w+.1,.2,.12,steel,q.x,q.y-.04,q.z+sz*(q.d/2+.04));
  for(const sx of [-1,1]){const r=cylinder(.18,.18,q.d,rubberM,q.x+sx*q.w/2,q.y-.14,q.z);r.rotation.x=Math.PI/2;for(const sz of [-1,1])box(.14,q.y-.3,.14,darkSteel,q.x+sx*(q.w/2-.3),(q.y-.3)/2,q.z+sz*(q.d/2-.15));}
  label(v>0?'CINTA A ▶▶▶':'◀◀◀ CINTA B',q.x,q.y+1.1,q.z-q.d/2-.5,2.6,v>0?'#2b5a7a':'#8a3a28');
  terminalBelts.push({tex,vx:v});
 }
}
// ── Escáner de rayos X sobre la cinta A: túnel translúcido y cortinas de plomo pendulares ──
const beltA=platforms[7];
{const g=new THREE.Group();scene.add(g);
 const x0=beltA.x,w=beltA.w+.4,H=2.2;
 for(const sz of [-1,1]){box(w,H,.08,glassT,x0,beltA.y+H/2,beltA.z+sz*(beltA.d/2+.1),g);for(const sx of [-1,1])box(.18,H+.2,.18,darkSteel,x0+sx*w/2,beltA.y+H/2,beltA.z+sz*(beltA.d/2+.1),g);}
 box(w,.06,beltA.d+.4,glassT,x0,beltA.y+H,beltA.z,g);
 for(const sx of [-1,1])box(.12,.12,beltA.d+.5,darkSteel,x0+sx*w/2,beltA.y+H+.05,beltA.z,g);
 const rod=cylinder(.04,.04,beltA.d,steel,x0,beltA.y+1.3,beltA.z,g);rod.rotation.x=Math.PI/2;
 box(1.6,.5,.06,mat('#1c2830'),x0,beltA.y+H+.4,beltA.z-beltA.d/2-.2,g);
}
for(let k=0;k<CURTAINS.length;k++){
 const c=CURTAINS[k],q=platforms[c.i],g=new THREE.Group();scene.add(g);const dd=q.d-.2;
 cylinder(.07,.07,dd,steel,0,0,0,g).rotation.x=Math.PI/2;
 for(let s=0;s<6;s++){box(c.w,c.h,dd/6-.05,mat('#3d464c',.8),0,-c.h/2,-dd/2+dd/12+s*dd/6,g);}
 for(let s=0;s<6;s++)box(c.w+.02,.12,dd/6-.05,s%2?yellowM:rubberM,0,-c.h+.06,-dd/2+dd/12+s*dd/6,g);
 terminalCurtains.push({g});
}
// ── Maletas rígidas sobre la cinta B (siguen suitcaseAt, como la colisión) ──
const suitColors=['#d1493a','#2f6fa3','#3e9a6c','#e0a928'];
for(let i=0;i<SUITCASES.length;i++){
 const S=SUITCASES[i],g=new THREE.Group(),m=mat(suitColors[(i*2+1)%4],.45,.1);scene.add(g);
 box(S.w,S.h*.9,S.d,m,0,S.h*.5+.04,0,g);
 box(S.w+.04,.07,S.d+.04,darkSteel,0,S.h*.55,0,g);
 box(.5,.06,.06,darkSteel,0,S.h+.08,0,g);
 for(const sx of [-1,1])box(.05,.14,.05,darkSteel,sx*.22,S.h+.02,0,g);
 for(const sx of [-1,1])for(const sz of [-1,1])cylinder(.07,.07,.06,rubberM,sx*(S.w/2-.14),.07,sz*(S.d/2-.14),g).rotation.x=Math.PI/2;
 terminalSuitcases.push({g});
}
// ── Pan dulce, bandejas, migas y grietas de hormigas ──
for(let k=0;k<5;k++){const q=platforms[5],x=q.x-1.4+k*.7;
 mesh(new THREE.SphereGeometry(.2,12,8),mat(k%2?'#c98a4b':'#e1b274'),x,q.y+.16,q.z+.9).scale.set(1.3,.7,1);}
label('PAN DULCE',platforms[5].x,platforms[5].y+1.2,platforms[5].z-1.7,2.2,'#7a4a24');
for(const [i,ox,oz] of [[2,-.6,-.6],[2,.5,.7],[3,-1.2,.2],[3,1.4,-.3]]){const q=platforms[i];
 box(.34,.04,.26,mat('#e9d9bc'),q.x+ox,q.y+.02,q.z+oz);cylinder(.1,.08,.18,redM,q.x+ox+.2,q.y+.1,q.z+oz-.2);}
for(let k=0;k<9;k++){const a=ANT_SPAWNS[k%2],q=platforms[a.pi];box(.07,.025,.07,mat('#c98a4b'),q.x+a.ox+Math.cos(k*2.4)*.35,q.y+.02,q.z+a.oz+Math.sin(k*2.4)*.35);}
label('PLAZA DE COMIDAS',-14,6.6,-11.6,6.4,'#6a3b24');
label('INICIO · BAJA AQUÍ',platforms[0].x,platforms[0].y+1.3,platforms[0].z,3.4,'#2f4f5c');
label('¡EL SUELO ES LA DERROTA!',-9,.4,6.5,5,'#a8402a');
label('FILTRO DE SEGURIDAD',9.7,6.6,-11.6,6.4,'#2b5a7a');
label('CORTINAS DE PLOMO',5.5,5.4,-3.4,2.8,'#8a3a28');
label('SALTA LAS MALETAS',14.3,5.1,-3.4,3,'#8a3a28');
// ── Cafetería exprés de la meta ──
box(1.9,2.17,.73,M.dark,GP.x,GP.y+1.08,GP.z-1.03);
box(2,.4,1.62,M.green,GP.x,GP.y+2.19,GP.z-.62);
box(.83,.26,.35,M.metal,GP.x,GP.y+1.68,GP.z-.23);cylinder(.065,.065,.3,M.metal,GP.x,GP.y+1.48,GP.z-.1);
const plate=cylinder(.71,.73,.07,M.metal,GP.x,GP.y+.04,GP.z);
const stream=cylinder(.04,.06,.5,M.coffee,GP.x,GP.y+1,GP.z);stream.visible=false;
label('CAFETERÍA · META',GP.x,GP.y+3.0,GP.z,3.4,'#2c4a42');
const heat={material:{opacity:0}};                         // contrato con el render del motor compartido
const rollingPin=new THREE.Group();scene.add(rollingPin);  // sin uso en este nivel
// ── Animación y peligros (llamados desde el motor) ──
function terminalFx(dt){
 for(const b of terminalBelts)b.tex.offset.x-=b.vx*dt;
 for(let i=0;i<terminalSuitcases.length;i++){const s=suitcaseAt(worldTime,i),g=terminalSuitcases[i].g;
  g.position.set(s.x,s.y,s.z);g.scale.setScalar(Math.max(.01,s.alpha));g.visible=s.alpha>.03;}
 for(let k=0;k<terminalCurtains.length;k++){const c=curtainAt(worldTime,k),g=terminalCurtains[k].g;
  g.position.set(c.x,c.y+.05+c.h,c.z);g.rotation.z=-c.vx*.09;}
}
let terminalHintUntil=0;
function terminalHazards(res,dt){
 if(auto)return;
 if(res.suitcase?.hit&&mug.inv<=0){const s=res.suitcase;damage(s.damage,s.kx,s.kz);notify('¡Maleta! −'+s.damage+' HP · salta por encima o rodéala');}
 else if(res.curtain?.hit&&mug.inv<=0){const c=res.curtain;damage(c.damage,c.kx,c.kz);notify('¡Cortina de plomo! −'+c.damage+' HP');}
 if(res.conveyor&&worldTime>terminalHintUntil){notify('Cinta transportadora: te arrastra. Salta antes del borde.');terminalHintUntil=worldTime+4;}
}
function terminalSpawnEnemies(){
 for(const e of PUSHERS)makeRoach(e.pi,e.pts);
 for(const a of ANT_SPAWNS){const q=platforms[a.pi],x=q.x+a.ox,z=q.z+a.oz;box(.3,.012,.05,M.black,x,q.y+.012,z).rotation.y=.6;spawners.push({pi:a.pi,x,z,cd:2});}
}

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
const goalL=new THREE.PointLight('#ffe8c6',22,9,2);goalL.position.set(GP.x,GP.y+2,GP.z);scene.add(goalL);
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
function spinHit(){for(const s of spinners){if(player.y>s.y+.55)continue;const rx=player.x-s.x,rz=player.z-s.z;
 for(let i=0;i<4;i++){const a=s.arm.rotation.y+i*Math.PI/2,dx=Math.cos(a),dz=-Math.sin(a),t=clamp(rx*dx+rz*dz,0,1.1);
  if(Math.hypot(dx*t-rx,dz*t-rz)<.32){const l=Math.hypot(rx,rz)||1;damage(22,rx/l*4,rz/l*4);break;}}}}
function fxExtra(dt){terminalFx(dt);}
terminalSpawnEnemies();
function roach(r,dt){
 const p=platforms[r.pi],near=player.platform===r.pi&&Math.hypot(player.x-r.x,player.z-r.z)<5;let tx,tz,sp=1.5;r.cool=Math.max(0,r.cool-dt);
 if(r.st==='PATROL'){[tx,tz]=r.pts[r.wp];if(Math.hypot(tx-r.x,tz-r.z)<.12)r.wp=(r.wp+1)%r.pts.length;if(near&&!r.cool){r.st='ALERT';r.t=.3;beep(520);}}
 else if(r.st==='ALERT'){tx=player.x;tz=player.z;sp=0;if((r.t-=dt)<=0){r.st='CHARGE';r.t=1.6;}}
 else{tx=player.x+pvx*.25;tz=player.z+pvz*.25;sp=5.5;if((r.t-=dt)<=0||!near){r.st='PATROL';r.cool=1.5;}}
 const ux=tx-r.x,uz=tz-r.z,l=Math.hypot(ux,uz)||1;r.hx=ux/l;r.hz=uz/l;
 r.x=clamp(r.x+r.hx*sp*dt,p.x-p.w/2+.1,p.x+p.w/2-.1);r.z=clamp(r.z+r.hz*sp*dt,p.z-p.d/2+.1,p.z+p.d/2-.1);
 r.g.position.set(r.x,p.y+.1,r.z);r.g.rotation.y=Math.atan2(r.hx,r.hz);animRoach(r,dt,sp);
 if(r.st==='CHARGE'&&player.y<p.y+.4&&Math.hypot(player.x-r.x,player.z-r.z)<.5){
  const q=platforms[player.platform],ox=player.x-q.x,oz=player.z-q.z,eg=Math.abs(ox)/q.w>Math.abs(oz)/q.d?[Math.sign(ox)||1,0]:[0,Math.sign(oz)||1];
  const ix=r.hx*.5+eg[0]*.5,iz=r.hz*.5+eg[1]*.5,il=Math.hypot(ix,iz)||1,I=ROACHM/(ROACHM+CUPM)*5.5*1.3;
  player.kx=ix/il*I;player.kz=iz/il*I;player.kt=.3;shake=.5;beep(160);r.st='PATROL';r.cool=2.2;}
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
 if(false){dropT=.7+rnd()*1.1;const m=new THREE.Mesh(dropG,dropM);m.scale.y=1.5;m.position.set(SINK.x+(rnd()-.5)*.2,4.10,SINK.z-.27);scene.add(m);drops.push({m,vy:0});}
 if(auto)return;
 for(const r of roaches)roach(r,dt);spinHit();
 for(const s of spawners){if(player.platform!==s.pi)continue;s.cd-=dt;if(s.cd<=0){s.cd=5;for(let i=0,n=3+Math.floor(rnd()*3);i<n&&ants.length+att.length<10;i++){const m=makeAnt();m.position.set(s.x,platforms[s.pi].y+.05,s.z);scene.add(m);ants.push({m,pi:s.pi});}}}
 for(let i=ants.length-1;i>=0;i--){const a=ants[i],p=a.m.position,dx=player.x-p.x,dz=player.z-p.z,d=Math.hypot(dx,dz)||1;
  if(player.platform!==a.pi){scene.remove(a.m);ants.splice(i,1);continue;}
  p.x+=dx/d*1.3*dt;p.z+=dz/d*1.3*dt;a.m.rotation.y=Math.atan2(dx,dz);
  if(d<.5&&player.y<platforms[a.pi].y+.3&&att.length<10){scene.remove(a.m);ants.splice(i,1);cup.add(a.m);att.push({m:a.m,a:rnd()*6.28,s:(rnd()-.5)*2,p:rnd()*6,h:.3});notify('¡Hormigas! Salta varias veces o gira bruscamente para sacudirlas');}}
 jumpTimes=jumpTimes.filter(x=>worldTime-x<1);
 if(att.length&&shakeCd<=0&&(jumpTimes.length>=3||turnAcc>5.5)){for(let i=0,n=Math.max(1,Math.ceil(att.length*.3));i<n;i++)cup.remove(att.pop().m);jumpTimes=[];turnAcc=0;shakeCd=.4;shake=.3;dustBurst(player.x,player.y+.5,player.z,4);}
 player.speedMul=(1-att.length*.05)*(1-mug.dil*.0015);
 if(player.platform===FLOOR_INDEX&&Math.hypot(player.x-FLOOR_PUDDLE.x,player.z-FLOOR_PUDDLE.z)<FLOOR_PUDDLE.r)player.speedMul*=.7;
}
function postStep(res,dt){
 if(player.kt>0)player.kt-=dt;else if(player.kx||player.kz){const f=Math.exp(-dt*9);player.kx*=f;player.kz*=f;}
 if(auto)return;
 if(att.length){mug.hp=Math.max(0,mug.hp-att.length*.5*dt);mug.dirty=Math.min(100,mug.dirty+att.length*1.5*dt);}
 if(player.grounded&&player.platform===FLOOR_INDEX){
   if(Math.hypot(player.x-FLOOR_PUDDLE.x,player.z-FLOOR_PUDDLE.z)<FLOOR_PUDDLE.r)mug.dil=Math.min(100,mug.dil+3*dt);
   if(Math.hypot(player.x-FLOOR_CRUMBS.x,player.z-FLOOR_CRUMBS.z)<FLOOR_CRUMBS.r)mug.dirty=Math.min(100,mug.dirty+4*dt);
 }
 terminalHazards(res,dt);
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
const TEL={url:(window.TELEMETRY_URL||(location.protocol.startsWith('http')?location.origin:'http://localhost:3000'))+'/api/partidas',level:'terminal-06-seguridad',pts:[],acc:0,sid:'',sent:true,last:'',who:null};
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
function start(isAuto=false){telSend();auto=isAuto;yaw=Math.PI/2;pitch=.48;heading=Math.PI/2;worldTime=0;terminalHintUntil=0;player=createPlayer();player.demo=isAuto;deaths=0;elapsed=0;fill=0;deathTimer=0;lastCheckpoint=0;bestProgress=0;accumulator=0;keys.clear();jumpQueued=false;resetMug(true);telStart();clearFragments();cup.visible=true;liquid.visible=false;stream.visible=false;state='playing';$('intro').hidden=true;$('hud').hidden=false;$('overlay').hidden=true;$('touchControls').hidden=false;document.body.classList.add('playing');goalGuide.hidden=false;document.activeElement?.blur();notify(auto?'Recorrido guiado · plaza de comidas → escáner → cafetería exprés':'Cruza la plaza de comidas y el filtro de seguridad. ¡El suelo es la derrota!');}
function home(){telSend();resetMug(true);state='intro';auto=false;keys.clear();clearFragments();player=createPlayer();fill=0;cup.visible=true;liquid.visible=false;stream.visible=false;steam.forEach(s=>s.visible=false);$('intro').hidden=false;$('hud').hidden=true;$('overlay').hidden=true;$('touchControls').hidden=true;document.body.classList.remove('playing');goalGuide.hidden=true;}
function pause(){if(state==='paused'){state=previousState;$('overlay').hidden=true;return;}if(!['playing','dead','serving'].includes(state))return;previousState=state;state='paused';keys.clear();jumpQueued=false;$('resultEyebrow').textContent='UN MOMENTO PARA RESPIRAR';$('resultTitle').textContent='En pausa.';$('resultText').textContent='Tu café puede esperar un momento.';$('resume').innerHTML='Continuar <span>↗</span>';$('overlay').hidden=false;}
function die(reason){state='dead';deaths++;TEL.last=reason;if(reason==='caída'||reason==='caída alta')mug.falls++;if(reason==='hp'){dustBurst(player.x,player.y+.4,player.z,26);shake=.8;}deathTimer=1.15;cup.visible=reason==='agua';notify(reason==='hp'?'¡La taza se rompió! Volvemos al último punto de control.':reason==='caída alta'?'¡Caída demasiado alta! La taza se rompió. Baja usando los muebles.':reason==='caída'?'¡Caíste al suelo pulido de la terminal! Derrota instantánea.':reason==='agua'?'¡La taza se hundió en la tarja! Regresas al último checkpoint.':reason==='lata'?'¡Una lata cayó sobre la taza y la rompió!':'¡Ups! Volvemos al último punto de control.');for(let i=0;i<(reason==='agua'?0:18);i++){const m=mesh(shardGeo,M.green,player.x,Math.max(player.y,.1)+.3,player.z);m.scale.set(.6+Math.random(),.6+Math.random(),.6+Math.random());fragments.push({mesh:m,v:new THREE.Vector3((Math.random()-.5)*4,2+Math.random()*3,(Math.random()-.5)*4)});}}
function win(){state='won';stream.visible=false;$('resultEyebrow').textContent=auto?'RECORRIDO COMPLETADO':'MISIÓN CUMPLIDA';$('resultTitle').textContent='Ahora sí, un café.';$('resultText').textContent=`Llegaste en ${clockText(elapsed)} con ${deaths} ${deaths===1?'ruptura':'rupturas'}. ¡Superaste la plaza de comidas y el filtro de seguridad!`;$('resume').innerHTML='Continuar al embarque <span>↗</span>';showScore();telSend('fetch','victoria');$('overlay').hidden=false;}
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
 
 
 steam.forEach((s,i)=>{s.visible=fill>.5;if(s.visible){const a=(t*.5+i/7)%1;s.position.set(player.x+Math.sin(t+i)*.12,player.y+.8+a*.8,player.z);s.material.opacity=(1-a)*.25;}});
 if(state==='intro'){
   const mobile=innerWidth<700;desired.set(mobile?4:3,mobile?54:43,mobile?52:41);look.set(0,1,0);
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
 visuals(t,dt);$('stageLabel').innerHTML=`<span>NIVEL 06 · TERMINAL · COMIDAS Y SEGURIDAD</span> ${state==='serving'?`LLENANDO ${Math.round(fill*100)}%`:platforms[player.platform].name.toUpperCase()}`;
 renderer.render(scene,camera);
}
camera.position.set(3,43,41);camTarget.set(0,1,0);requestAnimationFrame(render);
$('play').onclick=()=>start();$('demo').onclick=()=>start(true);$('pause').onclick=pause;$('restart').onclick=()=>start(auto);$('resume').onclick=()=>state==='won'?nextLevel():pause();$('home').onclick=home;
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

function nextLevel(){location.href=new URL(location.protocol==='file:'?'../embarque/index.html':'../embarque/',location.href).href;}

if(new URLSearchParams(location.search).get('test')==='1')window.__coffee={get state(){return state},get player(){return player},get mug(){return mug},get time(){return worldTime},get camera(){return camera},get scene(){return scene},start,tick,win,pause,get telemetry(){return TEL},get attached(){return att},get drops(){return drops}};
