# Validación de Coffee Please v1.3

Realizada el 10 de noviembre de 2026 con Node.js 24 y Microsoft Edge, en Windows.

## Pruebas automáticas aprobadas

- Cocina: caída alta, daño por caída media, descenso seguro, ascenso completo y recorrido guiado hasta la cafetera.
- Oficina: recorrido de inicio a meta; ascenso a los cuatro escritorios y ambos libreros; caídas altas, colisiones y cables.
- Ventilador: dirección, alcance, altura, ventana segura del giro y empuje contra la marcha. Recorrido completo con viento activo en cinco fases iniciales diferentes.
- API: ambas páginas jugables, dashboard, mapas, guardado de partidas, deduplicación de sesión, trayectorias y filtros independientes por nivel.
- Navegador: controles de teclado, pausa sin movimiento, daño de brazos y cucarachas, ausencia de golpes a través de un escritorio, caída con reaparición en checkpoint, demostración completa de ambos niveles, transición cocina → oficina, victoria y envío de telemetría.
- Dashboard: consulta de partida, trayectoria y separación de mapas cuando se seleccionan todos los niveles.
- Interfaz móvil emulada: inicio, HUD, controles táctiles visibles y ausencia de errores JavaScript.

## Revisión visual

Se inspeccionaron capturas reales de la vista general de oficina, inicio del juego y pantalla móvil. La vista general entregada proviene del juego y no es arte conceptual. La ayuda de inicio se ocultó en esa captura para mostrar el fregadero.

## Límites

La navegación completa se validó con la física y la demostración automática. Se comprobó movimiento manual por teclado, pero no se hizo una partida humana completa de cada ruta con todos los enemigos. No se midieron FPS ni se probó en un teléfono físico. La disposición respeta el plano con adaptación de proporciones para saltos y pasillos.

El ZIP v1.2 del chat previo no se pudo recuperar. La base disponible fue v1.1 de GitHub, conservando su cocina y reconstruyendo las funciones descritas de v1.2. Los cambios no se han subido ni fusionado en GitHub.
