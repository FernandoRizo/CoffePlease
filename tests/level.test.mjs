import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/physics.js',import.meta.url));
const P=await import('data:text/javascript;base64,'+source.toString('base64'));
const {platforms,createPlayer,step,autoInput,FLOOR_INDEX,GOAL_INDEX,WATER,insideWater,
       DISH_INDICES,CAN_STATIONS,hitsFallingCan,hitsObstacle}=P;
const dt=1/120;
function descend(index,x,z){
 const p=createPlayer(index);p.x=x;p.z=z;let result;
 for(let i=0;i<400;i++){
  result=step(p,{x:0,z:0,jump:false},dt,i*dt);
  if(p.grounded||result.dead)break;
 }
 return result;
}
assert.equal(descend(0,-3.6,8.25).reason,'caída alta','Saltarse la silla rompe la taza');
assert.equal(descend(1,-7.55,6.75).fallDamage,17,'El descenso intermedio requiere cuidado');
assert.equal(descend(2,-9.45,5.55).fallDamage,0,'El banco permite llegar al suelo sin daño');

// El plano coloca la mesa en el comedor inferior y la cocina en L en el fondo/derecha.
assert.equal(platforms[0].kind,'table');
assert.ok(platforms[1].x<platforms[0].x,'La silla izquierda es el descenso');
assert.ok(platforms[13].x< -10,'Las repisas de subida van pegadas a la pared izquierda');
assert.ok(platforms[4].z< -6&&platforms[6].z< -6,'Microondas y estufa están en la barra trasera');
assert.ok(platforms[GOAL_INDEX].x>9&&platforms[GOAL_INDEX].z>3,'La cafetera queda al extremo derecho');
assert.equal(platforms.filter(p=>p.kind==='fridge').length,0,'La ruta antigua del refrigerador se reemplazó');

// Agua con hueco real: no hay plataforma sólida en la tarja.
assert.equal(platforms[3].kind,'water');
assert.equal(DISH_INDICES.length,4);
assert.ok(DISH_INDICES.every(i=>['dish','utensil'].includes(platforms[i].kind)));
assert.ok(insideWater(WATER.x,WATER.z));
const drowned=createPlayer(9);Object.assign(drowned,{x:WATER.x,z:WATER.z,y:3.21,vy:-4,grounded:false});
const waterResult=step(drowned,{x:0,z:0,jump:false},dt,1);
assert.equal(waterResult.dead,true);assert.equal(waterResult.reason,'agua');
assert.equal(waterResult.water,true);
const safe=createPlayer(DISH_INDICES[1]);
const safeResult=step(safe,{x:0,z:0,jump:false},dt,1);
assert.equal(safeResult.dead,false);assert.equal(safe.grounded,true);
assert.equal(safe.platform,DISH_INDICES[1],'El traste tiene colisión a la altura de su modelo');

// El quemador, rodillo y las latas siguen operativos.
const hot=createPlayer(6);hot.x=platforms[6].x+.6;hot.z=platforms[6].z;
assert.equal(step(hot,{x:0,z:0,jump:false},dt,0).reason,'quemador');
assert.equal(hitsObstacle({x:-3.1,y:3.2,z:4.6},0),true);
assert.equal(CAN_STATIONS.length,5);
const cup={x:0,z:0,y:3.35},fall={x:0,z:0,prevY:4.52,y:4.45,vy:-6,radius:.27};
assert.equal(hitsFallingCan(fall,cup),true);
assert.equal(hitsFallingCan({...fall,z:1.1},cup),false);
assert.equal(hitsFallingCan({...fall,vy:5},cup),false);

// Se llega al final recorriendo el plano y sin poder pisar el agua.
const demo=createPlayer();demo.demo=true;const visited=new Set();let reached=false;
for(let i=0;i<120*75;i++){
 const r=step(demo,autoInput(demo),dt,i*dt);
 assert.equal(r.dead,false,'El recorrido guiado no debe morir: '+r.reason);
 if(demo.grounded)visited.add(demo.platform);
 if(r.goal){reached=true;break;}
}
assert.ok(reached,'La taza debe poder llegar a la cafetera por el plano nuevo');
for(const i of [1,2,FLOOR_INDEX,13,14,15,16,17,8,9,...DISH_INDICES,4,5,6,7,18,19,20,10,GOAL_INDEX])
 assert.ok(visited.has(i),'Falta cruzar: '+platforms[i].name);
assert.equal(demo.checkpointRank,5);
console.log('✓ Cocina en L: mesa, silla izquierda, repisas y barra derecha');
console.log('✓ Tarja llena de agua: muerte por hundimiento; cuatro trastes sólidos');
console.log('✓ Recorrido completo, checkpoints, estufa, rodillo y cinco latas');
