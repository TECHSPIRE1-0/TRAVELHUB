// Agency Registration Page
import { auth } from '../api.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';

export default async function AgencyRegisterPage(container) {
  container.innerHTML = `
    <div class="auth-page">
      <div class="glass-card auth-card animate-in" style="max-width: 540px;">
        <h2>Register Agency 🏢</h2>
        <p class="auth-subtitle">List your travel agency on TravelHub</p>

        <form id="agency-register-form">
          <div class="form-group">
            <label for="agency_name">Agency Name</label>
            <input type="text" id="agency_name" class="form-input" placeholder="Your Travel Agency" required />
          </div>

          <div class="grid grid-2" style="gap: 12px;">
            <div class="form-group">
              <label for="contact_person">Contact Person</label>
              <input type="text" id="contact_person" class="form-input" placeholder="Full Name" required />
            </div>
            <div class="form-group">
              <label for="designation">Designation</label>
              <input type="text" id="designation" class="form-input" placeholder="e.g. Manager" required />
            </div>
          </div>

          <div class="form-group">
            <label for="business_email">Business Email</label>
            <input type="email" id="business_email" class="form-input" placeholder="agency@business.com" required />
          </div>

          <div class="grid grid-2" style="gap: 12px;">
            <div class="form-group">
              <label for="phone_number">Phone Number</label>
              <input type="tel" id="phone_number" class="form-input" placeholder="+91 9876543210" required />
            </div>
            <div class="form-group">
              <label for="gst_number">GST Number (Optional)</label>
              <input type="text" id="gst_number" class="form-input" placeholder="GST Number" />
            </div>
          </div>

          <div class="form-group">
            <label for="business_location">Business Location</label>
            <input type="text" id="business_location" class="form-input" placeholder="City, State" required />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" class="form-input" placeholder="Create a strong password" required minlength="6" />
          </div>

          <button type="submit" class="btn btn-gold btn-lg" style="width: 100%; margin-top: 8px;" id="agency-reg-btn">
            Register Agency
          </button>
        </form>

        <p class="auth-switch">
          Already registered? <a href="/agency-login" data-link>Sign in</a>
        </p>
      </div>
    </div>
  `;

  container.querySelector('#agency-register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = container.querySelector('#agency-reg-btn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Registering...';

    try {
      await auth.registerAgency({
        agency_name: container.querySelector('#agency_name').value,
        contact_person: container.querySelector('#contact_person').value,
        designation: container.querySelector('#designation').value,
        business_email: container.querySelector('#business_email').value,
        phone_number: container.querySelector('#phone_number').value,
        business_location: container.querySelector('#business_location').value,
        gst_number: container.querySelector('#gst_number').value || null,
        password: container.querySelector('#password').value,
      });
      showToast('Agency registered! Please login.', 'success');
      navigate('/agency-login');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Register Agency';
    }
  });
}
