// assets/js/profile-assistant.js
// === [PA-FRONTEND-ENTRY] ===
function initProfileAssistant(config) {
  const mountId = config.mountId || "profile-chat-root";
  const endpoint = config.endpoint;
  const mountEl = document.getElementById(mountId);
  if (!mountEl || !endpoint) return;

  // ---- State ----
  const state = {
    messages: [], // { id, role, content, status: 'sent' | 'delivered' }
    sending: false,
    nextId: 1,
  };

  // ---- DOM ----
  const wrapper = document.createElement("div");
  wrapper.className = "pa-chat-card";

  // Header with orb
  const header = document.createElement("div");
  header.className = "pa-chat-header";

  const orb = document.createElement("div");
  orb.className = "pa-orb pa-orb--idle";

  const headerText = document.createElement("div");
  headerText.className = "pa-header-text";
  headerText.textContent = "Click to interact with Surya's assistant";

  header.appendChild(orb);
  header.appendChild(headerText);

  // Messages area
  const messagesEl = document.createElement("div");
  messagesEl.className = "pa-messages";

  // Input area
  const inputRow = document.createElement("div");
  inputRow.className = "pa-input-row";

  const input = document.createElement("textarea");
  input.className = "pa-input";
  input.rows = 2;
  input.placeholder = "Ask about projects, tech stack, or how we can work together…";

  const sendBtn = document.createElement("button");
  sendBtn.className = "pa-send-button";
  sendBtn.textContent = "Send";

  inputRow.appendChild(input);
  inputRow.appendChild(sendBtn);

  wrapper.appendChild(header);
  wrapper.appendChild(messagesEl);
  wrapper.appendChild(inputRow);

  mountEl.appendChild(wrapper);

  // ---- Orb state handling ----
  function setOrbState(stateName) {
    orb.classList.remove("pa-orb--idle", "pa-orb--processing", "pa-orb--responding");
    orb.classList.add("pa-orb--" + stateName);
  }

  // ---- Rendering messages ----
  function renderMessages() {
    messagesEl.innerHTML = "";

    state.messages.forEach((msg) => {
      const row = document.createElement("div");
      row.className = "pa-message-row pa-message-row--" + msg.role;

      const bubble = document.createElement("div");
      bubble.className = "pa-message-bubble pa-message-bubble--" + msg.role;
      bubble.textContent = msg.content;

      row.appendChild(bubble);

      if (msg.role === "user") {
        const ticks = document.createElement("span");
        ticks.className = "pa-message-ticks";

        if (msg.status === "sent") {
          ticks.textContent = "✓";
        } else if (msg.status === "delivered") {
          ticks.textContent = "✓✓";
        } else {
          ticks.textContent = "";
        }

        row.appendChild(ticks);
      }

      messagesEl.appendChild(row);
    });

    // Scroll to bottom
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // ---- Send logic ----
  async function sendMessage() {
    const text = input.value.trim();
    if (!text || state.sending) return;

    state.sending = true;
    headerText.textContent = "Assistant is processing…";
    setOrbState("processing");

    // Add user message with single tick
    const id = state.nextId++;
    state.messages.push({
      id,
      role: "user",
      content: text,
      status: "sent",
    });
    renderMessages();

    input.value = "";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      // Round trip completed, upgrade tick
      const userMsg = state.messages.find((m) => m.id === id);
      if (userMsg) {
        userMsg.status = "delivered";
      }

      if (!res.ok) {
        throw new Error("Server error");
      }

      const data = await res.json();
      const replyText = (data && data.reply) || "Sorry, I couldn't generate a response.";

      // Show assistant reply
      setOrbState("responding");
      headerText.textContent = "Assistant is responding…";

      state.messages.push({
        id: state.nextId++,
        role: "assistant",
        content: replyText,
        status: null,
      });

      renderMessages();
    } catch (err) {
      // Error message from assistant
      state.messages.push({
        id: state.nextId++,
        role: "assistant",
        content: "Sorry, something went wrong talking to my backend.",
        status: null,
      });
      renderMessages();
    } finally {
      state.sending = false;
      headerText.textContent = "Click to interact with Surya's assistant";
      setOrbState("idle");
    }
  }

  // ---- Event handlers ----
  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Clicking header focuses input
  header.addEventListener("click", () => {
    input.focus();
  });

  // Initial render
  setOrbState("idle");
  renderMessages();
}
