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
  plan.js               LA RUTINA Y LA DIETA. Editar aquí para cambiar el plan.
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

## Cambiar el plan de entreno o la dieta

Todo está en `js/plan.js`. Los ejercicios se identifican por `id`: **no cambies un
`id` existente** si ya tienes historial, porque el progreso se guarda contra él.
Cambiar `name` es seguro; cambiar `id` empieza el historial de cero.

Lo mismo aplica a los `id` de los ítems de comida.

## Después de modificar archivos

El service worker sirve desde caché. Al desplegar cambios, sube la constante
`CACHE` en `sw.js` (`entreno-v1` → `entreno-v2`) o el móvil seguirá viendo la
versión antigua.

## Datos y copia de seguridad

Se guardan en `localStorage` bajo la clave `entreno.v1`. Safari borra el
almacenamiento de sitios web que no se visitan en 7 días, pero **las apps añadidas
a la pantalla de inicio están exentas** de esa limpieza.

Aun así: exporta desde Ajustes de vez en cuando. Es un archivo JSON y se restaura
desde el mismo sitio. Es lo único que protege el histórico si reinstalas o cambias
de teléfono.
