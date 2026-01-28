// Database layer using sql.js (SQLite in WASM) with IndexedDB persistence

const DB_NAME = 'ResumeGeneratorDB';
const DB_STORE = 'sqlitedb';
const DB_KEY = 'database';

let db = null;

export const DEFAULT_SECTION_ORDER = [
  'summary', 'skills', 'licenses', 'work',
  'education', 'certifications', 'internships', 'languages',
];

// ─── IndexedDB persistence ───────────────────────────────────────

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(DB_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function loadFromIndexedDB() {
  const idb = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(DB_STORE, 'readonly');
    const store = tx.objectStore(DB_STORE);
    const request = store.get(DB_KEY);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

async function saveToIndexedDB() {
  if (!db) return;
  const data = db.export();
  const idb = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(DB_STORE, 'readwrite');
    const store = tx.objectStore(DB_STORE);
    const request = store.put(data, DB_KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ─── Initialize sql.js and database ─────────────────────────────

export async function initDB() {
  const SQL = await initSqlJs({
    locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
  });

  const savedData = await loadFromIndexedDB();
  if (savedData) {
    db = new SQL.Database(new Uint8Array(savedData));
  } else {
    db = new SQL.Database();
  }

  createTables();
  await persist();
  return db;
}

function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS resumes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT 'Untitled Resume',
      style TEXT NOT NULL DEFAULT 'classic',
      theme TEXT NOT NULL DEFAULT '#5B7B7A',
      font TEXT NOT NULL DEFAULT 'default',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS personal_info (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resume_id INTEGER NOT NULL,
      full_name TEXT,
      job_title TEXT,
      email TEXT,
      phone TEXT,
      location TEXT,
      linkedin TEXT,
      portfolio TEXT,
      FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS profile_summary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resume_id INTEGER NOT NULL,
      summary TEXT,
      FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS work_experience (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resume_id INTEGER NOT NULL,
      company TEXT,
      role TEXT,
      location TEXT,
      start_date TEXT,
      end_date TEXT,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
    );
  `);

  // Add description column if it doesn't exist (for existing databases)
  try {
    db.run('ALTER TABLE work_experience ADD COLUMN description TEXT');
  } catch (e) {
    // Column already exists, ignore
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS work_achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      work_experience_id INTEGER NOT NULL,
      achievement TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (work_experience_id) REFERENCES work_experience(id) ON DELETE CASCADE
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS education (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resume_id INTEGER NOT NULL,
      institution TEXT,
      degree TEXT,
      field TEXT,
      start_date TEXT,
      end_date TEXT,
      gpa TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resume_id INTEGER NOT NULL,
      title TEXT,
      description TEXT,
      technologies TEXT,
      link TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
    );
  `);

  // Add columns for nesting projects under work experience
  try {
    db.run('ALTER TABLE projects ADD COLUMN work_experience_id INTEGER');
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    db.run('ALTER TABLE projects ADD COLUMN start_date TEXT');
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    db.run('ALTER TABLE projects ADD COLUMN end_date TEXT');
  } catch (e) {
    // Column already exists, ignore
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resume_id INTEGER NOT NULL,
      category TEXT,
      bulleted INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
    );
  `);

  // Add bulleted column if it doesn't exist (for existing databases)
  try {
    db.run('ALTER TABLE skills ADD COLUMN bulleted INTEGER DEFAULT 0');
  } catch (e) {
    // Column already exists, ignore
  }

  // Add font column if it doesn't exist (for existing databases)
  try {
    db.run("ALTER TABLE resumes ADD COLUMN font TEXT NOT NULL DEFAULT 'default'");
  } catch (e) {
    // Column already exists, ignore
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS skill_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      skill_id INTEGER NOT NULL,
      name TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS licenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resume_id INTEGER NOT NULL,
      name TEXT,
      issuing_org TEXT,
      issue_date TEXT,
      expiration_date TEXT,
      license_number TEXT,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
    );
  `);

  // Add description column to licenses if it doesn't exist (for existing databases)
  try {
    db.run('ALTER TABLE licenses ADD COLUMN description TEXT');
  } catch (e) {
    // Column already exists, ignore
  }

  // Add section_order column if it doesn't exist (for existing databases)
  try {
    db.run("ALTER TABLE resumes ADD COLUMN section_order TEXT DEFAULT ''");
  } catch (e) {
    // Column already exists, ignore
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS certifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resume_id INTEGER NOT NULL,
      name TEXT,
      issuing_org TEXT,
      date TEXT,
      credential_id TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS internships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resume_id INTEGER NOT NULL,
      company TEXT,
      role TEXT,
      start_date TEXT,
      end_date TEXT,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS languages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resume_id INTEGER NOT NULL,
      language TEXT,
      proficiency TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS custom_sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resume_id INTEGER NOT NULL,
      title TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS custom_section_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      custom_section_id INTEGER NOT NULL,
      content TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (custom_section_id) REFERENCES custom_sections(id) ON DELETE CASCADE
    );
  `);

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON;');
}

// ─── Persist helper ─────────────────────────────────────────────

async function persist() {
  await saveToIndexedDB();
}

// ─── Helper to run queries ──────────────────────────────────────

function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function queryOne(sql, params = []) {
  const results = queryAll(sql, params);
  return results.length > 0 ? results[0] : null;
}

function run(sql, params = []) {
  db.run(sql, params);
}

function lastInsertId() {
  return queryOne('SELECT last_insert_rowid() as id').id;
}

// ─── Resume CRUD ────────────────────────────────────────────────

export async function createResume(name = 'Untitled Resume', style = 'classic', theme = '#5B7B7A', font = 'default') {
  run('INSERT INTO resumes (name, style, theme, font) VALUES (?, ?, ?, ?)', [name, style, theme, font]);
  const id = lastInsertId();
  run('INSERT INTO personal_info (resume_id) VALUES (?)', [id]);
  run('INSERT INTO profile_summary (resume_id) VALUES (?)', [id]);
  await persist();
  return id;
}

export async function getOrCreateResume() {
  const existing = queryOne('SELECT id FROM resumes ORDER BY updated_at DESC LIMIT 1');
  if (existing) return existing.id;
  return await createResume();
}

export async function updateResumeConfig(resumeId, style, theme, font = 'default') {
  run("UPDATE resumes SET style = ?, theme = ?, font = ?, updated_at = datetime('now') WHERE id = ?", [style, theme, font, resumeId]);
  await persist();
}

// ─── Personal Info ──────────────────────────────────────────────

export async function savePersonalInfo(resumeId, data) {
  const existing = queryOne('SELECT id FROM personal_info WHERE resume_id = ?', [resumeId]);
  if (existing) {
    run(`UPDATE personal_info SET
      full_name = ?, job_title = ?, email = ?, phone = ?, location = ?, linkedin = ?, portfolio = ?
      WHERE resume_id = ?`,
      [data.full_name, data.job_title, data.email, data.phone, data.location, data.linkedin, data.portfolio, resumeId]);
  } else {
    run(`INSERT INTO personal_info (resume_id, full_name, job_title, email, phone, location, linkedin, portfolio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [resumeId, data.full_name, data.job_title, data.email, data.phone, data.location, data.linkedin, data.portfolio]);
  }
  run("UPDATE resumes SET updated_at = datetime('now') WHERE id = ?", [resumeId]);
  await persist();
}

export function getPersonalInfo(resumeId) {
  return queryOne('SELECT * FROM personal_info WHERE resume_id = ?', [resumeId]);
}

// ─── Profile Summary ────────────────────────────────────────────

export async function saveProfileSummary(resumeId, summary) {
  const existing = queryOne('SELECT id FROM profile_summary WHERE resume_id = ?', [resumeId]);
  if (existing) {
    run('UPDATE profile_summary SET summary = ? WHERE resume_id = ?', [summary, resumeId]);
  } else {
    run('INSERT INTO profile_summary (resume_id, summary) VALUES (?, ?)', [resumeId, summary]);
  }
  run("UPDATE resumes SET updated_at = datetime('now') WHERE id = ?", [resumeId]);
  await persist();
}

export function getProfileSummary(resumeId) {
  const row = queryOne('SELECT summary FROM profile_summary WHERE resume_id = ?', [resumeId]);
  return row ? row.summary : '';
}

// ─── Work Experience ────────────────────────────────────────────

export async function saveWorkExperience(resumeId, entries) {
  // Delete existing entries for this resume
  const existing = queryAll('SELECT id FROM work_experience WHERE resume_id = ?', [resumeId]);
  for (const e of existing) {
    run('DELETE FROM work_achievements WHERE work_experience_id = ?', [e.id]);
    run('DELETE FROM projects WHERE work_experience_id = ?', [e.id]);
  }
  run('DELETE FROM work_experience WHERE resume_id = ?', [resumeId]);

  // Insert new entries
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    run(`INSERT INTO work_experience (resume_id, company, role, location, start_date, end_date, description, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [resumeId, entry.company, entry.role, entry.location, entry.start_date, entry.end_date, entry.description, i]);
    const weId = lastInsertId();

    if (entry.achievements) {
      for (let j = 0; j < entry.achievements.length; j++) {
        run('INSERT INTO work_achievements (work_experience_id, achievement, sort_order) VALUES (?, ?, ?)',
          [weId, entry.achievements[j], j]);
      }
    }

    if (entry.projects) {
      for (let j = 0; j < entry.projects.length; j++) {
        const p = entry.projects[j];
        run(`INSERT INTO projects (resume_id, work_experience_id, title, description, technologies, link, start_date, end_date, sort_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [resumeId, weId, p.title, p.description, p.technologies, p.link, p.start_date, p.end_date, j]);
      }
    }
  }
  run("UPDATE resumes SET updated_at = datetime('now') WHERE id = ?", [resumeId]);
  await persist();
}

