// DOCX export using docx.js

import { DEFAULT_SECTION_ORDER } from './db.js';

export async function downloadDOCX(data, filename = 'resume.docx', fontValue = 'default') {
  if (typeof docx === 'undefined') {
    alert('DOCX library not loaded. Please check your internet connection and refresh.');
    return;
  }

  const {
    Document, Packer, Paragraph, TextRun, HeadingLevel,
    AlignmentType, BorderStyle, TabStopPosition, TabStopType,
    convertInchesToTwip,
  } = docx;

  const docxFont = fontValue === 'default' ? 'Calibri' : fontValue;

  const pi = data.personalInfo || {};
  const summary = data.profileSummary || '';
  const theme = data.config?.theme || '#5B7B7A';

  // Convert hex to RGB for docx color
  const themeColor = theme.replace('#', '');

  const children = [];

  // Name header
  children.push(new Paragraph({
    children: [
      new TextRun({
        text: pi.full_name || 'Your Name',
        bold: true,
        size: 48,
        color: themeColor,
        font: docxFont,
      }),
    ],
    spacing: { after: 100 },
  }));

  // Job title
  if (pi.job_title) {
    children.push(new Paragraph({
      children: [
        new TextRun({
          text: pi.job_title,
          size: 26,
          color: '666666',
          font: docxFont,
        }),
      ],
      spacing: { after: 200 },
    }));
  }

  // Contact info
  const contactParts = [pi.email, pi.phone, pi.location, pi.linkedin, pi.portfolio].filter(Boolean);
  if (contactParts.length > 0) {
    children.push(new Paragraph({
      children: [
        new TextRun({
          text: contactParts.join('  |  '),
          size: 18,
          color: '555555',
          font: docxFont,
        }),
      ],
      spacing: { after: 300 },
    }));
  }

  // Helper: section heading
  function addSectionHeading(title) {
    children.push(new Paragraph({
      children: [
        new TextRun({
          text: title.toUpperCase(),
          bold: true,
          size: 24,
          color: themeColor,
          font: docxFont,
        }),
      ],
      spacing: { before: 960, after: 300 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: themeColor },
      },
    }));
  }

  // Helper: entry header with date
  function addEntryHeader(title, dateStr) {
    const runs = [
      new TextRun({
        text: title,
        bold: true,
        size: 22,
        font: docxFont,
      }),
    ];
    if (dateStr) {
      runs.push(new TextRun({
        text: `\t${dateStr}`,
        size: 20,
        color: '666666',
        font: docxFont,
      }));
    }
    children.push(new Paragraph({
      children: runs,
      tabStops: [{
        type: TabStopType.RIGHT,
        position: TabStopPosition.MAX,
      }],
      spacing: { before: 480, after: 100 },
    }));
  }

  // Helper: subtitle
  function addSubtitle(text) {
    children.push(new Paragraph({
      children: [
        new TextRun({
          text: text,
          italics: true,
          size: 20,
          color: '555555',
          font: docxFont,
        }),
      ],
      spacing: { after: 80 },
    }));
  }

  // Helper: description paragraph
  function addDescription(text) {
    children.push(new Paragraph({
      children: parseBoldRuns(text, { size: 20, color: '444444', font: docxFont }),
      spacing: { before: 80, after: 120 },
    }));
  }

  // Helper: bullet
  function addBullet(text) {
    children.push(new Paragraph({
      children: parseBoldRuns(text, { size: 20, font: docxFont }),
      bullet: { level: 0 },
      spacing: { after: 60 },
    }));
  }

  // Helper: plain paragraph
  function addParagraph(text) {
    children.push(new Paragraph({
      children: parseBoldRuns(text, { size: 20, font: docxFont }),
      spacing: { after: 200 },
    }));
  }

  function parseBoldRuns(text, baseProps = {}) {
    const runs = [];
    const regex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        runs.push(new TextRun({ ...baseProps, text: text.slice(lastIndex, match.index) }));
      }
      runs.push(new TextRun({ ...baseProps, text: match[1], bold: true }));
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      runs.push(new TextRun({ ...baseProps, text: text.slice(lastIndex) }));
    }
    if (runs.length === 0) {
      runs.push(new TextRun({ ...baseProps, text }));
    }
    return runs;
  }

  function formatDateRange(start, end) {
    if (!start && !end) return '';
    if (start && end) return `${start} — ${end}`;
    if (start) return `${start} — Present`;
    return end;
  }

  // Section renderers
  const sectionRenderers = {
    summary() {
      if (summary && summary.trim()) {
        addSectionHeading('Profile Summary');
        addParagraph(summary);
      }
    },

    skills() {
      const filledSkills = (data.skills || []).filter(s => s.category || (s.items && s.items.length > 0));
      if (filledSkills.length > 0) {
        addSectionHeading('Skills');
        filledSkills.forEach(s => {
          if (s.bulleted && s.items && s.items.length > 0) {
            children.push(new Paragraph({
              children: [
                new TextRun({
                  text: s.category || 'Skills',
                  bold: true,
                  size: 20,
                  font: docxFont,
                }),
              ],
              spacing: { before: 480, after: 120 },
            }));
            s.items.forEach(item => addBullet(item));
          } else {
            children.push(new Paragraph({
              children: [
                new TextRun({
                  text: (s.category || '') + ': ',
                  bold: true,
                  size: 20,
                  font: docxFont,
                }),
                ...parseBoldRuns((s.items || []).join(', '), { size: 20, font: docxFont }),
              ],
              spacing: { after: 100 },
            }));
          }
        });
      }
    },

    licenses() {
      const filledLicenses = (data.licenses || []).filter(l => l.name);
      if (filledLicenses.length > 0) {
        addSectionHeading('Licenses');
        filledLicenses.forEach(l => {
          let text = l.name;
          if (l.issuing_org) text += ` — ${l.issuing_org}`;
          const dates = [];
          if (l.issue_date) dates.push(`Issued: ${l.issue_date}`);
          if (l.expiration_date) dates.push(`Expires: ${l.expiration_date}`);
          if (dates.length > 0) text += ` (${dates.join(' | ')})`;
          if (l.license_number) text += ` License #: ${l.license_number}`;
          addParagraph(text);
          if (l.description) addParagraph(l.description);
        });
      }
    },

    work() {
      const filledWork = (data.workExperience || []).filter(w => w.company || w.role);
      if (filledWork.length > 0) {
        addSectionHeading('Work Experience');
        filledWork.forEach(w => {
          const title = w.company + (w.role ? ' — ' + w.role : '');
          addEntryHeader(title, formatDateRange(w.start_date, w.end_date));
          if (w.location) addSubtitle(w.location);
          if (w.description && w.description.trim()) addDescription(w.description);
          (w.achievements || []).forEach(a => {
            if (a && a.trim()) addBullet(a);
          });
          const filledProjects = (w.projects || []).filter(p => p.title || p.description);
          filledProjects.forEach(p => {
            addEntryHeader(p.title || '', formatDateRange(p.start_date, p.end_date));
            if (p.description) addParagraph(p.description);
            if (p.technologies) addSubtitle(`Technologies: ${p.technologies}`);
            if (p.link) addParagraph(p.link);
          });
        });
      }
    },

    education() {
      const filledEdu = (data.education || []).filter(e => e.institution || e.degree);
      if (filledEdu.length > 0) {
        addSectionHeading('Education');
        filledEdu.forEach(e => {
          const degreeField = [e.degree, e.field].filter(Boolean).join(' in ');
          addEntryHeader(degreeField || 'Degree', formatDateRange(e.start_date, e.end_date));
          if (e.institution) addSubtitle(e.institution);
          if (e.gpa) addParagraph(`GPA: ${e.gpa}`);
        });
      }
    },

    certifications() {
      const filledCerts = (data.certifications || []).filter(c => c.name);
      if (filledCerts.length > 0) {
        addSectionHeading('Certifications');
        filledCerts.forEach(c => {
          let text = c.name;
          if (c.issuing_org) text += ` — ${c.issuing_org}`;
          if (c.date) text += ` (${c.date})`;
          addParagraph(text);
        });
      }
    },

    internships() {
      const filledInternships = (data.internships || []).filter(i => i.company || i.role);
      if (filledInternships.length > 0) {
        addSectionHeading('Internships');
        filledInternships.forEach(i => {
          const title = i.company + (i.role ? ' — ' + i.role : '');
          addEntryHeader(title, formatDateRange(i.start_date, i.end_date));
          if (i.description) addParagraph(i.description);
        });
      }
    },

    languages() {
      const filledLangs = (data.languages || []).filter(l => l.language);
      if (filledLangs.length > 0) {
        addSectionHeading('Languages');
        filledLangs.forEach(l => {
          let text = l.language;
          if (l.proficiency) text += ` — ${l.proficiency}`;
          addParagraph(text);
        });
      }
    },
  };

  // Render sections in configured order
  const sectionOrder = data.config?.section_order || DEFAULT_SECTION_ORDER;
  sectionOrder.forEach(key => {
    if (sectionRenderers[key]) {
      sectionRenderers[key]();
    }
  });

  // Custom sections (always last)
  const filledCustom = (data.customSections || []).filter(s => s.title);
  filledCustom.forEach(s => {
    addSectionHeading(s.title);
    (s.items || []).forEach(item => {
      if (item && item.trim()) addBullet(item);
    });
  });

  // Create document with proper margins
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(0.75),
            right: convertInchesToTwip(0.75),
            bottom: convertInchesToTwip(0.75),
            left: convertInchesToTwip(0.75),
          },
        },
      },
      children: children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
