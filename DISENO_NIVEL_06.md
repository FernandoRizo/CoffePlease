# Coffee Please — Nivel 06 · Terminal internacional: zona de comidas y filtro de seguridad (v1.9)

## Origen y división del GDD

El GDD «Nivel 6: Terminal Internacional (Aeropuerto)» describe cuatro tramos. Se dividió en dos niveles jugables:

| Nivel | Tramos del GDD | Identificador | URL |
|---|---|---|---|
| **6** (este documento) | 1 · Zona de comidas, 2 · Filtro de seguridad y banda transportadora | `terminal-06-seguridad` | `/terminal/` |
| 7 (`DISENO_NIVEL_07.md`) | 3 · Pasillo de bebederos y ductos de A/C, 4 · Sala de embarque y mostrador VIP | `embarque-07-vip` | `/embarque/` |

Cada nivel termina en una cafetera propia: la **Cafetería exprés** (nivel 6) y el **Mostrador VIP** (nivel 7). Al ganar el nivel 6, el botón conduce al nivel 7.

## Regla central: el suelo es la derrota

El suelo pulido (Y = 0) está varios metros por debajo de todas las plataformas (la más baja está a Y = 2.45). **No sostiene a la taza**: al bajar de Y = 0.45 la física devuelve `dead:true, reason:'caída'` (Derrota Absoluta, sin importar la salud). Cuenta como caída en el puntaje (−500) y en la telemetría (`derrota_caida`). No existe ningún camino a pie por el suelo.

## Mapa cenital aproximado (X de izquierda a derecha)

```text
 Z -11 ┌──────────────────────────────────────────────────────────────────┐
       │  ventanal + aviones · cartelera de salidas · filas de sillas      │
       │            [3 mesa larga]                                         │
       │ TRAMO 1: PLAZA DE COMIDAS          TRAMO 2: FILTRO DE SEGURIDAD   │
       │ [0]→[1]→[2 mesa]→[3]→[4]→[5 pan dulce]→[6]→[7 CINTA A + rayos X]  │
       │ inicio  banco hormigas  banco  CP2  carro   ▶ cortinas ▶          │
       │                                    →[8 inspección CP3]→[9 CINTA B]│
       │                                       ◀ maletas ◀  →[10 CP4]→[11☕]│
 Z +11 └──────────────────────────────────────────────────────────────────┘
        X −24                          X 0                           X +24
```

## Plataformas (Y = altura de los pies de la taza)

| # | Nombre | Tipo | Y | Notas |
|---|---|---|---:|---|
| 0 | Mostrador de comida rápida · inicio | counter | 3.20 | Inicio |
| 1 | Banco alto | stool | 2.50 | Descenso 0.7 (sin daño) |
| 2 | Mesa de la plaza I | table | 2.70 | **Hormigas** (migajas) |
| 3 | Mesa larga de comida rápida | longtable | 2.70 | **Escarabajo empujador** |
| 4 | Banco alto II | stool | 2.45 | |
| 5 | Mostrador de pan dulce | counter | 3.00 | **Checkpoint rango 2**, hormigas + empujador |
| 6 | Carro de bandejas | cart | 3.45 | |
| 7 | Cinta A · escáner de rayos X | conveyor | 3.45 | Arrastra a **+1.7 u/s**; 2 cortinas pendulares |
| 8 | Mesa de inspección | table | 3.45 | **Checkpoint rango 3** (frontera de «tramo») |
| 9 | Cinta B · retorno de equipaje | conveyor | 3.45 | Arrastra a **−2.2 u/s** (en contra); 2 maletas |
| 10 | Revisión manual | manual | 3.45 | **Checkpoint rango 4** |
| 11 | Cafetería exprés · meta | goal | 3.90 | Meta (rango 5) |
| 12 | Suelo pulido | floor | 0 | Mortal; no se puede pisar |

Los huecos entre plataformas son de 0.3 a 1.3 unidades: toda subida o hueco mayor que 0.2 exige salto. Los checkpoints nunca están sobre una cinta.

