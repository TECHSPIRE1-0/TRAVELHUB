// AI Negotiator Bot Page (WebSocket Chat)
import { negotiator } from '../api.js';
import { showToast } from '../components/toast.js';

export default async function NegotiatorPage(container) {
  const params = new URLSearchParams(window.location.search);
  const packageId = params.get('package_id') || '';
  let ws = null;

  container.innerHTML = `
    <section class="section" style="padding-bottom: 0;">
      <div class="container" style="max-width: 700px;">
        <div class="text-center animate-in" style="margin-bottom: 24px;">
          <h1 class="section-title">🤝 AI Negotiator</h1>
          <p class="section-subtitle" style="margin: 0 auto;">Haggle with Agent Alex to get the best deal on your package!</p>
        </div>

        <!-- Connect Form -->
        <div class="glass-card mb-3 animate-in" id="connect-section" ${packageId ? 'style="display:none;"' : ''}>
          <div style="display: flex; gap: 12px;">
            <input type="number" id="neg-pkg-id" class="form-input" placeholder="Package ID" value="${packageId}" style="flex: 1;" />
            <button class="btn btn-primary" id="connect-btn">Start Negotiation</button>
          </div>
        </div>

        <!-- Chat -->
        <div class="chat-container" id="chat-section" style="${packageId ? '' : 'display:none;'}">
          <div class="chat-messages" id="chat-messages"></div>
          <div class="chat-input-area">
            <input type="text" id="chat-input" placeholder="Type your offer or message..." />
            <button class="btn btn-primary" id="send-btn">Send</button>
          </div>
        </div>
      </div>
    </section>
  `;

  function addMessage(text, sender, isDeal = false) {
    const messages = container.querySelector('#chat-messages');
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender === 'user' ? 'user' : 'bot'}`;
    
    if (sender !== 'user') {
      bubble.innerHTML = `<div class="sender">${sender}</div>${text}`;
    } else {
      bubble.textContent = text;
    }

    if (isDeal) {
      bubble.style.border = '2px solid var(--gold)';
      bubble.style.boxShadow = 'var(--shadow-gold)';
    }

    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
  }

  function connect(pkgId) {
    ws = negotiator.connectWS(pkgId);

    ws.onopen = () => {
      container.querySelector('#connect-section').style.display = 'none';
      container.querySelector('#chat-section').style.display = 'flex';
      showToast('Connected to Agent Alex!', 'success');
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'error') {
        showToast(data.message, 'error');
        return;
      }
      if (data.type === 'message') {
        addMessage(data.text, data.sender || 'Agent Alex', data.is_deal);
        if (data.is_deal) {
          showToast(`Deal reached! Price: ₹${data.agreed_price?.toLocaleString('en-IN') || 'TBD'}`, 'success');
        }
      }
      if (data.type === 'system') {
        addMessage(data.text, '🎉 System');
      }
    };

    ws.onclose = () => {
      addMessage('Connection closed. Refresh to start again.', '⚙️ System');
    };

    ws.onerror = () => {
      showToast('Could not connect. Is the backend running?', 'error');
    };
  }

  // Connect button
  container.querySelector('#connect-btn')?.addEventListener('click', () => {
    const pkgId = container.querySelector('#neg-pkg-id').value;
    if (!pkgId) return showToast('Enter a package ID', 'warning');
    connect(pkgId);
  });

  // Auto-connect if package_id in URL
  if (packageId) connect(packageId);

  // Send message
  function sendMessage() {
    const input = container.querySelector('#chat-input');
    const text = input.value.trim();
    if (!text || !ws || ws.readyState !== WebSocket.OPEN) return;
    addMessage(text, 'user');
    ws.send(text);
    input.value = '';
  }

  container.querySelector('#send-btn')?.addEventListener('click', sendMessage);
  container.querySelector('#chat-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // Cleanup
  return () => {
    if (ws) { ws.close(); ws = null; }
  };
}
