import { packages as packagesApi } from '../api.js';
import { showToast } from '../components/toast.js';
import { navigate } from '../router.js';

export default async function CreatePackagePage(container) {
  // Enforce agency login
  const user = JSON.parse(localStorage.getItem('travelhub_user') || 'null');
  if (!user || user.role !== 'agency') {
    showToast('Agency access required to create packages.', 'error');
    navigate('/agency-login');
    return;
  }

  container.innerHTML = `
    <section class="section">
      <div class="container" style="max-width: 800px;">
        <div class="dashboard-header animate-in">
          <a href="/agency-dashboard" data-link class="text-secondary" style="display:inline-block; margin-bottom: 16px;">← Back to Dashboard</a>
          <h1>Create New Package 🌍</h1>
          <p class="text-secondary">Fill out the details below to publish a new travel package.</p>
        </div>

        <form id="create-package-form" class="glass-card animate-in" style="animation-delay: 0.1s;">
          
          <h3 class="mb-2">1. Basic Details</h3>
          <div class="grid grid-2" style="gap: 16px; margin-bottom: 24px;">
            <div class="form-group">
              <label>Package Title *</label>
              <input type="text" id="pkg-title" class="form-input" required placeholder="e.g. Majestic Himalayas" />
            </div>
            <div class="form-group">
              <label>Destination *</label>
              <input type="text" id="pkg-dest" class="form-input" required placeholder="e.g. Manali, India" />
            </div>
            <div class="form-group">
              <label>Start Location *</label>
              <input type="text" id="pkg-start" class="form-input" required placeholder="e.g. Delhi" />
            </div>
            <div class="form-group">
              <label>Base Price (₹) *</label>
              <input type="number" id="pkg-price" class="form-input" required min="0" placeholder="e.g. 15000" />
            </div>
            <div class="form-group">
              <label>Duration Days *</label>
              <input type="number" id="pkg-days" class="form-input" required min="1" value="5" />
            </div>
            <div class="form-group">
              <label>Duration Nights *</label>
              <input type="number" id="pkg-nights" class="form-input" required min="0" value="4" />
            </div>
            <div class="form-group">
              <label>Max People capacity *</label>
              <input type="number" id="pkg-capacity" class="form-input" required min="1" value="10" />
            </div>
          </div>
          <div class="form-group mb-4">
            <label>Package Description *</label>
            <textarea id="pkg-desc" class="form-input" required rows="3" placeholder="Describe the overall experience..."></textarea>
          </div>

          <h3 class="mb-2">2. Package Type</h3>
          <div class="grid grid-2" style="gap: 16px; margin-bottom: 24px;">
            <div class="form-group">
              <label>Type Name *</label>
              <input type="text" id="type-name" class="form-input" required placeholder="e.g. Adventure, Honeymoon" />
            </div>
            <div class="form-group">
              <label>Type Description</label>
              <input type="text" id="type-desc" class="form-input" placeholder="e.g. Thrill-seeking activities" />
            </div>
          </div>

          <h3 class="mb-2 flex justify-between">
            <span>3. Itinerary</span>
            <button type="button" class="btn btn-secondary btn-sm" id="add-itinerary">+ Add Day</button>
          </h3>
          <div id="itinerary-list" style="margin-bottom: 24px; display: flex; flex-direction: column; gap: 12px;"></div>

          <h3 class="mb-2 flex justify-between">
            <span>4. Transport Options</span>
            <button type="button" class="btn btn-secondary btn-sm" id="add-transport">+ Add Transport</button>
          </h3>
          <div id="transport-list" style="margin-bottom: 24px; display: flex; flex-direction: column; gap: 12px;"></div>

          <h3 class="mb-2">5. Main Image URL</h3>
          <div class="form-group mb-4">
            <input type="url" id="pkg-image" class="form-input" placeholder="https://example.com/image.jpg" />
            <p class="text-secondary" style="font-size: 0.8rem; margin-top: 4px;">Leave blank to use a default placeholder</p>
          </div>

          <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;" id="submit-btn">Publish Package 🚀</button>
        </form>
      </div>
    </section>
  `;

  // Dynamic Lists logic
  const itineraryList = container.querySelector('#itinerary-list');
  const transportList = container.querySelector('#transport-list');
  
  let dayCount = 0;
  function addItineraryRow() {
    dayCount++;
    const div = document.createElement('div');
    div.className = 'grid grid-itinerary';
    div.style.gap = '12px';
    div.style.alignItems = 'end';
    div.innerHTML = `
      <div class="form-group" style="width: 80px;"><label>Day</label><input type="number" class="form-input i-day" value="${dayCount}" required /></div>
      <div class="form-group" style="flex: 1;"><label>Title</label><input type="text" class="form-input i-title" placeholder="E.g. Arrival" required /></div>
      <div class="form-group" style="flex: 2;"><label>Description</label><input type="text" class="form-input i-desc" placeholder="What happens today?" required /></div>
      <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">X</button>
    `;
    div.style.display = 'flex';
    itineraryList.appendChild(div);
  }

  function addTransportRow() {
    const div = document.createElement('div');
    div.className = 'grid grid-transport';
    div.style.gap = '12px';
    div.style.alignItems = 'end';
    div.innerHTML = `
      <div class="form-group" style="flex: 1;"><label>Type</label><input type="text" class="form-input t-type" placeholder="Car, Bus, Flight" required /></div>
      <div class="form-group" style="flex: 1;"><label>Name</label><input type="text" class="form-input t-name" placeholder="Innova / Vistara" required /></div>
      <div class="form-group" style="width: 100px;"><label>Seats</label><input type="number" class="form-input t-seats" value="4" required /></div>
      <div class="form-group" style="width: 120px;"><label>Price/Day</label><input type="number" class="form-input t-price" value="0" required /></div>
      <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">X</button>
    `;
    div.style.display = 'flex';
    transportList.appendChild(div);
  }

  // Initialize with 1 empty row each
  addItineraryRow();
  addTransportRow();

  container.querySelector('#add-itinerary').addEventListener('click', addItineraryRow);
  container.querySelector('#add-transport').addEventListener('click', addTransportRow);

  // Form Submission
  container.querySelector('#create-package-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = container.querySelector('#submit-btn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Publishing...';

    // Gather Itinerary
    const itinerary = Array.from(itineraryList.children).map(row => ({
      day_number: parseInt(row.querySelector('.i-day').value),
      title: row.querySelector('.i-title').value,
      description: row.querySelector('.i-desc').value
    }));

    // Gather Transport
    const transport_options = Array.from(transportList.children).map(row => ({
      vehicle_type: row.querySelector('.t-type').value,
      vehicle_name: row.querySelector('.t-name').value,
      seat_capacity: parseInt(row.querySelector('.t-seats').value),
      price_per_day: parseFloat(row.querySelector('.t-price').value)
    }));

    // Generate basic pricing mapping (mapping transport index to its price so the schema passes)
    const pricing = transport_options.map((t, idx) => ({
      transport_index: idx,
      price: t.price_per_day
    }));

    const imgUrl = container.querySelector('#pkg-image').value;
    const images = imgUrl ? [imgUrl] : ['/images/hero-mountain.png']; // Fallback

    const requestData = {
      package_type: {
        type_name: container.querySelector('#type-name').value,
        description: container.querySelector('#type-desc').value || container.querySelector('#type-name').value
      },
      package: {
        title: container.querySelector('#pkg-title').value,
        description: container.querySelector('#pkg-desc').value,
        destination: container.querySelector('#pkg-dest').value,
        start_location: container.querySelector('#pkg-start').value,
        duration_days: parseInt(container.querySelector('#pkg-days').value),
        duration_nights: parseInt(container.querySelector('#pkg-nights').value),
        base_price: parseFloat(container.querySelector('#pkg-price').value),
        max_people: parseInt(container.querySelector('#pkg-capacity').value)
      },
      transport_options,
      itinerary,
      images,
      pricing
    };

    try {
      await packagesApi.create(requestData);
      showToast('Package created successfully!', 'success');
      navigate('/agency-dashboard');
    } catch (err) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Publish Package 🚀';
    }
  });
}
