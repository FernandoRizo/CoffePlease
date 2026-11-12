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
// Escalerillas naturales a los lados: libros, repisas y estructuras de madera.
for(let i=6;i<=23;i++){
 if([18].includes(i))continue;const q=platforms[i];
 if(q.kind==='bookcase'){
  box(q.w,q.y,q.d,wood,q.x,q.y/2,q.z);
  for(const x of [-1,1])box(.10,q.y,.10,woodDark,q.x+x*(q.w/2-.07),q.y/2,q.z+q.d/2-.08);
  for(let y=.80;y<q.y;y+=.70){
   box(q.w-.15,.11,q.d-.08,oak,q.x,y,q.z);
   for(let n=0;n<5;n++){
    const c=['#6b8f8b','#c88c70','#c0a879','#8893b6','#d8b88a'][n];
    box(.23,.48+(n%3)*.09,.37,mat(c),q.x-.86+n*.43,y+.29,q.z+.24);
   }
  }
  box(q.w,.16,q.d,shelfTop,q.x,q.y-.08,q.z);
 }else if(q.kind==='shelf'||q.kind==='ledge'){
  box(q.w,.16,q.d,shelfTop,q.x,q.y-.08,q.z);
  for(const d of [-.33,.33]){
   box(.14,.50,.14,iron,q.x-q.w/2+.16,q.y-.37,q.z+d);
   box(.45,.12,.14,iron,q.x-q.w/2+.32,q.y-.54,q.z+d);
  }
 }else if(q.kind==='step'){
  box(q.w,q.y-.08,q.d,oak,q.x,(q.y-.08)/2,q.z);
  box(q.w,.14,q.d,shelfTop,q.x,q.y-.07,q.z);
 }
}
// Mueble de dos pisos: TV abajo, cafetería arriba, con repisas laterales para escalar.
const TV=platforms[18];
box(TV.w,TV.y-.12,TV.d,woodDark,TV.x,(TV.y-.12)/2,TV.z);
box(TV.w,.20,TV.d,oak,TV.x,TV.y-.10,TV.z);
for(const z of [-1.35,0,1.35]){box(.08,1.8,.09,wood,TV.x-1.9,1.5,z);box(.15,.07,.25,iron,TV.x-1.9,2.2,z);}
box(2.65,1.61,.16,tvBlack,13.75,3.58,-2.10);
box(2.37,1.33,.05,mat('#74a4ae',.28),13.75,3.58,-2.0);
box(.13,.39,.12,iron,13.75,2.65,-2.01);
box(1.7,.07,.55,iron,13.75,2.55,-2.0);
for(const xx of [12.1,15.4])box(.68,.68,.48,wood,xx,2.91,-2.0);
// Un adorno y una planta en el primer piso, con colisión física real.
for(const p of POTS){
 cylinder(p.r*.95,p.r*.78,.50,potClay,p.x,p.y+.25,p.z);
 cylinder(p.r*.75,p.r*.75,.07,M.coffee,p.x,p.y+.51,p.z);
 for(let k=0;k<6;k++){
  const a=k*2.4,bl=mesh(new THREE.SphereGeometry(.20,10,8),leaf,p.x+Math.cos(a)*p.r*.54,p.y+.74+(k%3)*.10,p.z+Math.sin(a)*p.r*.54);
  bl.scale.set(.66,1.45,.5);bl.rotation.z=Math.cos(a)*.42;
 }
}
const TOP=platforms[GOAL_INDEX];
box(TOP.w,TOP.y-TV.y-.1,TOP.d,wood,TOP.x,TV.y+(TOP.y-TV.y-.1)/2,TOP.z);
box(TOP.w+.02,.18,TOP.d+.02,shelfTop,TOP.x,TOP.y-.09,TOP.z);
for(const side of [-1,1]){
 box(.12,2.9,.14,iron,TOP.x+side*(TOP.w/2-.15),4,TOP.z-TOP.d/2+.11);
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
label('SUBE POR LOS LIBREROS',4.9,4.7,8.2,4.6,'#315f54');
label('SUBE POR LOS LIBREROS',4.9,4.7,-8.2,4.6,'#315f54');
label('TV · NIVEL INFERIOR',13.3,4.7,-1.8,4,'#31515b');
label('META · CAFÉ EN LA SALA',GP.x,GP.y+3.0,GP.z,4.2,'#315f54');
const heat={material:{opacity:0}}; // Contrato con el render del motor compartido.
