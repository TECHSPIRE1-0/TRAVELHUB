// User Dashboard Page
import { user as userApi } from '../api.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';

export default async function UserDashboardPage(container) {
  container.innerHTML = `
    <section class="dashboard-page section">
      <div class="container">
        <div class="dashboard-header animate-in">
          <h1>My Dashboard 📊</h1>
          <p class="text-secondary">View and manage your bookings.</p>
        </div>

        <div id="dashboard-content">
          <div class="glass-card skeleton" style="height: 200px;"></div>
        </div>
      </div>
    </section>
  `;

  try {
    const data = await userApi.dashboard();
    const bookings = data?.bookings || [];

    const content = container.querySelector('#dashboard-content');

    if (bookings.length === 0) {
      content.innerHTML = `
        <div class="glass-card text-center" style="padding: 60px;">
          <p style="font-size: 2rem; margin-bottom: 12px;">🎒</p>
          <h3 style="margin-bottom: 8px;">No bookings yet</h3>
          <p class="text-secondary mb-3">Start exploring packages and book your next adventure!</p>
          <a href="/packages" data-link class="btn btn-primary">Browse Packages</a>
        </div>
      `;
      return;
    }

    content.innerHTML = `
      <div class="glass-card animate-in" style="overflow-x: auto;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Package</th>
              <th>Departure</th>
              <th>Return</th>
              <th>Adults</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${bookings.map(b => `
              <tr>
                <td><strong>#${b.id}</strong></td>
                <td>${b.package_title || `Package #${b.package_id}`}</td>
                <td>${b.departure_date || '-'}</td>
                <td>${b.return_date || '-'}</td>
                <td>${b.adults || '-'}</td>
                <td class="text-gold">₹${(b.total_price || 0).toLocaleString('en-IN')}</td>
                <td><span class="badge badge-${b.status === 'cancelled' ? 'danger' : b.status === 'confirmed' ? 'success' : 'info'}">${b.status || 'pending'}</span></td>
                <td>
                  ${b.status !== 'cancelled' ? `<button class="btn btn-danger btn-sm cancel-booking" data-id="${b.id}">Cancel</button>` : '-'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Cancel booking handlers
    content.querySelectorAll('.cancel-booking').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;
        btn.disabled = true;
        btn.innerHTML = '<div class="spinner"></div>';
        try {
          await userApi.cancelBooking(btn.dataset.id);
          showToast('Booking cancelled.', 'success');
          // Reload
          UserDashboardPage(container);
        } catch (err) {
          showToast(err.message, 'error');
          btn.disabled = false;
          btn.textContent = 'Cancel';
        }
      });
    });

  } catch (err) {
    container.querySelector('#dashboard-content').innerHTML = `
      <div class="glass-card text-center" style="padding: 40px;">
        <p class="text-secondary">Please <a href="/login" data-link>login</a> to view your dashboard.</p>
      </div>
    `;
  }
}
