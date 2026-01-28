// Dynamic form sections - add/remove entries

let entryCounters = {
  work: 0,
  education: 0,
  skill: 0,
  license: 0,
  certification: 0,
  internship: 0,
  language: 0,
  customSection: 0,
};

// ─── Work Experience ────────────────────────────────────────────

export function addWorkEntry(data = {}) {
  const idx = entryCounters.work++;
  const container = document.getElementById('work-entries');
  const block = document.createElement('div');
  block.className = 'entry-block';
  block.dataset.index = idx;

  block.innerHTML = `
    <div class="entry-block-header">
      <span>Work Experience #${idx + 1}</span>
      <div class="entry-header-actions">
        <button class="btn btn-reorder btn-icon" data-action="move-up" title="Move up">↑</button>
        <button class="btn btn-reorder btn-icon" data-action="move-down" title="Move down">↓</button>
        <button class="btn btn-remove" data-action="remove-work" data-index="${idx}">&times; Remove</button>
      </div>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label>Company</label>
        <input type="text" data-section="work" data-index="${idx}" data-field="company" value="${esc(data.company)}" placeholder="Company Name">
      </div>
      <div class="form-field">
        <label>Role</label>
        <input type="text" data-section="work" data-index="${idx}" data-field="role" value="${esc(data.role)}" placeholder="Job Title">
      </div>
    </div>
    <div class="form-row triple">
      <div class="form-field">
        <label>Location</label>
        <input type="text" data-section="work" data-index="${idx}" data-field="location" value="${esc(data.location)}" placeholder="City, State">
      </div>
      <div class="form-field">
        <label>Start Date</label>
        <input type="text" data-section="work" data-index="${idx}" data-field="start_date" value="${esc(data.start_date)}" placeholder="Jan 2020">
      </div>
      <div class="form-field">
        <label>End Date</label>
        <input type="text" data-section="work" data-index="${idx}" data-field="end_date" value="${esc(data.end_date)}" placeholder="Present">
      </div>
    </div>
    <div class="form-row single">
      <div class="form-field">
        <label>Description (optional)</label>
        <textarea data-section="work" data-index="${idx}" data-field="description" placeholder="Brief description of the role or company...">${esc(data.description)}</textarea>
      </div>
    </div>
    <div class="achievements-list" data-work-index="${idx}">
      <label style="font-size:0.8rem;font-weight:500;color:var(--theme-text-light);text-transform:uppercase;letter-spacing:0.3px;">Achievements</label>
    </div>
    <button class="btn btn-add btn-small" data-action="add-achievement" data-work-index="${idx}">+ Add Achievement</button>
    <div class="work-projects-list" data-work-index="${idx}">
      <label style="font-size:0.8rem;font-weight:500;color:var(--theme-text-light);text-transform:uppercase;letter-spacing:0.3px;margin-top:0.75rem;display:block;">Projects</label>
    </div>
    <button class="btn btn-add btn-small" data-action="add-work-project" data-work-index="${idx}">+ Add Project</button>
  `;

  container.appendChild(block);

  // Add existing achievements
  if (data.achievements && data.achievements.length > 0) {
    data.achievements.forEach(a => addAchievement(idx, a));
  }

  // Add existing projects
  if (data.projects && data.projects.length > 0) {
    data.projects.forEach(p => addWorkProject(idx, p));
  }

  return block;
}

export function addAchievement(workIndex, text = '') {
  const container = document.querySelector(`.achievements-list[data-work-index="${workIndex}"]`);
  if (!container) return;

  const item = document.createElement('div');
  item.className = 'achievement-item';
  item.innerHTML = `
    <input type="text" data-section="achievement" data-work-index="${workIndex}" value="${esc(text)}" placeholder="Describe an achievement...">
    <button class="btn btn-remove btn-small" data-action="remove-achievement">&times;</button>
  `;
  container.appendChild(item);

  // Focus the new input
  const input = item.querySelector('input');
  if (input && !text) input.focus();
}

