(function () {
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
  const themeStorageKey = "preferred-theme";
  const rootElement = document.documentElement;

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
    const toggles = document.querySelectorAll(".theme-toggle");
    const isDark = theme === "dark";

    toggles.forEach((themeToggle) => {
      const themeToggleLabel = themeToggle.querySelector(".theme-toggle__label");
      themeToggle.setAttribute("aria-pressed", String(isDark));
      themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");

      if (themeToggleLabel) {
        themeToggleLabel.textContent = isDark ? "Dark" : "Light";
      }
    });
  }

  function applyTheme(theme, { persist = false } = {}) {
    const normalizedTheme = theme === "dark" ? "dark" : "light";
    rootElement.setAttribute("data-theme", normalizedTheme);
    updateToggleUI(normalizedTheme);

    if (persist) {
      persistTheme(normalizedTheme);
    }
  }

  function toggleTheme() {
    const currentTheme = rootElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(nextTheme, { persist: true });
  }

  function bindToggleHandlers() {
    document.querySelectorAll(".theme-toggle").forEach((themeToggle) => {
      if (themeToggle.dataset.themeToggleBound === "true") {
        return;
      }
      themeToggle.dataset.themeToggleBound = "true";
      themeToggle.addEventListener("click", toggleTheme);
    });
  }

  const storedTheme = getStoredTheme();
  applyTheme(storedTheme ?? (prefersDarkScheme.matches ? "dark" : "light"));
  bindToggleHandlers();

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

  window.cpThemeToggle = {
    bindToggleHandlers,
    applyTheme,
  };
})();
