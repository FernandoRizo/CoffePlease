import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/office-physics.js',import.meta.url));
const P=await import('data:text/javascript;base64,'+source.toString('base64'));
const {platforms,step,createPlayer,autoInput,fanAt,fanForce,onCable,blocked}=P,dt=1/120;
let time=0;
function move(p,x,z,y,index){
 for(let i=0;i<2400;i++){
  const dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz),r=step(p,{x:d<.1?0:dx/d,z:d<.1?0:dz/d,jump:p.grounded&&y>p.y+.08&&d<2.35},dt,time+=dt);
  assert.equal(r.dead,false,`Caída al dirigirse a ${index}: ${JSON.stringify(p)}`);
  if(p.grounded&&d<.3&&(index==null||p.platform===index))return;
 }assert.fail(`Ruta bloqueada hacia ${index} en ${JSON.stringify(p)}`);
}
const demo=createPlayer();demo.demo=true;let won=false;
for(let i=0;i<18000;i++){const r=step(demo,autoInput(demo),dt,i*dt);assert.equal(r.dead,false);if(r.goal){won=true;break;}}
assert.ok(won,'Recorrido completo hasta la cafetera: '+JSON.stringify(demo));
for(const offset of [0,2,4,7,10]){const p=createPlayer();let reached=false;
 for(let i=0;i<18000;i++){const r=step(p,autoInput(p),dt,offset+i*dt);assert.equal(r.dead,false);if(r.goal){reached=true;break;}}
 assert.ok(reached,'Recorrido con viento activo, fase '+offset);
}
// Probar cada ascenso con colisiones reales, incluso las rutas opcionales.
for(const [from,route] of [[{x:-11,z:-1.8},[9,10,4]],[{x:-9,z:2.3},[11,12,5]],[{x:3,z:-1.8},[13,14,6]],[{x:6,z:2.3},[15,16,7]],[{x:.1,z:2.6},[18,19,20,21,17]],[{x:13.9,z:2.6},[23,24,25,26,22]]]){
 const p=createPlayer(3);Object.assign(p,from);p.demo=true;
 for(const i of route){const q=platforms[i];move(p,q.x,q.z,q.y,i);}
}
const falling=createPlayer(22);falling.x=10;falling.z=-8.5;let fallen;
for(let i=0;i<300;i++){fallen=step(falling,{x:0,z:0},dt);if(fallen.dead)break;}
assert.equal(fallen.dead,true);assert.equal(fallen.reason,'caída alta');
const f=fanAt(0),front={x:f.x+f.dx*3,z:f.z+f.dz*3,y:0};
assert.ok(fanForce(front,0).x< -5,'Empuja hacia atrás cuando apunta al jugador');
assert.equal(fanForce({...front,z:front.z+4},0).active,false);
assert.equal(fanForce({...front,y:3},0).active,false);
assert.equal(fanForce({x:f.x-f.dx*2,z:f.z-f.dz*2,y:0},0).active,false);
assert.equal(fanForce(front,Math.PI/.65/2).active,false,'El giro deja una ventana segura');
assert.equal(fanForce({x:-12,z:-.3,y:0},0).active,false,'Fuera del alcance');
assert.ok(onCable({x:-5,z:0,y:0}));assert.ok(!onCable({x:-5,z:0,y:1}));
assert.ok(blocked(12,-3,{y:0}));assert.ok(!blocked(12,-3,{y:4.8}));
const pushed=createPlayer(3);Object.assign(pushed,front);const before=pushed.x;for(let i=0;i<30;i++)step(pushed,{x:1,z:0},dt,0);assert.ok(pushed.x<before,'El viento supera caminar contra él');
console.log('✓ Oficina: recorrido completo, 4 cubículos y 2 libreros escalables');
console.log('✓ Caídas, colisiones, cables y ventilador direccional con ventanas seguras');

