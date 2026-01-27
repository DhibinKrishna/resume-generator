// Classic Professional template render function

export function renderClassic(data, theme) {
  const pi = data.personalInfo || {};
  const summary = data.profileSummary || '';
  const work = data.workExperience || [];
  const edu = data.education || [];
  const projects = data.projects || [];
  const skills = data.skills || [];
  const certs = data.certifications || [];
  const internships = data.internships || [];
  const languages = data.languages || [];
  const customSections = data.customSections || [];

  let html = '';

  // Top banner
  html += `<div class="resume-banner" style="background:${esc(theme)}">`;
  html += `<div class="name">${esc(pi.full_name || 'Your Name')}</div>`;
  if (pi.job_title) {
    html += `<div class="job-title">${esc(pi.job_title)}</div>`;
  }
  html += `</div>`;

  // Contact bar
  const contactItems = [];
  if (pi.email) contactItems.push(esc(pi.email));
  if (pi.phone) contactItems.push(esc(pi.phone));
  if (pi.location) contactItems.push(esc(pi.location));
  if (pi.linkedin) contactItems.push(esc(pi.linkedin));
  if (pi.portfolio) contactItems.push(esc(pi.portfolio));

  if (contactItems.length > 0) {
    html += `<div class="resume-contact">`;
    html += contactItems.map(item => `<span>${item}</span>`).join('');
    html += `</div>`;
  }

  // Body with left accent stripe
  html += `<div class="resume-body">`;

  // Profile Summary
  if (summary && summary.trim()) {
    html += sectionTitle('Profile Summary');
    html += `<p class="resume-summary">${esc(summary)}</p>`;
  }

  // Work Experience
  const filledWork = work.filter(w => w.company || w.role);
  if (filledWork.length > 0) {
    html += sectionTitle('Work Experience');
    filledWork.forEach(w => {
      html += `<div class="resume-entry">`;
      html += `<div class="resume-entry-header">`;
      html += `<span class="resume-entry-title">${esc(w.company)}${w.role ? ' — ' + esc(w.role) : ''}</span>`;
      const dateStr = formatDateRange(w.start_date, w.end_date);
      if (dateStr) html += `<span class="resume-entry-date">${dateStr}</span>`;
      html += `</div>`;
      if (w.location) {
        html += `<div class="resume-entry-subtitle">${esc(w.location)}</div>`;
      }
      if (w.achievements && w.achievements.length > 0) {
        html += `<ul class="resume-bullets">`;
        w.achievements.forEach(a => {
          if (a && a.trim()) html += `<li>${esc(a)}</li>`;
        });
        html += `</ul>`;
      }
      html += `</div>`;
    });
  }

  // Education
  const filledEdu = edu.filter(e => e.institution || e.degree);
  if (filledEdu.length > 0) {
    html += sectionTitle('Education');
    filledEdu.forEach(e => {
      html += `<div class="resume-entry">`;
      html += `<div class="resume-entry-header">`;
      html += `<span class="resume-entry-title">${esc(e.institution)}</span>`;
      const dateStr = formatDateRange(e.start_date, e.end_date);
      if (dateStr) html += `<span class="resume-entry-date">${dateStr}</span>`;
      html += `</div>`;
      const degreeField = [e.degree, e.field].filter(Boolean).join(' in ');
      if (degreeField) {
        html += `<div class="resume-entry-subtitle">${esc(degreeField)}</div>`;
      }
      if (e.gpa) {
        html += `<div class="resume-edu-details">GPA: ${esc(e.gpa)}</div>`;
      }
      html += `</div>`;
    });
  }

  // Projects
  const filledProjects = projects.filter(p => p.title || p.description);
  if (filledProjects.length > 0) {
    html += sectionTitle('Projects');
    filledProjects.forEach(p => {
      html += `<div class="resume-entry">`;
      html += `<div class="resume-entry-header">`;
      html += `<span class="resume-entry-title">${esc(p.title)}</span>`;
      html += `</div>`;
      if (p.description) {
        html += `<p class="resume-summary">${esc(p.description)}</p>`;
      }
      if (p.technologies) {
        html += `<div class="resume-project-tech">Technologies: ${esc(p.technologies)}</div>`;
      }
      if (p.link) {
        html += `<div class="resume-project-link"><a href="${esc(p.link)}" target="_blank">${esc(p.link)}</a></div>`;
      }
      html += `</div>`;
    });
  }

  // Skills
  const filledSkills = skills.filter(s => s.category || (s.items && s.items.length > 0));
  if (filledSkills.length > 0) {
    html += sectionTitle('Skills');
    filledSkills.forEach(s => {
      html += `<div class="resume-skills-category">`;
      html += `<span class="resume-skills-label">${esc(s.category)}: </span>`;
      html += `<span class="resume-skills-items">${esc((s.items || []).join(', '))}</span>`;
      html += `</div>`;
    });
  }

  // Certifications
  const filledCerts = certs.filter(c => c.name);
  if (filledCerts.length > 0) {
    html += sectionTitle('Certifications');
    filledCerts.forEach(c => {
      html += `<div class="resume-cert-item">`;
      html += `<strong>${esc(c.name)}</strong>`;
      if (c.issuing_org) html += ` <span class="resume-cert-org">— ${esc(c.issuing_org)}</span>`;
      if (c.date) html += ` <span class="resume-cert-org">(${esc(c.date)})</span>`;
      if (c.credential_id) html += ` <span class="resume-cert-org">ID: ${esc(c.credential_id)}</span>`;
      html += `</div>`;
    });
  }

  // Internships
  const filledInternships = internships.filter(i => i.company || i.role);
  if (filledInternships.length > 0) {
    html += sectionTitle('Internships');
    filledInternships.forEach(i => {
      html += `<div class="resume-entry">`;
      html += `<div class="resume-entry-header">`;
      html += `<span class="resume-entry-title">${esc(i.company)}${i.role ? ' — ' + esc(i.role) : ''}</span>`;
      const dateStr = formatDateRange(i.start_date, i.end_date);
      if (dateStr) html += `<span class="resume-entry-date">${dateStr}</span>`;
      html += `</div>`;
      if (i.description) {
        html += `<p class="resume-internship-desc">${esc(i.description)}</p>`;
      }
      html += `</div>`;
    });
  }

  // Languages
  const filledLangs = languages.filter(l => l.language);
  if (filledLangs.length > 0) {
    html += sectionTitle('Languages');
    filledLangs.forEach(l => {
      html += `<div class="resume-lang-item">`;
      html += `<strong>${esc(l.language)}</strong>`;
      if (l.proficiency) html += ` <span class="resume-lang-proficiency">— ${esc(l.proficiency)}</span>`;
      html += `</div>`;
    });
  }

  // Custom Sections
  const filledCustom = customSections.filter(s => s.title);
  filledCustom.forEach(s => {
    html += sectionTitle(s.title);
    if (s.items && s.items.length > 0) {
      html += `<ul class="resume-bullets">`;
      s.items.forEach(item => {
        if (item && item.trim()) html += `<li>${esc(item)}</li>`;
      });
      html += `</ul>`;
    }
  });

  html += `</div>`; // end resume-body

  return `<div class="resume-page">${html}</div>`;
}

// ─── Helpers ────────────────────────────────────────────────────

function sectionTitle(title) {
  return `<h3 class="resume-section-title">${esc(title)}</h3><hr class="resume-section-divider">`;
}

function formatDateRange(start, end) {
  if (!start && !end) return '';
  if (start && end) return `${start} — ${end}`;
  if (start) return `${start} — Present`;
  return end;
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
