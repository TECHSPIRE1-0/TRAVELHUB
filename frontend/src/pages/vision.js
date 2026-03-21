// AI Visual Search / Image to Trip Page
import { vision } from '../api.js';
import { showToast } from '../components/toast.js';

export default async function VisionPage(container) {
  container.innerHTML = `
    <section class="section">
      <div class="container" style="max-width: 700px;">
        <div class="text-center animate-in">
          <h1 class="section-title">📸 AI Visual Search</h1>
          <p class="section-subtitle" style="margin: 0 auto 40px;">Upload a photo and let AI identify the destination and match travel packages!</p>
        </div>

        <div class="glass-card animate-in" style="animation-delay: 0.1s;">
          <div class="upload-zone" id="upload-zone">
            <div class="upload-icon">📷</div>
            <h3>Drop an image here</h3>
            <p class="text-secondary mt-1">or click to browse</p>
            <p class="text-muted mt-2" style="font-size: 0.8rem;">Supports JPG, PNG, WEBP</p>
          </div>
          <input type="file" id="file-input" accept="image/*" style="display: none;" />

          <!-- Preview -->
          <div id="preview-area" class="hidden mt-2 text-center">
            <img id="preview-img" style="max-height: 300px; border-radius: var(--radius-md); margin: 0 auto;" />
            <button class="btn btn-primary btn-lg mt-2" id="analyze-btn" style="width: 100%;">
              🔍 Analyze Image
            </button>
          </div>
        </div>

        <div id="vision-result" class="mt-4"></div>
      </div>
    </section>
  `;

  const zone = container.querySelector('#upload-zone');
  const fileInput = container.querySelector('#file-input');
  const previewArea = container.querySelector('#preview-area');
  const previewImg = container.querySelector('#preview-img');
  let selectedFile = null;

  // Click to browse
  zone.addEventListener('click', () => fileInput.click());

  // File input change
  fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
  });

  // Drag & Drop
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('dragover');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });

  function handleFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'warning');
      return;
    }
    selectedFile = file;
    const url = URL.createObjectURL(file);
    previewImg.src = url;
    previewArea.classList.remove('hidden');
    zone.style.display = 'none';
  }

  // Analyze
  container.querySelector('#analyze-btn')?.addEventListener('click', async () => {
    if (!selectedFile) return;
    const btn = container.querySelector('#analyze-btn');
    const resultArea = container.querySelector('#vision-result');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> AI is analyzing...';

    try {
      const result = await vision.analyze(selectedFile);

      resultArea.innerHTML = `
        <div class="glass-card animate-in">
          <h3 style="margin-bottom: 16px;">🧠 AI Analysis</h3>
          ${result.identified_location ? `<p style="margin-bottom: 8px;"><strong>Location:</strong> ${result.identified_location}</p>` : ''}
          ${result.description ? `<p class="text-secondary" style="margin-bottom: 16px;">${result.description}</p>` : ''}
          ${result.confidence ? `<p class="text-muted" style="margin-bottom: 16px; font-size: 0.85rem;">Confidence: ${(result.confidence * 100).toFixed(0)}%</p>` : ''}

          ${result.matched_packages?.length ? `
            <h4 style="margin-bottom: 12px;">Matched Packages</h4>
            ${result.matched_packages.map(pkg => `
              <div class="glass-card mb-2" data-link href="/package/${pkg.id}" style="cursor: pointer;">
                <h4>${pkg.title}</h4>
                <p class="text-secondary" style="font-size: 0.85rem;">📍 ${pkg.destination} · ₹${(pkg.base_price || 0).toLocaleString('en-IN')}</p>
              </div>
            `).join('')}
          ` : '<p class="text-secondary">No matching packages found for this image.</p>'}
        </div>
      `;
    } catch (err) {
      resultArea.innerHTML = `<div class="glass-card text-center" style="padding: 40px;"><p class="text-secondary">${err.message}</p></div>`;
    } finally {
      btn.disabled = false;
      btn.textContent = '🔍 Analyze Image';
    }
  });
}
