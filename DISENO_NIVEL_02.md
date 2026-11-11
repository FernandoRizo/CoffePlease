# Nivel 2 — La oficina según plano

Habitación de 40 × 22 unidades. El eje X avanza de izquierda a derecha; Y representa la altura. El fregadero inicia en X −17.3; la cafetera termina en X 17.6. Las cuatro estaciones se distribuyen en dos filas desplazadas como en la referencia. Los libreros ocupan dos franjas largas entre estaciones.

## Alturas y progresión

| Elemento | Altura | Función |
|---|---:|---|
| Fregadero | 3.2 | Inicio seguro; saltar directamente al suelo rompe la taza |
| Silla y caja iniciales | 2.1 / 1.05 | Descenso gradual |
| Suelo | 0 | Pasillo libre, cables y enemigos |
| Asientos y apoyos de sillas | 1.05 / 2.1 | Acceso a los cuatro escritorios |
| Escritorios | 3 | Plataformas opcionales, computadoras y enemigos |
| Repisas exteriores | 1.1 / 2.2 / 3.3 / 4.4 | Escalada con huecos y riesgo de caída |
| Cimas de libreros | 4.8 | Ruta opcional y punto de control alto |
| Bandeja y mesa final | 3.5 | Acceso a la cafetera desde la tercera repisa |

Los cubículos inferiores abren hacia el pasillo. Las repisas se colocan por fuera de los libreros; las colisiones y la representación se generan a partir de las mismas superficies. El suelo es transitable y no obliga a subir todos los muebles. La meta sí exige ascender.

## Peligros

- Ventilador: oscilación de ±0.95 radianes, alcance 8 unidades y semicono 0.26 radianes. Empuja alejándose del ventilador; supera la velocidad de caminar de frente. No afecta al jugador detrás, fuera del cono, demasiado alto o cubierto por muebles. No resta salud directamente.
- Cables: reducen la velocidad a 48 % al pisarlos. Saltar los evita.
- Cucarachas: patrulla, aviso, embestida; daño de 14 HP y empuje. Dos en suelo y una sobre escritorio.
- Brazos giratorios: 22 HP y empuje sobre escritorio y librero. No golpean a través de superficies en otra altura.
- Aspiradora: recorrido oscilante al fondo, golpe y empuje al contacto.
- Charco y migas: mantienen dilución y suciedad.

El recorrido guiado evita los efectos de enemigos y viento para enseñar la ruta. No envía métricas. En partida normal, la salud se recupera al reaparecer siguiendo el comportamiento del motor original; las caídas, suciedad y dilución de la partida se conservan.

## Puntos de control

Inicio, descenso al suelo, cima del primer librero opcional, primera repisa del segundo, cima del segundo y mesa final. El checkpoint alto del segundo librero reaparece en su extremo libre, separado del enemigo giratorio.

## Alcance de arte

Recreación estilizada del plano mediante geometrías de Three.js. Los detalles de escritorio, libros y grifo son decorativos. El volumen principal de un mueble bloquea el paso: no se navega por debajo de sus patas.
