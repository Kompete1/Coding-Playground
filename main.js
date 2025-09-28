// Mobile navigation toggle and smooth scrolling behaviors
const nav = document.querySelector(".site-nav");
const toggle = nav.querySelector(".menu-toggle");
const menu = nav.querySelector("#primary-menu");
const menuLinks = menu.querySelectorAll("a[href^='#']");

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
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuState(false);
  });
});

// Keep footer year current without manual edits
const yearTarget = document.querySelector("#copyright-year");
if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}
