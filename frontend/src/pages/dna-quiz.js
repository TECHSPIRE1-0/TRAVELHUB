// Travel DNA Quiz Page
import { dna } from '../api.js';
import { showToast } from '../components/toast.js';
import { createPackageCard } from '../components/package-card.js';

export default async function DNAQuizPage(container) {
  let questions = [];
  let answers = {};

  container.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="text-center animate-in">
          <h1 class="section-title">🧬 Travel DNA Quiz</h1>
          <p class="section-subtitle" style="margin: 0 auto 48px;">Discover your traveler persona and find your perfect package match!</p>
        </div>
        <div class="quiz-container" id="quiz-area">
          <div class="glass-card skeleton" style="height: 400px;"></div>
        </div>
      </div>
    </section>
  `;

  // Load questions
  try {
    const data = await dna.getQuestions();
    questions = data?.questions || [];
  } catch {
    // Use hardcoded questions as fallback
    questions = [
      { id: 'budget_style', question: 'What is your travel budget style?', options: [
        { value: 'backpacker', label: 'Backpacker', hint: 'Under ₹10,000 per person' },
        { value: 'midrange', label: 'Mid-range', hint: '₹10,000 – ₹30,000 per person' },
        { value: 'luxury', label: 'Luxury', hint: '₹30,000+ per person' },
      ]},
      { id: 'activity_level', question: 'How active do you like your trips?', options: [
        { value: 'relaxed', label: 'Relaxed', hint: 'Beaches, sightseeing, leisure' },
        { value: 'moderate', label: 'Moderate', hint: 'Some hiking, city walks' },
        { value: 'intense', label: 'Intense', hint: 'Trekking, rafting, camping' },
      ]},
      { id: 'travel_group', question: 'Who do you usually travel with?', options: [
        { value: 'solo', label: 'Solo', hint: 'Just me, myself and I' },
        { value: 'couple', label: 'Couple', hint: 'Me and my partner' },
        { value: 'family', label: 'Family', hint: 'With kids and/or parents' },
        { value: 'friends', label: 'Friends', hint: 'The whole gang' },
      ]},
      { id: 'vibe', question: 'What is your travel vibe?', options: [
        { value: 'adventure', label: 'Adventure', hint: 'Thrills and adrenaline' },
        { value: 'culture', label: 'Culture', hint: 'History, food, heritage' },
        { value: 'beach', label: 'Beach', hint: 'Sun, sea, relaxation' },
        { value: 'nature', label: 'Nature', hint: 'Wildlife and forests' },
        { value: 'city', label: 'City', hint: 'Urban exploring' },
      ]},
      { id: 'duration', question: 'How long do you like your trips?', options: [
        { value: 'weekend', label: 'Weekend', hint: '2–3 days' },
        { value: 'short', label: 'Short trip', hint: '3–5 days' },
        { value: 'week', label: 'A week', hint: '6–8 days' },
        { value: 'long', label: 'Long trip', hint: '9+ days' },
      ]},
    ];
  }

  renderQuiz();

  function renderQuiz() {
    const area = container.querySelector('#quiz-area');
    area.innerHTML = `
      ${questions.map((q, i) => `
        <div class="quiz-question animate-in" style="animation-delay: ${i * 0.1}s;">
          <h3>${i + 1}. ${q.question}</h3>
          <div class="quiz-options">
            ${q.options.map(opt => `
              <div class="quiz-option ${answers[q.id] === opt.value ? 'selected' : ''}" data-qid="${q.id}" data-value="${opt.value}">
                <span class="option-label">${opt.label}</span>
                <span class="option-hint">${opt.hint}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}

      <button class="btn btn-gold btn-lg" style="width: 100%; margin-top: 16px;" id="submit-quiz"
        ${Object.keys(answers).length < questions.length ? 'disabled' : ''}>
        🧬 Reveal My Travel DNA
      </button>
    `;

    // Option click handlers
    area.querySelectorAll('.quiz-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const qid = opt.dataset.qid;
        answers[qid] = opt.dataset.value;
        // Update UI
        opt.closest('.quiz-options').querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        // Enable submit if all answered
        const submitBtn = container.querySelector('#submit-quiz');
        submitBtn.disabled = Object.keys(answers).length < questions.length;
      });
    });

    // Submit handler
    container.querySelector('#submit-quiz')?.addEventListener('click', submitQuiz);
  }

  async function submitQuiz() {
    const btn = container.querySelector('#submit-quiz');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Analyzing your DNA...';

    try {
      const result = await dna.submitQuiz(answers);
      showResults(result);
    } catch (err) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = '🧬 Reveal My Travel DNA';
    }
  }

  function showResults(result) {
    const area = container.querySelector('#quiz-area');
    const persona = result.persona;
    const packages = result.matched_packages || [];

    area.innerHTML = `
      <div class="glass-card persona-card animate-in">
        <div class="persona-emoji">${persona.emoji}</div>
        <div class="persona-name">${persona.name}</div>
        <p class="persona-tagline">${persona.tagline}</p>
        <div class="persona-traits">
          ${persona.traits?.map(t => `<span class="badge badge-accent">${t}</span>`).join('') || ''}
        </div>
        <div class="mt-2 text-secondary" style="font-size: 0.9rem;">
          <p>💰 Budget: ${persona.budget_range}</p>
          <p>⏱ Ideal Duration: ${persona.ideal_duration}</p>
        </div>
      </div>

      ${packages.length > 0 ? `
        <h3 class="mt-4 mb-2" style="text-align: center;">Your Best Matches 🎯</h3>
        <div class="feature-grid">
          ${packages.map(pkg => `
            <div class="glass-card package-card" data-link href="/package/${pkg.id}">
              <div class="package-body">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <h3 class="package-title">${pkg.title}</h3>
                  <span class="badge badge-success">${pkg.match_score}% match</span>
                </div>
                <p class="text-secondary" style="font-size: 0.85rem;">📍 ${pkg.destination} · ⏱ ${pkg.duration}</p>
                <p class="text-muted mt-1" style="font-size: 0.85rem;">${pkg.why_matched}</p>
                <p class="package-price mt-1">₹${(pkg.base_price || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <button class="btn btn-secondary btn-lg mt-4" style="width: 100%;" id="retake-quiz">Retake Quiz</button>
    `;

    container.querySelector('#retake-quiz')?.addEventListener('click', () => {
      answers = {};
      renderQuiz();
    });
  }
}
