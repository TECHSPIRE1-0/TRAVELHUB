// Admin Registration Page
import { adminAuth } from '../api.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';

export default async function AdminRegisterPage(container) {
  container.innerHTML = `
    <div class="auth-page">
      <div class="glass-card auth-card animate-in">
        <h2 style="color: var(--danger);">Admin Setup</h2>
        <p class="auth-subtitle">Register a new TravelHub Administrator</p>

        <form id="admin-register-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" class="form-input" placeholder="Admin username" required />
          </div>

          <div class="form-group">
            <label for="email">Admin Email</label>
            <input type="email" id="email" class="form-input" placeholder="admin@travelhub.com" required />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" class="form-input" placeholder="Create a strong password" required minlength="6" />
          </div>

          <button type="submit" class="btn btn-danger btn-lg" style="width: 100%; margin-top: 8px;" id="register-btn">
            Create Admin Account
          </button>
        </form>

        <p class="auth-switch">
          Already an admin? <a href="/admin-login" data-link>Sign in</a>
        </p>
      </div>
    </div>
  `;

  container.querySelector('#admin-register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = container.querySelector('#register-btn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Creating admin...';

    try {
      await adminAuth.register({
        username: container.querySelector('#username').value,
        email: container.querySelector('#email').value,
        password: container.querySelector('#password').value,
      });
      showToast('Admin account created! Please sign in.', 'success');
      navigate('/admin-login');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Create Admin Account';
    }
  });
}