export function addWorkProject(workIndex, data = {}) {
  const container = document.querySelector(`.work-projects-list[data-work-index="${workIndex}"]`);
  if (!container) return;

  const item = document.createElement('div');
  item.className = 'work-project-item';
  item.innerHTML = `
    <div class="work-project-item-header">
      <span class="work-project-label">Project</span>
      <div class="entry-header-actions">
        <button class="btn btn-reorder btn-icon" data-action="move-work-project-up" title="Move up">↑</button>
        <button class="btn btn-reorder btn-icon" data-action="move-work-project-down" title="Move down">↓</button>
        <button class="btn btn-remove btn-small" data-action="remove-work-project">&times;</button>
      </div>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label>Title</label>
        <input type="text" data-section="work-project" data-work-index="${workIndex}" data-field="title" value="${esc(data.title)}" placeholder="Project Name">
      </div>
      <div class="form-field">
        <label>Link</label>
        <input type="text" data-section="work-project" data-work-index="${workIndex}" data-field="link" value="${esc(data.link)}" placeholder="https://github.com/...">
      </div>
    </div>
    <div class="form-row triple">
      <div class="form-field">
        <label>Technologies</label>
        <input type="text" data-section="work-project" data-work-index="${workIndex}" data-field="technologies" value="${esc(data.technologies)}" placeholder="React, Node.js, PostgreSQL">
      </div>
      <div class="form-field">
        <label>Start Date</label>
        <input type="text" data-section="work-project" data-work-index="${workIndex}" data-field="start_date" value="${esc(data.start_date)}" placeholder="Jan 2020">
      </div>
      <div class="form-field">
        <label>End Date</label>
        <input type="text" data-section="work-project" data-work-index="${workIndex}" data-field="end_date" value="${esc(data.end_date)}" placeholder="Jun 2020">
      </div>
    </div>
    <div class="form-row single">
      <div class="form-field">
        <label>Description</label>
        <textarea data-section="work-project" data-work-index="${workIndex}" data-field="description" placeholder="Brief description of the project...">${esc(data.description)}</textarea>
      </div>
    </div>
  `;
  container.appendChild(item);
}

export function removeWorkEntry(index) {
  const container = document.getElementById('work-entries');
  const block = container.querySelector(`.entry-block[data-index="${index}"]`);
  if (block) block.remove();
}

// ─── Education ──────────────────────────────────────────────────

export function addEducationEntry(data = {}) {
  const idx = entryCounters.education++;
  const container = document.getElementById('education-entries');
  const block = document.createElement('div');
  block.className = 'entry-block';
  block.dataset.index = idx;
  block.dataset.section = 'education';

  block.innerHTML = `
    <div class="entry-block-header">
      <span>Education #${idx + 1}</span>
      <div class="entry-header-actions">
        <button class="btn btn-reorder btn-icon" data-action="move-up" title="Move up">↑</button>
        <button class="btn btn-reorder btn-icon" data-action="move-down" title="Move down">↓</button>
        <button class="btn btn-remove" data-action="remove-education" data-index="${idx}">&times; Remove</button>
      </div>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label>Institution</label>
        <input type="text" data-section="education" data-index="${idx}" data-field="institution" value="${esc(data.institution)}" placeholder="University Name">
      </div>
      <div class="form-field">
        <label>Degree</label>
        <input type="text" data-section="education" data-index="${idx}" data-field="degree" value="${esc(data.degree)}" placeholder="Bachelor of Science">
      </div>
    </div>
    <div class="form-row triple">
      <div class="form-field">
        <label>Field of Study</label>
        <input type="text" data-section="education" data-index="${idx}" data-field="field" value="${esc(data.field)}" placeholder="Computer Science">
      </div>
      <div class="form-field">
        <label>Start Date</label>
        <input type="text" data-section="education" data-index="${idx}" data-field="start_date" value="${esc(data.start_date)}" placeholder="Sep 2016">
      </div>
      <div class="form-field">
        <label>End Date</label>
        <input type="text" data-section="education" data-index="${idx}" data-field="end_date" value="${esc(data.end_date)}" placeholder="Jun 2020">
      </div>
    </div>
    <div class="form-row single">
      <div class="form-field">
        <label>GPA (optional)</label>
        <input type="text" data-section="education" data-index="${idx}" data-field="gpa" value="${esc(data.gpa)}" placeholder="3.8/4.0">
      </div>
    </div>
  `;

  container.appendChild(block);
  return block;
}

