// Empaqueta ambos niveles sin dependencias. La biblioteca Three.js ya viene incluida.
const fs=require('node:fs'),path=require('node:path');
const root=__dirname,read=p=>fs.readFileSync(path.join(root,p),'utf8'),write=(p,s)=>fs.writeFileSync(path.join(root,p),s);
let kitchen=read('public/juego/index.html');
kitchen=kitchen
 .replace('Cocina abierta · Nivel 1','Cocina en L · Nivel 1')
 .replace('DEMO 03 · COCINA ABIERTA','NIVEL 01 · COCINA EN L')
 .replace(/<p>Eres una taza[\s\S]*?<\/p>/,'<p>Eres una taza pequeña en una cocina enorme. Empieza sobre la mesa, baja por la silla de la izquierda y escala las repisas junto a la zona de limpieza. Cruza la tarja inundada saltando entre platos, una taza y utensilios. Continúa por el microondas, la estufa y la barra lateral hasta la cafetera.</p>')
 .replace(/<p>Puedes <b>bajar[\s\S]*?<\/p>/,'<p>Para bajar de la mesa, usa la silla y el banco: una caída grande rompe la taza. Las repisas de la pared izquierda llevan a las encimeras. La <b>tarja está llena de agua</b>: solo puedes cruzarla saltando por los cuatro trastes. Si te hundes, reapareces en el último checkpoint. Conservas cucarachas, hormigas, estufa caliente, rodillo, charco y latas que caen de las alacenas. La cafetera está al final de la barra derecha.</p>');
