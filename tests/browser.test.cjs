// Opcional: npm install --no-save playwright; npx playwright install chromium
// O establecer PLAYWRIGHT_MODULE y COFFEE_BROWSER a instalaciones existentes.
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawn}=require('node:child_process');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),data=fs.mkdtempSync(path.join(os.tmpdir(),'coffee-browser-test-')),port=3188,base=`http://localhost:${port}`;
const server=spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,PORT:String(port),COFFEE_DATA_DIR:data},stdio:['ignore','pipe','pipe']});
(async()=>{let browser;
try{
 await new Promise((ok,no)=>{server.stdout.once('data',ok);server.once('error',no);setTimeout(()=>no(Error('Servidor no disponible')),5000).unref();});
 browser=await chromium.launch({headless:true,...(process.env.COFFEE_BROWSER?{executablePath:process.env.COFFEE_BROWSER}:{})});
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.cp_username='Prueba automatizada';localStorage.cp_player_id='qa-browser';});
 const go=async level=>{await page.goto(base+'/'+level+'/?test=1');await page.waitForFunction(()=>!!window.__coffee);};
 await go('oficina');await page.locator('#play').click();
 const initial=await page.evaluate(()=>__coffee.player.x);await page.keyboard.down('KeyW');await page.waitForTimeout(800);await page.keyboard.up('KeyW');
 assert.ok((await page.evaluate(()=>__coffee.player.x))>initial+1,'Movimiento con teclado');
 await page.keyboard.press('KeyP');assert.equal(await page.evaluate(()=>__coffee.state),'paused');const pauseX=await page.evaluate(()=>__coffee.player.x);await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>__coffee.player.x),pauseX);await page.keyboard.press('KeyP');
 const spinner=await page.evaluate(()=>{__coffee.start();Object.assign(__coffee.player,{x:8.9,y:3,z:5.75,platform:7,dropOriginY:3});__coffee.tick(1/120);return __coffee.mug.hp;});assert.ok(spinner<100,'Enemigo giratorio inflige daño');
 const lower=await page.evaluate(()=>{__coffee.start();Object.assign(__coffee.player,{x:8.9,y:0,z:5.75,platform:3,dropOriginY:0});__coffee.tick(1/120);return __coffee.mug.hp;});assert.equal(lower,100,'El golpe no atraviesa el piso del escritorio');
 const roach=await page.evaluate(()=>{__coffee.start();Object.assign(__coffee.player,{x:2.2,y:0,z:1.5,platform:3,dropOriginY:0});for(let i=0;i<600;i++)__coffee.tick(1/120);return {hp:__coffee.mug.hp,kx:__coffee.player.kx,kz:__coffee.player.kz};});assert.ok(roach.hp<100,'Cucaracha embiste y daña');
 const fall=await page.evaluate(()=>{__coffee.start();Object.assign(__coffee.player,{x:10,y:4.8,z:-8.5,platform:22,grounded:false,dropOriginY:4.8,checkpoint:23,checkpointRank:3});for(let i=0;i<300;i++)__coffee.tick(1/120);return {state:__coffee.state,falls:__coffee.mug.falls,platform:__coffee.player.platform};});assert.equal(fall.falls,1);assert.equal(fall.state,'playing');assert.equal(fall.platform,23);
 await page.evaluate(()=>{__coffee.start(true);for(let i=0;i<18000&&__coffee.state!=='won';i++)__coffee.tick(1/120);});assert.equal(await page.evaluate(()=>__coffee.state),'won');
 // Victoria normal: prueba el registro real desde la máquina de estados del juego.
 await page.evaluate(()=>{__coffee.start();Object.assign(__coffee.player,{x:17.6,y:3.5,z:-1.5,platform:8,dropOriginY:3.5});for(let i=0;i<400;i++)__coffee.tick(1/120);});assert.equal(await page.evaluate(()=>__coffee.state),'won');
 await page.waitForFunction(async()=>{const list=await (await fetch('/api/partidas?nivel=oficina-02-plano')).json();return list.some(p=>p.result==='victoria')});
 await go('juego');await page.evaluate(()=>{__coffee.start(true);for(let i=0;i<15000&&__coffee.state!=='won';i++)__coffee.tick(1/120);});assert.equal(await page.evaluate(()=>__coffee.state),'won');await page.locator('#resume').click();await page.waitForURL('**/oficina/');
 await page.goto(base+'/dashboard/?nivel=oficina-02-plano');await page.waitForFunction(()=>document.querySelector('#tb tr[data-id]'));
 assert.equal(await page.locator('#fN').inputValue(),'oficina-02-plano');await page.locator('#tb tr[data-id]').first().click();await page.waitForFunction(()=>document.getElementById('hTit').textContent.startsWith('Partida #'));assert.ok((await page.locator('#dg').innerText()).includes('puntos'));
 await page.locator('#fN').selectOption('');await page.locator('#bAc').click();await page.waitForFunction(()=>document.getElementById('hTit').textContent==='Mapas separados por nivel');
 await page.setViewportSize({width:390,height:844});await go('oficina');assert.ok(await page.locator('#play').isVisible());await page.locator('#play').click();
 assert.ok(await page.locator('#hud').isVisible());assert.equal(await page.locator('#loadError').isVisible(),false);
 assert.deepEqual(errors,[]);
 console.log('✓ Navegador: teclado, pausa, daño de enemigos, caída y checkpoint');
 console.log('✓ Navegador: victoria, transición, telemetría, dashboard y pantalla pequeña');
}finally{await browser?.close();server.kill();await new Promise(r=>server.once('exit',r));fs.rmSync(data,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});

