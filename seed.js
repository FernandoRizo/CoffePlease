'use strict';
// Genera partidas de ejemplo para ver el dashboard con datos. Uso: npm run seed [cantidad]   (el servidor debe estar encendido)
const URL_API = (process.env.API || 'http://localhost:' + (process.env.PORT || 3000)) + '/api/partidas';
const P = [[0,-5.4,1],[3.6,-5.4,1.3],[7.2,-5.4,1.65],[10.8,-5.4,2],[14.4,-5.4,2],[14.4,-1.8,2],[14.4,1.8,2],[14.4,5.4,2],[10.8,5.4,2],[7.2,5.4,2],[3.6,5.4,2],[0,5.4,2]];
const JUG = ['Ana', 'Luis', 'Marta', 'Diego', 'Sofía'].map((n, i) => ({ id: 'seed-player-' + i, n }));
const rnd = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];
function partida() {
  const gana = Math.random() < .45, llega = gana ? P.length - 1 : 2 + Math.floor(Math.random() * 8);
  const tray = []; let t = 0, x = P[0][0], z = P[0][1];
  const paso = (px, pz, py) => { tray.push({ x: +(px + rnd(-.08, .08)).toFixed(2), y: +py.toFixed(2), z: +(pz + rnd(-.08, .08)).toFixed(2), t: +t.toFixed(2) }); t += .2; };
  for (let k = 0; k < llega; k++) {
    const [ax, az, ay] = P[k], [bx, bz, by] = P[k + 1], n = Math.round(Math.hypot(bx - ax, bz - az) / .9) + 1;
    for (let i = 0; i < n; i++) paso(ax + (bx - ax) * i / n, az + (bz - az) * i / n, ay + (i > n * .5 ? (by - ay) : 0) + Math.sin(i / n * Math.PI) * 1.2);
    if ([4, 6, 8, 10].includes(k) && Math.random() < .7) for (let i = 0; i < Math.round(rnd(4, 18)); i++) paso(bx + rnd(-.5, .5), bz + rnd(-.5, .5), by);  // zonas "atascadas"
  }
  const j = pick(JUG), limpia = gana && Math.random() < .35;  // ~1/3 de las victorias son partidas casi perfectas
  const hp = limpia ? Math.round(rnd(92, 100)) : gana ? Math.round(rnd(20, 100)) : Math.round(rnd(0, 60)), suc = Math.round(limpia ? rnd(0, 6) : rnd(0, 60)), dil = Math.round(limpia ? rnd(0, 5) : rnd(0, 48)), caidas = limpia ? 0 : Math.floor(rnd(0, gana ? 4 : 2));
  const calc = Math.max(0, 10000 - (100 - hp) * 40 - suc * 35 - dil * 50 - caidas * 500), score = gana ? calc : 0, rango = !gana ? 'D' : calc >= 9000 ? 'S' : calc >= 7500 ? 'A' : calc >= 5500 ? 'B' : calc >= 3000 ? 'C' : 'D';
  return { player_id: j.id, username: j.n, session_id: 'seed-' + Math.random().toString(36).slice(2), level_id: 'cocina-01',
    timestamp: new Date(Date.now() - rnd(0, 14 * 864e5)).toISOString(), result: gana ? 'victoria' : pick(['derrota_ruptura', 'derrota_caida', 'abandono']),
    metrics: { score, duration_seconds: +t.toFixed(1), hp_final: hp, falls_count: caidas, dirty_percentage: suc, dilution_percentage: dil, rating_rank: rango }, trajectory: tray };
}
(async () => {
  const n = +process.argv[2] || 30;
  for (let i = 0; i < n; i++) { const r = await fetch(URL_API, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(partida()) }); if (!r.ok) throw new Error(await r.text()); }
  console.log(`✔ ${n} partidas de ejemplo enviadas a ${URL_API}`);
})().catch(e => { console.error('No se pudo conectar. ¿Está encendido el servidor (npm start)?', e.message); process.exit(1); });
