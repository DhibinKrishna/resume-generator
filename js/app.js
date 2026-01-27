// Main entry - initializes DB, binds events, manages state

import {
  initDB, getOrCreateResume, updateResumeConfig,
  savePersonalInfo, saveProfileSummary, saveWorkExperience,
  saveEducation, saveProjects, saveSkills, saveCertifications,
  saveInternships, saveLanguages, saveCustomSections,
  loadResume,
} from './db.js';

import {
  addWorkEntry, addAchievement, removeWorkEntry,
  addEducationEntry, removeEducationEntry,
  addProjectEntry, removeProjectEntry,
  addSkillCategory, addSkillItem, removeSkillCategory,
  addCertificationEntry, removeCertificationEntry,
  addInternshipEntry, removeInternshipEntry,
  addLanguageEntry, removeLanguageEntry,
  addCustomSection, addCustomItem, removeCustomSection,
  collectPersonalInfo, collectProfileSummary, collectWorkExperience,
  collectEducation, collectProjects, collectSkills,
  collectCertifications, collectInternships, collectLanguages,
  collectCustomSections, resetCounters,
} from './form.js';

let resumeId = null;
let currentTheme = '#5B7B7A';
let currentStyle = 'classic';
let saveTimeout = null;

// ─── Initialize ─────────────────────────────────────────────────

async function init() {
  try {
    await initDB();
    resumeId = await getOrCreateResume();

    // Load existing data
    const data = loadResume(resumeId);
    if (data) {
      populateForm(data);
    }

    bindEvents();
    hideLoading();
  } catch (err) {
    console.error('Failed to initialize:', err);
    document.getElementById('loading').innerHTML =
      '<p style="color:#c0392b;">Failed to initialize database. Please try refreshing.</p>';
  }
}

function hideLoading() {
  document.getElementById('loading').classList.add('hidden');
}

// ─── Populate form from saved data ──────────────────────────────

function populateForm(data) {
  // Config
  if (data.config) {
    currentStyle = data.config.style || 'classic';
    currentTheme = data.config.theme || '#5B7B7A';
    document.getElementById('style-select').value = currentStyle;
    setActiveTheme(currentTheme);
    applyThemeColor(currentTheme);
  }

  // Personal info
  if (data.personalInfo) {
    const pi = data.personalInfo;
    setVal('#pi-fullname', pi.full_name);
    setVal('#pi-jobtitle', pi.job_title);
    setVal('#pi-email', pi.email);
    setVal('#pi-phone', pi.phone);
    setVal('#pi-location', pi.location);
    setVal('#pi-linkedin', pi.linkedin);
    setVal('#pi-portfolio', pi.portfolio);
  }

  // Profile summary
  if (data.profileSummary) {
    setVal('#profile-summary', data.profileSummary);
  }

  // Work experience
  resetCounters();
  if (data.workExperience && data.workExperience.length > 0) {
    data.workExperience.forEach(entry => addWorkEntry(entry));
  }

  // Education
  if (data.education && data.education.length > 0) {
    data.education.forEach(entry => addEducationEntry(entry));
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    data.projects.forEach(entry => addProjectEntry(entry));
  }

  // Skills
  if (data.skills && data.skills.length > 0) {
    data.skills.forEach(entry => addSkillCategory(entry));
  }

  // Certifications
  if (data.certifications && data.certifications.length > 0) {
    data.certifications.forEach(entry => addCertificationEntry(entry));
  }

  // Internships
  if (data.internships && data.internships.length > 0) {
    data.internships.forEach(entry => addInternshipEntry(entry));
  }

  // Languages
  if (data.languages && data.languages.length > 0) {
    data.languages.forEach(entry => addLanguageEntry(entry));
  }

  // Custom sections
  if (data.customSections && data.customSections.length > 0) {
    data.customSections.forEach(entry => addCustomSection(entry));
  }
}

function setVal(selector, value) {
  const el = document.querySelector(selector);
  if (el && value) el.value = value;
}

// ─── Theme management ───────────────────────────────────────────

function setActiveTheme(color) {
  const isPreset = [...document.querySelectorAll('.theme-swatch')].some(s => s.dataset.color === color);
  document.querySelectorAll('.theme-swatch').forEach(swatch => {
    swatch.classList.toggle('active', swatch.dataset.color === color);
  });
  // Sync color picker and hex input
  const picker = document.getElementById('theme-color-picker');
  const hexInput = document.getElementById('theme-hex-input');
  if (picker) picker.value = color;
  if (hexInput) hexInput.value = color.replace('#', '').toUpperCase();
}

function applyThemeColor(color) {
  document.documentElement.style.setProperty('--theme-primary', color);
  // Derive lighter and darker shades
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  const lighter = `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)})`;
  const darker = `rgb(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)})`;
  document.documentElement.style.setProperty('--theme-primary-light', lighter);
  document.documentElement.style.setProperty('--theme-primary-dark', darker);
}

// ─── Event binding ──────────────────────────────────────────────

