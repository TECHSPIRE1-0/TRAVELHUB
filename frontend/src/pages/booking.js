// Booking Page
import { booking as bookingApi } from '../api.js';
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
              <div class="form-group">
                <label>Departure Date</label>
                <input type="date" id="b-depart" class="form-input" required />
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
