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
 const lib=P.platforms.filter(p=>p.kind==='bookcase');
 for(const l of lib)assert.ok(l.w>=4.8&&l.d>=2.6);
 assert.ok(P.platforms.filter(p=>p.kind==='bookStep').length>=12);
 const tv=P.platforms[18];assert.ok(tv.d>=7&&tv.w<=2.3,'repisa larga pero angosta frente al TV');
 const top=P.platforms[P.GOAL_INDEX];assert.ok(top.w>=5&&top.d>=5);
 assert.ok(P.GLUE.every(g=>g.y===top.y));
 assert.ok(P.FANS.every(f=>f.y>top.y));
});
test('macetas tienen colisión y no bloquean saltos por encima',()=>{
 const pot=P.POTS[0],p=P.createPlayer(P.FLOOR_INDEX);
 Object.assign(p,{x:pot.x-1,z:pot.z,y:0});
 assert.equal(P.blocked(pot.x,pot.z,p),true);
 p.y=pot.h+1;assert.equal(P.blocked(pot.x,pot.z,p),false);
});
test('pegamento ralentiza y bloquea el salto sin afectar otras superficies',()=>{
 const g=P.GLUE[0],p=P.createPlayer(P.GOAL_INDEX);
 Object.assign(p,{x:g.x,y:g.y,z:g.z,platform:P.GOAL_INDEX,grounded:true});
 assert.equal(P.onGlue(p),true);
 const x=p.x;const r=P.step(p,{x:1,z:0,jump:true},D,0);
 assert.equal(r.glueJumpBlocked,true);assert.equal(p.grounded,true);
 assert.ok(p.x-x<P.SPEED*D*.5);
 const safe=P.createPlayer(18);Object.assign(safe,{x:11.1,y:2.55,z:-1.0,grounded:true,platform:18});
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
test('libros salen con aviso, golpean al pasar y se retraen',()=>{
 const warning=P.bookTrapAt(.1,0),active=P.bookTrapAt(1.30,0),rest=P.bookTrapAt(2.2,0);
 assert.equal(warning.mode,'warning');
 assert.equal(active.mode,'out');assert.ok(active.extension>.9);
 assert.equal(rest.mode,'rest');
 assert.ok(Math.abs(active.z-P.BOOK_TRAPS[0].z)>.9);
 assert.equal(P.bookHitAt({x:active.x,y:3.9,z:active.z},1.3).hit,true);
 assert.equal(P.bookHitAt({x:active.x,y:0,z:active.z},1.3).hit,false);
 assert.equal(P.bookHitAt({x:active.x+4,y:3.9,z:active.z},1.3).hit,false);
 const second=P.bookTrapAt(.1,1);assert.notEqual(second.mode,warning.mode);
});
test('recorrido guiado cruza frente al televisor y llega a la cafetera',()=>{
 const p=P.createPlayer();p.demo=true;let won=false,dead=false,frontSouth=false,frontNorth=false;
 for(let i=0;i<120*80;i++){
  const r=P.step(p,P.autoInput(p),D,i*D);
  if(p.grounded&&p.platform===18){if(p.z>1.0)frontSouth=true;if(p.z< -1.0)frontNorth=true;}
  if(r.dead){dead=true;break;}
  if(r.goal){won=true;break;}
 }
 assert.equal(dead,false);assert.equal(won,true);assert.equal(p.platform,P.GOAL_INDEX);
 assert.equal(frontSouth,true);assert.equal(frontNorth,true);
 assert.equal(p.checkpointRank,5);
});
