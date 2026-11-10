# ☕ Coffee Please · Nivel 01: La cocina de casa

Esta es una versión **editable y ejecutable** del prototipo web de Coffee Please. La distribución se ha rediseñado tomando como referencia una cocina doméstica cálida: una mesa de madera en el centro, sillas, puerta al fondo, alacenas, microondas, fregadero, estufa, ventana a la derecha y una cafetera sobre la encimera del fondo. El apartado artístico usa geometrías y materiales procedurales de Three.js; **no replica los modelos 3D, texturas o personajes de la imagen original**.

## Jugar

1. Descomprime el ZIP.
2. Abre una terminal en la carpeta del proyecto.
3. Ejecuta `npm start` (Node.js 18 o superior, sin `npm install`).
4. Abre `http://localhost:3000/juego/`.
5. Las estadísticas se consultan en `http://localhost:3000/dashboard/`.

Controles: `W A S D` / flechas para moverse; `Espacio` para saltar; arrastrar la escena o `Q` y `E` para mover la cámara; `C` para centrarla; rueda del ratón para zoom; `P` para pausar; `R` para reiniciar. Hay controles táctiles básicos.

## Qué se puede hacer en el nivel

- **Comienzas encima de la mesa central.** La silla de la derecha y un banco pequeño permiten bajar sin romperse.
- **Si caes directamente desde la mesa al suelo, la taza se rompe.** Se calcula la diferencia entre la altura de salida y la altura de aterrizaje: hasta 1.6 unidades es seguro; entre 1.6 y 2.75 hay daño; por encima de 2.75 hay ruptura y reaparición. Los saltos normales no se penalizan por alcanzar más altura en el aire.
- **El suelo es jugable** y cuenta con espacios libres, un charco, migas y un obstáculo giratorio. No está compuesto por plataformas flotantes.
- **Llegas a la cafetera escalando por cajas, un taburete y un cajón entreabierto** junto al mueble del fondo. Hay un ascenso alternativo junto al lado izquierdo de la cocina.
- Hay puntos de control, salud, puntuación, rodillo móvil y algunos enemigos, sin llenar el escenario de objetos adicionales.
- La opción **Ver recorrido** muestra un trayecto guiado mesa → silla → banco → suelo → cajas → taburete → cajón → cafetera.

## Archivos editables

```text
CoffeePlease_CocinaReferencia/
├── src/
│   ├── physics.js            ← superficies, dimensiones, gravedad y caídas
│   └── game.js               ← escenario 3D, mobiliario, enemigos y juego
├── public/
│   ├── juego/index.html      ← página autónoma: Three.js y código incluidos
│   └── dashboard/index.html  ← histórico y mapa de calor actualizado
├── server.js                 ← servidor HTTP y API de partidas
├── seed.js                   ← datos ficticios para pruebas (opcional)
├── rebuild.py                ← recompila el HTML autónomo
├── DISENO_NIVEL_01.md        ← mapa, rutas, reglas y criterios de prueba
└── package.json
```

Cuando modifiques `src/game.js` o `src/physics.js`, ejecuta **`python rebuild.py`** dentro de esta carpeta para actualizar el código incluido en `public/juego/index.html`. Para editar el escenario, debes cambiar tanto la malla visible como la colisión correspondiente en `src/physics.js`.

## Telemetría

El ID de este nivel es `cocina-01-referencia`. Cada partida terminada se registra en la API y puede examinarse desde el dashboard, incluido su recorrido. Para datos **ficticios** de prueba, con el servidor iniciado ejecuta `npm run seed 30`. Los datos se guardan localmente en `data/`, carpeta que el programa crea automáticamente.

## Validación y limitaciones

Se verificó la sintaxis de los scripts, el arranque del servidor, la lógica de caída alta y una simulación de física con el camino de ascenso completo, además del recorrido automático hasta la cafetera. **No se validaron visualmente todos los ángulos de cámara ni el rendimiento en un dispositivo real**: hace falta jugarlo en navegador para ajustar saltos, sensibilidad y colisiones decorativas. Los muebles están construidos con formas básicas y detalles estilizados, no con modelos PBR de calidad comercial.