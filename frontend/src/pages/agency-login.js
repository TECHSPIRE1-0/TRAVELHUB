// Agency Login Page
import { auth } from '../api.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';

export default async function AgencyLoginPage(container) {
  container.innerHTML = `
    <div class="auth-page">
      <div class="glass-card auth-card animate-in">
        <h2 style="font-family: var(--font-display);">Agency Portal</h2>
        <p class="auth-subtitle">Sign in to manage your travel packages</p>

        <form id="agency-login-form">
          <div class="form-group">
            <label for="business_email">Business Email</label>
            <input type="email" id="business_email" class="form-input" placeholder="agency@example.com" required />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" class="form-input" placeholder="Enter your password" required />
          </div>

          <button type="submit" class="btn btn-gold btn-lg" style="width: 100%; margin-top: 8px;" id="agency-login-btn">
            Sign In as Agency
          </button>
        </form>

        <p class="auth-switch">
          Don't have an agency account? <a href="/agency-register" data-link>Register Agency</a>
        </p>
        <p class="auth-switch" style="margin-top: 8px;">
          <a href="/login" data-link>← User Login</a>
        </p>
      </div>
    </div>
  `;

  container.querySelector('#agency-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = container.querySelector('#agency-login-btn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Signing in...';

    try {
      const email = container.querySelector('#business_email').value;
      await auth.loginAgency({
        business_email: email,
        password: container.querySelector('#password').value,
      });
      localStorage.setItem('travelhub_user', JSON.stringify({ email, role: 'agency' }));
      window.dispatchEvent(new Event('travelhub-auth'));
      showToast('Agency login successful!', 'success');
      navigate('/agency-dashboard');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sign In as Agency';
    }
  });
}
