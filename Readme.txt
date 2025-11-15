# AI-Augmented Portfolio Layout & Pepper Assistant Frontend

JSON-driven personal portfolio frontend with a built-in LLM chat assistant (“Pepper”).  
The layout is a responsive two-column profile site where all text content is loaded from `data/site-content.json`, and an inline chat widget talks to a backend `/api/chat` endpoint.

---

## What it does

- Renders a **sidebar + main content** portfolio layout from a static HTML shell and a JSON config file.
- Populates sections (summary, research interests, projects, contact, assistant landing) from `data/site-content.json` at runtime.
- Embeds a **Pepper chat widget**: a WhatsApp-style conversation UI that sends user messages to `https://pepper-portfolio.onrender.com/api/chat`.
- Provides a **reusable profile assistant card** (`initProfileAssistant`) that can be mounted on any element and pointed at any chat endpoint.
- Ships with an **admin-only JSON editor** (`site-content-editor.js`) to view, edit, and export an updated `site-content.json` (projects, profile metadata, links, etc.).

The result is a static, host-anywhere portfolio site that can be updated via JSON and augmented with an LLM-based assistant.

---

## Architecture / Flow

### High-level layout

- `index.html`
  - Declares the base structure:
    - `<aside class="sidebar">` with avatar, name, headline, employer, main nav, and profile links.
    - `<div class="main-column">` with a topbar and a card-like content area.
    - Sections: `#summary`, `#chat-section`, `#research-interests`, `#projects`, `#contact`, and an assistant landing zone.
  - Includes:
    - `style.css` (layout + chat styles).
    - `assets/css/profile-assistant.css` (profile assistant card styles).
    - `assets/js/site-content-loader.js` (JSON → DOM).
    - `assets/js/profile-assistant.js` (reusable chat card).
    - Inline Pepper chat bootstrap script.

- `style.css`
  - Global CSS variables (colors, fonts, radii, shadows).
  - Flex-based **two-column layout** (`.layout`, `.sidebar`, `.main-column`).
  - Typography and spacing for sections, projects, footer.
  - Complete styling for the **Pepper chat widget**:
    - `.chat-card`, `.chat-header`, `.chat-orb`, `.chat-messages`, `.message-row`, `.message-bubble`, `.chat-input-row`, etc.
    - Orb states via `.state-idle`, `.state-typing`, `.state-error` and `@keyframes orb-pulse`.

- `assets/css/profile-assistant.css`
  - Styling for a compact, embeddable chat card:
    - `.pa-chat-card`, `.pa-chat-header`, `.pa-orb`, `.pa-messages`, `.pa-input-row`, etc.
  - Separate orb state classes: `.pa-orb--idle`, `.pa-orb--processing`, `.pa-orb--responding`.

### Content loading pipeline

- `data/site-content.json` (not shown here, but assumed structure)
  - Holds:
    - `sidebar` metadata: name, avatar, location, employer, `headline_lines`, `degree_lines`, nav links, profiles.
    - `topbar` name/subtitle.
    - `sections.summary`, `sections.research_interests`, `sections.projects`, `sections.contact`, `sections.chat`, `sections.assistant_landing`.
    - `footer` text.

- `assets/js/site-content-loader.js`
  - On `DOMContentLoaded`, fetches `DATA_URL = "data/site-content.json"` with `cache: "no-cache"`.
  - Applies content through dedicated functions:
    - `applySidebar(data)`
      - Sets avatar image/alt.
      - Fills name, headline (joined with `<br>`), degree, location, employer.
      - Builds main nav (`#nav-main`) and profile nav (`#nav-profiles`) from `sidebar.nav`.
    - `applyTopbar(data)`
      - Sets topbar name and subtitle.
    - `applySummary(data)`
      - Sets `#summary-title` and appends `<p>` elements for each paragraph.
    - `applyChatSection(data)`
      - Sets `#chat-title` and `#chat-description` for the chat section intro.
    - `applyResearch(data)`
      - Fills `#research-list` with `<li>` entries.
    - `applyProjects(data)`
      - Builds `.project` blocks inside `#projects-list`, each with:
        - `<h3>` containing an `<a>` if `proj.url` exists.
        - Description paragraph.
        - `Tech Stack: ...` line.
    - `applyContact(data)`
      - Renders paragraphs with email and LinkedIn anchor tags.
      - Optional calendar / scheduling link.
    - `applyAssistantLanding(data)`
      - Sets assistant landing title + description.
    - `applyFooter(data)`
      - Sets footer text and current year.

The loader keeps the HTML skeleton stable and only populates the placeholders with JSON-driven content.

---

## Chat widgets

### Pepper chat widget (full-width card)

In `index.html`, an inline script defines a small initializer:

```js
const API_BASE = "https://pepper-portfolio.onrender.com";  // no trailing slash
const CHAT_ENDPOINT = "/api/chat";

function initPepperChat(mountId) { ... }
document.addEventListener("DOMContentLoaded", function () {
  initPepperChat("chatbot-root");
});

## Project layout

```text

[repo-root]/
  assets/
    css/
      profile-assistant.css
    js/
      profile-assistant.js
      site-content-editor.js
      site-content-loader.js
  data/
    display_picture.jpg
    site-content.json
  .gitignore
  cname
  editor.html
  index.html
  Readme.txt
  style.css
