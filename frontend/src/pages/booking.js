// Booking Page
import { booking as bookingApi, crowd as crowdApi } from '../api.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';

export default async function BookingPage(container) {
  const params = new URLSearchParams(window.location.search);
  const packageId = params.get('package_id') || '';

  container.innerHTML = `
    <section class="section">
      <div class="container" style="max-width: 800px;">
        <div class="dashboard-header animate-in">
          <h1 class="section-title">Complete Your Booking 🎫</h1>
          <p class="section-subtitle">Fill in your travel details to secure your spot.</p>
        </div>

        <div class="glass-card animate-in" style="animation-delay: 0.1s;">
          <form id="booking-form">
            <h3 style="margin-bottom: 20px;">Trip Details</h3>

            <div class="grid grid-2" style="gap: 16px;">
              <div class="form-group">
                <label>Package ID</label>
                <input type="number" id="b-package" class="form-input" value="${packageId}" required />
              </div>
              <div class="form-group">
                <label>Transport ID</label>
                <input type="number" id="b-transport" class="form-input" placeholder="1" required />
              </div>
              <div class="form-group" style="position: relative;">
                <label>Departure Date</label>
                <input type="date" id="b-depart" class="form-input" required />
                <div id="crowd-indicator" style="margin-top: 8px;"></div>
              </div>
              <div class="form-group">
                <label>Return Date</label>
                <input type="date" id="b-return" class="form-input" required />
              </div>
              <div class="form-group">
                <label>Adults</label>
                <input type="number" id="b-adults" class="form-input" value="2" min="1" required />
              </div>
              <div class="form-group">
                <label>Children</label>
                <input type="number" id="b-children" class="form-input" value="0" min="0" required />
              </div>
              <div class="form-group">
                <label>Room Type</label>
                <select id="b-room" class="form-input">
                  <option value="standard">Standard</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="suite">Suite</option>
                </select>
              </div>
              <div class="form-group">
                <label>Pickup City</label>
                <input type="text" id="b-pickup" class="form-input" placeholder="e.g. Mumbai" required />
              </div>
            </div>

            <div class="form-group">
              <label>Special Requests</label>
              <textarea id="b-special" class="form-input" placeholder="Dietary needs, accessibility, etc."></textarea>
            </div>

            <!-- Travellers -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px; margin-bottom: 16px;">
              <h3>Traveller Details</h3>
              <button type="button" class="btn btn-secondary btn-sm" id="add-traveller">+ Add Traveller</button>
            </div>

            <div id="travellers-list">
              <div class="glass-card traveller-entry" style="margin-bottom: 12px;">
                <div class="grid grid-2" style="gap: 12px;">
                  <div class="form-group" style="margin-bottom: 0;"><label>Full Name</label><input type="text" class="form-input t-name" required /></div>
                  <div class="form-group" style="margin-bottom: 0;"><label>Age</label><input type="number" class="form-input t-age" required /></div>
                  <div class="form-group" style="margin-bottom: 0;"><label>Gender</label>
                    <select class="form-input t-gender"><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select>
                  </div>
                  <div class="form-group" style="margin-bottom: 0;"><label>ID Type</label>
                    <select class="form-input t-id-type"><option value="aadhaar">Aadhaar</option><option value="passport">Passport</option><option value="pan">PAN</option></select>
                  </div>
                  <div class="form-group" style="margin-bottom: 0;"><label>Email</label><input type="email" class="form-input t-email" required /></div>
                  <div class="form-group" style="margin-bottom: 0;"><label>Phone</label><input type="tel" class="form-input t-phone" required /></div>
                </div>
              </div>
            </div>

            <button type="submit" class="btn btn-gold btn-lg" style="width: 100%; margin-top: 16px;" id="book-btn">
              Confirm Booking
            </button>
          </form>
        </div>
      </div>
    </section>
  `;

  // Listen to departure date change for crowd stats
  const departInput = container.querySelector('#b-depart');
  const crowdContainer = container.querySelector('#crowd-indicator');

  departInput.addEventListener('change', async (e) => {
    const val = e.target.value;
    const currentPackageId = container.querySelector('#b-package').value;
    
    if (!currentPackageId) {
      showToast('Please enter a Package ID first to see crowd levels!', 'warning');
      e.target.value = ''; // clear date to force re-selection later
      return;
    }
    
    if (!val) return;

    crowdContainer.innerHTML = '<div class="spinner" style="width: 14px; height: 14px; display: inline-block;"></div><span class="text-secondary" style="font-size: 0.8rem; margin-left:8px;">Checking availability...</span>';

    try {
      const crowdData = await crowdApi.checkPackage(currentPackageId, val);
      
      let badgeStyle = "background: rgba(45, 106, 79, 0.15); color: var(--success);";
      if (crowdData.crowd_level === "Moderate") badgeStyle = "background: rgba(233, 163, 25, 0.15); color: var(--warning);";
      if (crowdData.crowd_level === "High") badgeStyle = "background: rgba(200, 164, 94, 0.15); color: var(--accent);";
      if (crowdData.crowd_level === "Very Crowded") badgeStyle = "background: rgba(192, 57, 43, 0.15); color: var(--danger);";

      let altDatesHtml = '';
      if (crowdData.alternative_dates && crowdData.alternative_dates.length > 0) {
        altDatesHtml = `
          <div style="margin-top: 8px; font-size: 0.8rem;">
            <p class="text-secondary" style="margin-bottom:4px;">Quieter options (click to select):</p>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              ${crowdData.alternative_dates.map(d => `<button type="button" class="btn btn-sm btn-secondary alt-date-btn" data-date="${d}" style="padding: 4px 8px; font-size: 0.75rem; border-radius: 4px;">${d}</button>`).join('')}
            </div>
          </div>
        `;
      }

      crowdContainer.innerHTML = `
        <div style="padding: 10px; border-radius: 8px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); animation: fadeSlideUp 0.3s ease;">
          <div style="display: flex; align-items: flex-start; gap: 8px;">
            <div style="font-size: 1.2rem;">${crowdData.crowd_emoji}</div>
            <div>
              <div style="font-weight: 600; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;">
                 ${crowdData.crowd_level} <span class="badge" style="${badgeStyle} padding: 2px 6px; font-size: 0.65rem;">${crowdData.occupancy_percentage}% Booked</span>
              </div>
              <div class="text-secondary" style="font-size: 0.75rem; margin-top:2px;">${crowdData.recommendation}</div>
            </div>
          </div>
          ${altDatesHtml}
        </div>
      `;

      // Add click listeners to alternative dates if they exist
      crowdContainer.querySelectorAll('.alt-date-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          departInput.value = btn.dataset.date;
          departInput.dispatchEvent(new Event('change')); // Trigger re-check
        });
      });

    } catch (err) {
      crowdContainer.innerHTML = '<span class="text-danger" style="font-size:0.8rem;">Could not check available spots currently.</span>';
    }
  });

  // Add traveller
  container.querySelector('#add-traveller').addEventListener('click', () => {
    const entry = container.querySelector('.traveller-entry').cloneNode(true);
    entry.querySelectorAll('input').forEach((i) => (i.value = ''));
    container.querySelector('#travellers-list').appendChild(entry);
  });

  // Submit booking
  container.querySelector('#booking-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = container.querySelector('#book-btn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Processing...';

    const travellers = [...container.querySelectorAll('.traveller-entry')].map((el) => ({
      full_name: el.querySelector('.t-name').value,
      age: parseInt(el.querySelector('.t-age').value),
      gender: el.querySelector('.t-gender').value,
      id_type: el.querySelector('.t-id-type').value,
      email: el.querySelector('.t-email').value,
      phone: el.querySelector('.t-phone').value,
    }));

    try {
      const res = await bookingApi.create({
        package_id: parseInt(container.querySelector('#b-package').value),
        transport_id: parseInt(container.querySelector('#b-transport').value),
        departure_date: container.querySelector('#b-depart').value,
        return_date: container.querySelector('#b-return').value,
        adults: parseInt(container.querySelector('#b-adults').value),
        children: parseInt(container.querySelector('#b-children').value),
        room_type: container.querySelector('#b-room').value,
        pickup_city: container.querySelector('#b-pickup').value,
        special_requests: container.querySelector('#b-special').value || null,
        travellers,
      });
      showToast(`Booking confirmed! ID: ${res.booking_id}`, 'success');
      navigate('/user-dashboard');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Confirm Booking';
    }
  });
}
