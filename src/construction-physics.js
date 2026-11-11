// Nivel 03 — Obra en construcción. Eje Y = altura de la base de la taza.
// Terreno continuo ondulado, fosas sin superficie y plataformas sólidas alcanzables.
export const GRAVITY=18, SPEED=4.6, JUMP=7.5;
export const FLOOR_INDEX=3, GOAL_INDEX=10;
export const PITS=[
 {x:-8,z:-2.5,r:2.2,name:'Zanja de tuberías'},
 {x:4.0,z:2.3,r:2.05,name:'Foso de cimentación'},
 {x:11,z:-3.7,r:2.2,name:'Pozo de obra'}
];
export const OIL_PATCHES=[
 {x:-2.2,z:-.8,r:2.65},
 {x:9,z:1.0,r:2.25}
];
export const CONES=[[-12,0],[-10,-4.3],[-6,1.4],[2,-.1],[6,4.6],[12,-.6],[15.3,5.1],[19,-3.5]];
export const FLOOR_PUDDLE={x:1200,z:1200,r:0},FLOOR_CRUMBS={x:1200,z:1200,r:0};
export function groundHeight(x,z){
 if(x<-23.6||x>23.6||z<-10.6||z>10.6)return null;
 if(PITS.some(h=>Math.hypot(x-h.x,z-h.z)<h.r))return null;
 return .15*Math.sin(x*.47)+.12*Math.cos(z*.59)+.08*Math.sin((x+z)*.43)+.33*Math.exp(-((x-1)**2+(z+6)**2)/23);
}
const p=(x,y,z,w,d,name,kind,extra={})=>({x,y,z,w,d,name,kind,...extra});
export const platforms=[
 p(-21,3,2,3.7,3.4,'Andamio de inicio','scaffold',{start:true}),
 p(-18.5,2.04,2.0,2.1,1.8,'Plataforma de bajada','plank'),
 p(-16.55,1.04,2.0,1.9,1.7,'Palé inferior','pallet'),
 p(0,0,0,48,22,'Terreno de la obra','ground',{floor:true,checkpointRank:1,spawn:{x:-13.8,z:5}}),
 p(-4.5,1.05,-5.8,2.5,2.1,'Pila de sacos','bag'),
 p(-2.55,2.02,-5.7,2.1,1.8,'Palé elevado','pallet'),
 p(-.5,2.85,-5.8,2.2,1.9,'Andamio auxiliar','scaffold',{checkpointRank:2}),
 p(15.9,.87,3,2.1,2.0,'Barril de apoyo','barrel'),
 p(17.75,1.59,2.2,2.1,1.9,'Sacos de cemento','bag',{checkpointRank:3}),
 p(19.45,2.32,1.35,2.15,1.75,'Tablón del ascenso','plank',{checkpointRank:4}),
 p(21.45,3.13,1.15,3.3,2.6,'Mesita de la cafetera','goal',{goal:true,checkpointRank:5}),
 // Marcadores de checkpoint en el terreno: no son plataformas sólidas.
 p(-2.0,0,7.2,.5,.5,'Zona segura de la obra','checkpoint',{checkpointRank:2}),
 p(12.5,0,6.2,.5,.5,'Final del terreno','checkpoint',{checkpointRank:3}),
 // Algunas plataformas opcionales que conectan partes del terreno.
 p(4,1.13,-5.4,2.3,2.0,'Cajón de herramientas','box'),
 p(6.0,1.9,-5.0,2.0,1.85,'Tuberías apiladas','pipe')
];
export const GOAL=platforms[GOAL_INDEX];
export function isOil(x,z){return OIL_PATCHES.some(q=>Math.hypot(x-q.x,z-q.z)<q.r);}
export function onOil(player){const g=groundHeight(player.x,player.z);return g!==null&&player.y<=g+.17&&isOil(player.x,player.z);}
// Bola oscilante real: la esfera y la colisión comparten las mismas coordenadas.
export const WRECKING_ANCHOR={x:1.1,y:6.0,z:-.5};
export function wreckingBallAt(t){const a=Math.sin(t*1.12)*.93,L=5.4;return {x:WRECKING_ANCHOR.x+L*Math.sin(a),y:WRECKING_ANCHOR.y-L*Math.cos(a),z:WRECKING_ANCHOR.z,radius:.97,angle:a};}
export function obstacleAt(t){const q=wreckingBallAt(t);return {...q,halfLength:q.radius};}
export function hitsObstacle(player,t){const b=wreckingBallAt(t);return Math.hypot(player.x-b.x,player.y+.43-b.y,player.z-b.z)<b.radius+.32;}
export function enemyAt(t){return [
 {x:-2.8+Math.sin(t*.9)*2.3,z:5.0,y:groundHeight(-2.8+Math.sin(t*.9)*2.3,5)||0,r:.54},
 {x:9.5+Math.sin(t*1.2+1.8)*2,z:6.2,y:groundHeight(9.5+Math.sin(t*1.2+1.8)*2,6.2)||0,r:.55}
];}
export function hitsEnemy(player,t){return enemyAt(t).some(e=>Math.hypot(player.x-e.x,player.z-e.z)<e.r+.36&&player.y<e.y+1.05&&player.y+.8>e.y);}
export function cameraMovement(right,forward,yaw){return {x:Math.sin(yaw)*forward+Math.cos(yaw)*right,z:-Math.cos(yaw)*forward+Math.sin(yaw)*right};}
export function createPlayer(index=0){const q=platforms[index];const terrain=!!q.floor||q.kind==='checkpoint',x=q.spawn?.x??q.x,z=q.spawn?.z??q.z;return {x,y:terrain?(groundHeight(x,z)??0):q.y,z,vy:0,grounded:true,platform:terrain?FLOOR_INDEX:index,checkpoint:index,checkpointRank:q.checkpointRank||0,dropOriginY:terrain?(groundHeight(x,z)??0):q.y,demoStage:0,kx:0,kz:0};}
function blocked(x,z,player){
 if(x<-23.35||x>23.35||z<-10.35||z>10.35)return true;
 const g=groundHeight(x,z),old=groundHeight(player.x,player.z);
 if(player.grounded&&player.platform===FLOOR_INDEX&&g!==null&&old!==null&&g-old>.42)return true;
 // Los conos son obstáculos bajos y permiten saltar por encima.
 if(player.y<.55&&CONES.some(([cx,cz])=>Math.hypot(x-cx,z-cz)<.38))return true;
 return platforms.some(q=>!q.floor&&q.kind!=='checkpoint'&&Math.abs(x-q.x)<q.w/2+.22&&Math.abs(z-q.z)<q.d/2+.22&&player.y<q.y-.32&&player.y+.84>q.y-.4);
}
export const ROUTE=[{i:1},{i:2},{x:-13.6,z:2,y:0},{x:-12.8,z:7,y:0},{x:-4,z:7.4,y:0},{x:4.5,z:7.4,y:0},{x:12.5,z:6.5,y:0},{x:14,z:4.2,y:0},{i:7},{i:8},{i:9},{i:10}];
export function autoInput(p){
 let n=p.demoStage||0,q=ROUTE[Math.min(n,ROUTE.length-1)],target=q.i==null?q:platforms[q.i],d=Math.hypot(target.x-p.x,target.z-p.z);
 if(p.grounded&&d<.36&&(q.i==null||p.platform===q.i)&&n<ROUTE.length-1){p.demoStage=++n;q=ROUTE[n];target=q.i==null?q:platforms[q.i];d=Math.hypot(target.x-p.x,target.z-p.z);}
 return {x:d<.14?0:(target.x-p.x)/(d||1),z:d<.14?0:(target.z-p.z)/(d||1),jump:p.grounded&&target.y>p.y+.38&&d<2.5};
}
export function step(player,input,dt,time=0){
 const p=player,len=Math.max(1,Math.hypot(input.x||0,input.z||0)),oil=onOil(p),speed=SPEED*(p.speedMul??1)*(oil?.38:1);
 const dx=((input.x||0)/len*speed+(p.kx||0))*dt,dz=((input.z||0)/len*speed+(p.kz||0))*dt;
 if(!blocked(p.x+dx,p.z,p))p.x+=dx;
 if(!blocked(p.x,p.z+dz,p))p.z+=dz;
 // Terreno irregular: al caminar, la base sigue el relieve; sobre un hoyo desaparece el apoyo.
 if(p.grounded&&p.platform===FLOOR_INDEX){const g=groundHeight(p.x,p.z);if(g!==null&&Math.abs(g-p.y)<.45){p.y=g;p.dropOriginY=g;}}
 const jumped=!!(input.jump&&p.grounded&&!oil);
 if(jumped){p.vy=JUMP;p.grounded=false;p.dropOriginY=p.y;}
 const oldY=p.y;p.vy-=GRAVITY*dt;p.y+=p.vy*dt;p.grounded=false;
 let landedOn=-1,fallDamage=0,brokenFall=false;
 if(p.vy<=0){let top=-Infinity;
  for(let i=0;i<platforms.length;i++){
   const q=platforms[i];if(q.floor||q.kind==='checkpoint'||q.y<=top)continue;
   if(Math.abs(p.x-q.x)<q.w/2+.12&&Math.abs(p.z-q.z)<q.d/2+.12&&oldY>=q.y-.025&&p.y<=q.y){top=q.y;landedOn=i;}
  }
  const g=groundHeight(p.x,p.z);
  if(g!==null&&g>top&&oldY>=g-.04&&p.y<=g){landedOn=FLOOR_INDEX;top=g;}
  if(landedOn>=0){const q=platforms[landedOn];const fall=Math.max(0,p.dropOriginY-top);
   p.y=top;p.vy=0;p.grounded=true;p.platform=landedOn;brokenFall=fall>2.75;
   fallDamage=(!brokenFall&&fall>1.6)?Math.min(65,Math.round((fall-1.6)*38)):0;
   p.dropOriginY=top;
   if(!brokenFall&&(q.checkpointRank||0)>p.checkpointRank){p.checkpointRank=q.checkpointRank;p.checkpoint=landedOn;}
  }
 }
 if(p.grounded&&p.platform===FLOOR_INDEX){
  const rank=p.x>=12.5?3:p.x>=-2?2:1;
  if(rank>p.checkpointRank){const index=rank===3?12:rank===2?11:FLOOR_INDEX;p.checkpointRank=rank;p.checkpoint=index;}
 }
 const dead=brokenFall||p.y<-2.9;
 return {dead,reason:brokenFall?'caída alta':dead?'foso':'',landedOn,fallDamage,oil:onOil(p),oilJumpBlocked:!!(input.jump&&oil),hit:hitsObstacle(p,time),enemy:hitsEnemy(p,time),goal:p.grounded&&p.platform===GOAL_INDEX&&Math.hypot(p.x-GOAL.x,p.z-GOAL.z)<.65};
}