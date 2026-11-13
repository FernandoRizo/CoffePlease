# Coffee Please — Nivel 01 · Cocina en L (v1.8)

## Referencia y distribución

Este nivel reemplaza el diseño anterior de la cocina usando el plano cenital facilitado por el usuario (comedor inferior, muebles y electrodomésticos arriba, zona lateral derecha hasta la cafetera). El plano guía la disposición y el recorrido; las medidas están ajustadas al movimiento de una taza a escala para que se pueda saltar.

- **Comedor (sur/parte baja):** mesa central en x=-3.60, z=4.60, altura 3.20. Desciende por una silla **a la izquierda** y luego por el banco bajo.
- **Suelo:** estancia amplia con cucarachas, hormigas, charco, migas y peligros existentes.
- **Subida a la izquierda:** cinco repisas en x≈-11, alturas 0.80 → 1.60 → 2.40 → 3.16 → 3.35. Permiten llegar al armario de limpieza, no a la cafetera directamente.
- **Encimera superior (norte):** limpieza y residuos, fregadero inundado, microondas, preparación, estufa y esquina.
- **Barra derecha (este):** estación de vasos, molino y cafetera/meta en x=10.5, z=4.4.
- **Alacenas:** las latas siguen cayendo hacia las zonas transitables de encimera, con advertencia visual.
  
## Secuencia de juego

```text
MESA INICIAL → SILLA IZQUIERDA → BANCO → SUELO
   → REPISAS DE PARED → LIMPIEZA/RESIDUOS [checkpoint]
   → PLATO 1 → TAZA BOCA ABAJO → CUCHARA SOBRE PLATOS → PLATO 2
   → MICROONDAS [checkpoint] → PREPARACIÓN → ESTUFA (quemador)
   → ESQUINA DERECHA → VASOS → MOLINO → CAFETERA [meta]
```

## Tarja completamente llena de agua

La plataforma índice 3 (`kind: 'water'`) **no soporta a la taza**. Su hueco físico ocupa un rectángulo de 4.4 × 2.9 y la superficie del agua está a la altura `3.16`, por debajo del borde de la encimera (`3.35`).

Cuatro trastes/utensilios visibles coinciden con las plataformas de física `[22,23,24,25]`. Sus superficies transitables están a alturas 3.56, 3.65, 3.59 y 3.56. La ruta debe cruzar el agua saltando por estos objetos, porque la anchura de la tarja supera el salto directo desde un extremo al otro.

Cuando el jugador cae en el rectángulo y desciende hasta la superficie de agua, `step()` devuelve `{dead:true,reason:'agua',water:true}`. El motor muestra a la taza **hundiéndose en lugar de estallar** durante el temporizador de muerte y después la reaparece en el último checkpoint. Las caídas en la tarja se registran en la telemetría normal del nivel.

## Checkpoints y conservación de peligros

- Rango 1: suelo.
- Rango 2: tercera repisa de ascenso.
- Rango 3: limpieza, antes de la tarja.
- Rango 4: microondas, después de cruzar el fregadero.
- Rango 5: cafetera.

Se conservan el rodillo móvil sobre la mesa, cucarachas en suelo y estufa, hormigas, zonas de charco y migas, quemador de la estufa, caída mortal por altura y cinco estaciones de latas que caen de las alacenas. Estas últimas están reposicionadas para la nueva barra superior.

## Compatibilidad

No se modifican el contenido, la física, las rutas ni la telemetría de los niveles 2 (oficina), 3 (construcción) y 4 (sala). Los scripts de construcción sí reciben los nuevos marcadores de cámara y mensaje del motor para preservar sus cámaras anteriores durante la compilación.

Usar `npm run build` para regenerar los cuatro HTML autónomos y `npm test` para ejecutar las pruebas. La revisión visual de cámara, modelos y dificultad con ratón/táctil sigue siendo necesaria antes de fusionar a `main`.
