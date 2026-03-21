// Agency Dashboard Page
import { agencyDashboard as agencyApi } from '../api.js';
import { showToast } from '../components/toast.js';

export default async function AgencyDashboardPage(container) {
  container.innerHTML = `
    <section class="dashboard-page section">
      <div class="container">
        <div class="dashboard-header animate-in">
          <h1>Agency Dashboard 🏢</h1>
          <p class="text-secondary">Manage your packages, bookings, and view stats.</p>
        </div>

        <!-- Stats -->
        <div class="stats-grid mb-4" id="agency-stats">
          <div class="glass-card stat-card skeleton" style="height: 100px;"></div>
          <div class="glass-card stat-card skeleton" style="height: 100px;"></div>
          <div class="glass-card stat-card skeleton" style="height: 100px;"></div>
          <div class="glass-card stat-card skeleton" style="height: 100px;"></div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-2 mb-3">
          <button class="btn btn-primary tab-btn active-tab" data-tab="packages">My Packages</button>
          <button class="btn btn-secondary tab-btn" data-tab="bookings">Bookings</button>
          <button class="btn btn-secondary tab-btn" data-tab="enquiries">Enquiries</button>
        </div>

        <div id="tab-content">
          <div class="glass-card skeleton" style="height: 300px;"></div>
        </div>
      </div>
    </section>
  `;

  // Load stats
  try {
    const stats = await agencyApi.stats();
    container.querySelector('#agency-stats').innerHTML = `
      <div class="glass-card stat-card animate-in">
        <div class="stat-value">${stats.total_packages || 0}</div>
        <div class="stat-label">Total Packages</div>
      </div>
      <div class="glass-card stat-card animate-in" style="animation-delay: 0.1s;">
        <div class="stat-value">${stats.total_bookings || 0}</div>
        <div class="stat-label">Total Bookings</div>
      </div>
      <div class="glass-card stat-card animate-in" style="animation-delay: 0.2s;">
        <div class="stat-value">₹${(stats.total_revenue || 0).toLocaleString('en-IN')}</div>
        <div class="stat-label">Revenue</div>
      </div>
      <div class="glass-card stat-card animate-in" style="animation-delay: 0.3s;">
        <div class="stat-value">${stats.pending_bookings || 0}</div>
        <div class="stat-label">Pending</div>
      </div>
    `;
  } catch {
    container.querySelector('#agency-stats').innerHTML = `
      <div class="glass-card text-center" style="grid-column: 1 / -1; padding: 24px;">
        <p class="text-secondary">Please <a href="/agency-login" data-link>login</a> to view stats.</p>
      </div>
    `;
  }

  // Tab switching
  const tabContent = container.querySelector('#tab-content');

  async function loadTab(tab) {
    container.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.toggle('active-tab', b.dataset.tab === tab);
      b.className = b.dataset.tab === tab ? 'btn btn-primary tab-btn active-tab' : 'btn btn-secondary tab-btn';
    });

    tabContent.innerHTML = '<div class="glass-card skeleton" style="height: 200px;"></div>';

    try {
      if (tab === 'packages') {
        try {
          const pkgs = await agencyApi.packages();
          const items = Array.isArray(pkgs) ? pkgs : [];
          tabContent.innerHTML = items.length > 0 ? `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3>Your Packages</h3>
              <a href="/agency/create-package" data-link class="btn btn-primary btn-sm">+ Create New Package</a>
            </div>
            <div class="glass-card" style="overflow-x: auto;">
              <table class="data-table">
                <thead><tr><th>ID</th><th>Title</th><th>Destination</th><th>Duration</th><th>Price</th></tr></thead>
                <tbody>${items.map(p => `<tr><td>#${p.id}</td><td>${p.title}</td><td>${p.destination}</td><td>${p.duration_days}D</td><td class="text-gold">₹${(p.base_price || 0).toLocaleString('en-IN')}</td></tr>`).join('')}</tbody>
              </table>
            </div>
          ` : '<div class="glass-card text-center" style="padding: 40px;"><p class="text-secondary">No packages yet.</p><a href="/agency/create-package" data-link class="btn btn-primary mt-3">+ Create your first package!</a></div>';
        } catch (err) {
          tabContent.innerHTML = '<div class="glass-card text-center" style="padding: 40px;"><p class="text-secondary">Failed to load packages.</p></div>';
        }

      } else if (tab === 'bookings') {
        const bookings = await agencyApi.bookings();
        const items = Array.isArray(bookings) ? bookings : [];
        tabContent.innerHTML = items.length > 0 ? `
          <div class="glass-card" style="overflow-x: auto;">
            <table class="data-table">
              <thead><tr><th>ID</th><th>Package</th><th>User</th><th>Date</th><th>Price</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>${items.map(b => `
                <tr>
                  <td>#${b.id}</td><td>${b.package_title || '-'}</td><td>${b.user_name || '-'}</td><td>${b.departure_date || '-'}</td>
                  <td class="text-gold">₹${(b.total_price || 0).toLocaleString('en-IN')}</td>
                  <td><span class="badge badge-info">${b.status || 'pending'}</span></td>
                  <td>
                    <select class="form-input status-select" data-id="${b.id}" style="padding: 6px 10px; font-size: 0.8rem;">
                      <option value="">Change</option>
                      <option value="confirmed">Confirm</option>
                      <option value="cancelled">Cancel</option>
                    </select>
                  </td>
                </tr>
              `).join('')}</tbody>
            </table>
          </div>
        ` : '<div class="glass-card text-center" style="padding: 40px;"><p class="text-secondary">No bookings yet.</p></div>';

        // Status change handlers
        tabContent.querySelectorAll('.status-select').forEach(sel => {
          sel.addEventListener('change', async () => {
            if (!sel.value) return;
            try {
              await agencyApi.updateBookingStatus(sel.dataset.id, sel.value);
              showToast(`Booking ${sel.value}!`, 'success');
              loadTab('bookings');
            } catch (err) { showToast(err.message, 'error'); }
          });
        });
      } else {
        // Enquiries tab
        try {
          // Import enquiry API dynamically or assume it's available (since we can use dynamic import here)
          const { enquiry: enquiryApi } = await import('../api.js');
          const data = await enquiryApi.getAgencyEnquiries();
          const items = Array.isArray(data) ? data : (data?.enquiries || []);
          
          tabContent.innerHTML = items.length > 0 ? `
            <div class="glass-card" style="overflow-x: auto;">
              <table class="data-table">
                <thead><tr><th>ID</th><th>Customer</th><th>Email</th><th>Phone</th><th>Destination</th><th>Date</th><th>Travellers</th><th>Message</th></tr></thead>
                <tbody>${items.map(e => `
                  <tr>
                    <td>#${e.id}</td>
                    <td>${e.name}</td>
                    <td>${e.email}</td>
                    <td>${e.phone}</td>
                    <td>${e.destination}</td>
                    <td>${e.travel_date}</td>
                    <td>${e.travellers}</td>
                    <td style="max-width: 200px; white-space: normal;">${e.message || '-'}</td>
                  </tr>
                `).join('')}</tbody>
              </table>
            </div>
          ` : '<div class="glass-card text-center" style="padding: 40px;"><p class="text-secondary">No enquiries yet.</p></div>';
        } catch (err) {
          tabContent.innerHTML = '<div class="glass-card text-center" style="padding: 40px;"><p class="text-secondary">Failed to load enquiries.</p></div>';
        }
      }
    } catch {
      tabContent.innerHTML = '<div class="glass-card text-center" style="padding: 40px;"><p class="text-secondary">Could not load data. Please login as an agency.</p></div>';
    }
  }

  loadTab('packages');

  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => loadTab(btn.dataset.tab));
  });
}
