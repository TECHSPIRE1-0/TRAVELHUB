// Packages Search & Listing Page
import { packages as packagesApi } from '../api.js';
import { createPackageCard } from '../components/package-card.js';
import { showToast } from '../components/toast.js';

export default async function PackagesPage(container) {
  container.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="dashboard-header animate-in">
          <h1 class="section-title">Explore Packages 🌍</h1>
          <p class="section-subtitle">Filter and discover your perfect travel experience.</p>
        </div>

        <!-- Filters -->
        <div class="glass-card animate-in" style="animation-delay: 0.1s; margin-bottom: 32px;">
          <form id="filter-form" class="grid" style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; align-items: end;">
            <div class="form-group" style="margin-bottom: 0;">
              <label>Destination</label>
              <input type="text" id="f-destination" class="form-input" placeholder="e.g. Goa" />
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label>Min Price (₹)</label>
              <input type="number" id="f-min-price" class="form-input" placeholder="0" />
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label>Max Price (₹)</label>
              <input type="number" id="f-max-price" class="form-input" placeholder="50000" />
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label>Min Days</label>
              <input type="number" id="f-min-days" class="form-input" placeholder="1" />
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label>Max Days</label>
              <input type="number" id="f-max-days" class="form-input" placeholder="15" />
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label>Package Type</label>
              <select id="f-type" class="form-input">
                <option value="">All Types</option>
                <option value="adventure">Adventure</option>
                <option value="beach">Beach</option>
                <option value="cultural">Cultural</option>
                <option value="honeymoon">Honeymoon</option>
                <option value="family">Family</option>
                <option value="pilgrimage">Pilgrimage</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary">🔍 Search</button>
          </form>
        </div>

        <!-- Results -->
        <div id="results-count" class="text-secondary mb-2" style="font-size: 0.9rem;"></div>
        <div class="feature-grid" id="pkg-results">
          <div class="glass-card skeleton" style="height: 320px;"></div>
          <div class="glass-card skeleton" style="height: 320px;"></div>
          <div class="glass-card skeleton" style="height: 320px;"></div>
        </div>
      </div>
    </section>
  `;

  async function loadPackages(filters = {}) {
    const grid = container.querySelector('#pkg-results');
    const countEl = container.querySelector('#results-count');
    grid.innerHTML = '<div class="glass-card skeleton" style="height: 320px; grid-column: 1 / -1;"></div>';

    try {
      const data = await packagesApi.search(filters);
      const results = data?.results || [];
      countEl.textContent = `${results.length} package${results.length !== 1 ? 's' : ''} found`;

      if (results.length > 0) {
        grid.innerHTML = results.map(createPackageCard).join('');
      } else {
        grid.innerHTML = `
          <div class="glass-card text-center" style="grid-column: 1 / -1; padding: 60px;">
            <p style="font-size: 2rem; margin-bottom: 8px;">🔍</p>
            <p class="text-secondary">No packages found. Try adjusting your filters.</p>
          </div>
        `;
      }
    } catch (err) {
      grid.innerHTML = `
        <div class="glass-card text-center" style="grid-column: 1 / -1; padding: 60px;">
          <p class="text-secondary">Could not load packages. Make sure the backend is running.</p>
        </div>
      `;
      countEl.textContent = '';
    }
  }

  // Initial load
  loadPackages();

  // Filter form submit
  container.querySelector('#filter-form').addEventListener('submit', (e) => {
    e.preventDefault();
    loadPackages({
      destination: container.querySelector('#f-destination').value,
      min_price: container.querySelector('#f-min-price').value,
      max_price: container.querySelector('#f-max-price').value,
      min_days: container.querySelector('#f-min-days').value,
      max_days: container.querySelector('#f-max-days').value,
      package_type: container.querySelector('#f-type').value,
    });
  });
}
