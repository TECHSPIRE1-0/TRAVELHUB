// Agency Dashboard Page
import { agencyDashboard as agencyApi, chat as chatApi } from '../api.js';
import { showToast } from '../components/toast.js';

export default async function AgencyDashboardPage(container) {
  container.innerHTML = `
    <section class="dashboard-page section" style="padding-top: 100px; min-height: 100vh; background: linear-gradient(180deg, rgba(11, 18, 32, 1) 0%, rgba(15, 23, 42, 1) 100%);">
      <div class="container" style="max-width: 1200px;">
        
        <!-- Premium Header -->
        <div class="dashboard-header flex justify-between items-center animate-in mb-4" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 24px;">
          <div>
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
              <span style="background: rgba(200, 164, 94, 0.15); color: var(--accent); padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">Partner Portal</span>
            </div>
            <h1 style="font-size: 2.8rem; margin: 0; line-height: 1.1;">Agency <span class="text-gold">Command Center</span></h1>
          </div>
          <div class="glass-card" style="padding: 14px 24px; border-radius: var(--radius-full); display: flex; align-items: center; gap: 16px; border: 1px solid rgba(200, 164, 94, 0.2); background: rgba(0,0,0,0.2);">
            <div style="text-align: right;">
              <p style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">Verified Agency</p>
              <p style="font-weight: 700; font-size: 1.1rem; margin: 0; color: #fff;" id="agency-name-display">Loading...</p>
            </div>
            <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), #dbb76a); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(200,164,94,0.3);">
              <span style="font-size: 1.4rem;">🏢</span>
            </div>
          </div>
        </div>

        <!-- High-End Stats -->
        <div class="stats-grid mb-4" id="agency-stats" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;">
          <div class="glass-card stat-card skeleton" style="height: 140px; border-radius: var(--radius-xl);"></div>
          <div class="glass-card stat-card skeleton" style="height: 140px; border-radius: var(--radius-xl);"></div>
          <div class="glass-card stat-card skeleton" style="height: 140px; border-radius: var(--radius-xl);"></div>
          <div class="glass-card stat-card skeleton" style="height: 140px; border-radius: var(--radius-xl);"></div>
        </div>

        <!-- Sleek Tabs Navigation -->
        <div class="flex gap-2 mb-4 animate-in" style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: var(--radius-full); border: 1px solid rgba(255,255,255,0.05); display: inline-flex; animation-delay: 0.2s;">
          <button class="btn tab-btn active-tab" data-tab="packages" style="border-radius: var(--radius-full); margin: 0; padding: 10px 24px; border: none;">📦 Tour Packages</button>
          <button class="btn tab-btn" data-tab="bookings" style="border-radius: var(--radius-full); margin: 0; padding: 10px 24px; border: none; background: transparent; color: var(--text-secondary);">🎫 Bookings</button>
          <button class="btn tab-btn" data-tab="enquiries" style="border-radius: var(--radius-full); margin: 0; padding: 10px 24px; border: none; background: transparent; color: var(--text-secondary);">💬 Customer Enquiries</button>
          <button class="btn tab-btn" data-tab="messages" style="border-radius: var(--radius-full); margin: 0; padding: 10px 24px; border: none; background: transparent; color: var(--text-secondary);">✉️ Messages</button>
        </div>

        <!-- Dynamic Content Area -->
        <div id="tab-content" class="animate-in" style="animation-delay: 0.3s;">
          <div class="glass-card skeleton" style="height: 400px; border-radius: var(--radius-xl);"></div>
        </div>
      </div>
    </section>
    
    <style>
       .tab-btn { transition: all 0.3s ease; }
       .tab-btn.active-tab { background: var(--accent); color: #000; box-shadow: 0 4px 15px rgba(200, 164, 94, 0.3); font-weight: 700; }
       .tab-btn:not(.active-tab):hover { background: rgba(255,255,255,0.05); color: #fff; }
       .agency-table th { background: rgba(0,0,0,0.2) !important; padding: 18px 24px !important; letter-spacing: 0.05em; font-size: 0.8rem !important; }
       .agency-table td { padding: 18px 24px !important; font-size: 0.95rem; vertical-align: middle; border-bottom: 1px solid rgba(255,255,255,0.05) !important; }
       .agency-table tr:hover { background: rgba(255,255,255,0.015) !important; }
       
       .stat-card-premium { position: relative; overflow: hidden; border-radius: var(--radius-xl); padding: 32px 24px; z-index: 1; text-align: left; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid rgba(255,255,255,0.04); background: linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.2) 100%); }
       .stat-card-premium::before { content: ''; position: absolute; top: 0; right: 0; width: 150px; height: 150px; background: radial-gradient(circle, var(--accent) 0%, transparent 70%); opacity: 0.05; border-radius: 50%; transform: translate(30%, -30%); z-index: -1; transition: opacity 0.3s; }
       .stat-card-premium:hover::before { opacity: 0.1; }
       .stat-icon-wrapper { width: 40px; height: 40px; border-radius: 12px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.08); font-size: 1.2rem; }
    </style>
  `;

  // Load stats
  try {
    const stats = await agencyApi.stats();
    if (stats?.agency_name) {
      container.querySelector('#agency-name-display').textContent = stats.agency_name;
    }
    container.querySelector('#agency-stats').innerHTML = `
      <div class="glass-card stat-card-premium animate-in" style="animation-delay: 0.0s;">
        <div>
          <div class="stat-icon-wrapper text-gold">📦</div>
          <div class="stat-label" style="text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 4px;">Active Packages</div>
        </div>
        <div class="stat-value" style="font-size: 2.5rem; font-family: var(--font-display); line-height: 1; color: #fff;">${stats.total_packages || 0}</div>
      </div>
      <div class="glass-card stat-card-premium animate-in" style="animation-delay: 0.1s;">
        <div>
          <div class="stat-icon-wrapper" style="color: #4ade80;">🎫</div>
          <div class="stat-label" style="text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 4px;">Cumulative Bookings</div>
        </div>
        <div class="stat-value" style="font-size: 2.5rem; font-family: var(--font-display); line-height: 1; color: #fff;">${stats.total_bookings || 0}</div>
      </div>
      <div class="glass-card stat-card-premium animate-in" style="animation-delay: 0.2s; border-color: rgba(200, 164, 94, 0.3); background: rgba(200,164,94,0.03);">
        <div>
          <div class="stat-icon-wrapper" style="background: var(--accent); color: #000; border: none; box-shadow: 0 4px 10px rgba(200,164,94,0.3);">💰</div>
          <div class="stat-label" style="text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1em; color: var(--accent); margin-bottom: 4px;">Gross Revenue</div>
        </div>
        <div class="stat-value" style="font-size: 2.5rem; font-family: var(--font-display); line-height: 1; color: var(--accent);">₹${(stats.total_revenue || 0).toLocaleString('en-IN')}</div>
      </div>
      <div class="glass-card stat-card-premium animate-in" style="animation-delay: 0.3s;">
        <div>
          <div class="stat-icon-wrapper" style="color: #fbbf24;">⏳</div>
          <div class="stat-label" style="text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 4px;">Action Required</div>
        </div>
        <div style="display: flex; align-items: baseline; gap: 8px;">
          <div class="stat-value" style="font-size: 2.5rem; font-family: var(--font-display); line-height: 1; color: #fff;">${stats.pending_bookings || 0}</div>
          <span style="color: var(--text-secondary); font-size: 0.9rem;">pending</span>
        </div>
      </div>
    `;
  } catch {
    container.querySelector('#agency-stats').innerHTML = `
      <div class="glass-card text-center" style="grid-column: 1 / -1; padding: 40px; border-radius: var(--radius-xl);">
        <div style="font-size: 3rem; opacity: 0.5; margin-bottom: 16px;">🔐</div>
        <h3 style="margin-bottom: 8px;">Access Denied</h3>
        <p class="text-secondary mb-4">Please log in with your agency credentials to access the command center.</p>
        <a href="/agency-login" data-link class="btn btn-gold" style="border-radius: var(--radius-full);">Agency Portal Login</a>
      </div>
    `;
    return; // Stop execution if auth fails
  }

  // Tab switching
  const tabContent = container.querySelector('#tab-content');
  let currentAgencyWS = null;

  async function loadTab(tab) {
    if (currentAgencyWS) {
      currentAgencyWS.close();
      currentAgencyWS = null;
    }

    container.querySelectorAll('.tab-btn').forEach(b => {
      const isActive = b.dataset.tab === tab;
      b.classList.toggle('active-tab', isActive);
      b.className = isActive ? 'btn tab-btn active-tab' : 'btn tab-btn';
    });

    tabContent.innerHTML = '<div class="glass-card skeleton" style="height: 400px; border-radius: var(--radius-xl);"></div>';

    try {
      if (tab === 'packages') {
        try {
          const pkgs = await agencyApi.packages();
          const items = Array.isArray(pkgs) ? pkgs : [];
          tabContent.innerHTML = items.length > 0 ? `
            <div class="glass-card animate-in" style="border-radius: var(--radius-xl); padding: 0; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
              <div style="padding: 24px 32px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.1);">
                <div>
                  <h3 style="font-size: 1.3rem; margin: 0;">Active Tour Packages</h3>
                  <p style="color: var(--text-muted); font-size: 0.85rem; margin: 4px 0 0 0;">Manage your entire portfolio of destinations.</p>
                </div>
                <a href="/agency/create-package" data-link class="btn btn-gold btn-sm" style="border-radius: var(--radius-full); padding: 10px 24px; box-shadow: 0 4px 15px rgba(200, 164, 94, 0.25);">
                  <span style="margin-right: 6px; font-size: 1.2rem;">+</span> Create Package
                </a>
              </div>
              <div style="overflow-x: auto;">
                <table class="data-table agency-table" style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr>
                      <th style="width: 80px;">REF ID</th>
                      <th>Listing Details</th>
                      <th>Location</th>
                      <th style="text-align: center;">Duration</th>
                      <th style="text-align: right;">Base Tariff</th>
                    </tr>
                  </thead>
                  <tbody>${items.map(p => `
                    <tr>
                      <td><span style="font-family: monospace; color: var(--text-muted); background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px;">#${p.id}</span></td>
                      <td>
                        <div style="font-weight: 600; color: #fff; font-size: 1.05rem;">${p.title}</div>
                      </td>
                      <td>
                        <div style="display: flex; align-items: center; gap: 6px;">
                          <span style="color: var(--accent);">📍</span> ${p.destination}
                        </div>
                      </td>
                      <td style="text-align: center;">
                        <span class="badge" style="background: rgba(255,255,255,0.05); color: var(--text-secondary); border: 1px solid rgba(255,255,255,0.1);">${p.duration_days} Days</span>
                      </td>
                      <td style="text-align: right; font-weight: 700; color: var(--accent); font-size: 1.1rem;">
                        ₹${(p.base_price || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  `).join('')}</tbody>
                </table>
              </div>
            </div>
          ` : `
            <div class="glass-card text-center animate-in" style="padding: 60px 20px; border-radius: var(--radius-xl); border: 1px dashed rgba(255,255,255,0.15);">
              <div style="font-size: 3rem; margin-bottom: 16px; opacity: 0.7;">🗺️</div>
              <h3 style="margin-bottom: 8px; font-size: 1.5rem;">Your portfolio is empty</h3>
              <p class="text-secondary mb-4" style="max-width: 400px; margin: 0 auto;">Design and publish your first incredible travel package to start receiving bookings.</p>
              <a href="/agency/create-package" data-link class="btn btn-gold mt-2" style="border-radius: var(--radius-full);">Create First Package</a>
            </div>
          `;
        } catch (err) {
          tabContent.innerHTML = '<div class="glass-card text-center" style="padding: 40px; border-radius: var(--radius-xl);"><p class="text-danger">Failed to load packages data.</p></div>';
        }

      } else if (tab === 'bookings') {
        const bookings = await agencyApi.bookings();
        const items = Array.isArray(bookings) ? bookings : [];
        tabContent.innerHTML = items.length > 0 ? `
          <div class="glass-card animate-in" style="border-radius: var(--radius-xl); padding: 0; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
            <div style="padding: 24px 32px; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.1);">
              <h3 style="font-size: 1.3rem; margin: 0;">Reservation Management</h3>
              <p style="color: var(--text-muted); font-size: 0.85rem; margin: 4px 0 0 0;">Review and process incoming customer reservations.</p>
            </div>
            <div style="overflow-x: auto;">
              <table class="data-table agency-table" style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th style="width: 80px;">Booking ID</th>
                    <th>Package Details</th>
                    <th>Customer Name</th>
                    <th>Date Scheduled</th>
                    <th style="text-align: right;">Total Value</th>
                    <th style="text-align: center;">Payment/Status</th>
                    <th style="text-align: right; width: 140px;">Action Controls</th>
                  </tr>
                </thead>
                <tbody>${items.map(b => `
                  <tr>
                    <td><span style="font-family: monospace; color: var(--text-muted); background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px;">#${b.id}</span></td>
                    <td>
                      <div style="font-weight: 600; color: #fff;">${b.package_title || '-'}</div>
                    </td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--bg-primary); display: flex; align-items: center; justify-content: center; font-size: 0.6rem; color: var(--text-muted); border: 1px solid rgba(255,255,255,0.1);">👤</div>
                        <span>${b.user_name || '-'}</span>
                      </div>
                    </td>
                    <td style="color: var(--text-secondary);">${b.departure_date || 'TBD'}</td>
                    <td style="text-align: right; font-weight: 700; color: var(--accent); font-size: 1.05rem;">
                      ₹${(b.total_price || 0).toLocaleString('en-IN')}
                    </td>
                    <td style="text-align: center;">
                      <span class="badge" style="padding: 6px 12px; background: ${b.status === 'confirmed' ? 'rgba(74, 222, 128, 0.15)' : b.status === 'cancelled' ? 'rgba(248, 113, 113, 0.15)' : 'rgba(251, 191, 36, 0.15)'}; color: ${b.status === 'confirmed' ? '#4ade80' : b.status === 'cancelled' ? '#f87171' : '#fbbf24'}; border: 1px solid ${b.status === 'confirmed' ? 'rgba(74, 222, 128, 0.3)' : b.status === 'cancelled' ? 'rgba(248, 113, 113, 0.3)' : 'rgba(251, 191, 36, 0.3)'};">
                        ${b.status ? b.status.toUpperCase() : 'PENDING'}
                      </span>
                    </td>
                    <td style="text-align: right;">
                      <select class="form-input status-select" data-id="${b.id}" style="padding: 8px 12px; font-size: 0.85rem; border-radius: var(--radius-md); background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; cursor: pointer; width: 100%; text-align: center; appearance: auto;">
                        <option value="" style="background: var(--bg-primary);">Modify...</option>
                        <option value="confirmed" style="background: var(--bg-primary); color: #4ade80;">✔ Confirm</option>
                        <option value="cancelled" style="background: var(--bg-primary); color: #f87171;">✖ Cancel</option>
                      </select>
                    </td>
                  </tr>
                `).join('')}</tbody>
              </table>
            </div>
          </div>
        ` : `
          <div class="glass-card text-center animate-in" style="padding: 60px 20px; border-radius: var(--radius-xl); border: 1px dashed rgba(255,255,255,0.15);">
            <div style="font-size: 3rem; margin-bottom: 16px; opacity: 0.7;">🎟️</div>
            <h3 style="margin-bottom: 8px; font-size: 1.5rem;">Awaiting first booking</h3>
            <p class="text-secondary" style="max-width: 400px; margin: 0 auto;">No customer reservations have been made for your packages yet.</p>
          </div>
        `;

        // Status change handlers
        tabContent.querySelectorAll('.status-select').forEach(sel => {
          sel.addEventListener('change', async () => {
            if (!sel.value) return;
            const originalValue = sel.value;
            sel.disabled = true;
            try {
              await agencyApi.updateBookingStatus(sel.dataset.id, sel.value);
              showToast(`Reservation status updated to ${sel.value}!`, 'success');
              // Automatically reload tab to show new stylish badge
              loadTab('bookings');
              // Also reload stats header gently
              AgencyDashboardPage(container).catch(() => {});
            } catch (err) { 
              showToast(err.message, 'error'); 
              sel.disabled = false;
              sel.value = "";
            }
          });
        });
      } else if (tab === 'messages') {
        try {
          const convos = await chatApi.getAgencyConversations();
          const items = Array.isArray(convos) ? convos : [];
          
          tabContent.innerHTML = `
            <div class="glass-card animate-in" style="border-radius: var(--radius-xl); padding: 0; display: flex; height: 600px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
              <!-- Sidebar -->
              <div style="width: 320px; border-right: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; background: rgba(0,0,0,0.2);">
                <div style="padding: 24px 20px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <h3 style="margin: 0; font-size: 1.3rem;">Conversations</h3>
                </div>
                <div style="flex: 1; overflow-y: auto; padding: 12px;">
                  ${items.length === 0 ? '<p style="text-align: center; color: var(--text-muted); padding: 20px;">No messages yet.</p>' : ''}
                  ${items.map(c => `
                    <div class="convo-item hover-row" data-user-id="${c.user_id}" data-username="${c.username}" style="padding: 16px; border-radius: var(--radius-md); cursor: pointer; margin-bottom: 8px; transition: all 0.2s; border: 1px solid transparent;">
                      <div style="font-weight: 600; color: #fff; font-size: 1.05rem;">${c.username}</div>
                      <div style="font-size: 0.85rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 6px;">
                        ${c.last_message || ''}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
              <!-- Chat Window -->
              <div id="chat-window" style="flex: 1; display: flex; flex-direction: column; background: rgba(0,0,0,0.4); position: relative;">
                <div style="flex: 1; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 1.1rem;">
                  Select a conversation to start chatting
                </div>
              </div>
            </div>
          `;

          const convoItems = tabContent.querySelectorAll('.convo-item');
          convoItems.forEach(item => {
            item.addEventListener('click', async () => {
              convoItems.forEach(i => {
                i.style.background = 'transparent';
                i.style.borderColor = 'transparent';
              });
              item.style.background = 'rgba(255,255,255,0.08)';
              item.style.borderColor = 'rgba(200, 164, 94, 0.3)';
              
              const userId = item.dataset.userId;
              const username = item.dataset.username;
              
              const chatWindow = document.getElementById('chat-window');
              chatWindow.innerHTML = `
                <div style="padding: 24px 32px; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.2);">
                  <h3 style="margin: 0; font-size: 1.3rem; display: flex; align-items: center; gap: 12px;">
                    <span style="width: 36px; height: 36px; border-radius: 50%; background: var(--bg-primary); display: flex; align-items: center; justify-content: center; font-size: 0.9rem; border: 1px solid rgba(255,255,255,0.1);">👤</span>
                    <div>
                      <span class="text-gold" style="display: block; line-height: 1;">${username}</span>
                      <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: normal;">Traveler</span>
                    </div>
                  </h3>
                </div>
                <div id="messages-container" style="flex: 1; overflow-y: auto; padding: 24px 32px; display: flex; flex-direction: column; gap: 16px; font-size: 1rem;">
                  <div style="text-align: center; color: var(--text-muted);">Loading history...</div>
                </div>
                <form id="agency-chat-form" style="padding: 20px 32px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; gap: 12px; background: rgba(0,0,0,0.2);">
                  <input type="text" id="agency-chat-input" class="form-input" placeholder="Type your reply..." style="flex: 1; border-radius: var(--radius-full); padding: 14px 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; font-size: 1rem;" required autocomplete="off" />
                  <button type="submit" class="btn btn-gold" style="border-radius: var(--radius-full); padding: 0 32px; font-size: 1rem;">Send 🚀</button>
                </form>
              `;

              const msgContainer = document.getElementById('messages-container');
              try {
                const history = await chatApi.getAgencyHistory(userId);
                msgContainer.innerHTML = '';
                history.forEach(m => appendChatMessage(msgContainer, m));
              } catch (err) {
                msgContainer.innerHTML = `<div style="text-align: center; color: #f87171;">Failed to load history</div>`;
              }

              if (currentAgencyWS) currentAgencyWS.close();
              currentAgencyWS = chatApi.connectAgencyWS(userId);
              
              currentAgencyWS.onmessage = (e) => {
                const m = JSON.parse(e.data);
                appendChatMessage(msgContainer, m);
              };

              document.getElementById('agency-chat-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const input = document.getElementById('agency-chat-input');
                const text = input.value.trim();
                if (!text || !currentAgencyWS || currentAgencyWS.readyState !== WebSocket.OPEN) return;
                
                currentAgencyWS.send(JSON.stringify({ message: text }));
                input.value = '';
              });
            });
          });

          function appendChatMessage(container, m) {
            const isMe = m.sender === 'agency';
            const align = isMe ? 'flex-end' : 'flex-start';
            const bg = isMe ? 'var(--accent)' : 'rgba(255,255,255,0.05)';
            const color = isMe ? '#000' : '#fff';
            const border = isMe ? 'border-bottom-right-radius: 4px;' : 'border-bottom-left-radius: 4px;';
            
            const div = document.createElement('div');
            div.style.cssText = `align-self: ${align}; max-width: 75%; background: ${bg}; color: ${color}; padding: 14px 18px; border-radius: 18px; ${border} box-shadow: 0 4px 15px rgba(0,0,0,0.15); animation: slideUp 0.3s ease;`;
            div.textContent = m.message;
            container.appendChild(div);
            container.scrollTop = container.scrollHeight;
          }

        } catch (err) {
            tabContent.innerHTML = '<div class="glass-card text-center" style="padding: 40px; border-radius: var(--radius-xl);"><p class="text-danger">Failed to load conversations.</p></div>';
        }
      } else {
        // Enquiries tab
        try {
          const { enquiry: enquiryApi } = await import('../api.js');
          const data = await enquiryApi.getAgencyEnquiries();
          const items = Array.isArray(data) ? data : (data?.enquiries || []);
          
          tabContent.innerHTML = items.length > 0 ? `
            <div class="glass-card animate-in" style="border-radius: var(--radius-xl); padding: 0; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
              <div style="padding: 24px 32px; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.1);">
                <h3 style="font-size: 1.3rem; margin: 0;">Customer Enquiries & Leads</h3>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin: 4px 0 0 0;">Connect with potential travelers reaching out to you.</p>
              </div>
              <div style="overflow-x: auto;">
                <table class="data-table agency-table" style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr>
                      <th style="width: 60px;">ID</th>
                      <th style="width: 200px;">Contact Details</th>
                      <th>Trip Requirements</th>
                      <th>Custom Message</th>
                      <th style="text-align: right;">Action</th>
                    </tr>
                  </thead>
                  <tbody>${items.map(e => `
                    <tr style="vertical-align: top;">
                      <td><span style="font-family: monospace; color: var(--text-muted); font-size: 0.8rem;">#OP-${e.id}</span></td>
                      <td>
                        <div style="font-weight: 600; color: #fff; margin-bottom: 4px;">${e.name}</div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary); display: flex; align-items: center; gap: 6px;"><span style="color:var(--text-muted);">📧</span> ${e.email}</div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary); display: flex; align-items: center; gap: 6px; margin-top: 2px;"><span style="color:var(--text-muted);">📱</span> ${e.phone}</div>
                      </td>
                      <td>
                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 10px 14px; border-radius: var(--radius-md); display: inline-block;">
                          <div style="margin-bottom: 4px; font-size: 0.9rem;"><strong style="color: var(--text-secondary);">Dest:</strong> <span style="color: #fff;">${e.destination}</span></div>
                          <div style="display: flex; gap: 16px; font-size: 0.85rem;">
                            <span>⏱️ ${e.travel_date || 'Flexible'}</span>
                            <span>👥 ${e.travellers} Pax</span>
                          </div>
                        </div>
                      </td>
                      <td style="max-width: 250px;">
                        <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: var(--radius-md); font-size: 0.85rem; color: rgba(255,255,255,0.8); font-style: italic; line-height: 1.5; border-left: 2px solid var(--accent); white-space: pre-wrap;">"${e.message || 'No direct message left.'}"</div>
                      </td>
                      <td style="text-align: right;">
                        <a href="mailto:${e.email}?subject=Regarding Your TravelHub Enquiry - ${e.destination}" class="btn btn-outline-gold btn-sm" style="border-radius: var(--radius-full); padding: 6px 16px;">✉️ Reply</a>
                      </td>
                    </tr>
                  `).join('')}</tbody>
                </table>
              </div>
            </div>
          ` : `
            <div class="glass-card text-center animate-in" style="padding: 60px 20px; border-radius: var(--radius-xl); border: 1px dashed rgba(255,255,255,0.15);">
              <div style="font-size: 3rem; margin-bottom: 16px; opacity: 0.7;">💬</div>
              <h3 style="margin-bottom: 8px; font-size: 1.5rem;">No leads at the moment</h3>
              <p class="text-secondary" style="max-width: 400px; margin: 0 auto;">User enquiries for custom trips will appear here.</p>
            </div>
          `;
        } catch (err) {
          tabContent.innerHTML = '<div class="glass-card text-center" style="padding: 40px; border-radius: var(--radius-xl);"><p class="text-danger">Failed to load enquiries.</p></div>';
        }
      }
    } catch {
      tabContent.innerHTML = '<div class="glass-card text-center" style="padding: 40px; border-radius: var(--radius-xl);"><p class="text-danger">A system error occurred while fetching portal data.</p></div>';
    }
  }

  loadTab('packages');

  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => loadTab(btn.dataset.tab));
  });
}
