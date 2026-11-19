// Coffee Please — Nivel 07 «Terminal internacional: pasillo de bebederos y sala de embarque VIP».
// Fragmento de escena incorporado por build-airport.js dentro del motor compartido (src/game.js).
// Goteras, chorros de aire y maletas rodantes usan las mismas funciones que la colisión (DRIPS, AIR_JETS, suitcaseAt).
scene.background=new THREE.Color('#d6e0ea');scene.fog=new THREE.Fog('#d6e0ea',62,125);
const SINK=platforms[0],ST=platforms[0],GP=platforms[GOAL_INDEX];
const floorM=mat('#dadfe2',.13,.2),lineM=mat('#bcc5ca',.3,.1),wallM=mat('#eef1f2'),steel=mat('#98a5ac',.3,.7),darkSteel=mat('#4b565c',.4,.6),
 creamM=mat('#ebe3d2'),woodT=mat('#6b4630'),woodD=mat('#43291c'),goldM=mat('#d6b06a',.3,.65),redM=mat('#c4472f'),yellowM=mat('#f2b632'),blueM=mat('#3a6fa0'),
 rubberM=mat('#2b3236',.85),skyM=new THREE.MeshBasicMaterial({color:'#c3e3f4'}),planeM=mat('#f4f6f7',.35,.2),
 glassT=new THREE.MeshBasicMaterial({color:'#7fd5e6',transparent:true,opacity:.2,depthWrite:false,side:THREE.DoubleSide}),
 jetM=new THREE.MeshBasicMaterial({color:'#aee8f2',transparent:true,opacity:.14,depthWrite:false}),
 streakM=new THREE.MeshBasicMaterial({color:'#e9fbff',transparent:true,opacity:.55,depthWrite:false});
// ── Sala: suelo pulido (mortal), ventanal con aviones ──
box(48,.3,24,floorM,0,-.15,0);
for(let x=-21.6;x<24;x+=2.4){box(.05,.012,24,lineM,x,.006,0).castShadow=false;}
for(let z=-9.6;z<12;z+=2.4){box(48,.012,.05,lineM,0,.006,z).castShadow=false;}
for(let x=-22;x<24;x+=4)for(const z of [-11.3,11.3]){const s=box(2.2,.012,.5,yellowM,x,.008,z);s.castShadow=false;}
box(48,10,.3,wallM,0,5,-12.15);
box(.3,.9,24,creamM,-24,.45,0);box(.3,.9,24,creamM,24,.45,0);
{const g=new THREE.Group();scene.add(g);
 for(let k=0;k<7;k++){box(6.2,5.4,.08,skyM,-18+k*6,5.4,-11.96,g);box(.18,5.6,.14,steel,-21+k*6,5.4,-11.9,g);}
 box(48,.2,.16,steel,0,2.65,-11.9,g);box(48,.2,.16,steel,0,8.1,-11.9,g);
 for(const [px,pz,sc] of [[-12,-18,1.1],[10,-17,1]]){
  const a=new THREE.Group();a.position.set(px,4.3,pz);a.scale.setScalar(sc);g.add(a);
  const f=cylinder(1.3,1.3,15,planeM,0,0,0,a);f.rotation.z=Math.PI/2;
  const nose=mesh(new THREE.SphereGeometry(1.3,20,14),planeM,7.5,0,0,a);nose.scale.set(1.4,1,1);
  box(3,.22,10.5,planeM,.5,-.35,0,a);box(2.2,.2,4.2,planeM,-6.6,.1,0,a);box(2.4,3,.2,redM,-6.8,1.8,0,a);
  for(const z of [-2.8,2.8]){const e=cylinder(.55,.55,2,steel,1.6,-1.1,z,a);e.rotation.z=Math.PI/2;}
  for(let w=0;w<8;w++)mesh(new THREE.SphereGeometry(.13,8,6),skyM,5.3-w*1.2,.45,1.3,a);
 }
 box(9,2.6,.2,mat('#1c2830'),12,7,-11.7,g);
 for(let r=0;r<4;r++)box(7.6,.12,.05,r%2?yellowM:mat('#7fd5e6'),12,7.75-r*.5,-11.58,g);
}
label('EMBARQUE · GATE 7 VIP',12,8.6,-11.5,5.4,'#1c4a5a');
// Asientos de embarque al fondo (InstancedMesh: una sola llamada de dibujo para todas las filas).
{const seatsP=[],backsP=[];for(let r=0;r<2;r++)for(let k=0;k<12;k++){const x=1+k*1.6+(r?.8:0),z=-8.8-r*1.7;seatsP.push([x,.55,z,0,.9,.1,.9]);backsP.push([x,1.05,z-.4,0,.9,.9,.12]);}
 const sg=new THREE.BoxGeometry(1,1,1);
 for(const list of [seatsP,backsP]){const im=new THREE.InstancedMesh(sg,list===seatsP?blueM:darkSteel,list.length),d=new THREE.Object3D();
  list.forEach((it,i)=>{d.position.set(it[0],it[1],it[2]);d.scale.set(it[4],it[5],it[6]);d.updateMatrix();im.setMatrixAt(i,d.matrix);});
  im.castShadow=true;im.receiveShadow=true;scene.add(im);}
 const legs=new THREE.InstancedMesh(new THREE.CylinderGeometry(.06,.06,.5,8),steel,24),d2=new THREE.Object3D();
 seatsP.forEach((it,i)=>{d2.position.set(it[0],.25,it[2]);d2.updateMatrix();legs.setMatrixAt(i,d2.matrix);});scene.add(legs);
 const colors=['#d1493a','#2f6fa3','#3e9a6c','#e0a928'];
 for(let k=0;k<10;k++){const m=mat(colors[k%4],.5,.1);box(.9,.7+(k%3)*.15,.55,m,-20+k*1.25,.4+(k%3)*.08,-9.6-(k%2)*.7);}}
