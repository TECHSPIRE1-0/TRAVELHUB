// Trip Tinder / Matchmaking Page
import { matchmaking } from '../api.js';
import { showToast } from '../components/toast.js';

export default async function MatchmakingPage(container) {
  container.innerHTML = `
    <section class="section">
      <div class="container" style="max-width: 800px;">
        <div class="text-center animate-in">
          <h1 class="section-title">💘 Trip Tinder</h1>
          <p class="section-subtitle" style="margin: 0 auto 40px;">Compare two traveler profiles and find out if you're compatible travel buddies!</p>
        </div>

        <div class="glass-card animate-in" style="animation-delay: 0.1s;">
          <form id="match-form">
            <div class="grid grid-2" style="gap: 24px;">
              <!-- Traveler 1 -->
              <div>
                <h3 style="margin-bottom: 16px; text-align: center;">Traveler 1 🧑</h3>
                <div class="form-group"><label>Name</label><input type="text" id="u1-name" class="form-input" placeholder="Rohit" required /></div>
                <div class="form-group"><label>Budget Style</label>
                  <select id="u1-budget" class="form-input"><option value="backpacker">Backpacker</option><option value="midrange" selected>Mid-range</option><option value="luxury">Luxury</option></select>
                </div>
                <div class="form-group"><label>Vibe</label>
                  <select id="u1-vibe" class="form-input"><option value="adventure">Adventure</option><option value="culture">Culture</option><option value="beach">Beach</option><option value="nature">Nature</option><option value="city">City</option></select>
                </div>
                <div class="form-group"><label>Activity Level</label>
                  <select id="u1-activity" class="form-input"><option value="relaxed">Relaxed</option><option value="moderate">Moderate</option><option value="intense" selected>Intense</option></select>
                </div>
              </div>

              <!-- Traveler 2 -->
              <div>
                <h3 style="margin-bottom: 16px; text-align: center;">Traveler 2 🧑</h3>
                <div class="form-group"><label>Name</label><input type="text" id="u2-name" class="form-input" placeholder="Kabir" required /></div>
                <div class="form-group"><label>Budget Style</label>
                  <select id="u2-budget" class="form-input"><option value="backpacker">Backpacker</option><option value="midrange" selected>Mid-range</option><option value="luxury">Luxury</option></select>
                </div>
                <div class="form-group"><label>Vibe</label>
                  <select id="u2-vibe" class="form-input"><option value="adventure" selected>Adventure</option><option value="culture">Culture</option><option value="beach">Beach</option><option value="nature">Nature</option><option value="city">City</option></select>
                </div>
                <div class="form-group"><label>Activity Level</label>
                  <select id="u2-activity" class="form-input"><option value="relaxed">Relaxed</option><option value="moderate">Moderate</option><option value="intense" selected>Intense</option></select>
                </div>
              </div>
            </div>

            <div class="form-group mt-2">
              <label>Destination (Optional)</label>
              <input type="text" id="m-dest" class="form-input" placeholder="e.g. Manali" />
            </div>

            <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 8px;" id="match-btn">
              💘 Check Compatibility
            </button>
          </form>
        </div>

        <div id="match-result" class="mt-4"></div>
      </div>
    </section>
  `;

  container.querySelector('#match-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = container.querySelector('#match-btn');
    const resultArea = container.querySelector('#match-result');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Analyzing compatibility...';

    try {
      const result = await matchmaking.score({
        user1_name: container.querySelector('#u1-name').value,
        user1_profile: {
          budget_style: container.querySelector('#u1-budget').value,
          vibe: container.querySelector('#u1-vibe').value,
          activity_level: container.querySelector('#u1-activity').value,
        },
        user2_name: container.querySelector('#u2-name').value,
        user2_profile: {
          budget_style: container.querySelector('#u2-budget').value,
          vibe: container.querySelector('#u2-vibe').value,
          activity_level: container.querySelector('#u2-activity').value,
        },
        destination: container.querySelector('#m-dest').value || null,
      });

      const score = result.compatibility_score || 0;
      const color = score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';

      resultArea.innerHTML = `
        <div class="glass-card text-center animate-in" style="padding: 40px;">
          <div class="compatibility-meter" style="--score: ${score}%;">
            <span class="score" style="color: ${color};">${score}%</span>
          </div>

          <h2 style="margin-top: 24px; font-size: 1.6rem;">${result.verdict}</h2>
          <p class="text-secondary mt-2" style="max-width: 500px; margin: 8px auto 0; line-height: 1.6;">${result.analysis}</p>
        </div>
      `;
    } catch (err) {
      resultArea.innerHTML = `<div class="glass-card text-center" style="padding: 40px;"><p class="text-secondary">${err.message}</p></div>`;
    } finally {
      btn.disabled = false;
      btn.textContent = '💘 Check Compatibility';
    }
  });
}
