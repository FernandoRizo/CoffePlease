// Coffee Please — Nivel 01 «La cocina de casa».
// Medidas en unidades del mundo. Y es la altura de los pies de la taza.
// El descenso por los muebles es obligatorio: caer directamente de la mesa rompe la taza.
export const GRAVITY=18, SPEED=4.5, JUMP=7.5;
export const FLOOR_INDEX=12, GOAL_INDEX=11;
export const platforms=[
  {x:-3.1,y:3.20,z:2.5,w:6.10,d:4.60,name:'Mesa del comedor',start:true},        // 0
  {x: 1.2,y:2.05,z:2.4,w:2.30,d:2.10,name:'Silla de bajada'},                  // 1
  {x: 3.45,y:1.0,z:2.65,w:1.80,d:1.90,name:'Banco bajo'},                    // 2
  {x:-3.1,y:3.35,z:-7.2,w:3.10,d:3.00,name:'Fregadero'},                      // 3
  {x:  .1,y:3.35,z:-7.2,w:3.10,d:3.00,name:'Encimera del microondas'},         // 4
  {x: 2.95,y:3.35,z:-7.2,w:2.70,d:3.00,name:'Encimera de preparación'},       // 5
  {x: 5.60,y:3.35,z:-7.2,w:2.60,d:3.00,name:'Estufa'},                         // 6
  {x: 7.90,y:3.35,z:-7.2,w:2.00,d:3.00,name:'Tabla de cortar'},               // 7
  {x:-6.00,y:3.35,z:-7.2,w:2.60,d:3.00,name:'Armario lateral'},               // 8
  {x:-8.35,y:3.35,z:-7.2,w:2.20,d:3.00,name:'Mueble auxiliar'},              // 9
  {x:-10.55,y:3.35,z:-7.2,w:2.20,d:3.00,name:'Panera',checkpointRank:4},                       // 10
  {x:10.45,y:3.35,z:-7.2,w:3.00,d:3.00,name:'Cafetera',goal:true,checkpointRank:5},// 11
  {x:0,y:0,z:0,w:27.4,d:21.0,name:'Suelo de la cocina',floor:true,checkpointRank:1},// 12
  // Nueva ruta: sin cajas a la derecha. Subida por el lateral del refrigerador.
  {x:-7.10,y:.85,z:5.0,w:1.7,d:1.65,name:'Cajón de fruta',kind:'step'}, // 13
  {x:-8.30,y:1.65,z:4.35,w:1.65,d:1.55,name:'Carrito auxiliar',kind:'step'}, // 14
  {x:-9.35,y:2.50,z:3.05,w:1.50,d:1.45,name:'Repisa baja del refrigerador',kind:'shelf',checkpointRank:2}, // 15
  {x:-9.35,y:3.35,z:1.70,w:1.50,d:1.25,name:'Repisa lateral 1',kind:'shelf'}, // 16
  {x:-9.45,y:4.20,z:.60,w:1.50,d:1.20,name:'Repisa lateral 2',kind:'shelf'}, // 17
  {x:-9.52,y:5.05,z:.15,w:1.48,d:1.24,name:'Repisa lateral 3',kind:'shelf'}, // 18
  {x:-11.65,y:5.90,z:1.20,w:2.1,d:2.8,name:'Techo del refrigerador',kind:'fridge',checkpointRank:3}, // 19
  {x:-11.65,y:5.45,z:-1.50,w:1.8,d:1.65,name:'Repisa de pared alta',kind:'wallShelf'}, // 20
  {x:-11.65,y:4.80,z:-3.30,w:1.8,d:1.65,name:'Repisa de pared media',kind:'wallShelf'}, // 21
  {x:-10.60,y:4.10,z:-4.95,w:1.9,d:1.55,name:'Repisa hacia la panera',kind:'wallShelf'} // 22
];
export const FLOOR_PUDDLE={x:0.7,z:-1.55,r:1.2};
export const FLOOR_CRUMBS={x:-4.1,z:-.2,r:.88};
// Un pequeño rodillo se mueve sobre la mesa. Debe verse donde el juego detecta su colisión.
export function obstacleAt(time){return {x:-1.7,y:3.48,z:2.5+Math.sin(time*2.4)*1.15,radius:.22,halfLength:.50};}
export function hitsObstacle(p,time){const o=obstacleAt(time);return Math.abs(p.x-o.x)<o.radius+.28 && Math.abs(p.z-o.z)<o.halfLength+.25 && p.y<o.y+o.radius&&p.y+.84>o.y-o.radius;}
// Las latas se desprenden de las alacenas hacia la parte transitable de las encimeras.
export const CAN_STATIONS=[
 {x:-6.15,z:-7.2,y:6.95,delay:0},
 {x:-1.75,z:-7.2,y:6.95,delay:1.1},
 {x:1.60,z:-7.2,y:6.95,delay:2.2},
 {x:5.20,z:-7.2,y:6.95,delay:3.3},
 {x:8.50,z:-7.2,y:6.95,delay:4.4}
];
// Solo es mortal si el borde inferior de la lata desciende hasta la cabeza.
export function hitsFallingCan(can,p){
 const r=can.radius??.27,top=p.y+.84;
 return can.vy<0&&Math.hypot(can.x-p.x,can.z-p.z)<r+.29&&
        can.prevY-r>=top-.025&&can.y-r<=top+.015&&can.y+r>=p.y+.5;
}
export function cameraMovement(right,forward,yaw){return {x:Math.sin(yaw)*forward+Math.cos(yaw)*right,z:-Math.cos(yaw)*forward+Math.sin(yaw)*right};}
// La demostración recorre el refrigerador y la encimera entera (sin atajos).
const DEMO=[0,1,2,12,13,14,15,16,17,18,19,20,21,22,10,9,8,3,4,5,6,7,11];
export function autoInput(p){
  let n=p.demoStage||0,idx=DEMO[Math.min(n+1,DEMO.length-1)];
  let target=platforms[idx],point={x:target.x,z:(idx===6||idx===7)?-6.0:target.z};
  if(p.grounded&&p.platform===idx&&Math.hypot(p.x-point.x,p.z-point.z)<.57&&n<DEMO.length-2){
    p.demoStage=++n;idx=DEMO[n+1];target=platforms[idx];
    point={x:target.x,z:(idx===6||idx===7)?-6.0:target.z};
  }
  const dx=point.x-p.x,dz=point.z-p.z,d=Math.hypot(dx,dz)||1;
  return {x:dx/d,z:dz/d,jump:p.grounded&&target.y>p.y+.20&&d<2.65,demoTarget:target};
}
export function createPlayer(index=0){
  const q=platforms[index];const floor=index===FLOOR_INDEX;
  return {x:floor?3.35:q.x,y:q.y,z:floor?3.95:q.z,vy:0,grounded:true,platform:index,
    checkpoint:index,checkpointRank:q.checkpointRank||0,dropOriginY:q.y,demoStage:0};
}
const EXTRA_SOLIDS=[
  // La estantería es decorativa, pero el refrigerador es la plataforma 19.
  {x:-11.4,z:6.35,w:2.7,d:2.0,y:4.6}
];
function blocked(x,z,p){
  if(x< -13.30||x>13.28||z< -10.12||z>10.08)return true;
  const radius=.23;
  for(let i=3;i<platforms.length;i++){
    const q=platforms[i];if(q.floor)continue;
    if(Math.abs(x-q.x)>q.w/2+radius||Math.abs(z-q.z)>q.d/2+radius)continue;
    if(p.y<q.y-.35&&p.y+.84>0)return true;
  }
  for(const q of EXTRA_SOLIDS){if(Math.abs(x-q.x)<q.w/2+radius&&Math.abs(z-q.z)<q.d/2+radius&&p.y<q.y-.25)return true;}
  return false;
}
export function step(p,input,dt,time=0){
  const len=Math.hypot(input.x,input.z)||1,sm=(p.speedMul??1)*SPEED;
  const dx=input.x/len*sm*dt+(p.kx||0)*dt,dz=input.z/len*sm*dt+(p.kz||0)*dt;
  if(!blocked(p.x+dx,p.z,p))p.x+=dx;
  if(!blocked(p.x,p.z+dz,p))p.z+=dz;
  if(input.jump&&p.grounded){p.vy=JUMP;p.grounded=false;}
  const oldY=p.y;
  p.vy-=GRAVITY*dt;p.y+=p.vy*dt;p.grounded=false;
  let fallDamage=0,brokenFall=false,landedOn=-1;
  if(p.vy<=0){let land=-1,highest=-Infinity;
    for(let i=0;i<platforms.length;i++){
      const q=platforms[i];if(q.y<=highest)continue;
      if(Math.abs(p.x-q.x)<q.w/2+.10&&Math.abs(p.z-q.z)<q.d/2+.10&&oldY>=q.y-.002&&p.y<=q.y){land=i;highest=q.y;}
    }
    if(land>=0){const q=platforms[land],fall=Math.max(0,(p.dropOriginY??oldY)-q.y);
      p.y=q.y;p.vy=0;p.grounded=true;p.platform=land;landedOn=land;
      // Caídas medibles desde la superficie de salida (no desde el ápice de un salto).
      // 0–1.6 u: seguras; 1.6–2.75 u: daño; >2.75 u: ruptura.
      brokenFall=fall>2.75;
      fallDamage=!brokenFall&&fall>1.6?Math.min(65,Math.round((fall-1.6)*38)):0;
      p.dropOriginY=q.y;
      if(!brokenFall&&(q.checkpointRank||0)>p.checkpointRank){p.checkpointRank=q.checkpointRank;p.checkpoint=land;}
    }
  }
  const stove=platforms[6],burned=p.grounded&&p.platform===6&&Math.hypot(p.x-(stove.x+.6),p.z-stove.z)<.53;
  return {dead:brokenFall||p.y< -3.2||burned,reason:brokenFall?'caída alta':burned?'quemador':'caída',
    fallDamage,landedOn,hit:hitsObstacle(p,time),
    goal:p.grounded&&p.platform===GOAL_INDEX&&Math.abs(p.x-platforms[GOAL_INDEX].x)<.56&&Math.abs(p.z-platforms[GOAL_INDEX].z)<.56};
}
