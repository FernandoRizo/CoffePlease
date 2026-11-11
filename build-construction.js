'use strict';
// Empaqueta el nivel 3 sin descargar bibliotecas. No modifica los niveles 1 y 2.
const fs=require('node:fs'),path=require('node:path');
const root=__dirname,read=p=>fs.readFileSync(path.join(root,p),'utf8'),write=(p,s)=>{const f=path.join(root,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,s);};
const htmlBase=read('public/juego/index.html'),game=read('src/game.js');
const mark='// === UNA COCINA',mark2='// Perfil de taza';
if(!game.includes(mark)||!game.includes(mark2))throw Error('No se encontró el motor compartido: revisar src/game.js');
const head=game.slice(0,game.indexOf(mark)),tail=game.slice(game.indexOf(mark2));
let construction=head+read('src/construction-scene.js')+'\n'+tail;
const replace=(a,b,required=true)=>{if(required&&!construction.includes(a))throw Error('Falta marcador del motor: '+a.slice(0,90));construction=construction.replace(a,b);};
replace('FLOOR_CRUMBS}', 'FLOOR_CRUMBS,groundHeight,OIL_PATCHES,PITS,CONES,onOil,wreckingBallAt,WRECKING_ANCHOR,enemyAt}');
const lightsA=construction.indexOf('// Iluminación ambiental'),lightsB=construction.indexOf('const shellM=',lightsA);
if(lightsA<0||lightsB<0)throw Error('No se identificó el bloque de iluminación');
construction=construction.slice(0,lightsA)+`const goalL=new THREE.PointLight('#ffe5b2',22,9,2);goalL.position.set(GP.x,GP.y+2,GP.z);scene.add(goalL);\n`+construction.slice(lightsB);
const fxA=construction.indexOf('function fxExtra('),fxB=construction.indexOf('function roach(',fxA);
if(fxA<0||fxB<0)throw Error('No se identificó el bloque de enemigos');
construction=construction.slice(0,fxA)+`function fxExtra(dt){
 for(const s of spinners)s.arm.rotation.y+=s.sp*dt;
 const b=wreckingBallAt(worldTime),A=WRECKING_ANCHOR;
 const diff=new THREE.Vector3(b.x-A.x,b.y-A.y,b.z-A.z),len=diff.length();
 craneCable.position.set((A.x+b.x)/2,(A.y+b.y)/2,(A.z+b.z)/2);
 craneCable.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),diff.normalize());
 craneCable.scale.y=len/5.6;
 enemyAt(worldTime).forEach((p,i)=>{const bot=constructionBots[i];bot.position.set(p.x,p.y,p.z);bot.rotation.y=Math.sin(worldTime*(i+1))*.4;});
}
makeRoach(FLOOR_INDEX,[[-13.8,8],[-11.5,8]]);
makeRoach(FLOOR_INDEX,[[10,-7.5],[13,-7.5]]);
makeSpinner(6,0,0);
`+construction.slice(fxB);
replace('if(player.y>s.y+.55)continue','if(player.y>s.y+.55||player.y+.84<s.y+.1)continue');
replace('r.g.position.set(r.x,p.y+.1,r.z);', 'r.g.position.set(r.x,(groundHeight(r.x,r.z)??0)+.1,r.z);');
replace('player.kx=ix/il*I;player.kz=iz/il*I;player.kt=.3;', 'damage(15,ix/il*I,iz/il*I);');
replace('dropT-=dt;if(dropT<=0)', 'if(false)');
const oldHit="if(res.hit){const o=obstacleAt(worldTime),vr=Math.hypot(pvx,pvz-3*Math.cos(2.4*worldTime))+1.5;damage(vr*8,0,(Math.sign(player.z-o.z)||1)*3.5);}";
replace(oldHit,`if(res.hit){const o=obstacleAt(worldTime),dx=player.x-o.x,dz=player.z-o.z,len=Math.hypot(dx,dz)||1;damage(36,dx/len*7,dz/len*7);}
 if(res.enemy){const e=enemyAt(worldTime).sort((a,b)=>Math.hypot(player.x-a.x,player.z-a.z)-Math.hypot(player.x-b.x,player.z-b.z))[0];const dx=player.x-e.x,dz=player.z-e.z,len=Math.hypot(dx,dz)||1;damage(18,dx/len*5,dz/len*5);}
 if(res.oil&&!oilHint){notify('¡ACEITE! Movimiento lento y salto desactivado. Sal del charco.');oilHint=true;}
 if(!res.oil)oilHint=false;`);
