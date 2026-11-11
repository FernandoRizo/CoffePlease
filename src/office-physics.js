// Oficina: la geometría de colisión también alimenta el escenario y el dashboard.
export const GRAVITY=18, SPEED=4.5, JUMP=7.5;
export const FLOOR_INDEX=3, GOAL_INDEX=8;
export const platforms=[
 {x:-17.3,y:3.2,z:0,w:3.5,d:4.5,name:'Fregadero · inicio',kind:'sink',start:true},
 {x:-14.4,y:2.1,z:0,w:2,d:2,name:'Silla de bajada',kind:'chair'},
 {x:-12.5,y:1.05,z:0,w:1.6,d:1.7,name:'Caja de papel',kind:'box'},
 {x:0,y:0,z:0,w:40,d:22,name:'Pasillo de la oficina',floor:true,checkpointRank:1,spawn:{x:-11,z:0}},
 {x:-9,y:3,z:-5,w:4.7,d:3.8,name:'Cubículo 01',kind:'desk'},
 {x:-6.5,y:3,z:5.5,w:4.7,d:3.8,name:'Cubículo 02',kind:'desk'},
 {x:5,y:3,z:-5,w:4.7,d:3.8,name:'Cubículo 03',kind:'desk'},
 {x:8,y:3,z:5.5,w:4.7,d:3.8,name:'Cubículo 04',kind:'desk'},
 {x:17.6,y:3.5,z:-1.5,w:3.6,d:5,name:'Mesa de la cafetera',kind:'goal',goal:true,checkpointRank:5},
 {x:-10,y:1.05,z:-1.8,w:1.6,d:1.5,name:'Silla 01 · asiento',kind:'chair'},
 {x:-9,y:2.1,z:-2.5,w:1.35,d:1,name:'Silla 01 · respaldo',kind:'back'},
 {x:-8,y:1.05,z:2.3,w:1.6,d:1.5,name:'Silla 02 · asiento',kind:'chair'},
 {x:-6.5,y:2.1,z:3,w:1.35,d:1,name:'Silla 02 · respaldo',kind:'back'},
 {x:4,y:1.05,z:-1.8,w:1.6,d:1.5,name:'Silla 03 · asiento',kind:'chair'},
 {x:5,y:2.1,z:-2.5,w:1.35,d:1,name:'Silla 03 · respaldo',kind:'back'},
 {x:7,y:1.05,z:2.3,w:1.6,d:1.5,name:'Silla 04 · asiento',kind:'chair'},
 {x:8,y:2.1,z:3,w:1.35,d:1,name:'Silla 04 · respaldo',kind:'back'},
 {x:-1.8,y:4.8,z:-3,w:2,d:8,name:'Librero 01 · cima',kind:'bookcase',checkpointRank:2},
 {x:.1,y:1.1,z:.7,w:1.5,d:1.5,name:'Librero 01 · repisa 1',kind:'shelf'},
 {x:.1,y:2.2,z:-1.1,w:1.5,d:1.5,name:'Librero 01 · repisa 2',kind:'shelf'},
 {x:.1,y:3.3,z:-2.9,w:1.5,d:1.5,name:'Librero 01 · repisa 3',kind:'shelf'},
 {x:.1,y:4.4,z:-4.7,w:1.5,d:1.5,name:'Librero 01 · repisa 4',kind:'shelf'},
 {x:12,y:4.8,z:-3,w:2,d:8,name:'Librero 02 · cima',kind:'bookcase',checkpointRank:4,spawn:{x:12,z:-6.2}},
 {x:13.9,y:1.1,z:.7,w:1.5,d:1.5,name:'Librero 02 · repisa 1',kind:'shelf',checkpointRank:3},
 {x:13.9,y:2.2,z:-1.1,w:1.5,d:1.5,name:'Librero 02 · repisa 2',kind:'shelf'},
 {x:13.9,y:3.3,z:-2.9,w:1.5,d:1.5,name:'Librero 02 · repisa 3',kind:'shelf'},
 {x:13.9,y:4.4,z:-4.7,w:1.5,d:1.5,name:'Librero 02 · repisa 4',kind:'shelf'},
 {x:15.4,y:3.5,z:-2,w:1.1,d:1.7,name:'Bandeja de llegada',kind:'shelf'},
 {x:1.8,y:1.1,z:6.9,w:1.8,d:1.7,name:'Silla dispersa',kind:'chair'}
];
export const FLOOR_PUDDLE={x:-15,z:5,r:1.2}, FLOOR_CRUMBS={x:2,z:3.5,r:1};
export const CABLES=[{x:-5,z:0,w:3.6,d:.22},{x:7.6,z:.5,w:.22,d:3.7},{x:15.2,z:4,w:4.2,d:.22}];
export const WALLS=[];
for(const i of [4,5,6,7]){const p=platforms[i];WALLS.push(
 {x:p.x,z:p.z+(p.z>0?1:-1)*(p.d/2+.15),w:p.w+.3,d:.18,y:4.1},
 {x:p.x-p.w/2-.15,z:p.z,w:.18,d:p.d+.3,y:4.1});}
