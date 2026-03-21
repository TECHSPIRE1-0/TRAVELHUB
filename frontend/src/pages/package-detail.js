// Package Detail Page
import { packages as packagesApi, socialProof, enquiry as enquiryApi } from '../api.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';

export default async function PackageDetailPage(container, params) {
  const packageId = params.id;

  container.innerHTML = `
    <section class="section">
      <div class="container" style="max-width: 900px;">
        <div class="glass-card skeleton" style="height: 400px;"></div>
      </div>
    </section>
  `;

  // Try to load social proof data
  let proofData = null;
  try {
    proofData = await socialProof.get(packageId);
    socialProof.trackView(packageId); // Fire and forget
  } catch {}

  const proofHtml = proofData ? `
    <div class="social-proof-banner">
      ${proofData.urgency_tags?.map(tag => `
        <span class="proof-tag urgency-${proofData.urgency_level}">${tag}</span>
      `).join('') || ''}
      ${proofData.viewers_now ? `<span class="proof-tag urgency-medium">👀 ${proofData.viewers_now} viewing now</span>` : ''}
      ${proofData.seats_left !== null ? `<span class="proof-tag urgency-${proofData.seats_left < 5 ? 'high' : 'low'}">🪑 ${proofData.seats_left} seats left</span>` : ''}
    </div>
  ` : '';

  container.innerHTML = `
    <section class="section">
      <div class="container" style="max-width: 900px;">
        <a href="/packages" data-link class="text-secondary" style="display: inline-flex; align-items: center; gap: 6px; margin-bottom: 24px;">← Back to Packages</a>

        <div class="glass-card animate-in">
          <div class="package-image" style="height: 250px; border-radius: var(--radius-lg); margin-bottom: 24px;">
            <div class="package-badge">Package #${packageId}</div>
          </div>

          <h1 style="font-size: 2rem; margin-bottom: 8px;">${proofData?.title || `Package #${packageId}`}</h1>
          <p class="text-secondary" style="font-size: 1.1rem; margin-bottom: 8px;">📍 ${proofData?.destination || 'Loading...'}</p>

          ${proofHtml}

          <div style="display: flex; gap: 24px; flex-wrap: wrap; margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border-color);">
            <a href="/booking?package_id=${packageId}" data-link class="btn btn-primary btn-lg">🎫 Book Now</a>
            <button class="btn btn-secondary btn-lg" id="enquiry-toggle">📩 Send Enquiry</button>
            <a href="/negotiator?package_id=${packageId}" data-link class="btn btn-gold btn-lg">🤝 Negotiate Price</a>
          </div>
        </div>

        <!-- Enquiry Form -->
        <div class="glass-card animate-in hidden mt-3" id="enquiry-form-container">
          <h3 style="margin-bottom: 16px;">Send Enquiry</h3>
          <form id="enquiry-form">
            <div class="grid grid-2" style="gap: 12px;">
              <div class="form-group"><label>Name</label><input type="text" id="eq-name" class="form-input" required /></div>
              <div class="form-group"><label>Email</label><input type="email" id="eq-email" class="form-input" required /></div>
              <div class="form-group"><label>Phone</label><input type="tel" id="eq-phone" class="form-input" required /></div>
              <div class="form-group"><label>Destination</label><input type="text" id="eq-dest" class="form-input" value="${proofData?.destination || ''}" required /></div>
              <div class="form-group"><label>Travel Date</label><input type="date" id="eq-date" class="form-input" required /></div>
              <div class="form-group"><label>Travellers</label><input type="number" id="eq-travelers" class="form-input" value="2" min="1" required /></div>
            </div>
            <div class="form-group"><label>Message</label><textarea id="eq-msg" class="form-input" placeholder="Any special requests..."></textarea></div>
            <button type="submit" class="btn btn-primary" id="eq-submit">Send Enquiry</button>
          </form>
        </div>
      </div>
    </section>
  `;

  // Toggle enquiry form
  container.querySelector('#enquiry-toggle')?.addEventListener('click', () => {
    container.querySelector('#enquiry-form-container')?.classList.toggle('hidden');
  });

  // Submit enquiry
  container.querySelector('#enquiry-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = container.querySelector('#eq-submit');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div>';

    try {
      await enquiryApi.send({
        package_id: parseInt(packageId),
        name: container.querySelector('#eq-name').value,
        email: container.querySelector('#eq-email').value,
        phone: container.querySelector('#eq-phone').value,
        destination: container.querySelector('#eq-dest').value,
        travel_date: container.querySelector('#eq-date').value,
        travellers: parseInt(container.querySelector('#eq-travelers').value),
        message: container.querySelector('#eq-msg').value,
      });
      showToast('Enquiry sent successfully!', 'success');
      container.querySelector('#enquiry-form-container')?.classList.add('hidden');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send Enquiry';
    }
  });
}
