// =========================================================================
// TRAVELHUB — Client-Side SPA Router
// =========================================================================

const routes = {};
let currentCleanup = null;

export function registerRoute(path, handler) {
  routes[path] = handler;
}

export function navigate(path) {
  window.history.pushState({}, '', path);
  render();
}

export async function render() {
  const path = window.location.pathname;
  const container = document.getElementById('page-content');

  // Clean up previous page (remove event listeners, timers, websockets, etc.)
  if (currentCleanup && typeof currentCleanup === 'function') {
    currentCleanup();
    currentCleanup = null;
  }

  // Find matching route (exact match first, then parameterized)
  let handler = routes[path];
  let params = {};

  if (!handler) {
    for (const [pattern, h] of Object.entries(routes)) {
      const regex = patternToRegex(pattern);
      const match = path.match(regex);
      if (match) {
        handler = h;
        const keys = (pattern.match(/:([^/]+)/g) || []).map((k) => k.slice(1));
        keys.forEach((key, i) => {
          params[key] = match[i + 1];
        });
        break;
      }
    }
  }

  if (handler) {
    container.innerHTML = '';
    const cleanup = await handler(container, params);
    if (typeof cleanup === 'function') {
      currentCleanup = cleanup;
    }
    // Update active nav link
    document.querySelectorAll('.navbar-links a').forEach((a) => {
      a.classList.toggle('active', a.getAttribute('href') === path);
    });
    // Scroll to top
    window.scrollTo(0, 0);
  } else {
    container.innerHTML = `
      <div class="section text-center" style="padding-top: 120px;">
        <h1 style="font-size: 6rem; margin-bottom: 16px;">404</h1>
        <p class="text-secondary" style="font-size: 1.2rem;">Page not found</p>
        <a href="/" class="btn btn-primary mt-3" data-link>Back to Home</a>
      </div>
    `;
  }
}

function patternToRegex(pattern) {
  const regexStr = pattern
    .replace(/:[^/]+/g, '([^/]+)')
    .replace(/\//g, '\\/');
  return new RegExp(`^${regexStr}$`);
}

// Handle browser back/forward
window.addEventListener('popstate', render);

// Delegate all link clicks with data-link attribute
document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-link]');
  if (link) {
    e.preventDefault();
    const href = link.getAttribute('href');
    if (href) navigate(href);
  }
});