export function getWorkExperience(resumeId) {
  const entries = queryAll('SELECT * FROM work_experience WHERE resume_id = ? ORDER BY sort_order', [resumeId]);
  return entries.map(e => ({
    ...e,
    achievements: queryAll('SELECT * FROM work_achievements WHERE work_experience_id = ? ORDER BY sort_order', [e.id])
      .map(a => a.achievement),
    projects: queryAll('SELECT * FROM projects WHERE work_experience_id = ? ORDER BY sort_order', [e.id])
  }));
}

// ─── Education ──────────────────────────────────────────────────

export async function saveEducation(resumeId, entries) {
  run('DELETE FROM education WHERE resume_id = ?', [resumeId]);
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    run(`INSERT INTO education (resume_id, institution, degree, field, start_date, end_date, gpa, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [resumeId, entry.institution, entry.degree, entry.field, entry.start_date, entry.end_date, entry.gpa, i]);
  }
  run("UPDATE resumes SET updated_at = datetime('now') WHERE id = ?", [resumeId]);
  await persist();
}

export function getEducation(resumeId) {
  return queryAll('SELECT * FROM education WHERE resume_id = ? ORDER BY sort_order', [resumeId]);
}

// ─── Skills ─────────────────────────────────────────────────────

export async function saveSkills(resumeId, categories) {
  const existing = queryAll('SELECT id FROM skills WHERE resume_id = ?', [resumeId]);
  for (const s of existing) {
    run('DELETE FROM skill_items WHERE skill_id = ?', [s.id]);
  }
  run('DELETE FROM skills WHERE resume_id = ?', [resumeId]);

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    run('INSERT INTO skills (resume_id, category, bulleted, sort_order) VALUES (?, ?, ?, ?)',
      [resumeId, cat.category, cat.bulleted ? 1 : 0, i]);
    const skillId = lastInsertId();
    if (cat.items) {
      for (let j = 0; j < cat.items.length; j++) {
        run('INSERT INTO skill_items (skill_id, name, sort_order) VALUES (?, ?, ?)',
          [skillId, cat.items[j], j]);
      }
    }
  }
  run("UPDATE resumes SET updated_at = datetime('now') WHERE id = ?", [resumeId]);
  await persist();
}

export function getSkills(resumeId) {
  const categories = queryAll('SELECT * FROM skills WHERE resume_id = ? ORDER BY sort_order', [resumeId]);
  return categories.map(c => ({
    ...c,
    bulleted: c.bulleted === 1,
    items: queryAll('SELECT * FROM skill_items WHERE skill_id = ? ORDER BY sort_order', [c.id])
      .map(item => item.name)
  }));
}

// ─── Licenses ───────────────────────────────────────────────────

export async function saveLicenses(resumeId, entries) {
  run('DELETE FROM licenses WHERE resume_id = ?', [resumeId]);
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    run(`INSERT INTO licenses (resume_id, name, issuing_org, issue_date, expiration_date, license_number, description, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [resumeId, entry.name, entry.issuing_org, entry.issue_date, entry.expiration_date, entry.license_number, entry.description, i]);
  }
  run("UPDATE resumes SET updated_at = datetime('now') WHERE id = ?", [resumeId]);
  await persist();
}

