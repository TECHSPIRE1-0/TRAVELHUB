// =========================================================================
// TRAVELHUB — Admin Dashboard
// =========================================================================

export default async function AdminDashboardPage(container) {
  // Check if user is logged in (conceptually). For now we just render the UI.
  
  const html = `
    <div class="dashboard-page container section">
      <div class="dashboard-header flex justify-between items-center mb-4">
        <div>
          <h1>Admin Control Center</h1>
          <p>Monitor platform activity and respond to emergencies.</p>
        </div>
        <button class="btn btn-secondary">System Settings</button>
      </div>

      <div class="stats-grid mb-4">
        <div class="glass-card stat-card" style="border-top: 4px solid var(--danger);">
          <div class="stat-value text-danger">0</div>
          <div class="stat-label flex items-center justify-center gap-1">
            <span style="color: var(--danger);">●</span> Active SOS Alerts
          </div>
        </div>
        <div class="glass-card stat-card">
          <div class="stat-value">1,204</div>
          <div class="stat-label">Total Users</div>
        </div>
        <div class="glass-card stat-card">
          <div class="stat-value">84</div>
          <div class="stat-label">Registered Agencies</div>
        </div>
        <div class="glass-card stat-card">
          <div class="stat-value">4.8</div>
          <div class="stat-label">Avg Rating</div>
        </div>
      </div>

      <div class="grid grid-2" style="gap: 32px">
        <!-- SOS Alerts Section -->
        <div class="glass-card">
          <h2 class="mb-3">Recent SOS Alerts</h2>
          <div id="admin-sos-list" class="flex flex-col gap-2">
            <!-- Placeholder for SOS Alerts -->
            <div style="padding: 16px; border: 1px dashed var(--border-color); border-radius: var(--radius-md); background: rgba(192, 57, 43, 0.05); text-align: center;">
              <p class="text-secondary">No active emergency alerts at this time.</p>
              <p class="small text-muted mt-1">When an SOS is triggered, it will appear here instantly.</p>
            </div>
          </div>
        </div>

        <!-- System Activity Section -->
        <div class="glass-card">
          <h2 class="mb-3">Recent Platform Activity</h2>
          <div class="flex flex-col gap-2">
            <div style="padding: 12px 16px; background: var(--bg-glass); border-radius: var(--radius-md); font-size: 0.9rem;">
              <span class="badge badge-success mb-1">New User</span>
              <div><strong class="text-accent">John Doe</strong> registered via Google.</div>
              <div class="text-muted small mt-1">2 mins ago</div>
            </div>
            <div style="padding: 12px 16px; background: var(--bg-glass); border-radius: var(--radius-md); font-size: 0.9rem;">
              <span class="badge badge-warning mb-1">New Agency</span>
              <div><strong class="text-accent">Wanderlust Escapes</strong> submitted registration.</div>
              <div class="text-muted small mt-1">15 mins ago</div>
            </div>
            <div style="padding: 12px 16px; background: var(--bg-glass); border-radius: var(--radius-md); font-size: 0.9rem;">
              <span class="badge badge-info mb-1">Booking</span>
              <div><strong class="text-accent">Sarah Smith</strong> booked "Bali Adventure".</div>
              <div class="text-muted small mt-1">1 hour ago</div>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm mt-3 w-100" style="width: 100%;">View Full Log</button>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Real data fetching logic would go here if the backend had an admin endpoint
  // e.g. const data = await api.admin.getDashboardStats();
}
