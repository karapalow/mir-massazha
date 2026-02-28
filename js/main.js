/**
 * Мир Массажа - Main JavaScript
 * Animations, smooth scroll, form validation, mobile menu
 */

document.addEventListener('DOMContentLoaded', function() {
  initScrollAnimations();
  initHeaderScroll();
  initMobileMenu();
  initSmoothScroll();
  initFormValidation();
});

/**
 * IntersectionObserver for scroll-triggered animations
 */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  
  if (!animatedElements.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -80px 0px', // Trigger when element is 80px from viewport bottom
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Optional: unobserve after animation to improve performance
        // observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach(el => observer.observe(el));
}

/**
 * Header shadow on scroll
 */
function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial check
}

/**
 * Mobile menu toggle
 */
function initMobileMenu() {
  const toggle = document.querySelector('.nav__toggle');
  const navList = document.querySelector('.nav__list');

  if (!toggle || !navList) return;

  toggle.addEventListener('click', () => {
    navList.classList.toggle('active');
    toggle.classList.toggle('active');
    document.body.style.overflow = navList.classList.contains('active') ? 'hidden' : '';
  });

  // Close menu when clicking a link
  navList.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      navList.classList.remove('active');
      toggle.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Close menu on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      navList.classList.remove('active');
      toggle.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * Form validation
 */
function initFormValidation() {
  const mainForm = document.getElementById('main-contact-form');
  const contactsForm = document.getElementById('contacts-form');

  if (mainForm) {
    mainForm.addEventListener('submit', handleFormSubmit);
  }
  if (contactsForm) {
    contactsForm.addEventListener('submit', handleFormSubmit);
  }
}

function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const formId = form.id;
  const prefix = formId === 'contacts-form' ? 'contacts-' : '';

  // Clear previous errors
  form.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

  let isValid = true;

  // Name validation
  const nameInput = form.querySelector(`#${prefix}name`);
  if (nameInput && nameInput.hasAttribute('required')) {
    if (!nameInput.value.trim()) {
      showError(nameInput, form.querySelector(`#${prefix}name-error`), 'Введите ваше имя');
      isValid = false;
    } else if (nameInput.value.trim().length < 2) {
      showError(nameInput, form.querySelector(`#${prefix}name-error`), 'Имя должно содержать минимум 2 символа');
      isValid = false;
    }
  }

  // Phone validation (Uzbekistan format: +998 90 123 45 67)
  const phoneInput = form.querySelector(`#${prefix}phone`);
  if (phoneInput && phoneInput.hasAttribute('required')) {
    const digitsOnly = phoneInput.value.replace(/\D/g, '');
    const fullNumber = digitsOnly.startsWith('998') ? digitsOnly : '998' + digitsOnly;
    if (!phoneInput.value.trim()) {
      showError(phoneInput, form.querySelector(`#${prefix}phone-error`), 'Введите номер телефона');
      isValid = false;
    } else if (fullNumber.length < 12) {
      showError(phoneInput, form.querySelector(`#${prefix}phone-error`), 'Введите номер в формате +998 90 123 45 67');
      isValid = false;
    }
  }

  // Message validation (for contacts form)
  const messageInput = form.querySelector(`#${prefix}message`);
  if (messageInput && messageInput.hasAttribute('required')) {
    if (!messageInput.value.trim()) {
      showError(messageInput, form.querySelector(`#${prefix}message-error`), 'Введите сообщение');
      isValid = false;
    }
  }

  if (isValid) {
    // Simulate form submission - replace with actual API call
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Отправка...';
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.textContent = 'Отправлено!';
      submitBtn.style.background = 'linear-gradient(135deg, #5cb85c, #4cae4c)';
      form.reset();
      
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.style.background = '';
      }, 3000);
    }, 800);
  }
}

function showError(input, errorEl, message) {
  if (input) input.classList.add('error');
  if (errorEl) errorEl.textContent = message;
}
