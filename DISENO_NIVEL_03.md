# Coffee Please — Nivel 03: Obra en construcción

## Objetivo
Desde un andamio en el extremo izquierdo, desciende con cuidado, atraviesa un terreno irregular, esquiva hoyos, charcos de aceite, la bola de demolición y enemigos, y escala barriles, sacos y tablones hasta una mesita con cafetera al extremo derecho. Es el nivel más desafiante de los tres, pero mantiene una ruta segura reconocible.

## Mapa cenital aproximado (X de izquierda a derecha)

```text
  Z +11  ┌────────────────────────────────────────────────────────┐
         │ inicio sobre andamio    ruta larga segura               │
         │  ↓ palé ↓ palé      CP1            CP2                  │
         │     conos       robot           robot      barril →sacos│
         │ z+2       [ACEITE]  [HOYO]        [ACEITE]    tablón  ☕ │
         │        [HOYO]     ⟷ bola de demolición      [HOYO]     │
  Z -11  │             ruta elevada sobre sacos/tuberías           │
         └────────────────────────────────────────────────────────┘
             X −24               X 0                         X +24
```

## Superficies y progresión

1. **Descenso (X −21 a −14):** andamio a Y=3, tablón a Y=2.04, palé a Y=1.04. Caer directamente al suelo desde el andamio provoca ruptura (>2.75 unidades).
2. **Terreno abierto (X −14 a +14):** altura ondulada calculada por `groundHeight(x,z)`. Se puede explorar libremente y rodear los fosos. Tres hoyos circulares tienen colisión vacía: caer mata sin importar la salud.
3. **Aceite:** dos manchas oscuras ralentizan el movimiento al 38 % e impiden iniciar un salto mientras se pisa el aceite. No elimina la capacidad de saltar para siempre; se recupera al salir.
4. **Bola de demolición:** oscila sobre el centro de obra. Su posición 3D, animación de cadena y colisión se calculan con `wreckingBallAt(t)`. Golpea por 36 HP y empuja, pudiendo lanzar al jugador a un hoyo.
5. **Enemigos:** dos carritos mecánicos de obra patrullan zonas del piso y golpean por 18 HP. También hay cucarachas agresivas y una herramienta giratoria en un andamio opcional.
6. **Ascenso (X +15 a +22):** barril a Y=0.87, sacos a Y=1.59, tablón a Y=2.32 y mesita a Y=3.13. Las caídas grandes siguen siendo peligrosas.

## Checkpoints

- Tramo seguro en el suelo tras el descenso.
- Zona X≥−2 tras atravesar la primera sección.
- Zona X≥12.5 antes del ascenso o saco de cemento (rango 3).
- Tablón superior del ascenso (rango 4).
- Mesita final (rango 5).

Los puntos de control conservan el progreso de posición, no devuelven salud automáticamente. La partida registra rupturas, golpes, suciedad y tiempo con `level_id=obra-03-construccion`.

## Aspectos de equilibrio

- Conos: obstáculos bajos que se pueden esquivar o saltar.
- La ruta más segura rodea el centro por el borde superior (Z≈7), pero es más larga y cuenta con enemigos.
- Las rutas centrales y por los andamios son más cortas, pero requieren calcular saltos, evitar aceite y sincronizar la bola.
- Ajustes accesibles en `src/construction-physics.js`: `PITS`, `OIL_PATCHES`, `enemyAt`, `wreckingBallAt`, `SPEED`, `JUMP`, `platforms`.
- Ajustes visuales en `src/construction-scene.js`. Tras editar ejecutar `npm run build` en la versión actualizada del repositorio.

## Comprobaciones

`node --test tests/construction.test.mjs` verifica geometría del suelo y hoyos, alturas de caída, aceite, bola de demolición, contacto con enemigos y ruta hasta la meta. Los tests son deterministas y no sustituyen una prueba manual de cámara y dificultad con WebGL.