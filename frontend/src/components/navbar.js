// Navbar component — transparent on hero, solid on scroll, session-aware
import { navigate } from '../router.js';

export function renderNavbar() {
  const navbar = document.getElementById('navbar');
  updateNavbar(navbar);

  // Re-render navbar when storage changes (login/logout)
  window.addEventListener('storage', () => updateNavbar(navbar));
  // Custom event for same-tab login/logout
  window.addEventListener('travelhub-auth', () => updateNavbar(navbar));
}

function updateNavbar(navbar) {
  const user = JSON.parse(localStorage.getItem('travelhub_user') || 'null');
  const isLoggedIn = !!user;
  const isAgency = user?.role === 'agency';

  navbar.innerHTML = `
    <div class="navbar transparent">
      <div class="container">
        <div class="navbar-brand" data-link href="/">
          <span>⛰️</span> TravelHub
        </div>

        <button class="mobile-menu-btn" id="mobile-toggle" aria-label="Toggle menu">☰</button>

        <ul class="navbar-links" id="nav-links">
          <li><a href="/" data-link>Home</a></li>
          <li><a href="/packages" data-link>Destinations</a></li>
          <li><a href="/ai-search" data-link>AI Search</a></li>
          <li><a href="/dna-quiz" data-link>DNA Quiz</a></li>
          <li><a href="/itinerary" data-link>Itinerary</a></li>
          <li><a href="/trip-room" data-link>Trip Room</a></li>
          <li><a href="/mystery-flight" data-link>Mystery ✈️</a></li>
          <li><a href="/vision" data-link>Vision</a></li>
          ${isLoggedIn ? `
            <li><a href="${isAgency ? '/agency-dashboard' : '/user-dashboard'}" data-link>Dashboard</a></li>
            <li><button class="btn btn-sm btn-secondary" id="logout-btn">Logout</button></li>
          ` : `
            <li><a href="/login" data-link class="btn btn-primary btn-sm">Start Adventure</a></li>
          `}
        </ul>
      </div>
    </div>
  `;

  // Mobile toggle
  navbar.querySelector('#mobile-toggle')?.addEventListener('click', () => {
    navbar.querySelector('#nav-links')?.classList.toggle('open');
  });

  // Close mobile on link click
  navbar.querySelectorAll('.navbar-links a').forEach((a) => {
    a.addEventListener('click', () => navbar.querySelector('#nav-links')?.classList.remove('open'));
  });

  // Brand click
  navbar.querySelector('.navbar-brand')?.addEventListener('click', () => navigate('/'));

  // Logout
  navbar.querySelector('#logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('travelhub_user');
    window.dispatchEvent(new Event('travelhub-auth'));
    navigate('/');
  });

  // Scroll behavior
  const navEl = navbar.querySelector('.navbar');
  function onScroll() {
    if (window.scrollY > 60) {
      navEl.classList.remove('transparent');
      navEl.classList.add('solid');
    } else {
      navEl.classList.add('transparent');
      navEl.classList.remove('solid');
    }
  }
  window.addEventListener('scroll', onScroll);
  onScroll();
}
