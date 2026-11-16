import assert from 'node:assert/strict';
import {test} from 'node:test';
import * as P from '../src/terminal-physics.js';
const D=1/120;
// Alcance máximo de un salto hasta el borde de otra plataforma (para validar que no hay atajos).
function reach(a,b){
 const dy=b.y-a.y,disc=P.JUMP**2-2*P.GRAVITY*dy;if(disc<0)return false;
 const t=(P.JUMP+Math.sqrt(disc))/P.GRAVITY,ex=Math.max(Math.abs(a.x-b.x)-(a.w+b.w)/2,0),ez=Math.max(Math.abs(a.z-b.z)-(a.d+b.d)/2,0);
 return Math.hypot(ex,ez)<=P.SPEED*t+.1;
}
const idle=(p,sec,t0=0)=>{let r;for(let i=0;i<sec/D;i++){r=P.step(p,{x:0,z:0,jump:false},D,t0+i*D);if(r.dead)break;}return r;};
test('estructura: comidas, escáner, dos cintas, cafetería y suelo mortal',()=>{
 assert.equal(P.platforms.filter(p=>p.kind==='conveyor').length,2);
 assert.equal(P.CONVEYORS.length,2);
 assert.ok(P.CONVEYORS[0].vx>0&&P.CONVEYORS[1].vx<0,'una cinta ayuda y la otra se opone');
 assert.equal(P.platforms[P.GOAL_INDEX].kind,'goal');
 assert.equal(P.platforms[P.FLOOR_INDEX].floor,true);
 assert.ok(P.platforms.filter(p=>!p.floor).every(p=>p.y>1.5),'toda plataforma está muy por encima del suelo');
 assert.ok(P.platforms[P.GOAL_INDEX].y>=Math.max(...P.platforms.filter(p=>!p.floor).map(p=>p.y)));
 assert.equal(P.CURTAINS.length,2);assert.equal(P.SUITCASES.length,2);
});
test('el suelo pulido es Derrota Absoluta, sin importar la salud',()=>{
 const p=P.createPlayer();Object.assign(p,{x:-17,z:-6,y:3.2,grounded:false,dropOriginY:3.2});
 let r;for(let i=0;i<400;i++){r=P.step(p,{x:0,z:0},D,i*D);if(r.dead)break;}
 assert.equal(r.dead,true);assert.equal(r.reason,'caída');
});
test('las cintas arrastran a la taza solo mientras está apoyada',()=>{
 const a=P.createPlayer(7),x=a.x;idle(a,1);assert.ok(Math.abs(a.x-x-1.7)<.1,'cinta A: +1.7 u/s');
 const b=P.createPlayer(9),xb=b.x;idle(b,1);assert.ok(Math.abs(b.x-xb+2.2)<.1,'cinta B: −2.2 u/s');
 const air=P.createPlayer(7);Object.assign(air,{y:6,grounded:false,vy:0});const xa=air.x;P.step(air,{x:0,z:0},D,0);assert.equal(air.x,xa);
 assert.equal(P.step(P.createPlayer(7),{x:0,z:0},D,0).conveyor,true);
 assert.equal(P.step(P.createPlayer(8),{x:0,z:0},D,0).conveyor,false);
});
test('maleta: golpea en la cinta, se salta, y daño = velocidad relativa × k',()=>{
 let t=0;for(;t<20;t+=.05)if(P.suitcaseAt(t,0).alpha===1)break;
 const s=P.suitcaseAt(t,0);
 assert.equal(P.suitcaseHit({x:s.x,y:s.y,z:s.z,vx:0,vz:0},t).hit,true);
 assert.equal(P.suitcaseHit({x:s.x,y:s.y+1.05,z:s.z,vx:0,vz:0},t).hit,false,'se puede saltar por encima');
 assert.equal(P.suitcaseHit({x:s.x+3,y:s.y,z:s.z,vx:0,vz:0},t).hit,false);
 const calm=P.suitcaseHit({x:s.x,y:s.y,z:s.z,vx:s.vx,vz:0},t),head=P.suitcaseHit({x:s.x,y:s.y,z:s.z,vx:4.6,vz:0},t);
 assert.equal(calm.damage,10);assert.ok(head.damage>calm.damage);assert.ok(head.damage<=48);
 assert.ok(s.vx<0,'viaja con el sentido de la banda B');
});
test('las maletas entran y salen de la banda (sin teletransporte visible)',()=>{
 let seenFade=false;for(let t=0;t<12;t+=.02){const s=P.suitcaseAt(t,0);if(s.alpha<.8){seenFade=true;assert.equal(P.suitcaseHit({x:s.x,y:s.y,z:s.z,vx:0,vz:0},t).hit,false);}}
 assert.ok(seenFade);
 for(let t=0;t<12;t+=.1){const s=P.suitcaseAt(t,1);assert.ok(s.x>=11.4&&s.x<=17.2,'dentro de la cinta B');}
});
test('cortinas del escáner: péndulo, golpe por velocidad relativa y salto por encima',()=>{
 for(let t=0;t<8;t+=.1){const c=P.curtainAt(t,0);assert.ok(c.x>=3.9-1e-6&&c.x<=5.1+1e-6);}
 const c=P.curtainAt(0,0);
 const hit=P.curtainHit({x:c.x,y:c.y,z:c.z,vx:0},0);
 assert.equal(hit.hit,true);assert.ok(hit.damage>=10&&hit.damage<=32);
 assert.equal(P.curtainHit({x:c.x,y:c.y+1.2,z:c.z,vx:0},0).hit,false);
 assert.equal(P.curtainHit({x:c.x,y:0.5,z:c.z,vx:0},0).hit,false,'solo afecta a quien está en la cinta');
 const demo=P.createPlayer(7);demo.demo=true;Object.assign(demo,{x:c.x,z:c.z});
 assert.equal(P.step(demo,{x:0,z:0},D,0).curtain.hit,false,'el recorrido guiado no recibe golpes');
});
test('no hay atajos: la meta solo se alcanza desde la revisión manual',()=>{
 const R=[0,1,2,3,4,5,6,7,8,9,10,11],pl=P.platforms;
 for(let i=0;i<R.length;i++)for(let j=i+2;j<R.length;j++){
  if([[0,2],[3,5],[5,7]].some(([a,b])=>a===i&&b===j))continue;   // saltos opcionales entre apoyos
  assert.equal(reach(pl[R[i]],pl[R[j]]),false,`atajo ${pl[R[i]].name} → ${pl[R[j]].name}`);
 }
 for(let i=0;i<R.length-1;i++)assert.equal(reach(pl[R[i]],pl[R[i+1]]),true,'tramo '+i+' alcanzable');
});
test('recorrido guiado: cruza ambas cintas, el escáner y llega a la cafetería',()=>{
 const p=P.createPlayer();p.demo=true;const seen=new Set();let won=false;
 for(let i=0;i<120*80;i++){
  const r=P.step(p,P.autoInput(p),D,i*D);
  assert.equal(r.dead,false,'muere: '+r.reason+' en '+p.platform);
  if(p.grounded)seen.add(p.platform);
  if(r.goal){won=true;break;}
 }
 assert.equal(won,true);
 for(const i of [1,2,3,4,5,6,7,8,9,10,11])assert.ok(seen.has(i),'falta '+P.platforms[i].name);
 assert.equal(p.checkpointRank,5);
});
test('checkpoints: reaparición sobre superficies seguras (no cintas)',()=>{
 for(const q of P.platforms)if(q.checkpointRank)assert.equal(!!q.conv,false);
 const p=P.createPlayer(8);assert.equal(p.checkpointRank,3);assert.equal(p.platform,8);
});
