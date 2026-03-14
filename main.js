// ============================================================
// TRAVELHUB — MAIN JS (index.html)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ---- NAV SCROLL ----
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  });

  // ---- HERO SLIDESHOW ----
  const slides = document.querySelectorAll('.hero-slide');
  let current = 0;
  if (slides.length > 1) {
    setInterval(() => {
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }, 3000);
  }

  // ---- HERO SEARCH ----
  const heroSearchBtn = document.getElementById('heroSearchBtn');
  const heroSearchInput = document.getElementById('heroSearch');
  if (heroSearchBtn && heroSearchInput) {
    heroSearchBtn.addEventListener('click', () => {
      const query = heroSearchInput.value.trim();
      window.location.href = `search.html${query ? '?q=' + encodeURIComponent(query) : ''}`;
    });
    heroSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') heroSearchBtn.click();
    });
  }

  // ---- COUNTER ANIMATION ----
  const stats = document.querySelectorAll('.stat-num');
  const observerOptions = { threshold: 0.5 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  stats.forEach(s => observer.observe(s));

  function animateCounter(el) {
    const raw = el.textContent.replace(/[^0-9]/g, '');
    const target = parseInt(raw);
    const suffix = el.textContent.replace(/[0-9]/g, '');
    let count = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      count = Math.min(count + step, target);
      el.textContent = count.toLocaleString() + suffix.trim();
      if (count >= target) clearInterval(timer);
    }, 25);
  }

  // ---- SCROLL REVEAL ----
  const revealEls = document.querySelectorAll('.step-card, .dest-card, .agency-card, .testimonial-card');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, (Array.from(revealEls).indexOf(entry.target) % 4) * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    revealObserver.observe(el);
  });

  // ---- MOBILE NAV ----
  const navToggle = document.getElementById('navToggle');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const links = document.querySelector('.nav-links');
      const actions = document.querySelector('.nav-actions');
      if (links) {
        const isOpen = links.style.display === 'flex';
        links.style.display = isOpen ? '' : 'flex';
        links.style.flexDirection = 'column';
        links.style.position = 'fixed';
        links.style.top = '60px';
        links.style.left = '0';
        links.style.right = '0';
        links.style.background = 'white';
        links.style.padding = '20px 24px';
        links.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
        links.style.zIndex = '999';
        if (isOpen) {
          links.style.display = 'none';
        }
      }
    });
  }

});
