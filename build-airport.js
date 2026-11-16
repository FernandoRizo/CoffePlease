'use strict';
// Empaqueta los niveles 6 (terminal: comidas + seguridad) y 7 (embarque VIP) sobre el motor compartido.
// No modifica el motor ni los niveles 1–4: lee src/game.js y la plantilla HTML (con Three.js incluido) de public/juego.
// Ejecutar después de build.js, build-construction.js y build-living.js (npm run build ya lo hace en orden).
const fs=require('node:fs'),path=require('node:path');
const root=__dirname,read=p=>fs.readFileSync(path.join(root,p),'utf8'),encode=s=>Buffer.from(s).toString('base64');
const write=(p,s)=>{const f=path.join(root,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,s);};
const baseHtml=read('public/juego/index.html'),game=read('src/game.js');
const M1='// === UNA COCINA',M2='// Perfil de taza';
if(!game.includes(M1)||!game.includes(M2))throw Error('No se encontró el motor compartido: revisar src/game.js');
const findPack=html=>{const i=html.indexOf('const payload=')+14,j=html.indexOf(';',i);if(i<14||j<i)throw Error('HTML sin payload');return [i,j,JSON.parse(html.slice(i,j))];};
const [pa,pb,vendor]=findPack(baseHtml);
const hook=`\nif(new URLSearchParams(location.search).get('test')==='1')window.__coffee={get state(){return state},get player(){return player},get mug(){return mug},get time(){return worldTime},get camera(){return camera},get scene(){return scene},start,tick,win,pause,get telemetry(){return TEL},get attached(){return att},get drops(){return drops}};\n`;

const LEVELS=[{
 id:'terminal-06-seguridad',dir:'terminal',fn:'terminal',phys:'terminal-physics',scene:'terminal-scene',gen:'terminal-game.generated.js',
 names:'CONVEYORS,SUITCASES,CURTAINS,PUSHERS,ANT_SPAWNS,suitcaseAt,curtainAt',
 reset:'terminalHintUntil=0;',dripHook:'if(false)',dropClear:false,
 camIntro:'const mobile=innerWidth<700;desired.set(mobile?4:3,mobile?54:43,mobile?52:41);look.set(0,1,0);',camInit:'camera.position.set(3,43,41);camTarget.set(0,1,0)',
 stage:'NIVEL 06 · TERMINAL · COMIDAS Y SEGURIDAD',edition:'NIVEL 06 · TERMINAL · COMIDAS Y SEGURIDAD',title:'Terminal · Nivel 6',
 h1:'Un aeropuerto enorme.<br>Un <em>café a tiempo.</em>',made:'UNA TAZA. UNA TERMINAL. UN DESTINO.',
 intro:'<p>Cruza una terminal internacional a escala de taza: plaza de comidas con hormigas y escarabajos, y un filtro de seguridad con cintas, rayos X y maletas. Aquí el suelo es la derrota.</p>',
 help:'<p>Aquí <b>el suelo pulido es la derrota</b>: no hay red de seguridad, cualquier caída al piso termina la partida. Las <b>cintas transportadoras</b> te arrastran (una a favor, otra en contra). Las <b>cortinas de plomo</b> del escáner se balancean y las <b>maletas</b> golpean según su velocidad relativa: salta por encima o rodéalas. Los empujadores no quitan salud, te lanzan al vacío. Sacude las hormigas saltando varias veces o girando bruscamente. Hay checkpoints tras la plaza, la inspección y la revisión manual.</p>',
 start:'Cruza la plaza de comidas y el filtro de seguridad. ¡El suelo es la derrota!',auto:'Recorrido guiado · plaza de comidas → escáner → cafetería exprés',
 fall:'¡Caíste al suelo pulido de la terminal! Derrota instantánea.',win:'¡Superaste la plaza de comidas y el filtro de seguridad!',
 next:{label:'Continuar al embarque',href:'embarque'}
},{
 id:'embarque-07-vip',dir:'embarque',fn:'embarque',phys:'embarque-physics',scene:'embarque-scene',gen:'embarque-game.generated.js',
 names:'SUITCASES,PUSHERS,ANT_SPAWNS,DRIPS,DRIP_MIN,DRIP_MAX,AIR_JETS,suitcaseAt',
 reset:'embarqueJetHint=0;',dripHook:'embarqueDrips(dt);if(false)',dropClear:true,
 camIntro:'const mobile=innerWidth<700;desired.set(mobile?4:3,mobile?54:43,mobile?52:41);look.set(0,1.5,1);',camInit:'camera.position.set(3,43,41);camTarget.set(0,1.5,1)',
 stage:'NIVEL 07 · TERMINAL · BEBEDEROS Y SALA VIP',edition:'NIVEL 07 · TERMINAL · BEBEDEROS Y SALA VIP',title:'Embarque VIP · Nivel 7',
 h1:'Goteras, maletas<br>y un <em>espresso VIP.</em>',made:'UNA TAZA. UNA TERMINAL. UN DESTINO.',
 intro:'<p>Bebederos averiados, goteras de A/C y la sala de embarque: limpia las hormigas con aire, cruza puentes de maletas y salta las que ruedan hasta el mostrador VIP.</p>',
 help:'<p>El <b>suelo pulido sigue siendo la derrota</b>. Cada gota que cae en la taza suma <b>+12% de dilución</b> y te vuelve algo más lenta. Atravesar un <b>chorro de aire limpio</b> elimina todas las hormigas al instante. En el embarque hay puentes angostos de maletas apiladas, dos empujadores en la banca y un carril donde dos maletas ruedan a alta velocidad: salta por encima. Checkpoints: pasarela de ductos, maleta II y mostrador VIP.</p>',
 start:'Esquiva las goteras, limpia las hormigas con el aire y cruza el embarque. ¡El suelo es la derrota!',auto:'Recorrido guiado · bebederos → secador → maletas → mostrador VIP',
 fall:'¡Caíste al suelo pulido de la terminal! Derrota instantánea.',win:'¡Superaste la terminal y alcanzaste el espresso de la sala VIP!',
 next:null
}];

