'use strict';
// Nivel 04: se construye a partir del motor compartido; no sobrescribe las físicas anteriores.
const fs=require('node:fs'),path=require('node:path');
const root=__dirname,read=p=>fs.readFileSync(path.join(root,p),'utf8'),write=(p,s)=>{const f=path.join(root,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,s);};
const base=read('public/juego/index.html'),game=read('src/game.js'),encode=s=>Buffer.from(s).toString('base64');
const a=game.indexOf('// === UNA COCINA'),b=game.indexOf('// Perfil de taza');
if(a<0||b<a)throw Error('No se encontró el bloque de escena del motor.');
let living=game.slice(0,a)+read('src/living-scene.js')+'\n'+game.slice(b);
const replace=(before,after,required=true)=>{if(!living.includes(before)){if(required)throw Error('Marcador ausente: '+before.slice(0,90));return;}living=living.replace(before,after);};
replace('FLOOR_CRUMBS}', 'FLOOR_CRUMBS,onGlue,GLUE,POTS,vacuumAt,hitsVacuum,catAt,catHit,FANS,fanAt,fanForce}');
const la=living.indexOf('// Iluminación ambiental'),lb=living.indexOf('const shellM=',la);
if(la<0||lb<la)throw Error('No se encontró bloque de luces/efectos de la cocina.');
living=living.slice(0,la)+`const goalL=new THREE.PointLight('#ffe8c6',23,10,2);goalL.position.set(GP.x,GP.y+2,GP.z);scene.add(goalL);\n`+living.slice(lb);
// El motor original tiene enemigos de cocina. En esta sala se reemplazan por el gato y la aspiradora.
const fxA=living.indexOf('function fxExtra('),fxB=living.indexOf('function roach(',fxA);
if(fxA<0||fxB<fxA)throw Error('No se encontró el bloque de enemigos de la cocina.');
living=living.slice(0,fxA)+`function fxExtra(dt){
 for(const s of spinners)s.arm.rotation.y+=s.sp*dt;
 const vac=vacuumAt(worldTime);rollingPin.position.set(vac.x,vac.y,vac.z);
 rollingPin.rotation.y=Math.sin(worldTime*1.8)*.4;
 const c=catAt(worldTime);livingCat.position.set(c.x,c.y,c.z);
 livingCat.rotation.y=c.zone==='floor'?Math.PI*.5:Math.sin(worldTime*1.3)*.35;
 catTail.rotation.z=Math.sin(worldTime*4)*.25;
 for(let i=0;i<livingFans.length;i++){
  const f=fanAt(worldTime,i),o=livingFans[i];
  o.head.rotation.y=f.angle;o.rotor.rotation.z+=dt*12;
  o.cone.rotation.y=f.angle;
 }
}
`+living.slice(fxB);
replace('if(player.y>s.y+.55)continue','if(player.y>s.y+.55||player.y+.84<s.y+.1)continue');
replace('dropT-=dt;if(dropT<=0)', 'if(false)');
replace('player.kx=ix/il*I;player.kz=iz/il*I;player.kt=.3;', 'damage(15,ix/il*I,iz/il*I);');
const hit='if(res.hit){const o=obstacleAt(worldTime),vr=Math.hypot(pvx,pvz-3*Math.cos(2.4*worldTime))+1.5;damage(vr*8,0,(Math.sign(player.z-o.z)||1)*3.5);}';
replace(hit,`if(res.hit&&!auto){mug.hp=0;notify('¡La aspiradora atrapó a la taza!');}
 if(res.cat?.hit&&!auto){
  const c=catAt(worldTime),dx=player.x-c.x,dz=player.z-c.z,l=Math.hypot(dx,dz)||1;
  if(res.cat.fatal){mug.hp=0;notify('¡El gato te empujó desde un mueble!');}
  else damage(res.cat.damage,dx/l*7,dz/l*7);
 }
 if(res.glue&&!glueHint){notify('¡PEGAMENTO! No puedes saltar y caminas más despacio.');glueHint=true;}
 if(!res.glue)glueHint=false;
 if(res.wind&&worldTime>windHintUntil){notify('¡VENTILADOR! ¡Aléjate del borde!');windHintUntil=worldTime+2.8;}`);
replace('function postStep(res,dt){',`let glueHint=false,windHintUntil=0;
function postStep(res,dt){`);
replace('worldTime=0;player=createPlayer()', 'worldTime=0;glueHint=false;windHintUntil=0;player=createPlayer()');
replace('heat.material.opacity=.5+Math.sin(worldTime*4)*.15;', '');
replace('rollingPin.rotation.z=worldTime*3;', 'rollingPin.rotation.y+=dt*.2;',false);
replace('const mobile=innerWidth<700;desired.set(mobile?5:7,13,mobile?21:22);look.set(mobile?-1.5:-1.7,3.0,-3.2);',
 'const mobile=innerWidth<700;desired.set(mobile?-8:-5,mobile?25:32,mobile?29:35);look.set(-1,1.7,0);');
replace('camera.position.set(7,13,22);camTarget.set(-1.7,3,-3.2)',
 'camera.position.set(-5,32,35);camTarget.set(-1,1.7,0)');
