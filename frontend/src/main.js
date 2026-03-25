
import { registerRoute, render } from './router.js';
import { renderNavbar } from './components/navbar.js';
import { renderFooter } from './components/footer.js';

// --- Page Imports (lazy-ish via dynamic import wrappers) ---
import HomePage from './pages/home.js';
import LoginPage from './pages/login.js';
import RegisterPage from './pages/register.js';
import AgencyLoginPage from './pages/agency-login.js';
import AgencyRegisterPage from './pages/agency-register.js';
import CreatePackagePage from './pages/create-package.js';
import PackagesPage from './pages/packages.js';
import PackageDetailPage from './pages/package-detail.js';
import BookingPage from './pages/booking.js';
import UserDashboardPage from './pages/user-dashboard.js';
import AgencyDashboardPage from './pages/agency-dashboard.js';
import DNAQuizPage from './pages/dna-quiz.js';
import AISearchPage from './pages/ai-search.js';
import ItineraryPage from './pages/itinerary.js';
import TripRoomPage from './pages/trip-room.js';
import MysteryFlightPage from './pages/mystery-flight.js';
import MatchmakingPage from './pages/matchmaking.js';
import NegotiatorPage from './pages/negotiator.js';
import VisionPage from './pages/vision.js';
import ReelsPage from './pages/reels.js';
import AdminDashboardPage from './pages/admin-dashboard.js';
import AdminLoginPage from './pages/admin-login.js';
import AdminRegisterPage from './pages/admin-register.js';
import { renderSOSButton } from './components/sos-button.js';

// --- Register All Routes ---
registerRoute('/', HomePage);
registerRoute('/login', LoginPage);
registerRoute('/register', RegisterPage);
registerRoute('/agency-login', AgencyLoginPage);
registerRoute('/agency-register', AgencyRegisterPage);
registerRoute('/agency/create-package', CreatePackagePage);
registerRoute('/packages', PackagesPage);
registerRoute('/package/:id', PackageDetailPage);
registerRoute('/booking', BookingPage);
registerRoute('/user-dashboard', UserDashboardPage);
registerRoute('/agency-dashboard', AgencyDashboardPage);
registerRoute('/dna-quiz', DNAQuizPage);
registerRoute('/ai-search', AISearchPage);
registerRoute('/itinerary', ItineraryPage);
registerRoute('/trip-room', TripRoomPage);
registerRoute('/mystery-flight', MysteryFlightPage);
registerRoute('/matchmaking', MatchmakingPage);
registerRoute('/negotiator', NegotiatorPage);
registerRoute('/vision', VisionPage);
registerRoute('/reels', ReelsPage);
registerRoute('/admin-dashboard', AdminDashboardPage);
registerRoute('/admin-login', AdminLoginPage);
registerRoute('/admin-register', AdminRegisterPage);

// --- Initialize ---
renderNavbar();
renderFooter();
renderSOSButton();
render();