export function removeEducationEntry(index) {
  const container = document.getElementById('education-entries');
  const block = container.querySelector(`.entry-block[data-index="${index}"]`);
  if (block) block.remove();
}

// ─── Skills ─────────────────────────────────────────────────────

export function addSkillCategory(data = {}) {
  const idx = entryCounters.skill++;
  const container = document.getElementById('skill-entries');
  const block = document.createElement('div');
  block.className = 'entry-block';
  block.dataset.index = idx;
  block.dataset.section = 'skill';

  const bulletedChecked = data.bulleted ? 'checked' : '';

  block.innerHTML = `
    <div class="entry-block-header">
      <span>Skill Category #${idx + 1}</span>
      <div class="entry-header-actions">
        <button class="btn btn-reorder btn-icon" data-action="move-up" title="Move up">↑</button>
        <button class="btn btn-reorder btn-icon" data-action="move-down" title="Move down">↓</button>
        <button class="btn btn-remove" data-action="remove-skill" data-index="${idx}">&times; Remove</button>
      </div>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label>Category Name</label>
        <input type="text" data-section="skill" data-index="${idx}" data-field="category" value="${esc(data.category)}" placeholder="e.g., Programming Languages">
      </div>
      <div class="form-field checkbox-field">
        <label class="checkbox-label">
          <input type="checkbox" data-section="skill" data-index="${idx}" data-field="bulleted" ${bulletedChecked}>
          <span>Show as bullets</span>
        </label>
      </div>
    </div>
    <div class="skill-items" data-skill-index="${idx}"></div>
    <button class="btn btn-add btn-small" data-action="add-skill-item" data-skill-index="${idx}">+ Add Skill</button>
  `;

  container.appendChild(block);

  if (data.items && data.items.length > 0) {
    data.items.forEach(item => addSkillItem(idx, item));
  }

  return block;
}

export function addSkillItem(skillIndex, text = '') {
  const container = document.querySelector(`.skill-items[data-skill-index="${skillIndex}"]`);
  if (!container) return;

  const item = document.createElement('div');
  item.className = 'skill-item-input';
  item.innerHTML = `
    <input type="text" data-section="skill-item" data-skill-index="${skillIndex}" value="${esc(text)}" placeholder="Skill name">
    <button class="btn btn-remove btn-small" data-action="remove-skill-item">&times;</button>
  `;
  container.appendChild(item);

  // Focus the new input
  const input = item.querySelector('input');
  if (input && !text) input.focus();
}

export function removeSkillCategory(index) {
  const container = document.getElementById('skill-entries');
  const block = container.querySelector(`.entry-block[data-index="${index}"]`);
  if (block) block.remove();
}

// ─── Licenses ───────────────────────────────────────────────────

