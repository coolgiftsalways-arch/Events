import { useEffect } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
  Link,
} from "react-router-dom";

import Lenis from "lenis";
import "lenis/dist/lenis.css";

// ==========================================
// COMPONENTS
// ==========================================

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// ==========================================
// EXISTING PAGES
// ==========================================

import Home from "./pages/Home";
import Vendors from "./pages/Vendors";
import About from "./pages/About";
import EventDetails from "./pages/EventDetails";
import Booking from "./pages/Booking";

// ==========================================
// ORGANISER PAGES
// ==========================================

import OrganiserMembership from "./pages/OrganiserMembership";
import OrganiserRegister from "./pages/OrganiserRegister";
import OrganiserLogin from "./pages/OrganiserLogin";
import OrganiserProfile from "./pages/OrganiserProfile";
import OrganiserDashboard from "./pages/OrganiserDashboard";
import CreateEvent from "./pages/CreateEvent";
import CreatePost from "./pages/CreatePost";
import StallForOrganiser from "./pages/StallForOrganiser";

// ==========================================
// USER PROFILE
// ==========================================

import Profile from "./pages/Profile";

// ==========================================
// VENDOR PAGES
// ==========================================

import VendorLogin from "./pages/VendorLogin";
import VendorRegister from "./pages/VendorRegister";
import VendorStalls from "./pages/VendorStalls";
import VendorMembership from "./pages/VendorMembership";
import VendorPaymentSuccess from "./pages/VendorPaymentSuccess";
import VendorProfile from "./pages/VendorProfile";
import VendorBookings from "./pages/VendorBookings";

// ==========================================
// GLOBAL CSS
// ==========================================

import AdminLogin from "./pages/admin/AdminLogin";
import AdminPanel from "./pages/admin/AdminPanel";

import { isLoggedIn, refreshSession, clearSession } from "./services/api";

import "./App.css";

// ==========================================
// SMOOTH SCROLL
// ==========================================

function SmoothScroll() {
  const { pathname } = useLocation();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    let rafId;

    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [pathname]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}

// ==========================================
// 404 PAGE
// ==========================================

function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-content">
        <span className="not-found-number">404</span>

        <h1>PAGE NOT FOUND</h1>

        <p>
          Oops! The page you're looking for doesn't exist or may have been
          moved.
        </p>

        <Link to="/" className="not-found-button">
          Back to Home
        </Link>
      </div>
    </main>
  );
}

// ==========================================
// APP LAYOUT
// ==========================================

// Keep the cached profile/membership fresh, and clear logins from the old
// browser-only version (they have no server token).
function SyncSessions() {
  useEffect(() => {
    try {
      if (!isLoggedIn("vendor") && localStorage.getItem("stalloraVendorSession")) clearSession("vendor");
      if (!isLoggedIn("organiser") && localStorage.getItem("stalloraOrganiser")) clearSession("organiser");
    } catch {
      /* storage blocked */
    }
    refreshSession("vendor");
    refreshSession("organiser");
  }, []);
  return null;
}

function AppLayout() {
  const { pathname } = useLocation();

  // Admin panel has its own layout (no site navbar/footer)
  if (pathname.startsWith("/admin")) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminPanel />} />
      </Routes>
    );
  }

  return (
    <div className="app">
      <SmoothScroll />
      <SyncSessions />

      {/* GLOBAL NAVBAR */}

      <Navbar />

      {/* =====================================
          APPLICATION ROUTES
      ===================================== */}

      <Routes>
        {/* =====================================
            PUBLIC PAGES
        ===================================== */}

        <Route path="/" element={<Home />} />

        <Route path="/events" element={<Vendors />} />

        <Route path="/vendors" element={<Vendors />} />

        <Route path="/about" element={<About />} />

        <Route path="/event/:eventId" element={<EventDetails />} />

        <Route path="/book/:eventId" element={<Booking />} />

        {/* =====================================
            ORGANISER ROUTES
        ===================================== */}

        <Route path="/organiser/register" element={<OrganiserRegister />} />

        <Route path="/organiser/membership" element={<OrganiserMembership />} />

        <Route path="/organiser/profile" element={<OrganiserProfile />} />

        <Route path="/organiser/dashboard" element={<OrganiserDashboard />} />

        <Route path="/organiser/create-event" element={<CreateEvent />} />

        <Route path="/organiser/create-post" element={<CreatePost />} />

        <Route
          path="/organiser/stall-requests"
          element={<StallForOrganiser />}
        />

        {/* =====================================
            VENDOR ROUTES
        ===================================== */}

        {/* DEFAULT VENDOR PAGE */}

        <Route
          path="/vendor"
          element={<Navigate to="/vendor/stalls" replace />}
        />

        {/* VENDOR LOGIN */}

        <Route path="/vendor/login" element={<VendorLogin />} />

        {/* VENDOR REGISTRATION */}

        <Route path="/vendor/register" element={<VendorRegister />} />

        {/* VENDOR EVENT DISCOVERY */}

        <Route path="/vendor/stalls" element={<VendorStalls />} />

        {/* VENDOR MEMBERSHIP */}

        <Route path="/vendor/membership" element={<VendorMembership />} />

        {/* VENDOR PAYMENT SUCCESS */}

        <Route
          path="/vendor/payment-success"
          element={<VendorPaymentSuccess />}
        />

        {/* VENDOR PROFILE */}

        <Route path="/vendor/profile" element={<VendorProfile />} />

        {/* VENDOR BOOKINGS */}

        <Route path="/vendor/bookings" element={<VendorBookings />} />

        {/* =====================================
            USER PROFILE
        ===================================== */}

        <Route path="/profile" element={<Profile />} />

        {/* =====================================
            LEGACY REDIRECTS
        ===================================== */}

        <Route
          path="/login"
          element={<Navigate to="/vendor/login" replace />}
        />

        <Route path="/organiser/login" element={<OrganiserLogin />} />

        {/* =====================================
            404 PAGE
        ===================================== */}

        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* GLOBAL FOOTER */}

      <Footer />
    </div>
  );
}

// ==========================================
// MAIN APP
// ==========================================

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
