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
