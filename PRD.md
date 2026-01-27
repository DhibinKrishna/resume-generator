# Product Requirements Document (PRD)
## Resume Generator

**Version:** 1.0  
**Last Updated:** January 27, 2026  
**Status:** Active Development

---

## 1. Overview

### 1.1 Product Summary
Resume Generator is a web-based application that allows users to create, customize, and export professional resumes. The application runs entirely in the browser with local data persistence using IndexedDB/SQLite (via sql.js), ensuring user privacy and offline capability.

### 1.2 Goals
- Enable users to create professional resumes without requiring sign-up or cloud storage
- Provide real-time preview with customizable themes and styles
- Support multiple export formats (PDF, DOCX)
- Ensure data persistence across browser sessions
- Deliver a responsive experience across desktop and mobile devices

### 1.3 Non-Goals
- User authentication and cloud sync (out of scope for v1)
- Multiple resume management (v1 supports single resume per browser)
- Resume templates beyond "Classic Professional" (planned for v2)
- AI-powered content suggestions (future consideration)

---

## 2. User Personas

### Primary Persona: Job Seeker
- **Demographics:** 22-45 years old, actively looking for employment
- **Needs:** Quick, easy resume creation without learning curve
- **Pain Points:** Complex resume builders, privacy concerns with cloud services
- **Goals:** Create a professional resume in under 30 minutes

### Secondary Persona: Career Changer
- **Demographics:** 30-50 years old, transitioning careers
- **Needs:** Flexibility to reorganize sections, emphasis on transferable skills
- **Pain Points:** Limited customization in existing tools
- **Goals:** Highlight relevant experience while de-emphasizing others

---

## 3. Features

### 3.1 Core Features

#### Resume Sections
| Section | Description | Required |
|---------|-------------|----------|
| Personal Information | Name, job title, contact details, links | Yes |
| Profile Summary | Brief professional summary | No |
| Skills | Skill categories with items | No |
| Work Experience | Employment history with achievements | No |
| Education | Academic background | No |
| Projects | Portfolio projects with descriptions | No |
| Certifications | Professional certifications | No |
| Internships | Internship experience | No |
| Languages | Language proficiencies | No |
| Custom Sections | User-defined sections | No |

#### Data Management
- **Auto-save:** Data saves automatically on field blur
- **Manual Save:** Explicit "Save Draft" button
- **Export Draft:** Download resume data as JSON (`[name]_draft_[date].json`)
- **Import Draft:** Upload previously exported JSON
- **Clear All:** Reset all data with confirmation

#### Theming & Styling
- **Theme Colors:** 8 preset colors + custom color picker
- **Hex Input:** Direct hex code entry
- **Live Preview:** Real-time theme application on preview page
- **Style Templates:** Extensible template system (Classic Professional)

#### Entry Reordering
- **Up/Down Arrows:** Reorder entries within each section
- **Smart Visibility:** Arrows hidden when only one entry exists
- **Visual Feedback:** Entry numbers update dynamically

#### Export Options
- **PDF Export:** High-fidelity PDF matching preview
- **DOCX Export:** Editable Word document with styling

### 3.2 Technical Features

#### Data Persistence
- SQLite database (sql.js WASM) stored in IndexedDB
- Schema migrations for backward compatibility
- Persistent across browser sessions

#### Responsive Design
- Mobile-first approach
- Breakpoints: 320px, 768px, 1024px
- Touch-friendly controls

---

## 4. User Flows

### 4.1 First-Time User Flow
1. User lands on homepage
2. Empty form with placeholder guidance displayed
3. User fills personal information
4. User adds sections as needed
5. User clicks "Preview Resume"
6. User adjusts theme/style on preview page
7. User downloads PDF or DOCX

### 4.2 Returning User Flow
1. User lands on homepage
2. Previously saved data auto-populates
3. User makes edits
4. Changes auto-save on blur
5. User previews and exports

### 4.3 Import/Export Flow
1. User clicks "Export Draft"
2. JSON file downloads
3. (Later) User clicks "Import Draft"
4. User selects JSON file
5. Form populates with imported data

---

## 5. Technical Requirements

### 5.1 Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 5.2 Dependencies
| Library | Version | Purpose |
|---------|---------|---------|
| sql.js | 1.8+ | SQLite in WebAssembly |
| html2pdf.js | latest | PDF generation |
| docx | 8.0+ | DOCX generation |

### 5.3 Performance Targets
- Initial load: < 3 seconds
- Auto-save latency: < 500ms
- PDF generation: < 5 seconds
- Memory usage: < 100MB

---

## 6. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Resume completion rate | > 70% | % of users who reach preview page |
| Export rate | > 50% | % of users who download PDF/DOCX |
| Return user rate | > 30% | % of users returning within 7 days |
| Mobile usage | > 25% | % of sessions on mobile devices |

---

## 7. Future Roadmap

### v1.1 (Q2 2026)
- [ ] Additional resume templates (Modern, Minimal)
- [ ] Section reordering (move entire sections)
- [ ] Print optimization

### v1.2 (Q3 2026)
- [ ] Multiple resume support
- [ ] Resume versioning
- [ ] Undo/redo functionality

### v2.0 (Q4 2026)
- [ ] Cloud sync (optional)
- [ ] AI content suggestions
- [ ] ATS compatibility checker

---

## 8. Appendix

### A. Database Schema
See `/js/db.js` for complete schema definitions.

### B. File Structure
```
resume/
├── index.html          # Main editor page
├── preview.html        # Preview & export page
├── css/
│   ├── main.css        # Editor styles
│   └── styles/
│       └── classic.css # Classic template styles
└── js/
    ├── app.js          # Main application logic
    ├── db.js           # Database layer
    ├── form.js         # Form management
    ├── export-docx.js  # DOCX export
    └── templates/
        └── classic.js  # Classic template renderer
```
