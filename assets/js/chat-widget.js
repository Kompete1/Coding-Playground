const CHAT_FAQS = [
  {
    question: "What is this site about?",
    answer:
      "A simple multi-page playground where I practice GitHub, Windsurf, and Codex—with tiny, safe enhancements.",
  },
  {
    question: "How often is it updated?",
    answer: "Small changes land as pull requests. You can usually spot updates weekly.",
  },
  {
    question: "Can I use this code?",
    answer:
      "Yes, it’s a learning repo. Feel free to explore, but check the license file for details.",
  },
  {
    question: "Is there a real backend?",
    answer: "Not yet. This is a front-end demo. A real backend comes later.",
  },
  {
    question: "How do I report an issue?",
    answer: "Open a GitHub Issue in this repo with steps, browser, and a screenshot.",
  },
];

const state = {
  panel: null,
  bubble: null,
  thread: null,
  heading: null,
  closeButton: null,
  lastFocused: null,
};

document.addEventListener("DOMContentLoaded", () => {
  state.bubble = createBubble();
  state.panel = createPanel();
  state.thread = state.panel.querySelector(".chat-widget-thread");
  state.heading = state.panel.querySelector(".chat-widget-title");
  state.closeButton = state.panel.querySelector("[data-close]");

  document.body.append(state.bubble, state.panel);

  bindBubble();
  bindPanel();
});

function createBubble() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "chat-widget-bubble";
  button.setAttribute("aria-label", "Open site helper chat");
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-haspopup", "dialog");

  const icon = document.createElement("span");
  icon.className = "chat-widget-bubble-icon";
  icon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-3.5l-3.8 3.2a1 1 0 0 1-1.7-.76V17H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/>
    </svg>
  `;

  button.append(icon);
  return button;
}

function createPanel() {
  const panel = document.createElement("section");
  panel.className = "chat-widget-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.hidden = true;

  const headingId = "chat-widget-title";

  const header = document.createElement("header");
  header.className = "chat-widget-header";

  const title = document.createElement("h2");
  title.className = "chat-widget-title";
  title.id = headingId;
  title.tabIndex = -1;
  title.textContent = "Site Helper";

  panel.setAttribute("aria-labelledby", headingId);

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "chat-widget-close";
  closeButton.setAttribute("aria-label", "Close site helper chat");
  closeButton.setAttribute("data-close", "");
  closeButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M6.3 5.3a1 1 0 0 1 1.4 0L12 9.59l4.3-4.3a1 1 0 0 1 1.4 1.42L13.41 11l4.3 4.3a1 1 0 0 1-1.42 1.4L12 12.41l-4.3 4.3a1 1 0 0 1-1.4-1.42L10.59 11l-4.3-4.3a1 1 0 0 1 0-1.4Z"/>
    </svg>
  `;

  header.append(title, closeButton);

  const body = document.createElement("div");
  body.className = "chat-widget-body";

  const faqList = document.createElement("div");
  faqList.className = "chat-widget-faqs";
  faqList.setAttribute("role", "list");

  CHAT_FAQS.forEach((faq, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = faq.question;
    button.setAttribute("data-faq", String(index));
    button.setAttribute("aria-describedby", headingId);
    faqList.append(button);
  });

  const thread = document.createElement("div");
  thread.className = "chat-widget-thread";
  thread.setAttribute("aria-live", "polite");
  thread.setAttribute("aria-label", "Chat transcript");

  body.append(faqList, thread);
  panel.append(header, body);

  return panel;
}

function bindBubble() {
  state.bubble.addEventListener("click", () => togglePanel(state.panel.hidden));
  state.bubble.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      togglePanel(state.panel.hidden);
    }
  });
}

function bindPanel() {
  state.closeButton.addEventListener("click", () => togglePanel(false));

  state.panel.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLButtonElement && target.hasAttribute("data-faq")) {
      const index = Number(target.getAttribute("data-faq"));
      renderFaq(index);
    }
  });

  state.panel.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      togglePanel(false);
      return;
    }

    if (event.key === "Tab") {
      trapFocus(event);
    }
  });
}

function togglePanel(shouldOpen) {
  if (shouldOpen) {
    if (!state.panel.hidden) {
      return;
    }
    state.lastFocused = document.activeElement;
    state.panel.hidden = false;
    state.bubble.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => {
      state.heading.focus({ preventScroll: true });
    });
  } else {
    if (state.panel.hidden) {
      return;
    }
    state.panel.hidden = true;
    state.bubble.setAttribute("aria-expanded", "false");
    if (state.lastFocused && typeof state.lastFocused.focus === "function") {
      state.lastFocused.focus();
    } else {
      state.bubble.focus();
    }
    state.lastFocused = null;
  }
}

function trapFocus(event) {
  const focusableSelectors = [
    'button:not([disabled])',
    '[href]',
    '[tabindex]:not([tabindex="-1"])',
  ];

  const focusable = state.panel.querySelectorAll(focusableSelectors.join(","));
  if (!focusable.length) {
    event.preventDefault();
    state.heading.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;

  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
    return;
  }

  if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

function renderFaq(index) {
  const faq = CHAT_FAQS[index];
  if (!faq) return;

  addMessage("user", faq.question);
  addMessage("assistant", faq.answer);
}

function addMessage(role, text) {
  const message = document.createElement("div");
  message.className = "chat-widget-message";
  message.setAttribute("data-role", role);
  message.textContent = text;
  state.thread.append(message);
  state.thread.scrollTop = state.thread.scrollHeight;
}
