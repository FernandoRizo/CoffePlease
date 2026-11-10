# Coffee Please — Diseño del nivel 01 «La cocina de casa»

## Objetivo

La taza despierta sobre la mesa del comedor. Desde su escala, una cocina cotidiana se vuelve un terreno de aventura. Debe **bajar sin romperse**, atravesar el suelo evitando peligros y **recuperar altura** por cajas, un taburete y un cajón para llegar a la cafetera. Se mantiene la libertad de explorar y los espacios abiertos, pero las rutas de escalada están señaladas mediante objetos familiares.

## Distribución del espacio

Vista cenital aproximada (la pared de la encimera está al fondo):

```text
             PARED DEL FONDO: PUERTA | A L A C E N A S         VENTANA
  ┌───────────────────────────────────────────────────────────────┐
  │  PUERTA       MUEBLES DE COCINA / FREGADERO / ESTUFA   ☕ META │
  │                                           CAJÓN → CAFETERA     │
  │                                            ↑                  │
  │                                         TABURETE              │
  │                                          ↑                    │
  │                                 CAJAS DE ASCENSO             │
  │                                                               │
  │             CHARCO    SUELO ABIERTO      OBSTÁCULO            │
  │                                                               │
  │     SILLA DECORATIVA    ┌──────────────┐ SILLA → BANCO        │
  │                         │  MESA INICIO │     ↓                 │
  │                         └──────────────┘   SUELO              │
  └───────────────────────────────────────────────────────────────┘
                    CÁMARA DESDE EL COMEDOR
```

Dimensiones aproximadas: **27.4 × 21 unidades**, suelo Y = 0. La mesa central está a Y = 3.20, la silla a Y = 2.05, el banco a Y = 1.0. La encimera está a Y = 3.35; el ascenso final desde el suelo tiene plataformas a Y = 0.75, 1.45, 2.20 y 2.70.

## Etapas jugables

| Fase | Lugar | Aprendizaje | Riesgo |
|---|---|---|---|
| Introducción | Mesa central | Orientación, movimiento, cámara y rodillo | Golpe del rodillo |
| Descenso | Silla → banco → suelo | Evaluar altura, bajar por superficies | Ruptura por caída alta |
| Exploración | Suelo central | Desplazarse con rutas abiertas y evitar peligros | Hormigas, migas, charco, obstáculo móvil |
| Ascenso | Cajas → taburete → cajón | Saltos concatenados y lectura de alturas | Caídas y daño |
| Final | Encimera y cafetera | Colocarse debajo de la salida del café | Llegar con menos HP / suciedad |

## Mecánica de caída

La altura se calcula desde la **superficie donde comenzó el descenso**, no desde el punto más alto de un salto.

- Diferencia hasta 1.60 unidades: caída segura.
- Entre 1.60 y 2.75: se aplica daño proporcional.
- Más de 2.75: ruptura instantánea, registro de caída y reaparición en el último checkpoint.

De esta manera el jugador puede bajar por la silla, mientras que tirarse directamente desde la mesa al suelo rompe la taza.

## Diseño visual

Inspiración de la imagen de referencia aportada: mesa de madera protagonista, gabinetes oscuros, azulejos anaranjados, microondas y puerta en el fondo, ventana lateral con persianas, luz cálida y elementos de cocina reconocibles. No se reproducen sus personajes, modelos o texturas. Para una apariencia equivalente en detalle harían falta modelos/texturas y una fase de iluminación artística adicionales.

## Verificaciones técnicas

- La mesa, silla y banco conectan con el suelo por descensos físicos reales.
- El ascenso `caja baja → caja → taburete → cajón → cafetera` se recorrió en simulación de física.
- La demostración automática alcanzó la cafetera en la simulación de la escena física.
- La telemetría usa `level_id = cocina-01-referencia`.
- El dashboard dispone de mapa de calor del nuevo nivel.

**Pendiente de prueba de jugador:** legibilidad de las señales desde distintas cámaras, colisiones con patas, decoraciones y bordes de muebles; FPS en laptops y móviles, y consistencia de checkpoints. Se trata de una iteración jugable, no de una escena con arte final.