export function addLicenseEntry(data = {}) {
  const idx = entryCounters.license++;
  const container = document.getElementById('license-entries');
  const block = document.createElement('div');
  block.className = 'entry-block';
  block.dataset.index = idx;
  block.dataset.section = 'license';

  block.innerHTML = `
    <div class="entry-block-header">
      <span>License #${idx + 1}</span>
      <div class="entry-header-actions">
        <button class="btn btn-reorder btn-icon" data-action="move-up" title="Move up">↑</button>
        <button class="btn btn-reorder btn-icon" data-action="move-down" title="Move down">↓</button>
        <button class="btn btn-remove" data-action="remove-license" data-index="${idx}">&times; Remove</button>
      </div>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label>License Name</label>
        <input type="text" data-section="license" data-index="${idx}" data-field="name" value="${esc(data.name)}" placeholder="Registered Nurse (RN)">
      </div>
      <div class="form-field">
        <label>Issuing Organization</label>
        <input type="text" data-section="license" data-index="${idx}" data-field="issuing_org" value="${esc(data.issuing_org)}" placeholder="State Board of Nursing">
      </div>
    </div>
    <div class="form-row triple">
      <div class="form-field">
        <label>Issue Date</label>
        <input type="text" data-section="license" data-index="${idx}" data-field="issue_date" value="${esc(data.issue_date)}" placeholder="Jan 2020">
      </div>
      <div class="form-field">
        <label>Expiration Date</label>
        <input type="text" data-section="license" data-index="${idx}" data-field="expiration_date" value="${esc(data.expiration_date)}" placeholder="Jan 2025">
      </div>
      <div class="form-field">
        <label>License Number (optional)</label>
        <input type="text" data-section="license" data-index="${idx}" data-field="license_number" value="${esc(data.license_number)}" placeholder="LIC-123456">
      </div>
    </div>
    <div class="form-row">
      <div class="form-field full-width">
        <label>Description (optional)</label>
        <textarea data-section="license" data-index="${idx}" data-field="description" rows="2" placeholder="Brief description of the license scope or relevance">${esc(data.description)}</textarea>
      </div>
    </div>
  `;

  container.appendChild(block);
  return block;
}

export function removeLicenseEntry(index) {
  const container = document.getElementById('license-entries');
  const block = container.querySelector(`.entry-block[data-index="${index}"]`);
  if (block) block.remove();
}

// ─── Certifications ─────────────────────────────────────────────

export function addCertificationEntry(data = {}) {
  const idx = entryCounters.certification++;
  const container = document.getElementById('certification-entries');
  const block = document.createElement('div');
  block.className = 'entry-block';
  block.dataset.index = idx;
  block.dataset.section = 'certification';

  block.innerHTML = `
    <div class="entry-block-header">
      <span>Certification #${idx + 1}</span>
      <div class="entry-header-actions">
        <button class="btn btn-reorder btn-icon" data-action="move-up" title="Move up">↑</button>
        <button class="btn btn-reorder btn-icon" data-action="move-down" title="Move down">↓</button>
        <button class="btn btn-remove" data-action="remove-certification" data-index="${idx}">&times; Remove</button>
      </div>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label>Certification Name</label>
        <input type="text" data-section="certification" data-index="${idx}" data-field="name" value="${esc(data.name)}" placeholder="AWS Solutions Architect">
      </div>
      <div class="form-field">
        <label>Issuing Organization</label>
        <input type="text" data-section="certification" data-index="${idx}" data-field="issuing_org" value="${esc(data.issuing_org)}" placeholder="Amazon Web Services">
      </div>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label>Date</label>
        <input type="text" data-section="certification" data-index="${idx}" data-field="date" value="${esc(data.date)}" placeholder="Jun 2023">
      </div>
      <div class="form-field">
        <label>Credential ID (optional)</label>
        <input type="text" data-section="certification" data-index="${idx}" data-field="credential_id" value="${esc(data.credential_id)}" placeholder="ABC-123-XYZ">
      </div>
    </div>
  `;

  container.appendChild(block);
  return block;
}

export function removeCertificationEntry(index) {
  const container = document.getElementById('certification-entries');
  const block = container.querySelector(`.entry-block[data-index="${index}"]`);
  if (block) block.remove();
}

// ─── Internships ────────────────────────────────────────────────

