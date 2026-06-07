// ---- Register Service Worker ----
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/service-worker.js')
      .then(function (registration) {
        console.log('Service Worker registered successfully:', registration.scope);
      })
      .catch(function (error) {
        console.log('Service Worker registration failed:', error);
      });
  });
}


document.addEventListener('DOMContentLoaded', function () {

  // ---- Mobile Menu ----
  const hamburger = document.getElementById('ea-hamburger');
  const nav = document.getElementById('ea-nav');

  if (hamburger && nav) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('open');
      nav.classList.toggle('open');
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        nav.classList.remove('open');
      });
    });
  }

  // ---- Sticky Header Shadow ----
  const header = document.getElementById('ea-header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 80);
    });
  }

  // ---- Testimonial Slider ----
  const testimonials = document.querySelectorAll('.ea-testimonial');
  const dots = document.querySelectorAll('.ea-dot');
  let current = 0;
  let autoSlide;

  function showTestimonial(index) {
    testimonials.forEach(t => t.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    testimonials[index].classList.add('active');
    dots[index].classList.add('active');
    current = index;
  }

  function startAutoSlide() {
    autoSlide = setInterval(() => {
      showTestimonial((current + 1) % testimonials.length);
    }, 5000);
  }

  if (testimonials.length > 0) {
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        clearInterval(autoSlide);
        showTestimonial(i);
        startAutoSlide();
      });
    });
    startAutoSlide();
  }

  // ---- FAQ Accordion ----
  document.querySelectorAll('.faq-toggle, .ea-faq-toggle').forEach(toggle => {
    toggle.addEventListener('click', function () {
      const content = this.nextElementSibling;
      const isOpen = this.classList.contains('active');

      document.querySelectorAll('.faq-toggle, .ea-faq-toggle').forEach(t => {
        t.classList.remove('active');
        if (t.nextElementSibling) t.nextElementSibling.style.maxHeight = null;
      });

      if (!isOpen) {
        this.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });

  // ---- Academics Tabs ----
  const tabBtns = document.querySelectorAll('.eg-tab-btn');
  const tabContents = document.querySelectorAll('.eg-tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      const target = document.getElementById(this.getAttribute('data-tab'));
      if (target) target.classList.add('active');
    });
  });

  // ---- Smooth Scroll ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });

  // ---- Scroll Reveal Animation ----
  const revealEls = document.querySelectorAll(
    '.ea-fact-card, .ea-program-card, .ea-welcome-image, .ea-welcome-text'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  // ---- Contact Form ----
  const contactForm = document.getElementById('ea-contact-form');
  if (contactForm) {

    const tourBtn = document.getElementById('ea-tour-btn');
    const openHouseBtn = document.getElementById('ea-openhouse-btn');

    if (tourBtn) {
      tourBtn.addEventListener('click', function () {
        document.getElementById('ea-subject').value = 'tour';
        document.getElementById('ea-message').value = 'I would like to schedule a family tour. Please let me know the available dates and times.';
      });
    }

    if (openHouseBtn) {
      openHouseBtn.addEventListener('click', function () {
        document.getElementById('ea-subject').value = 'tour';
        document.getElementById('ea-message').value = 'I would like to RSVP for the next open house on 14 June 2026. Please confirm my spot.';
      });
    }

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const success = document.getElementById('ea-form-success');
      if (success) {
        success.style.display = 'flex';
        contactForm.reset();
        setTimeout(() => { success.style.display = 'none'; }, 6000);
      }
    });
  }

});

// ---- Animated Counters ----
document.addEventListener('DOMContentLoaded', function () {
  const counters = document.querySelectorAll('.ea-counter');

  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-target'));
          const suffix = el.getAttribute('data-suffix') || '';
          const duration = 2000;
          const stepTime = 20;
          const steps = duration / stepTime;
          const increment = target / steps;
          let current = 0;

          el.textContent = '0' + suffix;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            el.textContent = Math.floor(current) + suffix;
          }, stepTime);

          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.1 });

    counters.forEach(counter => counterObserver.observe(counter));
  }
});

// ---- Back to Top Button ----
document.addEventListener('DOMContentLoaded', function () {
  const backToTop = document.getElementById('ea-back-to-top');

  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('show', window.scrollY > 400);
    });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});

