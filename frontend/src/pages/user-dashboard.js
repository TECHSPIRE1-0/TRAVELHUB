// User Dashboard Page
import { user as userApi, chat as chatApi } from '../api.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';

export default async function UserDashboardPage(container) {
  // Premium Layout Setup
  container.innerHTML = `
    <section class="dashboard-page section" style="padding-top: 120px; min-height: 100vh; background: radial-gradient(circle at top right, rgba(200, 164, 94, 0.05), transparent 40%), var(--bg-primary);">
      <div class="container" style="max-width: 1100px;">
        <div class="dashboard-header flex justify-between items-center animate-in mb-4" id="user-profile-header">
          <div>
            <h1 style="font-size: 2.8rem; letter-spacing: -0.02em;">Welcome Back</h1>
            <p class="text-secondary" style="font-size: 1.1rem;">Manage your upcoming adventures and booking history.</p>
          </div>
          <div class="glass-card" style="padding: 16px 24px; border-radius: var(--radius-full); display: flex; align-items: center; gap: 12px; border: 1px solid var(--border-accent);">
            <div style="width: 44px; height: 44px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; color: #000; font-weight: bold; font-size: 1.2rem;">
              👤
            </div>
            <div>
              <p style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">Explorer</p>
              <p style="font-weight: 600; font-size: 1.05rem; margin: 0;" id="user-name-display">Loading...</p>
            </div>
          </div>
        </div>

        <div id="dashboard-content">
          <div class="glass-card skeleton" style="height: 300px; border-radius: var(--radius-xl);"></div>
        </div>
      </div>
      
      <!-- Chat Modal -->
      <div id="chat-modal" class="glass-card" style="display: none; position: fixed; bottom: 20px; right: 20px; width: 350px; height: 500px; z-index: 1000; flex-direction: column; border-radius: var(--radius-xl); box-shadow: var(--shadow-2xl); border: 1px solid var(--border-accent); background: var(--bg-card); overflow: hidden;">
        <div style="padding: 16px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.2);">
          <h3 style="margin: 0; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;"><span class="text-gold">💬</span> <span id="chat-agency-name" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;">Agency</span></h3>
          <button id="close-chat" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.2rem;">✖</button>
        </div>
        <div id="chat-messages" style="flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; font-size: 0.9rem;">
        </div>
        <form id="chat-form" style="padding: 16px; border-top: 1px solid var(--border-color); display: flex; gap: 8px; background: rgba(0,0,0,0.1); margin: 0;">
          <input type="text" id="chat-input" class="form-input" placeholder="Type a message..." style="flex: 1; border-radius: var(--radius-full); padding: 8px 16px;" required autocomplete="off" />
          <button type="submit" class="btn btn-gold" style="border-radius: 50%; width: 40px; height: 40px; padding: 0; display: flex; align-items: center; justify-content: center;">➤</button>
        </form>
      </div>
      
    </section>
  `;

  try {
    const data = await userApi.dashboard();
    const bookings = data?.bookings || [];
    
    // Update Name
    const userName = data?.user_name || 'Traveler';
    container.querySelector('#user-name-display').textContent = userName;
    container.querySelector('.dashboard-header h1').innerHTML = `Welcome, <span class="text-gold">${userName}</span>! 🌍`;

    const content = container.querySelector('#dashboard-content');

    if (bookings.length === 0) {
      content.innerHTML = `
        <div class="glass-card text-center animate-in" style="padding: 80px 20px; border-radius: var(--radius-xl); border: 1px dashed var(--border-accent); background: rgba(200, 164, 94, 0.02);">
          <div style="font-size: 3.5rem; margin-bottom: 20px; text-shadow: var(--shadow-gold);">🎒</div>
          <h2 style="margin-bottom: 12px; font-size: 1.8rem;">No adventures yet</h2>
          <p class="text-secondary mb-4" style="max-width: 400px; margin: 0 auto; font-size: 1.05rem;">Your passport is waiting to be stamped. Explore our curated packages and start your journey.</p>
          <a href="/packages" data-link class="btn btn-gold btn-lg mt-2" style="border-radius: var(--radius-full);">Explore Destinations <span style="margin-left:8px;">✈️</span></a>
        </div>
      `;
      return;
    }

    content.innerHTML = `
      <div class="glass-card animate-in" style="overflow-x: auto; border-radius: var(--radius-xl); padding: 0;">
        <div style="padding: 24px 32px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 1.4rem;">Recent Bookings</h3>
          <span class="badge badge-accent" style="font-size: 0.9rem;">${bookings.length} Total</span>
        </div>
        <table class="data-table" style="width: 100%; border-collapse: separate; border-spacing: 0;">
          <thead style="background: rgba(255,255,255,0.02);">
            <tr>
              <th style="padding: 20px 32px; color: var(--text-muted); font-weight: 600;">ID / Package</th>
              <th style="padding: 20px 32px; color: var(--text-muted); font-weight: 600;">Dates</th>
              <th style="padding: 20px 32px; color: var(--text-muted); font-weight: 600;">Travellers</th>
              <th style="padding: 20px 32px; color: var(--text-muted); font-weight: 600; text-align: right;">Total Price</th>
              <th style="padding: 20px 32px; color: var(--text-muted); font-weight: 600; text-align: center;">Status</th>
              <th style="padding: 20px 32px; color: var(--text-muted); font-weight: 600; text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${bookings.map((b, i) => `
              <tr style="transition: all 0.2s; border-bottom: 1px solid var(--border-color);" class="hover-row">
                <td style="padding: 20px 32px; border-bottom: 1px solid var(--border-color);">
                  <div style="display: flex; flex-direction: column;">
                    <span style="font-weight: 600; font-size: 1.05rem; color: #fff;">${b.package_title || `Package #${b.package_id}`}</span>
                    <span style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; font-family: monospace;">REF-#${b.id}</span>
                  </div>
                </td>
                <td style="padding: 20px 32px; border-bottom: 1px solid var(--border-color);">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="color: var(--text-secondary);">${b.departure_date || 'TBD'}</span>
                    <span style="color: var(--accent); font-size: 1.2rem;">→</span>
                    <span style="color: var(--text-secondary);">${b.return_date || 'TBD'}</span>
                  </div>
                </td>
                <td style="padding: 20px 32px; border-bottom: 1px solid var(--border-color);">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="color: var(--text-secondary);">👥 ${b.adults || 1} Adult(s)</span>
                  </div>
                </td>
                <td style="padding: 20px 32px; border-bottom: 1px solid var(--border-color); text-align: right;">
                  <span class="text-gold" style="font-size: 1.15rem; font-weight: 700; letter-spacing: 0.5px;">₹${(b.total_price || 0).toLocaleString('en-IN')}</span>
                </td>
                <td style="padding: 20px 32px; border-bottom: 1px solid var(--border-color); text-align: center;">
                  <span class="badge badge-${b.status === 'cancelled' ? 'danger' : b.status === 'confirmed' ? 'success' : 'warning'}" style="padding: 6px 16px; border-radius: var(--radius-full);">
                    ${b.status ? b.status.charAt(0).toUpperCase() + b.status.slice(1) : 'Pending'}
                  </span>
                </td>
                <td style="padding: 20px 32px; border-bottom: 1px solid var(--border-color); text-align: right; display: flex; gap: 8px; justify-content: flex-end;">
                  ${b.agency_id ? `
                    <button class="btn btn-outline-gold btn-sm open-chat" data-agency-id="${b.agency_id}" data-agency-name="${b.package_title || 'Agency'}" style="padding: 6px 14px; border-radius: var(--radius-full);">
                      💬 Chat
                    </button>
                  ` : ''}
                  ${b.status !== 'cancelled' ? `
                    <button class="btn btn-secondary btn-sm cancel-booking" data-id="${b.id}" style="border-color: rgba(192, 57, 43, 0.4); color: #ff6b6b; padding: 6px 14px; border-radius: var(--radius-full);">
                      Cancel
                    </button>
                  ` : '<span style="color: var(--text-muted); font-size: 0.85rem; font-style: italic; padding: 6px 14px;">Cancelled</span>'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <style>
        .hover-row:hover { background: rgba(255,255,255,0.02) !important; transform: scale(1.002); }
      </style>
    `;

    // Cancel booking handlers
    content.querySelectorAll('.cancel-booking').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Are you absolutely sure you want to cancel this booking? This action cannot be undone.')) return;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner" style="width: 14px; height: 14px; display: inline-block;"></span>';
        try {
          await userApi.cancelBooking(btn.dataset.id);
          showToast('Booking cancelled successfully.', 'success');
          // Reload dashboard to visually reflect the cancellation
          UserDashboardPage(container);
        } catch (err) {
          showToast(err.message, 'error');
          btn.disabled = false;
          btn.textContent = 'Cancel';
        }
      });
    });

    // Chat Logic
    let currentChatWS = null;

    content.querySelectorAll('.open-chat').forEach(btn => {
      btn.addEventListener('click', async () => {
        const agencyId = btn.dataset.agencyId;
        const agencyName = btn.dataset.agencyName;
        document.getElementById('chat-agency-name').textContent = agencyName;
        document.getElementById('chat-modal').style.display = 'flex';
        
        const msgContainer = document.getElementById('chat-messages');
        msgContainer.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 20px;">Loading history...</div>';

        try {
          const history = await chatApi.getUserHistory(agencyId);
          msgContainer.innerHTML = '';
          history.forEach(m => appendChatMessage(msgContainer, m));
        } catch (err) {
          msgContainer.innerHTML = `<div style="text-align: center; color: #ff6b6b; padding: 20px;">Failed to load history</div>`;
        }

        if (currentChatWS) currentChatWS.close();
        currentChatWS = chatApi.connectUserWS(agencyId);
        
        currentChatWS.onmessage = (e) => {
          const m = JSON.parse(e.data);
          appendChatMessage(msgContainer, m);
        };
      });
    });

    document.getElementById('close-chat')?.addEventListener('click', () => {
      document.getElementById('chat-modal').style.display = 'none';
      if (currentChatWS) {
        currentChatWS.close();
        currentChatWS = null;
      }
    });

    document.getElementById('chat-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('chat-input');
      const text = input.value.trim();
      if (!text || !currentChatWS || currentChatWS.readyState !== WebSocket.OPEN) return;
      
      currentChatWS.send(JSON.stringify({ message: text }));
      input.value = '';
    });

    function appendChatMessage(container, m) {
      const isMe = m.sender === 'user';
      const align = isMe ? 'flex-end' : 'flex-start';
      const bg = isMe ? 'var(--accent)' : 'rgba(255,255,255,0.05)';
      const color = isMe ? '#000' : '#fff';
      const border = isMe ? 'border-bottom-right-radius: 4px;' : 'border-bottom-left-radius: 4px;';
      
      const div = document.createElement('div');
      div.style.cssText = `align-self: ${align}; max-width: 80%; background: ${bg}; color: ${color}; padding: 10px 14px; border-radius: 14px; ${border} box-shadow: 0 2px 5px rgba(0,0,0,0.1);`;
      div.textContent = m.message;
      container.appendChild(div);
      container.scrollTop = container.scrollHeight;
    }

  } catch (err) {
    container.querySelector('#dashboard-content').innerHTML = `
      <div class="glass-card text-center animate-in" style="padding: 80px 20px; border-radius: var(--radius-xl);">
        <div style="font-size: 3rem; margin-bottom: 16px; opacity: 0.5;">🔒</div>
        <h2 style="margin-bottom: 12px;">Authentication Required</h2>
        <p class="text-secondary mb-4">Please log in to your account to view and manage your travel dashboard.</p>
        <a href="/login" data-link class="btn btn-primary" style="border-radius: var(--radius-full);">Sign In to Continue</a>
      </div>
    `;
  }
}
