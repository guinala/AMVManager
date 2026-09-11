# AMV Manager: importación a Figma

## Estado real de esta entrega

La versión v0.2.1 llegó a crear las pantallas, pero el usuario comunicó un error al conectar la navegación. La corrección v0.2.2 aún debe ejecutarse dentro de Figma. La conexión disponible solo expone herramientas de lectura. No están disponibles `use_figma` ni `generate_figma_design`.

Se ha preparado un importador nativo de Figma con 28 pantallas y estados, 25 definiciones de componentes, 24 colores y 10 estilos tipográficos. No pega capturas: crea textos, vectores, marcos con Auto Layout, instancias y enlaces de prototipo.

## Corrección v0.2.2

La navegación se resuelve sobre los botones de cada pantalla, incluidas las capas de sus instancias. Los componentes de la biblioteca ya no tienen enlaces a pantallas. Se comprueba que cada destino sea un marco de primer nivel de la misma página y se omiten los enlaces a la propia pantalla (pestaña activa, filtro seleccionado y controles de demostración sin cambio de estado). El informe enumera esos enlaces omitidos.

La vista se centra en Proyectos antes de conectar la navegación. Si un enlace falla, el informe identifica la pantalla, el botón y el destino; las pantallas creadas siguen disponibles para revisar.

### Corrección anterior de las portadas

El fallo `in set_x … relative-transform` ocurría al recolocar textos dentro de una instancia de Cover durante la creación de ProjectRow. Ahora Cover y CoverCompact definen sus posiciones y restricciones en los componentes originales. Las instancias solo cambian contenido y tamaño exterior.

Cierra y vuelve a ejecutar el plugin. Su ventana debe indicar **Importador v0.2.2**. Si utilizaste una copia del ZIP, extrae el ZIP actualizado y vuelve a importar su manifest.

## Importarlo en tu archivo

1. Abre **Figma Desktop** y el archivo [AMV Manager](https://www.figma.com/design/TNlwUUcaNqk7BdJCu2EDtJ/AMV-Manager).
2. En el menú de Figma, abre **Plugins → Development → Import plugin from manifest…**.
3. Selecciona el archivo `manifest.json` de esta carpeta.
4. Ejecuta **Plugins → Development → AMV Manager · Importar interfaces**.
5. Comprueba el nombre del archivo abierto que aparece en la ventana del plugin y pulsa **Crear interfaces en el archivo abierto**.

El plugin añade una página llamada **AMV · Interfaces refinadas v0.2.2** y conserva los diseños que ya haya en el archivo. Si encuentra las 28 pantallas y los puntos de inicio del prototipo, abrirá Proyectos sin sobrescribir tus modificaciones. Si encuentra una página parcial de esta versión, creará otra con el sufijo Reintento. Las páginas anteriores v0.2 y v0.2.1 también se conservan.

No necesita API keys ni permisos de red. Usa únicamente la API local de plugins en el archivo donde lo ejecutes. La importación local requiere poder editar el archivo; el error de Dev Mode de la conexión MCP no demuestra que tengas que comprar un plan para usar este importador.

## Qué contiene

- Proyectos: todos, ideas, pendientes, en edición y vacío.
- Nuevo AMV: inicio, búsqueda en curso, autocompletado y entrada manual.
- Personaje ambiguo y selección de imagen.
- Detalle: idea, en edición y terminado.
- Edición de personaje y notas.
- Música: biblioteca, búsqueda con resultado y sin resultados.
- Asignación de una canción a un proyecto.
- Fragmento: selección, reproducción de ejemplo, intervalo inválido y fuente no disponible.
- Historial y estado vacío.
- Ajustes, cambio de estado y confirmación de eliminación.

Las pantallas están organizadas en una cuadrícula de seis columnas. A su izquierda se sitúan la guía, los fundamentos y los componentes. Los botones enlazan estados de ejemplo en el modo Presentar de Figma; no ejecutan consultas ni reproducción real.

## Refinamientos

- Marcos Android de 412 × 892, con contenido desplazable y acciones inferiores estables.
- Roboto para alinear el diseño con Android. El prototipo web inicial utilizaba Segoe UI y Bahnschrift.
- Paleta granate, contraste legible y objetivos táctiles de al menos 48 px para las acciones principales.
- Formulario de personaje autocompletado en la misma pantalla.
- Botones Probar y Guardar fragmento accesibles en el pie del selector.
- Componentes e instancias para botones, campos, filtros, estados, navegación, carátulas y filas de proyectos.
- Variables de color y medidas y estilos de texto compartidos.

Las imágenes conservan el carácter provisional del prototipo original. En el componente Cover puedes sustituirlas por una imagen real y ocultar las capas Initials y Decoración. No hay personajes generados ni imágenes web presentadas como resultados verificados.

## Validaciones y límites

Se han comprobado la sintaxis del importador, los identificadores y destinos de navegación, las referencias de componentes y las 28 vistas en un renderizador local, incluidos tamaño y desbordamiento horizontal. Se ha recorrido la creación de una idea en la vista previa.

**La versión corregida no se ha ejecutado dentro de Figma ni se ha validado su renderizado nativo**, porque no hay acceso de escritura desde esta sesión. El propio plugin comprueba las fuentes antes de crear la página, valida marcos y destinos al terminar y muestra capturas exportadas del archivo real. Guarda el informe mediante **Guardar informe de importación** si aparece algún problema o si quieres facilitar la revisión posterior.

Si aparece un error después de crear una página parcial, el plugin no la elimina ni la sobrescribe. Conserva esa página y el informe para corregir el paso que falló. No vuelvas a importar a ciegas esperando que borre los cambios.

La prueba `qa-instance-contract.cjs` ejecuta la creación de componentes y pantallas con una simulación que rechaza cambios de geometría en descendientes de instancias. Incluye una reproducción deliberada del fallo anterior y comprueba los reintentos. `qa-navigation-contract.cjs` comprueba los enlaces de todas las pantallas, incluidas las pestañas, y reproduce el rechazo de fuentes de biblioteca y destinos propios, inexistentes, anidados o de otra página. Estas pruebas no simulan el motor de Auto Layout ni sustituyen la revisión en Figma.

## Archivos

- `manifest.json`, `code.js` y `ui.html`: importador listo para ejecutar.
- `revision.html`: vista previa local del diseño preparado.
- `scene-spec.cjs`: definición de pantallas y componentes.
- `import-runtime.js`: conversión a objetos nativos de Figma.
- `build.cjs`: genera el importador y los datos de la vista previa.
- `qa-local.cjs`: comprobaciones locales; requieren el Playwright ya disponible en este entorno.
- `qa-local-report.json`: resultado de la comprobación local, expresamente distinto de una validación en Figma.

Para reconstruir después de modificar la especificación: `node design/figma/build.cjs` desde la raíz del proyecto.

Fuente del mecanismo de importación: [ejemplos oficiales de plugins de Figma](https://github.com/figma/plugin-samples). El identificador local del manifest sigue el patrón de los ejemplos oficiales; no representa un plugin publicado en Community.
