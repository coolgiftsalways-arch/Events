import { useEffect } from "react";

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

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
import OrganiserProfile from "./pages/OrganiserProfile";
import OrganiserDashboard from "./pages/OrganiserDashboard";
import CreateEvent from "./pages/CreateEvent";
import CreatePost from "./pages/CreatePost";

// ==========================================
// GLOBAL CSS
// ==========================================

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

  // Scroll to top whenever the route changes.
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
// PAGE NOT FOUND
// ==========================================

function NotFound() {
  return (
    <main
      style={{
        minHeight: "65vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
        textAlign: "center",
      }}
    >
      <h1>404</h1>

      <h2>Page not found</h2>

      <p>The page you're looking for doesn't exist.</p>

      <a
        href="/"
        style={{
          marginTop: "20px",
          padding: "13px 25px",
          borderRadius: "30px",
          background: "#7439a6",
          color: "#fff",
          textDecoration: "none",
        }}
      >
        Back to Home
      </a>
    </main>
  );
}

// ==========================================
// APP LAYOUT
// ==========================================

function AppLayout() {
  return (
    <div className="app">
      {/* SMOOTH SCROLL */}

      <SmoothScroll />

      {/* NAVBAR */}

      <Navbar />

      {/* APPLICATION ROUTES */}

      <Routes>
        {/* HOME */}

        <Route path="/" element={<Home />} />

        {/* EVENTS / VENDORS */}

        <Route path="/vendors" element={<Vendors />} />

        {/* ABOUT */}

        <Route path="/about" element={<About />} />

        {/* EVENT DETAILS */}

        <Route path="/event/:eventId" element={<EventDetails />} />

        {/* STALL BOOKING */}

        <Route path="/book/:eventId" element={<Booking />} />

        {/* ==================================
             ORGANISER ROUTES
        ================================== */}

        {/* ORGANISER MEMBERSHIP */}

        <Route path="/organiser/membership" element={<OrganiserMembership />} />

        {/* ORGANISER REGISTRATION */}

        <Route path="/organiser/register" element={<OrganiserRegister />} />

        {/* ORGANISER PROFILE */}

        <Route path="/organiser/profile" element={<OrganiserProfile />} />

        {/* ORGANISER DASHBOARD */}

        <Route path="/organiser/dashboard" element={<OrganiserDashboard />} />

        {/* CREATE EVENT */}

        <Route path="/organiser/create-event" element={<CreateEvent />} />

        {/* CREATE POST */}

        <Route path="/organiser/create-post" element={<CreatePost />} />

        {/* FUTURE ORGANISER LOGIN ROUTE */}

        {/* Add OrganiserLogin here when its page is created. */}

        {/* ==================================
             FALLBACK
        ================================== */}

        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* FOOTER */}

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
