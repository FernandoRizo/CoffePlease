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
  {x:-10.55,y:3.35,z:-7.2,w:2.20,d:3.00,name:'Panera'},                       // 10
  {x:10.45,y:3.35,z:-7.2,w:3.00,d:3.00,name:'Cafetera',goal:true,checkpointRank:5},// 11
  {x:0,y:0,z:0,w:27.4,d:21.0,name:'Suelo de la cocina',floor:true,checkpointRank:1},// 12
  {x:5.25,y:.75,z:-2.2,w:1.90,d:1.70,name:'Caja baja'},                       // 13
  {x:6.65,y:1.45,z:-3.2,w:1.70,d:1.70,name:'Caja de provisiones',checkpointRank:2},//14
  {x:8.12,y:2.20,z:-3.72,w:2.15,d:1.90,name:'Taburete',checkpointRank:3},      // 15
  {x:9.45,y:2.70,z:-5.0,w:2.30,d:1.35,name:'Cajón entreabierto',checkpointRank:4}//16
];
export const FLOOR_PUDDLE={x:0.7,z:-1.55,r:1.2};
export const FLOOR_CRUMBS={x:-4.1,z:-.2,r:.88};
// Un pequeño rodillo se mueve sobre la mesa. Debe verse donde el juego detecta su colisión.
export function obstacleAt(time){return {x:-1.7,y:3.48,z:2.5+Math.sin(time*2.4)*1.15,radius:.22,halfLength:.50};}
export function hitsObstacle(p,time){const o=obstacleAt(time);return Math.abs(p.x-o.x)<o.radius+.28 && Math.abs(p.z-o.z)<o.halfLength+.25 && p.y<o.y+o.radius&&p.y+.84>o.y-o.radius;}
export function cameraMovement(right,forward,yaw){return {x:Math.sin(yaw)*forward+Math.cos(yaw)*right,z:-Math.cos(yaw)*forward+Math.sin(yaw)*right};}
// Secuencia de demostración: mesa → silla → banco → suelo → cajas → taburete → cajón → cafetera.
// Es un recorrido de ayuda, no una barrera: jugando el movimiento es libre.
const DEMO=[0,1,2,12,13,14,15,16,11];
export function autoInput(p){
  let stage=p.demoStage||0;
  const next=DEMO[Math.min(stage+1,DEMO.length-1)],target=platforms[next];
  const dx=target.x-p.x,dz=target.z-p.z,d=Math.hypot(dx,dz);
  if(p.grounded&&p.platform===next){p.demoStage=Math.min(stage+1,DEMO.length-1);stage=p.demoStage;}
  const to=platforms[DEMO[Math.min(stage+1,DEMO.length-1)]],ux=to.x-p.x,uz=to.z-p.z,l=Math.hypot(ux,uz)||1;
  const elevated=to.y>p.y+.24;
  const edgeDistance=Math.min(Math.max(0,Math.abs(p.x-platforms[p.platform].x)-platforms[p.platform].w/2+.5),.6);
  return {x:ux/l,z:uz/l,jump:p.grounded&&elevated&&l<2.75, demoTarget:to};
}
export function createPlayer(index=0){
  const q=platforms[index];const floor=index===FLOOR_INDEX;
  return {x:floor?3.35:q.x,y:q.y,z:floor?3.95:q.z,vy:0,grounded:true,platform:index,
    checkpoint:index,checkpointRank:q.checkpointRank||0,dropOriginY:q.y,demoStage:0};
}
const EXTRA_SOLIDS=[
  // Refrigerador y estante contra la pared izquierda; su volumen sí impide atravesarlos.
  {x:-11.65,z:1.2,w:2.1,d:2.8,y:5.9},
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
