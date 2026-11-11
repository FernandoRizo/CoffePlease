import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const data=mkdtempSync(join(tmpdir(),'coffee-api-test-')),port=3187;
const server=spawn(process.execPath,['server.js'],{cwd:new URL('..',import.meta.url),env:{...process.env,PORT:String(port),COFFEE_DATA_DIR:data},stdio:['ignore','pipe','pipe']});
const base=`http://localhost:${port}`;
try{
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(new Error('Servidor terminó: '+code)));setTimeout(()=>reject(new Error('Tiempo de espera agotado')),5000).unref();});
 for(const route of ['/juego/','/oficina/','/dashboard/','/levels.json'])assert.equal((await fetch(base+route)).status,200,route);
 const layouts=await (await fetch(base+'/levels.json')).json();assert.equal(layouts['oficina-02-plano'].platforms.filter(p=>p.kind==='desk').length,4);
 for(const [i,level] of ['cocina-01-referencia','oficina-02-plano'].entries()){
  const body={player_id:'qa',username:'Prueba',session_id:'qa-'+i,level_id:level,result:'victoria',metrics:{score:9000,hp_final:100,dirty_percentage:0,dilution_percentage:0,falls_count:0,rating_rank:'S',duration_seconds:60},trajectory:[{x:i*10,y:3,z:2,t:0},{x:i*10+1,y:0,z:3,t:1}]};
  const response=await fetch(base+'/api/partidas',{method:'POST',body:JSON.stringify(body)});assert.equal(response.status,201);
  const duplicate=await (await fetch(base+'/api/partidas',{method:'POST',body:JSON.stringify(body)})).json();assert.equal(duplicate.duplicada,true);
  const records=await (await fetch(base+'/api/partidas?nivel='+level)).json();assert.equal(records.length,1);assert.equal(records[0].level_id,level);
  const detail=await (await fetch(base+'/api/partidas/'+records[0].id)).json();assert.equal(detail.trajectory.length,2);
  const heat=await (await fetch(base+'/api/heatmap?nivel='+level)).json();assert.deepEqual(heat.puntos,[[i*10,2],[i*10+1,3]]);
 }
 assert.equal((await (await fetch(base+'/api/resumen')).json()).total,2);
 console.log('✓ Rutas, mapas, partidas, deduplicación, trayectorias y filtros por nivel');
}finally{server.kill();await new Promise(r=>server.once('exit',r));rmSync(data,{recursive:true,force:true});}
