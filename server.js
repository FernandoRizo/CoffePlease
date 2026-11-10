'use strict';
// Backend sin dependencias: solo módulos nativos de Node (>=18). Guarda en ./data (JSON + 1 archivo por trayectoria).
const http = require('http'), fs = require('fs'), path = require('path');
const PORT = process.env.PORT || 3000, PUB = path.join(__dirname, 'public');
const DATA = path.join(__dirname, 'data'), TRAY = path.join(DATA, 'trayectorias'), DBF = path.join(DATA, 'db.json');
fs.mkdirSync(TRAY, { recursive: true });
let db = { next_id: 1, jugadores: {}, partidas: [] };
try { db = JSON.parse(fs.readFileSync(DBF, 'utf8')); } catch {}
const guardar = () => { fs.writeFileSync(DBF + '.tmp', JSON.stringify(db)); fs.renameSync(DBF + '.tmp', DBF); };

const RESULTADOS = ['victoria', 'derrota_ruptura', 'derrota_caida', 'abandono'];
const num = (v, min, max) => { v = Number(v); if (!Number.isFinite(v)) throw new Error('valor numérico inválido'); return Math.min(max, Math.max(min, v)); };
const txt = (v, n) => String(v ?? '').trim().slice(0, n);
function validar(b) {
  const m = b.metrics || {}, rango = txt(m.rating_rank, 1), resultado = txt(b.result, 20);
  if (!txt(b.player_id, 64) || !txt(b.session_id, 64)) throw new Error('faltan player_id o session_id');
  if (!'SABCD'.includes(rango) || !rango) throw new Error('rating_rank inválido');
  if (!RESULTADOS.includes(resultado)) throw new Error('result inválido');
  const tray = (Array.isArray(b.trajectory) ? b.trajectory : []).slice(0, 20000)
    .map(p => [num(p.x, -500, 500), num(p.y, -500, 500), num(p.z, -500, 500), num(p.t, 0, 86400)].map(n => Math.round(n * 100) / 100));
  return {
    partida: {
      player_id: txt(b.player_id, 64), session_id: txt(b.session_id, 64), level_id: txt(b.level_id, 40) || 'cocina-01',
      score: Math.round(num(m.score, 0, 10000)), hp_final: Math.round(num(m.hp_final, 0, 100)),
      dirty_percentage: Math.round(num(m.dirty_percentage, 0, 100)), dilution_percentage: Math.round(num(m.dilution_percentage, 0, 100)),
      falls_count: Math.round(num(m.falls_count, 0, 9999)), rating_rank: rango, duration_seconds: num(m.duration_seconds, 0, 86400),
      result: resultado, created_at: new Date(Date.parse(b.timestamp) || Date.now()).toISOString()
    }, username: txt(b.username, 24) || 'Jugador', tray
  };
}
const filtrar = q => db.partidas.filter(p =>
  (!q.jugador || p.player_id === q.jugador) && (!q.nivel || p.level_id === q.nivel) && (!q.rango || p.rating_rank === q.rango) && (!q.resultado || p.result === q.resultado) &&
  (!q.desde || p.created_at.slice(0, 10) >= q.desde) && (!q.hasta || p.created_at.slice(0, 10) <= q.hasta));
function resumen(l) {
  const rangos = { S: 0, A: 0, B: 0, C: 0, D: 0 }; let victorias = 0, derrotas = 0, suma = 0, sumaV = 0;
  for (const p of l) { rangos[p.rating_rank]++; suma += p.score; if (p.result === 'victoria') { victorias++; sumaV += p.score; } else if (p.result.startsWith('derrota')) derrotas++; }
  return { total: l.length, victorias, derrotas, abandonos: l.length - victorias - derrotas,
    tasa_victoria: l.length ? victorias / l.length : 0, puntaje_promedio: l.length ? suma / l.length : 0, puntaje_promedio_victorias: victorias ? sumaV / victorias : 0, rangos };
}
const leerTray = id => { try { return JSON.parse(fs.readFileSync(path.join(TRAY, id + '.json'), 'utf8')); } catch { return []; } };
const leerCuerpo = req => new Promise((ok, ko) => {
  let n = 0; const c = [];
  req.on('data', d => { n += d.length; if (n > 3e6) { ko(new Error('cuerpo demasiado grande')); req.destroy(); } else c.push(d); });
  req.on('end', () => ok(Buffer.concat(c).toString('utf8'))); req.on('error', ko);
});
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
const json = (res, data, code = 200) => { res.writeHead(code, { ...CORS, 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(data)); };
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };

