import assert from 'node:assert/strict';
import {test} from 'node:test';
import * as P from '../src/construction-physics.js';
const D=1/120;
function drop(x,y,z){const p=P.createPlayer();Object.assign(p,{x,y,z,grounded:false,vy:0,dropOriginY:y,platform:0});let out;for(let k=0;k<300;k++){out=P.step(p,{x:0,z:0},D,k*D);if(out.dead||p.grounded)break;}return {p,out};}
test('terreno irregular y tres hoyos transitables por sus bordes',()=>{
 assert.ok(Number.isFinite(P.groundHeight(-13,7)));
 assert.notEqual(P.groundHeight(-13,7),P.groundHeight(10,7));
 for(const h of P.PITS){assert.equal(P.groundHeight(h.x,h.z),null);}
 assert.ok(Number.isFinite(P.groundHeight(-13,8.6)));
});
test('caer en el hoyo rompe la taza',()=>{
 const h=P.PITS[0],{out}=drop(h.x,0.3,h.z);assert.equal(out.dead,true);assert.equal(out.reason,'foso');
});
test('caída directa desde el andamio rompe, caída por palé no',()=>{
 assert.equal(drop(-13.9,3,-7.2).out.reason,'caída alta');
 const safe=drop(-18.5,3,2);assert.equal(safe.out.dead,false);assert.equal(safe.p.platform,1);
});
test('el aceite reduce movimiento y bloquea el salto solo al pisarlo',()=>{
 const q=P.OIL_PATCHES[0],g=P.groundHeight(q.x,q.z);
 const p={...P.createPlayer(P.FLOOR_INDEX),x:q.x,z:q.z,y:g,grounded:true,platform:P.FLOOR_INDEX,dropOriginY:g};
 assert.equal(P.onOil(p),true);
 const res=P.step(p,{x:0,z:0,jump:true},D,0);
 assert.equal(res.oilJumpBlocked,true);assert.equal(p.grounded,true);
 const p2={...P.createPlayer(P.FLOOR_INDEX),x:-14,z:7,y:P.groundHeight(-14,7),grounded:true,platform:P.FLOOR_INDEX};
 P.step(p2,{x:0,z:0,jump:true},D,0);assert.ok(p2.vy>0);assert.equal(p2.grounded,false);
});
test('la bola de demolición oscila y puede golpear',()=>{
 const a=P.wreckingBallAt(0),b=P.wreckingBallAt(1);
 assert.notEqual(a.x,b.x);assert.ok(a.y>b.y||b.y>a.y);
 assert.equal(P.hitsObstacle({x:a.x,y:a.y-.43,z:a.z},0),true);
 assert.equal(P.hitsObstacle({x:a.x+8,y:a.y-.43,z:a.z},0),false);
});
test('robot de obra detecta contacto a la altura del piso',()=>{
 const e=P.enemyAt(0)[0];assert.equal(P.hitsEnemy({x:e.x,y:e.y,z:e.z},0),true);
 assert.equal(P.hitsEnemy({x:e.x,y:e.y+3,z:e.z},0),false);
});
test('el pasillo seguro desapareció: ambas excavaciones cortan todo el terreno',()=>{
 for(const h of P.TRENCHES){for(let z=-10;z<=10;z+=.5)assert.equal(P.groundHeight(h.x,z),null);}
 assert.ok(P.BACHES.length>=4);assert.ok(P.PITS.length>=5);
 assert.equal(P.BEAM_INDICES.length,8);
});
test('pisar una viga activa aviso, la hace caer y luego reaparece',()=>{
 const i=P.BEAM_INDICES[0],q=P.platforms[i],player=P.createPlayer();
 Object.assign(player,{x:q.x,y:q.y+1.1,z:q.z,vy:0,grounded:false,dropOriginY:q.y+1.1,platform:P.FLOOR_INDEX});
 let t=0,landed=false,dead=false;
 for(let k=0;k<120*3;k++){t=k*D;const r=P.step(player,{x:0,z:0},D,t);if(r.landedOn===i){landed=true;break;}assert.equal(r.dead,false);}
 assert.equal(landed,true);
 assert.equal(P.beamPhase(player,i,t+.1).phase,'active');
 assert.equal(P.beamPhase(player,i,t+q.collapseDelay-.1).phase,'warning');
 assert.equal(P.beamPhase(player,i,t+q.collapseDelay+.05).phase,'fallen');
 const s=P.step(player,{x:0,z:0},D,t+q.collapseDelay+.05);
 assert.equal(player.grounded,false);assert.ok(player.y<q.y);assert.notEqual(player.platform,P.GOAL_INDEX);
 assert.equal(P.beamPhase(player,i,t+q.collapseDelay+P.BEAM_RESPAWN+.1).phase,'intact');
});
test('la viga siguiente mantiene su propio temporizador',()=>{
 const a=P.BEAM_INDICES[0],b=P.BEAM_INDICES[1];
 const player=P.createPlayer();player.beamTimers[a]=2;
 assert.equal(P.beamPhase(player,a,2+P.platforms[a].collapseDelay+.1).phase,'fallen');
 assert.equal(P.beamPhase(player,b,3.5).phase,'intact');
});
test('el ascenso final se puede completar y tiene checkpoints',()=>{
 let player=P.createPlayer(),won=false,deaths=0;
 for(let i=0;i<120*80;i++){
  const input=P.autoInput(player),res=P.step(player,input,D,i*D);
  if(res.dead){deaths++;break;}if(res.goal){won=true;break;}
 }
 assert.equal(deaths,0);assert.equal(won,true);assert.equal(player.platform,P.GOAL_INDEX);assert.equal(player.checkpointRank,5);
});