export function addInternshipEntry(data = {}) {
  const idx = entryCounters.internship++;
  const container = document.getElementById('internship-entries');
  const block = document.createElement('div');
  block.className = 'entry-block';
  block.dataset.index = idx;
  block.dataset.section = 'internship';

  block.innerHTML = `
    <div class="entry-block-header">
      <span>Internship #${idx + 1}</span>
      <div class="entry-header-actions">
        <button class="btn btn-reorder btn-icon" data-action="move-up" title="Move up">↑</button>
        <button class="btn btn-reorder btn-icon" data-action="move-down" title="Move down">↓</button>
        <button class="btn btn-remove" data-action="remove-internship" data-index="${idx}">&times; Remove</button>
      </div>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label>Company</label>
        <input type="text" data-section="internship" data-index="${idx}" data-field="company" value="${esc(data.company)}" placeholder="Company Name">
      </div>
      <div class="form-field">
        <label>Role</label>
        <input type="text" data-section="internship" data-index="${idx}" data-field="role" value="${esc(data.role)}" placeholder="Software Engineering Intern">
      </div>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label>Start Date</label>
        <input type="text" data-section="internship" data-index="${idx}" data-field="start_date" value="${esc(data.start_date)}" placeholder="Jun 2019">
      </div>
      <div class="form-field">
        <label>End Date</label>
        <input type="text" data-section="internship" data-index="${idx}" data-field="end_date" value="${esc(data.end_date)}" placeholder="Aug 2019">
      </div>
    </div>
    <div class="form-row single">
      <div class="form-field">
        <label>Description</label>
        <textarea data-section="internship" data-index="${idx}" data-field="description" placeholder="Describe your responsibilities and achievements...">${esc(data.description)}</textarea>
      </div>
    </div>
  `;

  container.appendChild(block);
  return block;
}

export function removeInternshipEntry(index) {
  const container = document.getElementById('internship-entries');
  const block = container.querySelector(`.entry-block[data-index="${index}"]`);
  if (block) block.remove();
}

// ─── Languages ──────────────────────────────────────────────────

export function addLanguageEntry(data = {}) {
  const idx = entryCounters.language++;
  const container = document.getElementById('language-entries');
  const block = document.createElement('div');
  block.className = 'entry-block';
  block.dataset.index = idx;
  block.dataset.section = 'language';

  block.innerHTML = `
    <div class="entry-block-header">
      <span>Language #${idx + 1}</span>
      <div class="entry-header-actions">
        <button class="btn btn-reorder btn-icon" data-action="move-up" title="Move up">↑</button>
        <button class="btn btn-reorder btn-icon" data-action="move-down" title="Move down">↓</button>
        <button class="btn btn-remove" data-action="remove-language" data-index="${idx}">&times; Remove</button>
      </div>
    </div>
    <div class="form-row">
      <div class="form-field">
        <label>Language</label>
        <input type="text" data-section="language" data-index="${idx}" data-field="language" value="${esc(data.language)}" placeholder="English">
      </div>
      <div class="form-field">
        <label>Proficiency</label>
        <select data-section="language" data-index="${idx}" data-field="proficiency">
          <option value="" ${!data.proficiency ? 'selected' : ''}>Select proficiency</option>
          <option value="Native" ${data.proficiency === 'Native' ? 'selected' : ''}>Native</option>
          <option value="Fluent" ${data.proficiency === 'Fluent' ? 'selected' : ''}>Fluent</option>
          <option value="Advanced" ${data.proficiency === 'Advanced' ? 'selected' : ''}>Advanced</option>
          <option value="Intermediate" ${data.proficiency === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
          <option value="Beginner" ${data.proficiency === 'Beginner' ? 'selected' : ''}>Beginner</option>
        </select>
      </div>
    </div>
  `;

  container.appendChild(block);
  return block;
}

export function removeLanguageEntry(index) {
  const container = document.getElementById('language-entries');
  const block = container.querySelector(`.entry-block[data-index="${index}"]`);
  if (block) block.remove();
}

// ─── Custom Sections ────────────────────────────────────────────

