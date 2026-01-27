// Main entry - initializes DB, binds events, manages state

import {
  initDB, getOrCreateResume, updateResumeConfig,
  savePersonalInfo, saveProfileSummary, saveWorkExperience,
  saveEducation, saveProjects, saveSkills, saveCertifications,
  saveInternships, saveLanguages, saveCustomSections,
  loadResume, clearAllData, exportDraft, importDraft,
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
  // Config - store values but don't try to set elements that don't exist
  if (data.config) {
    currentStyle = data.config.style || 'classic';
    currentTheme = data.config.theme || '#5B7B7A';
    const styleSelect = document.getElementById('style-select');
    if (styleSelect) styleSelect.value = currentStyle;
    setActiveTheme(currentTheme);
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

// ─── Theme management (used only for populateForm) ──────────────

function setActiveTheme(color) {
  // Only runs when style-select exists (on main page with config bar)
  const swatches = document.querySelectorAll('.theme-swatch');
  if (swatches.length > 0) {
    swatches.forEach(swatch => {
      swatch.classList.toggle('active', swatch.dataset.color === color);
    });
  }
  // Sync color picker and hex input if they exist
  const picker = document.getElementById('theme-color-picker');
  const hexInput = document.getElementById('theme-hex-input');
  if (picker) picker.value = color;
  if (hexInput) hexInput.value = color.replace('#', '').toUpperCase();
}

function applyThemeColor(color) {
  // Theme is applied on preview page, not main page
  // Main page uses neutral header
}

// ─── Entry reordering ───────────────────────────────────────────

function moveEntryUp(btn) {
  const entryBlock = btn.closest('.entry-block');
  if (!entryBlock) return;
  
  const prev = entryBlock.previousElementSibling;
  if (prev && prev.classList.contains('entry-block')) {
    entryBlock.parentNode.insertBefore(entryBlock, prev);
    updateEntryNumbers(entryBlock.parentNode);
  }
}

function moveEntryDown(btn) {
  const entryBlock = btn.closest('.entry-block');
  if (!entryBlock) return;
  
  const next = entryBlock.nextElementSibling;
  if (next && next.classList.contains('entry-block')) {
    entryBlock.parentNode.insertBefore(next, entryBlock);
    updateEntryNumbers(entryBlock.parentNode);
  }
}

function updateEntryNumbers(container) {
  const blocks = container.querySelectorAll('.entry-block');
  blocks.forEach((block, i) => {
    const headerSpan = block.querySelector('.entry-block-header span');
    if (headerSpan) {
      // Extract the label text (e.g., "Work Experience", "Education")
      const text = headerSpan.textContent;
      const label = text.replace(/#\d+$/, '').trim();
      headerSpan.textContent = `${label} #${i + 1}`;
    }
  });
}

// ─── Event binding ──────────────────────────────────────────────

function bindEvents() {
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

    const sectionRemovals = [
      'remove-work', 'remove-education', 'remove-project', 
      'remove-skill', 'remove-certification', 'remove-internship', 
      'remove-language', 'remove-custom-section'
    ];

    if (sectionRemovals.includes(action)) {
      if (!confirm('Are you sure you want to remove this entry?')) return;
    }

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
      case 'move-up':
        moveEntryUp(btn);
        debounceSave();
        break;
      case 'move-down':
        moveEntryDown(btn);
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

  // Save draft button (bottom)
  document.getElementById('btn-save-draft').addEventListener('click', async () => {
    await saveAll();
    showToast('Draft saved successfully');
  });

  // Save draft button (top)
  document.getElementById('btn-save-draft-top').addEventListener('click', async () => {
    await saveAll();
    showToast('Draft saved successfully');
  });

  // Generate resume button (bottom)
  document.getElementById('btn-generate').addEventListener('click', async () => {
    await saveAll();
    window.location.href = `preview.html?id=${resumeId}`;
  });

  // Generate resume button (top)
  document.getElementById('btn-generate-top').addEventListener('click', async () => {
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

// ─── Export Draft ───────────────────────────────────────────────

function handleExportDraft() {
  if (!resumeId) {
    showToast('No resume to export');
    return;
  }
  
  const data = exportDraft(resumeId);
  if (!data) {
    showToast('Export failed');
    return;
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const name = data.resume?.personalInfo?.full_name || 'resume';
  const cleanName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  a.download = `${cleanName}_draft_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Draft exported!');
}

// ─── Import Draft ───────────────────────────────────────────────

async function handleImportDraft(file) {
  if (!file) return;
  
  try {
    const text = await file.text();
    const jsonData = JSON.parse(text);
    await importDraft(jsonData, resumeId);
    
    // Reload form with imported data
    const data = loadResume(resumeId);
    if (data) {
      resetCounters();
      // Clear existing form entries
      document.getElementById('work-entries').innerHTML = '';
      document.getElementById('education-entries').innerHTML = '';
      document.getElementById('project-entries').innerHTML = '';
      document.getElementById('skill-entries').innerHTML = '';
      document.getElementById('certification-entries').innerHTML = '';
      document.getElementById('internship-entries').innerHTML = '';
      document.getElementById('language-entries').innerHTML = '';
      document.getElementById('custom-section-entries').innerHTML = '';
      
      populateForm(data);
    }
    
    showToast('Draft imported!');
  } catch (err) {
    console.error('Import failed:', err);
    showToast('Import failed: Invalid file');
  }
}

// ─── Clear All Data ─────────────────────────────────────────────

async function handleClearAll() {
  const confirmed = confirm('Are you sure you want to clear ALL data? This cannot be undone!');
  if (!confirmed) return;
  
  try {
    await clearAllData();
    // Reload page to show fresh state
    window.location.reload();
  } catch (err) {
    console.error('Clear failed:', err);
    showToast('Failed to clear data');
  }
}

// ─── Bind utility buttons ───────────────────────────────────────

document.getElementById('btn-export-draft')?.addEventListener('click', handleExportDraft);
document.getElementById('btn-import-draft')?.addEventListener('change', (e) => {
  handleImportDraft(e.target.files[0]);
  e.target.value = ''; // Reset so same file can be imported again
});
document.getElementById('btn-clear-all')?.addEventListener('click', handleClearAll);

// ─── Start ──────────────────────────────────────────────────────

init();
