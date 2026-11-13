// Coffee Please · Nivel 01, cocina en L según plano cenital.
// Y representa la altura inferior de la taza. La tarja NO es una plataforma sólida.
export const GRAVITY=18,SPEED=4.5,JUMP=7.5,FLOOR_INDEX=12,GOAL_INDEX=11;
const P=(x,y,z,w,d,name,kind,more={})=>({x,y,z,w,d,name,kind,...more});
export const platforms=[
 P(-3.60,3.20,4.60,6.10,3.85,'Mesa del comedor','table',{start:true}),// 0
 P(-7.55,2.05,4.65,1.95,1.9,'Silla de descenso','chair'),             // 1
 P(-9.45,1.00,4.00,1.75,1.75,'Banco bajo','stool'),                 // 2
 P(-5.20,3.35,-7.55,4.40,2.90,'Tarja llena de agua','water'),      // 3 (hueco)
 P(-1.50,3.35,-7.55,3.00,2.90,'Microondas','counter',{checkpointRank:4}),//4
 P(1.40,3.35,-7.55,2.80,2.90,'Preparación','counter'),              // 5
 P(4.25,3.35,-7.55,2.85,2.90,'Estufa','stove'),                 // 6
 P(7.15,3.35,-7.55,2.80,2.90,'Encimera de la esquina','counter'),//7
 P(-11.10,3.35,-7.55,2.00,2.90,'Armario de limpieza','counter'),//8
 P(-8.80,3.35,-7.55,2.65,2.90,'Lavado y residuos','counter',{checkpointRank:3}),//9
 P(10.50,3.35,1.00,2.80,3.00,'Molino de café','counter'),      //10
 P(10.50,3.35,4.40,2.80,3.10,'Cafetera','goal',{goal:true,checkpointRank:5}),//11
 P(0,0,0,27.4,21,'Suelo de la cocina','floor',{floor:true,checkpointRank:1}),//12
 // Ascenso en la pared izquierda, lejos de la cafetera.
 P(-11.05,.80,2.55,1.65,1.40,'Escalón de repisa I','shelf'),
 P(-11.05,1.60,1.05,1.65,1.35,'Repisa de subida II','shelf'),
 P(-11.05,2.40,-.45,1.65,1.35,'Repisa de subida III','shelf',{checkpointRank:2}),
 P(-11.05,3.16,-2.05,1.80,1.45,'Repisa de subida IV','shelf'),
 P(-11.05,3.35,-4.25,2.00,1.80,'Puente al armario','shelf'),
 // Tramo derecho de encimera en forma de L.
 P(10.40,3.35,-7.25,2.80,2.75,'Esquina derecha','counter'),
 P(10.50,3.35,-4.50,2.80,2.75,'Mostrador de vasos','counter'),
 P(10.50,3.35,-1.75,2.80,2.75,'Barra lateral','counter'),
 P(10.50,3.35,2.65,2.80,1.65,'Estación interactiva','counter'),
 // Trastes y cubiertos: plataformas REALES suspendidas por encima del agua.
 P(-6.45,3.56,-7.55,.92,1.12,'Plato de cerámica I','dish'),
 P(-5.30,3.65,-7.55,.90,.94,'Taza boca abajo','dish'),
 P(-4.22,3.59,-7.55,.87,1.04,'Cuchara sobre platos','utensil'),
 P(-3.15,3.56,-7.55,.92,1.10,'Plato de cerámica II','dish')
];
export const WATER={x:platforms[3].x,z:platforms[3].z,w:platforms[3].w,d:platforms[3].d,y:3.16};
export const DISH_INDICES=[22,23,24,25];
export const FLOOR_PUDDLE={x:-1.8,z:1.0,r:1.14};
export const FLOOR_CRUMBS={x:-6.8,z:2.0,r:.88};
export const CAN_STATIONS=[
 {x:-9.15,z:-7.55,y:6.95,delay:0},
 {x:-1.55,z:-7.55,y:6.95,delay:1.1},
 {x:1.40,z:-7.55,y:6.95,delay:2.2},
 {x:4.25,z:-7.55,y:6.95,delay:3.3},
 {x:7.10,z:-7.55,y:6.95,delay:4.4}
];
export function hitsFallingCan(can,p){
 const r=can.radius??.27,top=p.y+.84;
 return can.vy<0&&Math.hypot(can.x-p.x,can.z-p.z)<r+.29&&
        can.prevY-r>=top-.025&&can.y-r<=top+.015&&can.y+r>=p.y+.5;
}
export function obstacleAt(t){return {x:-3.1,y:3.48,z:4.6+Math.sin(t*2.4)*1.02,radius:.22,halfLength:.45};}
export function hitsObstacle(p,t){
 const o=obstacleAt(t);
 return Math.abs(p.x-o.x)<o.radius+.28&&Math.abs(p.z-o.z)<o.halfLength+.25&&
  p.y<o.y+o.radius&&p.y+.84>o.y-o.radius;
}
export function cameraMovement(right,forward,yaw){
 return {x:Math.sin(yaw)*forward+Math.cos(yaw)*right,z:-Math.cos(yaw)*forward+Math.sin(yaw)*right};
}
export function createPlayer(index=0){
 const q=platforms[index],floor=index===FLOOR_INDEX;
 return {x:floor?-10.2:q.x,y:q.y,z:floor?3.4:q.z,vy:0,grounded:true,platform:index,checkpoint:index,
  checkpointRank:q.checkpointRank||0,dropOriginY:q.y,demoStage:0};
}
export function insideWater(x,z,inset=0){
 return Math.abs(x-WATER.x)<WATER.w/2-inset&&Math.abs(z-WATER.z)<WATER.d/2-inset;
}
// Sin colisión en el hueco del fregadero; los platos sí sostienen la taza.
export function blocked(x,z,p){
 const radius=.22;
 if(x < -13.30||x>13.28||z < -10.12||z>10.08)return true;
 for(let i=3;i<platforms.length;i++){
  const q=platforms[i];if(q.floor||q.kind==='water'||q.kind==='dish'||q.kind==='utensil')continue;
  if(Math.abs(x-q.x)>=q.w/2+radius||Math.abs(z-q.z)>=q.d/2+radius)continue;
  if(p.y<q.y-.35&&p.y+.84>0)return true;
 }
 return false;
}
// Ruta guiada: baja por la silla izquierda, sube a la pared izquierda y cruza
// obligatoriamente cuatro trastes sobre agua antes de recorrer la cocina en L.
export const ROUTE=[
 {i:1},{i:2},{i:12,x:-11.20,z:4.15},
 {i:13},{i:14},{i:15},{i:16},{i:17},{i:8},{i:9},
 {i:22},{i:23},{i:24},{i:25},{i:4},{i:5},{i:6,x:4.25,z:-6.35},{i:7},
 {i:18},{i:19},{i:20},{i:10},{i:11}
];
export function autoInput(p){
 let stage=p.demoStage||0;
 let dest=ROUTE[Math.min(stage,ROUTE.length-1)];
 let q=dest.i===undefined?dest:{...platforms[dest.i],...dest};
 let dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz);
 if(p.grounded&&p.platform===dest.i&&d<.44&&stage<ROUTE.length-1){
  p.demoStage=++stage;dest=ROUTE[stage];
  q={...platforms[dest.i],...dest};dx=q.x-p.x;dz=q.z-p.z;d=Math.hypot(dx,dz);
 }
 const isBasin=DISH_INDICES.includes(dest.i)||DISH_INDICES.includes(p.platform);
 const bridge=(p.platform===16&&dest.i===17)||(p.platform===17&&dest.i===8)||(p.platform===7&&dest.i===18)||(p.platform===10&&dest.i===11);
 const jump=p.grounded&&d<2.85&&(q.y>p.y+.20||isBasin&&p.platform!==dest.i||bridge);
 return {x:d<.11?0:dx/(d||1),z:d<.11?0:dz/(d||1),jump};
}
export function step(p,input,dt,time=0){
 const len=Math.hypot(input.x||0,input.z||0)||1,sm=(p.speedMul??1)*SPEED;
 const dx=(input.x||0)/len*sm*dt+(p.kx||0)*dt,dz=(input.z||0)/len*sm*dt+(p.kz||0)*dt;
 if(!blocked(p.x+dx,p.z,p))p.x+=dx;
 if(!blocked(p.x,p.z+dz,p))p.z+=dz;
 if(input.jump&&p.grounded){p.vy=JUMP;p.grounded=false;}
 const oldY=p.y;p.vy-=GRAVITY*dt;p.y+=p.vy*dt;p.grounded=false;
 let fallDamage=0,brokenFall=false,landedOn=-1;
 if(p.vy<=0){
  let land=-1,highest=-Infinity;
  for(let i=0;i<platforms.length;i++){
   const q=platforms[i];if(q.kind==='water')continue;
   if(q.y<=highest)continue;
   if(Math.abs(p.x-q.x)>=q.w/2+.08||Math.abs(p.z-q.z)>=q.d/2+.08)continue;
   if(oldY>=q.y-.002&&p.y<=q.y){land=i;highest=q.y;}
  }
  if(land>=0){
   const q=platforms[land],fall=Math.max(0,(p.dropOriginY??oldY)-q.y);
   p.y=q.y;p.vy=0;p.grounded=true;p.platform=land;landedOn=land;brokenFall=fall>2.75;
   fallDamage=!brokenFall&&fall>1.6?Math.min(65,Math.round((fall-1.6)*38)):0;
   p.dropOriginY=q.y;
   if(!brokenFall&&(q.checkpointRank||0)>p.checkpointRank){
    p.checkpointRank=q.checkpointRank;p.checkpoint=land;
   }
  }
 }
 // El agua tiene prioridad sobre el suelo: el fondo del lavadero no puede
 // comportarse como una plataforma. El contacto causa hundimiento/reset.
 const drowned=insideWater(p.x,p.z,.15)&&p.y<=WATER.y+.025&&
  (!p.grounded||![22,23,24,25].includes(p.platform));
 const stove=platforms[6],burned=p.grounded&&p.platform===6&&Math.hypot(p.x-(stove.x+.60),p.z-stove.z)<.52;
 return {
  dead:brokenFall||drowned||p.y< -3.2||burned,
  reason:drowned?'agua':brokenFall?'caída alta':burned?'quemador':'caída',
  fallDamage,landedOn,water:drowned,hit:hitsObstacle(p,time),
  goal:p.grounded&&p.platform===GOAL_INDEX&&Math.abs(p.x-platforms[GOAL_INDEX].x)<.58&&Math.abs(p.z-platforms[GOAL_INDEX].z)<.58
 };
}
