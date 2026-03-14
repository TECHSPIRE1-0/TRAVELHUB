// ============================================================
// TRAVELHUB — SEARCH PAGE JS
// ============================================================

const AGENCIES = [
  { id:1, name:'Summit Trails India', location:'New Delhi', rating:4.9, reviews:312, price:8500, image:'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=80', tags:['Himalaya','Adventure','Trekking'], destinations:['Manali','Spiti Valley','Leh Ladakh','Kasol'], verified:true },
  { id:2, name:'Kerala Wanderers', location:'Kochi', rating:4.8, reviews:198, price:12000, image:'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=80', tags:['Backwaters','Beach','Wildlife'], destinations:['Kerala','Munnar','Alleppey'], verified:true },
  { id:3, name:'Rajasthan Royals Tours', location:'Jaipur', rating:4.7, reviews:245, price:9500, image:'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&q=80', tags:['Heritage','Desert','Culture'], destinations:['Rajasthan','Jaisalmer','Jodhpur'], verified:true },
  { id:4, name:'Goa Beach Escapes', location:'Panaji, Goa', rating:4.6, reviews:183, price:7500, image:'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80', tags:['Beach','Party','Relaxation'], destinations:['Goa','North Goa','South Goa'], verified:true },
  { id:5, name:'Northeast Explorers', location:'Guwahati', rating:4.8, reviews:127, price:15000, image:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80', tags:['Wildlife','Culture','Adventure'], destinations:['Meghalaya','Assam','Nagaland','Arunachal'], verified:false },
  { id:6, name:'Uttarakhand Treks Co.', location:'Dehradun', rating:4.5, reviews:89, price:6500, image:'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=600&q=80', tags:['Trekking','Spiritual','Adventure'], destinations:['Rishikesh','Kedarnath','Chopta','Auli'], verified:true },
  { id:7, name:'Tamil Nadu Heritage Tours', location:'Chennai', rating:4.4, reviews:156, price:8000, image:'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80', tags:['Heritage','Temples','Culture'], destinations:['Madurai','Ooty','Kodaikanal','Rameswaram'], verified:true },
  { id:8, name:'Andaman Island Hopper', location:'Port Blair', rating:4.9, reviews:94, price:22000, image:'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=600&q=80', tags:['Island','Diving','Adventure'], destinations:['Andaman','Havelock','Neil Island'], verified:false },
  { id:9, name:'Himachal Dream Tours', location:'Shimla', rating:4.6, reviews:210, price:9000, image:'https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=600&q=80', tags:['Mountains','Family','Honeymoon'], destinations:['Shimla','Manali','Dharamsala','Dalhousie'], verified:true },
];

let filtered = [...AGENCIES];
let currentPage = 1;
const PER_PAGE = 6;

document.addEventListener('DOMContentLoaded', () => {

  // Get URL params
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q') || '';
  if (q) document.getElementById('searchInput').value = q;

  applyFilters(q);

  // Search input
  document.getElementById('searchBtn').addEventListener('click', () => {
    applyFilters(document.getElementById('searchInput').value);
  });
  document.getElementById('searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') applyFilters(e.target.value);
  });

  // Filter changes
  ['filterBudget','filterDuration','filterType','filterRating'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      applyFilters(document.getElementById('searchInput').value);
    });
  });

  document.getElementById('clearFilters').addEventListener('click', () => {
    document.getElementById('filterBudget').value = '';
    document.getElementById('filterDuration').value = '';
    document.getElementById('filterType').value = '';
    document.getElementById('filterRating').value = '';
    applyFilters(document.getElementById('searchInput').value);
  });

  document.getElementById('sortBy').addEventListener('change', () => renderResults());
});

function applyFilters(query) {
  const budget = document.getElementById('filterBudget').value;
  const type = document.getElementById('filterType').value;
  const rating = document.getElementById('filterRating').value;

  filtered = AGENCIES.filter(a => {
    const q = query.toLowerCase();
    const matchQuery = !query || a.name.toLowerCase().includes(q) || a.location.toLowerCase().includes(q) ||
      a.destinations.some(d => d.toLowerCase().includes(q)) ||
      a.tags.some(t => t.toLowerCase().includes(q));
    const matchBudget = !budget || a.price <= parseInt(budget);
    const matchType = !type || a.tags.some(t => t.toLowerCase().includes(type.toLowerCase()));
    const matchRating = !rating || a.rating >= parseFloat(rating);
    return matchQuery && matchBudget && matchType && matchRating;
  });

  currentPage = 1;
  renderResults();
}

function renderResults() {
  const sortBy = document.getElementById('sortBy').value;

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'price_low') return a.price - b.price;
    if (sortBy === 'price_high') return b.price - a.price;
    if (sortBy === 'reviews') return b.reviews - a.reviews;
    return 0;
  });

  const total = sorted.length;
  const pages = Math.ceil(total / PER_PAGE);
  const start = (currentPage - 1) * PER_PAGE;
  const page = sorted.slice(start, start + PER_PAGE);

  document.getElementById('resultsCount').innerHTML = `Showing <strong>${total} agenc${total === 1 ? 'y' : 'ies'}</strong> matching your search`;

  const grid = document.getElementById('resultsGrid');
  if (page.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 0;color:var(--text-light)">
      <div style="font-size:3rem;margin-bottom:16px">🔍</div>
      <h3 style="font-family:var(--font-display);color:var(--navy);margin-bottom:8px">No agencies found</h3>
      <p>Try a different destination or clear filters</p>
    </div>`;
    document.getElementById('pagination').innerHTML = '';
    return;
  }

  grid.innerHTML = page.map(a => `
    <div class="result-card" onclick="window.location='agency-profile.html'">
      <div class="result-card-img">
        <img src="${a.image}" alt="${a.name}" loading="lazy" />
        ${a.verified ? '<span class="result-verified">✓ Verified</span>' : ''}
        <button class="result-fav" onclick="event.stopPropagation();this.textContent=this.textContent==='🤍'?'❤️':'🤍'">🤍</button>
      </div>
      <div class="result-card-body">
        <h3>${a.name}</h3>
        <p class="result-location">📍 ${a.location}</p>
        <div class="result-rating">
          <span class="result-stars">${'★'.repeat(Math.floor(a.rating))}${a.rating % 1 >= 0.5 ? '½' : ''}</span>
          <strong>${a.rating}</strong>
          <span>(${a.reviews} reviews)</span>
        </div>
        <div class="result-tags">${a.tags.slice(0,3).map(t => `<span>${t}</span>`).join('')}</div>
        <div class="result-footer">
          <div class="result-price">
            <span>Packages from</span>
            <strong>₹${a.price.toLocaleString()}</strong>
          </div>
          <a href="agency-profile.html" class="btn-sm">View →</a>
        </div>
      </div>
    </div>
  `).join('');

  // Pagination
  const pag = document.getElementById('pagination');
  if (pages <= 1) { pag.innerHTML = ''; return; }
  pag.innerHTML = Array.from({ length: pages }, (_, i) => i + 1).map(p =>
    `<button class="page-btn ${p === currentPage ? 'active' : ''}" onclick="goPage(${p})">${p}</button>`
  ).join('');
}

function goPage(p) {
  currentPage = p;
  renderResults();
  window.scrollTo({ top: 400, behavior: 'smooth' });
}
