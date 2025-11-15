// assets/js/site-content-editor.js
// Admin-only editor that reads/writes data/site-content.json
(function () {
  const JSON_PATH = 'data/site-content.json';

  const statusEl = document.getElementById('editor-status');
  const actionStatusEl = document.getElementById('editor-action-status');
  const projectsContainer = document.getElementById('projects-editor');
  const addProjectBtn = document.getElementById('add-project-btn');
  const downloadBtn = document.getElementById('download-json-btn');
  const copyBtn = document.getElementById('copy-json-btn');

  let loadedJson = null;   // original JSON from file
  let currentJson = null;  // working copy in same shape as site-content.json

  function deepClone(obj) {
    if (typeof structuredClone === 'function') {
      return structuredClone(obj);
    }
    return JSON.parse(JSON.stringify(obj));
  }

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  function setActionStatus(msg) {
    if (actionStatusEl) actionStatusEl.textContent = msg;
  }

  async function loadJson() {
    try {
      const res = await fetch(JSON_PATH, { cache: 'no-cache' });
      if (!res.ok) {
        throw new Error('HTTP ' + res.status);
      }
      const data = await res.json();
      loadedJson = deepClone(data);
      currentJson = deepClone(data);
      setStatus('Loaded data from ' + JSON_PATH);
      populateForms(currentJson);
    } catch (err) {
      console.error('Error loading JSON:', err);
      setStatus('Error loading JSON. Check that ' + JSON_PATH + ' exists and is valid.');
    }
  }

  function get(obj, path, fallback = '') {
    try {
      const parts = path.split('.');
      let cur = obj;
      for (const p of parts) {
        if (cur == null) return fallback;
        cur = cur[p];
      }
      return (cur == null ? fallback : cur);
    } catch {
      return fallback;
    }
  }

  function setInputValue(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    if ('value' in el) el.value = value == null ? '' : String(value);
  }

  function getInputValue(id) {
    const el = document.getElementById(id);
    if (!el || !('value' in el)) return '';
    return el.value.trim();
  }

  function getChildValue(parent, selector) {
    const el = parent.querySelector(selector);
    if (!el || !('value' in el)) return '';
    return el.value.trim();
  }

  // ---- POPULATE FORMS FROM EXISTING JSON SHAPE ----
  function populateForms(data) {
    // ----- PROFILE (sidebar + topbar pieces) -----
    const sidebar = data.sidebar || {};
    const topbar = data.topbar || {};
    const nav = sidebar.nav || {};
    const profiles = Array.isArray(nav.profiles) ? nav.profiles : [];

    // name: sidebar.name
    setInputValue('profile-name', sidebar.name || '');

    // headline_lines: array -> multiline textarea
    const headlineLines = Array.isArray(sidebar.headline_lines)
      ? sidebar.headline_lines
      : [];
    setInputValue('profile-headline', headlineLines.join('\n'));

    // degree_lines: array -> multiline textarea
    const degreeLines = Array.isArray(sidebar.degree_lines)
      ? sidebar.degree_lines
      : [];
    setInputValue('profile-degree', degreeLines.join('\n'));

    // location / employer
    setInputValue('profile-location', sidebar.location || '');
    setInputValue('profile-employer', sidebar.employer || '');

    // profiles: find linkedin / github / email from sidebar.nav.profiles
    const linkedin = profiles.find(p => p.type === 'linkedin') || {};
    const github = profiles.find(p => p.type === 'github') || {};
    const emailProf = profiles.find(p => p.type === 'email') || {};

    setInputValue('profile-linkedin', linkedin.href || '');
    setInputValue('profile-github', github.href || '');
    setInputValue('profile-email', (emailProf.href || '').replace(/^mailto:/, ''));

    // ----- SUMMARY -----
    const summarySection = get(data, 'sections.summary', {});
    const summaryParas = Array.isArray(summarySection.paragraphs)
      ? summarySection.paragraphs
      : [];
    setInputValue('summary-text', summaryParas.join('\n\n'));

    // ----- RESEARCH INTERESTS -----
    const riSection = get(data, 'sections.research_interests', {});
    const riItems = Array.isArray(riSection.items) ? riSection.items : [];
    setInputValue('research-text', riItems.join('\n'));

    // ----- PROJECTS -----
    const projSection = get(data, 'sections.projects', {});
    const projItems = Array.isArray(projSection.items) ? projSection.items : [];
    renderProjects(projItems);

    // ----- CONTACT -----
    const contactSec = get(data, 'sections.contact', {});
    setInputValue('contact-email', contactSec.email || '');
    setInputValue('contact-meeting-link', contactSec.cal_url || '');
  }

  // ---- PROJECTS UI ----
  function renderProjects(projectItems) {
    projectsContainer.innerHTML = '';
    projectItems.forEach((proj, idx) => {
      // Map JSON shape -> editor shape
      addProjectBlock(
        {
          title: proj.title || '',
          link: proj.url || '',
          description: proj.description || '',
          tech: proj.tech_stack || ''
        },
        idx
      );
    });
  }

  function addProjectBlock(project = {}, indexOverride = null) {
    const idx = (indexOverride != null)
      ? indexOverride
      : projectsContainer.children.length;

    const wrapper = document.createElement('div');
    wrapper.className = 'project-edit-block';
    wrapper.dataset.index = String(idx);

    wrapper.innerHTML = `
      <div style="border:1px solid #e5e7eb; padding:0.75rem; border-radius:8px; margin-bottom:0.75rem;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong>Project #${idx + 1}</strong>
          <button type="button" class="remove-project-btn" style="font-size:0.8rem;">Remove</button>
        </div>
        <label style="display:block; margin-top:0.5rem;">
          Title<br>
          <input type="text" class="proj-title" style="width:100%;">
        </label>
        <label style="display:block; margin-top:0.5rem;">
          Link (GitHub or live URL)<br>
          <input type="text" class="proj-link" style="width:100%;">
        </label>
        <label style="display:block; margin-top:0.5rem;">
          Short description<br>
          <textarea class="proj-description" rows="3" style="width:100%;"></textarea>
        </label>
        <label style="display:block; margin-top:0.5rem;">
          Tech stack<br>
          <input type="text" class="proj-tech" style="width:100%;">
        </label>
      </div>
    `;

    const titleInput = wrapper.querySelector('.proj-title');
    const linkInput = wrapper.querySelector('.proj-link');
    const descInput = wrapper.querySelector('.proj-description');
    const techInput = wrapper.querySelector('.proj-tech');
    const removeBtn = wrapper.querySelector('.remove-project-btn');

    if (titleInput) titleInput.value = project.title || '';
    if (linkInput) linkInput.value = project.link || '';
    if (descInput) descInput.value = project.description || '';
    if (techInput) techInput.value = project.tech || '';

    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        projectsContainer.removeChild(wrapper);
        renumberProjectBlocks();
      });
    }

    projectsContainer.appendChild(wrapper);
  }

  function renumberProjectBlocks() {
    Array.from(projectsContainer.children).forEach((block, idx) => {
      block.dataset.index = String(idx);
      const label = block.querySelector('strong');
      if (label) label.textContent = 'Project #' + (idx + 1);
    });
  }

  // ---- COLLECT FORM BACK INTO EXISTING JSON SHAPE ----
  function collectJsonFromForm() {
    if (!currentJson) currentJson = {};

    const updated = deepClone(currentJson);

    // ----- PROFILE (sidebar + topbar) -----
    if (!updated.sidebar) updated.sidebar = {};
    const sidebar = updated.sidebar;
    if (!sidebar.nav) sidebar.nav = {};
    if (!Array.isArray(sidebar.nav.profiles)) sidebar.nav.profiles = [];
    const profiles = sidebar.nav.profiles;

    const name = getInputValue('profile-name');
    const headlineRaw = getInputValue('profile-headline');
    const degreeRaw = getInputValue('profile-degree');

    sidebar.name = name;

    // headline_lines from textarea lines
    const headlineLines = headlineRaw
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
    sidebar.headline_lines = headlineLines;

    // degree_lines from textarea lines
    const degreeLines = degreeRaw
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
    sidebar.degree_lines = degreeLines;

    sidebar.location = getInputValue('profile-location');
    sidebar.employer = getInputValue('profile-employer');

    // Update profiles by type: linkedin, github, email
    function ensureProfile(type, href, defaults) {
      if (!href) {
        // If user cleared it, keep existing entry but with empty href.
        const existing = profiles.find(p => p.type === type);
        if (existing) existing.href = '';
        return;
      }
      let entry = profiles.find(p => p.type === type);
      if (!entry) {
        entry = { type, chip: defaults.chip, label: defaults.label, href };
        profiles.push(entry);
      } else {
        entry.href = href;
      }
    }

    const linkedinHref = getInputValue('profile-linkedin');
    const githubHref = getInputValue('profile-github');
    const emailVal = getInputValue('profile-email');
    const emailHref = emailVal ? `mailto:${emailVal}` : '';

    ensureProfile('linkedin', linkedinHref, { chip: 'in', label: 'LinkedIn' });
    ensureProfile('github', githubHref, { chip: 'gh', label: 'GitHub' });
    ensureProfile('email', emailHref, { chip: '@', label: 'Email' });

    // Optionally sync topbar.name with sidebar.name
    if (!updated.topbar) updated.topbar = {};
    updated.topbar.name = name || updated.topbar.name || '';

    // ----- SUMMARY -----
    if (!updated.sections) updated.sections = {};
    if (!updated.sections.summary) updated.sections.summary = {};
    const summarySection = updated.sections.summary;

    const rawSummary = getInputValue('summary-text');
    const summaryParas = rawSummary
      .split(/\n\s*\n/)   // blank line between paragraphs
      .map(s => s.trim())
      .filter(Boolean);

    summarySection.paragraphs = summaryParas;

    // ----- RESEARCH INTERESTS -----
    if (!updated.sections.research_interests) {
      updated.sections.research_interests = {};
    }
    const riSection = updated.sections.research_interests;

    const rawRI = getInputValue('research-text');
    const riItems = rawRI
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    riSection.items = riItems;

    // ----- PROJECTS -----
    if (!updated.sections.projects) updated.sections.projects = {};
    const projSection = updated.sections.projects;
    const projItems = [];

    Array.from(projectsContainer.children).forEach(block => {
      const title = getChildValue(block, '.proj-title');
      const link = getChildValue(block, '.proj-link');
      const description = getChildValue(block, '.proj-description');
      const tech = getChildValue(block, '.proj-tech');

      // Ignore completely empty blocks
      if (!(title || link || description || tech)) return;

      projItems.push({
        title,
        url: link,
        description,
        tech_stack: tech
      });
    });

    projSection.items = projItems;

    // ----- CONTACT -----
    if (!updated.sections.contact) updated.sections.contact = {};
    const contactSec = updated.sections.contact;
    contactSec.email = getInputValue('contact-email');
    contactSec.cal_url = getInputValue('contact-meeting-link');
    // Leave contactSec.linkedin_url as-is if it exists

    currentJson = updated;
    return updated;
  }

  // ---- DOWNLOAD / COPY ----
  function downloadJson() {
    const updated = collectJsonFromForm();
    const jsonStr = JSON.stringify(updated, null, 2);

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'site-content.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    setActionStatus(
      'Downloaded updated site-content.json. Replace the file in data/ after backing up the old one.'
    );
  }

  async function copyJsonToClipboard() {
    try {
      const updated = collectJsonFromForm();
      const jsonStr = JSON.stringify(updated, null, 2);
      await navigator.clipboard.writeText(jsonStr);
      setActionStatus('JSON copied to clipboard.');
    } catch (err) {
      console.error('Clipboard error:', err);
      setActionStatus('Could not copy to clipboard (browser permissions?).');
    }
  }

  // ---- WIRE EVENTS ----
  function init() {
    if (addProjectBtn) {
      addProjectBtn.addEventListener('click', () => addProjectBlock({}, null));
    }
    if (downloadBtn) {
      downloadBtn.addEventListener('click', downloadJson);
    }
    if (copyBtn) {
      copyBtn.addEventListener('click', copyJsonToClipboard);
    }
    loadJson();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
