# Resume Generator

A privacy-first, browser-based resume builder with local data persistence. Create professional resumes without sign-up, cloud storage, or internet dependency.

![Resume Generator](https://img.shields.io/badge/version-1.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- **📝 Comprehensive Sections** — Personal info, skills, work experience, education, projects, certifications, internships, languages, and custom sections
- **🎨 Customizable Themes** — 8 preset colors + custom color picker with live preview
- **💾 Local Persistence** — Data saved in browser using SQLite/IndexedDB (no cloud needed)
- **📤 Export Options** — Download as PDF or editable DOCX
- **🔄 Reorderable Entries** — Up/down arrows to organize entries (auto-hidden for single items)
- **📱 Responsive Design** — Works on desktop, tablet, and mobile
- **🔒 Privacy First** — All data stays on your device
- **🤝 Shareable Drafts** — Export your draft as JSON and share it with others, who can import it to populate their own editor

## 🚀 Quick Start

### Option 1: Direct Use
Simply open `index.html` in your browser. No installation required!

### Option 2: Local Server (Recommended)
```bash
# Using Node.js
npx live-server --port=8080

# Using Python
python -m http.server 8080

# Using PHP
php -S localhost:8080
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.

## 📁 Project Structure

```
resume/
├── index.html           # Main editor page
├── preview.html         # Preview & export page
├── PRD.md               # Product requirements
├── README.md            # This file
├── AGENTS.md            # AI agent guidelines
├── css/
│   ├── main.css         # Editor styles
│   └── styles/
│       └── classic.css  # Classic template styles
└── js/
    ├── app.js           # Main application logic
    ├── db.js            # Database layer (sql.js)
    ├── form.js          # Form management & validation
    ├── export-docx.js   # DOCX export functionality
    └── templates/
        └── classic.js   # Classic Professional template
```

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| **Vanilla JavaScript** | Core application logic (no frameworks) |
| **sql.js** | SQLite database in WebAssembly |
| **IndexedDB** | Browser storage for database persistence |
| **html2pdf.js** | PDF generation from HTML |
| **docx** | Microsoft Word document generation |

## 📖 Usage Guide

### Creating Your Resume

1. **Fill Personal Information** — Enter your name, job title, and contact details
2. **Add Sections** — Click "+ Add" buttons to add work experience, education, etc.
3. **Reorder Entries** — Use ↑↓ arrows to change entry order
4. **Preview** — Click "Preview Resume" to see the formatted result
5. **Customize Theme** — Select colors on the preview page
6. **Export** — Download as PDF or DOCX

### Data Management

| Action | Description |
|--------|-------------|
| **Save Draft** | Explicitly save your progress |
| **Export Draft** | Download data as JSON backup |
| **Import Draft** | Restore from JSON backup |
| **Clear All** | Reset all data (with confirmation) |

### Keyboard Shortcuts

- `Tab` — Navigate between fields (auto-saves on blur)
- `Enter` — Add new achievement/skill item
- `Escape` — Cancel current input

## 🎨 Theming

Themes are applied on the preview page:

- **Preset Colors:** Teal, Navy, Burgundy, Forest Green, Charcoal, Purple, Ocean Blue
- **Custom Color:** Use the color picker or enter a hex code directly

The selected theme affects:
- Header banner color
- Section heading colors
- Accent borders
- Link colors

## 📱 Responsive Breakpoints

| Breakpoint | Device |
|------------|--------|
| `< 480px` | Mobile phones |
| `480px - 768px` | Large phones / small tablets |
| `768px - 1024px` | Tablets |
| `> 1024px` | Desktops |

## 🔧 Development

### Prerequisites
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Local web server for development

### Running Locally
```bash
# Clone or download the project
cd resume

# Start a development server
npx live-server --port=8080

# Open in browser
open http://localhost:8080
```

### Adding a New Resume Template

1. Create `css/styles/[template-name].css`
2. Create `js/templates/[template-name].js`
3. Add option to style selector in `preview.html`
4. Register in the template loader

## 📄 License

MIT License — feel free to use, modify, and distribute.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

If you encounter issues:

1. Check the browser console for errors
2. Try clearing browser storage (IndexedDB)
3. Use the "Export Draft" feature to backup your data before troubleshooting
4. Open an issue with browser version, steps to reproduce, and error messages

---

Made with ❤️ for job seekers everywhere
