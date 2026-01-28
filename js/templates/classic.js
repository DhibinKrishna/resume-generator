// Classic Professional template render function

import { DEFAULT_SECTION_ORDER } from '../db.js';

export function renderClassic(data, theme) {
  const pi = data.personalInfo || {};
  const summary = data.profileSummary || '';
  const work = data.workExperience || [];
  const edu = data.education || [];
  const skills = data.skills || [];
  const certs = data.certifications || [];
  const licenses = data.licenses || [];
  const internships = data.internships || [];
  const languages = data.languages || [];
  const customSections = data.customSections || [];

  let html = '';

  // Top banner
  html += `<div class="resume-banner">`;
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

  // Section renderers
  const sectionRenderers = {
    summary() {
      let s = '';
      if (summary && summary.trim()) {
        s += sectionTitle('Profile Summary');
        s += `<p class="resume-summary">${fmt(summary)}</p>`;
      }
      return s;
    },

    skills() {
      let s = '';
      const filledSkills = skills.filter(sk => sk.category || (sk.items && sk.items.length > 0));
      if (filledSkills.length > 0) {
        s += sectionTitle('Skills');
        filledSkills.forEach(sk => {
          s += `<div class="resume-skills-category">`;
          s += `<span class="resume-skills-label">${esc(sk.category)}: </span>`;
          if (sk.bulleted && sk.items && sk.items.length > 0) {
            s += `<ul class="resume-skills-bullets">`;
            sk.items.forEach(item => {
              s += `<li>${fmt(item)}</li>`;
            });
            s += `</ul>`;
          } else {
            s += `<span class="resume-skills-items">${(sk.items || []).map(i => fmt(i)).join(', ')}</span>`;
          }
          s += `</div>`;
        });
      }
      return s;
    },

    licenses() {
      let s = '';
      const filledLicenses = licenses.filter(l => l.name);
      if (filledLicenses.length > 0) {
        s += sectionTitle('Licenses');
        filledLicenses.forEach(l => {
          s += `<div class="resume-cert-item">`;
          s += `<strong>${esc(l.name)}</strong>`;
          if (l.issuing_org) s += ` <span class="resume-cert-org">— ${esc(l.issuing_org)}</span>`;
          const dates = [];
          if (l.issue_date) dates.push(`Issued: ${esc(l.issue_date)}`);
          if (l.expiration_date) dates.push(`Expires: ${esc(l.expiration_date)}`);
          if (dates.length > 0) s += ` <span class="resume-cert-org">(${dates.join(' | ')})</span>`;
          if (l.license_number) s += ` <span class="resume-cert-org">License #: ${esc(l.license_number)}</span>`;
          if (l.description) s += `<div class="resume-cert-desc" style="margin-left:0;font-size:0.95em;color:#444;">${fmt(l.description)}</div>`;
          s += `</div>`;
        });
      }
      return s;
    },

    work() {
      let s = '';
      const filledWork = work.filter(w => w.company || w.role);
      if (filledWork.length > 0) {
        s += sectionTitle('Work Experience');
        filledWork.forEach(w => {
          s += `<div class="resume-entry">`;
          s += `<div class="resume-entry-header">`;
          s += `<span class="resume-entry-title">${esc(w.company)}${w.role ? ' — ' + esc(w.role) : ''}</span>`;
          const dateStr = formatDateRange(w.start_date, w.end_date);
          if (dateStr) s += `<span class="resume-entry-date">${dateStr}</span>`;
          s += `</div>`;
          if (w.location) {
            s += `<div class="resume-entry-subtitle">${esc(w.location)}</div>`;
          }
          if (w.description && w.description.trim()) {
            s += `<p class="resume-work-desc">${fmt(w.description)}</p>`;
          }
          if (w.achievements && w.achievements.length > 0) {
            s += `<ul class="resume-bullets">`;
            w.achievements.forEach(a => {
              if (a && a.trim()) s += `<li>${fmt(a)}</li>`;
            });
            s += `</ul>`;
          }
          const filledProjects = (w.projects || []).filter(p => p.title || p.description);
          if (filledProjects.length > 0) {
            filledProjects.forEach(p => {
              s += `<div class="resume-work-project">`;
              s += `<div class="resume-entry-header">`;
              s += `<span class="resume-work-project-title">${esc(p.title)}</span>`;
              const projDate = formatDateRange(p.start_date, p.end_date);
              if (projDate) s += `<span class="resume-entry-date">${projDate}</span>`;
              s += `</div>`;
              if (p.description) {
                s += `<p class="resume-summary">${fmt(p.description)}</p>`;
              }
              if (p.technologies) {
                s += `<div class="resume-project-tech">Technologies: ${esc(p.technologies)}</div>`;
              }
              if (p.link) {
                s += `<div class="resume-project-link"><a href="${esc(p.link)}" target="_blank">${esc(p.link)}</a></div>`;
              }
              s += `</div>`;
            });
          }
          s += `</div>`;
        });
      }
      return s;
    },

    education() {
      let s = '';
      const filledEdu = edu.filter(e => e.institution || e.degree);
      if (filledEdu.length > 0) {
        s += sectionTitle('Education');
        filledEdu.forEach(e => {
          s += `<div class="resume-entry">`;
          s += `<div class="resume-entry-header">`;
          const degreeField = [e.degree, e.field].filter(Boolean).join(' in ');
          s += `<span class="resume-entry-title">${esc(degreeField || 'Degree')}</span>`;
          const dateStr = formatDateRange(e.start_date, e.end_date);
          if (dateStr) s += `<span class="resume-entry-date">${dateStr}</span>`;
          s += `</div>`;
          if (e.institution) {
            s += `<div class="resume-entry-subtitle">${esc(e.institution)}</div>`;
          }
          if (e.gpa) {
            s += `<div class="resume-edu-details">GPA: ${esc(e.gpa)}</div>`;
          }
          s += `</div>`;
        });
      }
      return s;
    },

    certifications() {
      let s = '';
      const filledCerts = certs.filter(c => c.name);
      if (filledCerts.length > 0) {
        s += sectionTitle('Certifications');
        filledCerts.forEach(c => {
          s += `<div class="resume-cert-item">`;
          s += `<strong>${esc(c.name)}</strong>`;
          if (c.issuing_org) s += ` <span class="resume-cert-org">— ${esc(c.issuing_org)}</span>`;
          if (c.date) s += ` <span class="resume-cert-org">(${esc(c.date)})</span>`;
          if (c.credential_id) s += ` <span class="resume-cert-org">ID: ${esc(c.credential_id)}</span>`;
          s += `</div>`;
        });
      }
      return s;
    },

    internships() {
      let s = '';
      const filledInternships = internships.filter(i => i.company || i.role);
      if (filledInternships.length > 0) {
        s += sectionTitle('Internships');
        filledInternships.forEach(i => {
          s += `<div class="resume-entry">`;
          s += `<div class="resume-entry-header">`;
          s += `<span class="resume-entry-title">${esc(i.company)}${i.role ? ' — ' + esc(i.role) : ''}</span>`;
          const dateStr = formatDateRange(i.start_date, i.end_date);
          if (dateStr) s += `<span class="resume-entry-date">${dateStr}</span>`;
          s += `</div>`;
          if (i.description) {
            s += `<p class="resume-internship-desc">${fmt(i.description)}</p>`;
          }
          s += `</div>`;
        });
      }
      return s;
    },

    languages() {
      let s = '';
      const filledLangs = languages.filter(l => l.language);
      if (filledLangs.length > 0) {
        s += sectionTitle('Languages');
        filledLangs.forEach(l => {
          s += `<div class="resume-lang-item">`;
          s += `<span class="resume-lang-name">${esc(l.language)}</span>`;
          if (l.proficiency) s += ` <span class="resume-lang-proficiency">— ${esc(l.proficiency)}</span>`;
          s += `</div>`;
        });
      }
      return s;
    },
  };

  // Render sections in configured order
  const sectionOrder = data.config?.section_order || DEFAULT_SECTION_ORDER;
  sectionOrder.forEach(key => {
    if (sectionRenderers[key]) {
      html += sectionRenderers[key]();
    }
  });

  // Custom Sections (always last)
  const filledCustom = customSections.filter(s => s.title);
  filledCustom.forEach(s => {
    html += sectionTitle(s.title);
    if (s.items && s.items.length > 0) {
      html += `<ul class="resume-bullets">`;
      s.items.forEach(item => {
        if (item && item.trim()) html += `<li>${fmt(item)}</li>`;
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

function fmt(str) {
  if (!str) return '';
  return esc(str).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}
