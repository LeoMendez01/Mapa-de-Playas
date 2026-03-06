# Mapa de Playas (El Salvador)

Visor geoespacial estático con Leaflet para visualizar playas de El Salvador.

## Estructura del proyecto

- `index.html`
- `css/style.css`
- `js/app.js`
- `data/playas.geojson`
- `.github/workflows/deploy-pages.yml`

> Fuente de verdad: raíz del repositorio.

## Qué hace la app

- Mapa centrado en El Salvador.
- Capa base OpenStreetMap por defecto.
- Soporte opcional para Google Maps (si defines `window.GOOGLE_MAPS_API_KEY`).
- Lista lateral de playas.
- Botón **Ajustar a todos**.
- Popup por playa con:
  - nombre de la playa
  - estudios
- Carga de datos desde `data/playas.geojson`.
- Fallback local de 7 puntos si el GeoJSON falla o viene incompleto.
- Indicador de cantidad de playas cargadas.

## Datos

Archivo: `data/playas.geojson`  
Formato: `FeatureCollection` con `Point` en `[Longitud, Latitud]`.

## Ejecutar local

```bash
python -m http.server 8000
