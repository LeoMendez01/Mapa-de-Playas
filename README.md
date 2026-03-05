# Mapa de Playas - Flujo anti-conflictos

Este repositorio mantiene archivos duplicados en raíz y `docs/` para publicación en GitHub Pages.
Para evitar conflictos repetitivos, **la raíz es la fuente de verdad** y `docs/` se sincroniza automáticamente.

## Configuración (una sola vez)

```bash
bash scripts/setup-git-hooks.sh
```

Esto activa el hook de git local (`.githooks/pre-commit`) que sincroniza `docs/` antes de cada commit.

## Uso diario

1. Edita solo en raíz:
   - `index.html`
   - `css/style.css`
   - `js/app.js`
   - `data/playas.geojson`
2. El hook pre-commit sincroniza automáticamente `docs/`.

## Si hay conflictos de merge

```bash
git fetch origin
git merge origin/<rama-base>
bash scripts/sync-docs.sh
git add .
git commit -m "Resolve conflicts and sync docs"
```

## CI de protección

El workflow `.github/workflows/verify-docs-sync.yml` falla el PR si `docs/` no coincide con raíz.