export function addCustomSection(data = {}) {
  const idx = entryCounters.customSection++;
  const container = document.getElementById('custom-section-entries');
  const block = document.createElement('div');
  block.className = 'entry-block';
  block.dataset.index = idx;
  block.dataset.section = 'custom-section';

  block.innerHTML = `
    <div class="entry-block-header">
      <span>Custom Section #${idx + 1}</span>
      <div class="entry-header-actions">
        <button class="btn btn-reorder btn-icon" data-action="move-up" title="Move up">↑</button>
        <button class="btn btn-reorder btn-icon" data-action="move-down" title="Move down">↓</button>
        <button class="btn btn-remove" data-action="remove-custom-section" data-index="${idx}">&times; Remove</button>
      </div>
    </div>
    <div class="form-row single">
      <div class="form-field">
        <label>Section Title</label>
        <input type="text" data-section="custom-section" data-index="${idx}" data-field="title" value="${esc(data.title)}" placeholder="Section Title">
      </div>
    </div>
    <div class="achievements-list" data-custom-index="${idx}">
      <label style="font-size:0.8rem;font-weight:500;color:var(--theme-text-light);text-transform:uppercase;letter-spacing:0.3px;">Items</label>
    </div>
    <button class="btn btn-add btn-small" data-action="add-custom-item" data-custom-index="${idx}">+ Add Item</button>
  `;

  container.appendChild(block);

  if (data.items && data.items.length > 0) {
    data.items.forEach(item => addCustomItem(idx, item));
  }

  return block;
}

export function addCustomItem(customIndex, text = '') {
  const container = document.querySelector(`.achievements-list[data-custom-index="${customIndex}"]`);
  if (!container) return;

  const item = document.createElement('div');
  item.className = 'achievement-item';
  item.innerHTML = `
    <input type="text" data-section="custom-item" data-custom-index="${customIndex}" value="${esc(text)}" placeholder="Item content...">
    <button class="btn btn-remove btn-small" data-action="remove-custom-item">&times;</button>
  `;
  container.appendChild(item);

  // Focus the new input
  const input = item.querySelector('input');
  if (input && !text) input.focus();
}

export function removeCustomSection(index) {
  const container = document.getElementById('custom-section-entries');
  const block = container.querySelector(`.entry-block[data-index="${index}"]`);
  if (block) block.remove();
}

// ─── Data collection from form ──────────────────────────────────

export function collectPersonalInfo() {
  return {
    full_name: val('#pi-fullname'),
    job_title: val('#pi-jobtitle'),
    email: val('#pi-email'),
    phone: val('#pi-phone'),
    location: val('#pi-location'),
    linkedin: val('#pi-linkedin'),
    portfolio: val('#pi-portfolio'),
  };
}

export function collectProfileSummary() {
  return document.getElementById('profile-summary')?.value || '';
}

export function collectWorkExperience() {
  const entries = [];
  const blocks = document.querySelectorAll('#work-entries .entry-block');
  blocks.forEach(block => {
    const idx = block.dataset.index;
    const achievements = [];
    block.querySelectorAll(`input[data-section="achievement"][data-work-index="${idx}"]`).forEach(input => {
      if (input.value.trim()) achievements.push(input.value.trim());
    });
    const projects = [];
    block.querySelectorAll(`.work-project-item`).forEach(projItem => {
      projects.push({
        title: valIn(projItem, '[data-field="title"]'),
        link: valIn(projItem, '[data-field="link"]'),
        technologies: valIn(projItem, '[data-field="technologies"]'),
        start_date: valIn(projItem, '[data-field="start_date"]'),
        end_date: valIn(projItem, '[data-field="end_date"]'),
        description: valIn(projItem, 'textarea[data-field="description"]'),
      });
    });
    entries.push({
      company: valIn(block, '[data-field="company"]'),
      role: valIn(block, '[data-field="role"]'),
      location: valIn(block, '[data-field="location"]'),
      start_date: valIn(block, '[data-field="start_date"]'),
      end_date: valIn(block, '[data-field="end_date"]'),
      description: valIn(block, 'textarea[data-section="work"][data-field="description"]'),
      achievements,
      projects,
    });
  });
  return entries;
}

