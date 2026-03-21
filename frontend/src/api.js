// =========================================================================
// TRAVELHUB — Complete API Service Layer
// Maps all 40+ FastAPI backend routes
// =========================================================================

const BASE = '';

async function request(method, url, body = null, isFormData = false) {
  const opts = {
    method,
    credentials: 'include',
    headers: {},
  };

  if (body && !isFormData) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  } else if (body && isFormData) {
    opts.body = body;
  }

  const res = await fetch(`${BASE}${url}`, opts);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.detail || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

// ─────────────────────────── AUTH ───────────────────────────
export const auth = {
  registerUser: (data) => request('POST', '/auth/auth/register', data),
  loginUser: (data) => request('POST', '/auth/auth/login', data),
  registerAgency: (data) => request('POST', '/auth/auth/register-agency', data),
  loginAgency: (data) => request('POST', '/auth/auth/login-agency', data),
};

// ─────────────────────────── PACKAGES ───────────────────────
export const packages = {
  search: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') params.append(k, v);
    });
    const qs = params.toString();
    return request('GET', `/packages/${qs ? '?' + qs : ''}`);
  },

  create: (data) => request('POST', '/agency/create-package', data),
};

// ─────────────────────────── BOOKING ────────────────────────
export const booking = {
  create: (data) => request('POST', '/booking/', data),
  update: (bookingId, data) => request('PATCH', `/booking/update/${bookingId}`, data),
};

// ─────────────────────────── ENQUIRY ────────────────────────
export const enquiry = {
  send: (data) => request('POST', '/enquiry/send-enquiry', data),
  getAgencyEnquiries: () => request('GET', '/enquiry/agency/enquiries'),
};

// ─────────────────────────── USER DASHBOARD ─────────────────
export const user = {
  dashboard: () => request('GET', '/user/dashboard'),
  bookingDetails: (id) => request('GET', `/user/booking/${id}`),
  cancelBooking: (id) => request('PATCH', `/user/booking/${id}/cancel`),
};

// ─────────────────────────── AGENCY DASHBOARD ───────────────
export const agencyDashboard = {
  packages: () => request('GET', '/agency/dashboard/packages'),
  bookings: () => request('GET', '/agency/dashboard/bookings'),
  bookingDetails: (id) => request('GET', `/agency/dashboard/booking/${id}`),
  updateBookingStatus: (id, status) =>
    request('PATCH', `/agency/dashboard/booking/${id}/status?status=${status}`),
  stats: () => request('GET', '/agency/dashboard/stats'),
};

// ─────────────────────────── AI SEARCH ──────────────────────
export const aiSearch = {
  search: (query) => request('POST', '/ai/search', { query }),
};

// ─────────────────────────── TRAVEL DNA ─────────────────────
export const dna = {
  getQuestions: () => request('GET', '/dna/questions'),
  submitQuiz: (answers) => request('POST', '/dna/quiz', answers),
};

// ─────────────────────────── TRIP ROOM ──────────────────────
export const tripRoom = {
  create: (name) => request('POST', '/trip/create', { name }),
  join: (code) => request('POST', `/trip/${code}/join`),
  addPackage: (code, packageId) =>
    request('POST', `/trip/${code}/add-package`, { package_id: packageId }),
  vote: (code, packageId) =>
    request('POST', `/trip/${code}/vote`, { package_id: packageId }),
  getDetails: (code) => request('GET', `/trip/${code}`),
  close: (code) => request('PATCH', `/trip/${code}/close`),

  connectWS: (code) => {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    return new WebSocket(`${proto}://${location.host}/trip/${code}/ws`);
  },
};

// ─────────────────────────── SOCIAL PROOF ───────────────────
export const socialProof = {
  trackView: (packageId) => request('POST', `/packages/${packageId}/view`),
  get: (packageId, departureDate = null) => {
    const qs = departureDate ? `?departure_date=${departureDate}` : '';
    return request('GET', `/packages/${packageId}/social-proof${qs}`);
  },
};

// ─────────────────────────── ITINERARY ──────────────────────
export const itinerary = {
  generate: (data) => request('POST', '/itinerary/generate', data),
};

// ─────────────────────────── MATCHMAKING ────────────────────
export const matchmaking = {
  score: (data) => request('POST', '/matchmaking/score', data),
};

// ─────────────────────────── MYSTERY FLIGHT ─────────────────
export const mysteryFlight = {
  book: (userId, maxBudget) =>
    request('POST', '/gamified/mystery-booking', {
      user_id: userId,
      max_budget: maxBudget,
    }),
};

// ─────────────────────────── NEGOTIATOR ─────────────────────
export const negotiator = {
  connectWS: (packageId) => {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    return new WebSocket(`${proto}://${location.host}/negotiate/${packageId}/ws`);
  },
};

// ─────────────────────────── REELS ──────────────────────────
export const reels = {
  generate: (data) => request('POST', '/marketing/reels', data),
};

// ─────────────────────────── VISION ─────────────────────────
export const vision = {
  analyze: (file) => {
    const form = new FormData();
    form.append('file', file);
    return request('POST', '/vision/analyze', form, true);
  },
};

// ─────────────────────────── CROWD LEVEL ──────────────────────
export const crowd = {
  checkPackage: (packageId, departureDate) => 
    request('GET', `/crowd/package/${packageId}?departure_date=${departureDate}`),
  checkDestination: (destination) => 
    request('GET', `/crowd/destination?destination=${encodeURIComponent(destination)}`)
};

// ─────────────────────────── REAL-TIME CHAT ────────────────────
export const chat = {
  getAgencyHistory: (userId) => request('GET', `/chat/agency/history/${userId}`),
  getUserHistory: (agencyId) => request('GET', `/chat/history/${agencyId}`),
  getAgencyConversations: () => request('GET', `/chat/agency/conversations`),
  connectUserWS: (agencyId) => {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    return new WebSocket(`${proto}://${location.host}/chat/ws/user/${agencyId}`);
  },
  connectAgencyWS: (userId) => {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    return new WebSocket(`${proto}://${location.host}/chat/ws/agency/${userId}`);
  }
};
