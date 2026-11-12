# Coffee Please — Nivel 04 · Sala de estar, v1.7

## Concepto

En una sala doméstica, la taza comienza en una consola, baja por un banquito y atraviesa una zona con dos sofás enfrentados y una mesita en el centro. El suelo conserva el peligro mortal de la aspiradora. Un gato puede golpear la taza en el suelo y provocar una ruptura al empujarla desde los sofás o la mesita.

## Rediseño de los libreros

- Dos libreros anchos (4.8 × 2.6 unidades en X × Z) con varias baldas, panel posterior, laterales y libros de colores.
- Ambos ascensos se construyen con **pilas de libros utilizables**, en lugar de tablas o cajas flotantes. La altura aumenta progresivamente: 0.82 → 1.60 → 2.38 → 3.14 → 3.90.
- Cuatro grupos de libros se proyectan hacia el interior de la sala desde los bordes frontales de las bibliotecas (dos por lado). Cada uno tiene un ciclo de 7.2 s con desfase propio.
- Un anillo luminoso ofrece 0.90 s de aviso; el grupo avanza durante 0.43 s, permanece extendido 0.35 s y se retrae en 0.48 s.
- Su colisión está vinculada a la posición animada real mediante `bookTrapAt` y `bookHitAt`. El golpe resta 14 HP (si no hay invulnerabilidad) e impone una velocidad de empuje perpendicular a la estantería. Caer desde el librero al suelo supera la altura letal y rompe la taza; también es posible esquivar el disparo o regresar a la biblioteca.
- El recorrido guiado desactiva el daño de enemigos y trampas para mostrar una ruta completable, sin quitar los obstáculos a los jugadores.

## Mueble de dos niveles y televisor

El mueble ocupa un volumen amplio, con una carcasa inferior en madera que alberga una pantalla de 4.9 unidades de ancho orientada hacia los sofás. La **repisa frontal de TV** es transitable y estrecha: 1.95 unidades de ancho por 7.15 de largo, y cuenta como checkpoint.

El trayecto desde los libreros llega por los libros laterales, recorre esta repisa **del extremo sur al extremo norte** ante la televisión, y utiliza tres pilas de libros para ganar altura (3.35 → 4.17 → 4.92) hasta el **segundo estante** (5.55). Ese estante ahora mide 5.75 × 5.25; contiene las dos zonas de pegamento que anulan el salto, dos ventiladores que empujan y la cafetera/meta.

Ruta guiada: consola → banquito → suelo → libros sur → librero sur → libros de unión → repisa frontal de TV sur → repisa frontal norte → pila lateral del TV → libro alto 1 → libro alto 2 → segundo estante → café.

## Mantenimiento y telemetría

Se conserva la API, el identificador `sala-04-estar`, los niveles anteriores y el dashboard. El mapa cenital destaca libros, trampas, ventiladores y pegamento. La construcción continúa con `npm run build` y las pruebas de física con `npm test`. Antes de fusionar, verificar manualmente cámara, lectura de avisos y dificultad real desde escritorio y móvil.