## Mecánicas nuevas (y dónde viven)

- **Cintas transportadoras** (`conv:{vx,vz}` en la plataforma). Mientras la taza está apoyada se suma el vector de la banda al desplazamiento (antes de la colisión); en el aire no hay arrastre. La textura se desplaza con `texture.offset` sincronizada con la velocidad (`terminalFx`).
- **Cortinas de plomo del escáner** (`CURTAINS`, `curtainAt`, `curtainHit`). Dos péndulos con amplitud 0.6 u y frecuencia 1.5 rad/s, en oposición de fase. Alto 1.1 u: se pueden **saltar**. Daño = `clamp(round(|v_cortina − v_taza| × 4), 10, 32)` y empujón en X.
- **Maletas rígidas** (`SUITCASES`, `suitcaseAt`, `suitcaseHit`). Dos maletas de 1.2 × 1.1 × 0.95 u viajan sobre la cinta B a 2.2 u/s (misma velocidad y sentido que la banda) siguiendo una curva **Catmull-Rom** parametrizada por longitud de arco; entran y salen escalándose (alpha < 0.8 no golpea). Daño = `clamp(round(|v_maleta − v_taza| × 5.5), 10, 48)`. Cabe saltarlas o bordearlas por los costados de la cinta (con riesgo de caer).
- **Empujadores**: el escarabajo del motor (PATROL → ALERT → CHARGE). Siguen el GDD: **no restan salud**, solo aplican un empuje para lanzar la taza al vacío.
- **Hormigas**: grietas en las plataformas 2 y 5. Se sacuden saltando 3 veces o girando bruscamente (30 % por sacudida).
- **Dilución → peso**: cada 1 % de dilución reduce 0.15 % la velocidad (GDD §3.4: «aumenta el peso e inercia»). Aplica a ambos niveles.
- `InstancedMesh`: las dos filas de sillas del fondo y sus patas se dibujan con 3 llamadas.

## Checkpoints

Rango 2 (pan dulce, fin del tramo 1) · rango 3 (mesa de inspección, a mitad del filtro) · rango 4 (revisión manual) · rango 5 (cafetería). El **límite entre tramos 2 y 3 es la frontera entre niveles**: el nivel 7 empieza con salud completa. La salud no se recupera por checkpoint dentro del nivel (comportamiento del motor); la reaparición restablece el HP, como en los niveles anteriores.

## Pruebas

`npm run test:terminal` (`tests/terminal.test.mjs`, 9 pruebas deterministas): estructura, suelo mortal, arrastre de las dos cintas (solo si está apoyada), daño de maleta por velocidad relativa y salto por encima, entrada/salida de maletas, cortinas, **ausencia de atajos** (la meta solo se alcanza desde «Revisión manual»; los únicos saltos opcionales son 0→2, 3→5 y 5→7) y recorrido guiado completo (≈ 12.4 s).

`npm run test:airport:browser` (opcional, necesita Playwright y WebGL): golpe de maleta, caída y reaparición, cinta, victoria con telemetría y paso al nivel 7.

## Ajustes rápidos (`src/terminal-physics.js`)

`CONVEYORS` (campo `conv` en `platforms`), `CURTAINS` (`amp`, `freq`, `h`), `SUITCASES` (`speed`, `offset`, tamaño), `K_SUITCASE`, `K_CURTAIN`, `PUSHERS`, `ANT_SPAWNS`, `SPEED`, `FLOOR_KILL`. La apariencia está en `src/terminal-scene.js`. Después: `npm run build`.

## Límites conocidos

- Las **palomas** del GDD no están modeladas: se usan los escarabajos del motor («Escarabajos de Carga» es la alternativa del propio GDD).
- La velocidad de la taza para el daño es su desplazamiento real por fotograma (incluye banda y empujón), no una velocidad física independiente.
- Falta una revisión manual de dificultad y de cámara en móvil físico; no se midieron FPS.
