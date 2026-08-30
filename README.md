# Entreno

App personal de registro de entrenamiento y dieta. PWA sin backend: HTML, CSS y
JavaScript estáticos. Los datos viven en el propio dispositivo.

## Ponerla en marcha

1. Crea un repositorio en GitHub (público o privado, GitHub Pages funciona con ambos
   en cuentas gratuitas desde 2021).
2. Sube el contenido de esta carpeta a la raíz del repositorio.
3. Settings → Pages → Source: `Deploy from a branch` → rama `main`, carpeta `/ (root)`.
4. Espera un minuto. La URL será `https://<usuario>.github.io/<repo>/`.
5. En el iPhone: abre esa URL **en Safari** (Chrome no puede instalar PWAs en iOS),
   pulsa Compartir → Añadir a pantalla de inicio.

A partir de ahí se abre a pantalla completa desde el icono y funciona sin conexión.

## Estructura

```
index.html              Documento y contenedores
manifest.webmanifest    Metadatos de instalación
sw.js                   Service worker (offline)
css/app.css             Estilos, tokens de color en :root
js/
  plan.js               CATÁLOGO DE EJERCICIOS, SESIONES Y PLANTILLA DE DIETA.
  foods.js              Base de datos de alimentos (148) + consulta por código
                        de barras contra Open Food Facts.
  store.js              Única capa de persistencia. Migrar de almacenamiento
                        solo requiere tocar este archivo.
  charts.js             Gráficas SVG sin dependencias
  app.js                Router por hash y registro de pestañas
  views/
    hoy.js              Sesión del día y registro de series
    dieta.js            Checklist de comidas y cantidades
    progreso.js         Gráficas
    ajustes.js          Objetivos y copia de seguridad
```

## Añadir una pestaña

1. Crea `js/views/nueva.js` que exporte `render(root)` y, opcionalmente, `reset()`.
2. Añade una entrada a `TABS` en `js/app.js`.
3. Añade la ruta del archivo a `SHELL` en `sw.js` y sube el número de `CACHE`.

## Sustituir ejercicios

`EXERCISES` en `plan.js` es el catálogo de movimientos; cada uno declara sus
`alts` (alternativas). Las sesiones no contienen ejercicios: los **referencian**
por `ref`. Sustituir es cambiar a qué id apunta ese hueco.

Desde la app: botón `⋯` en la tarjeta del ejercicio. Un ejercicio sustituido
lleva el símbolo `↺` junto al nombre.

`DEFAULT_SWAPS` son las sustituciones activas de fábrica. Lo que elijas en la app
manda sobre ellas; «Restaurar ejercicios originales» en Ajustes las devuelve.

**El historial se guarda contra el id del ejercicio real, no contra el hueco.**
Al sustituir, el ejercicio nuevo empieza su historial de cero — que es lo
correcto, porque no son el mismo movimiento. Si vuelves al original, recuperas
su historial intacto.

## Cambiar el plan de dieta

`MEALS` en `plan.js` es solo una plantilla para rellenar el día de un toque.
Cada ítem apunta a un alimento de `foods.js` por su id.

Para añadir alimentos permanentes, escríbelos en `FOODS` (`foods.js`). Los que
crees desde la app se guardan en tu almacenamiento, no en el código.

**No cambies un `id` existente** si ya tienes historial: el progreso y los
registros se guardan contra él. Cambiar `name` es seguro.

## Registro de comidas

Tres formas de añadir un alimento:

1. Tocar el nombre de una comida de la plantilla: añade todos sus ítems de golpe.
2. Botón `+` de cualquier comida: buscador sobre la base local y tus alimentos.
3. «Código de barras» dentro del buscador: consulta Open Food Facts (sin clave
   de API, requiere conexión) y guarda el producto entre los tuyos.

Los totales comparan con los objetivos de Ajustes y avisan si te has quedado
corto o te has pasado, con un margen del 5 % definido en `TOLERANCE`.

## Después de modificar archivos

El service worker sirve desde caché. Al desplegar cambios, sube la constante
`CACHE` en `sw.js` (`entreno-v1` → `entreno-v2`) o el móvil seguirá viendo la
versión antigua.

## Datos y copia de seguridad

Se guardan en `localStorage` bajo la clave `entreno.v1`, con el esquema
versionado dentro (actualmente v2; `migrate()` en `store.js` convierte datos
antiguos al arrancar). Safari borra el
almacenamiento de sitios web que no se visitan en 7 días, pero **las apps añadidas
a la pantalla de inicio están exentas** de esa limpieza.

Aun así: exporta desde Ajustes de vez en cuando. Es un archivo JSON y se restaura
desde el mismo sitio. Es lo único que protege el histórico si reinstalas o cambias
de teléfono.