function bindEvents() {
  // Theme swatches
  document.getElementById('theme-swatches').addEventListener('click', (e) => {
    const swatch = e.target.closest('.theme-swatch');
    if (!swatch) return;
    currentTheme = swatch.dataset.color;
    setActiveTheme(currentTheme);
    applyThemeColor(currentTheme);
    updateResumeConfig(resumeId, currentStyle, currentTheme);
  });

  // Color picker
  document.getElementById('theme-color-picker').addEventListener('input', (e) => {
    currentTheme = e.target.value;
    setActiveTheme(currentTheme);
    applyThemeColor(currentTheme);
  });
  document.getElementById('theme-color-picker').addEventListener('change', (e) => {
    currentTheme = e.target.value;
    setActiveTheme(currentTheme);
    applyThemeColor(currentTheme);
    updateResumeConfig(resumeId, currentStyle, currentTheme);
  });

  // Hex text input
  const hexInput = document.getElementById('theme-hex-input');
  hexInput.addEventListener('input', (e) => {
    let v = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
    e.target.value = v.toUpperCase();
    if (v.length === 6) {
      currentTheme = '#' + v;
      setActiveTheme(currentTheme);
      applyThemeColor(currentTheme);
    }
  });
  hexInput.addEventListener('change', () => {
    if (/^[0-9a-fA-F]{6}$/.test(hexInput.value)) {
      currentTheme = '#' + hexInput.value;
      updateResumeConfig(resumeId, currentStyle, currentTheme);
    }
  });

  // Style selector
  document.getElementById('style-select').addEventListener('change', (e) => {
    currentStyle = e.target.value;
    updateResumeConfig(resumeId, currentStyle, currentTheme);
  });

  // Add buttons
  document.getElementById('btn-add-work').addEventListener('click', () => addWorkEntry());
  document.getElementById('btn-add-education').addEventListener('click', () => addEducationEntry());
  document.getElementById('btn-add-project').addEventListener('click', () => addProjectEntry());
  document.getElementById('btn-add-skill').addEventListener('click', () => addSkillCategory());
  document.getElementById('btn-add-certification').addEventListener('click', () => addCertificationEntry());
  document.getElementById('btn-add-internship').addEventListener('click', () => addInternshipEntry());
  document.getElementById('btn-add-language').addEventListener('click', () => addLanguageEntry());
  document.getElementById('btn-add-custom-section').addEventListener('click', () => addCustomSection());

  // Delegated click for dynamic buttons (remove, add-achievement, etc.)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    switch (action) {
      case 'remove-work':
        removeWorkEntry(btn.dataset.index);
        debounceSave();
        break;
      case 'add-achievement':
        addAchievement(btn.dataset.workIndex);
        break;
      case 'remove-achievement':
        btn.closest('.achievement-item').remove();
        debounceSave();
        break;
      case 'remove-education':
        removeEducationEntry(btn.dataset.index);
        debounceSave();
        break;
      case 'remove-project':
        removeProjectEntry(btn.dataset.index);
        debounceSave();
        break;
      case 'remove-skill':
        removeSkillCategory(btn.dataset.index);
        debounceSave();
        break;
      case 'add-skill-item':
        addSkillItem(btn.dataset.skillIndex);
        break;
      case 'remove-skill-item':
        btn.closest('.skill-item-input').remove();
        debounceSave();
        break;
      case 'remove-certification':
        removeCertificationEntry(btn.dataset.index);
        debounceSave();
        break;
      case 'remove-internship':
        removeInternshipEntry(btn.dataset.index);
        debounceSave();
        break;
      case 'remove-language':
        removeLanguageEntry(btn.dataset.index);
        debounceSave();
        break;
      case 'remove-custom-section':
        removeCustomSection(btn.dataset.index);
        debounceSave();
        break;
      case 'add-custom-item':
        addCustomItem(btn.dataset.customIndex);
        break;
      case 'remove-custom-item':
        btn.closest('.achievement-item').remove();
        debounceSave();
        break;
    }
  });

  // Auto-save on blur for all form inputs
  document.addEventListener('focusout', (e) => {
    if (e.target.matches('input, textarea, select')) {
      debounceSave();
    }
  });

  // Save draft button
  document.getElementById('btn-save-draft').addEventListener('click', async () => {
    await saveAll();
    showToast('Draft saved successfully');
  });

  // Generate resume button
  document.getElementById('btn-generate').addEventListener('click', async () => {
    await saveAll();
    window.location.href = `preview.html?id=${resumeId}`;
  });
}

// ─── Save all data ──────────────────────────────────────────────

function debounceSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => saveAll(), 500);
}

async function saveAll() {
  if (!resumeId) return;

  try {
    await updateResumeConfig(resumeId, currentStyle, currentTheme);
    await savePersonalInfo(resumeId, collectPersonalInfo());
    await saveProfileSummary(resumeId, collectProfileSummary());
    await saveWorkExperience(resumeId, collectWorkExperience());
    await saveEducation(resumeId, collectEducation());
    await saveProjects(resumeId, collectProjects());
    await saveSkills(resumeId, collectSkills());
    await saveCertifications(resumeId, collectCertifications());
    await saveInternships(resumeId, collectInternships());
    await saveLanguages(resumeId, collectLanguages());
    await saveCustomSections(resumeId, collectCustomSections());
  } catch (err) {
    console.error('Save failed:', err);
  }
}

// ─── Toast notification ─────────────────────────────────────────

function showToast(message) {
  let toast = document.getElementById('save-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'save-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.remove('toast-hidden');
  toast.classList.add('toast-visible');

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('toast-visible');
    toast.classList.add('toast-hidden');
  }, 2000);
}

// ─── Start ──────────────────────────────────────────────────────

init();
