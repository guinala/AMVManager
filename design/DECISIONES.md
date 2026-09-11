# AMV Manager: diseño de interfaces, v0.1

Propuesta de diseño basada en las decisiones del cliente. El HTML es un prototipo de interacción para revisar el producto; la aplicación final será nativa, con Kotlin y Jetpack Compose.

## Dirección visual

El granate aparece en acciones principales y selecciones, sobre superficies oscuras neutras. El motivo visual propio es el intervalo de edición: dos marcas que delimitan un fragmento. Se utiliza en el logotipo y en el selector temporal; no como decoración repetida.

Tokens: fondo #141113, superficie #211B1E, granate #8C2946, acento claro #E9A0B5, texto #F8F2F3, texto secundario #C5B8BD. El granate oscuro se usa como relleno con texto claro; el acento claro en iconos y trazos que necesiten contraste.

Tipografía: Roboto en la futura app Android. En el prototipo local, Segoe UI para texto y Bahnschrift para títulos compactos y tiempos; no requiere descargas. Escala 12/14/16/20/28/34. Texto alineado a la izquierda; tiempos con cifras tabulares.

Espaciado: unidad de 4, márgenes de pantalla de 20, separación entre secciones de 24. Radios: 12 en campos, 16 en tarjetas y 24 en superficies destacadas. Objetivos táctiles de 48 como mínimo. El estado se comunica con texto e icono además del color.

## Revisión previa del concepto

Se descarta un tablero de columnas por su desplazamiento lateral en móvil. La pantalla inicial da prioridad al proyecto en edición y después a las ideas y pendientes. Las tarjetas contienen personaje, obra, canción y estado; no métricas decorativas. Las imágenes del prototipo son portadas abstractas de muestra, no resultados reales de búsqueda de personajes.

Esquema de distribución:

    Proyectos                  Detalle                    Fragmento
    título / ajustes           volver / opciones          volver / título
    búsqueda                   portada / personaje        reproductor visible
    filtros                    obra / estado              posición actual
    proyecto en edición        canción / fragmento        inicio y final
    otras ideas                notas                      duración / escuchar
    nuevo AMV                  cambiar estado             guardar fragmento
    navegación inferior        navegación contextual      navegación contextual

## Navegación

- Destinos principales: Proyectos, Música, Historial.
- Proyectos reúne Idea, Pendiente y En edición; Historial reúne Terminado.
- El detalle se abre desde Proyectos o Historial y vuelve al destino de origen.
- Nuevo AMV abre un formulario. Buscar rellena nombre y obra en ese mismo formulario y presenta un espacio para la imagen encontrada. No hay una pantalla obligatoria de confirmación.
- Guardar idea lleva al detalle. La canción es opcional.
- Añadir o cambiar canción abre búsqueda en contexto del proyecto. Elegir resultado lo asigna y abre el selector de fragmento.
- Música permite buscar y consultar canciones sin tener un AMV abierto. Elegir una canción permite escoger después el proyecto al que se asignará.
- Guardar fragmento vuelve al detalle. Volver sin guardar descarta únicamente los cambios temporales de esa selección.
- Ajustes se abre desde el encabezado y conserva el destino de regreso.
- La barra inferior se oculta en formularios y edición para evitar salidas accidentales.
- El botón Atrás de Android seguirá la pila de navegación. El prototipo reproduce este recorrido con su botón de volver y con el historial del navegador.

## Pantallas y comportamiento

1. Proyectos: búsqueda por personaje, obra o canción; filtros y acción Nuevo AMV. Vacío con invitación a guardar la primera idea.
2. Nuevo AMV / editar personaje: entrada libre personaje + obra; indicador de carga; ficha autocompletada y editable. Entrada manual si no hay coincidencia. La app final muestra imagen real de fuente identificada y permite cambiarla; el prototipo usa un marcador visual.
3. Detalle: personaje, estado editable, canción y fragmento, notas. Guardado explícito de notas. Terminar mueve a Historial; reabrir devuelve a Proyectos.
4. Música: búsqueda, resultados con versión y duración, biblioteca de muestra. Reproducción claramente identificada como simulación en este prototipo.
5. Fragmento: reproductor online visible de muestra, tiempos de inicio y final editables, selección de intervalo y escucha simulada. No se dibuja una forma de onda ficticia ni se ofrece exportación de audio para una fuente que no lo permita.
6. Historial: terminados con acceso al detalle y posibilidad de reabrir.
7. Ajustes: explicación del prototipo y restablecimiento de sus datos de demostración.

## Reglas y estados

- Nombre de personaje obligatorio; obra y canción opcionales.
- Una fuente musical concreta tiene su propia duración y sus propios fragmentos. Cambiar canción reinicia la selección; los tiempos no se trasladan silenciosamente.
- Debe cumplirse 0 <= inicio < final <= duración. La selección debe tener al menos un segundo en este prototipo.
- El intervalo guardado conserva la referencia de la fuente. No crea un archivo de audio.
- La búsqueda de personajes del prototipo tiene ejemplos predefinidos: Geralt, Vi y Levi. Otros nombres llevan a entrada manual, sin simular que se ha consultado Internet.
- La reproducción es un contador visual, sin sonido ni conexión a proveedores.
- Los proyectos de demostración se conservan en localStorage del navegador cuando está disponible. Si no, se mantiene la sesión en memoria.
- En producción se diseñarán también errores de red, cuota, fuente no reproducible e imagen no disponible. La creación manual siempre queda disponible.
- No se incorporan recomendaciones creativas, RAG, generación de imágenes ni agentes autónomos.

## Traducción a Android

Una Activity, Compose y Navigation 3; ViewModel por pantalla, Room como persistencia y repositorios para búsqueda. Los controles temporales se implementarán con campos accesibles y un selector de rango, conservando la posibilidad de ajustar sin arrastrar. YouTube, si se selecciona como proveedor, usará su reproductor oficial visible; Media3 se reservará para fuentes de audio compatibles que lo permitan.

## Recorrido de revisión

Crear una idea buscando Geralt → guardar → añadir canción → elegir un resultado → ajustar inicio y final → guardar fragmento → cambiar a En edición → marcar Terminado → comprobar Historial → reabrir. Probar también un personaje no reconocido y guardarlo manualmente.