replace('function postStep(res,dt){', 'let oilHint=false;\nfunction postStep(res,dt){');
replace('worldTime=0;player=createPlayer()', 'worldTime=0;oilHint=false;player=createPlayer()');
replace('let best=platforms[FLOOR_INDEX].y;', 'let best=groundHeight(x,z)??-2.9;');
replace("'¡Te caíste fuera de la cocina!'", "'¡Caíste en un hoyo de la construcción!'");
replace("'Una caída desde la mesa te rompe. ¡Baja por la silla!'", "'Baja por los palés, rodea los hoyos y evita el aceite. ¡Cuidado con la grúa!'");
replace('bajar por la silla y subir hacia la cafetera','descender del andamio, cruzar la obra y subir a la mesita',false);
replace('heat.material.opacity=.5+Math.sin(worldTime*4)*.15;','');
replace('rollingPin.rotation.z=worldTime*3;', 'rollingPin.rotation.y=worldTime*.25;');
replace('const mobile=innerWidth<700;desired.set(mobile?5:7,13,mobile?21:22);look.set(mobile?-1.5:-1.7,3.0,-3.2);', 'const mobile=innerWidth<700;desired.set(mobile?-13:-8,mobile?25:32,mobile?32:35);look.set(-4,1,0);');
replace('camera.position.set(7,13,22);camTarget.set(-1.7,3,-3.2)', 'camera.position.set(-8,32,35);camTarget.set(-4,1,0)');
replace("level:'cocina-01-referencia'", "level:'obra-03-construccion'");
replace('NIVEL 01 · COCINA DE CASA','NIVEL 03 · OBRA EN CONSTRUCCIÓN');
replace("$('nextLevel').hidden=auto;$('resultEyebrow')", "$('nextLevel').hidden=true;$('resultEyebrow')",false);
replace('Tu taza está llena y la aventura está completa.', '¡Sobreviviste a la obra y llegaste a la mesita!',false);
replace('Tu taza está llena. Ahora te espera la oficina.', '¡Sobreviviste a la obra y llegaste a la mesita!',false);
replace("$('resume').innerHTML='Continuar a la oficina <span>↗</span>'","$('resume').innerHTML='Jugar de nuevo <span>↗</span>'",false);
replace("state==='won'?nextLevel():pause()","state==='won'?start():pause()",false);
replace("$('nextLevel').onclick=()=>{location.href='/oficina/';};", "$('nextLevel').onclick=()=>{location.href='/obra/';};",false);
replace('CAFETERA · ${Math.round(Math.hypot(gx,gz))}', 'MESITA · ${Math.round(Math.hypot(gx,gz))}',false);
// Conservar posibilidad de prueba de navegador del motor compartido.
const hook=`\nif(new URLSearchParams(location.search).get('test')==='1')window.__coffee={get state(){return state},get player(){return player},get mug(){return mug},get time(){return worldTime},get camera(){return camera},get scene(){return scene},start,tick,win,pause,get telemetry(){return TEL}};\n`;
const a=htmlBase.indexOf('const payload=')+14,b=htmlBase.indexOf(';',a);
if(a<14||b<a)throw Error('No se encontró el HTML autocontenido');
const vendor=JSON.parse(htmlBase.slice(a,b)),encode=s=>Buffer.from(s).toString('base64');
let html=htmlBase.replace('Cocina abierta · Nivel 1','Obra en construcción · Nivel 3')
 .replace('DEMO 03 · COCINA ABIERTA','NIVEL 03 · OBRA EN CONSTRUCCIÓN')
 .replace('UNA TAZA. UNA COCINA. UN DESTINO.','UNA TAZA. UNA OBRA. UN DESTINO.')
 .replace('Primero, la aventura.<br>Después, <em>el café.</em>','Una obra peligrosa.<br>Un <em>último café.</em>')
 .replace(/<p>Eres una taza[\s\S]*?<\/p>/,'<p>Comienza sobre un andamio y desciende por palés. Cruza un terreno irregular, esquiva hoyos y enemigos. Los charcos de aceite te frenan e impiden saltar. La bola de demolición barre el centro. Escala barriles y sacos hasta la mesita del café.</p>')
 .replace(/<p>Puedes <b>bajar[\s\S]*?<\/p>/,'<p>Las caídas grandes rompen la taza. Los hoyos son mortales; el aceite reduce la velocidad y desactiva el salto. Rodea los conos, esquiva la bola de demolición y a los robots de obra. Hay checkpoints, y puedes explorar el terreno o tomar rutas elevadas.</p>');
