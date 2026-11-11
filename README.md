# Coffee Please v1.3 — La oficina

Dos niveles jugables, código editable y dashboard local. La oficina sigue el plano aportado: fregadero a la izquierda, cuatro cubículos en dos filas desplazadas, dos libreros largos y mesa con cafetera a la derecha.

## Jugar

1. Descomprime el ZIP completo.
2. Instala Node.js 18 o superior si todavía no lo tienes.
3. Abre una terminal en esta carpeta y ejecuta `npm start` o `node server.js`.
4. Visita **http://localhost:3000/juego/** para comenzar en la cocina.

- Oficina directa: **http://localhost:3000/oficina/**.
- Dashboard: **http://localhost:3000/dashboard/**.
- No es necesario ejecutar `npm install` para jugar. Three.js está incluido.
- Los HTML también pueden abrirse directamente para jugar sin servidor; el dashboard y el guardado de partidas necesitan el servidor.

En Windows puedes abrir **INICIAR_WINDOWS.cmd**. Mantén abierta la ventana mientras juegas.

## Controles y recorrido

WASD / flechas: movimiento respecto a la cámara. Espacio: salto. Arrastre o Q/E: cámara. C: centrar. Rueda: distancia. P: pausa. R: reinicio. Hay controles táctiles.

Oficina: **fregadero → silla → caja → pasillo → repisas del segundo librero → bandeja → mesa con cafetera**. Camina por el suelo, explora los cubículos o escala cualquiera de los libreros. Las sillas tienen asientos y apoyos elevados utilizables. Los cables frenan; saltarlos evita ese efecto. El ventilador gira y empuja solamente dentro de su alcance y dirección, con cobertura detrás de los muebles. Su sector y partículas muestran el barrido.

Las cucarachas avisan antes de embestir. Una aspiradora patrulla el fondo y dos brazos giratorios golpean sobre un escritorio y un librero. Los golpes pueden provocar caídas. Caídas hasta 1.6 unidades: seguras; de 1.6 a 2.75: daño; mayores: ruptura y reaparición. Hay puntos de control en el suelo y el ascenso final.

**Ver recorrido** es una ayuda sin golpes ni viento aplicado al jugador y no registra puntuaciones. La partida normal sí activa todos los peligros. Las pruebas también recorren la oficina con el viento activo.

## Nivel 1 y transición

Se conserva la cocina, su física, controles, enemigos y puntuación. Se eliminan las tres plataformas del atajo izquierdo descrito en la v1.2. Tras llenar la taza aparece **Continuar a la oficina**. La oficina inicia una nueva partida con el mismo nombre de jugador y sus propias métricas.

## Telemetría

Se registran resultado, salud, suciedad, dilución, caídas, puntuación, duración y trayectoria. Cada nivel usa su identificador: `cocina-01-referencia` y `oficina-02-plano`. El dashboard permite filtrar por nivel y dibuja el mapa correspondiente. La opción de todos los niveles combina estadísticas, pero no superpone mapas incompatibles.

Los datos se guardan en `data/`, creada al iniciar. El ZIP no incluye partidas personales ni de pruebas. Las pruebas de API y navegador usan carpetas temporales independientes.

## Editar y probar

- `src/game.js`: motor, cocina, HUD, enemigos y telemetría compartidos.
- `src/physics.js`: física y superficies de la cocina.
- `src/office-physics.js`: superficies, colisiones, viento y cables de oficina.
- `src/office-scene.js`: mobiliario y aspecto de la oficina.
- `build.js`: combina el motor y la escena, empaqueta ambos HTML autónomos y genera `public/levels.json` para el dashboard.
- `src/office-game.generated.js`: archivo generado; no editar directamente.

Tras editar: `npm run build` o `node build.js`. El antiguo `rebuild.py` ahora llama al mismo empaquetador.

Pruebas sin dependencias: `npm test`. Pruebas opcionales de navegador: instala Playwright (`npm install --no-save playwright`, `npx playwright install chromium`) y ejecuta `npm run test:browser`. También puedes proporcionar `PLAYWRIGHT_MODULE` y `COFFEE_BROWSER` para usar instalaciones existentes.

Consulta **PRUEBAS.md** para el alcance de la validación y **DISENO_NIVEL_02.md** para detalles del nivel.

## Procedencia y alcance

Base: repositorio FernandoRizo/CoffePlease, rama main, commit `dba3d79a43f833971af2426d0b43d1b9bd352522` (v1.1). El chat previo permitió recuperar el plano image(5).png, pero no el ZIP CoffeePlease_Niveles_1_y_2_v1.2.zip. Por ello esta entrega reconstruye las funciones descritas de la v1.2 sobre la base disponible; no es una modificación de aquel ZIP.

Arte 3D procedural estilizado. Los volúmenes principales de muebles y paneles tienen colisión simplificada; teclados, libros, grifo y otros detalles son decorativos. Se probó con Microsoft Edge en escritorio y vista móvil emulada. No se ha medido el rendimiento en teléfonos físicos. No se ha publicado esta versión en GitHub.