export const FAN={x:9.7,y:1.35,z:-.3,range:8,halfAngle:.26};
export function fanAt(t){const angle=Math.PI+Math.sin(t*.65)*.95;return {...FAN,angle,dx:Math.cos(angle),dz:Math.sin(angle)};}
export function fanForce(p,t){
 const f=fanAt(t),dx=p.x-f.x,dz=p.z-f.z,d=Math.hypot(dx,dz);
 if(d<.35||d>f.range||p.y>2.7||p.y+.84<.35)return {x:0,z:0,active:false};
 if((dx*f.dx+dz*f.dz)/d<Math.cos(f.halfAngle))return {x:0,z:0,active:false};
 // Los muebles y paneles cortan el viento. Muestreo del rayo a altura del jugador.
 for(let a=.3;a<d;a+=.2){const x=f.x+dx/d*a,z=f.z+dz/d*a;
  if([...platforms.filter(q=>!q.floor),...WALLS].some(q=>q.y>p.y+.5&&Math.abs(x-q.x)<q.w/2&&Math.abs(z-q.z)<q.d/2))return {x:0,z:0,active:false};}
 const strength=9*(1-d/f.range*.4);return {x:f.dx*strength,z:f.dz*strength,active:true};
}
export function onCable(p){return p.y<.18&&CABLES.some(q=>Math.abs(p.x-q.x)<q.w/2+.2&&Math.abs(p.z-q.z)<q.d/2+.2);}
export function obstacleAt(t){return {x:6+Math.sin(t*.8)*2.8,y:.3,z:8.5,radius:.6,halfLength:.6};}
export function hitsObstacle(p,t){const o=obstacleAt(t);return Math.hypot(p.x-o.x,p.z-o.z)<.9&&p.y<.55;}
export function cameraMovement(right,forward,yaw){return {x:Math.sin(yaw)*forward+Math.cos(yaw)*right,z:-Math.cos(yaw)*forward+Math.sin(yaw)*right};}
export function createPlayer(index=0){const q=platforms[index];return {x:q.spawn?.x??q.x,y:q.y,z:q.spawn?.z??q.z,vy:0,grounded:true,platform:index,checkpoint:index,checkpointRank:q.checkpointRank||0,dropOriginY:q.y,demoStage:0};}
export function blocked(x,z,p){
 if(x< -19.65||x>19.65||z< -10.65||z>10.65)return true;
 return [...platforms.filter(q=>!q.floor),...WALLS].some(q=>Math.abs(x-q.x)<q.w/2+.23&&Math.abs(z-q.z)<q.d/2+.23&&p.y<q.y-.28);
}
// Recorrido guiado por el pasillo y la escalada final. Usa la misma física.
export const ROUTE=[{i:1},{i:2},{x:-11,z:0},{x:-4,z:.6},{x:-4,z:2},{x:2,z:2},{x:3,z:.8},{x:10,z:.8},{x:10,z:2.5},{x:13.9,z:2.5},{i:23},{i:24},{i:25},{i:27},{i:8}];
export function autoInput(p){
 let n=p.demoStage||0,q=ROUTE[Math.min(n,ROUTE.length-1)],target=q.i==null?{...q,y:0}:platforms[q.i];
 let d=Math.hypot(target.x-p.x,target.z-p.z);
 if(p.grounded&&d<.25&&(q.i==null||p.platform===q.i)&&n<ROUTE.length-1){p.demoStage=++n;q=ROUTE[n];target=q.i==null?{...q,y:0}:platforms[q.i];d=Math.hypot(target.x-p.x,target.z-p.z);}
 return {x:d<.12?0:(target.x-p.x)/(d||1),z:d<.12?0:(target.z-p.z)/(d||1),jump:p.grounded&&target.y>p.y+.08&&d<2.35};
}
export function step(p,input,dt,time=0){
 const len=Math.max(1,Math.hypot(input.x,input.z)),wind=p.demo?{x:0,z:0}:fanForce(p,time),speed=SPEED*(p.speedMul??1)*(onCable(p)?.48:1);
 const dx=(input.x/len*speed+(p.kx||0)+wind.x)*dt,dz=(input.z/len*speed+(p.kz||0)+wind.z)*dt;
 if(!blocked(p.x+dx,p.z,p))p.x+=dx;if(!blocked(p.x,p.z+dz,p))p.z+=dz;
 if(input.jump&&p.grounded){p.vy=JUMP;p.grounded=false;}
 const oldY=p.y;p.vy-=GRAVITY*dt;p.y+=p.vy*dt;p.grounded=false;
 let fallDamage=0,brokenFall=false,landedOn=-1;
 if(p.vy<=0){let highest=-Infinity;
  for(let i=0;i<platforms.length;i++){const q=platforms[i];if(q.y>highest&&Math.abs(p.x-q.x)<q.w/2+.1&&Math.abs(p.z-q.z)<q.d/2+.1&&oldY>=q.y-.002&&p.y<=q.y){landedOn=i;highest=q.y;}}
  if(landedOn>=0){const q=platforms[landedOn],fall=Math.max(0,p.dropOriginY-q.y);p.y=q.y;p.vy=0;p.grounded=true;p.platform=landedOn;brokenFall=fall>2.75;fallDamage=!brokenFall&&fall>1.6?Math.min(65,Math.round((fall-1.6)*38)):0;p.dropOriginY=q.y;
   if(!brokenFall&&(q.checkpointRank||0)>p.checkpointRank){p.checkpointRank=q.checkpointRank;p.checkpoint=landedOn;}}
 }
 return {dead:brokenFall||p.y< -3.2,reason:brokenFall?'caída alta':'caída',fallDamage,landedOn,hit:hitsObstacle(p,time),wind:!!wind.active,cable:onCable(p),goal:p.grounded&&p.platform===GOAL_INDEX&&Math.hypot(p.x-platforms[GOAL_INDEX].x,p.z-platforms[GOAL_INDEX].z)<.56};
}

