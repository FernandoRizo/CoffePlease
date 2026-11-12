// Coffee Please · Nivel 04: Sala de estar. Y es la altura de los pies de la taza.
// Los objetos volumétricos se reflejan en las colisiones, no son decoración atravesable.
export const GRAVITY=18,SPEED=4.45,JUMP=7.5,FLOOR_INDEX=2,GOAL_INDEX=24;
const P=(x,y,z,w,d,name,kind,more={})=>({x,y,z,w,d,name,kind,...more});
export const platforms=[
 P(-15.5,2.25,0,3,2.8,'Consola de inicio','start',{start:true}),
 P(-13.5,1.18,1.25,2.1,1.8,'Banquito de bajada','stool'),
 P(0,0,0,36,22,'Suelo de la sala','floor',{floor:true,checkpointRank:1}),
 P(-6.2,1.62,-4.25,6,2.8,'Sofá norte','sofa'),
 P(-6.2,1.62,4.25,6,2.8,'Sofá sur','sofa'),
 P(-6.2,1.27,0,4,2.8,'Mesita de centro','table'),
 P(1.2,.82,-6.55,1.8,1.65,"Libros apilados norte","bookStep"),
 P(2.75,1.60,-6.75,1.65,1.5,"Libros norte I","bookStep"),
 P(4.25,2.38,-6.65,1.65,1.5,"Libros norte II","bookStep"),
 P(5.70,3.14,-6.45,1.65,1.5,"Libros norte III","bookStep"),
 P(8,3.90,-8.50,4.8,2.6,"Librero norte ancho","bookcase",{checkpointRank:2}),
 P(1.2,.82,6.55,1.8,1.65,"Libros apilados sur","bookStep"),
 P(2.75,1.60,6.75,1.65,1.5,"Libros sur I","bookStep"),
 P(4.25,2.38,6.65,1.65,1.5,"Libros sur II","bookStep"),
 P(5.70,3.14,6.45,1.65,1.5,"Libros sur III","bookStep"),
 P(8,3.90,8.50,4.8,2.6,"Librero sur ancho","bookcase",{checkpointRank:2}),
 P(10.2,3.30,-6.25,1.75,1.65,"Libro sobresaliente norte","bookStep"),
 P(10.85,2.55,-4.55,1.8,1.85,"Libros junto a TV norte","bookStep"),
 P(11.2,2.55,0,1.95,7.15,"Repisa frontal del televisor","tv",{checkpointRank:3}),
 P(10.80,3.35,-3.02,1.6,1.55,"Libros · escalón del televisor","bookStep"),
 P(11.85,4.17,-3.65,1.55,1.5,"Libros · ascenso superior I","bookStep"),
 P(13.20,4.92,-3.55,1.65,1.55,"Libros · ascenso superior II","bookStep",{checkpointRank:4}),
 P(10.2,3.30,6.25,1.75,1.65,"Libro sobresaliente sur","bookStep"),
 P(10.85,2.55,4.55,1.8,1.85,"Libros junto a TV sur","bookStep"),
 P(14.5,5.55,-.60,5.75,5.25,"Segundo estante · ventiladores y café","goal",{goal:true,checkpointRank:5}),
];
export const GOAL=platforms[GOAL_INDEX];
export const FLOOR_PUDDLE={x:400,z:400,r:0},FLOOR_CRUMBS={x:400,z:400,r:0};
export const POTS=[
 {x:-1.6,y:0,z:-5.6,r:.46,h:.85},{x:-1.6,y:0,z:5.6,r:.46,h:.85},
 {x:10.15,y:0,z:6.1,r:.50,h:1.0},{x:11.32,y:2.55,z:2.85,r:.29,h:.55}
];
export const GLUE=[
 {x:15.65,y:5.55,z:1.20,r:.94},{x:13.52,y:5.55,z:-1.65,r:.82}
];
// Los libros eyectables tienen aviso antes del empujón y relojes independientes.
export const BOOK_TRAPS=[
 {x:6.55,y:4.15,z:-7.42,dirZ:1,offset:0},
 {x:8.25,y:4.15,z:-7.42,dirZ:1,offset:2.4},
 {x:6.55,y:4.15,z:7.42,dirZ:-1,offset:1.2},
 {x:8.25,y:4.15,z:7.42,dirZ:-1,offset:3.6}
];
export const BOOK_PERIOD=7.2,BOOK_WARNING=.90,BOOK_EXTEND=.43,BOOK_HOLD=.35,BOOK_RETRACT=.48;
export function bookTrapAt(t,i){
 const b=BOOK_TRAPS[i],phase=((t+b.offset)%BOOK_PERIOD+BOOK_PERIOD)%BOOK_PERIOD;
 let extension=0,mode='rest';
 if(phase<BOOK_WARNING)mode='warning';
 else if(phase<BOOK_WARNING+BOOK_EXTEND){mode='out';extension=(phase-BOOK_WARNING)/BOOK_EXTEND;}
 else if(phase<BOOK_WARNING+BOOK_EXTEND+BOOK_HOLD){mode='out';extension=1;}
 else if(phase<BOOK_WARNING+BOOK_EXTEND+BOOK_HOLD+BOOK_RETRACT){
  mode='return';extension=1-(phase-BOOK_WARNING-BOOK_EXTEND-BOOK_HOLD)/BOOK_RETRACT;
 }
 return {...b,mode,extension,z:b.z+b.dirZ*extension*1.24};
}
export function bookHitAt(p,t){
 for(let i=0;i<BOOK_TRAPS.length;i++){
  const b=bookTrapAt(t,i);
  if(b.mode!=='out'||b.extension<.22)continue;
  if(Math.abs(p.y-3.9)>.8||Math.hypot(p.x-b.x,p.z-b.z)>.66)continue;
  return {hit:true,index:i,dirZ:b.dirZ,damage:14};
 }
 return {hit:false};
}
export function onGlue(p){return p.grounded&&GLUE.some(g=>Math.abs(p.y-g.y)<.18&&Math.hypot(p.x-g.x,p.z-g.z)<g.r);}
export function vacuumAt(t){return {x:-9.4+3.35*Math.sin(t*.66),z:1+1.6*Math.sin(t*.92),y:0,r:.7};}
export function hitsVacuum(p,t){const q=vacuumAt(t);return p.y<.68&&Math.hypot(p.x-q.x,p.z-q.z)<q.r+.25;}
// El gato deambula por el piso, brinca a ambos sofás y a la mesita.
export function catAt(t){
 const a=((t%20)+20)%20;
 if(a<5)return {x:-11.3+(a/5)*7.2,z:-1.3+.45*Math.sin(a*2),y:0,zone:'floor',attack:a>1};
 if(a<8)return {x:-8.45+(a-5)*1.4,z:-4.25,y:1.62,zone:'sofa',attack:a>5.45};
 if(a<11)return {x:-5.75+.55*Math.sin((a-8)*2),z:-.90+(a-8)*.48,y:1.27,zone:'table',attack:a>8.4};
 if(a<14)return {x:-4.6-(a-11)*1.05,z:4.25,y:1.62,zone:'sofa',attack:a>11.4};
 return {x:-8.1-1.8*Math.sin((a-14)*.83),z:2.4+(a-14)*.07,y:0,zone:'floor',attack:a>14.5};
}
export function catHit(p,t){
 const c=catAt(t);
 if(!c.attack||Math.hypot(p.x-c.x,p.z-c.z)>=.73||Math.abs(p.y-c.y)>.78)return {hit:false,fatal:false,damage:0};
 return {hit:true,fatal:c.zone!=='floor'&&[3,4,5].includes(p.platform),damage:c.zone==='floor'?43:65};
}
export const FANS=[
 {x:12.72,y:5.91,z:1.50,base:-.6,arc:.77,range:4.2,power:6.6},
 {x:16.22,y:5.86,z:-1.95,base:-2.10,arc:.63,range:3.7,power:7.8}
];
export function fanAt(t,i){const f=FANS[i],a=f.base+Math.sin(t*(i?.85:.96)+i*.8)*f.arc;return {...f,angle:a,dx:Math.sin(a),dz:Math.cos(a)};}
export function fanForce(p,t){
 let x=0,z=0,active=false;
 for(let i=0;i<FANS.length;i++){
  const f=fanAt(t,i),dx=p.x-f.x,dz=p.z-f.z,dist=Math.hypot(dx,dz),dot=dx*f.dx+dz*f.dz;
  if(Math.abs(p.y+.45-f.y)>1.35||dist>f.range||dot<=0||dot/dist<.76)continue;
  const force=f.power*(1-dist/f.range);x+=f.dx*force;z+=f.dz*force;active=true;
 }
 return {x,z,active};
}
export function obstacleAt(t){const q=vacuumAt(t);return {...q,radius:q.r,halfLength:q.r};}
export function hitsObstacle(p,t){return hitsVacuum(p,t);}
export function cameraMovement(right,forward,yaw){return {x:Math.sin(yaw)*forward+Math.cos(yaw)*right,z:-Math.cos(yaw)*forward+Math.sin(yaw)*right};}
export function createPlayer(index=0){
 const q=platforms[index],floor=!!q.floor;
 return {x:floor?-11.8:q.x,y:q.y,z:floor?2.85:q.z,vy:0,grounded:true,platform:index,
  checkpoint:index,checkpointRank:q.checkpointRank||0,dropOriginY:q.y,demoStage:0,kx:0,kz:0,demo:false};
}
export function blocked(x,z,p){
 if(Math.abs(x)>17.55||Math.abs(z)>10.55)return true;
 for(const pot of POTS){
  if(Math.hypot(x-pot.x,z-pot.z)<pot.r+.24&&p.y<pot.y+pot.h-.08&&p.y+.8>pot.y+.15)return true;
 }
 for(const q of platforms){
  if(q.floor)continue;
  if(Math.abs(x-q.x)>=q.w/2+.20||Math.abs(z-q.z)>=q.d/2+.20)continue;
  if(p.y<q.y-.33&&p.y+.84>q.y-.35)return true;
 }
 return false;
}
// El guiado elige el ascenso sur; el jugador puede escoger la biblioteca norte.
export const ROUTE=[{i:1},{x:-11.7,z:3.3,y:0},{x:-7,z:7.6,y:0},{x:-2,z:7.5,y:0},
 {i:11},{i:12},{i:13},{i:14},{i:15},{i:22},{i:23},
 {i:18,x:11.15,z:1.70},{i:18,x:11.15,z:-1.85},{i:19},{i:20},{i:21},{i:24}];
