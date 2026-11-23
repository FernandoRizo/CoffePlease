'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const stages=[
 ['juego','cocina-01-referencia','oficina'],
 ['oficina','oficina-02-plano','obra'],
 ['obra','obra-03-construccion','sala'],
 ['sala','sala-04-estar','terminal'],
 ['terminal','terminal-06-seguridad','embarque'],
 ['embarque','embarque-07-vip',null]
];
const script=JSON.parse(read('package.json')).scripts.build;
assert.ok(script.indexOf('build-airport.js')>script.indexOf('build-living.js'),'El aeropuerto debe empaquetarse al final');
const layouts=JSON.parse(read('public/levels.json'));
assert.equal(Object.keys(layouts).length,6,'Deben existir cuatro niveles previos y los niveles 6–7; el 5 está pendiente');
const dashboard=read('public/dashboard/index.html');
for(const [dir,id,target] of stages){
 const filename='public/'+dir+'/index.html';
 assert.ok(fs.statSync(path.join(root,filename)).size>500_000,filename+' debe ser un bundle jugable, no solo un archivo vacío');
 const html=read(filename),i=html.indexOf('const payload=');
 assert.ok(i>=0,filename+' no tiene motor Three.js empacado');
 const a=i+'const payload='.length,b=html.indexOf(';',a);
 assert.ok(b>a,'Payload incompleto '+filename);
 const pack=JSON.parse(html.slice(a,b));
 const game=Buffer.from(pack.game,'base64').toString('utf8');
 const physics=Buffer.from(pack.physics,'base64').toString('utf8');
 assert.ok(game.includes('new THREE.Scene()'),dir+' perdió la escena');
 assert.ok(physics.includes('function step('),dir+' perdió la física');
 assert.ok(game.includes("level:'"+id+"'"),dir+' debe enviar telemetría con nivel '+id);
 assert.ok(layouts[id]?.platforms?.length,dir+' no figura en levels.json');
 assert.ok(dashboard.includes('value="'+id+'"'),dir+' no aparece en los filtros del dashboard');
 if(target){
  const nav=game.match(/function nextLevel\(\)\{[^}]*\}/)?.[0]||'';
  const resume=game.match(/\$\('resume'\)\.onclick=[^\n]*/)?.[0]||'';
  assert.ok(nav.includes('../'+target+'/')||resume.includes('../'+target+'/'),
   dir+' NO continúa a '+target+' después de ganar');
  assert.ok(resume.includes("state==='won'"),dir+' no distingue victoria de pausa');
 }else{
  assert.ok(game.includes("state==='won'?start():pause()"),'La victoria final del 7 debe permitir rejugar');
 }
}
for(const id of ['terminal-06-seguridad','embarque-07-vip'])assert.ok(layouts[id].platforms.some(p=>p.goal),'Meta ausente: '+id);
for(const dir of ['terminal','embarque'])assert.ok(fs.statSync(path.join(root,'src/'+dir+'-game.generated.js')).size>40000,'Falta JS generado para '+dir);
console.log('✓ Continuidad: cocina → oficina → obra → sala → terminal (6) → embarque (7)');
console.log('✓ Los seis bundles, IDs de telemetría, layouts y filtros del dashboard coinciden');
console.log('ℹ Nivel 5 no está implementado: salto temporal del 4 al 6');
