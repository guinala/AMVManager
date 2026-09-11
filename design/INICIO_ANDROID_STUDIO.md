# AMV Manager · Inicio en Android Studio

Guía preparada el 8 de septiembre de 2026. Las versiones se han consultado en documentación oficial; no se ha creado ni compilado todavía un proyecto Android en este espacio. Los bloques amplían un proyecto generado con Empty Activity: no reemplazan todos sus archivos.

## 1. Crear y ejecutar el proyecto vacío

Instala el canal estable de [Android Studio](https://developer.android.com/studio/releases). La página consultada ofrece Quail 4, 2026.1.4. Abre New Project → Phone and Tablet → Empty Activity, la plantilla con Jetpack Compose.

| Campo | Elección propuesta |
|---|---|
| Name | AMV Manager |
| Package name | com.example.amvmanager para empezar; cambia example por tu identificador antes de publicar |
| Save location | Una carpeta local para el código Android, por ejemplo C:\Dev\AMVManager |
| Language | Kotlin; algunas versiones de la plantilla ya lo fijan |
| Minimum SDK | API 26, Android 8.0 |
| Build configuration language | Kotlin DSL, build.gradle.kts |

API 26 es una decisión de alcance para simplificar el soporte de dispositivos antiguos. No es un requisito de Compose. Si el móvil del cliente fuera anterior, habría que revisarla.

En SDK Manager instala Android SDK Platform 37, Platform-Tools y Android Emulator. Crea un dispositivo virtual de teléfono con API 37 en Device Manager. Más adelante añade otro con API 26 para comprobar el mínimo admitido. También puedes usar el móvil con depuración USB.

En Settings → Build, Execution, Deployment → Build Tools → Gradle conserva el JDK gestionado por Android Studio (GRADLE_LOCAL_JAVA_HOME/JBR, según la versión). Ejecuta primero la app de ejemplo con Run y comprueba que abre.

## 2. Mantener coherentes las herramientas de compilación

Gradle coordina la construcción; AGP añade las tareas Android; Kotlin compila el lenguaje; Compose necesita su plugin de compilación. Conserva inicialmente la combinación generada por la plantilla estable y el Gradle Wrapper del proyecto.

Como referencia, [AGP 9.4.0](https://developer.android.com/build/releases/agp-9-4-0-release-notes) admite API 37, exige Gradle 9.6.0 y JDK 17 como mínimo. No combines un AGP actualizado con un Wrapper antiguo. Si tu Android Studio es anterior, actualiza el IDE antes de seguir esta guía con las dependencias actuales.

AGP 9 incorpora Kotlin. En ese caso no apliques org.jetbrains.kotlin.android ni kapt. Sí se utilizan los plugins de Compose, Serialization y KSP. [Configuración de Kotlin integrado](https://developer.android.com/build/migrate-to-built-in-kotlin).

En app/build.gradle.kts, integra estos valores dentro de los bloques ya existentes:

```kotlin
android {
    compileSdk = 37

    defaultConfig {
        minSdk = 26
        targetSdk = 37
    }

    buildFeatures {
        compose = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

kotlin {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
    }
}
```

Si la plantilla expresa compileSdk mediante un bloque release, edita ese bloque a API 37 en lugar de declarar compileSdk dos veces. Conserva namespace, applicationId, versionCode, versionName y el resto de la configuración generada.

compileSdk determina las API disponibles para compilar; minSdk el Android más antiguo que podrá instalar la app; targetSdk el comportamiento Android para el que la preparas. Java 17 como destino del código no impide ejecutar Gradle con un JBR más reciente.

## 3. Dependencias y catálogo de versiones

Conserva las dependencias básicas de la plantilla: Core KTX, Activity Compose, Compose UI, Material 3, vistas previas y pruebas. Actualiza su entrada composeBom a 2026.08.00. El BOM coordina las bibliotecas Compose; no fija las versiones de Room, Navigation, Lifecycle o Coil. El plugin org.jetbrains.kotlin.plugin.compose mantiene la versión de Kotlin de la plantilla. [Configuración de Compose](https://developer.android.com/develop/ui/compose/setup-compose-dependencies-and-compiler).

Amplía gradle/libs.versions.toml. Fusiona cada sección con la existente: no repitas [versions], [libraries] ni [plugins]. Si ya existe lifecycle, por ejemplo, actualiza su valor en vez de añadirlo otra vez. version.ref = "kotlin" utiliza la versión Kotlin que ya trae la plantilla, al menos 2.2 para Serialization 1.9.0.

```toml
[versions]
lifecycle = "2.11.0"
navigation3 = "1.1.7"
room = "2.8.4"
ksp = "2.3.11"
datastore = "1.2.1"
coil = "3.6.2"
coroutines = "1.10.2"
serialization = "1.9.0"
retrofit = "3.0.0"

[libraries]
androidx-lifecycle-runtime-compose = { module = "androidx.lifecycle:lifecycle-runtime-compose", version.ref = "lifecycle" }
androidx-lifecycle-viewmodel-compose = { module = "androidx.lifecycle:lifecycle-viewmodel-compose", version.ref = "lifecycle" }
androidx-lifecycle-viewmodel-navigation3 = { module = "androidx.lifecycle:lifecycle-viewmodel-navigation3", version.ref = "lifecycle" }
androidx-navigation3-runtime = { module = "androidx.navigation3:navigation3-runtime", version.ref = "navigation3" }
androidx-navigation3-ui = { module = "androidx.navigation3:navigation3-ui", version.ref = "navigation3" }
androidx-room-runtime = { module = "androidx.room:room-runtime", version.ref = "room" }
androidx-room-compiler = { module = "androidx.room:room-compiler", version.ref = "room" }
androidx-room-testing = { module = "androidx.room:room-testing", version.ref = "room" }
androidx-datastore-preferences = { module = "androidx.datastore:datastore-preferences", version.ref = "datastore" }
coil-compose = { module = "io.coil-kt.coil3:coil-compose", version.ref = "coil" }
coil-network-okhttp = { module = "io.coil-kt.coil3:coil-network-okhttp", version.ref = "coil" }
kotlinx-coroutines-android = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-android", version.ref = "coroutines" }
kotlinx-coroutines-test = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-test", version.ref = "coroutines" }
kotlinx-serialization-json = { module = "org.jetbrains.kotlinx:kotlinx-serialization-json", version.ref = "serialization" }
retrofit-core = { module = "com.squareup.retrofit2:retrofit", version.ref = "retrofit" }
retrofit-serialization = { module = "com.squareup.retrofit2:converter-kotlinx-serialization", version.ref = "retrofit" }

[plugins]
ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }
room = { id = "androidx.room", version.ref = "room" }
kotlin-serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
```

Se fijan versiones publicadas, sin sufijos alpha/beta ni rangos dinámicos. Coroutines 1.10.2 y Serialization 1.9.0 son bases estables deliberadas, no una afirmación de que sean las publicaciones más recientes. Gradle puede resolver versiones transitivas superiores exigidas por otras bibliotecas.

Funciones y fuentes de las bibliotecas:

- [Lifecycle](https://developer.android.com/jetpack/androidx/releases/lifecycle): ViewModels y observación de estado respetando el ciclo de vida.
- [Navigation 3](https://developer.android.com/guide/navigation/navigation-3/get-started): pila de pantallas Compose y estado restaurable. Su documentación incluye complementos experimentales; esta guía utiliza las versiones estables seleccionadas.
- [Room](https://developer.android.com/jetpack/androidx/releases/room): proyectos y fragmentos en SQLite. [KSP](https://github.com/google/ksp/releases) genera el código de acceso a partir de las anotaciones.
- [DataStore](https://developer.android.com/jetpack/androidx/releases/datastore): preferencias pequeñas, como el tema y el orden de los proyectos.
- [Coil](https://coil-kt.github.io/coil/getting_started/): carga y caché de imágenes. Coil 3 requiere añadir un módulo de red para descargar imágenes.
- [Coroutines](https://github.com/Kotlin/kotlinx.coroutines/releases): operaciones asíncronas y Flow.
- [Serialization](https://github.com/Kotlin/kotlinx.serialization/releases): JSON y serialización de rutas; versión de la biblioteca distinta de la del plugin Kotlin.
- [Retrofit](https://github.com/square/retrofit/releases): llamadas al backend y conversión de respuestas JSON. OkHttp llega como dependencia transitiva.

## 4. Activar los plugins y añadir las bibliotecas

En el build.gradle.kts de la raíz, añade dentro de plugins:

```kotlin
alias(libs.plugins.ksp) apply false
alias(libs.plugins.room) apply false
alias(libs.plugins.kotlin.serialization) apply false
```

En app/build.gradle.kts, añade dentro de plugins:

```kotlin
alias(libs.plugins.ksp)
alias(libs.plugins.room)
alias(libs.plugins.kotlin.serialization)
```

En dependencies del módulo app, añade las entradas que no estuvieran ya:

```kotlin
implementation(libs.androidx.lifecycle.runtime.compose)
implementation(libs.androidx.lifecycle.viewmodel.compose)
implementation(libs.androidx.lifecycle.viewmodel.navigation3)
implementation(libs.androidx.navigation3.runtime)
implementation(libs.androidx.navigation3.ui)
implementation(libs.kotlinx.serialization.json)
implementation(libs.kotlinx.coroutines.android)

implementation(libs.androidx.room.runtime)
ksp(libs.androidx.room.compiler)
implementation(libs.androidx.datastore.preferences)

implementation(libs.coil.compose)
implementation(libs.coil.network.okhttp)
implementation(libs.retrofit.core)
implementation(libs.retrofit.serialization)

testImplementation(libs.kotlinx.coroutines.test)
androidTestImplementation(libs.androidx.room.testing)
```

Añade también este bloque a nivel superior del mismo archivo:

```kotlin
room {
    schemaDirectory("$projectDir/schemas")
}
```

Los esquemas exportados documentarán la estructura de la base de datos y se guardarán en Git. Conserva las dependencias de pruebas Compose/JUnit que generó la plantilla. No añadas room-ktx: para este uso, las capacidades necesarias ya están en Room runtime moderno.

Comprueba que settings.gradle.kts incluye google() y mavenCentral() para dependencias, y gradlePluginPortal() para plugins, como suele generar el asistente. Pulsa Sync Now y ejecuta otra vez la aplicación.

## 5. Permisos y servicios pendientes

Añade a app/src/main/AndroidManifest.xml, dentro de manifest y fuera de application:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

Este permiso no muestra un diálogo en tiempo de ejecución. Para elegir una imagen del móvil utilizaremos el selector del sistema cuando implementemos esa pantalla.

La IA de personajes vivirá detrás del backend: Android enviará nombre y obra, y recibirá nombre normalizado, obra, imagen y fuente. Las credenciales privadas del proveedor se guardarán en el servidor. No hace falta un SDK de agentes, RAG ni un modelo ejecutándose en el teléfono para construir las pantallas.

La elección del reproductor depende todavía de la fuente musical. Media3/ExoPlayer sirve para fuentes multimedia compatibles, pero no convierte un enlace de Spotify o YouTube en audio reproducible. Si se elige YouTube, se integrará su reproductor oficial visible. No añadas todavía dependencias de reproducción o exportación hasta fijar esa fuente. Guardar inicio y final como referencia sí puede desarrollarse desde ahora.

## 6. Estructura inicial recomendada

Una Activity, un módulo app y paquetes por responsabilidad. Las carpetas son una guía; créalas cuando haya código que colocar en ellas.

```text
com.example.amvmanager/
  MainActivity.kt
  AmvApplication.kt
  app/
    AppContainer.kt
    navigation/
  core/
    designsystem/
      theme/
      components/
    model/
  data/
    local/
      dao/
      entity/
    remote/
    repository/
  feature/
    projects/
    character/
    projectdetail/
    music/
    clip/
    history/
    settings/
```

Compose dibuja el estado que publica un ViewModel; este usa un repositorio; el repositorio consulta Room o la red. Por ejemplo: Guardar idea → ViewModel → repositorio → Room → nueva lista visible.

Empezaría con inyección por constructor y un AppContainer: un lugar que crea y comparte la base de datos y los repositorios. Para el tamaño actual permite ver claramente las dependencias sin añadir otro plugin. Hilt se puede valorar si crece el proyecto.

Modelo inicial: identificador estable, nombre, obra opcional, imagen opcional, estado, notas, fechas y referencia musical opcional. El fragmento tendrá inicio y final en milisegundos Long y estará asociado a una versión concreta de la canción. Una idea puede guardarse sin canción ni conexión.

## 7. Orden de trabajo mientras se revisa Figma

1. Proyecto vacío ejecutándose y configuración registrada en Git.
2. Tema y componentes básicos, con colores semánticos en un único lugar. Deja dynamicColor desactivado inicialmente para conservar la paleta elegida.
3. Proyectos, Detalle e Historial con datos de ejemplo; navegación y botón Atrás.
4. Crear, editar y conservar proyectos con Room; probar que sobreviven al cierre de la app.
5. Búsqueda de personajes mediante un repositorio simulado, seguido del backend real.
6. Búsqueda musical y elección del proveedor; integrar reproducción después.
7. Marcas de fragmento, validación temporal y escucha del intervalo cuando el proveedor lo permita.

Las 28 vistas de Figma son pantallas y estados: no necesitan 28 Activities ni 28 ViewModels. Inicio, cargando, encontrado y error del personaje pueden ser estados de una misma pantalla.

Primer ejercicio: ejecutar la app, cambiar el título a AMV Manager y mostrar un botón rojo «Nuevo AMV». Después explica por qué Room guardará proyectos y DataStore guardará preferencias.

## Paleta propuesta para probar en Figma

| Uso | Color |
|---|---|
| Fondo carbón | #121318 |
| Superficie | #1C1E26 |
| Superficie elevada | #272A35 |
| Botón principal rojo | #D62F45 |
| Texto sobre botón principal | #FFFFFF |
| Acento rojo claro para iconos/texto | #FF707D |
| Selección suave | #3B222B |
| Texto principal | #F5F6FA |
| Texto secundario | #B8BCC8 |
| Turquesa puntual | #67D9CA |

Predominan las superficies neutras. Rojo en la acción principal y selecciones; turquesa en pequeños detalles musicales. Las imágenes de personajes aportan el resto del color. Sin resplandores en cada tarjeta ni tipografías decorativas en formularios.

Contrastes calculados: blanco sobre #D62F45 ≈ 4,83:1; #FF707D sobre #1C1E26 ≈ 6,23:1; texto secundario sobre superficie ≈ 8,76:1. Estos pares no validan automáticamente toda la interfaz: hay que revisar también estados deshabilitados, transparencias e imágenes.
