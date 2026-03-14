// ============================================================
// TRAVELHUB — BOOKING PAGE JS
// ============================================================

const PACKAGES = [
  { id:1, name:'Manali Winter Wonderland – 6D/5N', price:8500, duration:'6 Days', image:'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=80', description:'Rohtang Pass, Solang Valley & more' },
  { id:2, name:'Spiti Valley Expedition – 9D/8N', price:15500, duration:'9 Days', image:'https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=400&q=80', description:'Key Monastery, Chandratal Lake & more' },
  { id:3, name:'Leh Ladakh Bike Trip – 10D/9N', price:18000, duration:'10 Days', image:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', description:'Khardung La, Pangong Lake & more' },
  { id:4, name:'Family Himalaya Holiday – 7D/6N', price:22000, duration:'7 Days', image:'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80', description:'Family-friendly, all activities included' },
];

let selectedPackage = PACKAGES[0];
let currentStep = 1;

document.addEventListener('DOMContentLoaded', () => {

  renderPackageList();
  updatePricing();

  // ---- STEP NAVIGATION ----
  document.getElementById('nextStep1').addEventListener('click', () => {
    goToStep(2);
  });
  document.getElementById('prevStep2').addEventListener('click', () => goToStep(1));
  document.getElementById('nextStep2').addEventListener('click', () => {
    if (!document.getElementById('departureDate').value) {
      alert('Please select your departure date.'); return;
    }
    generateTravellerForms();
    goToStep(3);
  });
  document.getElementById('prevStep3').addEventListener('click', () => goToStep(2));
  document.getElementById('nextStep3').addEventListener('click', () => {
    generateConfirmation();
    goToStep(4);
  });
  document.getElementById('prevStep4').addEventListener('click', () => goToStep(3));
  document.getElementById('confirmBooking').addEventListener('click', confirmBooking);

  // ---- COUNTER INPUTS ----
  document.querySelectorAll('.counter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      const op = btn.dataset.op;
      const input = document.getElementById(target);
      let val = parseInt(input.value);
      if (op === '+') val++;
      else val = Math.max(parseInt(input.min), val - 1);
      input.value = val;
      updatePricing();
    });
  });

  document.getElementById('adults').addEventListener('input', updatePricing);

  // Room upgrade pricing
  document.querySelectorAll('input[name=room]').forEach(r => {
    r.addEventListener('change', updatePricing);
  });

  // NAV
  window.addEventListener('scroll', () => {
    document.getElementById('nav').classList.add('scrolled');
  });
  document.getElementById('nav').classList.add('scrolled');
});

function renderPackageList() {
  const list = document.getElementById('packageSelectList');
  list.innerHTML = PACKAGES.map((p, i) =>
    `<div class="pkg-select-item ${i === 0 ? 'selected' : ''}" data-id="${p.id}" onclick="selectPackage(${p.id})">
      <div class="pkg-select-radio"></div>
      <div class="pkg-select-img"><img src="${p.image}" alt="${p.name}" /></div>
      <div class="pkg-select-info">
        <h4>${p.name}</h4>
        <p>⏱ ${p.duration} &nbsp;|&nbsp; ${p.description}</p>
      </div>
      <div class="pkg-select-price">
        <strong>₹${p.price.toLocaleString()}</strong>
        <span>per person</span>
      </div>
    </div>`
  ).join('');
}

function selectPackage(id) {
  selectedPackage = PACKAGES.find(p => p.id === id);
  document.querySelectorAll('.pkg-select-item').forEach(el => {
    el.classList.toggle('selected', parseInt(el.dataset.id) === id);
  });
  document.getElementById('orderPkgName').textContent = selectedPackage.name;
  updatePricing();
}

function updatePricing() {
  const adults = parseInt(document.getElementById('adults')?.value || 2);
  const children = parseInt(document.getElementById('children')?.value || 0);
  const room = document.querySelector('input[name=room]:checked')?.value || 'shared';
  const roomUpgrade = room === 'deluxe' ? 2000 : 0;

  const base = selectedPackage.price * adults;
  const childBase = Math.floor(selectedPackage.price * 0.5) * children;
  const tax = Math.round((base + childBase + roomUpgrade) * 0.05);
  const total = base + childBase + roomUpgrade + tax;

  if (document.getElementById('obBase')) {
    document.getElementById('obBase').textContent = `₹${(base + childBase).toLocaleString()}`;
    document.getElementById('obRoom').textContent = roomUpgrade ? `₹${roomUpgrade.toLocaleString()}` : '₹0';
    document.getElementById('obTax').textContent = `₹${tax.toLocaleString()}`;
    document.getElementById('obTotal').textContent = `₹${total.toLocaleString()}`;
  }

  return { adults, children, room, roomUpgrade, base, childBase, tax, total };
}

