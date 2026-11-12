import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../src/physics.js',import.meta.url));
const P=await import('data:text/javascript;base64,'+src.toString('base64'));
const {platforms,createPlayer,step,autoInput,FLOOR_INDEX,GOAL_INDEX,hitsFallingCan,CAN_STATIONS}=P;
const dt=1/120;
function descend(index,x,z){
 const p=createPlayer(index);p.x=x;p.z=z;let result;
 for(let i=0;i<400;i++){result=step(p,{x:0,z:0,jump:false},dt,i*dt);if(p.grounded||result.dead)break;}
 return {p,result};
}
assert.equal(descend(0,-3.1,5.65).result.reason,'caída alta');
assert.equal(descend(0,-3.1,5.65).result.dead,true);
assert.equal(descend(1,1.2,4).result.dead,false);
assert.ok(descend(1,1.2,4).result.fallDamage>0);
assert.equal(descend(2,3.45,4.5).result.fallDamage,0);

// El atajo derecho dejó de tener escalones. La única cadena de ascenso es izquierda→frigorífico.
assert.equal(platforms.some(p=>p.name==='Caja baja'||p.name==='Caja de provisiones'||p.name==='Cajón entreabierto'),false);
assert.equal(platforms[19].kind,'fridge');
assert.equal(platforms[19].checkpointRank,3);
assert.equal(platforms[10].checkpointRank,4);
assert.ok(platforms.slice(13).filter(p=>p.kind==='shelf'||p.kind==='wallShelf').length>=6);
assert.ok(!platforms.slice(13).some(p=>p.x>3));

const demo=createPlayer();let reached=false;const visited=new Set();let last;
for(let i=0;i<16000;i++){
 last=step(demo,autoInput(demo),dt,i*dt);
 assert.equal(last.dead,false,'La ruta desde mesa, refrigerador y encimeras debe ser segura');
 if(demo.grounded)visited.add(demo.platform);
 if(last.goal){reached=true;break;}
}
assert.ok(reached,'Debe poder llegarse a la cafetera sin subir por la derecha');
for(const idx of [1,2,FLOOR_INDEX,13,15,17,19,20,21,22,10,9,8,3,4,5,6,7,GOAL_INDEX]){
 assert.ok(visited.has(idx),'Falta pasar por '+platforms[idx].name);
}
assert.equal(demo.checkpointRank,5);

// Impacto real desde arriba: la lata cruza el plano de la cabeza durante el descenso.
assert.equal(CAN_STATIONS.length,5);
const cup={x:0,z:0,y:3.35},fall={x:0,z:0,prevY:4.52,y:4.45,vy:-6,radius:.27};
assert.equal(hitsFallingCan(fall,cup),true);
assert.equal(hitsFallingCan({...fall,z:1.1},cup),false,'No golpea fuera de su trayectoria');
assert.equal(hitsFallingCan({...fall,vy:5},cup),false,'No golpea si está subiendo');
assert.equal(hitsFallingCan({...fall,prevY:4.0},cup),false,'La lata no golpea si ya pasó debajo de la cabeza');
console.log('✓ Descenso seguro y caída alta mortal');
console.log('✓ Ruta obligatoria de repisas → refrigerador → encimeras');
console.log('✓ Sin atajo directo de cajas a la derecha');
console.log('✓ Cinco estaciones de latas y colisión vertical desde arriba');
