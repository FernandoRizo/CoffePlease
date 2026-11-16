'use strict';
// Enlaza la victoria de un nivel con otro editando in situ public/<origen>/index.html (sin recompilar).
// Uso:   node enlazar-nivel.js <origen> <destino> ["Texto del botón"]
// Ej.:   node enlazar-nivel.js sala terminal "Continuar a la terminal"
// Los niveles llevan su código dentro de un payload en base64 del propio HTML: aquí se decodifica,
// se cambia el botón «Jugar de nuevo / Continuar…» de la pantalla de victoria y se vuelve a codificar.
// Es idempotente. Si luego ejecutas `npm run build`, el build regenera el HTML: para que el enlace sea
// permanente aplica también el cambio en el build-*.js del nivel de origen (ver CAMBIOS_v1.9.md).
const fs=require('node:fs'),path=require('node:path');
const [src,dst,labelArg]=process.argv.slice(2);
if(!src||!dst){console.error('Uso: node enlazar-nivel.js <origen> <destino> ["Texto del botón"]');process.exit(1);}
const label=labelArg||('Continuar a '+dst);
const file=path.join(__dirname,'public',src,'index.html');
if(!fs.existsSync(file)){console.error('No existe '+file);process.exit(1);}
if(!fs.existsSync(path.join(__dirname,'public',dst,'index.html')))console.warn('Aviso: public/'+dst+'/index.html no existe todavía.');
const html=fs.readFileSync(file,'utf8');
const i=html.indexOf('const payload=')+14,j=html.indexOf(';',i);
if(i<14||j<i){console.error('El HTML no tiene el payload esperado.');process.exit(1);}
const pack=JSON.parse(html.slice(i,j));
let g=Buffer.from(pack.game,'base64').toString('utf8');
const before=g;
const url=`new URL(location.protocol==='file:'?'../${dst}/index.html':'../${dst}/',location.href)`;
// 1) acción del botón al ganar (solo la rama state==='won'; el resto —pausa— no se toca)
g=g.replace(/\$\('resume'\)\.onclick=\(\)=>state==='won'\?[\s\S]*?:pause\(\)/,`$('resume').onclick=()=>state==='won'?location.assign(${url}):pause()`);
// 2) etiqueta del botón en la pantalla de victoria (la de pausa dice «Continuar» y no se toca)
g=g.replace(/\$\('resume'\)\.innerHTML='[^'<]*<span>↗<\/span>';showScore\(\)/,`$('resume').innerHTML='${label.replace(/'/g,"\\'")} <span>↗</span>';showScore()`);
// 3) por si algún código aún llama a nextLevel()
g=g.replace(/function nextLevel\(\)\{[^}]*\}/,`function nextLevel(){location.href=${url}.href;}`);
if(g===before){console.log(`public/${src}/index.html ya estaba enlazado a /${dst}/. Sin cambios.`);process.exit(0);}
if(!g.includes(`'../${dst}/'`)){console.error('No se encontró el botón de victoria: no se modificó nada.');process.exit(1);}
pack.game=Buffer.from(g).toString('base64');
fs.copyFileSync(file,file+'.bak');
fs.writeFileSync(file,html.slice(0,i)+JSON.stringify(pack)+html.slice(j));
console.log(`✓ public/${src}/index.html ahora continúa en /${dst}/ (copia de seguridad: index.html.bak).`);
