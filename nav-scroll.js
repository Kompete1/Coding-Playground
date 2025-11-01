// Elevate the navigation once the hero has been scrolled past
(() => {
  const nav = document.querySelector(".site-nav");
  const hero = document.querySelector(".hero");

  if (!nav || !hero) {
    return;
  }

  let scrollTicking = false;
  let resizeTicking = false;
  let scrollThreshold = 0;

  const updateThreshold = () => {
    const heroOffsetTop = hero.offsetTop;
    const heroHeight = hero.offsetHeight;
    const navHeight = nav.offsetHeight;
    scrollThreshold = Math.max(heroOffsetTop + heroHeight - navHeight, 0);
  };

  const applyNavState = () => {
    const shouldCompress = window.scrollY >= scrollThreshold;
    nav.classList.toggle("is-scrolled", shouldCompress);
  };

  const handleScroll = () => {
    if (scrollTicking) {
      return;
    }

    scrollTicking = true;
    window.requestAnimationFrame(() => {
      applyNavState();
      scrollTicking = false;
    });
  };

  const handleResize = () => {
    if (resizeTicking) {
      return;
    }

    resizeTicking = true;
    window.requestAnimationFrame(() => {
      updateThreshold();
      applyNavState();
      resizeTicking = false;
    });
  };

  updateThreshold();
  applyNavState();

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", handleResize);
  window.addEventListener("load", handleResize);
})();