function buildGame(L){
 const head=game.slice(0,game.indexOf(M1)),tail=game.slice(game.indexOf(M2));
 let g=head+read('src/'+L.scene+'.js')+'\n'+tail;
 const rep=(a,b,required=true)=>{if(!g.includes(a)){if(required)throw Error(`[${L.id}] marcador ausente en el motor: `+a.slice(0,90));return;}g=g.split(a).join(b);};
 rep('FLOOR_CRUMBS}','FLOOR_CRUMBS,'+L.names+'}');
 // Iluminación: sin focos de cocina; solo el foco de la cafetera.
 const la=g.indexOf('// Iluminación ambiental'),lb=g.indexOf('const shellM=',la);
 if(la<0||lb<la)throw Error(`[${L.id}] no se encontró el bloque de luces`);
 g=g.slice(0,la)+`const goalL=new THREE.PointLight('#ffe8c6',22,9,2);goalL.position.set(GP.x,GP.y+2,GP.z);scene.add(goalL);\n`+g.slice(lb);
 // Efectos propios del nivel (belts, maletas, goteo...) y enemigos del motor (escarabajos de carga + hormigas).
 const fa=g.indexOf('function fxExtra('),fb=g.indexOf('function roach(',fa);
 if(fa<0||fb<fa)throw Error(`[${L.id}] no se encontró fxExtra`);
 g=g.slice(0,fa)+`function fxExtra(dt){${L.fn}Fx(dt);}\n${L.fn}SpawnEnemies();\n`+g.slice(fb);
 rep('dropT-=dt;if(dropT<=0)',L.dripHook);
 if(L.dropClear)rep("else if(p.y<SINK.y+.06){dustBurst(p.x,SINK.y+.06,p.z,4,'#a9d3dc',1.2,.5);scene.remove(d.m);drops.splice(i,1);}}",
  "else if(p.y<supportHeight(p.x,p.z,p.y+.25)+.06){dustBurst(p.x,p.y,p.z,4,'#a9d3dc',1.2,.5);scene.remove(d.m);drops.splice(i,1);}}");
 // Los empujadores NO restan salud (GDD): se conserva el empujón original del motor (player.kx/kz).
 rep("if(res.hit){const o=obstacleAt(worldTime),vr=Math.hypot(pvx,pvz-3*Math.cos(2.4*worldTime))+1.5;damage(vr*8,0,(Math.sign(player.z-o.z)||1)*3.5);}",`${L.fn}Hazards(res,dt);`);
 // La dilución añade peso: reduce ligeramente la velocidad (GDD §3.4).
 rep('player.speedMul=1-att.length*.05;','player.speedMul=(1-att.length*.05)*(1-mug.dil*.0015);');
 rep('worldTime=0;player=createPlayer();deaths=0',`worldTime=0;${L.reset}player=createPlayer();player.demo=isAuto;deaths=0`);
 rep('heat.material.opacity=.5+Math.sin(worldTime*4)*.15;','');
 rep('const obstacle=obstacleAt(worldTime);rollingPin.position.set(obstacle.x,obstacle.y,obstacle.z);rollingPin.rotation.z=worldTime*3;','');
 rep('const mobile=innerWidth<700;desired.set(mobile?2:1,mobile?29:30,mobile?28:29);look.set(-1.8,1.3,-1.0);',L.camIntro);
 rep('camera.position.set(1,30,29);camTarget.set(-1.8,1.3,-1)',L.camInit);
 rep("level:'cocina-01-referencia'",`level:'${L.id}'`);
 rep('NIVEL 01 · COCINA DE CASA',L.stage);
 rep("'¡Te caíste fuera de la cocina!'",`'${L.fall}'`);
 rep("'Baja por la silla izquierda y evita caer en el agua de la tarja.'",`'${L.start}'`);
 rep("'Recorrido guiado · cruza la tarja saltando por los trastes'",`'${L.auto}'`,false);
 rep('Tu taza está llena. Ahora te espera la oficina.',L.win);
 if(L.next){
  rep("$('resume').innerHTML='Continuar a la oficina <span>↗</span>'",`$('resume').innerHTML='${L.next.label} <span>↗</span>'`);
  rep("function nextLevel(){location.href=new URL(location.protocol==='file:'?'../oficina/index.html':'../oficina/',location.href).href;}",
   `function nextLevel(){location.href=new URL(location.protocol==='file:'?'../${L.next.href}/index.html':'../${L.next.href}/',location.href).href;}`);
 }else{
  rep("$('resume').innerHTML='Continuar a la oficina <span>↗</span>'","$('resume').innerHTML='Jugar de nuevo <span>↗</span>'");
  rep("$('resume').onclick=()=>state==='won'?nextLevel():pause()","$('resume').onclick=()=>state==='won'?start():pause()");
  rep("function nextLevel(){location.href=new URL(location.protocol==='file:'?'../oficina/index.html':'../oficina/',location.href).href;}",'function nextLevel(){start();}');
 }
 return g+hook;
}
function buildHtml(L,gameSrc,physSrc){
 let h=baseHtml
  .replace(/Cocina (abierta|en L) · Nivel 1/,L.title)
  .replace(/(DEMO 03 · COCINA ABIERTA|NIVEL 01 · COCINA EN L)/,L.edition)
  .replace('UNA TAZA. UNA COCINA. UN DESTINO.',L.made)
  .replace('Primero, la aventura.<br>Después, <em>el café.</em>',L.h1)
  .replace(/<p>Eres una taza[\s\S]*?<\/p>/,L.intro)
  .replace(/<p>(Puedes <b>bajar|Para bajar de la mesa)[\s\S]*?<\/p>/,L.help)
  .replace(/aria-label="Cocina familiar[^"]*"/,'aria-label="Terminal de aeropuerto tridimensional con plataformas elevadas, cintas transportadoras y una cafetera"');
 h=h.replace('</style>','body:not(.playing) .intro{background:#f5f1e8ed;padding:22px 28px;border-radius:16px;max-width:470px}body:not(.playing) h1{font-size:40px}@media(max-width:700px){body:not(.playing) .intro{padding:14px;max-width:94%}body:not(.playing) h1{font-size:30px}}\n</style>');
 const i=h.indexOf('const payload=')+14,e=h.indexOf(';',i);
 return h.slice(0,i)+JSON.stringify({...vendor,game:encode(gameSrc),physics:encode(physSrc)})+h.slice(e);
}
(async()=>{
 let layouts={};try{layouts=JSON.parse(read('public/levels.json'));}catch{console.warn('Aviso: public/levels.json no existe; ejecuta antes build.js');}
 for(const L of LEVELS){
  const gameSrc=buildGame(L),physSrc=read('src/'+L.phys+'.js');
  write('public/'+L.dir+'/index.html',buildHtml(L,gameSrc,physSrc));
  write('src/'+L.gen,gameSrc);
  const m=await import('data:text/javascript;base64,'+encode(physSrc));
  const sc=m.SUITCASES.map(s=>({pts:s.pts,y:s.y,w:s.w,d:s.d,mode:s.mode}));
  layouts[L.id]=L.dir==='terminal'
   ?{platforms:m.platforms,walls:[],conveyors:m.CONVEYORS,curtains:m.CURTAINS,suitcases:sc,pushers:m.PUSHERS,ants:m.ANT_SPAWNS}
   :{platforms:m.platforms,walls:[],drips:m.DRIPS,jets:m.AIR_JETS,suitcases:sc,pushers:m.PUSHERS,ants:m.ANT_SPAWNS};
  console.log(`Nivel ${L.id} listo: /${L.dir}/`);
 }
 write('public/levels.json',JSON.stringify(layouts));
 console.log('levels.json actualizado con los niveles 6 y 7');
})().catch(e=>{console.error(e);process.exitCode=1;});