function generateTravellerForms() {
  const adults = parseInt(document.getElementById('adults').value);
  const children = parseInt(document.getElementById('children').value);
  const container = document.getElementById('travellerForms');
  container.innerHTML = '';

  for (let i = 0; i < adults; i++) {
    container.innerHTML += `
      <div class="traveller-section">
        <h3>Adult ${i + 1}${i === 0 ? ' (Lead Traveller)' : ''}</h3>
        <div class="traveller-form-grid">
          <div class="form-group"><label>Full Name *</label><input type="text" placeholder="As per ID" required /></div>
          <div class="form-group"><label>Age *</label><input type="number" placeholder="e.g. 28" min="18" max="80" required /></div>
          <div class="form-group"><label>Gender</label>
            <select><option>Male</option><option>Female</option><option>Other</option></select>
          </div>
          <div class="form-group"><label>ID Type</label>
            <select><option>Aadhar Card</option><option>Passport</option><option>PAN Card</option><option>Driving Licence</option></select>
          </div>
          ${i === 0 ? `<div class="form-group"><label>Email *</label><input type="email" placeholder="your@email.com" required /></div>
          <div class="form-group"><label>Phone *</label><input type="tel" placeholder="+91 XXXXX XXXXX" required /></div>` : ''}
        </div>
      </div>`;
  }

  for (let i = 0; i < children; i++) {
    container.innerHTML += `
      <div class="traveller-section">
        <h3>Child ${i + 1}</h3>
        <div class="traveller-form-grid">
          <div class="form-group"><label>Full Name *</label><input type="text" placeholder="As per ID" required /></div>
          <div class="form-group"><label>Age *</label><input type="number" placeholder="e.g. 10" min="1" max="17" required /></div>
        </div>
      </div>`;
  }
}

function generateConfirmation() {
  const { adults, children, room, roomUpgrade, base, childBase, tax, total } = updatePricing();
  const departure = document.getElementById('departureDate').value;

  document.getElementById('confirmationBox').innerHTML = `
    <div class="confirm-section">
      <h4>Package Selected</h4>
      <div class="confirm-row"><span>Package Name</span><strong>${selectedPackage.name}</strong></div>
      <div class="confirm-row"><span>Travel Agency</span><strong>Summit Trails India</strong></div>
      <div class="confirm-row"><span>Duration</span><strong>${selectedPackage.duration}</strong></div>
    </div>
    <div class="confirm-section">
      <h4>Trip Details</h4>
      <div class="confirm-row"><span>Departure Date</span><strong>${departure ? new Date(departure).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}) : 'Not selected'}</strong></div>
      <div class="confirm-row"><span>Adult Travellers</span><strong>${adults}</strong></div>
      <div class="confirm-row"><span>Children</span><strong>${children}</strong></div>
      <div class="confirm-row"><span>Room Type</span><strong>${room.charAt(0).toUpperCase() + room.slice(1)}</strong></div>
    </div>
    <div class="confirm-section">
      <h4>Price Summary</h4>
      <div class="confirm-row"><span>Base Package (${adults} adult${adults > 1 ? 's' : ''})</span><strong>₹${base.toLocaleString()}</strong></div>
      ${children > 0 ? `<div class="confirm-row"><span>Children (${children})</span><strong>₹${childBase.toLocaleString()}</strong></div>` : ''}
      ${roomUpgrade > 0 ? `<div class="confirm-row"><span>Room Upgrade</span><strong>₹${roomUpgrade.toLocaleString()}</strong></div>` : ''}
      <div class="confirm-row"><span>Taxes & Fees (5%)</span><strong>₹${tax.toLocaleString()}</strong></div>
      <div class="confirm-row" style="font-size:1.1rem;font-weight:700;color:var(--navy);padding-top:10px;border-top:1.5px solid var(--border);margin-top:6px"><span>Total Amount</span><strong>₹${total.toLocaleString()}</strong></div>
    </div>`;
}

function confirmBooking() {
  if (!document.getElementById('termsCheck').checked) {
    alert('Please accept the terms and conditions to proceed.'); return;
  }
  const ref = 'TH-2025-' + Math.floor(10000 + Math.random() * 90000);
  document.getElementById('bookingRef').textContent = ref;
  document.getElementById('successModal').style.display = 'flex';
}

function goToStep(step) {
  // Update steps
  document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
  document.getElementById('step' + step).classList.add('active');

  // Update stepper
  document.querySelectorAll('.step-item').forEach((item, i) => {
    item.classList.remove('active', 'completed');
    if (i + 1 < step) item.classList.add('completed');
    if (i + 1 === step) item.classList.add('active');
    const circle = item.querySelector('.step-circle');
    if (i + 1 < step) circle.textContent = '✓';
    else circle.textContent = i + 1;
  });

  document.querySelectorAll('.step-line').forEach((line, i) => {
    line.classList.toggle('done', i < step - 1);
  });

  currentStep = step;
  window.scrollTo({ top: 100, behavior: 'smooth' });
}