export function getLicenses(resumeId) {
  return queryAll('SELECT * FROM licenses WHERE resume_id = ? ORDER BY sort_order', [resumeId]);
}

// ─── Certifications ─────────────────────────────────────────────

export async function saveCertifications(resumeId, entries) {
  run('DELETE FROM certifications WHERE resume_id = ?', [resumeId]);
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    run(`INSERT INTO certifications (resume_id, name, issuing_org, date, credential_id, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [resumeId, entry.name, entry.issuing_org, entry.date, entry.credential_id, i]);
  }
  run("UPDATE resumes SET updated_at = datetime('now') WHERE id = ?", [resumeId]);
  await persist();
}

export function getCertifications(resumeId) {
  return queryAll('SELECT * FROM certifications WHERE resume_id = ? ORDER BY sort_order', [resumeId]);
}

// ─── Internships ────────────────────────────────────────────────

export async function saveInternships(resumeId, entries) {
  run('DELETE FROM internships WHERE resume_id = ?', [resumeId]);
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    run(`INSERT INTO internships (resume_id, company, role, start_date, end_date, description, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [resumeId, entry.company, entry.role, entry.start_date, entry.end_date, entry.description, i]);
  }
  run("UPDATE resumes SET updated_at = datetime('now') WHERE id = ?", [resumeId]);
  await persist();
}

