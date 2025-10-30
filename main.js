// Mobile navigation toggle and smooth scrolling behaviors
const nav = document.querySelector(".site-nav");
const toggle = nav.querySelector(".menu-toggle");
const menu = nav.querySelector("#primary-menu");
const menuLinks = menu.querySelectorAll("a[href^='#']");
const sections = document.querySelectorAll("main > section[id]");
const header = document.querySelector(".site-header");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
const themeToggle = document.querySelector(".theme-toggle");
const themeToggleLabel = themeToggle?.querySelector(".theme-toggle__label");
const themeStorageKey = "preferred-theme";
const rootElement = document.documentElement;

const updateHeaderScrollState = () => {
  if (!header) return;
  const shouldElevate = window.scrollY > 8;
  header.classList.toggle("is-scrolled", shouldElevate);
};

let isUpdatingHeaderState = false;

const handleHeaderScroll = () => {
  if (isUpdatingHeaderState) return;
  isUpdatingHeaderState = true;
  window.requestAnimationFrame(() => {
    updateHeaderScrollState();
    isUpdatingHeaderState = false;
  });
};

updateHeaderScrollState();

window.addEventListener("scroll", handleHeaderScroll, { passive: true });

function getStoredTheme() {
  try {
    const storedValue = window.localStorage.getItem(themeStorageKey);
    if (storedValue === "light" || storedValue === "dark") {
      return storedValue;
    }
    return null;
  }

  function persistTheme(theme) {
    try {
      window.localStorage.setItem(themeStorageKey, theme);
    } catch (_) {
      // Ignore storage errors (e.g., privacy mode).
    }
  }

  function updateToggleUI(theme) {
    if (!themeToggle) return;
    const isDark = theme === "dark";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    if (themeToggleLabel) {
      themeToggleLabel.textContent = isDark ? "Dark" : "Light";
    }
  }

  function applyTheme(theme, { persist = false } = {}) {
    const normalizedTheme = theme === "dark" ? "dark" : "light";
    rootElement.setAttribute("data-theme", normalizedTheme);
    updateToggleUI(normalizedTheme);
    if (persist) {
      persistTheme(normalizedTheme);
    }
  }

  const storedTheme = getStoredTheme();
  applyTheme(storedTheme ?? (prefersDarkScheme.matches ? "dark" : "light"));

  prefersDarkScheme.addEventListener("change", (event) => {
    if (getStoredTheme()) {
      return;
    }
    applyTheme(event.matches ? "dark" : "light");
  });

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = rootElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(nextTheme, { persist: true });
    });
  }

  window.addEventListener("storage", (event) => {
    if (event.key !== themeStorageKey) {
      return;
    }
    if (event.newValue === "light" || event.newValue === "dark") {
      applyTheme(event.newValue);
    } else if (!event.newValue) {
      applyTheme(prefersDarkScheme.matches ? "dark" : "light");
    }
  });

  // Helper updates ARIA state and class list in tandem
  function setMenuState(isOpen) {
    toggle.setAttribute("aria-expanded", String(isOpen));
    menu.setAttribute("aria-hidden", String(!isOpen));
    menu.classList.toggle("is-open", isOpen);
  }

  setMenuState(false);

  toggle.addEventListener("click", () => {
    const isExpanded = toggle.getAttribute("aria-expanded") === "true";
    setMenuState(!isExpanded);
  });

  // Collapse menu after navigating and enable smooth scroll
  menuLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      const target = document.querySelector(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();
      const headerOffset = header?.offsetHeight ?? 0;
      const targetTop = target.getBoundingClientRect().top + window.scrollY;
      const scrollOptions = {
        top: targetTop - headerOffset - 8,
        behavior: prefersReducedMotion.matches ? "auto" : "smooth",
      };
      window.scrollTo(scrollOptions);
      setMenuState(false);
    });
  });

  // Keep footer year current without manual edits
  const yearTarget = document.querySelector("#copyright-year");
  if (yearTarget) {
    yearTarget.textContent = new Date().getFullYear();
  }

  const linkBySection = new Map(
    Array.from(menuLinks).map((link) => [link.getAttribute("href")?.replace("#", ""), link]),
  );

  function updateActiveLink(activeId) {
    linkBySection.forEach((link, sectionId) => {
      if (!sectionId) return;
      const isActive = sectionId === activeId;
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const inView = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (inView.length > 0) {
        updateActiveLink(inView[0].target.id);
      }
    },
    {
      rootMargin: "-40% 0px -40% 0px",
      threshold: [0.25, 0.5, 0.75],
    },
  );

  sections.forEach((section) => observer.observe(section));

  const backToTopButton = document.querySelector(".back-to-top");
  if (backToTopButton) {
    const visibilityOffset = 400;
    let isUpdatingVisibility = false;

    const updateBackToTopVisibility = () => {
      const shouldShow = window.scrollY > visibilityOffset;
      backToTopButton.classList.toggle("is-visible", shouldShow);
      isUpdatingVisibility = false;
    };

    updateBackToTopVisibility();

    window.addEventListener("scroll", () => {
      if (!isUpdatingVisibility) {
        isUpdatingVisibility = true;
        window.requestAnimationFrame(updateBackToTopVisibility);
      }
    });

    backToTopButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion.matches ? "auto" : "smooth",
      });
    });
  }

  const contactForm = document.querySelector("#contact-form");
  if (contactForm) {
    const statusRegion = document.querySelector("#form-status");
    const fieldConfigs = [
      {
        input: contactForm.querySelector("#name"),
        error: contactForm.querySelector("#name-error"),
        type: "name",
      },
      {
        input: contactForm.querySelector("#email"),
        error: contactForm.querySelector("#email-error"),
        type: "email",
      },
      {
        input: contactForm.querySelector("#message"),
        error: contactForm.querySelector("#message-error"),
        type: "message",
      },
    ];
    let statusTimeoutId;

    function setError(input, errorNode, message) {
      if (!errorNode || !input) return;
      errorNode.textContent = message;
      if (message) {
        input.setAttribute("aria-invalid", "true");
      } else {
        input.removeAttribute("aria-invalid");
      }
    }

    function validateField({ input, error, type }) {
      if (!input || !error) return true;

      const trimmedValue = input.value.trim();
      let message = "";

      if (!trimmedValue) {
        message = `Please enter your ${type === "message" ? "message" : type}.`;
      } else if (type === "email" && input.type === "email" && input.validity.typeMismatch) {
        message = "Please enter a valid email address.";
      } else if (type === "message" && trimmedValue.length < 10) {
        message = "Your message should be at least 10 characters.";
      }

      input.setCustomValidity(message);
      setError(input, error, message);

      return message === "";
    }

    function clearStatus() {
      if (statusTimeoutId) {
        clearTimeout(statusTimeoutId);
        statusTimeoutId = undefined;
      }
      if (statusRegion) {
        statusRegion.textContent = "";
      }
    }

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      clearStatus();

      let firstInvalidField = null;
      fieldConfigs.forEach((config) => {
        const isValid = validateField(config);
        if (!isValid && !firstInvalidField) {
          firstInvalidField = config.input;
        }
      });

      if (firstInvalidField) {
        firstInvalidField.focus();
        return;
      }

      contactForm.reset();
      fieldConfigs.forEach(({ input, error }) => {
        if (input && error) {
          setError(input, error, "");
        }
      });

      if (statusRegion) {
        statusRegion.textContent = "Thanks! This is a demo; no message was sent.";
        statusTimeoutId = window.setTimeout(() => {
          if (statusRegion.textContent === "Thanks! This is a demo; no message was sent.") {
            statusRegion.textContent = "";
          }
        }, 4500);
      }
    });

    fieldConfigs.forEach((config) => {
      const { input } = config;
      if (!input) {
        return;
      }

      input.addEventListener("input", () => {
        validateField(config);
      });
    });
  }

  function formatCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  function updateClock() {
    const clockElement = document.querySelector("#clock");
    if (!clockElement) {
      return false;
    }
    clockElement.textContent = formatCurrentTime();
    return true;
  }

  if (updateClock()) {
    window.setInterval(updateClock, 60000);
  }
});