// ── Plataformas: cada tipo coincide con su volumen de colisión ──
const embarqueSuitcases=[],embarqueJets=[];
function counterBlock(q,topM,baseM){box(q.w-.06,q.y-.2,q.d-.06,baseM,q.x,(q.y-.2)/2,q.z);box(q.w+.08,.2,q.d+.08,topM,q.x,q.y-.1,q.z);}
const stackColors=['#d1493a','#2f6fa3','#3e9a6c','#e0a928','#8d5aa8'];
function dripFor(i){return DRIPS.filter(d=>d.kind==='fountain'&&Math.hypot(d.x-platforms[i].x,d.z-platforms[i].z)<2.2);}
for(let i=0;i<platforms.length;i++){
 const q=platforms[i];if(q.floor)continue;
 if(q.kind==='counter'||q.kind==='goal'){counterBlock(q,q.kind==='goal'?goldM:steel,q.kind==='goal'?woodT:creamM);
  if(i===0){box(.9,.5,.06,mat('#1c2830'),q.x-.6,q.y+.5,q.z-1.4);label('INFORMACIÓN',q.x,q.y+1.4,q.z-1.7,2.2,'#2f4f5c');}
  else box(q.w-.2,.9,.06,goldM,q.x,q.y-.7,q.z+q.d/2-.02);}
 else if(q.kind==='bench'){
  box(q.w,.16,q.d,blueM,q.x,q.y-.08,q.z);box(q.w,.22,.1,darkSteel,q.x,q.y+.1,q.z-q.d/2+.06);
  for(const sx of [-1,1])box(.14,q.y-.16,q.d-.2,darkSteel,q.x+sx*(q.w/2-.3),(q.y-.16)/2,q.z);}
 else if(q.kind==='fountain'){
  box(q.w-.3,q.y-.3,q.d-.3,steel,q.x,(q.y-.3)/2,q.z);box(q.w,.3,q.d,darkSteel,q.x,q.y-.15,q.z);
  box(q.w-.5,.04,q.d-.5,mat('#6fb7c9',.1,.3),q.x,q.y+.02,q.z);
  const e=dripFor(i)[0];
  if(e){const bz=q.z-q.d/2+.2;cylinder(.07,.07,e.y-q.y,steel,q.x,q.y+(e.y-q.y)/2,bz);
   const arm=cylinder(.07,.07,Math.abs(e.z-bz),steel,q.x,e.y,(e.z+bz)/2);arm.rotation.x=Math.PI/2;
   cylinder(.03,.12,.28,darkSteel,e.x,e.y-.14,e.z);}
  label('BEBEDERO AVERIADO',q.x,q.y+1.2,q.z+q.d/2+.4,2.2,'#2b5a7a');}
 else if(q.kind==='dryer'||q.kind==='walkway'){
  counterBlock(q,steel,darkSteel);
  const jet=AIR_JETS.find(j=>j.i===i);
  if(jet){
   for(const sx of [-1,1])box(.16,jet.h+.4,.16,darkSteel,jet.x+sx*(jet.w/2+.1),jet.y+(jet.h+.4)/2,jet.z-jet.d/2-.1);
   box(jet.w+.5,.5,.5,steel,jet.x,jet.y+jet.h+.35,jet.z-jet.d/2-.1);
   for(let k=0;k<4;k++)box(jet.w-.2,.05,.1,mat('#1c2830'),jet.x,jet.y+jet.h+.1,jet.z-jet.d/2+.06+k*.12);
   const col=new THREE.Mesh(new THREE.BoxGeometry(jet.w,jet.h,jet.d),jetM);col.position.set(jet.x,jet.y+jet.h/2,jet.z);scene.add(col);
   const streaks=[];for(let k=0;k<12;k++){const s=new THREE.Mesh(new THREE.BoxGeometry(.04,.55,.04),streakM);scene.add(s);streaks.push({s,ph:k*.083+Math.random()*.05,ox:(Math.random()-.5)*(jet.w-.3),oz:(Math.random()-.5)*(jet.d-.3)});}
   embarqueJets.push({jet,streaks});
   label(jet.kind==='dryer'?'SECADOR · AIRE LIMPIO':'RESPIRADERO · AIRE',jet.x,jet.y+jet.h+.9,jet.z-jet.d/2-.7,2.4,'#2b7a8a');}
 }
 else if(q.kind==='stack'){
  const layers=Math.round(q.y/.78),h=q.y/layers;
  for(let j=0;j<layers;j++){const b=box(q.w*(.92+.05*(j%2)),h*.94,q.d*(.9+.06*((j+1)%2)),mat(stackColors[(i+j*2)%5],.5,.1),q.x+((j%3)-1)*.06,(j+.5)*h,q.z);b.rotation.y=((j*7+i)%5-2)*.025;
   box(q.w+.02,.06,.12,darkSteel,q.x,(j+.5)*h,q.z+q.d*.25);}
  box(q.w-.04,.08,q.d-.04,mat(stackColors[(i+1)%5],.5,.1),q.x,q.y-.04,q.z);}
 else if(q.kind==='rail'){
  box(q.w,.2,q.d,darkSteel,q.x,q.y-.1,q.z);
  for(const sx of [-1,1])box(.12,.16,q.d,steel,q.x+sx*(q.w/2-.06),q.y+.07,q.z);
  for(let k=0;k<7;k++)box(q.w-.6,.012,.28,k%2?yellowM:rubberM,q.x,q.y+.012,q.z-q.d/2+.5+k*(q.d-1)/6).castShadow=false;
  for(const sx of [-1,1])for(const sz of [-1,1])box(.18,q.y-.2,.18,darkSteel,q.x+sx*(q.w/2-.25),(q.y-.2)/2,q.z+sz*(q.d/2-.25));
  label('SALTA LAS MALETAS',q.x+.2,q.y+1.3,q.z-q.d/2-.6,2.8,'#8a3a28');}
}
// ── Ductos y respiraderos de A/C con sus goteras ──
{const g=new THREE.Group();scene.add(g);
 box(26,.7,.9,steel,-6.2,9.1,-1.2,g);
 for(let k=0;k<9;k++)box(.1,.72,.92,darkSteel,-18+k*3,9.1,-1.2,g);
 for(const e of DRIPS)if(e.kind==='ac'){cylinder(.05,.05,8.8-e.y,steel,e.x,e.y+(8.8-e.y)/2,e.z,g);cylinder(.03,.14,.26,darkSteel,e.x,e.y-.13,e.z,g);
  box(.9,.1,.9,darkSteel,e.x,8.82,e.z,g);}
}
label('¡CUIDADO! GOTERAS',-9,6.6,-11.6,6.4,'#2b5a7a');
label('INICIO · BAJA AQUÍ',platforms[0].x,platforms[0].y+1.3,platforms[0].z,3.4,'#2f4f5c');
label('¡EL SUELO ES LA DERROTA!',-9,.4,6.8,5,'#a8402a');
label('PUENTES DE MALETAS',12.5,5.6,-11.6,6.4,'#8a3a28');
// ── Maletas rodantes del carril ──
const suitColors=['#d1493a','#2f6fa3','#3e9a6c','#e0a928'];
for(let i=0;i<SUITCASES.length;i++){
 const S=SUITCASES[i],g=new THREE.Group(),m=mat(suitColors[(i*2+1)%4],.45,.1);scene.add(g);
 box(S.w,S.h*.9,S.d,m,0,S.h*.5+.04,0,g);box(S.w+.04,.07,S.d+.04,darkSteel,0,S.h*.55,0,g);
 box(.5,.06,.06,darkSteel,0,S.h+.08,0,g);for(const sx of [-1,1])box(.05,.14,.05,darkSteel,sx*.22,S.h+.02,0,g);
 for(const sx of [-1,1])for(const sz of [-1,1])cylinder(.07,.07,.06,rubberM,sx*(S.w/2-.14),.07,sz*(S.d/2-.14),g).rotation.z=Math.PI/2;
 embarqueSuitcases.push({g});
}
// ── Mostrador VIP y cafetera de la meta ──
for(const q of [platforms[11]])label('VIP · ACCESO',q.x,q.y+1.2,q.z+q.d/2+.5,2.4,'#7a5a2a');
box(1.9,2.17,.73,M.dark,GP.x,GP.y+1.08,GP.z-1.03);
box(2,.4,1.62,M.green,GP.x,GP.y+2.19,GP.z-.62);
box(.83,.26,.35,M.metal,GP.x,GP.y+1.68,GP.z-.23);cylinder(.065,.065,.3,M.metal,GP.x,GP.y+1.48,GP.z-.1);
const plate=cylinder(.71,.73,.07,M.metal,GP.x,GP.y+.04,GP.z);
const stream=cylinder(.04,.06,.5,M.coffee,GP.x,GP.y+1,GP.z);stream.visible=false;
label('SALA VIP · META',GP.x,GP.y+3.0,GP.z,3.4,'#7a5a2a');
const heat={material:{opacity:0}};                         // contrato con el render del motor compartido
const rollingPin=new THREE.Group();scene.add(rollingPin);  // sin uso en este nivel
// ── Animación, goteo y peligros (llamados desde el motor) ──
const dripT=DRIPS.map(()=>1+Math.random()*1.5);
function embarqueDrips(dt){
 for(let i=0;i<DRIPS.length;i++){
  const e=DRIPS[i];dripT[i]-=dt;if(dripT[i]>0)continue;
  dripT[i]=DRIP_MIN+rnd()*(DRIP_MAX-DRIP_MIN);
  if(Math.abs(player.x-e.x)>12)continue;      // solo gotean los emisores del tramo activo
  const m=new THREE.Mesh(dropG,dropM);m.scale.y=1.5;m.position.set(e.x+(rnd()-.5)*.15,e.y-.15,e.z+(rnd()-.5)*.15);scene.add(m);drops.push({m,vy:0});
 }
}
function embarqueFx(dt){
 for(let i=0;i<embarqueSuitcases.length;i++){const s=suitcaseAt(worldTime,i),g=embarqueSuitcases[i].g;g.position.set(s.x,s.y,s.z);g.visible=true;}
 for(const o of embarqueJets)for(const k of o.streaks){const f=(worldTime*1.6+k.ph)%1;k.s.position.set(o.jet.x+k.ox,o.jet.y+.2+f*(o.jet.h-.3),o.jet.z+k.oz);k.s.material.opacity=.55*Math.sin(f*Math.PI);}
}
let embarqueJetHint=0;
function embarqueHazards(res,dt){
 if(auto)return;
 if(res.suitcase?.hit&&mug.inv<=0){const s=res.suitcase;damage(s.damage,s.kx,s.kz);notify('¡Maleta a toda velocidad! −'+s.damage+' HP');}
 if(res.jet&&att.length){for(const a of att)cup.remove(a.m);att.length=0;dustBurst(player.x,player.y+.6,player.z,10,'#d7f3f8',2,.8,3);shake=.2;notify('¡Aire limpio! El enjambre salió volando.');}
 else if(res.jet&&worldTime>embarqueJetHint){notify('Chorro de aire limpio: quita las hormigas de la taza.');embarqueJetHint=worldTime+6;}
}
function embarqueSpawnEnemies(){
 for(const e of PUSHERS)makeRoach(e.pi,e.pts);
 for(const a of ANT_SPAWNS){const q=platforms[a.pi],x=q.x+a.ox,z=q.z+a.oz;box(.3,.012,.05,M.black,x,q.y+.012,z).rotation.y=.6;spawners.push({pi:a.pi,x,z,cd:2});}
}
