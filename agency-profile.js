// ============================================================
// TRAVELHUB — AGENCY PROFILE JS
// ============================================================

const PACKAGES = [
  { id:1, name:'Manali Winter Wonderland – 6D/5N', price:8500, duration:'6 Days / 5 Nights', group:'2–12 People', difficulty:'Easy–Moderate', category:'adventure', image:'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=80', includes:['Hotel Stay','Meals (Breakfast+Dinner)','Transport','Guide','Snow Activities'], description:'Experience the magical snow-clad valleys of Manali. Rohtang Pass, Solang Valley, Hadimba Temple and much more.' },
  { id:2, name:'Spiti Valley Expedition – 9D/8N', price:15500, duration:'9 Days / 8 Nights', group:'4–10 People', difficulty:'Moderate–Hard', category:'trekking', image:'https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=600&q=80', includes:['Camping','All Meals','4WD Jeep','Experienced Guide','Permits'], description:'The ultimate off-road adventure through the Cold Desert. Key Monastery, Chandratal Lake, Dhankar.' },
  { id:3, name:'Leh Ladakh Bike Trip – 10D/9N', price:18000, duration:'10 Days / 9 Nights', group:'6–12 People', difficulty:'Hard', category:'adventure', image:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80', includes:['Royal Enfield Rental','Guesthouse Stay','Breakfast','Mechanic Support','Permits'], description:'Ride through the world\'s highest motorable passes. Khardung La, Pangong Lake, Nubra Valley.' },
  { id:4, name:'Family Himalaya Holiday – 7D/6N', price:22000, duration:'7 Days / 6 Nights', group:'2–8 People', difficulty:'Easy', category:'family', image:'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80', includes:['3-Star Hotel','All Meals','AC Vehicle','Family Activities','Child Care'], description:'Perfect for families! Manali, Kullu, Naggar, river rafting, zip-lining and apple orchards.' },
  { id:5, name:'Kasol Parvati Valley Trek – 5D/4N', price:6500, duration:'5 Days / 4 Nights', group:'4–15 People', difficulty:'Easy–Moderate', category:'trekking', image:'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80', includes:['Camping','Bonfire','Meals','Local Guide','Trekking Equipment'], description:'The hippie haven of Himachal. Kheerganga trek, Chalal, Rasol and the beautiful Parvati River.' },
];

const REVIEWS = [
  { name:'Rohan Sharma', location:'Delhi', trip:'Spiti Valley Expedition', rating:5, date:'Oct 2024', text:'Absolutely incredible experience! The team was professional, the landscapes were out of this world. Chandratal Lake at sunrise will stay with me forever.', color:'#f4a261' },
  { name:'Priya Nair', location:'Bangalore', trip:'Manali Winter Wonderland', rating:5, date:'Jan 2025', text:'My first snow experience and it was magical! Everything from hotel to activities was perfectly organised. Highly recommend for families!', color:'#e76f51' },
  { name:'Arjun Mehta', location:'Mumbai', trip:'Leh Ladakh Bike Trip', rating:5, date:'Jul 2024', text:'Best trip of my life. The Royal Enfield ride through Khardung La at 5,359m was insane. Guide Rajan was exceptional. Already planning my next trip.', color:'#2a9d8f' },
  { name:'Kavya Reddy', location:'Hyderabad', trip:'Kasol Parvati Valley Trek', rating:4, date:'Nov 2024', text:'Great value for money. The camping setup was comfortable, food was delicious. Kheerganga hot springs were worth every step of the trek!', color:'#457b9d' },
];

const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=80',
  'https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=400&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80',
  'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=400&q=80',
  'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&q=80',
  'https://images.unsplash.com/photo-1543340904-0d1263a5f1d4?w=400&q=80',
];

document.addEventListener('DOMContentLoaded', () => {

  // TABS
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });

  // STICKY TABS
  const tabsWrap = document.getElementById('profileTabs');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 350) tabsWrap.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
    else tabsWrap.style.boxShadow = 'none';
  });

  // RENDER PACKAGES
  renderPackages('all');
  document.querySelectorAll('.pkg-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pkg-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderPackages(btn.dataset.filter);
    });
  });

  // RENDER GALLERY
  const galleryGrid = document.getElementById('galleryGrid');
  galleryGrid.innerHTML = GALLERY_IMAGES.map(src =>
    `<div class="gallery-item"><img src="${src}" alt="Gallery" loading="lazy" /></div>`
  ).join('');

  // RENDER REVIEWS
  const reviewsList = document.getElementById('reviewsList');
  reviewsList.innerHTML = REVIEWS.map(r =>
    `<div class="review-item">
      <div class="review-header">
        <div class="review-avatar" style="background:${r.color}">${r.name[0]}</div>
        <div><strong>${r.name}</strong><small>📍 ${r.location}</small></div>
        <div class="review-stars">${'★'.repeat(r.rating)}</div>
      </div>
      <span class="review-trip">📦 ${r.trip} &nbsp;•&nbsp; 📅 ${r.date}</span>
      <p>${r.text}</p>
    </div>`
  ).join('');

  // CONTACT FORM
  document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type=submit]');
    btn.textContent = '✅ Enquiry Sent!';
    btn.style.background = '#2d9d74';
    btn.style.color = 'white';
    setTimeout(() => {
      btn.textContent = '📨 Send Enquiry';
      btn.style.background = '';
      btn.style.color = '';
      e.target.reset();
    }, 3000);
  });

  // CHAT
  setupChat();

  // NAV SCROLL
  window.addEventListener('scroll', () => {
    document.getElementById('nav').classList.add('scrolled');
  });
});

