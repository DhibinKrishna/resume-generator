// Renderer - loads data from DB, selects template, calls render

import { loadResume } from './db.js';
import { renderClassic } from './templates/classic.js';

const templates = {
  classic: renderClassic,
};

export function renderResume(resumeId) {
  const data = loadResume(resumeId);
  if (!data) return '<p>No resume data found.</p>';

  const style = data.config.style || 'classic';
  const theme = data.config.theme || '#5B7B7A';
  const renderFn = templates[style] || templates.classic;

  return renderFn(data, theme);
}

export function getResumeData(resumeId) {
  return loadResume(resumeId);
}
