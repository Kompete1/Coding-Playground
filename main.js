// Mobile navigation toggle and smooth scrolling behaviors
const nav = document.querySelector(".site-nav");
const toggle = nav.querySelector(".menu-toggle");
const menu = nav.querySelector("#primary-menu");
const menuLinks = menu.querySelectorAll("a[href^='#']");
const sections = document.querySelectorAll("main > section[id]");
const header = document.querySelector(".site-header");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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
