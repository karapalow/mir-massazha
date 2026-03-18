(() => {
  const root = document.querySelector("[data-carousel]");
  if (!root) return;

  const track = root.querySelector("[data-track]");
  const prev = root.querySelector("[data-prev]");
  const next = root.querySelector("[data-next]");
  if (!track || !prev || !next) return;

  const slides = Array.from(track.children);
  if (!slides.length) return;

  let idx = 0;
  let timer = null;

  const render = () => {
    track.style.transform = `translateX(${-idx * 100}%)`;
  };

  const go = (delta) => {
    idx = (idx + delta + slides.length) % slides.length;
    render();
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => go(1), 6000);
  };

  const stop = () => {
    if (timer) window.clearInterval(timer);
    timer = null;
  };

  prev.addEventListener("click", () => {
    go(-1);
    start();
  });
  next.addEventListener("click", () => {
    go(1);
    start();
  });

  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  root.addEventListener("focusin", stop);
  root.addEventListener("focusout", start);

  render();
  start();
})();

