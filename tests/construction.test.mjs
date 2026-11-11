import assert from 'node:assert/strict';
import {test} from 'node:test';
import * as P from '../src/construction-physics.js';
const D=1/120;
function drop(x,y,z){const p=P.createPlayer();Object.assign(p,{x,y,z,grounded:false,vy:0,dropOriginY:y,platform:0});let out;for(let k=0;k<300;k++){out=P.step(p,{x:0,z:0},D,k*D);if(out.dead||p.grounded)break;}return {p,out};}
test('terreno irregular y tres hoyos transitables por sus bordes',()=>{
 assert.ok(Number.isFinite(P.groundHeight(-13,7)));
 assert.notEqual(P.groundHeight(-13,7),P.groundHeight(10,7));
 for(const h of P.PITS){assert.equal(P.groundHeight(h.x,h.z),null);assert.ok(Number.isFinite(P.groundHeight(h.x,h.z+h.r+1)));}
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
test('el ascenso final se puede completar y tiene checkpoints',()=>{
 let player=P.createPlayer(),won=false,deaths=0;
 for(let i=0;i<120*80;i++){
  const input=P.autoInput(player),res=P.step(player,input,D,i*D);
  if(res.dead){deaths++;break;}if(res.goal){won=true;break;}
 }
 assert.equal(deaths,0);assert.equal(won,true);assert.equal(player.platform,P.GOAL_INDEX);assert.equal(player.checkpointRank,5);
});