export function collectEducation() {
  const entries = [];
  document.querySelectorAll('#education-entries .entry-block').forEach(block => {
    entries.push({
      institution: valIn(block, '[data-field="institution"]'),
      degree: valIn(block, '[data-field="degree"]'),
      field: valIn(block, '[data-field="field"]'),
      start_date: valIn(block, '[data-field="start_date"]'),
      end_date: valIn(block, '[data-field="end_date"]'),
      gpa: valIn(block, '[data-field="gpa"]'),
    });
  });
  return entries;
}

export function collectSkills() {
  const categories = [];
  document.querySelectorAll('#skill-entries .entry-block').forEach(block => {
    const idx = block.dataset.index;
    const items = [];
    block.querySelectorAll(`input[data-section="skill-item"][data-skill-index="${idx}"]`).forEach(input => {
      if (input.value.trim()) items.push(input.value.trim());
    });
    const bulletedCheckbox = block.querySelector(`input[data-field="bulleted"][data-index="${idx}"]`);
    categories.push({
      category: valIn(block, '[data-field="category"]'),
      items,
      bulleted: bulletedCheckbox ? bulletedCheckbox.checked : false,
    });
  });
  return categories;
}

export function collectLicenses() {
  const entries = [];
  document.querySelectorAll('#license-entries .entry-block').forEach(block => {
    entries.push({
      name: valIn(block, '[data-field="name"]'),
      issuing_org: valIn(block, '[data-field="issuing_org"]'),
      issue_date: valIn(block, '[data-field="issue_date"]'),
      expiration_date: valIn(block, '[data-field="expiration_date"]'),
      license_number: valIn(block, '[data-field="license_number"]'),
      description: valIn(block, '[data-field="description"]'),
    });
  });
  return entries;
}

export function collectCertifications() {
  const entries = [];
  document.querySelectorAll('#certification-entries .entry-block').forEach(block => {
    entries.push({
      name: valIn(block, '[data-field="name"]'),
      issuing_org: valIn(block, '[data-field="issuing_org"]'),
      date: valIn(block, '[data-field="date"]'),
      credential_id: valIn(block, '[data-field="credential_id"]'),
    });
  });
  return entries;
}

export function collectInternships() {
  const entries = [];
  document.querySelectorAll('#internship-entries .entry-block').forEach(block => {
    entries.push({
      company: valIn(block, '[data-field="company"]'),
      role: valIn(block, '[data-field="role"]'),
      start_date: valIn(block, '[data-field="start_date"]'),
      end_date: valIn(block, '[data-field="end_date"]'),
      description: valIn(block, 'textarea[data-field="description"]'),
    });
  });
  return entries;
}

export function collectLanguages() {
  const entries = [];
  document.querySelectorAll('#language-entries .entry-block').forEach(block => {
    entries.push({
      language: valIn(block, '[data-field="language"]'),
      proficiency: valIn(block, '[data-field="proficiency"]'),
    });
  });
  return entries;
}

export function collectCustomSections() {
  const sections = [];
  document.querySelectorAll('#custom-section-entries .entry-block').forEach(block => {
    const idx = block.dataset.index;
    const items = [];
    block.querySelectorAll(`input[data-section="custom-item"][data-custom-index="${idx}"]`).forEach(input => {
      if (input.value.trim()) items.push(input.value.trim());
    });
    sections.push({
      title: valIn(block, '[data-field="title"]'),
      items,
    });
  });
  return sections;
}

// ─── Helpers ────────────────────────────────────────────────────

function val(selector) {
  const el = document.querySelector(selector);
  return el ? el.value.trim() : '';
}

function valIn(parent, selector) {
  const el = parent.querySelector(selector);
  return el ? el.value.trim() : '';
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function resetCounters() {
  for (const key of Object.keys(entryCounters)) {
    entryCounters[key] = 0;
  }
}
