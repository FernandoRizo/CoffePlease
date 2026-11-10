import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../src/physics.js',import.meta.url));
const {platforms,createPlayer,step,autoInput,FLOOR_INDEX,GOAL_INDEX}=await import('data:text/javascript;base64,'+src.toString('base64'));
const dt=1/120;
function descend(index,x,z){
 const p=createPlayer(index);p.x=x;p.z=z;let result;
 for(let i=0;i<350;i++){
  result=step(p,{x:0,z:0,jump:false},dt,i*dt);
  if(p.grounded||result.dead)break;
 }
 return {p,result};
}
assert.equal(descend(0,-3.1,5.65).result.reason,'caída alta');
assert.equal(descend(0,-3.1,5.65).result.dead,true);
assert.equal(descend(1,1.2,4).result.dead,false);
assert.ok(descend(1,1.2,4).result.fallDamage>0);
assert.equal(descend(2,3.45,4.5).result.fallDamage,0);
const p=createPlayer(FLOOR_INDEX);
let time=0;
for(const target of [13,14,15,16,GOAL_INDEX]){
 let arrived=false,cooldown=0;
 for(let i=0;i<2400;i++){
  const q=platforms[target],dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz);
  const jump=p.grounded&&q.y>p.y+.2&&d<2.3&&cooldown<=0;
  if(jump)cooldown=.9;
  const r=step(p,{x:dx/(d||1),z:dz/(d||1),jump},dt,time+=dt);
  cooldown-=dt;
  assert.equal(r.dead,false,'El ascenso no debe romper la taza');
  if(p.grounded&&p.platform===target){arrived=true;break;}
 }
 assert.ok(arrived,`El salto a ${qname(target)} debe ser posible`);
}
function qname(index){return platforms[index].name;}
const demo=createPlayer();let success=false;
for(let i=0;i<12000;i++){
 const r=step(demo,autoInput(demo),dt,i*dt);
 assert.equal(r.dead,false,'El recorrido guiado debe ser transitable');
 if(r.goal){success=true;break;}
}
assert.ok(success,'El recorrido guiado debe terminar en la cafetera');
console.log('✓ Caída alta / caída media / descenso seguro');
console.log('✓ Subida jugable: cajas → taburete → cajón → cafetera');
console.log('✓ Recorrido automático completo');