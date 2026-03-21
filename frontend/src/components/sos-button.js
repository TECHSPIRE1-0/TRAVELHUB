// =========================================================================
// TRAVELHUB — Global SOS Button Component
// =========================================================================

import { sos } from '../api.js';

export function renderSOSButton() {
  const container = document.createElement('div');
  container.id = 'sos-button-container';

  container.innerHTML = `
    <!-- Floating Action Button -->
    <button id="sos-fab" class="sos-fab" aria-label="Emergency SOS">
      <div class="sos-pulse"></div>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
      <span>SOS</span>
    </button>

    <!-- Modal Overlay -->
    <div id="sos-modal-overlay" class="sos-modal-overlay hidden">
      <div class="sos-modal">
        <div class="sos-modal-header">
          <h2>Emergency Alert</h2>
          <button id="sos-close-btn" class="sos-close-btn" aria-label="Close">×</button>
        </div>
        <div class="sos-modal-body">
          <p class="text-secondary mb-3">
            Trigger an immediate SOS alert. Our team and local authorities will be notified with your last known location.
          </p>
          <div class="form-group mb-3">
            <label for="sos-message">Emergency Message (Optional)</label>
            <textarea id="sos-message" class="form-control" rows="3" placeholder="Briefly describe your emergency (e.g. medical, accident, lost, in danger)..."></textarea>
          </div>
          <p class="text-danger small mb-3">
            <strong>Note:</strong> We will attempt to attach your precise GPS location to this alert. You may be prompted by your browser to allow location access.
          </p>
        </div>
        <div class="sos-modal-footer">
          <button id="sos-cancel-btn" class="btn btn-outline" style="border-color: #333; color: white; background: #222;">Cancel</button>
          <button id="sos-send-btn" class="btn btn-danger sos-send-action">
            SEND ALERT NOW
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  // Bind Events
  const fab = document.getElementById('sos-fab');
  const overlay = document.getElementById('sos-modal-overlay');
  const closeBtn = document.getElementById('sos-close-btn');
  const cancelBtn = document.getElementById('sos-cancel-btn');
  const sendBtn = document.getElementById('sos-send-btn');
  const msgInput = document.getElementById('sos-message');

  const openModal = () => { overlay.classList.remove('hidden'); };
  const closeModal = () => { overlay.classList.add('hidden'); msgInput.value = ''; };

  fab.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  // Close when clicking outside of modal
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  sendBtn.addEventListener('click', async () => {
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<span class="spinner"></span> Sending...';
    
    let lat = null;
    let lng = null;
    
    // Try to get location
    try {
      if ('geolocation' in navigator) {
        const getLoc = new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
        });
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000));
        const position = await Promise.race([getLoc, timeout]);
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      }
    } catch (e) {
      console.warn("Could not retrieve location for SOS:", e.message);
      // We will still send the SOS even if location fails.
    }

    try {
      const payload = {
        latitude: lat,
        longitude: lng,
        message: msgInput.value.trim() || undefined,
        timestamp: new Date().toISOString()
      };
      
      const response = await sos.sendAlert(payload);
      
      closeModal();
      
      // Try to use toast if available, otherwise native alert
      if (window.showToast) {
         window.showToast("Emergency alert sent. Help is on the way.", "error");
      } else {
         alert("EMERGENCY ALERT SENT: Help is on the way.");
      }
      
    } catch (err) {
      alert("Failed to send alert: " + err.message);
    } finally {
      sendBtn.disabled = false;
      sendBtn.innerHTML = 'SEND ALERT NOW';
    }
  });
}
