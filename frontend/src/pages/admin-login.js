// Admin Login Page
import { adminAuth } from '../api.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';

export default async function AdminLoginPage(container) {
  container.innerHTML = `
    <div class="auth-page">
      <div class="glass-card auth-card animate-in">
        <h2 style="font-family: var(--font-display); color: var(--danger);">Admin Portal</h2>
        <p class="auth-subtitle">Sign in to the TravelHub Control Center</p>

        <form id="admin-login-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" class="form-input" placeholder="Admin username" required />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" class="form-input" placeholder="Enter your password" required />
          </div>

          <button type="submit" class="btn btn-danger btn-lg" style="width: 100%; margin-top: 8px;" id="login-btn">
            Sign In to Admin
          </button>
        </form>

        <p class="auth-switch">
          Need an admin account? <a href="/admin-register" data-link>Register here</a>
        </p>
        <p class="auth-switch" style="margin-top: 8px;">
          <a href="/login" data-link>Return to User Login →</a>
        </p>
      </div>
    </div>
  `;

  container.querySelector('#admin-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = container.querySelector('#login-btn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Signing in...';

    try {
      const username = container.querySelector('#username').value;
      await adminAuth.login({
        username,
        password: container.querySelector('#password').value,
      });
      // Store login state
      localStorage.setItem('travelhub_user', JSON.stringify({ username, role: 'admin' }));
      window.dispatchEvent(new Event('travelhub-auth'));
      showToast('Admin login successful!', 'success');
      navigate('/admin-dashboard');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sign In to Admin';
    }
  });
}
