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


## Nivel 3 — Obra en construcción (v1.4)

La taza comienza en un andamio alto, desciende por palés y debe atravesar un terreno irregular con **tres fosos mortales**, **dos charcos de aceite** que reducen la velocidad y bloquean el salto, **conos**, una **bola de demolición oscilante**, **robots de obra** y cucarachas. La meta está sobre una mesita elevada en el extremo opuesto.

- Acceso directo: `http://localhost:3000/obra/`. Al terminar la oficina, el botón de continuar conduce a la obra.
- Fuentes editables: `src/construction-physics.js` y `src/construction-scene.js`.
- Generar páginas sin dependencias adicionales: `npm run build`; el script crea `public/obra/index.html`, conecta la oficina y actualiza `public/levels.json`.
- Ejecutar `npm run test:construction` para probar física, peligros y recorrido. Las pruebas visuales WebGL requieren un navegador compatible.
- Documento de diseño: [DISENO_NIVEL_03.md](DISENO_NIVEL_03.md).


## v1.5 — Cruces de vigas colapsables

El nivel 3 elimina el antiguo corredor seguro mediante dos excavaciones transversales que bloquean el paso por el suelo en toda la anchura. Cada una se supera con cuatro vigas estrechas de madera que empiezan a temblar al pisarlas, se caen a los 1.7–2.05 segundos y reaparecen 5 segundos después. También hay baches, más huecos mortales y peligros recolocados. Se mantienen los niveles 1 y 2, la transición y la telemetría. Revisa `DISENO_NIVEL_03.md`, ejecuta `npm run build` y `npm run test:construction`.

## v1.6 — Cocina: del refrigerador a la cafetera

La subida corta de cajas/taburete/cajón situada a la derecha se sustituyó por una travesía obligatoria por la izquierda: `mesa → silla → banco → suelo → repisas laterales → techo del refrigerador → repisas de pared → panera → encimeras → cafetera`. El suelo sigue abierto; no hay plataformas de ascenso directo bajo la cafetera.

Cinco estaciones bajo las alacenas anuncian la caída de una lata con un círculo luminoso durante 1.05 s. La lata se desplaza desde la alacena y cae físicamente; un impacto descendente sobre la cabeza rompe la taza instantáneamente y provoca reaparición en el checkpoint. Puedes esquivar las zonas señaladas; las latas no se activan en la demostración guiada.

Se conservan la cocina original, los enemigos, el horno/quemador, el suelo, el nivel 2, el nivel 3 y sus métricas. El dashboard refleja las nuevas repisas y puntos de impacto. `npm run build` reconstruye los tres niveles; `npm test` ejecuta pruebas de física y API. Para validar la cámara y la señal visual de las latas, prueba `/juego/` en un navegador con WebGL.

## v1.7 — Sala de estar: libreros anchos, libros trampa y TV de dos niveles

El nivel 4 sustituye los escalones de madera por **pilas de libros con colisión** a ambos lados de la sala. Los dos libreros son ahora muebles de 4.8 unidades de ancho y 2.6 de fondo, con baldas, laterales, trasera y colecciones de libros visibles. Al llegar arriba, cuatro grupos de libros retráctiles (dos por librero) advierten durante 0.9 segundos antes de avanzar hacia el borde: un contacto produce daño y un empujón que puede hacer caer la taza desde gran altura. Los libros se retraen y sus relojes están desfasados.

El mueble final se amplió para albergar una TV grande orientada hacia los sofás, con una **repisa estrecha obligatoria frente a la pantalla**. El jugador pasa frente al televisor y después utiliza tres pilas de libros como escalones hasta la repisa superior, donde permanecen los ventiladores, el pegamento y la cafetera. La ruta guiada atraviesa ambas mitades de la repisa del televisor antes de subir.

Se preservan niveles 1–3, aspiradora, gato, checkpoints, transición obra→sala y telemetría `sala-04-estar`. El mapa del dashboard incluye libreros, pegamento, ventiladores y trampas de libros. `npm run build` genera todos los HTML y `npm test` ejecuta las pruebas del nuevo nivel.

## v1.8 · Cocina en L con tarja inundada

El nivel 1 se rediseñó según el plano cenital del usuario: comedor en el sur, descenso por la silla izquierda, ascenso por repisas de pared, zona de limpieza y **fregadero lleno de agua** con cuatro plataformas de trastes/utensilios. Si la taza falla un salto sobre la tarja, se hunde y reaparece en el checkpoint anterior. Después recorre microondas, estufa, barra lateral, molino y cafetera. Se mantienen los enemigos y obstáculos anteriores. Las latas ahora caen en ubicaciones que corresponden a las nuevas alacenas.

Fuentes: `src/physics.js`, `src/game.js`; documentación en `DISENO_NIVEL_01.md`. El dashboard muestra el agua en azul y los trastes como apoyos. Generar los cuatro niveles con `npm run build`, probar con `npm test` y abrir `http://localhost:3000/juego/`.
