// Opcional (como browser.test.cjs): npm install --no-save playwright; npx playwright install chromium
// Variables: PLAYWRIGHT_MODULE, COFFEE_BROWSER y, para usar un servidor ya encendido, COFFEE_BASE (p. ej. http://localhost:3000).
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawn}=require('node:child_process'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),port=3189,base=process.env.COFFEE_BASE||`http://localhost:${port}`;
const data=fs.mkdtempSync(path.join(os.tmpdir(),'coffee-airport-test-'));
const server=process.env.COFFEE_BASE?null:spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,PORT:String(port),COFFEE_DATA_DIR:data},stdio:['ignore','pipe','pipe']});
(async()=>{let browser;
try{
 if(server)await new Promise((ok,no)=>{server.stdout.once('data',ok);server.once('error',no);setTimeout(()=>no(Error('Servidor no disponible')),5000).unref();});
 const T=await import(pathToFileURL(path.join(root,'src/terminal-physics.js')).href),E=await import(pathToFileURL(path.join(root,'src/embarque-physics.js')).href);
 browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],...(process.env.COFFEE_BROWSER?{executablePath:process.env.COFFEE_BROWSER}:{})});
 const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.cp_username='Prueba aeropuerto';localStorage.cp_player_id='qa-airport';});
 const go=async level=>{await page.goto(base+'/'+level+'/?test=1');await page.waitForFunction(()=>!!window.__coffee);await page.locator('#play').click();};
 const put=(i,Q)=>page.evaluate(([i,q])=>{const p=__coffee.player;Object.assign(p,{x:q.x,y:q.y,z:q.z,vy:0,grounded:true,platform:i,dropOriginY:q.y,kx:0,kz:0});},[i,Q.platforms[i]]);
 // ── Nivel 6 ──
 await go('terminal');
 // 1) Maleta de la cinta B: se coloca a la taza justo donde la física sitúa la maleta en ese instante.
 const strike=async(Q,plat)=>{const t0=await page.evaluate(()=>__coffee.time),tt=t0+.4,sc=Q.suitcaseAt(tt,0);
  const h=await page.waitForFunction(([s,plat,tt])=>{const c=__coffee;if(c.time<tt)return false;c.mug.inv=0;c.mug.hp=100;Object.assign(c.player,{x:s.x,y:s.y,z:s.z,platform:plat,grounded:true,vy:0});c.tick(1/120);return {hp:c.mug.hp};},[sc,plat,tt],{polling:'raf'});
  return (await h.jsonValue()).hp;};
 const hit=await strike(T,9);
 assert.ok(hit<100,'la maleta resta salud ('+hit+')');
 // 2) Suelo mortal: reaparece en el último checkpoint y cuenta la caída.
 const fall=await page.evaluate(()=>{__coffee.start();Object.assign(__coffee.player,{x:-17,y:3.2,z:-6,platform:0,grounded:false,dropOriginY:3.2});for(let i=0;i<400;i++)__coffee.tick(1/120);return {state:__coffee.state,falls:__coffee.mug.falls,platform:__coffee.player.platform};});
 assert.equal(fall.falls,1);assert.equal(fall.state,'playing');assert.equal(fall.platform,0);
 // 3) Cinta A arrastra a la taza (invulnerable para aislar el efecto de las cortinas).
 const belt=await page.evaluate(()=>{const c=__coffee;c.start();const p=c.player;c.mug.inv=99;Object.assign(p,{x:3.8,y:3.45,z:.7,platform:7,dropOriginY:3.45});const x0=p.x;for(let i=0;i<60;i++)c.tick(1/120);return p.x-x0;});
 assert.ok(belt>.5,'la cinta A empuja a +x ('+belt+')');
 // 4) Victoria normal → telemetría y transición al nivel 7.
 await page.evaluate(()=>{__coffee.start();const q=__coffee.player;Object.assign(q,{x:22.3,y:3.9,z:-.4,platform:11,dropOriginY:3.9,checkpointRank:5});for(let i=0;i<400;i++)__coffee.tick(1/120);});
 assert.equal(await page.evaluate(()=>__coffee.state),'won');
 if(!process.env.COFFEE_BASE)await page.waitForFunction(async()=>{const l=await (await fetch('/api/partidas?nivel=terminal-06-seguridad')).json();return l.some(p=>p.result==='victoria')});
 await page.locator('#resume').click();await page.waitForURL('**/embarque/**');
 // ── Nivel 7 ──
 await go('embarque');   // el enlace de continuar no lleva ?test=1: se recarga con el gancho de pruebas
 // 5) Goteras: un emisor sobre el bebedero I diluye el café (+12 % por gota).
 const e=E.DRIPS[0];
 const dil=await page.evaluate(([x,y,z])=>{const c=__coffee;c.start();const p=c.player;Object.assign(p,{x,y,z,platform:2,dropOriginY:y,grounded:true});for(let i=0;i<120*7;i++){c.tick(1/120);Object.assign(p,{x,z});}return c.mug.dil;},[e.x,E.platforms[2].y,e.z]);
 assert.ok(dil>=12,'las gotas diluyen el café ('+dil+')');
 // 6) Chorro de aire: elimina todas las hormigas adheridas al instante.
 const jet=E.AIR_JETS[0],cleaned=await page.evaluate(([j,y])=>{const c=__coffee;c.start();const p=c.player;
  c.attached.push({m:c.scene.children[0]},{m:c.scene.children[0]},{m:c.scene.children[0]});const before=c.attached.length;
  Object.assign(p,{x:j.x,y,z:j.z,platform:4,dropOriginY:y,grounded:true});c.tick(1/120);return [before,c.attached.length];},[jet,E.platforms[4].y]);
 assert.deepEqual(cleaned,[3,0]);
 // 7) Maleta rodante del carril (alta velocidad) y recorrido guiado completo con el motor real.
 await page.evaluate(()=>__coffee.start());
 const rail=await strike(E,10);
 assert.ok(rail<=90,'la maleta del carril golpea más fuerte ('+rail+')');
 await page.evaluate(()=>{__coffee.start(true);for(let i=0;i<120*60&&__coffee.state!=='won';i++)__coffee.tick(1/120);});
 assert.equal(await page.evaluate(()=>__coffee.state),'won');
 assert.equal(await page.evaluate(()=>__coffee.player.checkpointRank),5);
 assert.deepEqual(errors,[]);
 console.log('✓ Navegador nivel 6: maleta, suelo mortal, cinta, victoria, telemetría y paso al nivel 7');
 console.log('✓ Navegador nivel 7: goteras (dilución), chorro de aire (hormigas) y recorrido guiado');
}finally{await browser?.close();if(server){server.kill();await new Promise(r=>server.once('exit',r));}fs.rmSync(data,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
