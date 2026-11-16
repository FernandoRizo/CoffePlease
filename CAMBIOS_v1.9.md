# v1.9 — Niveles 6 y 7: Terminal internacional

## Qué se agregó

El GDD «Nivel 6: Terminal Internacional» se dividió en dos niveles (tramos 1–2 → nivel 6; tramos 3–4 → nivel 7).

| Archivo | Para qué |
|---|---|
| `src/terminal-physics.js`, `src/terminal-scene.js` | Nivel 6: comidas + filtro de seguridad |
| `src/embarque-physics.js`, `src/embarque-scene.js` | Nivel 7: bebederos + sala de embarque VIP |
| `build-airport.js` | Empaqueta ambos sobre el motor compartido; genera `public/terminal/`, `public/embarque/`, `src/*-game.generated.js` y agrega ambos niveles a `public/levels.json` |
| `tests/terminal.test.mjs`, `tests/embarque.test.mjs` | 16 pruebas deterministas de física, recorrido y ausencia de atajos |
| `tests/airport.browser.test.cjs` | Prueba opcional de navegador con el motor real |
| `package.json` | v1.9.0; `build` ahora termina con `build-airport.js`; scripts `test:terminal`, `test:embarque`, `test:airport:browser` |
| `.github/workflows/build-level06-07.yml` | CI para la rama `feat/nivel06-07-terminal-aeropuerto` |
| `.github/workflows/build-level01.yml` | **Parche necesario**: la validación exigía `Object.keys(layout).length!==4`; con 6 niveles fallaría. Ahora es `<4` |
| `DISENO_NIVEL_06.md`, `DISENO_NIVEL_07.md` | Diseño, parámetros y límites |
| `public/terminal/index.html`, `public/embarque/index.html`, `src/*-game.generated.js` | Compilados de vista previa (ver abajo). `npm run build` los regenera |

No se modificó `src/game.js` ni ningún nivel existente. Identificadores de telemetría: `terminal-06-seguridad` y `embarque-07-vip`. URLs: `/terminal/` y `/embarque/`.

## Cómo integrarlo

1. Copia los archivos respetando las rutas (reemplaza `package.json` y `build-level01.yml`).
2. `npm run build` y `npm test`. El orden del build importa: `build.js` reescribe `levels.json` desde cero, y `build-airport.js` va al final.
3. `npm start` → `http://localhost:3000/terminal/` (el nivel 7 se alcanza al ganar el 6 o en `/embarque/`).

## Pendiente de tu lado

- **Nivel 5**: no estaba en los archivos (el GDD habla de «niveles 1–5» y el repositorio tiene cuatro). La sala de estar (nivel 4) sigue terminando en «Jugar de nuevo» y **no** apunta al nivel 6. Cuando exista el 5, haz que su botón de victoria vaya a `../terminal/`; para el nivel 4 → 6 temporal, repite en `build-living.js` el patrón que ya usas para obra → sala.
- **Dashboard**: no tengo `public/dashboard/index.html`. `levels.json` ya trae para ambos niveles `platforms` (el dashboard ya sabe dibujarlas) y datos extra que podrás pintar: nivel 6 `conveyors`, `curtains`, `suitcases`, `pushers`, `ants`; nivel 7 `drips`, `jets`, `suitcases`, `pushers`, `ants`. Si el selector de niveles del dashboard es estático, añade las dos opciones. Puedo adaptarlo si me envías ese archivo.
- Revisión manual de dificultad y cámara en móvil físico (no se midieron FPS).

## Fragmento para añadir al README

```markdown
## v1.9 — Niveles 6 y 7: Terminal internacional

Dos niveles nuevos a partir del GDD del aeropuerto. **Aquí el suelo pulido es la derrota**: no hay camino a pie, cualquier caída termina la partida.

- **Nivel 6** (`/terminal/`, `terminal-06-seguridad`): plaza de comidas con hormigas y escarabajos empujadores, y filtro de seguridad con dos cintas transportadoras (una a favor, otra en contra), escáner de rayos X con cortinas de plomo pendulares y maletas que golpean según su velocidad relativa.
- **Nivel 7** (`/embarque/`, `embarque-07-vip`): bebederos averiados y ductos de A/C que gotean (+12 % de dilución por gota), chorros de aire que eliminan las hormigas, puentes de maletas apiladas, empujadores en alerta y un carril con maletas rodantes hasta el mostrador VIP.
- Fuentes: `src/terminal-*.js` y `src/embarque-*.js`; `npm run build` los empaqueta (`build-airport.js`). Pruebas: `npm run test:terminal`, `npm run test:embarque` y, con Playwright, `npm run test:airport:browser`.
- Documentos: [DISENO_NIVEL_06.md](DISENO_NIVEL_06.md) y [DISENO_NIVEL_07.md](DISENO_NIVEL_07.md).
```

## Qué se verificó y qué no

Verificado: 16 pruebas de física pasan (recorridos guiados de ≈ 12 y ≈ 14 s, sin atajos entre plataformas); ambos niveles cargan en Chromium con WebGL sin errores de JavaScript; con el motor real se comprobó el golpe de maleta y de cortina, la muerte por suelo con reaparición, el arrastre de la cinta, la victoria con envío de telemetría y paso del 6 al 7, las goteras que diluyen, el chorro que limpia hormigas y el recorrido guiado completo. Se revisaron capturas de ambos niveles.

No verificado: tu `src/game.js` real (v1.8) no estaba en el sistema de archivos, solo en el texto. Para probar reconstruí el motor a partir del HTML subido (`index.html`, que es la cocina v1.6) y parché las cadenas de cámara y mensajes a las de la v1.8 que vi en tu código. `build-airport.js` usa marcadores copiados del `src/game.js` v1.8 que viene en tu texto (la mayoría son los mismos que ya usan `build-construction.js` y `build-living.js`) y falla con un mensaje claro (`marcador ausente en el motor`) si alguno no coincide en tu repositorio; si ocurre, mándame ese mensaje y lo ajusto. Por eso los HTML de `public/` son **vista previa**: déjalos o bórralos, tu `npm run build` los regenera contra tu motor real. Tampoco probé en teléfonos ni medí FPS.

## Adaptaciones al GDD (sin ocultar nada)

- Palomas → escarabajos del motor (alternativa del propio GDD). Los empujadores no restan salud, solo empujan.
- Las curvas Catmull-Rom están implementadas en el módulo de física (puro JS) y no con `THREE.CatmullRomCurve3`, para que colisión y escena compartan exactamente la misma función. Las maletas usan una trayectoria por longitud de arco.
- Los 3 checkpoints del GDD entre 4 tramos: la frontera tramo 2→3 es la frontera entre niveles; además hay checkpoints intermedios (rangos 2–4 en cada nivel).
- Los chorros de aire solo limpian; no empujan. Las gotas no usan refracción (esferas translúcidas del motor).
- Cumplido: IA de empujadores (patrulla, alerta, embestida), hormigas con sacudida, goteo de 1.0–2.5 s con +12 %, peso por dilución, bandas con arrastre y desplazamiento UV, ΔHP = v × k, i-frames de 0.8 s, `InstancedMesh` para filas de asientos y culling de emisores de goteo por distancia.
