const AUTO_SCROLL_INTERVAL = 6000;
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

function initCarousel(carousel) {
  const track = carousel.querySelector("[data-carousel-track]") || carousel;
  const cards = Array.from(track.querySelectorAll(".testimonial-card"));
  const dots = Array.from(carousel.querySelectorAll("[data-carousel-dot]"));

  cards.forEach((card) => {
    if (!card.hasAttribute("tabindex")) {
      card.setAttribute("tabindex", "-1");
    }
  });

  if (cards.length <= 1) {
    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === 0);
      dot.setAttribute("aria-pressed", String(index === 0));
    });
    return;
  }

  let positions = [];
  let currentIndex = 0;
  let autoScrollId = null;
  let scrollFrameId = null;

  function computePositions() {
    positions = cards.map((card) => card.offsetLeft - track.offsetLeft);
  }

  function updateDots() {
    dots.forEach((dot, index) => {
      const isActive = index === currentIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-pressed", String(isActive));
    });
  }

  function scrollToIndex(index, { instant = false, focus = false } = {}) {
    const total = cards.length;
    const nextIndex = (index + total) % total;
    currentIndex = nextIndex;
    const targetLeft = positions[nextIndex] ?? 0;
    const behavior = instant || motionPreference.matches ? "auto" : "smooth";
    track.scrollTo({ left: targetLeft, behavior });
    updateDots();

    if (focus) {
      const targetCard = cards[nextIndex];
      if (targetCard) {
        targetCard.focus({ preventScroll: true });
      }
    }
  }

  function stopAutoScroll() {
    if (autoScrollId !== null) {
      window.clearInterval(autoScrollId);
      autoScrollId = null;
    }
  }

  function startAutoScroll() {
    if (motionPreference.matches || autoScrollId !== null || carousel.matches(":hover")) {
      return;
    }
    autoScrollId = window.setInterval(() => {
      scrollToIndex(currentIndex + 1);
    }, AUTO_SCROLL_INTERVAL);
  }

  function resetAutoScroll() {
    stopAutoScroll();
    startAutoScroll();
  }

  function updateCurrentIndexFromScroll() {
    scrollFrameId = null;
    const scrollMidpoint = track.scrollLeft + track.offsetWidth / 2;
    let closestIndex = currentIndex;
    let closestDistance = Number.POSITIVE_INFINITY;

    positions.forEach((position, index) => {
      const cardWidth = cards[index].offsetWidth;
      const cardMidpoint = position + cardWidth / 2;
      const distance = Math.abs(scrollMidpoint - cardMidpoint);
      if (distance < closestDistance) {
        closestIndex = index;
        closestDistance = distance;
      }
    });

    if (closestIndex !== currentIndex) {
      currentIndex = closestIndex;
      updateDots();
      resetAutoScroll();
    }
  }

  track.addEventListener("scroll", () => {
    if (scrollFrameId !== null) {
      window.cancelAnimationFrame(scrollFrameId);
    }
    scrollFrameId = window.requestAnimationFrame(updateCurrentIndexFromScroll);
  });

  track.addEventListener("pointerdown", stopAutoScroll);
  track.addEventListener("pointerup", startAutoScroll);
  track.addEventListener("wheel", stopAutoScroll, { passive: true });
  track.addEventListener("touchstart", stopAutoScroll, { passive: true });
  track.addEventListener("touchend", startAutoScroll);

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      scrollToIndex(index, { focus: true });
      resetAutoScroll();
    });

    dot.addEventListener("focus", stopAutoScroll);
    dot.addEventListener("blur", () => {
      if (!carousel.contains(document.activeElement)) {
        startAutoScroll();
      }
    });
  });

  carousel.addEventListener("mouseenter", stopAutoScroll);
  carousel.addEventListener("mouseleave", startAutoScroll);

  carousel.addEventListener("focusin", stopAutoScroll);
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) {
      startAutoScroll();
    }
  });

  const handleMotionPreferenceChange = () => {
    if (motionPreference.matches) {
      stopAutoScroll();
    } else {
      startAutoScroll();
    }
  };

  if (typeof motionPreference.addEventListener === "function") {
    motionPreference.addEventListener("change", handleMotionPreferenceChange);
  } else if (typeof motionPreference.addListener === "function") {
    motionPreference.addListener(handleMotionPreferenceChange);
  }

  function handleResize() {
    computePositions();
    scrollToIndex(currentIndex, { instant: true });
  }

  window.addEventListener("resize", handleResize);
  window.addEventListener("load", handleResize);

  computePositions();
  updateDots();
  scrollToIndex(currentIndex, { instant: true });
  startAutoScroll();
}

window.addEventListener("DOMContentLoaded", () => {
  const carousels = document.querySelectorAll("[data-carousel]");
  carousels.forEach((carousel) => initCarousel(carousel));
});
