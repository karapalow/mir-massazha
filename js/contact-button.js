(() => {
  const fabLink = document.querySelector(".mir-fab__btn");
  if (!fabLink) return;

  // If user is already on contact section, do nothing special.
  // Keep this file to allow easy future switch from WhatsApp to form modal.
  fabLink.addEventListener("click", () => {
    // no-op
  });
})();