function renderPackages(filter) {
  const list = document.getElementById('packagesList');
  const pkgs = filter === 'all' ? PACKAGES : PACKAGES.filter(p => p.category === filter);
  list.innerHTML = pkgs.map(p =>
    `<div class="package-item">
      <div class="package-img"><img src="${p.image}" alt="${p.name}" loading="lazy" /></div>
      <div class="package-details">
        <h3>${p.name}</h3>
        <div class="package-highlights">
          <span>📅 ${p.duration}</span>
          <span>👥 ${p.group}</span>
          <span>⚡ ${p.difficulty}</span>
        </div>
        <p style="font-size:0.85rem;color:var(--text-mid);margin-bottom:10px;line-height:1.6">${p.description}</p>
        <div class="package-includes">${p.includes.map(i => `<span>✓ ${i}</span>`).join('')}</div>
        <div class="package-footer">
          <div class="package-price">
            <span>Per person from</span>
            <strong>₹${p.price.toLocaleString()}</strong>
          </div>
          <div style="display:flex;gap:10px">
            <button onclick="openChat()" style="padding:8px 16px;border:1.5px solid var(--border);border-radius:8px;background:white;cursor:pointer;font-size:0.82rem;transition:all 0.2s" onmouseover="this.style.borderColor='var(--gold)'" onmouseout="this.style.borderColor='var(--border)'">💬 Enquire</button>
            <a href="booking.html" class="btn-sm">Book Now →</a>
          </div>
        </div>
      </div>
    </div>`
  ).join('') || '<p style="color:var(--text-light);text-align:center;padding:40px">No packages in this category yet.</p>';
}

// CHAT LOGIC
function openChat() {
  document.getElementById('chatWidget').classList.add('open');
  document.getElementById('chatFab').style.display = 'none';
}
function closeChat() {
  document.getElementById('chatWidget').classList.remove('open');
  document.getElementById('chatFab').style.display = 'flex';
}

const AGENCY_RESPONSES = [
  "Thank you for your interest! We'd be happy to help you plan your trip. Could you share your preferred travel dates?",
  "Great choice! This is one of our most popular packages. We have availability next month. Would you like to know more about the inclusions?",
  "Absolutely! We can customise the itinerary to suit your group. How many people will be travelling?",
  "Our experienced local guides will ensure you have a safe and memorable journey. Would you like to schedule a call to discuss details?",
  "We offer flexible cancellation up to 14 days before departure. Shall I send you the complete package details on email?",
];

function setupChat() {
  const sendBtn = document.getElementById('chatSend');
  const chatInput = document.getElementById('chatInput');
  const messages = document.getElementById('chatMessages');

  function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // User message
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-msg user-msg';
    userMsg.innerHTML = `<span class="msg-avatar">👤</span><div class="msg-bubble"><p>${text}</p><small>Just now</small></div>`;
    messages.appendChild(userMsg);
    chatInput.value = '';
    messages.scrollTop = messages.scrollHeight;

    // Agency typing indicator
    const typing = document.createElement('div');
    typing.className = 'chat-msg agency-msg';
    typing.innerHTML = `<span class="msg-avatar">🏔️</span><div class="msg-bubble"><p style="color:var(--text-light)">Typing…</p></div>`;
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;

    setTimeout(() => {
      typing.remove();
      const agencyMsg = document.createElement('div');
      agencyMsg.className = 'chat-msg agency-msg';
      const reply = AGENCY_RESPONSES[Math.floor(Math.random() * AGENCY_RESPONSES.length)];
      agencyMsg.innerHTML = `<span class="msg-avatar">🏔️</span><div class="msg-bubble"><p>${reply}</p><small>Just now</small></div>`;
      messages.appendChild(agencyMsg);
      messages.scrollTop = messages.scrollHeight;
    }, 1200);
  }

  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });
}