const a=kitchen.indexOf('const payload=')+14,b=kitchen.indexOf(';',a),vendor=JSON.parse(kitchen.slice(a,b));
const encode=s=>Buffer.from(s).toString('base64');
let game=read('src/game.js');
let office=game.slice(0,game.indexOf('// === UNA COCINA'))+read('src/office-scene.js')+'\n'+game.slice(game.indexOf('// Perfil de taza'));
office=office.replace('FLOOR_CRUMBS}', 'FLOOR_CRUMBS,FAN,fanAt,CABLES,WALLS,blocked}');
const start=office.indexOf('// Iluminación ambiental'),end=office.indexOf('const shellM=',start);
office=office.slice(0,start)+`const goalL=new THREE.PointLight('#ffe0aa',25,7.4,2);goalL.position.set(GP.x,GP.y+2,GP.z);scene.add(goalL);\n`+office.slice(end);
const fxStart=office.indexOf('function fxExtra('),fxEnd=office.indexOf('function roach(',fxStart);
office=office.slice(0,fxStart)+`function fxExtra(dt){
 for(const s of spinners)s.arm.rotation.y+=s.sp*dt;
 const f=fanAt(worldTime);fanHead.rotation.y=-f.angle;windCone.rotation.y=-f.angle;fanRotor.rotation.x+=dt*24;
 windLines.forEach((m,i)=>{const a=(worldTime*3+i*.57)%FAN.range,spread=(i%3-1)*a*.16;m.position.set(f.x+f.dx*a-f.dz*spread,FAN.y+(i%2)*.2,f.z+f.dz*a+f.dx*spread);m.rotation.y=-f.angle;});
}
makeRoach(FLOOR_INDEX,[[-8,8],[-3,8]]);makeRoach(FLOOR_INDEX,[[2,1.5],[6,1.5]]);makeRoach(4,[[-1,.6],[1,.6]]);
makeSpinner(7,.9,.25);makeSpinner(22,0,0);
for(const [pi,ox,oz] of [[FLOOR_INDEX,2,3.5]]){const p=platforms[pi];spawners.push({pi,x:p.x+ox,z:p.z+oz,cd:2});}
`+office.slice(fxEnd);
office=office.replace("if(player.y>s.y+.55)continue", "if(player.y>s.y+.55||player.y+.84<s.y+.1)continue");
office=office.replace("r.x=clamp(r.x+r.hx*sp*dt,p.x-p.w/2+.1,p.x+p.w/2-.1);r.z=clamp(r.z+r.hz*sp*dt,p.z-p.d/2+.1,p.z+p.d/2-.1);", "const nx=clamp(r.x+r.hx*sp*dt,p.x-p.w/2+.1,p.x+p.w/2-.1),nz=clamp(r.z+r.hz*sp*dt,p.z-p.d/2+.1,p.z+p.d/2-.1);if(r.pi!==FLOOR_INDEX||!blocked(nx,nz,{y:0})){r.x=nx;r.z=nz;}else{r.st='PATROL';r.cool=1;r.wp=(r.wp+1)%r.pts.length;}");
office=office.replace("player.kx=ix/il*I;player.kz=iz/il*I;player.kt=.3;", "damage(14,ix/il*I,iz/il*I);");
office=office.replace('4.10,SINK.z-.27','SINK.y+1.1,SINK.z-.8');
office=office.replace('function postStep(res,dt){',`let hazardHintUntil=0;
function postStep(res,dt){
 if(!auto&&worldTime>hazardHintUntil&&(res.wind||res.cable)){notify(res.wind?'¡Viento! Espera el giro o busca cobertura.':'Cable: te frena. Salta para cruzarlo.');hazardHintUntil=worldTime+4;}
`);
office=office.replace('worldTime=0;player=createPlayer()', 'worldTime=0;hazardHintUntil=0;player=createPlayer()');
office=office.replace('heat.material.opacity=.5+Math.sin(worldTime*4)*.15;', '');
office=office.replace('rollingPin.rotation.z=worldTime*3;', 'rollingPin.rotation.y=worldTime*.8;');
office=office.replace("level:'cocina-01-referencia'", "level:'oficina-02-plano'");
office=office.replaceAll('NIVEL 01 · COCINA DE CASA','NIVEL 02 · LA OFICINA');
office=office.replace('player=createPlayer();deaths=0','player=createPlayer();player.demo=isAuto;deaths=0');
office=office.replace("'Baja por la silla izquierda y evita caer en el agua de la tarja.'", "'Baja del fregadero por la silla. Cruza el pasillo y escala las repisas.'");
office=office.replace('bajar por la silla y subir hacia la cafetera','fregadero → pasillo → repisas → cafetera');
office=office.replace("const mobile=innerWidth<700;desired.set(mobile?2:1,mobile?29:30,mobile?28:29);look.set(-1.8,1.3,-1.0);", "const mobile=innerWidth<700;desired.set(mobile?4:3,mobile?46:37,mobile?44:34);look.set(0,0,0);");
office=office.replace("camera.position.set(1,30,29);camTarget.set(-1.8,1.3,-1)","camera.position.set(3,37,34);camTarget.set(0,0,0)");
// La cocina continúa a la oficina; la oficina conserva el botón de volver a jugar.
office=office.replace("state==='won'?nextLevel():pause()", "state==='won'?start():pause()");
office=office.replace("$('resume').innerHTML='Continuar a la oficina <span>↗</span>'", "$('resume').innerHTML='Jugar de nuevo <span>↗</span>'");
office=office.replace('Tu taza está llena. Ahora te espera la oficina.', 'Tu taza está llena. Completaste la oficina.');
// Punto de inspección explícito para pruebas locales, ausente salvo ?test=1.
const hook=`\nif(new URLSearchParams(location.search).get('test')==='1')window.__coffee={get state(){return state},get player(){return player},get mug(){return mug},get time(){return worldTime},get camera(){return camera},get scene(){return scene},start,tick,win,pause,get telemetry(){return TEL}};\n`;
function pack(html,g,p){const aa=html.indexOf('const payload=')+14,bb=html.indexOf(';',aa);return html.slice(0,aa)+JSON.stringify({...vendor,game:encode(g+hook),physics:encode(p)})+html.slice(bb);}
write('public/juego/index.html',pack(kitchen,game,read('src/physics.js')));
let html=kitchen.replace('Cocina abierta · Nivel 1','La oficina · Nivel 2').replace('DEMO 03 · COCINA ABIERTA','V1.3 · LA OFICINA').replace('Cocina familiar tridimensional con mesa central, alacenas, ventana, puerta y una cafetera','Oficina con cuatro cubículos, libreros, sillas, ventilador y cafetera');
html=html.replace('UNA TAZA. UNA COCINA. UN DESTINO.','UNA TAZA. UNA OFICINA. UN DESTINO.');
html=html.replace(/<p>Puedes <b>bajar[\s\S]*?<\/p>/,'<p>Baja del fregadero por la silla y la caja. Camina por el pasillo o salta sobre los asientos y respaldos para alcanzar los escritorios. Las repisas exteriores permiten escalar los dos libreros. Las caídas de más de 2.75 unidades rompen la taza. Salta los cables y espera a que el ventilador apunte a otro lado. Las cucarachas, aspiradora y brazos giratorios pueden golpearte y tirarte. Los puntos de control guardan tu avance.</p>');
html=html.replace('</style>',`@media(max-width:700px){header .brand{white-space:nowrap;font-size:20px;gap:6px}header{padding:0 4%;gap:10px}.edition{gap:0}.edition span{font-size:7px;padding:6px}.hud{left:10px;right:10px;width:auto;display:grid;grid-template-columns:repeat(3,1fr) 34px 34px;gap:8px!important;padding:10px!important}.hud #hpBox{grid-column:1/-1;min-width:0!important}.hud button+button{margin-left:0}.hud div{min-width:0}.hud strong{font-size:18px}.hud #hpBox small{font-size:9px}body.playing #toast{bottom:245px}body.playing .mobile-controls{bottom:80px}body.playing .stage-label{right:10px;bottom:12px;max-width:95%;font-size:8px}}\n</style>`);
html=html.replace('Primero, la aventura.<br>Después, <em>el café.</em>','Una oficina enorme.<br>Un <em>pequeño café.</em>').replace(/<p>Eres una taza[\s\S]*?<\/p>/,'<p>Del fregadero a la cafetera.<br>Salta entre sillas, recorre los cubículos y escala los libreros.<br>Espera el giro del ventilador. Cuida cada caída.</p>');
html=html.replace('</style>',`\nbody:not(.playing) .intro{background:#f5f1e8ed;padding:22px 28px;border-radius:16px;top:20%;left:3%;max-width:450px}body:not(.playing) h1{font-size:40px}body.playing header{height:70px;background:#f5f1e8d9}body.playing .hud{top:85px}body.playing .bottom-bar{display:none}body.playing .stage-label{bottom:25px;background:#f5f1e8dd;padding:10px;border-radius:8px}body.playing #toast{bottom:85px}.intro a{pointer-events:auto;color:#315849}@media(max-width:700px){body:not(.playing) .intro{top:12%;padding:14px;max-width:94%;}body:not(.playing) h1{font-size:30px}.hud{gap:10px!important}.stage-label span{display:none}}\n</style>`);
html=html.replace('Sin prisa. Sin vidas limitadas. Con mucho café.','<a href="../juego/">← Cocina</a> · <a href="../dashboard/?nivel=oficina-02-plano">Dashboard</a> · Sin vidas limitadas.');
html=html.replace('</style>','@media(max-width:700px){body.playing #toast{bottom:245px}}\n</style>');
fs.mkdirSync(path.join(root,'public/oficina'),{recursive:true});
write('public/oficina/index.html',pack(html,office,read('src/office-physics.js')));
write('src/office-game.generated.js',office);
console.log('Cocina y oficina empaquetadas.');
(async()=>{
 const layouts={};
 for(const [id,file] of [['cocina-01-referencia','physics'],['oficina-02-plano','office-physics']]){
  const m=await import('data:text/javascript;base64,'+encode(read('src/'+file+'.js')));
  layouts[id]={platforms:m.platforms,walls:m.WALLS||[],water:m.WATER||null,cans:m.CAN_STATIONS||[]};
 }
 write('public/levels.json',JSON.stringify(layouts));
})();
