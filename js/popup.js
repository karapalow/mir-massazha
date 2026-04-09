(() => {
  const modal = document.getElementById("discount-modal");
  if (!modal) return;

  const closeBtn = modal.querySelector("[data-modal-close]");
  const dialog = modal.querySelector(".mir-modal__dialog");

  const SESSION_KEY = "mir_session_id";
  const SHOWN_KEY = "mir_discount_popup_shown_session";

  const getSessionId = () => {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  };

  const isShownThisSession = () => {
    const sessionId = getSessionId();
    return localStorage.getItem(SHOWN_KEY) === sessionId;
  };

  const markShownThisSession = () => {
    localStorage.setItem(SHOWN_KEY, getSessionId());
  };

  const open = () => {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    const firstFocusable = modal.querySelector("input, select, textarea, button, a[href]");
    firstFocusable?.focus?.();
    markShownThisSession();
  };

  const close = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  };

  closeBtn?.addEventListener("click", close);
  modal.addEventListener("click", (e) => {
    const closeEl = e.target?.closest?.("[data-modal-close]");
    if (!closeEl) return;
    close();
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });
  dialog?.addEventListener("click", (e) => e.stopPropagation());

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  // Keep legacy behavior: show discount popup once per session (site-owned).
  window.setTimeout(() => {
    if (!isShownThisSession()) open();
  }, 3000);
})();

