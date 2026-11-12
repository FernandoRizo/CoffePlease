# Coffee Please — Nivel 1: De la mesa al refrigerador y la cafetera (v1.6)

## Objetivo del rediseño

La taza inicia sobre la mesa central de una cocina doméstica. Debe descender sin romperse por la silla y el banco, recorrer el suelo abierto y escalar repisas cerca del refrigerador. Al llegar a su techo, continúa por repisas de pared hasta el extremo izquierdo de la encimera; desde allí recorre la cocina completa hasta llegar al plato de la cafetera. Se retira totalmente el acceso directo de cajas/taburete/cajón junto a la meta.

## Recorrido jugable (de izquierda a derecha sobre el mobiliario)

```text
MESA → SILLA → BANCO → SUELO
                         └─ Cajón de fruta (0.85)
                            → Carrito auxiliar (1.65)
                            → Repisas laterales del refri (2.50 → 3.35 → 4.20 → 5.05)
                            → TECHO DEL REFRIGERADOR (5.90) [checkpoint]
                            → Repisas de pared (5.45 → 4.80 → 4.10)
                            → PANERA (3.35) [checkpoint]
                            → Mueble lateral → Fregadero → Microondas
                            → Preparación → Estufa → Tabla de cortar
                            → CAFETERA (3.35)
```

Las alturas entre paréntesis son unidades de juego. Las repisas tienen soportes visibles en los laterales del frigorífico o en la pared, y las de la cocina siguen el volumen de la encimera. Se mantienen recorridos explorables por el suelo, pero no hay un atajo hacia la cafetera.

## Riesgo y checkpoints

- Diferencia de caída de hasta 1.6 unidades: segura.
- 1.6–2.75: daño proporcional.
- Más de 2.75: ruptura inmediata y reaparición.
- Checkpoints: suelo (rango 1), repisa baja (rango 2), techo del refrigerador (rango 3) y panera/entrada a la encimera (rango 4). La cafetera conserva el rango 5.
- La estufa mantiene su quemador peligroso; las cucarachas y obstáculos originales siguen activos.

## Latas que caen de las alacenas

Hay cinco estaciones sobre la encimera, aproximadamente en X=-6.15, -1.75, 1.60, 5.20 y 8.50; Z=-7.2. Se activan cuando la taza está cerca y sobre la parte alta. La señal luminosa parpadea **1.05 segundos**; después una lata visible cae desde la altura 6.95 hacia la encimera. Cada lata sigue su posición animada, tiene velocidad vertical y solo causa ruptura cuando su borde inferior cruza la parte superior de la taza mientras desciende y ambas coinciden horizontalmente.

Una lata que caiga a un lado no provoca daño. Al aterrizar sin golpear, desaparece, espera a que termine su enfriamiento y puede volver a activarse. El recorrido guiado está exento de este peligro para mostrar el camino, no para evaluar dificultad.

El impacto llama a la derrota por `lata`, registra una ruptura mediante la telemetría del nivel `cocina-01-referencia` y respawnea en el último checkpoint.

## Validaciones

Se simularon todos los escalones con `step()` y `autoInput()`, incluyendo el paso sobre el refrigerador, las repisas de pared y la estufa evitando la zona caliente. Las pruebas automatizadas comprueban la eliminación del atajo, el recorrido completo y la detección de latas descendentes versus latas fuera de trayectoria. La revisión de ángulos de cámara, señalización y ritmo de las latas requiere probarlo en navegador con WebGL.

Se conservan los niveles de oficina y obra, junto al dashboard de trayectorias.
