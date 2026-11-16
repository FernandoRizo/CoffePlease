// Coffee Please · Nivel 06: Terminal internacional — zona de comidas y filtro de seguridad (Tramos 1 y 2).
// Y es la altura de los pies de la taza. El suelo pulido (y=0) NO sostiene a la taza: tocarlo es Derrota Absoluta.
// Todo lo que se mueve (cintas, cortinas, maletas) es una función determinista del tiempo: la escena la reutiliza.
export const GRAVITY=18,SPEED=4.6,JUMP=7.5,FLOOR_INDEX=12,GOAL_INDEX=11,FLOOR_KILL=.45;
const P=(x,y,z,w,d,name,kind,more={})=>({x,y,z,w,d,name,kind,...more});
export const platforms=[
 // ── Tramo 1 · Zona de comidas ──────────────────────────────────────────────
 P(-21.3,3.20,.4,3.2,4.4,'Mostrador de comida rápida · inicio','counter',{start:true}), // 0
 P(-18.0,2.50,2.7,1.8,1.8,'Banco alto','stool'),                                       // 1
 P(-14.8,2.70,.7,2.8,2.8,'Mesa de la plaza I','table'),                                // 2  (hormigas)
 P(-10.0,2.70,-2.8,5.0,2.3,'Mesa larga de comida rápida','longtable'),                 // 3  (empujador)
 P(-5.9,2.45,-.3,1.7,1.7,'Banco alto II','stool'),                                     // 4
 P(-2.0,3.00,-.2,4.2,3.3,'Mostrador de pan dulce','counter',{checkpointRank:2}),       // 5  (hormigas + empujador)
 // ── Tramo 2 · Filtro de seguridad ──────────────────────────────────────────
 P(2.2,3.45,1.9,1.8,1.8,'Carro de bandejas','cart'),                                   // 6
 P(5.5,3.45,.7,4.2,2.8,'Cinta A · escáner de rayos X','conveyor',{conv:{vx:1.7,vz:0}}), // 7  (cortinas)
 P(9.7,3.45,-.4,3.0,3.0,'Mesa de inspección','table',{checkpointRank:3}),              // 8
 P(14.3,3.45,-.6,5.0,2.4,'Cinta B · retorno de equipaje','conveyor',{conv:{vx:-2.2,vz:0}}), // 9  (maletas)
 P(18.9,3.45,-.6,2.6,3.0,'Revisión manual','manual',{checkpointRank:4}),               // 10
 P(22.3,3.90,-.4,2.8,3.2,'Cafetería exprés · meta','goal',{goal:true,checkpointRank:5}), // 11
 P(0,0,0,48,24,'Suelo pulido de la terminal','floor',{floor:true})                     // 12 (mortal)
];
export const GOAL=platforms[GOAL_INDEX];
export const FLOOR_PUDDLE={x:900,z:900,r:0},FLOOR_CRUMBS={x:900,z:900,r:0};
export const CONVEYORS=platforms.flatMap((q,i)=>q.conv?[{i,vx:q.conv.vx,vz:q.conv.vz}]:[]);
// Enemigos del motor compartido: pi = plataforma, pts = waypoints relativos a su centro.
export const PUSHERS=[{pi:3,pts:[[-1.8,0],[1.8,0]]},{pi:5,pts:[[-1.2,.75],[1.2,.75]]}];
export const ANT_SPAWNS=[{pi:2,ox:.7,oz:.55},{pi:5,ox:-1.35,oz:-.7}];
// ── Utilidades de trayectoria: Catmull-Rom uniforme parametrizada por longitud de arco ──
function makePath(pts){
 const n=pts.length,seg=n-1,N=48*seg,S=[];let len=0,prev=null;
 for(let k=0;k<=N;k++){
  const u=k/N*seg,i=Math.min(Math.floor(u),seg-1),f=u-i;
  const a=pts[Math.max(i-1,0)],b=pts[i],c=pts[i+1],d=pts[Math.min(i+2,n-1)];
  const cr=(a,b,c,d)=>.5*((2*b)+(-a+c)*f+(2*a-5*b+4*c-d)*f*f+(-a+3*b-3*c+d)*f*f*f);
  const x=cr(a[0],b[0],c[0],d[0]),z=cr(a[1],b[1],c[1],d[1]);
  if(prev)len+=Math.hypot(x-prev[0],z-prev[1]);
  S.push([x,z,len]);prev=[x,z];
 }
 return {len,at(s){
  s=Math.min(Math.max(s,0),len);let lo=0,hi=S.length-1;
  while(hi-lo>1){const m=(lo+hi)>>1;if(S[m][2]<=s)lo=m;else hi=m;}
  const A=S[lo],B=S[hi],f=B[2]>A[2]?(s-A[2])/(B[2]-A[2]):0,tx=B[0]-A[0],tz=B[1]-A[1],tl=Math.hypot(tx,tz)||1;
  return {x:A[0]+tx*f,z:A[1]+tz*f,tx:tx/tl,tz:tz/tl};
 }};
}
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
// ── Maletas rígidas que viajan sobre la cinta B (mismo sentido y velocidad que la banda) ──
export const SUITCASES=[
 {pts:[[17.0,-.7],[14.3,-.45],[11.6,-.7]],y:3.45,speed:2.2,mode:'loop',offset:0,w:1.2,d:1.1,h:.95,color:0},
 {pts:[[17.0,-.45],[14.3,-.75],[11.6,-.45]],y:3.45,speed:2.2,mode:'loop',offset:2.7,w:1.2,d:1.1,h:.95,color:1}
];
const PATHS=SUITCASES.map(s=>makePath(s.pts));
export const K_SUITCASE=5.5,K_CURTAIN=4;
export function suitcaseAt(t,i){
 const S=SUITCASES[i],path=PATHS[i],L=path.len;let s,dir=1;
 if(S.mode==='pingpong'){const u=(((t*S.speed+S.offset)%(2*L))+2*L)%(2*L);s=u<L?u:2*L-u;dir=u<L?1:-1;}
 else s=(((t*S.speed+S.offset)%L)+L)%L;
 const q=path.at(s);
 return {i,x:q.x,y:S.y,z:q.z,vx:q.tx*S.speed*dir,vz:q.tz*S.speed*dir,speed:S.speed,w:S.w,d:S.d,h:S.h,
  alpha:S.mode==='loop'?Math.min(1,s/.6,(L-s)/.6):1};
}
export function suitcaseHit(p,t){
 for(let i=0;i<SUITCASES.length;i++){
  const s=suitcaseAt(t,i);
  if(s.alpha<.8||Math.abs(p.x-s.x)>=s.w/2+.28||Math.abs(p.z-s.z)>=s.d/2+.28)continue;
  if(!(p.y<s.y+s.h-.05&&p.y+.84>s.y+.05))continue;
  const rel=Math.hypot(s.vx-(p.vx||0),s.vz-(p.vz||0));
  let nx=p.x-s.x,nz=p.z-s.z,l=Math.hypot(nx,nz);
  if(l<.05){nx=s.vx;nz=s.vz;l=Math.hypot(nx,nz)||1;}
  return {hit:true,index:i,speed:rel,damage:clamp(Math.round(rel*K_SUITCASE),10,48),kx:nx/l*6,kz:nz/l*6};
 }
 return {hit:false};
}
// ── Cortinas de plomo del escáner: péndulos sobre la cinta A. ΔHP = v_relativa × k ──
export const CURTAINS=[
 {i:7,x:4.5,amp:.6,freq:1.5,phase:0,w:.4,h:1.1},
 {i:7,x:6.5,amp:.6,freq:1.5,phase:Math.PI,w:.4,h:1.1}
];
export function curtainAt(t,k){
 const c=CURTAINS[k],q=platforms[c.i],a=c.freq*t+c.phase;
 return {i:k,x:c.x+c.amp*Math.sin(a),vx:c.amp*c.freq*Math.cos(a),y:q.y,z:q.z,w:c.w,d:q.d-.2,h:c.h};
}
export function curtainHit(p,t){
 for(let k=0;k<CURTAINS.length;k++){
  const c=curtainAt(t,k);
  if(Math.abs(p.x-c.x)>=c.w/2+.3||Math.abs(p.z-c.z)>=c.d/2||p.y<c.y-.3)continue;
  if(!(p.y<c.y+c.h&&p.y+.84>c.y+.05))continue;
  const rel=Math.abs(c.vx-(p.vx||0));
  return {hit:true,index:k,speed:rel,damage:clamp(Math.round(rel*K_CURTAIN),10,32),kx:(Math.sign(p.x-c.x)||1)*5,kz:0};
 }
 return {hit:false};
}
export function obstacleAt(t){const s=suitcaseAt(t,0);return {x:s.x,y:s.y,z:s.z,radius:.6,halfLength:.6};}
export function hitsObstacle(p,t){return suitcaseHit(p,t).hit;}
export function cameraMovement(right,forward,yaw){return {x:Math.sin(yaw)*forward+Math.cos(yaw)*right,z:-Math.cos(yaw)*forward+Math.sin(yaw)*right};}
export function createPlayer(index=0){
 const q=platforms[index];
 return {x:q.spawn?.x??q.x,y:q.y,z:q.spawn?.z??q.z,vy:0,grounded:true,platform:index,checkpoint:index,
  checkpointRank:q.checkpointRank||0,dropOriginY:q.y,demoStage:0,kx:0,kz:0,vx:0,vz:0,demo:false};
}
export function blocked(x,z,p){
 if(Math.abs(x)>23.4||Math.abs(z)>11)return true;
 for(const q of platforms){
  if(q.floor)continue;
  if(Math.abs(x-q.x)>=q.w/2+.2||Math.abs(z-q.z)>=q.d/2+.2)continue;
  if(p.y<q.y-.33)return true;   // los muebles son sólidos hasta el suelo
 }
 return false;
}
// Recorrido guiado: no hay golpes de maletas/cortinas (p.demo) pero sí cintas, que son terreno.
export const ROUTE=[{i:1},{i:2},{i:3},{i:4},{i:5},{i:6},{i:7},{i:8},{i:9},{i:10},{i:11}];
export function autoInput(p){
 let n=p.demoStage||0,q=ROUTE[Math.min(n,ROUTE.length-1)],D=platforms[q.i],t={...D,...q},d=Math.hypot(t.x-p.x,t.z-p.z);
 if(p.grounded&&p.platform===q.i&&d<.45&&n<ROUTE.length-1){p.demoStage=++n;q=ROUTE[n];D=platforms[q.i];t={...D,...q};d=Math.hypot(t.x-p.x,t.z-p.z);}
 const ux=d<.12?0:(t.x-p.x)/d,uz=d<.12?0:(t.z-p.z)/d,cur=platforms[p.platform];
 const leaving=Math.abs(p.x+ux*.45-cur.x)>cur.w/2-.04||Math.abs(p.z+uz*.45-cur.z)>cur.d/2-.04;
 const e=Math.hypot(Math.max(Math.abs(p.x-D.x)-D.w/2,0),Math.max(Math.abs(p.z-D.z)-D.d/2,0));
 return {x:ux,z:uz,jump:p.grounded&&p.platform!==q.i&&e>.05&&((leaving&&e<3.2)||(D.y>p.y+.2&&e<1.1))};
}
export function step(p,input,dt,time=0){
 const belt=p.grounded?platforms[p.platform]?.conv:null;
 const len=Math.max(1,Math.hypot(input.x||0,input.z||0)),speed=SPEED*(p.speedMul??1);
 const dx=((input.x||0)/len*speed+(p.kx||0)+(belt?belt.vx:0))*dt,dz=((input.z||0)/len*speed+(p.kz||0)+(belt?belt.vz:0))*dt;
 const ox=p.x,oz=p.z;
 if(!blocked(p.x+dx,p.z,p))p.x+=dx;
 if(!blocked(p.x,p.z+dz,p))p.z+=dz;
 p.vx=(p.x-ox)/dt;p.vz=(p.z-oz)/dt;
 if(input.jump&&p.grounded){p.vy=JUMP;p.grounded=false;p.dropOriginY=p.y;}
 const oldY=p.y;p.vy-=GRAVITY*dt;p.y+=p.vy*dt;p.grounded=false;
 let landedOn=-1,fallDamage=0,brokenFall=false;
 if(p.vy<=0){
  let highest=-Infinity;
  for(let i=0;i<platforms.length;i++){
   const q=platforms[i];if(q.floor||q.y<=highest)continue;
   if(Math.abs(p.x-q.x)<q.w/2+.1&&Math.abs(p.z-q.z)<q.d/2+.1&&oldY>=q.y-.002&&p.y<=q.y){highest=q.y;landedOn=i;}
  }
  if(landedOn>=0){
   const q=platforms[landedOn],fall=Math.max(0,(p.dropOriginY??oldY)-q.y);
   p.y=q.y;p.vy=0;p.grounded=true;p.platform=landedOn;brokenFall=fall>2.75;
   fallDamage=!brokenFall&&fall>1.6?Math.min(65,Math.round((fall-1.6)*38)):0;
   p.dropOriginY=q.y;
   if(!brokenFall&&(q.checkpointRank||0)>p.checkpointRank){p.checkpointRank=q.checkpointRank;p.checkpoint=landedOn;}
  }
 }
 const dead=brokenFall||p.y<=FLOOR_KILL,none={hit:false};
 return {dead,reason:brokenFall?'caída alta':'caída',fallDamage,landedOn,conveyor:!!belt,hit:false,
  suitcase:p.demo?none:suitcaseHit(p,time),curtain:p.demo?none:curtainHit(p,time),
  goal:p.grounded&&p.platform===GOAL_INDEX&&Math.hypot(p.x-GOAL.x,p.z-GOAL.z)<.6};
}
