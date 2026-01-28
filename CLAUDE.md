# Resume Generator

Browser-based resume builder using vanilla JS, sql.js (SQLite in WASM), and IndexedDB persistence.

## Architecture

- **No build step** — plain ES modules served directly
- **Database**: sql.js (SQLite compiled to WASM), persisted to IndexedDB
- **Templates**: Each resume style (e.g. `classic`) has its own render function in `js/templates/`
- **Exports**: PDF via browser print, DOCX via docx.js

## Key Files

- `js/db.js` — Schema, migrations (ALTER TABLE try/catch pattern), all CRUD, import/export draft
- `js/form.js` — Dynamic form entry creation/removal, data collection from DOM
- `js/app.js` — Init, event binding, orchestration between db and form
- `js/templates/classic.js` — HTML rendering for classic resume style
- `js/export-docx.js` — DOCX generation
- `js/renderer.js` — Preview page logic
- `index.html` — Editor page
- `preview.html` — Resume preview page

## Data Model

- Projects are **nested under work experience** (not a standalone section). Each work entry has `achievements[]` and `projects[]`.
- Draft export format is version 2. Old v1 drafts with top-level `projects` array are warned and skipped on import.
- **Licenses** have fields: `name`, `issuing_org`, `issue_date`, `expiration_date`, `license_number`, `description`, `sort_order`. Uses delete-all-then-reinsert on save like other multi-item sections.
- Sections with child items (work -> achievements/projects, skills -> items, licenses, custom sections -> items) use a delete-all-then-reinsert pattern on save.

## Conventions

- DB migrations use `ALTER TABLE ... ADD COLUMN` wrapped in try/catch (column-already-exists is silently ignored)
- Form entries use `data-action` attributes for delegated event handling in `app.js`
- Reorder support uses `move-up` / `move-down` actions on `.entry-block`, and `move-work-project-up` / `move-work-project-down` on `.work-project-item`
- HTML escaping helper `esc()` is defined locally in each module that needs it