replace("level:'cocina-01-referencia'", "level:'sala-04-estar'");
replace('NIVEL 01 · COCINA DE CASA','NIVEL 04 · SALA DE ESTAR');
replace('Tu taza está llena. Ahora te espera la oficina.','¡Superaste la sala de estar y alcanzaste la cafetera!',false);
replace("$('resume').innerHTML='Continuar a la oficina <span>↗</span>'","$('resume').innerHTML='Jugar de nuevo <span>↗</span>'",false);
replace("$('resume').onclick=()=>state==='won'?nextLevel():pause()","$('resume').onclick=()=>state==='won'?start():pause()");
replace("$('nextLevel').hidden=auto;$('resultEyebrow')","$('nextLevel').hidden=true;$('resultEyebrow')",false);
replace("'¡Te caíste fuera de la cocina!'","'¡Caíste desde los muebles de la sala!'");
replace("'Una caída desde la mesa te rompe. ¡Baja por la silla!'","'Baja por el banquito, esquiva al gato y escala los libreros.'");
replace('bajar por la silla y subir hacia la cafetera','cruzar la sala y escalar los libreros',false);
replace('CAFETERA · ${Math.round(Math.hypot(gx,gz))}','CAFETERA · ${Math.round(Math.hypot(gx,gz))}',false);
replace('function nextLevel(){location.href=new URL(location.protocol===\'file:\'?\'../oficina/index.html\':\'../oficina/\',location.href).href;}',
 'function nextLevel(){start();}',false);
const hook=`\nif(new URLSearchParams(location.search).get('test')==='1')window.__coffee={get state(){return state},get player(){return player},get mug(){return mug},get time(){return worldTime},get camera(){return camera},get scene(){return scene},start,tick,win,pause,get telemetry(){return TEL}};\n`;
const findPack=html=>{const i=html.indexOf('const payload=')+14,j=html.indexOf(';',i);if(i<14||j<i)throw Error('HTML sin payload');return [i,j,JSON.parse(html.slice(i,j))];};
let html=base.replace('Cocina abierta · Nivel 1','Sala de estar · Nivel 4')
 .replace('DEMO 03 · COCINA ABIERTA','NIVEL 04 · SALA DE ESTAR')
 .replace('UNA TAZA. UNA COCINA. UN DESTINO.','UNA TAZA. UNA SALA. UN DESTINO.')
 .replace('Primero, la aventura.<br>Después, <em>el café.</em>','Una sala peligrosa.<br>Y al final, <em>el café.</em>')
 .replace(/<p>Eres una taza[\s\S]*?<\/p>/,'<p>Recorre una sala de estar a escala de taza: dos sofás enfrentados, una mesita central, macetas y estanterías llenas de libros. Escala por las repisas laterales hasta el mueble del televisor y sube al segundo nivel para alcanzar la cafetera.</p>')
 .replace(/<p>Puedes <b>bajar[\s\S]*?<\/p>/,'<p>La aspiradora rompe la taza si te alcanza en el suelo. El gato te golpea fuerte y puede subir a los sofás o a la mesita: si te empuja desde ellos, la taza se rompe. En la parte alta, los ventiladores empujan hacia el vacío y el pegamento ralentiza y bloquea el salto. Usa los checkpoints y busca un camino seguro.</p>');
let [i,j,pack]=findPack(html);
html=html.slice(0,i)+JSON.stringify({...pack,game:encode(living+hook),physics:encode(read('src/living-physics.js'))})+html.slice(j);
write('public/sala/index.html',html);write('src/living-game.generated.js',living);
// Enlazar la victoria de la obra a la sala. Mantener intactos los otros niveles.
let obra=read('public/obra/index.html');[i,j,pack]=findPack(obra);
let old=Buffer.from(pack.game,'base64').toString(),next=old;
next=next.replace("$('resume').onclick=()=>state==='won'?start():pause()",
 "$('resume').onclick=()=>state==='won'?location.assign(new URL(location.protocol==='file:'?'../sala/index.html':'../sala/',location.href)):pause()");
next=next.replace("$('resume').innerHTML='Jugar de nuevo <span>↗</span>'",
 "$('resume').innerHTML='Continuar a la sala <span>↗</span>'");
next=next.replace("$('nextLevel').onclick=()=>{location.href='/obra/';};",
 "$('nextLevel').onclick=()=>{location.href='/sala/';};");
if(next===old)throw Error('No se identificó el botón de transición de obra a sala');
pack.game=encode(next);obra=obra.slice(0,i)+JSON.stringify(pack)+obra.slice(j);
write('public/obra/index.html',obra);write('src/construction-game.generated.js',next);
(async()=>{
 let layouts=JSON.parse(read('public/levels.json'));
 const m=await import('data:text/javascript;base64,'+encode(read('src/living-physics.js')));
 layouts['sala-04-estar']={platforms:m.platforms,walls:[],pots:m.POTS,glue:m.GLUE,fans:m.FANS};
 write('public/levels.json',JSON.stringify(layouts));
 console.log('Nivel 04 listo: /sala/; transición obra → sala y levels.json');
})().catch(e=>{console.error(e);process.exitCode=1});
