// Mystery Flight Roulette Page
import { mysteryFlight } from '../api.js';
import { showToast } from '../components/toast.js';

export default async function MysteryFlightPage(container) {
  container.innerHTML = `
    <section class="section">
      <div class="container" style="max-width: 700px;">
        <div class="text-center animate-in">
          <h1 class="section-title">🎲 Mystery Flight Roulette</h1>
          <p class="section-subtitle" style="margin: 0 auto 40px;">Set your budget, book a blind trip, and discover the destination on travel day!</p>
        </div>

        <div class="glass-card animate-in text-center" style="animation-delay: 0.1s;">
          <div style="font-size: 4rem; margin-bottom: 16px;">✈️🎰</div>
          <h3 style="margin-bottom: 24px;">Ready for an Adventure?</h3>

          <form id="mystery-form">
            <div class="grid grid-2" style="gap: 16px; text-align: left;">
              <div class="form-group">
                <label>Your User ID</label>
                <input type="number" id="m-user-id" class="form-input" placeholder="Enter your user ID" required />
              </div>
              <div class="form-group">
                <label>Max Budget (₹)</label>
                <input type="number" id="m-budget" class="form-input" placeholder="25000" required />
              </div>
            </div>
            <button type="submit" class="btn btn-gold btn-lg" style="width: 100%; margin-top: 16px;" id="mystery-btn">
              🎲 Roll the Dice!
            </button>
          </form>
        </div>

        <div id="mystery-result" class="mt-4"></div>
      </div>
    </section>
  `;

  container.querySelector('#mystery-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = container.querySelector('#mystery-btn');
    const resultArea = container.querySelector('#mystery-result');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Finding your mystery destination...';

    // Add suspense animation
    resultArea.innerHTML = `
      <div class="glass-card text-center" style="padding: 40px;">
        <div style="font-size: 4rem; animation: float 1s ease-in-out infinite;">✈️</div>
        <p class="text-accent mt-2">Searching the globe for your mystery trip...</p>
      </div>
    `;

    try {
      const result = await mysteryFlight.book(
        parseInt(container.querySelector('#m-user-id').value),
        parseFloat(container.querySelector('#m-budget').value)
      );

      resultArea.innerHTML = `
        <div class="boarding-pass animate-in">
          <p class="text-gold" style="font-size: 0.8rem; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 16px;">✨ Your Mystery Boarding Pass ✨</p>
          
          <h2 style="font-size: 1.8rem; margin-bottom: 8px;">BOARDING PASS</h2>
          <p class="text-muted" style="margin-bottom: 24px;">Booking Reference: <strong class="text-accent">${result.booking_reference}</strong></p>

          <div style="display: flex; justify-content: center; gap: 40px; margin-bottom: 24px;">
            <div>
              <p class="text-muted" style="font-size: 0.75rem;">BUDGET USED</p>
              <p class="text-gold" style="font-size: 1.5rem; font-weight: 700;">₹${(result.budget_used || 0).toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p class="text-muted" style="font-size: 0.75rem;">ARRIVAL TIME</p>
              <p style="font-size: 1.1rem; font-weight: 600;">${result.airport_arrival_time}</p>
            </div>
          </div>

          <div style="border-top: 1px dashed var(--gold); padding-top: 20px; margin-top: 20px;">
            <p style="font-size: 1.1rem; font-style: italic; color: var(--text-secondary); line-height: 1.6;">"${result.mystery_announcement}"</p>
          </div>

          ${result.packing_hints?.length ? `
            <div style="border-top: 1px dashed var(--border-color); padding-top: 16px; margin-top: 16px;">
              <p class="text-muted" style="font-size: 0.8rem; margin-bottom: 8px;">PACKING HINTS 🎒</p>
              <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">
                ${result.packing_hints.map(h => `<span class="badge badge-accent">${h}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
      showToast('Mystery trip booked! 🎉', 'success');
    } catch (err) {
      resultArea.innerHTML = `<div class="glass-card text-center" style="padding: 40px;"><p class="text-secondary">${err.message}</p></div>`;
    } finally {
      btn.disabled = false;
      btn.textContent = '🎲 Roll the Dice!';
    }
  });
}
