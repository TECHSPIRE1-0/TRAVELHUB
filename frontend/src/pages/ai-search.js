// AI Natural Language Search Page
import { aiSearch } from '../api.js';
import { createPackageCard } from '../components/package-card.js';
import { showToast } from '../components/toast.js';

export default async function AISearchPage(container) {
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';

  container.innerHTML = `
    <section class="section">
      <div class="container" style="max-width: 900px;">
        <div class="text-center animate-in">
          <h1 class="section-title">🤖 AI Smart Search</h1>
          <p class="section-subtitle" style="margin: 0 auto 40px;">Describe your dream trip and let AI find the best packages for you.</p>
        </div>

        <div class="search-bar animate-in" style="animation-delay: 0.1s; margin: 0 auto 32px; max-width: 100%;">
          <input type="text" id="ai-query" placeholder='Try: "honeymoon in Goa under ₹20,000 for 5 days"' value="${initialQuery}" />
          <button class="btn btn-primary" id="ai-search-btn">🔍 Search</button>
        </div>

        <div class="text-center text-muted mb-3" style="font-size: 0.85rem;">
          <strong>Example queries:</strong>
          <span class="ai-example" style="cursor: pointer; color: var(--text-accent);">5-day trip to Manali under ₹15,000</span> ·
          <span class="ai-example" style="cursor: pointer; color: var(--text-accent);">family trip to Kerala in December</span> ·
          <span class="ai-example" style="cursor: pointer; color: var(--text-accent);">adventure solo trip under 7 days</span>
        </div>

        <div id="ai-results"></div>
      </div>
    </section>
  `;

  // Example query clicks
  container.querySelectorAll('.ai-example').forEach(el => {
    el.addEventListener('click', () => {
      container.querySelector('#ai-query').value = el.textContent;
      doSearch(el.textContent);
    });
  });

  async function doSearch(query) {
    const resultsArea = container.querySelector('#ai-results');
    resultsArea.innerHTML = `
      <div class="glass-card text-center" style="padding: 60px;">
        <div class="spinner" style="width: 40px; height: 40px; margin: 0 auto 16px; border: 3px solid var(--border-color); border-top-color: var(--accent-primary); border-radius: 50; animation: spin 0.6s linear infinite; border-radius: 50%;"></div>
        <p class="text-secondary">AI is analyzing your query...</p>
      </div>
    `;

    try {
      const result = await aiSearch.search(query);
      const packages = result?.results || [];
      const filters = result?.parsed_filters || {};

      resultsArea.innerHTML = `
        <div class="glass-card animate-in mb-3">
          <h3 style="margin-bottom: 8px;">🧠 AI Understanding</h3>
          <p class="text-secondary" style="margin-bottom: 12px;">${result?.summary || 'Search complete.'}</p>
          <div class="flex gap-1" style="flex-wrap: wrap;">
            ${filters.destination ? `<span class="badge badge-accent">📍 ${filters.destination}</span>` : ''}
            ${filters.min_price || filters.max_price ? `<span class="badge badge-info">💰 ₹${filters.min_price || 0} - ₹${filters.max_price || '∞'}</span>` : ''}
            ${filters.min_days || filters.max_days ? `<span class="badge badge-info">⏱ ${filters.min_days || 1}-${filters.max_days || '?'} days</span>` : ''}
            ${filters.package_type ? `<span class="badge badge-accent">🏷️ ${filters.package_type}</span>` : ''}
            ${filters.people_count ? `<span class="badge badge-info">👥 ${filters.people_count} people</span>` : ''}
          </div>
        </div>

        <p class="text-secondary mb-2">${result?.total_found || 0} packages found</p>

        ${packages.length > 0 ? `
          <div class="feature-grid">
            ${packages.map(pkg => `
              <div class="glass-card package-card" data-link href="/package/${pkg.id}">
                <div class="package-body">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <h3 class="package-title">${pkg.title}</h3>
                    <span class="badge badge-success">${pkg.match_score}%</span>
                  </div>
                  <p class="text-secondary" style="font-size: 0.85rem;">📍 ${pkg.destination} · ⏱ ${pkg.duration} · 🏷️ ${pkg.package_type}</p>
                  ${pkg.match_reasons?.length ? `<div class="mt-1" style="font-size: 0.8rem; color: var(--text-muted);">${pkg.match_reasons.join(' · ')}</div>` : ''}
                  <p class="package-price mt-1">₹${(pkg.base_price || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="glass-card text-center" style="padding: 60px;">
            <p class="text-secondary">No matching packages found. Try a different query.</p>
          </div>
        `}
      `;
    } catch (err) {
      resultsArea.innerHTML = `
        <div class="glass-card text-center" style="padding: 40px;">
          <p class="text-secondary">${err.message}</p>
        </div>
      `;
    }
  }

  // Search button
  container.querySelector('#ai-search-btn').addEventListener('click', () => {
    const query = container.querySelector('#ai-query').value.trim();
    if (query) doSearch(query);
    else showToast('Please enter a search query', 'warning');
  });

  container.querySelector('#ai-query').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') container.querySelector('#ai-search-btn').click();
  });

  // Auto-search if query param present
  if (initialQuery) doSearch(initialQuery);
}
