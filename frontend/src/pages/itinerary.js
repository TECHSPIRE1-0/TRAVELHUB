// AI Itinerary Generator Page
import { itinerary as itineraryApi } from '../api.js';
import { showToast } from '../components/toast.js';

export default async function ItineraryPage(container) {
  container.innerHTML = `
    <section class="section">
      <div class="container" style="max-width: 800px;">
        <div class="text-center animate-in">
          <h1 class="section-title">📅 AI Itinerary Generator</h1>
          <p class="section-subtitle" style="margin: 0 auto 40px;">Get a personalized day-by-day travel plan with cost estimates and packing tips.</p>
        </div>

        <div class="glass-card animate-in" style="animation-delay: 0.1s;">
          <form id="itinerary-form">
            <div class="grid grid-2" style="gap: 16px;">
              <div class="form-group">
                <label>Destination</label>
                <input type="text" id="it-dest" class="form-input" placeholder="e.g. Goa, Manali, Kerala" required />
              </div>
              <div class="form-group">
                <label>Budget (₹)</label>
                <input type="number" id="it-budget" class="form-input" placeholder="15000" required />
              </div>
              <div class="form-group">
                <label>Duration (Days)</label>
                <input type="number" id="it-days" class="form-input" placeholder="3" min="1" max="30" required />
              </div>
              <div class="form-group">
                <label>Traveler Type</label>
                <select id="it-type" class="form-input">
                  <option value="solo">Solo</option>
                  <option value="couple" selected>Couple</option>
                  <option value="family">Family</option>
                  <option value="friends">Friends</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Preferences (Optional)</label>
              <textarea id="it-prefs" class="form-input" placeholder="e.g. We love beach parties and spicy food. Prefer avoiding crowded tourist spots."></textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;" id="gen-btn">
              🪄 Generate Itinerary
            </button>
          </form>
        </div>

        <div id="itinerary-result" class="mt-4"></div>
      </div>
    </section>
  `;

  container.querySelector('#itinerary-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = container.querySelector('#gen-btn');
    const resultArea = container.querySelector('#itinerary-result');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Generating with AI...';
    resultArea.innerHTML = '';

    try {
      const result = await itineraryApi.generate({
        destination: container.querySelector('#it-dest').value,
        budget: parseFloat(container.querySelector('#it-budget').value),
        duration_days: parseInt(container.querySelector('#it-days').value),
        traveler_type: container.querySelector('#it-type').value,
        preferences: container.querySelector('#it-prefs').value || null,
      });

      const budgetClass = result.budget_status?.toLowerCase().includes('under')
        ? 'badge-success'
        : result.budget_status?.toLowerCase().includes('over')
        ? 'badge-danger'
        : 'badge-warning';

      resultArea.innerHTML = `
        <!-- Summary -->
        <div class="glass-card animate-in mb-3">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div>
              <h2 style="font-size: 1.5rem;">${result.destination} — ${result.duration_days} Days</h2>
              <p class="text-secondary">Total estimated cost: <strong class="text-gold">₹${(result.total_estimated_cost || 0).toLocaleString('en-IN')}</strong></p>
            </div>
            <span class="badge ${budgetClass}" style="font-size: 0.9rem; padding: 8px 16px;">${result.budget_status}</span>
          </div>
        </div>

        <!-- Packing Tips -->
        ${result.packing_tips?.length ? `
          <div class="glass-card animate-in mb-3" style="animation-delay: 0.1s;">
            <h3 style="margin-bottom: 12px;">🎒 Packing Tips</h3>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px;">
              ${result.packing_tips.map(tip => `<li style="display: flex; align-items: center; gap: 8px;"><span style="color: var(--accent-primary);">•</span> ${tip}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <!-- Daily Itinerary -->
        <h3 class="mb-2" style="animation-delay: 0.2s;">Day-by-Day Itinerary</h3>
        ${result.itinerary?.map((day, i) => `
          <div class="itinerary-day animate-in" style="animation-delay: ${0.2 + i * 0.1}s;">
            <div class="day-marker"></div>
            <div class="glass-card mb-2">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h3>Day ${day.day}: ${day.theme}</h3>
                <span class="text-gold" style="font-weight: 600;">₹${(day.daily_total_cost || 0).toLocaleString('en-IN')}</span>
              </div>
              ${day.activities?.map(act => `
                <div class="itinerary-activity">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <strong>${act.time} — ${act.title}</strong>
                    <span class="text-muted" style="font-size: 0.85rem;">₹${(act.estimated_cost_inr || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <p class="text-secondary" style="font-size: 0.9rem;">${act.description}</p>
                </div>
              `).join('') || ''}
            </div>
          </div>
        `).join('') || ''}
      `;
    } catch (err) {
      resultArea.innerHTML = `<div class="glass-card text-center" style="padding: 40px;"><p class="text-secondary">${err.message}</p></div>`;
    } finally {
      btn.disabled = false;
      btn.textContent = '🪄 Generate Itinerary';
    }
  });
}
