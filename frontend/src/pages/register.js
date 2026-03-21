// User Registration Page
import { auth } from '../api.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';

export default async function RegisterPage(container) {
  container.innerHTML = `
    <div class="auth-page">
      <div class="glass-card auth-card animate-in">
        <h2>Join TravelHub 🚀</h2>
        <p class="auth-subtitle">Create your free traveler account</p>

        <form id="register-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" class="form-input" placeholder="Choose a username" required />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" class="form-input" placeholder="your@email.com" required />
          </div>

          <div class="form-group">
            <label for="phone">Phone Number</label>
            <input type="tel" id="phone" class="form-input" placeholder="+91 9876543210" required />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" class="form-input" placeholder="Create a strong password" required minlength="6" />
          </div>

          <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 8px;" id="register-btn">
            Create Account
          </button>
        </form>

        <p class="auth-switch">
          Already have an account? <a href="/login" data-link>Sign in</a>
        </p>
        <p class="auth-switch" style="margin-top: 8px;">
          <a href="/agency-register" data-link>Register as Agency →</a>
        </p>
      </div>
    </div>
  `;

  container.querySelector('#register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = container.querySelector('#register-btn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Creating account...';

    try {
      await auth.registerUser({
        username: container.querySelector('#username').value,
        email: container.querySelector('#email').value,
        phone_number: container.querySelector('#phone').value,
        password: container.querySelector('#password').value,
      });
      showToast('Account created! Please login.', 'success');
      navigate('/login');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Create Account';
    }
  });
}