const aa=html.indexOf('const payload=')+14,bb=html.indexOf(';',aa);
if(aa<14||bb<aa)throw Error('No se encontró la plantilla para el nivel 3');
html=html.slice(0,aa)+JSON.stringify({...vendor,game:encode(construction+hook),physics:encode(read('src/construction-physics.js'))})+html.slice(bb);
write('public/obra/index.html',html);
write('src/construction-game.generated.js',construction);
// Enlazar la victoria de la oficina con la obra sin sobrescribir la escena ni la física previas.
// Funciona con la versión 1.3 del repositorio (botón de continuar) y la 1.2 (nextLevel).
try{
 let off=read('public/oficina/index.html'),a=off.indexOf('const payload=')+14,b=off.indexOf(';',a);
 if(a>=14&&b>a){
  const pack=JSON.parse(off.slice(a,b));let src=Buffer.from(pack.game,'base64').toString();
  const before=src;
  src=src.replace("$('resume').onclick=()=>state==='won'?start():pause()","$('resume').onclick=()=>state==='won'?location.assign(new URL(location.protocol==='file:'?'../obra/index.html':'../obra/',location.href)):pause()");
  src=src.replace("$('resume').innerHTML='Jugar de nuevo <span>↗</span>'","$('resume').innerHTML='Continuar a la obra <span>↗</span>'");
  src=src.replace("$('nextLevel').onclick=()=>{location.href='/juego/';};","$('nextLevel').onclick=()=>{location.href='/obra/';};");
  if(src!==before){pack.game=encode(src);off=off.slice(0,a)+JSON.stringify(pack)+off.slice(b);write('public/oficina/index.html',off);write('src/office-game.generated.js',src);}
  else console.warn('Aviso: no se identificó la transición desde oficina; revisa el botón al ganar.');
 }
}catch(e){console.warn('Aviso: no se pudo enlazar oficina → obra:',e.message);}

(async()=>{
 let layouts={};try{layouts=JSON.parse(read('public/levels.json'));}catch{
  for(const [id,file] of [['cocina-01-referencia','physics'],['oficina-02-plano','office-physics']]){
   const m=await import('data:text/javascript;base64,'+encode(read(`src/${file}.js`)));
   layouts[id]={platforms:m.platforms,walls:m.WALLS||[]};
  }
 }
 const m=await import('data:text/javascript;base64,'+encode(read('src/construction-physics.js')));
 layouts['obra-03-construccion']={platforms:m.platforms,walls:[],pits:m.PITS,oil:m.OIL_PATCHES};
 write('public/levels.json',JSON.stringify(layouts));
 console.log('Nivel 3 empaquetado: /obra/ y levels.json actualizados');
})().catch(e=>{console.error(e);process.exitCode=1});