export function getInternships(resumeId) {
  return queryAll('SELECT * FROM internships WHERE resume_id = ? ORDER BY sort_order', [resumeId]);
}

// ─── Languages ──────────────────────────────────────────────────

export async function saveLanguages(resumeId, entries) {
  run('DELETE FROM languages WHERE resume_id = ?', [resumeId]);
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    run('INSERT INTO languages (resume_id, language, proficiency, sort_order) VALUES (?, ?, ?, ?)',
      [resumeId, entry.language, entry.proficiency, i]);
  }
  run("UPDATE resumes SET updated_at = datetime('now') WHERE id = ?", [resumeId]);
  await persist();
}

export function getLanguages(resumeId) {
  return queryAll('SELECT * FROM languages WHERE resume_id = ? ORDER BY sort_order', [resumeId]);
}

// ─── Custom Sections ────────────────────────────────────────────

export async function saveCustomSections(resumeId, sections) {
  const existing = queryAll('SELECT id FROM custom_sections WHERE resume_id = ?', [resumeId]);
  for (const s of existing) {
    run('DELETE FROM custom_section_items WHERE custom_section_id = ?', [s.id]);
  }
  run('DELETE FROM custom_sections WHERE resume_id = ?', [resumeId]);

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    run('INSERT INTO custom_sections (resume_id, title, sort_order) VALUES (?, ?, ?)',
      [resumeId, section.title, i]);
    const sectionId = lastInsertId();
    if (section.items) {
      for (let j = 0; j < section.items.length; j++) {
        run('INSERT INTO custom_section_items (custom_section_id, content, sort_order) VALUES (?, ?, ?)',
          [sectionId, section.items[j], j]);
      }
    }
  }
  run("UPDATE resumes SET updated_at = datetime('now') WHERE id = ?", [resumeId]);
  await persist();
}