async function api(req, res, u) {
  const q = Object.fromEntries(u.searchParams), ruta = u.pathname;
  if (req.method === 'POST' && ruta === '/api/partidas') {   // el juego envía text/plain para evitar preflight CORS
    let v; try { v = validar(JSON.parse(await leerCuerpo(req))); } catch (e) { return json(res, { error: e.message }, 400); }
    const previa = db.partidas.find(p => p.session_id === v.partida.session_id);
    if (previa) return json(res, { id: previa.id, duplicada: true });
    const id = db.next_id++, pid = v.partida.player_id;
    db.jugadores[pid] = { id: pid, username: v.username, created_at: db.jugadores[pid]?.created_at || new Date().toISOString() };
    db.partidas.push({ id, ...v.partida });
    fs.writeFileSync(path.join(TRAY, id + '.json'), JSON.stringify(v.tray)); guardar();
    return json(res, { id }, 201);
  }
  if (req.method !== 'GET') return json(res, { error: 'método no permitido' }, 405);
  if (ruta === '/api/resumen') return json(res, resumen(filtrar(q)));
  if (ruta === '/api/jugadores') return json(res, Object.values(db.jugadores).map(j => ({ ...j, partidas: db.partidas.filter(p => p.player_id === j.id).length })));
  const nombre = id => db.jugadores[id]?.username || 'Jugador';
  if (ruta === '/api/partidas') return json(res, filtrar(q).map(p => ({ ...p, username: nombre(p.player_id) })).sort((a, b) => b.created_at.localeCompare(a.created_at)));
  const m = ruta.match(/^\/api\/partidas\/(\d+)$/);
  if (m) { const p = db.partidas.find(x => x.id === +m[1]); return p ? json(res, { ...p, username: nombre(p.player_id), trajectory: leerTray(p.id) }) : json(res, { error: 'no existe' }, 404); }
  if (ruta === '/api/heatmap') {   // puntos (x,z) de las partidas filtradas, para el mapa de calor acumulado
    const l = filtrar(q); let pts = [];
    for (const p of l) for (const a of leerTray(p.id)) pts.push([a[0], a[2]]);
    const paso = Math.ceil(pts.length / 40000); if (paso > 1) pts = pts.filter((_, i) => i % paso === 0);
    return json(res, { partidas: l.length, puntos: pts });
  }
  json(res, { error: 'ruta no encontrada' }, 404);
}
function estatico(res, ruta) {
  let f = path.normalize(path.join(PUB, decodeURIComponent(ruta)));
  if (f !== PUB && !f.startsWith(PUB + path.sep)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) {
    if (!ruta.endsWith('/')) { res.writeHead(301, { Location: ruta + '/' }); return res.end(); }
    f = path.join(f, 'index.html');
  }
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('No encontrado'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); res.end(d);
  });
}
http.createServer((req, res) => {
  const u = new URL(req.url, 'http://localhost');
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); return res.end(); }
  if (u.pathname === '/') { res.writeHead(302, { Location: '/juego/' }); return res.end(); }
  if (u.pathname.startsWith('/api/')) return api(req, res, u).catch(e => { console.error(e); json(res, { error: 'error interno' }, 500); });
  estatico(res, u.pathname);
}).listen(PORT, () => console.log(`\n☕ Coffee Please listo\n   Juego:     http://localhost:${PORT}/juego/\n   Dashboard: http://localhost:${PORT}/dashboard/\n`));