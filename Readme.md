# AI-Augmented Portfolio Layout & Pepper Assistant Frontend

JSON-driven personal portfolio frontend with an inline LLM chat assistant.  
The site is a static two-column layout where all content comes from `data/site-content.json`, and the chat widget posts to a configurable `/api/chat` endpoint.

---

## What it does

- Renders a **sidebar + main content** portfolio layout from a static HTML shell + JSON.
- Loads sections (summary, research interests, projects, contact, assistant landing) from `site-content.json` at runtime.
- Embeds a **Pepper chat widget** (WhatsApp-style bubbles + status orb) wired to a backend chat endpoint.
- Provides a **reusable profile assistant card** (`initProfileAssistant`) that can be mounted on any element and pointed at any chat endpoint.
- Includes an **admin JSON editor** to read/modify/export `site-content.json` (projects, profile text, links, etc.).

---

## Main pieces

- `index.html`
  - Static skeleton: sidebar, main column, sections (`#summary`, `#chat-section`, `#research-interests`, `#projects`, `#contact`, assistant landing).
  - Includes:
    - `style.css`
    - `assets/css/profile-assistant.css`
    - `assets/js/site-content-loader.js`
    - `assets/js/profile-assistant.js`
    - Inline script that mounts the Pepper chat widget into `#chatbot-root`.

- `style.css`
  - Layout + theming (CSS variables, two-column flex layout, cards).
  - Full Pepper chat styling:
    - `.chat-card`, `.chat-header`, `.chat-orb`, `.chat-messages`, `.message-row`, `.message-bubble`, `.chat-input-row`.
    - Orb states: `.state-idle`, `.state-typing`, `.state-error` with `@keyframes orb-pulse`.

- `assets/css/profile-assistant.css`
  - Styles for the compact profile assistant card:
    - `.pa-chat-card`, `.pa-chat-header`, `.pa-orb`, `.pa-messages`, `.pa-input-row`.
    - Orb states: `.pa-orb--idle`, `.pa-orb--processing`, `.pa-orb--responding`.

- `assets/js/site-content-loader.js`
  - Fetches `data/site-content.json`.
  - Fills:
    - Sidebar (`sidebar.name`, avatar, location, employer, nav, profiles).
    - Topbar (`topbar.name`, `topbar.subtitle`).
    - Summary, research interests, projects, contact, assistant landing, footer.

- `assets/js/profile-assistant.js`
  - `initProfileAssistant(config)`:
    - Mounts a small chat card into a given DOM node.
    - Manages state (`messages`, ticks, sending flag).
    - Handles send/receive to `config.endpoint`.
    - Updates orb state (idle/processing/responding).

- `assets/js/site-content-editor.js`
  - Admin-only editor for `editor.html`.
  - Loads `data/site-content.json`.
  - Renders form controls for:
    - Profile (name, headline lines, degrees, location, employer, profile links).
    - Summary paragraphs.
    - Research interests.
    - Projects (title, link, description, tech stack).
    - Contact info (email, LinkedIn, calendar URL).
  - Can generate an updated JSON and:
    - Download as `site-content.json`.
    - Copy JSON to clipboard.

---

## Repository layout

```text
[repo-root]/
  assets/
    css/
      profile-assistant.css      # Compact assistant card styles
    js/
      profile-assistant.js       # Reusable profile assistant widget
      site-content-editor.js     # Admin JSON editor logic
      site-content-loader.js     # JSON → DOM content loader
  data/
    display_picture.jpg          # Sidebar avatar
    site-content.json            # All portfolio content (JSON)
  .gitignore
  CNAME                          # Custom domain config (GitHub Pages)
  editor.html                    # Admin editor UI for site-content.json
  index.html                     # Main portfolio + Pepper chat shell
  Readme.txt                     # Legacy/readme text (optional)
  style.css                      # Layout + Pepper chat styles
