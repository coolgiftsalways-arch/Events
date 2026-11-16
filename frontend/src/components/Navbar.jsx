import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  Globe,
  ChevronDown,
  Menu,
  X,
  Tent,
  CalendarDays,
  Store,
  LayoutDashboard,
  UserRound,
  Plus,
  Image,
  Crown,
  LogOut,
  Settings,
  CreditCard,
} from "lucide-react";

import { useLanguage } from "../context/LanguageContext";

import "../css/Navbar.css";

const ORGANISER_KEY = "stalloraOrganiser";

export default function Navbar() {
  const { language, changeLanguage, t } = useLanguage();

  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // ==========================================
  // LOAD ORGANISER
  // ==========================================

  const getOrganiser = () => {
    try {
      const saved = localStorage.getItem(ORGANISER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Unable to load organiser:", error);
      return null;
    }
  };

  const [organiser, setOrganiser] = useState(getOrganiser);

  // ==========================================
  // LISTEN FOR PROFILE UPDATES
  // ==========================================

  useEffect(() => {
    const loadOrganiser = () => {
      setOrganiser(getOrganiser());
    };

    loadOrganiser();

    window.addEventListener(
      "stallora:organiser-updated",
      loadOrganiser
    );

    window.addEventListener("storage", loadOrganiser);

    return () => {
      window.removeEventListener(
        "stallora:organiser-updated",
        loadOrganiser
      );

      window.removeEventListener("storage", loadOrganiser);
    };
  }, []);

  // ==========================================
  // CLOSE MENUS WHEN ROUTE CHANGES
  // ==========================================

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
    setLanguageOpen(false);
  }, [location.pathname]);

  // ==========================================
  // CLOSE MENUS WITH ESCAPE KEY
  // ==========================================

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setProfileOpen(false);
        setLanguageOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // ==========================================
  // LANGUAGE
  // ==========================================

  const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" },
    { code: "mr", label: "मराठी" },
  ];

  const currentLanguage =
    languages.find((item) => item.code === language) ||
    languages[0];

  const handleLanguageChange = (code) => {
    changeLanguage(code);
    setLanguageOpen(false);
  };

  // ==========================================
  // ORGANISER DETAILS
  // ==========================================

  const organiserName =
    organiser?.company ||
    organiser?.name ||
    "Organiser";

  const username =
    organiser?.username ||
    "organiser";

  const membership =
    organiser?.membershipName ||
    organiser?.planName ||
    (organiser?.membership === "gold" ? "Gold" : "Silver");

  const membershipStatus =
    organiser?.membershipStatus || "pending_payment";

  const initials = organiserName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "O";

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to log out?"
    );

    if (!confirmed) return;

    localStorage.removeItem(ORGANISER_KEY);
    localStorage.removeItem("stalloraSelectedPlan");
    localStorage.removeItem("stalloraPendingOrganiser");

    setOrganiser(null);

    setProfileOpen(false);
    setMobileOpen(false);
    setLanguageOpen(false);

    window.dispatchEvent(
      new Event("stallora:organiser-updated")
    );

    navigate("/");
  };

  // ==========================================
  // ORGANISER PROFILE MENU
  // ==========================================

  const OrganiserProfileMenu = ({ mobile = false }) => (
    <div
      className={
        mobile
          ? "st-mobile-profile"
          : "st-profile-dropdown"
      }
    >
      {/* ORGANISER DETAILS */}

      <div className="st-dropdown-user">

        <div className="st-dropdown-avatar">
          {organiser?.profileImage ? (
            <img
              src={organiser.profileImage}
              alt={`${organiserName} profile`}
            />
          ) : (
            initials
          )}
        </div>

        <div className="st-dropdown-user-info">

          <strong>{organiserName}</strong>

          <span>@{username}</span>

          <small className={membership.toLowerCase()}>
            <Crown size={12} />
            {membership} Member
          </small>

          {membershipStatus !== "active" && (
            <small className="st-membership-pending">
              Payment verification pending
            </small>
          )}

        </div>
      </div>

      <div className="st-dropdown-divider" />

      {/* PROFILE */}

      <Link
        to="/organiser/profile"
        className="st-dropdown-link"
      >
        <UserRound size={17} />
        My Profile
      </Link>

      {/* DASHBOARD */}

      <Link
        to="/organiser/dashboard"
        className="st-dropdown-link"
      >
        <LayoutDashboard size={17} />
        My Dashboard
      </Link>

      {/* CREATE EVENT */}

      <Link
        to="/organiser/create-event"
        className="st-dropdown-link"
      >
        <Plus size={17} />
        Create Event
      </Link>

      {/* POSTS */}

      <Link
        to="/organiser/dashboard"
        className="st-dropdown-link"
      >
        <Image size={17} />
        My Posts
      </Link>

      {/* MEMBERSHIP */}

      <Link
        to="/organiser/membership"
        className="st-dropdown-link"
      >
        <CreditCard size={17} />
        Membership
      </Link>

      {/* EDIT PROFILE */}

      <Link
        to="/organiser/profile"
        className="st-dropdown-link"
      >
        <Settings size={17} />
        Edit Profile
      </Link>

      <div className="st-dropdown-divider" />

      {/* LOGOUT */}

      <button
        type="button"
        className="st-dropdown-logout"
        onClick={handleLogout}
      >
        <LogOut size={17} />
        Logout
      </button>

    </div>
  );

  // ==========================================
  // NAVBAR
  // ==========================================

  return (
    <header className="st-navbar">

      <div className="st-navbar-container">

        {/* ==================================
            LOGO
        ================================== */}

        <Link
          to="/"
          className="st-logo"
          aria-label="STALLORA Home"
        >
          <span className="st-logo-symbol">
            <Tent size={39} strokeWidth={2.5} />
          </span>

          <span className="st-logo-text">
            Stallora<span>✦</span>
          </span>
        </Link>

        {/* ==================================
            DESKTOP NAVIGATION
        ================================== */}

        <nav className="st-desktop-nav">

          <Link
            to="/"
            className={
              location.pathname === "/" ? "active" : ""
            }
          >
            {t.navbar.home}
          </Link>

          <Link
            to="/vendors"
            className={
              location.pathname === "/vendors"
                ? "active"
                : ""
            }
          >
            Explore Events
          </Link>

          <Link
            to="/about"
            className={
              location.pathname === "/about"
                ? "active"
                : ""
            }
          >
            {t.navbar.about}
          </Link>

        </nav>

        {/* ==================================
            DESKTOP ACTIONS
        ================================== */}

        <div className="st-navbar-actions">

          {!organiser ? (

            <>
              <Link
                to="/organiser/membership"
                className="st-organiser-button"
              >
                <CalendarDays size={17} />
                Organise an Event
              </Link>

              <Link
                to="/vendor/login"
                className="st-vendor-button"
              >
                <Store size={17} />
                Book a Stall
              </Link>
            </>

          ) : (

            <div className="st-profile-wrapper">

              <button
                type="button"
                className="st-profile-trigger"
                onClick={() => {
                  setProfileOpen((previous) => !previous);
                  setLanguageOpen(false);
                }}
                aria-expanded={profileOpen}
                aria-label="Open organiser menu"
              >

                <span className="st-navbar-avatar">

                  {organiser.profileImage ? (
                    <img
                      src={organiser.profileImage}
                      alt={organiserName}
                    />
                  ) : (
                    initials
                  )}

                </span>

                <span className="st-navbar-profile-name">
                  {organiserName}
                </span>

                <ChevronDown
                  size={16}
                  className={profileOpen ? "rotated" : ""}
                />

              </button>

              {profileOpen && <OrganiserProfileMenu />}

            </div>

          )}

          {/* ==================================
              LANGUAGE SELECTOR
          ================================== */}

          <div className="st-language-wrapper">

            <button
              type="button"
              className="st-language-button"
              onClick={() => {
                setLanguageOpen((previous) => !previous);
                setProfileOpen(false);
              }}
              aria-expanded={languageOpen}
              aria-label="Select language"
            >

              <Globe size={19} />

              <span>{currentLanguage.label}</span>

              <ChevronDown
                size={15}
                className={languageOpen ? "rotated" : ""}
              />

            </button>

            {languageOpen && (

              <div className="st-language-dropdown">

                {languages.map((item) => (

                  <button
                    type="button"
                    key={item.code}
                    className={
                      language === item.code ? "active" : ""
                    }
                    onClick={() =>
                      handleLanguageChange(item.code)
                    }
                  >

                    {item.label}

                    {language === item.code && (
                      <span>✓</span>
                    )}

                  </button>

                ))}

              </div>

            )}

          </div>

        </div>

        {/* ==================================
            MOBILE MENU BUTTON
        ================================== */}

        <button
          type="button"
          className="st-mobile-toggle"
          onClick={() =>
            setMobileOpen((previous) => !previous)
          }
          aria-label={
            mobileOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X size={25} />
          ) : (
            <Menu size={25} />
          )}
        </button>

      </div>

      {/* ==================================
          MOBILE NAVIGATION
      ================================== */}

      {mobileOpen && (

        <div className="st-mobile-menu">

          <Link to="/">
            {t.navbar.home}
          </Link>

          <Link to="/vendors">
            Explore Events
          </Link>

          <Link to="/about">
            {t.navbar.about}
          </Link>

          <div className="st-mobile-divider" />

          {!organiser ? (

            <>

              <Link
                to="/organiser/membership"
                className="st-mobile-organiser"
              >
                <CalendarDays size={18} />
                Organise an Event
              </Link>

              <Link
                to="/vendor/login"
                className="st-mobile-vendor"
              >
                <Store size={18} />
                Book a Stall
              </Link>

            </>

          ) : (

            <OrganiserProfileMenu mobile />

          )}

          {/* MOBILE LANGUAGE */}

          <div className="st-mobile-language">

            <Globe size={18} />

            <select
              value={language}
              onChange={(e) =>
                handleLanguageChange(e.target.value)
              }
              aria-label="Select language"
            >

              {languages.map((item) => (

                <option
                  key={item.code}
                  value={item.code}
                >
                  {item.label}
                </option>

              ))}

            </select>

          </div>

        </div>

      )}

    </header>
  );
}
