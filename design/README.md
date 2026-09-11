# Prototipo de AMV Manager

Abre `prototipo.html` en un navegador para explorar el diseño. No requiere instalar dependencias ni conectarse a servicios externos. `pantallas.html` reúne seis vistas estáticas para compararlas.

Si prefieres servirlo localmente, desde la raíz del proyecto:

```powershell
python -m http.server 8765 --bind 127.0.0.1 --directory design
```

Abre después http://127.0.0.1:8765/prototipo.html.

## Qué se puede probar

- Navegación entre Proyectos, Música, Historial, creación, detalle, fragmento y ajustes.
- Buscar los ejemplos Geralt, Vi o Levi y ver el formulario autocompletado.
- Completar manualmente otro personaje y elegir una imagen local de hasta 3 MB.
- Guardar proyectos, modificar notas, buscar y filtrar, cambiar estado, terminar y reabrir.
- Asociar una canción de muestra desde el proyecto o desde Música.
- Ajustar tiempos, validar el intervalo y simular la reproducción de una selección.
- Conservar los datos de prueba al recargar, si el navegador admite localStorage.

La búsqueda no llama a una IA o a Internet. Las portadas abstractas son provisionales. La reproducción no emite sonido, y guardar un fragmento conserva tiempos y referencia sin generar audio. Esta entrega es un prototipo HTML para revisar UX; no es todavía una app Android.

## Documentación y revisión

- `DECISIONES.md`: estructura de navegación, reglas, tokens y traducción prevista a Compose.
- `preview/resumen-pantallas.png`: resumen visual de seis pantallas.
- `preview/pantalla-*.png`: capturas individuales.
- `qa-prototipo.cjs`: comprobación del recorrido, navegación hacia atrás, persistencia y tamaños estrechos.
- `capturar-pantallas.cjs`: generación de capturas y galería.

Los dos scripts de revisión usan Playwright y Chrome del entorno local de desarrollo, con la ruta de dependencias incluida en el script. No se necesitan para abrir ni utilizar el prototipo.

## Alcance pendiente para Android

Integración real de búsqueda web asistida por IA e imágenes, elección y conexión del proveedor musical, reproducción real, varios fragmentos candidatos por canción, exportación solo desde fuentes compatibles, copias de seguridad, tema claro, eliminación con deshacer y tratamiento completo de errores de los servicios externos. Las funciones creativas adicionales de IA quedan para versiones posteriores.
