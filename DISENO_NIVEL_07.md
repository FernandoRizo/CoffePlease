# Coffee Please — Nivel 07 · Terminal internacional: pasillo de bebederos y sala VIP (v1.9)

Continuación del nivel 6 (ver `DISENO_NIVEL_06.md` para la división del GDD). Cubre los **tramos 3 y 4**: `embarque-07-vip`, URL `/embarque/`. Mantiene la regla central: **el suelo pulido (Y = 0) es Derrota Absoluta**.

## Mapa cenital aproximado

```text
 Z -11 ┌───────────────────────────────────────────────────────────────────────┐
       │  ductos de A/C (goteras) · ventanal · asientos de embarque (instanced) │
       │ TRAMO 3: BEBEDEROS Y DUCTOS            TRAMO 4: EMBARQUE Y VIP         │
       │ [0]→[1 banca]→[2 bebedero]→[3 banca]→[4 SECADOR]→[5 bebedero]→[6 CP2]  │
       │ inicio         ·gotera·      hormigas   ↑aire↑      ·goteras·  ↑aire↑  │
       │      →[7 maletas]→[8 maletas CP3]→[9 banca ×2 empujadores]→[10 CARRIL] │
       │                                                          ↕ maletas ↕   │
 Z +11 │                                    [12 ☕ VIP]←[11 mostrador CP4]       │
       └───────────────────────────────────────────────────────────────────────┘
        X −24                          X 0                              X +24
```

## Plataformas

| # | Nombre | Tipo | Y | Notas |
|---|---|---|---:|---|
| 0 | Mostrador de información · inicio | counter | 3.40 | Inicio |
| 1 | Banca de espera I | bench | 2.90 | |
| 2 | Bebedero I | fountain | 3.30 | **Gotera** sobre el centro |
| 3 | Banca de espera II | bench | 2.90 | **Hormigas** + empujador + gotera de A/C |
| 4 | Secador de manos | dryer | 3.30 | **Chorro de aire** (obligatorio de atravesar), gotera |
| 5 | Bebedero II | fountain | 3.30 | 2 goteras |
| 6 | Pasarela de ductos | walkway | 3.20 | **Checkpoint rango 2** (frontera tramo 3→4), chorro de aire, gotera |
| 7 | Maleta apilada I | stack | 3.50 | Puente angosto 2.0 × 1.7 |
| 8 | Maleta apilada II | stack | 3.90 | **Checkpoint rango 3** |
| 9 | Banca de embarque | bench | 3.90 | **2 empujadores** en alerta + hormigas |
| 10 | Carril de maletas | rail | 3.90 | 2.2 × 6.4: **2 maletas** rodando a alta velocidad |
| 11 | Mostrador VIP · acceso | counter | 3.90 | **Checkpoint rango 4** |
| 12 | Mostrador VIP · cafetera | goal | 4.40 | Meta (rango 5) |
| 13 | Suelo pulido | floor | 0 | Mortal |

La cadena de plataformas es **lineal**: la prueba `no hay atajos` verifica que ninguna plataforma puede alcanzarse saltando desde otra que no sea su vecina en la ruta.

## Tramo 3 · Bebederos y ductos

- **Goteras** (`DRIPS`, 6 emisores: 2 bebederos averiados y 4 respiraderos de A/C). Cada emisor suelta una gota cada **1.0–2.5 s** (aleatorio, `DRIP_MIN/DRIP_MAX`), con gravedad 18. Una gota que cae por la boca de la taza suma **+12 % de dilución** (sin dañar la salud) y cambia el color/opacidad del café (motor compartido). *Culling por tramo*: solo gotean los emisores a menos de 12 u de la taza. Las gotas desaparecen al tocar la superficie bajo ellas (`supportHeight`), no solo el suelo.
- **Chorros de aire limpio** (`AIR_JETS`, `airJetAt`): volumen sobre el secador y la pasarela. Atravesarlos **elimina el 100 % de las hormigas** al instante (`res.jet`). Las hormigas nacen en la banca II justo antes del secador para enseñar la mecánica.
- **Peso por dilución**: −0.15 % de velocidad por 1 % de dilución.

## Tramo 4 · Embarque y VIP

- **Puentes de maletas apiladas** (7 y 8): 2.0 × 1.7 u. Se dibujan como pilas de maletas de colores hasta el suelo.
- **Banca de embarque** (9): dos escarabajos con waypoints cruzados (sin daño de salud, solo empuje hacia el vacío) y un hormiguero.
- **Carril de maletas** (10): dos maletas (1.2 × 1.1 × 0.95) van y vienen a **4.4 u/s** por una curva Catmull-Rom. Daño = `clamp(round(|v_maleta − v_taza| × 5.5), 10, 48)`; saltar por encima las evita (apogeo del salto 1.56 u > 0.95 u). El carril mide 2.2 de ancho: no hay carril libre.
- **Checkpoints**: la pasarela (6) cierra el tramo 3; la maleta II (8) y el mostrador VIP (11) parten el tramo 4.

## Pruebas

`npm run test:embarque` (`tests/embarque.test.mjs`, 7 pruebas): estructura y datos de goteo/chorros, suelo mortal, detección de chorros, maletas rodantes (ida y vuelta, daño, salto, sin golpe en demo), ausencia de atajos, recorrido guiado (≈ 14 s) y checkpoints. En el navegador (`npm run test:airport:browser`): goteras que diluyen, chorro que limpia hormigas y recorrido completo con el motor real.

## Ajustes rápidos (`src/embarque-physics.js`)

`DRIPS`, `DRIP_MIN/MAX`, `AIR_JETS`, `SUITCASES` (`speed`, `offset`), `K_SUITCASE`, `PUSHERS`, `ANT_SPAWNS`, `platforms`. Apariencia en `src/embarque-scene.js`. Después: `npm run build`.

## Límites conocidos

- Los chorros solo limpian: no empujan ni elevan a la taza (el GDD menciona «corrientes ascendentes y laterales»; no se añadió fuerza para no sumar otra vía de caída).
- Las gotas no usan un shader de refracción (índice 1.33): son las esferas translúcidas del motor.
- Palomas: reemplazadas por los escarabajos del motor. No se midió el rendimiento en móviles físicos.
- Al ganar, el botón dice «Jugar de nuevo»; cuando exista el siguiente nivel se enlaza en `build-airport.js` (campo `next`).
