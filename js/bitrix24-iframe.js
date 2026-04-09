(() => {
  const modal = document.getElementById("b24-modal");
  if (!modal) return;

  const closeBtn = modal.querySelector("[data-b24-close]");
  const dialog = modal.querySelector(".mir-modal__dialog");
  const iframe = modal.querySelector("iframe");

  const open = () => {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    if (iframe && iframe.dataset.src) iframe.src = iframe.dataset.src;
  };

  const close = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  };

  if (iframe && !iframe.dataset.src) iframe.dataset.src = iframe.getAttribute("src") || "";

  document.addEventListener("click", (e) => {
    const btn = e.target?.closest?.(".js-b24-open");
    if (!btn) return;
    e.preventDefault();
    open();
  });

  closeBtn?.addEventListener("click", close);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });
  dialog?.addEventListener("click", (e) => e.stopPropagation());
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();

