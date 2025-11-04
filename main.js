const themeStorageKey = "preferred-theme";
const rootElement = document.documentElement;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
const mobileNavBreakpoint = window.matchMedia("(max-width: 45rem)");

let themeToggleButton = null;
let themeToggleLabel = null;
let clockIntervalId = null;

const FALLBACK_HEADER_HTML = `
<header class="site-header" role="banner">
  <nav class="site-nav" aria-label="Primary navigation">
    <a class="brand" href="index.html" aria-label="Site home">Brand</a>
    <button class="theme-toggle" type="button" aria-pressed="false" aria-label="Toggle color theme">
      <span class="theme-toggle__icon" aria-hidden="true"></span>
      <span class="theme-toggle__label">Theme</span>
    </button>
    <span id="clock" aria-live="polite"></span>
    <ul id="primary-menu" class="nav-links is-open" aria-hidden="false">
      <li><a href="index.html">Home</a></li>
      <li><a href="index.html#features">Features</a></li>
      <li><a href="about.html">About</a></li>
      <li><a href="contact.html">Contact</a></li>
    </ul>
  </nav>
</header>
`;

const FALLBACK_FOOTER_HTML = `
<footer class="site-footer" role="contentinfo">
  <div class="footer-inner">
    <p class="footer-copy">
      &copy; <span id="copyright-year"></span> Starter Landing Page. All rights reserved.
    </p>
    <nav class="footer-nav" aria-label="Footer navigation">
      <ul class="footer-links">
        <li><a href="index.html">Home</a></li>
        <li><a href="index.html#features">Features</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="contact.html">Contact</a></li>
        <li><a href="#top">Back to top</a></li>
      </ul>
    </nav>
  </div>
</footer>
`;

function getStoredTheme() {
  try {
    const storedValue = window.localStorage.getItem(themeStorageKey);
    if (storedValue === "light" || storedValue === "dark") {
      return storedValue;
    }
    return null;
  } catch (_) {
    return null;
  }
}

function persistTheme(theme) {
  try {
    window.localStorage.setItem(themeStorageKey, theme);
  } catch (_) {
    // Ignore storage errors (e.g., privacy mode).
  }
}

