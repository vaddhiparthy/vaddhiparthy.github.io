// assets/js/site-content-loader.js
// Load data/site-content.json and populate the static HTML.
// No layout changes, just fill text & lists.

(function () {
  const DATA_URL = "data/site-content.json";

  async function loadContent() {
    try {
      const res = await fetch(DATA_URL, { cache: "no-cache" });
      if (!res.ok) throw new Error("Failed to load site-content.json");
      const data = await res.json();
      applySidebar(data);
      applyTopbar(data);
      applySummary(data);
      applyChatSection(data);
      applyResearch(data);
      applyProjects(data);
      applyContact(data);
      applyAssistantLanding(data);
      applyFooter(data);
    } catch (err) {
      console.error("Error loading site content:", err);
    }
  }

  function applySidebar(data) {
    if (!data.sidebar) return;
    const sb = data.sidebar;

    const avatarImg = document.getElementById("avatar-img");
    if (avatarImg && sb.avatar) {
      if (sb.avatar.src) avatarImg.src = sb.avatar.src;
      if (sb.avatar.alt) avatarImg.alt = sb.avatar.alt;
    }

    const nameEl = document.getElementById("sidebar-name");
    if (nameEl && sb.name) nameEl.textContent = sb.name;

    const headlineEl = document.getElementById("sidebar-headline");
    if (headlineEl && Array.isArray(sb.headline_lines)) {
      headlineEl.innerHTML = sb.headline_lines.join("<br>");
    }

    const degreeEl = document.getElementById("sidebar-degree");
    if (degreeEl && Array.isArray(sb.degree_lines)) {
      degreeEl.innerHTML = sb.degree_lines.join("<br>");
    }

    const locEl = document.getElementById("sidebar-location");
    if (locEl && sb.location) locEl.textContent = sb.location;

    const empEl = document.getElementById("sidebar-employer");
    if (empEl && sb.employer) empEl.textContent = sb.employer;

    // Main nav
    const navMain = document.getElementById("nav-main");
    if (navMain && sb.nav && Array.isArray(sb.nav.main)) {
      navMain.innerHTML = "";
      sb.nav.main.forEach((item) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = item.href || "#";
        a.textContent = item.label || "";
        li.appendChild(a);
        navMain.appendChild(li);
      });
    }

    // Profiles nav
    const navProfiles = document.getElementById("nav-profiles");
    if (navProfiles && sb.nav && Array.isArray(sb.nav.profiles)) {
      navProfiles.innerHTML = "";
      sb.nav.profiles.forEach((item) => {
        const li = document.createElement("li");

        const chip = document.createElement("span");
        chip.className = "chip-icon";
        chip.textContent = item.chip || "";

        const a = document.createElement("a");
        a.href = item.href || "#";
        a.textContent = item.label || "";
        if (item.href && item.href.startsWith("http")) {
          a.target = "_blank";
          a.rel = "noopener";
        }

        li.appendChild(chip);
        li.appendChild(a);
        navProfiles.appendChild(li);
      });
    }
  }

  function applyTopbar(data) {
    if (!data.topbar) return;
    const tb = data.topbar;
    const nameEl = document.getElementById("topbar-name");
    const subEl = document.getElementById("topbar-sub");
    if (nameEl && tb.name) nameEl.textContent = tb.name;
    if (subEl && tb.subtitle) subEl.textContent = tb.subtitle;
  }

  function applySummary(data) {
    const sec = data.sections && data.sections.summary;
    if (!sec) return;
    const titleEl = document.getElementById("summary-title");
    const bodyEl = document.getElementById("summary-body");
    if (titleEl && sec.title) titleEl.textContent = sec.title;
    if (bodyEl && Array.isArray(sec.paragraphs)) {
      bodyEl.innerHTML = "";
      sec.paragraphs.forEach((pText) => {
        const p = document.createElement("p");
        p.textContent = pText;
        bodyEl.appendChild(p);
      });
    }
  }

  function applyChatSection(data) {
    const sec = data.sections && data.sections.chat;
    if (!sec) return;
    const titleEl = document.getElementById("chat-title");
    const descEl = document.getElementById("chat-description");
    if (titleEl && sec.title) titleEl.textContent = sec.title;
    if (descEl && sec.description !== undefined) {
      descEl.textContent = sec.description;
    }
  }

  function applyResearch(data) {
    const sec = data.sections && data.sections.research_interests;
    if (!sec) return;
    const titleEl = document.getElementById("research-title");
    const listEl = document.getElementById("research-list");
    if (titleEl && sec.title) titleEl.textContent = sec.title;
    if (listEl && Array.isArray(sec.items)) {
      listEl.innerHTML = "";
      sec.items.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        listEl.appendChild(li);
      });
    }
  }

  function applyProjects(data) {
    const sec = data.sections && data.sections.projects;
    if (!sec) return;
    const titleEl = document.getElementById("projects-title");
    const listEl = document.getElementById("projects-list");
    if (titleEl && sec.title) titleEl.textContent = sec.title;
    if (!listEl || !Array.isArray(sec.items)) return;

    listEl.innerHTML = "";
    sec.items.forEach((proj) => {
      const wrapper = document.createElement("div");
      wrapper.className = "project";

      const h3 = document.createElement("h3");
      if (proj.url) {
        const a = document.createElement("a");
        a.href = proj.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = proj.title || "";
        h3.appendChild(a);
      } else {
        h3.textContent = proj.title || "";
      }

      const pDesc = document.createElement("p");
      pDesc.textContent = proj.description || "";

      const pTech = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = "Tech Stack: ";
      pTech.appendChild(strong);
      pTech.appendChild(
        document.createTextNode(proj.tech_stack || "")
      );

      wrapper.appendChild(h3);
      wrapper.appendChild(pDesc);
      wrapper.appendChild(pTech);

      listEl.appendChild(wrapper);
    });
  }

  function applyContact(data) {
    const sec = data.sections && data.sections.contact;
    if (!sec) return;
    const titleEl = document.getElementById("contact-title");
    const bodyEl = document.getElementById("contact-body");
    if (!bodyEl) return;

    if (titleEl && sec.title) titleEl.textContent = sec.title;

    bodyEl.innerHTML = "";

    // Paragraph 1
    const p1 = document.createElement("p");
    p1.appendChild(
      document.createTextNode(
        "For opportunities, collaborations, or technical discussions, reach me at "
      )
    );
    if (sec.email) {
      const aEmail = document.createElement("a");
      aEmail.href = "mailto:" + sec.email;
      aEmail.textContent = sec.email;
      p1.appendChild(aEmail);
    }
    p1.appendChild(document.createTextNode(" or via "));
    if (sec.linkedin_url) {
      const aLinked = document.createElement("a");
      aLinked.href = sec.linkedin_url;
      aLinked.target = "_blank";
      aLinked.rel = "noopener";
      aLinked.textContent = "LinkedIn";
      p1.appendChild(aLinked);
    }
    p1.appendChild(document.createTextNode("."));
    bodyEl.appendChild(p1);

    // Paragraph 2
    if (sec.cal_url) {
      const p2 = document.createElement("p");
      p2.appendChild(
        document.createTextNode("To schedule a meeting directly, use: ")
      );
      const aCal = document.createElement("a");
      aCal.href = sec.cal_url;
      aCal.target = "_blank";
      aCal.rel = "noopener";
      aCal.textContent = sec.cal_url;
      p2.appendChild(aCal);
      p2.appendChild(document.createTextNode("."));
      bodyEl.appendChild(p2);
    }
  }

  function applyAssistantLanding(data) {
    const sec = data.sections && data.sections.assistant_landing;
    if (!sec) return;
    const titleEl = document.getElementById("assistant-title");
    const descEl = document.getElementById("assistant-description");
    if (titleEl && sec.title) titleEl.textContent = sec.title;
    if (descEl && sec.description !== undefined) {
      descEl.textContent = sec.description;
    }
  }

  function applyFooter(data) {
    const footerEl = document.getElementById("footer-text");
    if (!footerEl || !data.footer) return;
    footerEl.textContent = data.footer.text || "";
    const yearEl = document.getElementById("year");
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear().toString();
    }
  }

  document.addEventListener("DOMContentLoaded", loadContent);
})();
