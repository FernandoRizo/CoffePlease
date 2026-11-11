// NIVEL 03 — UNA OBRA A ESCALA DE TAZA. Se integra en game.js por build-construction.js.
scene.background=new THREE.Color('#c8d4cf');scene.fog=new THREE.Fog('#c8d4cf',60,112);
scene.children.find(o=>o.isDirectionalLight).intensity=3.8;
const ST=platforms[4],SINK=platforms[0],GP=platforms[GOAL_INDEX];
const sand=mat('#ae906c'),soil=mat('#806a55'),gravel=mat('#a7a39b'),pale=mat('#e4cf97'),cement=mat('#d4d6c9'),iron=mat('#606a70',.44,.65),rust=mat('#9f593b'),safety=mat('#f5a52c'),warning=mat('#ed7731'),plank=mat('#a47750'),tar=mat('#242724',.24,.14),darkPit=mat('#1b1d1b'),meshSafety=mat('#e5ba51');
// Superficie de altura continua: el mismo groundHeight() gobierna tanto la física como los triángulos.
{
 const verts=[],cols=[],indices=[];const N=114,MZ=54,dx=47.2/N,dz=21.2/MZ;
 for(let i=0;i<=N;i++)for(let j=0;j<=MZ;j++){
  const x=-23.6+i*dx,z=-10.6+j*dz,g=groundHeight(x,z);
  verts.push(x,g??-.06,z);
  const c=new THREE.Color((i*7+j*13)%9<3?'#b39a79':(i*5+j*3)%7<3?'#a88e6f':'#bea581');cols.push(c.r,c.g,c.b);
 }
 for(let i=0;i<N;i++)for(let j=0;j<MZ;j++){
  const x=-23.6+(i+.5)*dx,z=-10.6+(j+.5)*dz;
  if(groundHeight(x,z)===null)continue;
  const a=i*(MZ+1)+j,b=a+MZ+1;indices.push(a,b,a+1,b,b+1,a+1);
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));geo.setIndex(indices);geo.computeVertexNormals();
 const earth=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide}));earth.receiveShadow=true;scene.add(earth);
}
box(48,.3,22,soil,0,-2.9,0);
// Bordes de los fosos, suelo profundo y anillos amarillos de advertencia.
for(const h of PITS){
 cylinder(h.r+.07,h.r+.1,.08,soil,h.x,-2.8,h.z);
 const inner=cylinder(h.r-.08,h.r-.08,.12,darkPit,h.x,-2.75,h.z);inner.castShadow=false;
 const rim=torus(h.r+.045,.11,warning,h.x,groundHeight(h.x+h.r+.12,h.z)??.12,h.z);rim.rotation.x=Math.PI/2;
 for(let k=0;k<5;k++){const a=k*Math.PI*2/5,xx=h.x+Math.cos(a)*(h.r+.38),zz=h.z+Math.sin(a)*(h.r+.38);box(.4,.03,.18,M.black,xx,(groundHeight(xx,zz)??.1)+.05,zz).rotation.y=-a;}
}
// Perímetro abierto: montones, mallas, barricadas y edificios de fondo (no bloquean cámara).
for(const z of [-10.85,10.85]){for(let x=-23;x<24;x+=4){box(3.7,.55,.12,meshSafety,x,.3,z);box(.09,1.2,.11,iron,x-1.85,.6,z);}}
for(const x of [-23.85,23.85]){for(let z=-8;z<10;z+=3.5){box(.12,.45,3.3,meshSafety,x,.25,z);box(.12,1.1,.09,iron,x,.55,z);}}
for(let k=0;k<10;k++){const x=-27+k*5.8,h=5+(k*3%9);box(4.1,h,3.8,mat(k%2?'#7f8e8b':'#9daba7'),x,h/2,-19.4);}
// Materiales del escenario: cada superficie marcada en physics.js tiene una representación creíble.
for(let i=0;i<platforms.length;i++){
 const p=platforms[i];if(p.floor||p.kind==='checkpoint')continue;
 if(p.kind==='scaffold'){
  box(p.w,.17,p.d,plank,p.x,p.y-.085,p.z);
  for(const sx of [-1,1])for(const sz of [-1,1]){
   const x=p.x+sx*(p.w/2-.18),z=p.z+sz*(p.d/2-.18);
   cylinder(.07,.07,p.y-.15,iron,x,(p.y-.15)/2,z);
  }
  for(const z of [-p.d/2+.23,p.d/2-.23])box(p.w,.055,.08,iron,p.x,p.y*.55,p.z+z);
 }else if(p.kind==='plank'||p.kind==='pallet'){
  for(let j=0;j<4;j++)box(p.w/4-.035,.14,p.d,plank,p.x-p.w/2+(j+.5)*p.w/4,p.y-.07,p.z);
  for(const dz of [-.35,.35])box(p.w,.19,.14,rust,p.x,p.y-.26,p.z+dz);
 }else if(p.kind==='barrel'){
  cylinder(.75,.81,p.y-.11,rust,p.x,(p.y-.11)/2,p.z,undefined,20);
  for(const yy of [.17,p.y-.22])cylinder(.77,.77,.065,iron,p.x,yy,p.z);
  cylinder(.72,.72,.08,iron,p.x,p.y-.04,p.z);
 }else if(p.kind==='bag'){
  const layers=Math.max(1,Math.ceil(p.y/.4));
  for(let y=0;y<layers;y++)for(let k=0;k<2;k++){
   const b=box(p.w/2-.09,.35,p.d-.14,k%2?cement:pale,p.x+(k-.5)*p.w/2,Math.min(p.y-.18,.19+y*.35),p.z);
   b.rotation.y=(k+y)%2?.07:-.06;
  }
  box(p.w,.16,p.d,plank,p.x,p.y-.08,p.z);
 }else if(p.kind==='pipe'){
  for(const yy of [p.y-.3,p.y-.8])for(const zz of [-.43,0,.43]){
   const pipe=cylinder(.21,.21,p.w-.07,iron,p.x,yy,p.z+zz);pipe.rotation.z=Math.PI/2;
  }
  box(p.w,.14,p.d,plank,p.x,p.y-.07,p.z);
 }else if(p.kind==='box'){
  box(p.w,p.y,p.d,safety,p.x,p.y/2,p.z);box(p.w+.03,.1,p.d+.03,iron,p.x,p.y-.05,p.z);
  label('HERRAMIENTAS',p.x,p.y+.45,p.z,1.9,'#543421');
 }else if(p.kind==='goal'){
  box(p.w,.2,p.d,plank,p.x,p.y-.1,p.z);
  for(const sx of [-1,1])for(const sz of [-1,1])box(.14,p.y-.25,.14,iron,p.x+sx*(p.w/2-.23),(p.y-.25)/2,p.z+sz*(p.d/2-.2));
 }
}
// Conos visibles y móviles de ruta; un cono no mata pero señala zonas de obra.
for(const [x,z] of CONES){const y=groundHeight(x,z)??.03;
 cylinder(.12,.35,.8,warning,x,y+.4,z,undefined,4);box(.83,.08,.83,tar,x,y+.04,z);
 cylinder(.23,.25,.1,M.white,x,y+.32,z,undefined,4);
}
// Charcos de aceite negro con reflejos; ralentizan y bloquean el salto.
for(const q of OIL_PATCHES){const y=groundHeight(q.x,q.z)??.1;
 const oil=mesh(new THREE.CircleGeometry(q.r,48),new THREE.MeshBasicMaterial({color:'#171c1d',transparent:true,opacity:.83,depthWrite:false}),q.x,y+.06,q.z);oil.rotation.x=-Math.PI/2;oil.castShadow=false;
 for(let k=0;k<7;k++){const a=k*2.4,xx=q.x+Math.cos(a)*q.r*.6,zz=q.z+Math.sin(a)*q.r*.5;
  const sw=mesh(new THREE.CircleGeometry(.26,16),new THREE.MeshBasicMaterial({color:k%2?'#60558a':'#6094a7',transparent:true,opacity:.32,depthWrite:false}),xx,(groundHeight(xx,zz)??y)+.07,zz);sw.rotation.x=-Math.PI/2;sw.castShadow=false;}
 label('ACEITE · SIN SALTO',q.x,y+1.15,q.z,q.r*1.7,'#552924');
}
// Grúa amarilla y bola de demolición oscilante. La esfera tiene colisión sincronizada.
const A=WRECKING_ANCHOR;
for(const x of [-3.5,1.6]){box(.3,9,.35,safety,x,4.5,-6.8);for(let y=1;y<9;y+=1.65)box(5.3,.16,.18,iron,-.95,y,-6.8);}
box(12,.33,.36,safety,A.x+1.0,A.y+.72,-6.8);
for(let j=0;j<7;j++){const xx=-4+j*1.5;box(.08,.1,4,iron,xx,A.y+.72,-4.8);}
const craneCable=cylinder(.052,.052,5.6,iron,A.x,A.y-2.8,A.z);
const rollingPin=new THREE.Group();scene.add(rollingPin);
cylinder(.96,.94,.13,iron,0,.0,0,rollingPin);mesh(new THREE.SphereGeometry(.96,24,16),iron,0,0,0,rollingPin);
for(const a of [0,Math.PI/2]){const band=torus(.955,.055,M.black,0,0,0,rollingPin);band.rotation.y=a;}
label('PELIGRO · BOLA DE DEMOLICIÓN',1.8,6.8,1.7,5.6,'#562715');
// Robots de obra: pequeños carritos mecánicos patrullando por el suelo.
const constructionBots=[];
for(let k=0;k<2;k++){
 const bot=new THREE.Group();scene.add(bot);const color=k?mat('#c27c32'):mat('#d1b14f');
 box(.82,.5,1.0,color,0,.42,0,bot);box(.55,.36,.55,M.black,0,.8,-.1,bot);
 for(const zz of [-.38,.37])for(const xx of [-.42,.42]){const wheel=cylinder(.19,.19,.12,tar,xx,.22,zz,bot);wheel.rotation.z=Math.PI/2;}
 const shovel=box(.92,.18,.21,iron,0,.17,.67,bot);shovel.rotation.x=.15;
 constructionBots.push(bot);
}
const heat={material:{opacity:0}}; // Compatibilidad con el efecto del motor compartido.
// Máquina de café y termito, anclados en la mesita final.
box(1.45,1.85,.85,M.dark,GP.x,GP.y+.92,GP.z-.72);
box(1.52,.26,.93,M.green,GP.x,GP.y+1.89,GP.z-.65);
box(.72,.19,.30,M.metal,GP.x,GP.y+1.30,GP.z-.18);
cylinder(.07,.07,.32,M.metal,GP.x,GP.y+1.12,GP.z-.1);
const plate=cylinder(.7,.72,.07,M.metal,GP.x,GP.y+.04,GP.z+.25);
const stream=cylinder(.04,.06,.5,M.coffee,GP.x,GP.y+1.0,GP.z+.2);stream.visible=false;
label('META · CAFÉ EN LA OBRA',GP.x,GP.y+2.9,GP.z,4.1,'#415232');
label('INICIO · BAJA POR LOS PALÉS',platforms[0].x,platforms[0].y+2,platforms[0].z,4.5,'#513527');
label('RUTA SEGURA →',-12,1.8,7,3.1,'#5b4023');
label('ESCALA A LA MESITA',17.1,3.5,4.2,3.9,'#5b4023');
// Marcadores de control visibles pero no sólidos.
for(const i of [11,12]){const q=platforms[i],y=groundHeight(q.x,q.z)??0;
 const ring=torus(.62,.07,M.green,q.x,y+.07,q.z);ring.rotation.x=Math.PI/2;label('CHECKPOINT',q.x,y+1.35,q.z,2.35,'#2f634a');
}