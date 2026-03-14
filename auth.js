// ============================================================
// TRAVELHUB — AUTH JS (login.html & register.html)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // NAV always scrolled on auth pages
  document.getElementById('nav')?.classList.add('scrolled');

  // ---- TRAVELLER / AGENCY TABS ----
  const tabTraveller = document.getElementById('tabTraveller');
  const tabAgency = document.getElementById('tabAgency');
  const travellerForm = document.getElementById('travellerForm') || document.getElementById('loginForm');
  const agencyForm = document.getElementById('agencyForm');

  if (tabTraveller && tabAgency) {
    tabTraveller.addEventListener('click', () => {
      tabTraveller.classList.add('active');
      tabAgency.classList.remove('active');
      travellerForm?.classList.remove('hidden');
      agencyForm?.classList.add('hidden');
    });
    tabAgency.addEventListener('click', () => {
      tabAgency.classList.add('active');
      tabTraveller.classList.remove('active');
      agencyForm?.classList.remove('hidden');
      travellerForm?.classList.add('hidden');
    });
  }

  // ---- PASSWORD TOGGLE ----
  const togglePw = document.getElementById('togglePw');
  const passwordInput = document.getElementById('passwordInput');
  if (togglePw && passwordInput) {
    togglePw.addEventListener('click', () => {
      const isPass = passwordInput.type === 'password';
      passwordInput.type = isPass ? 'text' : 'password';
      togglePw.textContent = isPass ? '🙈' : '👁';
    });
  }

  // ---- PASSWORD STRENGTH ----
  const pwStrength = document.getElementById('pwStrength');
  if (passwordInput && pwStrength) {
    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value;
      let strength = 0;
      if (val.length >= 8) strength++;
      if (/[A-Z]/.test(val)) strength++;
      if (/[0-9]/.test(val)) strength++;
      if (/[^A-Za-z0-9]/.test(val)) strength++;
      const colors = ['', '#e05c5c', '#f4a261', '#e8c96d', '#2d9d74'];
      const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
      pwStrength.style.background = colors[strength] || 'transparent';
      pwStrength.style.width = val.length === 0 ? '0' : (strength * 25) + '%';
      pwStrength.title = labels[strength] || '';
    });
  }

  // ---- LOGIN FORM ----
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = loginForm.querySelector('button[type=submit]');
      btn.textContent = 'Signing in…';
      btn.disabled = true;
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    });
  }

  // ---- REGISTER FORMS ----
  const travellerRegForm = document.getElementById('travellerForm');
  if (travellerRegForm && travellerRegForm.id !== 'loginForm') {
    travellerRegForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = travellerRegForm.querySelector('button[type=submit]');
      btn.textContent = 'Creating account…';
      btn.disabled = true;
      setTimeout(() => {
        showSuccess('Your traveller account has been created! Welcome to TravelHub.');
      }, 1500);
    });
  }

  const agencyRegForm = document.getElementById('agencyForm');
  if (agencyRegForm) {
    agencyRegForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = agencyRegForm.querySelector('button[type=submit]');
      btn.textContent = 'Registering…';
      btn.disabled = true;
      setTimeout(() => {
        showSuccess('Your agency registration is under review. We\'ll verify and activate your account within 24 hours.');
      }, 1500);
    });
  }

  function showSuccess(msg) {
    const div = document.createElement('div');
    div.style.cssText = `position:fixed;top:80px;right:24px;background:#2d9d74;color:white;padding:16px 24px;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.2);z-index:9999;font-size:0.9rem;max-width:380px;line-height:1.5;animation:slideIn 0.4s ease`;
    div.textContent = '✅ ' + msg;
    document.body.appendChild(div);
    setTimeout(() => { div.remove(); window.location.href = 'index.html'; }, 3500);
  }

  // ---- SOCIAL AUTH BUTTONS ----
  document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.textContent = '⏳ Connecting…';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = btn.textContent.includes('Google') ? '🔴 G Google' : '🔵 f Facebook';
        btn.disabled = false;
        alert('Social login would connect to OAuth in production.');
      }, 1000);
    });
  });

});
