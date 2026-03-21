// Home / Landing Page — Bold Adventure Design
import { packages as packagesApi } from '../api.js';
import { createPackageCard } from '../components/package-card.js';
import { navigate } from '../router.js';

export default async function HomePage(container) {
  container.innerHTML = `
    <!-- HERO — Full-Bleed Image -->
    <section class="hero">
      <div class="hero-bg">
        <img src="/images/hero-mountain.png" alt="Mountain adventure" />
      </div>
      <div class="hero-content animate-in">
        <p class="hero-eyebrow">AI-Powered Travel Platform</p>
        <h1 class="hero-title">EXPLORE<br/>BEYOND<br/>LIMITS</h1>
        <p class="hero-subtitle">
          The mountains call for a guide who knows their secrets.
          Discover AI-curated packages, book mystery flights, and plan group trips — all in one place.
        </p>
        <div class="hero-actions">
          <a href="/packages" data-link class="btn btn-primary btn-lg">Browse Destinations</a>
          <a href="/dna-quiz" data-link class="btn btn-secondary btn-lg">Find Your DNA ✨</a>
        </div>
        <div class="search-bar" style="animation-delay: 0.3s;">
          <input type="text" id="hero-search" placeholder='Try: "5-day trip to Manali under ₹15,000"' />
          <button class="btn btn-primary" id="hero-search-btn">🔍 Search</button>
        </div>
      </div>
    </section>

    <!-- SOCIAL PROOF BAR -->
    <section style="padding: 32px 0; border-bottom: 1px solid var(--border-color);">
      <div class="container">
        <div class="social-bar" style="justify-content: center;">
          <div class="social-stat">
            <div class="avatar-stack">
              <div class="avatar">RK</div>
              <div class="avatar">AP</div>
              <div class="avatar">SV</div>
            </div>
            <div>
              <div class="stat-num">25K+</div>
              <div class="stat-text">Happy Travelers</div>
            </div>
          </div>
          <div style="width: 1px; height: 40px; background: var(--border-color);"></div>
          <div class="social-stat">
            <div class="stat-num">500+</div>
            <div class="stat-text">Curated<br/>Packages</div>
          </div>
          <div style="width: 1px; height: 40px; background: var(--border-color);"></div>
          <div class="social-stat">
            <div class="stat-num">50+</div>
            <div class="stat-text">Travel<br/>Agencies</div>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES — Split Layout Style -->
    <section class="light-section">
      <div class="container">
        <div style="text-align: center; margin-bottom: 60px;">
          <p class="hero-eyebrow" style="color: var(--accent);">WHY TRAVELHUB</p>
          <h2 class="section-title" style="color: var(--text-dark);">AI-Powered Travel,<br/>Reimagined</h2>
          <p class="section-subtitle" style="color: #666; margin: 12px auto 0;">
            Six powerful features that make trip planning effortless.
          </p>
        </div>

        <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px;">
          <div class="light-card" style="border-left: 3px solid var(--accent);">
            <div style="font-size: 2rem; margin-bottom: 12px;">🤖</div>
            <h3 style="color: var(--text-dark); margin-bottom: 8px;">AI Smart Search</h3>
            <p style="color: #666; font-size: 0.92rem; line-height: 1.6;">Describe your dream trip in plain English. Our AI parses destinations, budgets, durations and finds perfect matches.</p>
          </div>

          <div class="light-card" style="border-left: 3px solid var(--green);">
            <div style="font-size: 2rem; margin-bottom: 12px;">🧬</div>
            <h3 style="color: var(--text-dark); margin-bottom: 8px;">Travel DNA Quiz</h3>
            <p style="color: #666; font-size: 0.92rem; line-height: 1.6;">Take a fun personality quiz to discover your traveler type. AI matches you with packages that fit your style.</p>
          </div>

          <div class="light-card" style="border-left: 3px solid var(--blue-steel);">
            <div style="font-size: 2rem; margin-bottom: 12px;">🗳️</div>
            <h3 style="color: var(--text-dark); margin-bottom: 8px;">Group Trip Planner</h3>
            <p style="color: #666; font-size: 0.92rem; line-height: 1.6;">Create a room, invite friends, add packages and vote in real-time via WebSocket. Democracy in travel planning.</p>
          </div>

          <div class="light-card" style="border-left: 3px solid #c0392b;">
            <div style="font-size: 2rem; margin-bottom: 12px;">🎲</div>
            <h3 style="color: var(--text-dark); margin-bottom: 8px;">Mystery Flight</h3>
            <p style="color: #666; font-size: 0.92rem; line-height: 1.6;">Set a budget, roll the dice! Get a cryptic boarding pass with packing hints. Destination revealed on travel day.</p>
          </div>

          <div class="light-card" style="border-left: 3px solid var(--accent);">
            <div style="font-size: 2rem; margin-bottom: 12px;">🤝</div>
            <h3 style="color: var(--text-dark); margin-bottom: 8px;">AI Negotiator</h3>
            <p style="color: #666; font-size: 0.92rem; line-height: 1.6;">Haggle with "Agent Alex" in real-time. Counter-offers, deals, and live chat — all powered by Gemini AI.</p>
          </div>

          <div class="light-card" style="border-left: 3px solid var(--green);">
            <div style="font-size: 2rem; margin-bottom: 12px;">📸</div>
            <h3 style="color: var(--text-dark); margin-bottom: 8px;">Visual Search</h3>
            <p style="color: #666; font-size: 0.92rem; line-height: 1.6;">Upload a photo of any destination. AI identifies the landmark and finds matching travel packages instantly.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- SPLIT SECTION — Adventure Image + Content -->
    <section class="split-layout" style="background: var(--bg-primary);">
      <div class="split-image">
        <img src="/images/hero-adventure.png" alt="Adventure campfire" />
      </div>
      <div class="split-content" style="max-width: 560px;">
        <p class="hero-eyebrow">THE EXPERIENCE</p>
        <h2 class="section-title" style="font-size: clamp(1.8rem, 3vw, 2.5rem);">Plan Trips Your Way,<br/>Together</h2>
        <p class="text-secondary" style="margin-bottom: 24px; line-height: 1.7;">
          From itinerary generators to mystery flights, TravelHub redefines how you explore. Whether solo, with friends, or as family — every tool is built to make planning effortless.
        </p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <a href="/itinerary" data-link class="btn btn-primary">Generate Itinerary</a>
          <a href="/matchmaking" data-link class="btn btn-outline-gold">Trip Tinder 💘</a>
        </div>
      </div>
    </section>

    <!-- TRENDING PACKAGES -->
    <section class="section">
      <div class="container">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; flex-wrap: wrap; gap: 16px;">
          <div>
            <p class="hero-eyebrow">CURATED FOR YOU</p>
            <h2 class="section-title">Trending Packages</h2>
          </div>
          <a href="/packages" data-link class="btn btn-outline-gold btn-sm">View All →</a>
        </div>
        <div class="feature-grid" id="trending-packages">
          <div class="glass-card skeleton" style="height: 340px;"></div>
          <div class="glass-card skeleton" style="height: 340px;"></div>
          <div class="glass-card skeleton" style="height: 340px;"></div>
        </div>
      </div>
    </section>

    <!-- CTA — Beach image background -->
    <section class="hero" style="min-height: 60vh;">
      <div class="hero-bg">
        <img src="/images/hero-beach.png" alt="Beach paradise" />
      </div>
      <div class="hero-content">
        <h2 class="hero-title" style="font-size: clamp(2.5rem, 6vw, 4.5rem);">READY TO<br/>EXPLORE?</h2>
        <p class="hero-subtitle" style="margin-bottom: 28px;">
          Join thousands of travelers who use AI to plan perfect trips. Free to get started.
        </p>
        <div class="hero-actions">
          <a href="/register" data-link class="btn btn-primary btn-lg">Create Free Account</a>
          <a href="/agency-register" data-link class="btn btn-secondary btn-lg">Register as Agency</a>
        </div>
      </div>
    </section>
  `;

  // Load trending packages
  try {
    const data = await packagesApi.search({});
    const grid = container.querySelector('#trending-packages');
    const results = data?.results || data || [];
    const list = Array.isArray(results) ? results : [];
    if (list.length > 0) {
      grid.innerHTML = list.slice(0, 6).map(createPackageCard).join('');
    } else {
      grid.innerHTML = `
        <div class="glass-card text-center" style="grid-column: 1 / -1; padding: 60px;">
          <p class="text-secondary">No packages available yet. Connect your backend to see live packages.</p>
        </div>
      `;
    }
  } catch {
    document.getElementById('trending-packages').innerHTML = `
      <div class="glass-card text-center" style="grid-column: 1 / -1; padding: 60px;">
        <p class="text-secondary">Connect your backend to see live packages here.</p>
      </div>
    `;
  }

  // AI Search from hero
  const searchBtn = container.querySelector('#hero-search-btn');
  const searchInput = container.querySelector('#hero-search');
  searchBtn?.addEventListener('click', () => {
    const query = searchInput?.value?.trim();
    if (query) navigate(`/ai-search?q=${encodeURIComponent(query)}`);
  });
  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchBtn?.click();
  });
}
