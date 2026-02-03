(function () {
  const headers = document.querySelectorAll("[data-experiment-header]");
  if (!headers.length) return;

  function normalizeBase(basePath) {
    if (!basePath) return "/";
    if (basePath === "./") return "./";
    const cleaned = basePath.trim().replace(/\/+/g, "/");
    return cleaned.endsWith("/") ? cleaned : cleaned + "/";
  }

  async function canReach(pathname) {
    try {
      const response = await fetch(pathname, { method: "GET", cache: "no-store" });
      return response.ok;
    } catch (_) {
      return false;
    }
  }

  async function resolveBasePath() {
    const explicitBase =
      document.documentElement.getAttribute("data-site-base") ||
      document.querySelector('meta[name="cp-site-base"]')?.getAttribute("content");
    if (explicitBase) return normalizeBase(explicitBase);

    if (window.location.protocol === "file:") {
      return "./";
    }

    const segments = window.location.pathname.split("/").filter(Boolean);
    const trailing = segments[segments.length - 1] || "";
    const maxDepth = trailing.includes(".") ? segments.length - 1 : segments.length;
    const tried = new Set();

    for (let depth = maxDepth; depth >= 0; depth -= 1) {
      const base = "/" + segments.slice(0, depth).join("/") + (depth ? "/" : "");
      if (tried.has(base)) continue;
      tried.add(base);
      if (await canReach(base + "lab.html")) {
        return normalizeBase(base);
      }
    }

    if (
      window.location.hostname.endsWith("github.io") &&
      segments.length > 0 &&
      !segments[0].includes(".")
    ) {
      return normalizeBase("/" + segments[0] + "/");
    }

    return "/";
  }

  function pageUrl(basePath, pageName) {
    if (basePath === "./") return pageName;
    return basePath + pageName;
  }

  function renderHeader(headerEl, basePath) {
    const experimentName = headerEl.getAttribute("data-experiment-name") || "Experiment";
    const homeHref = pageUrl(basePath, "index.html");
    const labHref = pageUrl(basePath, "lab.html");

    headerEl.setAttribute("role", "banner");
    headerEl.innerHTML = [
      '<div class="cp-exp-header__left">',
      `  <a class="cp-exp-header__brand" href="${homeHref}">Coding Playground</a>`,
      '  <span class="cp-exp-header__sep" aria-hidden="true">/</span>',
      `  <span class="cp-exp-header__title">${experimentName}</span>`,
      "</div>",
      '<nav class="cp-exp-header__right" aria-label="Experiment page navigation">',
      `  <a class="cp-exp-header__home" href="${homeHref}">Home</a>`,
      `  <a class="cp-exp-header__lab" href="${labHref}">Back to Lab</a>`,
      "</nav>",
    ].join("\n");
  }

  resolveBasePath().then((basePath) => {
    headers.forEach((headerEl) => {
      renderHeader(headerEl, basePath);
    });
  });
})();