function updateToggleUI(theme) {
  if (!themeToggleButton) return;
  const isDark = theme === "dark";
  themeToggleButton.setAttribute("aria-pressed", String(isDark));
  themeToggleButton.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
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

async function loadPartial(container, url, fallbackContent) {
  if (!container) return false;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.status}`);
    }
    const markup = await response.text();
    container.innerHTML = markup;
    return true;
  } catch (error) {
    console.warn(`Unable to load partial: ${url}`, error);
    container.innerHTML = fallbackContent;
    return false;
  }
}

function getCurrentPage() {
  const rawPath = window.location.pathname.split("/").pop();
  return rawPath && rawPath !== "" ? rawPath : "index.html";
}

function setPageActiveLinks(root = document) {
  const currentPage = getCurrentPage();
  const pageLinks = root.querySelectorAll(".site-nav a[href], .footer-nav a[href]");
  pageLinks.forEach((link) => {
    const href = link.getAttribute("href") ?? "";
    if (href.startsWith("#")) {
      link.removeAttribute("aria-current");
      return;
    }
    const hashIndex = href.indexOf("#");
    if (hashIndex !== -1) {
      link.removeAttribute("aria-current");
      return;
    }
    const normalizedPath = href === "" ? "index.html" : href;
    if (normalizedPath === currentPage) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function initializeNavigation() {
  const header = document.querySelector(".site-header");
  if (!header) {
    return;
  }

  const nav = header.querySelector(".site-nav");
  const menu = nav?.querySelector("#primary-menu");
  const toggle = nav?.querySelector(".menu-toggle");

  themeToggleButton = nav?.querySelector(".theme-toggle") ?? null;
  themeToggleLabel = themeToggleButton?.querySelector(".theme-toggle__label") ?? null;
  const currentTheme = rootElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  updateToggleUI(currentTheme);

  if (themeToggleButton && !themeToggleButton.dataset.enhanced) {
    themeToggleButton.addEventListener("click", () => {
      const activeTheme = rootElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const nextTheme = activeTheme === "dark" ? "light" : "dark";
      applyTheme(nextTheme, { persist: true });
    });
    themeToggleButton.dataset.enhanced = "true";
  }

  if (menu && !toggle) {
    menu.removeAttribute("aria-hidden");
    menu.classList.add("is-open");
  }

  if (!header.dataset.scrollEnhanced) {
    const updateHeaderScrollState = () => {
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
    header.dataset.scrollEnhanced = "true";
  }

  if (!menu) {
    return;
  }

  const currentPage = getCurrentPage();
  const sectionLinks = Array.from(menu.querySelectorAll("a[href]")).filter((link) => {
    const href = link.getAttribute("href") ?? "";
    const hashIndex = href.indexOf("#");
    if (hashIndex === -1) {
      return false;
    }
    const sectionId = href.slice(hashIndex + 1);
    if (!sectionId) {
      return false;
    }
    const pathPart = href.slice(0, hashIndex);
    const normalizedPath = pathPart === "" ? currentPage : pathPart;
    return normalizedPath === currentPage;
  });

  const sections = Array.from(document.querySelectorAll("main > section[id]"));
  const linkBySection = new Map();

  sectionLinks.forEach((link) => {
    const href = link.getAttribute("href") ?? "";
    const hashIndex = href.indexOf("#");
    if (hashIndex === -1) {
      return;
    }
    const sectionId = href.slice(hashIndex + 1);
    if (!sectionId) {
      return;
    }
    linkBySection.set(sectionId, link);
  });

  let closeMenu = () => {};

  if (toggle && !toggle.dataset.menuEnhanced) {
    let isMenuOpen = false;

    const updateMenuPresentation = () => {
      if (mobileNavBreakpoint.matches) {
        toggle.setAttribute("aria-expanded", String(isMenuOpen));
        menu.setAttribute("aria-hidden", String(!isMenuOpen));
        menu.classList.toggle("is-open", isMenuOpen);
      } else {
        toggle.setAttribute("aria-expanded", "false");
        menu.removeAttribute("aria-hidden");
        menu.classList.add("is-open");
      }
    };

    const setMenuState = (isOpen) => {
      isMenuOpen = isOpen;
      updateMenuPresentation();
    };

    setMenuState(false);

    if (typeof mobileNavBreakpoint.addEventListener === "function") {
      mobileNavBreakpoint.addEventListener("change", updateMenuPresentation);
    } else if (typeof mobileNavBreakpoint.addListener === "function") {
      mobileNavBreakpoint.addListener(updateMenuPresentation);
    }

    toggle.addEventListener("click", () => {
      setMenuState(!isMenuOpen);
    });

    closeMenu = () => setMenuState(false);
    toggle.dataset.menuEnhanced = "true";
  }

  sectionLinks.forEach((link) => {
    if (link.dataset.smoothScrollEnhanced) {
      return;
    }
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href") ?? "";
      const hashIndex = href.indexOf("#");
      if (hashIndex === -1) {
        return;
      }
      const pathPart = href.slice(0, hashIndex);
      const sectionId = href.slice(hashIndex + 1);
      if (!sectionId) {
        return;
      }
      const normalizedPath = pathPart === "" ? currentPage : pathPart;
      if (normalizedPath !== currentPage) {
        return;
      }

      const target = document.getElementById(sectionId);
      if (!target) {
        return;
      }

      event.preventDefault();

      const headerOffset = header.offsetHeight ?? 0;
      const targetTop = target.getBoundingClientRect().top + window.scrollY;
      const scrollOptions = {
        top: targetTop - headerOffset - 8,
        behavior: prefersReducedMotion.matches ? "auto" : "smooth",
      };
      window.scrollTo(scrollOptions);
      closeMenu();
    });
    link.dataset.smoothScrollEnhanced = "true";
  });

  if (sections.length > 0 && linkBySection.size > 0) {
    const updateActiveLink = (activeId) => {
      linkBySection.forEach((link, sectionId) => {
        if (!sectionId) return;
        if (sectionId === activeId) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

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
  }
}

function initBackToTop() {
  const backToTopButton = document.querySelector(".back-to-top");
  if (!backToTopButton) {
    return;
  }

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

function initContactForm() {
  const contactForm = document.querySelector("#contact-form");
  if (!contactForm) {
    return;
  }

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

function startClock() {
  if (clockIntervalId !== null) {
    window.clearInterval(clockIntervalId);
    clockIntervalId = null;
  }

  if (updateClock()) {
    clockIntervalId = window.setInterval(updateClock, 60000);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const headerContainer = document.querySelector("#site-header");
  const footerContainer = document.querySelector("#site-footer");

  await Promise.all([
    loadPartial(headerContainer, "partials/header.html", FALLBACK_HEADER_HTML),
    loadPartial(footerContainer, "partials/footer.html", FALLBACK_FOOTER_HTML),
  ]);

  initializeNavigation();
  setPageActiveLinks();
  initBackToTop();
  initContactForm();
  startClock();

  const yearTarget = document.querySelector("#copyright-year");
  if (yearTarget) {
    yearTarget.textContent = new Date().getFullYear();
  }
});
