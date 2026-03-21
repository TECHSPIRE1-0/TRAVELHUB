// Group Trip Room Page (with WebSocket)
import { tripRoom } from '../api.js';
import { showToast } from '../components/toast.js';

export default async function TripRoomPage(container) {
  let ws = null;

  container.innerHTML = `
    <section class="section">
      <div class="container" style="max-width: 800px;">
        <div class="text-center animate-in">
          <h1 class="section-title">🗳️ Group Trip Planner</h1>
          <p class="section-subtitle" style="margin: 0 auto 40px;">Create a room, invite friends, add packages, and vote in real-time!</p>
        </div>

        <!-- Create or Join -->
        <div class="grid grid-2 mb-4 animate-in" style="animation-delay: 0.1s;">
          <div class="glass-card text-center">
            <h3 style="margin-bottom: 16px;">Create a Room</h3>
            <div class="form-group">
              <input type="text" id="room-name" class="form-input" placeholder="e.g. Goa Trip 2025 🏖️" />
            </div>
            <button class="btn btn-primary" id="create-room-btn">Create Room</button>
          </div>
          <div class="glass-card text-center">
            <h3 style="margin-bottom: 16px;">Join a Room</h3>
            <div class="form-group">
              <input type="text" id="join-code" class="form-input" placeholder="Enter 6-char code" maxlength="6" style="text-transform: uppercase; text-align: center; font-size: 1.2rem; letter-spacing: 0.2em;" />
            </div>
            <button class="btn btn-secondary" id="join-room-btn">Join Room</button>
          </div>
        </div>

        <!-- Room View (hidden initially) -->
        <div id="room-view" class="hidden">
          <div class="room-header">
            <p class="text-secondary">Room Code</p>
            <div class="room-code" id="display-code"></div>
            <h2 id="room-title" style="margin-top: 8px;"></h2>
            <p class="text-muted" id="room-status-text"></p>
          </div>

          <!-- Add Package -->
          <div class="glass-card mb-3" id="add-package-section">
            <h3 style="margin-bottom: 12px;">Add Package to Vote</h3>
            <div style="display: flex; gap: 12px;">
              <input type="number" id="add-pkg-id" class="form-input" placeholder="Package ID" style="flex: 1;" />
              <button class="btn btn-primary" id="add-pkg-btn">Add</button>
            </div>
          </div>

          <!-- Packages & Votes -->
          <div id="packages-votes" class="mb-3"></div>

          <!-- Members -->
          <div class="glass-card mb-3">
            <h3 style="margin-bottom: 12px;">Members</h3>
            <div id="members-list"></div>
          </div>

          <!-- Group Booking -->
          <div id="group-booking-section"></div>

          <!-- Close Voting -->
          <button class="btn btn-danger btn-lg" style="width: 100%;" id="close-voting-btn">🏁 Close Voting & Announce Winner</button>
        </div>
      </div>
    </section>
  `;

  async function showRoom(roomData) {
    container.querySelector('#room-view').classList.remove('hidden');
    container.querySelector('#display-code').textContent = roomData.room_code;
    container.querySelector('#room-title').textContent = roomData.name;
    container.querySelector('#room-status-text').textContent = `${roomData.total_members} members · ${roomData.votes_cast} votes · Status: ${roomData.status}`;

    // Packages
    const pkgArea = container.querySelector('#packages-votes');
    const pkgs = roomData.packages || [];
    const totalVotes = pkgs.reduce((sum, p) => sum + p.vote_count, 0) || 1;

    pkgArea.innerHTML = pkgs.length > 0 ? pkgs.map(p => `
      <div class="glass-card mb-2 ${p.is_winner ? 'style="border-color: var(--gold); box-shadow: var(--shadow-gold);"' : ''}">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div>
            <h3 style="font-size: 1.1rem;">${p.is_winner ? '🏆 ' : ''}${p.title}</h3>
            <p class="text-secondary" style="font-size: 0.85rem;">📍 ${p.destination} · ₹${(p.base_price || 0).toLocaleString('en-IN')} · ${p.duration}</p>
          </div>
          <button class="btn btn-primary btn-sm vote-btn" data-pkg="${p.package_id}">Vote (${p.vote_count})</button>
        </div>
        <div class="vote-bar">
          <div class="bar-bg"><div class="bar-fill" style="width: ${(p.vote_count / totalVotes) * 100}%;"></div></div>
          <span class="text-muted" style="font-size: 0.8rem;">${((p.vote_count / totalVotes) * 100).toFixed(0)}%</span>
        </div>
        ${p.voters?.length ? `<p class="text-muted mt-1" style="font-size: 0.8rem;">Voted by: ${p.voters.join(', ')}</p>` : ''}
      </div>
    `).join('') : '<div class="glass-card text-center" style="padding: 24px;"><p class="text-secondary">No packages added yet.</p></div>';

    // Members
    const membersArea = container.querySelector('#members-list');
    const members = roomData.members || [];
    membersArea.innerHTML = members.map(m => `
      <span class="badge ${m.has_voted ? 'badge-success' : 'badge-info'}" style="margin: 4px;">
        ${m.username} ${m.has_voted ? '✓' : ''}
      </span>
    `).join('');

    // Vote buttons
    pkgArea.querySelectorAll('.vote-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await tripRoom.vote(roomData.room_code, parseInt(btn.dataset.pkg));
          showToast('Vote cast!', 'success');
        } catch (err) { showToast(err.message, 'error'); }
      });
    });

    // Group Booking logic
    const closeVotingBtn = container.querySelector('#close-voting-btn');
    const addPkgSection = container.querySelector('#add-package-section');
    const bookingArea = container.querySelector('#group-booking-section');

    if (roomData.status === 'closed') {
      closeVotingBtn.style.display = 'none';
      if (addPkgSection) addPkgSection.style.display = 'none';

      try {
        const bStatus = await tripRoom.getBookingStatus(roomData.room_code);
        bookingArea.innerHTML = `
          <div class="glass-card mb-3" style="border-color: var(--primary);">
            <h3 style="margin-bottom: 12px;">🌟 Group Booking: ${bStatus.status.toUpperCase()}</h3>
            <p><strong>Total:</strong> ₹${bStatus.total_price.toLocaleString('en-IN')} | <strong>Per Person:</strong> ₹${bStatus.per_person.toLocaleString('en-IN')}</p>
            <div style="margin-top: 12px;">
              ${bStatus.payments.map(p => `
                <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                  <span>${p.username}</span>
                  <span class="badge ${p.status === 'paid' ? 'badge-success' : 'badge-warning'}">${p.status.toUpperCase()}</span>
                </div>
              `).join('')}
            </div>
            ${bStatus.status !== 'confirmed' ? `
              <button class="btn btn-success mt-3" style="width: 100%;" id="pay-share-btn">Pay My Share (₹${bStatus.per_person.toLocaleString('en-IN')})</button>
            ` : `
              <div class="mt-3 text-center text-success" style="font-weight: bold; font-size: 1.2rem;">🎉 Booked!</div>
            `}
          </div>
        `;

        const payBtn = bookingArea.querySelector('#pay-share-btn');
        if (payBtn) {
          payBtn.addEventListener('click', async () => {
            try {
              await tripRoom.payShare(roomData.room_code);
              showToast('Payment successful!', 'success');
              tripRoom.getDetails(roomData.room_code).then(showRoom).catch(() => {});
            } catch (err) { showToast(err.message, 'error'); }
          });
        }
      } catch (err) {
        // Not initiated yet
        bookingArea.innerHTML = `
          <div class="glass-card mb-3">
            <h3 style="margin-bottom: 12px;">🚀 Initiate Group Booking</h3>
            <p class="text-secondary" style="margin-bottom: 12px;">Voting ended. The creator can now initiate the booking for the winning package.</p>
            <div class="form-group">
              <input type="number" id="booking-transport-id" class="form-input mb-2" placeholder="Transport ID (e.g., 1)" />
              <input type="date" id="booking-departure" class="form-input mb-2" />
              <input type="date" id="booking-return" class="form-input mb-2" />
              <button class="btn btn-primary" style="width: 100%;" id="initiate-booking-btn">Initiate Booking</button>
            </div>
          </div>
        `;
        
        bookingArea.querySelector('#initiate-booking-btn').addEventListener('click', async () => {
          const tId = bookingArea.querySelector('#booking-transport-id').value;
          const dep = bookingArea.querySelector('#booking-departure').value;
          const ret = bookingArea.querySelector('#booking-return').value;
          if (!tId || !dep || !ret) return showToast('Fill all fields', 'warning');
          
          try {
            await tripRoom.initiateBooking(roomData.room_code, {
              transport_id: parseInt(tId),
              departure_date: dep,
              return_date: ret
            });
            showToast('Booking Initiated!', 'success');
            tripRoom.getDetails(roomData.room_code).then(showRoom).catch(() => {});
          } catch (err) { showToast(err.message, 'error'); }
        });
      }
    } else {
      closeVotingBtn.style.display = 'block';
      if (addPkgSection) addPkgSection.style.display = 'block';
      bookingArea.innerHTML = '';
    }
  }

  function connectWebSocket(code) {
    if (ws) ws.close();
    ws = tripRoom.connectWS(code);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.event === 'connected' && data.room) showRoom(data.room);
      else if (data.event === 'package_added' || data.event === 'vote_update') {
        if (data.message) showToast(data.message, 'info');
        tripRoom.getDetails(code).then(showRoom).catch(() => {});
      } else if (data.event === 'voting_closed') {
        showToast('Voting closed! Winner announced!', 'success');
        tripRoom.getDetails(code).then(showRoom).catch(() => {});
      } else if (data.event === 'booking_initiated' || data.event === 'payment_update' || data.event === 'booking_confirmed') {
        if (data.message) showToast(data.message, data.event === 'booking_confirmed' ? 'success' : 'info');
        tripRoom.getDetails(code).then(showRoom).catch(() => {});
      }
    };
  }

  // Create room
  container.querySelector('#create-room-btn').addEventListener('click', async () => {
    const name = container.querySelector('#room-name').value.trim();
    if (!name) return showToast('Enter a room name', 'warning');
    try {
      const res = await tripRoom.create(name);
      showToast(`Room created! Code: ${res.room_code}`, 'success');
      const roomData = await tripRoom.getDetails(res.room_code);
      showRoom(roomData);
      connectWebSocket(res.room_code);
    } catch (err) { showToast(err.message, 'error'); }
  });

  // Join room
  container.querySelector('#join-room-btn').addEventListener('click', async () => {
    const code = container.querySelector('#join-code').value.trim().toUpperCase();
    if (!code) return showToast('Enter room code', 'warning');
    try {
      await tripRoom.join(code);
      const roomData = await tripRoom.getDetails(code);
      showRoom(roomData);
      connectWebSocket(code);
      showToast('Joined room!', 'success');
    } catch (err) { showToast(err.message, 'error'); }
  });

  // Add package
  container.querySelector('#add-pkg-btn').addEventListener('click', async () => {
    const pkgId = container.querySelector('#add-pkg-id').value;
    const code = container.querySelector('#display-code').textContent;
    if (!pkgId || !code) return;
    try {
      await tripRoom.addPackage(code, parseInt(pkgId));
      container.querySelector('#add-pkg-id').value = '';
      showToast('Package added!', 'success');
      tripRoom.getDetails(code).then(showRoom).catch(() => {});
    } catch (err) { showToast(err.message, 'error'); }
  });

  // Close voting
  container.querySelector('#close-voting-btn').addEventListener('click', async () => {
    const code = container.querySelector('#display-code').textContent;
    if (!code) return;
    try {
      await tripRoom.close(code);
      showToast('Voting closed!', 'success');
    } catch (err) { showToast(err.message, 'error'); }
  });

  // Cleanup WebSocket on page leave
  return () => {
    if (ws) { ws.close(); ws = null; }
  };
}
