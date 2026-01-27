# AGENTS.md
## AI Agent Guidelines for Resume Generator

This document provides context and guidelines for AI agents (Claude, GPT, Gemini, etc.) working on this codebase.

---

## 1. Project Overview

**Resume Generator** is a browser-based resume builder using vanilla JavaScript with SQLite persistence via sql.js (WASM). The application has no backend — all data is stored locally in IndexedDB.

### Key Principles
- **No frameworks** — Pure HTML, CSS, JavaScript
- **Privacy-first** — All data stays in the browser
- **Offline-capable** — Works without internet after initial load
- **Modular architecture** — Separated concerns across files

---

## 2. Architecture

### File Responsibilities

| File | Purpose | Key Exports |
|------|---------|-------------|
| `js/app.js` | Main entry point, event binding, state management | `init()` |
| `js/db.js` | Database layer, CRUD operations, persistence | `initDB()`, `save*()`, `get*()`, `loadResume()` |
| `js/form.js` | Form generation, data collection | `add*Entry()`, `collect*()` |
| `js/export-docx.js` | DOCX document generation | `downloadDOCX()` |
| `js/templates/classic.js` | Classic template HTML rendering | `renderResume()` |

### Data Flow
```
User Input → form.js (collect) → app.js (orchestrate) → db.js (persist)
                                                              ↓
Preview ← templates/classic.js (render) ← db.js (load) ← IndexedDB
```

### Database Schema
The database uses SQLite (sql.js WASM) stored in IndexedDB. Key tables:
- `resumes` — Main resume config (style, theme)
- `personal_info` — Contact information
- `work_experience` + `work_achievements` — Employment history
- `education` — Academic background
- `projects` — Portfolio items
- `skills` + `skill_items` — Skill categories
- `certifications`, `internships`, `languages` — Additional sections
- `custom_sections` + `custom_section_items` — User-defined sections

### Key Implementation Details
- **Entry Reordering**: Handled via `moveEntryUp/Down` in `js/app.js`.
  - DOM manipulation (`insertBefore`) changes display order instantly.
  - Data collection uses `querySelectorAll` (DOM order) to preserve order.
  - Database stores `sort_order` column, updated on every save.
  - CSS `.entry-block:only-child .btn-reorder { display: none; }` handles smart visibility.
- **Skills Positioning**: Explicitly placed **before** Work Experience in:
  - `index.html` (Form)
  - `js/templates/classic.js` (Preview/PDF)
  - `js/export-docx.js` (DOCX)
- **Draft Export**: Filenames are sanitized: `[user_name]_draft_[date].json`. If name is missing, defaults to `resume`.

---

## 3. Coding Standards

### JavaScript Style
```javascript
// Use async/await for database operations
async function saveData(resumeId, data) {
  await savePersonalInfo(resumeId, data.personalInfo);
}

// Use descriptive function names
function collectWorkExperience() { ... }

// Use template literals for HTML generation
block.innerHTML = `
  <div class="entry-block">
    <span>${esc(data.company)}</span>
  </div>
`;

// Always escape user input in HTML contexts
function esc(str) {
  return (str || '').replace(/[&<>"']/g, c => ...);
}
```

### CSS Style
```css
/* Use CSS custom properties for theming */
:root {
  --theme-primary: #5B7B7A;
  --theme-border: #e0e0e0;
}

/* Use semantic class names */
.entry-block-header { }
.resume-section-title { }

/* Mobile-first responsive design */
@media (min-width: 768px) { }
```

### HTML Structure
```html
<!-- Use semantic HTML -->
<section class="form-section">
  <header class="form-section-header">
    <h2>Work Experience</h2>
  </header>
  <div id="work-entries"></div>
</section>
```

---

## 4. Common Tasks

### Adding a New Resume Section

1. **Update database schema** in `db.js`:
   ```javascript
   // Add table creation in createTables()
   run(`CREATE TABLE IF NOT EXISTS new_section (...)`);
   
   // Add save function
   export async function saveNewSection(resumeId, data) { ... }
   
   // Add get function  
   export function getNewSection(resumeId) { ... }
   ```

2. **Add form handling** in `form.js`:
   ```javascript
   export function addNewSectionEntry(data = {}) { ... }
   export function collectNewSection() { ... }
   ```

3. **Update app.js**:
   - Import new functions
   - Add event handlers for add/remove buttons
   - Include in `saveAll()` and `populateForm()`

4. **Update template** in `templates/classic.js`:
   - Add rendering logic in `renderResume()`

5. **Add CSS styles** in `css/styles/classic.css`

### Adding a New Theme Option

1. Add swatch button in `preview.html`:
   ```html
   <button class="theme-swatch" data-color="#HEXCODE" style="background:#HEXCODE" title="Color Name"></button>
   ```

2. No JavaScript changes needed — the existing click handler will work.

### Adding Export Format

1. Create new file `js/export-[format].js`
2. Export function `download[FORMAT](data, filename)`
3. Import in `preview.html`
4. Add button with click handler

---

## 5. Testing Guidelines

### Manual Testing Checklist
- [ ] All form fields save and restore correctly
- [ ] Entry reordering works (up/down arrows)
- [ ] Theme changes apply in preview
- [ ] PDF export matches preview
- [ ] DOCX export is readable in Word
- [ ] Import/Export draft works
- [ ] Clear All resets everything
- [ ] Mobile responsive at 320px, 375px, 768px

### Browser Testing
Test in: Chrome, Firefox, Safari, Edge

### Edge Cases
- Empty sections should not render
- Special characters in text fields
- Very long content
- Missing optional fields

---

## 6. Known Limitations

### Current Limitations
- Single resume per browser (no multi-resume support)
- No undo/redo
- Limited to Classic Professional template
- No collaborative editing
- No section reordering (only entry reordering within sections)

### Technical Debt
- Some CSS could be consolidated
- Template rendering could use a more formal templating approach
- Error handling could be more comprehensive

---

## 7. Important Notes for AI Agents

### Do's ✅
- Follow existing code patterns and style
- Use `esc()` function for any user-provided content in HTML
- Include IndexedDB persistence with `saveToIndexedDB()` after DB changes
- Test on mobile viewport (320px minimum)
- Update all related files when adding features (db, form, app, template, css)

### Don'ts ❌
- Don't introduce external frameworks (React, Vue, etc.)
- Don't store sensitive data (passwords, API keys)
- Don't use `innerHTML` with unescaped user input
- Don't assume network availability
- Don't break backward compatibility with existing saved data

### Migration Safety
When modifying database schema:
1. Use `ALTER TABLE IF NOT EXISTS` pattern for migrations
2. Handle cases where column already exists
3. Test with existing saved data

---

## 8. Quick Reference

### Entry Points
- **Editor:** `index.html` → `js/app.js`
- **Preview:** `preview.html` (self-contained JS)

### Key Functions
```javascript
// Initialize app
await initDB();
resumeId = await getOrCreateResume();

// Save all data
await saveAll();

// Load and render
const data = loadResume(resumeId);
const html = renderResume(resumeId);

// Export
await downloadDOCX(data, filename);
```

### CSS Variables
```css
--theme-primary       /* Main theme color */
--theme-primary-light /* Lighter shade */
--theme-primary-dark  /* Darker shade */
--theme-bg           /* Background color */
--theme-text         /* Text color */
--theme-border       /* Border color */
```

---

*Last updated: January 27, 2026*
