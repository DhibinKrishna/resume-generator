// DOCX export using docx.js

export async function downloadDOCX(data, filename = 'resume.docx') {
  if (typeof docx === 'undefined') {
    alert('DOCX library not loaded. Please check your internet connection and refresh.');
    return;
  }

  const {
    Document, Packer, Paragraph, TextRun, HeadingLevel,
    AlignmentType, BorderStyle, TabStopPosition, TabStopType,
  } = docx;

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
        font: 'Calibri',
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
          font: 'Calibri',
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
          font: 'Calibri',
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
          font: 'Calibri',
        }),
      ],
      spacing: { before: 300, after: 100 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 1, color: themeColor },
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
        font: 'Calibri',
      }),
    ];
    if (dateStr) {
      runs.push(new TextRun({
        text: `\t${dateStr}`,
        size: 18,
        color: '666666',
        font: 'Calibri',
      }));
    }
    children.push(new Paragraph({
      children: runs,
      tabStops: [{
        type: TabStopType.RIGHT,
        position: TabStopPosition.MAX,
      }],
      spacing: { before: 100, after: 50 },
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
          font: 'Calibri',
        }),
      ],
      spacing: { after: 50 },
    }));
  }

  // Helper: bullet
  function addBullet(text) {
    children.push(new Paragraph({
      children: [
        new TextRun({
          text: text,
          size: 20,
          font: 'Calibri',
        }),
      ],
      bullet: { level: 0 },
      spacing: { after: 30 },
    }));
  }

  // Helper: plain paragraph
  function addParagraph(text) {
    children.push(new Paragraph({
      children: [
        new TextRun({
          text: text,
          size: 20,
          font: 'Calibri',
        }),
      ],
      spacing: { after: 100 },
    }));
  }

  function formatDateRange(start, end) {
    if (!start && !end) return '';
    if (start && end) return `${start} — ${end}`;
    if (start) return `${start} — Present`;
    return end;
  }

  // Profile Summary
  if (summary && summary.trim()) {
    addSectionHeading('Profile Summary');
    addParagraph(summary);
  }

  // Work Experience
  const filledWork = (data.workExperience || []).filter(w => w.company || w.role);
  if (filledWork.length > 0) {
    addSectionHeading('Work Experience');
    filledWork.forEach(w => {
      const title = w.company + (w.role ? ' — ' + w.role : '');
      addEntryHeader(title, formatDateRange(w.start_date, w.end_date));
      if (w.location) addSubtitle(w.location);
      (w.achievements || []).forEach(a => {
        if (a && a.trim()) addBullet(a);
      });
    });
  }

  // Education
  const filledEdu = (data.education || []).filter(e => e.institution || e.degree);
  if (filledEdu.length > 0) {
    addSectionHeading('Education');
    filledEdu.forEach(e => {
      addEntryHeader(e.institution || '', formatDateRange(e.start_date, e.end_date));
      const degreeField = [e.degree, e.field].filter(Boolean).join(' in ');
      if (degreeField) addSubtitle(degreeField);
      if (e.gpa) addParagraph(`GPA: ${e.gpa}`);
    });
  }

  // Projects
  const filledProjects = (data.projects || []).filter(p => p.title || p.description);
  if (filledProjects.length > 0) {
    addSectionHeading('Projects');
    filledProjects.forEach(p => {
      addEntryHeader(p.title || '', '');
      if (p.description) addParagraph(p.description);
      if (p.technologies) addSubtitle(`Technologies: ${p.technologies}`);
      if (p.link) addParagraph(p.link);
    });
  }

  // Skills
  const filledSkills = (data.skills || []).filter(s => s.category || (s.items && s.items.length > 0));
  if (filledSkills.length > 0) {
    addSectionHeading('Skills');
    filledSkills.forEach(s => {
      children.push(new Paragraph({
        children: [
          new TextRun({
            text: (s.category || '') + ': ',
            bold: true,
            size: 20,
            font: 'Calibri',
          }),
          new TextRun({
            text: (s.items || []).join(', '),
            size: 20,
            font: 'Calibri',
          }),
        ],
        spacing: { after: 50 },
      }));
    });
  }

  // Certifications
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

  // Internships
  const filledInternships = (data.internships || []).filter(i => i.company || i.role);
  if (filledInternships.length > 0) {
    addSectionHeading('Internships');
    filledInternships.forEach(i => {
      const title = i.company + (i.role ? ' — ' + i.role : '');
      addEntryHeader(title, formatDateRange(i.start_date, i.end_date));
      if (i.description) addParagraph(i.description);
    });
  }

  // Languages
  const filledLangs = (data.languages || []).filter(l => l.language);
  if (filledLangs.length > 0) {
    addSectionHeading('Languages');
    filledLangs.forEach(l => {
      let text = l.language;
      if (l.proficiency) text += ` — ${l.proficiency}`;
      addParagraph(text);
    });
  }

  // Custom sections
  const filledCustom = (data.customSections || []).filter(s => s.title);
  filledCustom.forEach(s => {
    addSectionHeading(s.title);
    (s.items || []).forEach(item => {
      if (item && item.trim()) addBullet(item);
    });
  });

  // Create document
  const doc = new Document({
    sections: [{
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