// ---- Dark Mode ----
document.addEventListener('DOMContentLoaded', function () {
  const darkToggle = document.getElementById('ea-dark-toggle');
  const body = document.body;

  // Load saved preference
  if (localStorage.getItem('ea-dark-mode') === 'true') {
    body.classList.add('dark-mode');
    if (darkToggle) {
      darkToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    }
  }

  if (darkToggle) {
    darkToggle.addEventListener('click', function () {
      body.classList.toggle('dark-mode');
      const isDark = body.classList.contains('dark-mode');
      localStorage.setItem('ea-dark-mode', isDark);
      const icon = this.querySelector('i');
      icon.classList.toggle('fa-moon', !isDark);
      icon.classList.toggle('fa-sun', isDark);
    });
  }
});

// ---- Contact Form Real Time Validation ----
document.addEventListener('DOMContentLoaded', function () {

  const contactForm = document.getElementById('ea-contact-form');
  if (!contactForm) return;

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function setError(input, message) {
    const group = input.closest('.ea-form-group');
    clearState(group, input);
    group.classList.add('ea-input-error');
    const err = document.createElement('span');
    err.className = 'ea-field-error-msg';
    err.textContent = message;
    group.appendChild(err);
  }

  function setSuccess(input) {
    const group = input.closest('.ea-form-group');
    clearState(group, input);
    group.classList.add('ea-input-success');
    const wrap = group.querySelector('input, select, textarea');
    if (wrap) {
      const tick = document.createElement('i');
      tick.className = 'fas fa-check-circle ea-field-success-icon';
      group.style.position = 'relative';
      group.appendChild(tick);
    }
  }

  function clearState(group, input) {
    group.classList.remove('ea-input-error', 'ea-input-success');
    const existingErr = group.querySelector('.ea-field-error-msg');
    const existingTick = group.querySelector('.ea-field-success-icon');
    if (existingErr) existingErr.remove();
    if (existingTick) existingTick.remove();
  }

  // Validate on blur
  const nameInput = document.getElementById('ea-name');
  const emailInput = document.getElementById('ea-email');
  const messageInput = document.getElementById('ea-message');
  const subjectInput = document.getElementById('ea-subject');

  if (nameInput) {
    nameInput.addEventListener('blur', function () {
      if (!this.value.trim()) {
        setError(this, 'Please enter your full name.');
      } else if (this.value.trim().length < 2) {
        setError(this, 'Name must be at least 2 characters.');
      } else {
        setSuccess(this);
      }
    });
    nameInput.addEventListener('input', function () {
      clearState(this.closest('.ea-form-group'), this);
    });
  }

  if (emailInput) {
    emailInput.addEventListener('blur', function () {
      if (!this.value.trim()) {
        setError(this, 'Please enter your email address.');
      } else if (!validateEmail(this.value.trim())) {
        setError(this, 'Please enter a valid email address.');
      } else {
        setSuccess(this);
      }
    });
    emailInput.addEventListener('input', function () {
      clearState(this.closest('.ea-form-group'), this);
    });
  }

  if (subjectInput) {
    subjectInput.addEventListener('change', function () {
      if (!this.value) {
        setError(this, 'Please select a subject.');
      } else {
        setSuccess(this);
      }
    });
  }

  if (messageInput) {
    messageInput.addEventListener('blur', function () {
      if (!this.value.trim()) {
        setError(this, 'Please enter your message.');
      } else if (this.value.trim().length < 10) {
        setError(this, 'Message must be at least 10 characters.');
      } else {
        setSuccess(this);
      }
    });
    messageInput.addEventListener('input', function () {
      clearState(this.closest('.ea-form-group'), this);
    });
  }

});