export function getCustomSections(resumeId) {
  const sections = queryAll('SELECT * FROM custom_sections WHERE resume_id = ? ORDER BY sort_order', [resumeId]);
  return sections.map(s => ({
    ...s,
    items: queryAll('SELECT * FROM custom_section_items WHERE custom_section_id = ? ORDER BY sort_order', [s.id])
      .map(item => item.content)
  }));
}

// ─── Section Order ──────────────────────────────────────────────

export function getSectionOrder(resumeId) {
  const row = queryOne('SELECT section_order FROM resumes WHERE id = ?', [resumeId]);
  if (row && row.section_order) {
    try {
      const parsed = JSON.parse(row.section_order);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) { /* fall through */ }
  }
  return [...DEFAULT_SECTION_ORDER];
}

export async function saveSectionOrder(resumeId, orderArray) {
  run('UPDATE resumes SET section_order = ? WHERE id = ?', [JSON.stringify(orderArray), resumeId]);
  await persist();
}

// ─── Load full resume data ──────────────────────────────────────

export function getResumeConfig(resumeId) {
  const config = queryOne('SELECT * FROM resumes WHERE id = ?', [resumeId]);
  if (config) {
    config.section_order = getSectionOrder(resumeId);
  }
  return config;
}

export function loadResume(resumeId) {
  const config = getResumeConfig(resumeId);
  if (!config) return null;

  return {
    config,
    personalInfo: getPersonalInfo(resumeId),
    profileSummary: getProfileSummary(resumeId),
    workExperience: getWorkExperience(resumeId),
    education: getEducation(resumeId),
    skills: getSkills(resumeId),
    licenses: getLicenses(resumeId),
    certifications: getCertifications(resumeId),
    internships: getInternships(resumeId),
    languages: getLanguages(resumeId),
    customSections: getCustomSections(resumeId),
  };
}

// ─── Clear All Data ─────────────────────────────────────────────

export async function clearAllData() {
  // Delete from IndexedDB
  const idb = await openIndexedDB();
  await new Promise((resolve, reject) => {
    const tx = idb.transaction(DB_STORE, 'readwrite');
    const store = tx.objectStore(DB_STORE);
    const request = store.delete(DB_KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  // Reinitialize database
  await initDB();
}

// ─── Export/Import Draft ────────────────────────────────────────

export function exportDraft(resumeId) {
  const data = loadResume(resumeId);
  if (!data) return null;
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    resume: data,
  };
}

export async function importDraft(jsonData, resumeId) {
  if (!jsonData || !jsonData.resume) throw new Error('Invalid draft format');
  const r = jsonData.resume;
  
  // Update config
  if (r.config) {
    await updateResumeConfig(resumeId, r.config.style || 'classic', r.config.theme || '#5B7B7A', r.config.font || 'default');
    if (r.config.section_order && Array.isArray(r.config.section_order)) {
      await saveSectionOrder(resumeId, r.config.section_order);
    }
  }
  
  // Save all sections
  if (r.personalInfo) await savePersonalInfo(resumeId, r.personalInfo);
  if (r.profileSummary !== undefined) await saveProfileSummary(resumeId, r.profileSummary);
  if (r.workExperience) await saveWorkExperience(resumeId, r.workExperience);
  if (r.education) await saveEducation(resumeId, r.education);
  if (r.projects && !r.workExperience?.some(w => w.projects?.length)) {
    console.warn('Draft contains top-level projects (old format). These will be skipped — projects are now nested under work experience.');
  }
  if (r.skills) await saveSkills(resumeId, r.skills);
  if (r.licenses) await saveLicenses(resumeId, r.licenses);
  if (r.certifications) await saveCertifications(resumeId, r.certifications);
  if (r.internships) await saveInternships(resumeId, r.internships);
  if (r.languages) await saveLanguages(resumeId, r.languages);
  if (r.customSections) await saveCustomSections(resumeId, r.customSections);
}
