# Mapa de Playas

Repositorio del visor geoespacial de playas de El Salvador.

## Cambio importante (anti-conflictos)

Se eliminó la duplicación de archivos en `docs/` para evitar conflictos repetitivos en PR.

Desde ahora, la **única fuente de verdad** es la raíz del repo:
- `index.html`
- `css/style.css`
- `js/app.js`
- `data/playas.geojson`

## Publicación

La publicación se hace por GitHub Actions con el workflow:
- `.github/workflows/deploy-pages.yml`

## Flujo recomendado para evitar bloqueos al merge

```bash
git fetch origin
git checkout <tu-rama>
git merge origin/<rama-base>
# resolver conflictos locales si aparecen
node --check js/app.js
python -m json.tool data/playas.geojson > /tmp/playas.json
git add .
git commit -m "Resolve merge conflicts"
git push
```

## Nota

No uses el editor web de conflictos de GitHub para este proyecto salvo emergencia.
Resuélvelo localmente con merge, prueba y push.
