// User Login Page
import { auth } from '../api.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';

export default async function LoginPage(container) {
  container.innerHTML = `
    <div class="auth-page">
      <div class="glass-card auth-card animate-in">
        <h2 style="font-family: var(--font-display);">Welcome Back</h2>
        <p class="auth-subtitle">Sign in to your TravelHub account</p>

        <form id="login-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" class="form-input" placeholder="Enter your username" required />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" class="form-input" placeholder="Enter your password" required />
          </div>

          <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 8px;" id="login-btn">
            Sign In
          </button>
        </form>

        <p class="auth-switch">
          Don't have an account? <a href="/register" data-link>Sign up</a>
        </p>
        <p class="auth-switch" style="margin-top: 8px;">
          <a href="/agency-login" data-link>Login as Agency →</a>
        </p>
      </div>
    </div>
  `;

  container.querySelector('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = container.querySelector('#login-btn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Signing in...';

    try {
      const username = container.querySelector('#username').value;
      await auth.loginUser({
        username,
        password: container.querySelector('#password').value,
      });
      // Store login state
      localStorage.setItem('travelhub_user', JSON.stringify({ username, role: 'user' }));
      window.dispatchEvent(new Event('travelhub-auth'));
      showToast('Login successful!', 'success');
      navigate('/user-dashboard');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  });
}
