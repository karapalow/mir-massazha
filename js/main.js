document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav__toggle");
  const navList = document.querySelector(".nav__list");
  const header = document.querySelector(".header");

  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const scrollBehavior = prefersReducedMotion ? "auto" : "smooth";

  const getHeaderOffset = () => {
    if (!header) return 0;
    // Add a small gap so the target doesn't sit directly under the header.
    return Math.ceil(header.getBoundingClientRect().height) + 14;
  };

  const scrollToElement = (el, behavior = scrollBehavior) => {
    if (!el) return false;

    const headerOffset = getHeaderOffset();
    const targetTop = el.getBoundingClientRect().top + window.scrollY - headerOffset;

    window.scrollTo({ top: Math.max(0, targetTop), behavior });
    return true;
  };

  const scrollToHash = (hash, behavior = scrollBehavior) => {
    if (!hash || hash === "#") return false;
    const id = hash.startsWith("#") ? hash.slice(1) : hash;
    const target = document.getElementById(id);

    if (!target) return false;

    // Keep the URL in sync without the browser's default jump.
    try {
      history.replaceState(null, "", `#${id}`);
    } catch {
      // Ignore if history manipulation is not allowed.
    }

    return scrollToElement(target, behavior);
  };

  // Mobile nav toggle (class-based). This is intentionally minimal and doesn't prevent scrolling.
  if (navToggle && navList) {
    navToggle.addEventListener("click", () => {
      navList.classList.toggle("nav__list--open");
    });
  }

  // Close the mobile dropdown after clicking a nav item.
  // This prevents the header from feeling "expanded" after navigation.
  if (navList) {
    navList.addEventListener("click", (e) => {
      const clickedLink = e.target?.closest?.("a");
      if (!clickedLink) return;
      navList.classList.remove("nav__list--open");
    });
  }

  // Handle deep-links / reloads with location.hash.
  if (window.location.hash) {
    // Wait a tick for layout (sticky header height) to settle.
    window.setTimeout(() => {
      const ok = scrollToHash(window.location.hash, "auto");
      // If it didn't work yet (late DOM), try once more.
      if (!ok) window.setTimeout(() => scrollToHash(window.location.hash, scrollBehavior), 100);
    }, 0);
  }

  // Intercept in-page anchor clicks (#section only), then scroll with offset.
  document.addEventListener("click", (e) => {
    const a = e.target?.closest?.('a[href^="#"]');
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href || href === "#") return;

    const id = href.slice(1);
    const target = document.getElementById(id);

    // Debug: log every anchor click for verification.
    // eslint-disable-next-line no-console
    console.debug("[AnchorNav] click", { href, id, targetFound: Boolean(target) });

    if (!target) return; // Let the browser handle it (will just jump nowhere).

    e.preventDefault();
    scrollToHash(href, scrollBehavior);
  });
});

