import assert from 'node:assert/strict';
import {test} from 'node:test';
import * as P from '../src/embarque-physics.js';
const D=1/120;
function reach(a,b){
 const dy=b.y-a.y,disc=P.JUMP**2-2*P.GRAVITY*dy;if(disc<0)return false;
 const t=(P.JUMP+Math.sqrt(disc))/P.GRAVITY,ex=Math.max(Math.abs(a.x-b.x)-(a.w+b.w)/2,0),ez=Math.max(Math.abs(a.z-b.z)-(a.d+b.d)/2,0);
 return Math.hypot(ex,ez)<=P.SPEED*t+.1;
}
test('estructura: bebederos, secador, maletas apiladas, carril y mostrador VIP',()=>{
 const k=n=>P.platforms.filter(p=>p.kind===n).length;
 assert.equal(k('fountain'),2);assert.equal(k('dryer'),1);assert.equal(k('stack'),2);assert.equal(k('rail'),1);
 assert.equal(P.platforms[P.GOAL_INDEX].kind,'goal');assert.equal(P.platforms[P.FLOOR_INDEX].floor,true);
 assert.ok(P.DRIPS.length>=5&&P.AIR_JETS.length===2);
 assert.ok(P.PUSHERS.filter(p=>p.pi===9).length>=2,'varios empujadores en la banca de embarque');
 for(const j of P.AIR_JETS){const q=P.platforms[j.i];assert.ok(Math.abs(j.x-q.x)<q.w/2&&Math.abs(j.z-q.z)<q.d/2,'el chorro está sobre su plataforma');}
 for(const d of P.DRIPS)assert.ok(d.y>P.platforms[0].y+2,'los goteos caen desde el techo');
 assert.equal(P.DRIP_MIN,1);assert.equal(P.DRIP_MAX,2.5);
});
test('el suelo pulido es Derrota Absoluta',()=>{
 const p=P.createPlayer();Object.assign(p,{x:-17,z:-7,y:3.4,grounded:false,dropOriginY:3.4});
 let r;for(let i=0;i<400;i++){r=P.step(p,{x:0,z:0},D,i*D);if(r.dead)break;}
 assert.equal(r.dead,true);assert.equal(r.reason,'caída');
});
test('chorros de aire: detectan a la taza dentro de su volumen y no fuera',()=>{
 const j=P.AIR_JETS[0];
 assert.ok(P.airJetAt({x:j.x,y:j.y,z:j.z})>=0);
 assert.equal(P.airJetAt({x:j.x+3,y:j.y,z:j.z}),-1);
 assert.equal(P.airJetAt({x:j.x,y:j.y+j.h+.5,z:j.z}),-1,'por encima del chorro');
 const p=P.createPlayer(4);assert.equal(P.step(p,{x:0,z:0},D,0).jet,true);
 assert.equal(P.step(P.createPlayer(3),{x:0,z:0},D,0).jet,false);
});
test('maletas rodantes: ida y vuelta por el carril, golpe y salto por encima',()=>{
 const rail=P.platforms[10];
 for(let t=0;t<12;t+=.05)for(const i of [0,1]){const s=P.suitcaseAt(t,i);assert.ok(Math.abs(s.x-rail.x)<.01&&Math.abs(s.z-rail.z)<=rail.d/2,'sobre el carril');}
 const a=P.suitcaseAt(0,0),b=P.suitcaseAt(1.5,0);assert.notEqual(Math.sign(a.vz)*Math.sign(b.vz),0);
 let flipped=false;for(let t=0;t<8;t+=.05)if(P.suitcaseAt(t,0).vz*P.suitcaseAt(0,0).vz<0)flipped=true;
 assert.ok(flipped,'cambia de sentido');
 const s=P.suitcaseAt(.7,0);
 const hit=P.suitcaseHit({x:s.x,y:s.y,z:s.z,vx:0,vz:0},.7);
 assert.equal(hit.hit,true);assert.ok(hit.damage>=20,'a 4.4 u/s duele más que en la cinta');assert.ok(hit.damage<=48);
 assert.equal(P.suitcaseHit({x:s.x,y:s.y+1.05,z:s.z,vx:0,vz:0},.7).hit,false);
 assert.equal(P.suitcaseHit({x:s.x+2.2,y:s.y,z:s.z,vx:0,vz:0},.7).hit,false);
 const demo=P.createPlayer(10);demo.demo=true;Object.assign(demo,{x:s.x,z:s.z});
 assert.equal(P.step(demo,{x:0,z:0},D,.7).suitcase.hit,false);
});
test('no hay atajos: la cadena de plataformas es lineal',()=>{
 const R=[0,1,2,3,4,5,6,7,8,9,10,11,12],pl=P.platforms;
 for(let i=0;i<R.length;i++)for(let j=i+2;j<R.length;j++)
  assert.equal(reach(pl[R[i]],pl[R[j]]),false,`atajo ${pl[R[i]].name} → ${pl[R[j]].name}`);
 for(let i=0;i<R.length-1;i++)assert.equal(reach(pl[R[i]],pl[R[i+1]]),true,'tramo '+i+' alcanzable');
});
test('recorrido guiado: bebederos, secador, maletas apiladas, carril y VIP',()=>{
 const p=P.createPlayer();p.demo=true;const seen=new Set();let won=false;
 for(let i=0;i<120*80;i++){
  const r=P.step(p,P.autoInput(p),D,i*D);
  assert.equal(r.dead,false,'muere: '+r.reason+' en '+p.platform);
  if(p.grounded)seen.add(p.platform);
  if(r.goal){won=true;break;}
 }
 assert.equal(won,true);
 for(let i=1;i<=12;i++)assert.ok(seen.has(i),'falta '+P.platforms[i].name);
 assert.equal(p.checkpointRank,5);
});
test('checkpoints: pasarela (T3→T4), maleta II y mostrador VIP',()=>{
 assert.deepEqual(P.platforms.map(q=>q.checkpointRank||0).filter(Boolean),[2,3,4,5]);
 assert.equal(P.platforms[6].checkpointRank,2);
});
