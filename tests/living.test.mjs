import assert from 'node:assert/strict';
import {test} from 'node:test';
import * as P from '../src/living-physics.js';
const D=1/120;
test('dos sofás enfrentados, mesita, bibliotecas laterales y mueble doble',()=>{
 assert.equal(P.platforms.filter(p=>p.kind==='sofa').length,2);
 assert.equal(P.platforms.filter(p=>p.kind==='table').length,1);
 assert.equal(P.platforms.filter(p=>p.kind==='bookcase').length,2);
 assert.equal(P.platforms.filter(p=>p.kind==='tv').length,1);
 assert.equal(P.platforms[P.GOAL_INDEX].kind,'goal');
 assert.ok(P.platforms[P.GOAL_INDEX].y>P.platforms.find(p=>p.kind==='tv').y);
});
test('macetas tienen colisión y no bloquean saltos por encima',()=>{
 const pot=P.POTS[0],p=P.createPlayer(P.FLOOR_INDEX);
 Object.assign(p,{x:pot.x-1,z:pot.z,y:0});
 assert.equal(P.blocked(pot.x,pot.z,p),true);
 p.y=pot.h+1;assert.equal(P.blocked(pot.x,pot.z,p),false);
});
test('pegamento ralentiza y bloquea el salto sin afectar otras superficies',()=>{
 const g=P.GLUE[0],p=P.createPlayer(18);
 Object.assign(p,{x:g.x,y:g.y,z:g.z,platform:18,grounded:true});
 assert.equal(P.onGlue(p),true);
 const x=p.x;const r=P.step(p,{x:1,z:0,jump:true},D,0);
 assert.equal(r.glueJumpBlocked,true);assert.equal(p.grounded,true);
 assert.ok(p.x-x<P.SPEED*D*.5);
 const safe=P.createPlayer(18);Object.assign(safe,{x:14.6,z:-1.0});
 P.step(safe,{x:0,z:0,jump:true},D,0);assert.ok(safe.vy>0);
});
test('aspiradora rompe la taza en el suelo y no alcanza las alturas',()=>{
 const v=P.vacuumAt(0),p=P.createPlayer(P.FLOOR_INDEX);
 Object.assign(p,{x:v.x,y:0,z:v.z});
 assert.equal(P.hitsVacuum(p,0),true);
 p.y=1.62;assert.equal(P.hitsVacuum(p,0),false);
});
test('gato daña en el suelo y puede romper al golpear en sofá/mesa',()=>{
 const floor=P.catAt(2),sofa=P.catAt(6),table=P.catAt(9);
 assert.equal(P.catHit({x:floor.x,y:0,z:floor.z,platform:2},2).damage,43);
 assert.equal(P.catHit({x:sofa.x,y:sofa.y,z:sofa.z,platform:3},6).fatal,true);
 assert.equal(P.catHit({x:table.x,y:table.y,z:table.z,platform:5},9).fatal,true);
 assert.equal(P.catHit({x:table.x+5,y:table.y,z:table.z,platform:5},9).hit,false);
});
test('ventiladores producen empuje en su cono y ninguno fuera de él',()=>{
 const f=P.fanAt(0,0),p={x:f.x+f.dx*.9,y:f.y-.45,z:f.z+f.dz*.9};
 assert.equal(P.fanForce(p,0).active,true);
 assert.equal(P.fanForce({x:-10,y:0,z:0},0).active,false);
});
test('recorrido guiado llega a la cafetera sin saltos imposibles',()=>{
 const p=P.createPlayer();p.demo=true;let won=false,dead=false;
 for(let i=0;i<120*80;i++){
  const r=P.step(p,P.autoInput(p),D,i*D);
  if(r.dead){dead=true;break;}
  if(r.goal){won=true;break;}
 }
 assert.equal(dead,false);assert.equal(won,true);assert.equal(p.platform,P.GOAL_INDEX);
 assert.equal(p.checkpointRank,5);
});
