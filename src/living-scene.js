// Coffee Please — Nivel 04 «La sala de estar».
// Dos sofás enfrentados, mesa central, bibliotecas en ambos lados y mueble doble.
scene.background=new THREE.Color('#e9d7b7');scene.fog=new THREE.Fog('#e9d7b7',53,105);
const SINK=platforms[0],ST=platforms[18],GP=platforms[GOAL_INDEX];
const oak=mat('#a87a53'),wood=mat('#795339'),woodDark=mat('#4c342c'),
  shelfTop=mat('#c59d71'),soft=mat('#648b86'),soft2=mat('#b16d5d'),
  velvet=mat('#e4c3a4'),iron=mat('#626e6e',.42,.55),light=mat('#f1e1c5'),
  glass=mat('#b9dadd',.22,.5),leaf=mat('#478b60'),potClay=mat('#ba7453'),
  lilac=mat('#a09bc5'),glueMat=mat('#d7ba56',.3),tvBlack=mat('#262c37');
// Suelo de parquet continuo, alfombra central y paredes con marcos.
box(36,.25,22,mat('#d1aa7a'),0,-.13,0);
for(let x=-17.5;x<18;x+=1.75)for(let z=-10.4;z<11;z+=1.12){
 const tile=box(1.72,.008,1.09,mat(((x*7+z*11)|0)%6===0?'#c89a67':'#e1b989'),x+.86,.005,z+.54);
 tile.castShadow=false;
}
box(36,9,.22,mat('#f1e6d3'),0,4.5,-11.0);
box(.20,9,22,mat('#ece0ce'),-18,4.5,0);
box(.20,9,22,mat('#e9d9c2'),18,4.5,0);
// Cuadros, reloj y ventanas: decoración que no altera el volumen jugable.
for(const [x,c] of [[-10,'#91aaa2'],[-4,'#bca28b'],[2,'#b7a2bd'],[9,'#7f9a9a']]){
 box(3.1,2.35,.1,wood,x,6.15,-10.83);
 box(2.7,2.0,.11,mat(c),x,6.15,-10.75);
 mesh(new THREE.SphereGeometry(.45,16,12),light,x,6.3,-10.61).scale.set(2,1,.1);
}
box(.09,4.5,5.5,mat('#eee4d1'),17.83,5.2,4.4);
box(.07,4.12,5.15,glass,17.77,5.2,4.4);
for(const zz of [2,4.4,6.8])box(.13,4.25,.1,wood,17.72,5.2,zz);
box(.17,.13,5.45,wood,17.7,5.2,4.4);
// Alfombra entre los sofás, visible a través de la mesita.
box(10,.035,11.3,mat('#dfc5aa'),-6.2,.03,0);
for(const dz of [-4.7,4.7])box(9.5,.04,.16,soft,-6.2,.064,dz);
for(const dx of [-4.4,4.4])box(.16,.04,10.8,soft,-6.2,.064,dx*.99);
function sofa(q,material,north){
 box(q.w,1.08,q.d,woodDark,q.x,.54,q.z);
 box(q.w,.35,q.d,material,q.x,q.y-.175,q.z);
 const backZ=q.z+(north?-1:1)*(q.d/2-.18);
 box(q.w,1.05,.42,material,q.x,q.y+.34,backZ);
 for(const xx of [-1,1])box(.56,.69,q.d,material,q.x+xx*(q.w/2-.28),q.y+.07,q.z);
 for(const xx of [-1.28,0,1.28]){
  box(1.17,.10,q.d*.62,mat(north?'#7ca29d':'#c8836f'),q.x+xx,q.y+.01,q.z);
 }
 for(const xx of [-1,1])for(const zz of [-1,1])box(.22,.32,.22,wood,q.x+xx*(q.w/2-.28),.16,q.z+zz*(q.d/2-.30));
 // Cojines, con el centro despejado para que el gato pueda saltar al sofá.
 for(let i=0;i<2;i++){const c=box(.77,.33,.64,i?velvet:lilac,q.x+(i?1.65:-1.65),q.y+.25,q.z+(north?-.68:.68));c.rotation.y=i?.23:-.15;}
}
sofa(platforms[3],soft,true);sofa(platforms[4],soft2,false);
const coffeeTable=platforms[5];
box(coffeeTable.w,.19,coffeeTable.d,oak,coffeeTable.x,coffeeTable.y-.095,coffeeTable.z);
for(const sx of [-1,1])for(const sz of [-1,1]){
 box(.18,coffeeTable.y-.15,.18,wood,coffeeTable.x+sx*(coffeeTable.w/2-.28),(coffeeTable.y-.15)/2,coffeeTable.z+sz*(coffeeTable.d/2-.28));
}
box(1.2,.05,.72,light,coffeeTable.x-.6,coffeeTable.y+.03,coffeeTable.z-.68);
for(let j=0;j<4;j++)box(.9,.045,.38,mat(j%2?'#e3aa87':'#82a9ab'),coffeeTable.x+.86,coffeeTable.y+.05+j*.045,coffeeTable.z-.67);
// Consola y banquito para el descenso inicial.
for(const i of [0,1]){
 const q=platforms[i];box(q.w,.18,q.d,i===0?oak:soft,q.x,q.y-.09,q.z);
 for(const sx of [-1,1])for(const sz of [-1,1]){
  box(.16,q.y-.18,.16,wood,q.x+sx*(q.w/2-.22),(q.y-.18)/2,q.z+sz*(q.d/2-.22));
 }
}
// Bibliotecas anchas, profundas y con baldas reales. Las pilas jugables son libros,
// no plataformas rectangulares independientes de la ambientación.
const bookColors=['#456a77','#b35f4b','#c59c5a','#687e54','#8e6c91','#d3b787'];
const bookMaterials=bookColors.map(c=>mat(c));
const bookBands=mat('#e2cda7'),spines=mat('#e9cd83');
function stackOfBooks(q,i){
 const layers=Math.max(3,Math.ceil(q.y/.37)),h=q.y/layers;
 for(let j=0;j<layers;j++){
  const k=(j*3+i)%bookMaterials.length,w=q.w*(.82+.035*(j%3)),d=q.d*(.80+.035*(j%2));
  const bk=box(w,h*.88,d,bookMaterials[k],q.x+((j%3)-1)*.075,(j+.5)*h,q.z+((j%2)?-.06:.06));
  bk.rotation.y=(((j*13+i*7)%9)-4)*.025;
  box(w+.012,.035,d+.012,bookBands,bk.position.x,(j+.5)*h+h*.40,bk.position.z).rotation.y=bk.rotation.y;
  if(j%3===0)box(w*.45,.02,.04,spines,bk.position.x,(j+.5)*h,bk.position.z+d*.41);
 }
 // La cubierta del libro superior coincide exactamente con la plataforma de física.
 box(q.w-.05,.10,q.d-.05,bookMaterials[(i+3)%bookMaterials.length],q.x,q.y-.05,q.z);
}
function realBookcase(q,north){
 const face=q.z+(north?1:-1)*(q.d/2-.09),back=q.z-(north?1:-1)*(q.d/2-.08);
 // Laterales, espalda y estantes internos, con objetos que parecen libros colocados.
 box(q.w,.16,q.d,wood,q.x,q.y-.08,q.z);
 box(q.w,q.y,.15,woodDark,q.x,q.y/2,back);
 for(const dx of [-1,1])box(.19,q.y,q.d,wood,q.x+dx*(q.w/2-.095),q.y/2,q.z);
 for(let y=.62;y<q.y-.15;y+=.70){
  box(q.w-.24,.13,q.d-.20,oak,q.x,y,q.z);
  for(let n=0;n<11;n++){
   const color=bookMaterials[(n+Math.floor(y*5)+(north?1:2))%bookMaterials.length];
   const xx=q.x-q.w/2+.43+n*(q.w-.86)/11;
   const h=.40+(n%4)*.04;
   box(.25,h,.60,color,xx,y+.065+h/2,face+(north?-.43:.43));
   if(n%3===1)box(.012,h*.62,.42,bookBands,xx+.13,y+.065+h/2,face+(north?-.43:.43));
  }
 }
 // Molduras de remate. La parte superior es la repisa segura del librero.
 box(q.w+.12,.16,q.d+.10,shelfTop,q.x,q.y-.08,q.z);
 box(q.w+.08,.16,.16,woodDark,q.x,q.y-.16,face);
}
for(let i=6;i<=23;i++){
 if(i===18)continue;const q=platforms[i];
 if(q.kind==='bookcase')realBookcase(q,q.z<0);
 else if(q.kind==='bookStep')stackOfBooks(q,i);
}
// Los libros que sobresalen en los libreros son móviles: su modelo sigue
// bookTrapAt(), la misma función determinista empleada para calcular el choque.
const livingBookTraps=[];
for(let i=0;i<BOOK_TRAPS.length;i++){
 const t=BOOK_TRAPS[i],g=new THREE.Group();scene.add(g);g.position.set(t.x,t.y,t.z);
 for(let j=0;j<3;j++){
  const bk=box(.48,.37,.32,bookMaterials[(i*2+j)%bookMaterials.length],(j-1)*.15,.11,0,g);
  bk.rotation.z=(j-1)*.06;
  box(.30,.027,.35,bookBands,(j-1)*.15,.30,0,g);
 }
 const warnMat=new THREE.MeshBasicMaterial({color:'#f5a432',transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide});
 const warn=mesh(new THREE.RingGeometry(.42,.62,28),warnMat,t.x,platforms[t.z<0?10:15].y+.055,t.z);warn.rotation.x=-Math.PI/2;warn.visible=false;warn.castShadow=false;
 livingBookTraps.push({g,warn,t});
}
label('¡LIBROS QUE SALEN! ESPERA EL MOMENTO',7.5,5.5,-7.9,5.6,'#7e4124');
label('¡LIBROS QUE SALEN! ESPERA EL MOMENTO',7.5,5.5,7.9,5.6,'#7e4124');
// Mueble de TV ensanchado: el televisor ocupa un hueco creíble en el piso bajo.
// La repisa frontal (TV) está señalada y tiene su propia geometría de colisión.
// El resto del mueble soporta el estante superior y forma el volumen decorativo.
const TV=platforms[18],cabinetX=13.85,cabinetW=7.25,cabinetD=8.15;
box(cabinetW,2.33,cabinetD,woodDark,cabinetX,1.165,0);
box(cabinetW,.19,cabinetD,oak,cabinetX,2.36,0);
for(const side of [-1,1]){
 box(.16,2.5,.18,wood,cabinetX+side*(cabinetW/2-.20),1.25,-cabinetD/2+.2);
 box(.16,2.5,.18,wood,cabinetX+side*(cabinetW/2-.20),1.25,cabinetD/2-.2);
}
for(const z of [-2.75,2.75])box(cabinetW-.12,.17,.11,shelfTop,cabinetX,2.42,z);
// Repisa peatonal obligatoria a lo largo de toda la cara del televisor.
box(TV.w,.22,TV.d,light,TV.x,TV.y-.11,TV.z);
for(const z of [-3.1,0,3.1])box(TV.w,.035,.08,iron,TV.x,TV.y+.016,z);
label('PASA FRENTE AL TELEVISOR',TV.x-1.25,TV.y+1.15,0,4.5,'#4b675b');
// Pantalla mirando a los sofás (orientación sobre el plano Y-Z): ningún borde
// del televisor invade la franja jugable frontal (x ≈ 11.2).
box(.23,2.20,4.9,tvBlack,12.60,3.77,.55);
box(.035,1.99,4.58,mat('#6e9ba7',.25),12.46,3.77,.55);
for(const z of [-1.25,2.35])box(.2,.32,.22,iron,12.58,2.75,z);
box(.4,.10,3.9,iron,12.58,2.58,.55);
for(const z of [-2.55,3.10]){
 box(.70,.70,.6,wood,12.78,2.90,z);
 box(.47,.47,.065,iron,12.40,2.90,z);
}
// Adornos discretos en el mueble, alejados de la ruta de la taza.
for(let i=0;i<4;i++)box(.38,.12,.42,bookMaterials[(i+3)%bookMaterials.length],14.4,2.57,-2.7+i*.37);
// La subida de la TV al nivel superior se hace sobre las pilas 19/20/21.
const TOP=platforms[GOAL_INDEX];
for(const z of [-2.9,1.85])for(const x of [12.20,16.9]){
 box(.22,TOP.y-2.55,.22,wood,x,(TOP.y+2.55)/2,z);
}
box(TOP.w,.20,TOP.d,shelfTop,TOP.x,TOP.y-.10,TOP.z);
for(const z of [-3.0,2.0])box(TOP.w,.11,.14,woodDark,TOP.x,TOP.y-.22,z);
// La segunda repisa aloja los ventiladores y el pegamento, por delante
// de la cafetera (no se elimina ninguna de sus dos zonas peligrosas).
// Un adorno y una planta en el primer piso, con colisión física real.
for(const p of POTS){
 cylinder(p.r*.95,p.r*.78,.50,potClay,p.x,p.y+.25,p.z);
 cylinder(p.r*.75,p.r*.75,.07,M.coffee,p.x,p.y+.51,p.z);
 for(let k=0;k<6;k++){
  const a=k*2.4,bl=mesh(new THREE.SphereGeometry(.20,10,8),leaf,p.x+Math.cos(a)*p.r*.54,p.y+.74+(k%3)*.10,p.z+Math.sin(a)*p.r*.54);
  bl.scale.set(.66,1.45,.5);bl.rotation.z=Math.cos(a)*.42;
 }
}
// La cafetera está en el piso superior, junto a su plato de llegada.
box(1.65,1.75,.76,M.dark,GP.x,GP.y+.89,GP.z-.72);
box(1.78,.29,.90,M.green,GP.x,GP.y+1.88,GP.z-.65);
box(.82,.18,.28,M.metal,GP.x,GP.y+1.35,GP.z-.17);
cylinder(.055,.055,.29,M.metal,GP.x,GP.y+1.21,GP.z-.09);
const plate=cylinder(.67,.69,.07,M.metal,GP.x,GP.y+.04,GP.z+.15);
const stream=cylinder(.04,.06,.5,M.coffee,GP.x,GP.y+1,GP.z+.16);stream.visible=false;
// Pegamento amarillo: corresponde exactamente a las zonas GLUE de la física.
for(const g of GLUE){
 const patch=mesh(new THREE.CircleGeometry(g.r,40),new THREE.MeshBasicMaterial({color:'#e5c24b',transparent:true,opacity:.75,depthWrite:false}),g.x,g.y+.022,g.z);
 patch.rotation.x=-Math.PI/2;patch.castShadow=false;
 for(let i=0;i<5;i++){const a=i*2.4;
  const p=mesh(new THREE.CircleGeometry(.14,16),new THREE.MeshBasicMaterial({color:'#f5e6ac',transparent:true,opacity:.48,depthWrite:false}),g.x+Math.cos(a)*g.r*.45,g.y+.027,g.z+Math.sin(a)*g.r*.45);
  p.rotation.x=-Math.PI/2;p.castShadow=false;}
 label('PEGAMENTO · SIN SALTO',g.x,g.y+1.35,g.z,g.r*2.7,'#795321');
}
// Aspiradora con colisión de contacto mortal.
const rollingPin=new THREE.Group();scene.add(rollingPin);
cylinder(.70,.71,.36,M.dark,0,.33,0,rollingPin);
cylinder(.42,.42,.13,soft,0,.57,0,rollingPin);
for(const x of [-.43,.43]){const wh=cylinder(.18,.18,.11,M.black,x,.18,0,rollingPin);wh.rotation.z=Math.PI/2;}
box(1.0,.14,.18,iron,0,.14,.66,rollingPin);
const vacuumBeacon=mesh(new THREE.SphereGeometry(.11,12,8),M.coral,0,.65,0,rollingPin);
// El gato tridimensional ocupa las mismas posiciones catAt() que la colisión.
const livingCat=new THREE.Group();scene.add(livingCat);
const fur=mat('#d2aa7b'),furDark=mat('#a9795d'),furLight=mat('#efddc9');
const catBody=mesh(new THREE.SphereGeometry(.60,18,14),fur,0,.38,-.22,livingCat);catBody.scale.set(.90,.6,1.15);
mesh(new THREE.SphereGeometry(.37,16,14),fur,0,.54,.40,livingCat);
for(const x of [-.24,.24]){
 const ear=mesh(new THREE.ConeGeometry(.20,.42,4),furDark,x,.92,.34,livingCat);ear.rotation.y=Math.PI/4;
 mesh(new THREE.SphereGeometry(.037,8,8),M.black,x*.65,.62,.72,livingCat);
}
mesh(new THREE.SphereGeometry(.15,10,8),furLight,0,.38,.7,livingCat);
mesh(new THREE.SphereGeometry(.055,8,8),M.coral,0,.43,.79,livingCat);
for(const x of [-.39,.39])for(const z of [-.52,.28]){
 mesh(new THREE.CylinderGeometry(.09,.095,.40,9),furDark,x,.13,z,livingCat);
}
const catTail=new THREE.Group();livingCat.add(catTail);catTail.position.set(0,.5,-.78);
const tail=cylinder(.12,.10,.75,furDark,0,.33,-.15,catTail);tail.rotation.x=.48;
const tailTip=mesh(new THREE.SphereGeometry(.13,10,8),furDark,0,.66,-.34,catTail);
// Dos ventiladores que giran, mostrando el cono de viento real de fanForce().
const livingFans=[];
for(let i=0;i<FANS.length;i++){
 const f=FANS[i],root=new THREE.Group();root.position.set(f.x,f.y,f.z);scene.add(root);
 cylinder(.28,.35,.12,iron,f.x,f.y-.67,f.z);
 cylinder(.08,.08,.71,iron,f.x,f.y-.38,f.z);
 const head=new THREE.Group();root.add(head);
 cylinder(.24,.25,.20,soft,0,0,-.20,head);
 const rotor=new THREE.Group();head.add(rotor);rotor.position.z=.03;
 for(let k=0;k<4;k++){const blade=box(.21,.67,.07,light,0,.40,0,rotor);blade.rotation.z=k*Math.PI/2;}
 const ring=torus(.71,.06,iron,0,0,.09,head);
 const coneVerts=[];
 for(let k=0;k<24;k++){const a=-.55+k*.046,b=a+.046;
  coneVerts.push(0,0,0,Math.sin(a)*f.range,0,Math.cos(a)*f.range,Math.sin(b)*f.range,0,Math.cos(b)*f.range);
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(coneVerts,3));
 const cone=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:'#98d5e3',transparent:true,opacity:.13,side:THREE.DoubleSide,depthWrite:false}));
 cone.position.set(f.x,f.y-.48,f.z);scene.add(cone);livingFans.push({head,rotor,cone});
}
label('INICIO · BAJA POR EL BANQUITO',platforms[0].x,platforms[0].y+1.65,platforms[0].z,4.8,'#53402f');
label('SOFÁS Y MESITA · ¡CUIDADO CON EL GATO!',-6.2,3.7,0,6,'#563b32');
label('TREPA POR LOS LIBROS',3.9,4.7,6.6,4.8,'#315f54');
label('TREPA POR LOS LIBROS',3.9,4.7,-6.6,4.8,'#315f54');
label('TV · REPISA FRONTAL',11.0,4.2,-1.8,4,'#31515b');
label('META · CAFÉ EN LA SALA',GP.x,GP.y+3.0,GP.z,4.2,'#315f54');
const heat={material:{opacity:0}}; // Contrato con el render del motor compartido.
