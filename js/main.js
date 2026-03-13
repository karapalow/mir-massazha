document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav__toggle");
  const navList = document.querySelector(".nav__list");

  if (navToggle && navList) {
    navToggle.addEventListener("click", () => {
      navList.classList.toggle("nav__list--open");
    });
  }
});

