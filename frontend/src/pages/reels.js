// Viral Reels Script Generator Page
import { reels } from '../api.js';
import { showToast } from '../components/toast.js';

export default async function ReelsPage(container) {
  container.innerHTML = `
    <section class="section">
      <div class="container" style="max-width: 700px;">
        <div class="text-center animate-in">
          <h1 class="section-title">🎬 Reels Script Generator</h1>
          <p class="section-subtitle" style="margin: 0 auto 40px;">Generate viral scene-by-scene scripts for Instagram Reels and TikTok to promote travel packages!</p>
        </div>

        <div class="glass-card animate-in" style="animation-delay: 0.1s;">
          <form id="reels-form">
            <div class="form-group">
              <label>Package ID</label>
              <input type="number" id="r-pkg-id" class="form-input" placeholder="Enter package ID to promote" required />
            </div>
            <div class="grid grid-2" style="gap: 16px;">
              <div class="form-group">
                <label>Tone</label>
                <select id="r-tone" class="form-input">
                  <option value="energetic">🔥 Energetic</option>
                  <option value="romantic">💕 Romantic</option>
                  <option value="cinematic">🎥 Cinematic</option>
                  <option value="funny">😂 Funny</option>
                  <option value="aesthetic">✨ Aesthetic</option>
                </select>
              </div>
              <div class="form-group">
                <label>Platform</label>
                <select id="r-platform" class="form-input">
                  <option value="Instagram Reels">Instagram Reels</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube Shorts">YouTube Shorts</option>
                </select>
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;" id="reels-btn">
              🎬 Generate Script
            </button>
          </form>
        </div>

        <div id="reels-result" class="mt-4"></div>
      </div>
    </section>
  `;

  container.querySelector('#reels-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = container.querySelector('#reels-btn');
    const resultArea = container.querySelector('#reels-result');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Generating script...';

    try {
      const result = await reels.generate({
        package_id: parseInt(container.querySelector('#r-pkg-id').value),
        tone: container.querySelector('#r-tone').value,
        platform: container.querySelector('#r-platform').value,
      });

      resultArea.innerHTML = `
        <div class="glass-card animate-in">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <div>
              <h2 style="font-size: 1.4rem;">${result.title}</h2>
              <p class="text-secondary" style="font-size: 0.9rem;">⏱ ${result.target_duration} · 🎵 ${result.suggested_audio}</p>
            </div>
            <span class="badge badge-accent">#${result.package_id}</span>
          </div>

          <!-- Scene-by-scene script -->
          <h3 style="margin-bottom: 16px;">Scene-by-Scene Script</h3>
          ${result.script?.map((scene, i) => `
            <div class="reels-scene glass-card animate-in" style="animation-delay: ${i * 0.1}s;">
              <div class="scene-timestamp">🎬 ${scene.timestamp_seconds}</div>
              <div style="display: grid; gap: 8px;">
                <div>
                  <span class="text-muted" style="font-size: 0.8rem;">📹 Visual:</span>
                  <p>${scene.visual}</p>
                </div>
                <div>
                  <span class="text-muted" style="font-size: 0.8rem;">🎤 Voiceover:</span>
                  <p style="font-style: italic;">"${scene.voiceover}"</p>
                </div>
                <div>
                  <span class="text-muted" style="font-size: 0.8rem;">📝 Text on screen:</span>
                  <p style="font-weight: 600;">${scene.text_on_screen}</p>
                </div>
              </div>
            </div>
          `).join('') || ''}

          <!-- Caption -->
          <div style="border-top: 1px solid var(--border-color); padding-top: 16px; margin-top: 16px;">
            <h4 style="margin-bottom: 8px;">📋 Caption</h4>
            <p class="text-secondary" style="white-space: pre-wrap; line-height: 1.7;">${result.caption}</p>
          </div>
        </div>
      `;
    } catch (err) {
      resultArea.innerHTML = `<div class="glass-card text-center" style="padding: 40px;"><p class="text-secondary">${err.message}</p></div>`;
    } finally {
      btn.disabled = false;
      btn.textContent = '🎬 Generate Script';
    }
  });
}