// ---- Gallery Filter & Lightbox ----
document.addEventListener('DOMContentLoaded', function () {

  // ---- Filter ----
  const filterBtns = document.querySelectorAll('.ea-gallery-filter');
  const galleryItems = document.querySelectorAll('.ea-gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const filter = this.getAttribute('data-filter');
      galleryItems.forEach(item => {
        if (filter === 'all' || item.getAttribute('data-category') === filter) {
          item.classList.remove('ea-hidden');
        } else {
          item.classList.add('ea-hidden');
        }
      });
    });
  });

  // ---- Lightbox ----
  const lightbox = document.getElementById('ea-lightbox');
  const lightboxImg = document.getElementById('ea-lightbox-img');
  const lightboxTitle = document.getElementById('ea-lightbox-title');
  const lightboxDesc = document.getElementById('ea-lightbox-desc');
  const lightboxClose = document.getElementById('ea-lightbox-close');
  const lightboxOverlay = document.getElementById('ea-lightbox-overlay');
  const lightboxPrev = document.getElementById('ea-lightbox-prev');
  const lightboxNext = document.getElementById('ea-lightbox-next');

  if (!lightbox) return;

  // Only real images (not placeholders)
  const realItems = Array.from(galleryItems).filter(
    item => !item.classList.contains('ea-gallery-placeholder')
  );

  let currentIndex = 0;

  function openLightbox(index) {
    const item = realItems[index];
    if (!item) return;
    const img = item.querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxTitle.textContent = item.getAttribute('data-title') || '';
    lightboxDesc.textContent = item.getAttribute('data-desc') || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    currentIndex = index;
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + realItems.length) % realItems.length;
    openLightbox(currentIndex);
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % realItems.length;
    openLightbox(currentIndex);
  }

  // Open on click
  realItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
  });

  // Close
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxOverlay.addEventListener('click', closeLightbox);

  // Prev / Next
  lightboxPrev.addEventListener('click', showPrev);
  lightboxNext.addEventListener('click', showNext);

  // Keyboard navigation
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

});

// ---- Splash Screen ----
document.addEventListener('DOMContentLoaded', function () {
  const splash = document.getElementById('ea-splash');
  if (!splash) return;

  // Only show once per session
  if (sessionStorage.getItem('ea-splash-shown')) {
    splash.style.display = 'none';
    return;
  }

  // Hide after 2.8 seconds
  setTimeout(() => {
    splash.classList.add('ea-splash-hide');
    setTimeout(() => {
      splash.style.display = 'none';
    }, 600);
  }, 2800);

  sessionStorage.setItem('ea-splash-shown', 'true');
});

// ---- Dropdown Navigation ----
document.addEventListener('DOMContentLoaded', function () {
  const dropdownWraps = document.querySelectorAll('.ea-nav-dropdown-wrap');

  dropdownWraps.forEach(wrap => {
    const trigger = wrap.querySelector('.ea-nav-dropdown-trigger');

    if (trigger) {
      trigger.addEventListener('click', function (e) {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          wrap.classList.toggle('mobile-open');
          const chevron = this.querySelector('.ea-nav-chevron');
          if (chevron) {
            chevron.style.transform = wrap.classList.contains('mobile-open')
              ? 'rotate(180deg)'
              : 'rotate(0deg)';
          }
        }
      });
    }
  });

  document.addEventListener('click', function (e) {
    if (window.innerWidth <= 768) {
      dropdownWraps.forEach(wrap => {
        if (!wrap.contains(e.target)) {
          wrap.classList.remove('mobile-open');
          const chevron = wrap.querySelector('.ea-nav-chevron');
          if (chevron) chevron.style.transform = 'rotate(0deg)';
        }
      });
    }
  });
});

// ---- Scroll Progress Bar ----
document.addEventListener('DOMContentLoaded', function () {
  const progressBar = document.getElementById('ea-scroll-progress');

  if (progressBar) {
    window.addEventListener('scroll', function () {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = progress + '%';
    });
  }
});

// ---- Cookie Consent Banner ----
document.addEventListener('DOMContentLoaded', function () {
  const banner = document.getElementById('ea-cookie-banner');
  const acceptBtn = document.getElementById('ea-cookie-accept');
  const declineBtn = document.getElementById('ea-cookie-decline');

  if (!banner) return;

  // Check if user has already made a choice
  const cookieChoice = localStorage.getItem('ea-cookie-consent');

  if (!cookieChoice) {
    // Show banner after a short delay
    setTimeout(() => {
      banner.style.display = 'flex';
    }, 1500);
  }

  // Accept
  if (acceptBtn) {
    acceptBtn.addEventListener('click', function () {
      localStorage.setItem('ea-cookie-consent', 'accepted');
      hideBanner();
    });
  }

  // Decline
  if (declineBtn) {
    declineBtn.addEventListener('click', function () {
      localStorage.setItem('ea-cookie-consent', 'declined');
      hideBanner();
    });
  }

  function hideBanner() {
    banner.classList.add('hide');
    setTimeout(() => {
      banner.style.display = 'none';
    }, 400);
  }
});