# ☕ Coffee Please — Juego + Telemetría + Dashboard

Todo corre en tu computadora con **un solo comando** y **sin instalar librerías**.

```
coffee-please/
├── server.js              ← backend (API REST + sirve el juego y el dashboard)
├── seed.js                ← genera partidas de ejemplo
├── package.json
├── public/
│   ├── juego/index.html     ← el juego (ya envía telemetría)
│   └── dashboard/index.html ← dashboard con métricas, histórico y mapa de calor
└── data/                  ← se crea solo: db.json + trayectorias/<id>.json
```

## Tutorial: ponerlo en marcha en local

**1. Instala Node.js (versión 18 o superior).** Descárgalo de https://nodejs.org (versión LTS). Comprueba en una terminal:
```
node --version
```
**2. Descomprime el ZIP** y abre una terminal dentro de la carpeta `coffee-please`.

**3. Enciende el servidor** (no hace falta `npm install`):
```
npm start
```
Verás: `Juego: http://localhost:3000/juego/` y `Dashboard: http://localhost:3000/dashboard/`.

**4. Juega:** abre http://localhost:3000/juego/ → "Empezar a jugar". La primera vez te pide un nombre de jugador (se guarda en tu navegador).

**5. Mira tus datos:** abre http://localhost:3000/dashboard/ (botón "↻ Actualizar"; además se refresca cada 15 s).

**6. (Opcional) Datos de ejemplo** para ver el dashboard lleno. Con el servidor encendido, en **otra** terminal:
```
npm run seed          # 30 partidas
npm run seed 100      # 100 partidas
```
**7. Otro puerto:** `PORT=4000 npm start` (macOS/Linux) · PowerShell: `$env:PORT=4000; npm start` · cmd: `set PORT=4000 && npm start`.

**8. Borrar todos los datos:** apaga el servidor (Ctrl+C) y elimina la carpeta `data/`.

> Abre el juego siempre desde `http://localhost:3000/juego/`. Si lo abres con doble clic (`file://`) también envía datos, pero solo al puerto 3000.

## Qué registra el juego

- **Muestreo:** posición `{x, y, z, t}` cada **200 ms** de tiempo de juego (≈5 puntos/s, no 60). Las pausas no suman.
- **Cuándo envía (una vez por partida, `POST /api/partidas`, asíncrono):**
  - al **llegar a la cafetera** → `victoria`;
  - al **reiniciar, volver al inicio o cerrar la pestaña** → `derrota_ruptura`, `derrota_caida` o `abandono` (según cómo terminó tu última caída). Cerrar la pestaña usa `sendBeacon`.
  - Las partidas de menos de 3 s y el modo "Ver recorrido" no se envían.
- **Puntaje:** solo se otorga al llegar a la cafetera. Derrotas y abandonos guardan puntaje 0 y rango D.

```json
{ "player_id": "…", "username": "Ana", "session_id": "…", "level_id": "cocina-01", "timestamp": "2026-11-03T18:20:00Z",
  "result": "victoria",
  "metrics": { "score": 8420, "duration_seconds": 96.4, "hp_final": 72, "falls_count": 1,
               "dirty_percentage": 12, "dilution_percentage": 24, "rating_rank": "A" },
  "trajectory": [ { "x": 0, "y": 1, "z": -5.4, "t": 0 }, … ] }
```

## Decisiones de implementación (y por qué)

| Tema | Elección | Motivo |
|---|---|---|
| Backend | Node.js con módulos nativos (sin Express) | Mismo lenguaje que el juego; `npm start` sin instalar nada ni compilar |
| Base de datos | `data/db.json` (jugadores + partidas) y un archivo JSON por trayectoria | Cero configuración; separa las trayectorias pesadas del índice. Equivale al esquema del PDF |
| Dashboard | HTML/JS nativo, sin librerías, servido por el mismo servidor | Sin CORS ni build; funciona sin internet |
| Heatmap | **Opción A: 2D top-down** dibujado en canvas con el plano real del nivel | El recorrido es rectangular y plano: se lee mejor desde arriba; no requiere capturas ni Heatmap.js |

Esquema equivalente al del PDF: **jugadores** (`id, username, created_at`), **partidas** (`id, player_id, score, hp_final, dirty_percentage, dilution_percentage, falls_count, rating_rank, duration_seconds, result, created_at` + `session_id, level_id`) y **trayectorias** (`partida_id` + puntos `[x, y, z, t]`, en `data/trayectorias/<id>.json`).

## API

| Método y ruta | Qué hace |
|---|---|
| `POST /api/partidas` | Guarda una partida con su trayectoria (idempotente por `session_id`) |
| `GET /api/resumen` | Total, victorias/derrotas/abandonos, tasa de victoria, puntaje promedio, rangos |
| `GET /api/partidas` | Histórico (sin trayectoria), más reciente primero |
| `GET /api/partidas/:id` | Detalle con trayectoria |
| `GET /api/heatmap` | Puntos (x, z) de las partidas filtradas |
| `GET /api/jugadores` | Jugadores y su número de partidas |

Filtros (query string) en resumen, partidas y heatmap: `jugador` (id), `rango` (S–D), `resultado`, `desde` y `hasta` (`AAAA-MM-DD`, en UTC).

## Solución de problemas

- **El dashboard dice "No se pudo conectar":** el servidor no está encendido (`npm start`) o abriste la página desde otra dirección.
- **Jugué y no aparece la partida:** debe durar al menos 3 s de juego y terminar (llegar a la meta, reiniciar, volver al inicio o cerrar la pestaña). Revisa la consola del navegador (F12) y la terminal del servidor.
- **`EADDRINUSE`:** el puerto 3000 está ocupado; usa otro con `PORT=…`.
- **Quieres otro nombre de jugador:** en la consola del navegador ejecuta `localStorage.removeItem('cp_username')` y recarga.

## Cómo seguir creciendo

- **PostgreSQL/Supabase:** reemplaza `guardar`, `filtrar` y `leerTray` en `server.js`; la API y el dashboard no cambian.
- **Heatmap 3D (opción B):** carga el nivel con Three.js en el dashboard y dibuja la ruta con `TubeGeometry` coloreando por velocidad.
- **Si cambias el nivel del juego,** actualiza la constante `PL` del dashboard (plataformas del mapa cenital).
- El código del juego viene empaquetado en base64, igual que tu archivo original; la telemetría está en el bloque `TELEMETRÍA` del módulo `game`.
