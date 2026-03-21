// Footer component
export function renderFooter() {
  const footer = document.getElementById('footer-content');

  footer.innerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <h3>✈️ TravelHub</h3>
            <p>Your AI-powered travel companion. Discover, compare, and book travel agencies with intelligent features that make planning effortless.</p>
          </div>

          <div class="footer-links">
            <h4>Explore</h4>
            <ul>
              <li><a href="/packages" data-link>Packages</a></li>
              <li><a href="/ai-search" data-link>AI Search</a></li>
              <li><a href="/dna-quiz" data-link>Travel DNA</a></li>
              <li><a href="/itinerary" data-link>Itinerary Generator</a></li>
            </ul>
          </div>

          <div class="footer-links">
            <h4>Features</h4>
            <ul>
              <li><a href="/trip-room" data-link>Group Trip Planner</a></li>
              <li><a href="/mystery-flight" data-link>Mystery Flight</a></li>
              <li><a href="/matchmaking" data-link>Trip Tinder</a></li>
              <li><a href="/vision" data-link>Visual Search</a></li>
            </ul>
          </div>

          <div class="footer-links">
            <h4>Account</h4>
            <ul>
              <li><a href="/login" data-link>User Login</a></li>
              <li><a href="/agency-login" data-link>Agency Login</a></li>
              <li><a href="/user-dashboard" data-link>Dashboard</a></li>
              <li><a href="/admin-login" data-link style="color: var(--danger);">Admin Portal</a></li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <p>© ${new Date().getFullYear()} TravelHub. Built with ❤️ and AI.</p>
        </div>
      </div>
    </footer>
  `;
}