export function autoInput(p){
 let n=p.demoStage||0,q=ROUTE[Math.min(n,ROUTE.length-1)],target=q.i==null?q:{...platforms[q.i],...q},d=Math.hypot(target.x-p.x,target.z-p.z);
 if(p.grounded&&d<.36&&(q.i==null||p.platform===q.i)&&n<ROUTE.length-1){
  p.demoStage=++n;q=ROUTE[n];target=q.i==null?q:{...platforms[q.i],...q};d=Math.hypot(target.x-p.x,target.z-p.z);
 }
 const crossing=q.i===18&&p.platform===23&&d<4.6;
 return {x:d<.13?0:(target.x-p.x)/(d||1),z:d<.13?0:(target.z-p.z)/(d||1),
  jump:p.grounded&&(crossing||(target.y>p.y+.20&&d<(q.i===24?3.45:2.55)))};
}
export function step(p,input,dt,time=0){
 const len=Math.max(1,Math.hypot(input.x||0,input.z||0)),glue=onGlue(p),
  wind=p.demo?{x:0,z:0,active:false}:fanForce(p,time),speed=SPEED*(p.speedMul??1)*(glue?.34:1);
 const dx=((input.x||0)/len*speed+(p.kx||0)+wind.x)*dt,dz=((input.z||0)/len*speed+(p.kz||0)+wind.z)*dt;
 if(!blocked(p.x+dx,p.z,p))p.x+=dx;if(!blocked(p.x,p.z+dz,p))p.z+=dz;
 const jumped=!!(input.jump&&p.grounded&&!glue);
 if(jumped){p.vy=JUMP;p.grounded=false;p.dropOriginY=p.y;}
 const oldY=p.y;p.vy-=GRAVITY*dt;p.y+=p.vy*dt;p.grounded=false;
 let landedOn=-1,fallDamage=0,brokenFall=false;
 if(p.vy<=0){let highest=-Infinity;
  for(let i=0;i<platforms.length;i++){
   const q=platforms[i];if(q.y<=highest)continue;
   if(Math.abs(p.x-q.x)<q.w/2+.10&&Math.abs(p.z-q.z)<q.d/2+.10&&oldY>=q.y-.01&&p.y<=q.y){highest=q.y;landedOn=i;}
  }
  if(landedOn>=0){const q=platforms[landedOn],fall=Math.max(0,(p.dropOriginY??oldY)-q.y);
   p.y=q.y;p.vy=0;p.grounded=true;p.platform=landedOn;brokenFall=fall>2.75;
   fallDamage=!brokenFall&&fall>1.6?Math.min(65,Math.round((fall-1.6)*38)):0;
   p.dropOriginY=q.y;
   if(!brokenFall&&(q.checkpointRank||0)>p.checkpointRank){p.checkpointRank=q.checkpointRank;p.checkpoint=landedOn;}
  }
 }
 const cat=catHit(p,time),vacuum=hitsVacuum(p,time),book=p.demo?{hit:false}:bookHitAt(p,time);
 return {dead:brokenFall||p.y< -3.2,reason:brokenFall?'caída alta':'caída',
  fallDamage,landedOn,glue:onGlue(p),glueJumpBlocked:!!(input.jump&&glue),wind:wind.active,
  hit:!p.demo&&vacuum,cat:!p.demo&&cat.hit?cat:{hit:false,fatal:false,damage:0},book,
  goal:p.grounded&&p.platform===GOAL_INDEX&&Math.hypot(p.x-GOAL.x,p.z-GOAL.z)<.55};
}
