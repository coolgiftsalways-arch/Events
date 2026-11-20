import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import {
  Menu,
  X,
  Store,
  User,
  LogOut,
  ChevronDown,
  Globe,
  CalendarDays,
  LayoutDashboard,
  Settings,
} from "lucide-react";

import "../css/Navbar.css";
import { logout } from "../services/api";

export default function Navbar() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  const [user, setUser] = useState(null);
  const [organiser, setOrganiser] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [vendorMembership, setVendorMembership] = useState(null);

  const [language, setLanguage] = useState("English");

  // LOAD ACCOUNTS
  const loadAccounts = () => {
    try {
      const savedUser =
        localStorage.getItem("user") || localStorage.getItem("stalloraUser");

      const savedOrganiser = localStorage.getItem("stalloraOrganiser");

      const savedVendor = localStorage.getItem("stalloraVendor");

      const vendorLoggedIn =
        localStorage.getItem("stalloraVendorSession") === "true";

      setUser(savedUser ? JSON.parse(savedUser) : null);

      setOrganiser(savedOrganiser ? JSON.parse(savedOrganiser) : null);

      setVendor(vendorLoggedIn && savedVendor ? JSON.parse(savedVendor) : null);

      const savedMembership = localStorage.getItem("stalloraVendorMembership");

      if (vendorLoggedIn && savedMembership) {
        const membership = JSON.parse(savedMembership);

        const active =
          membership.status === "active" &&
          new Date(membership.expiresAt) > new Date();

        setVendorMembership(active ? membership : null);
      } else {
        setVendorMembership(null);
      }
    } catch (error) {
      console.error("Navbar account error:", error);
      setUser(null);
      setOrganiser(null);
      setVendor(null);
      setVendorMembership(null);
    }
  };

  useEffect(() => {
    loadAccounts();

    window.addEventListener("storage", loadAccounts);
    window.addEventListener("stallora-user-updated", loadAccounts);
    window.addEventListener("stallora-vendor-updated", loadAccounts);

    return () => {
      window.removeEventListener("storage", loadAccounts);
      window.removeEventListener("stallora-user-updated", loadAccounts);
      window.removeEventListener("stallora-vendor-updated", loadAccounts);
    };
  }, []);

  // LANGUAGE
  useEffect(() => {
    const saved = localStorage.getItem("stalloraLanguage");
    if (saved) setLanguage(saved);
  }, []);

  const changeLanguage = (value) => {
    setLanguage(value);
    localStorage.setItem("stalloraLanguage", value);
    setLanguageOpen(false);
  };

  // ACCOUNT TYPE
  const accountType = vendor
    ? "vendor"
    : organiser
      ? "organiser"
      : user
        ? "user"
        : null;

  const currentUser =
    accountType === "vendor"
      ? vendor
      : accountType === "organiser"
        ? organiser
        : user;

  const isLoggedIn = Boolean(currentUser);

  const userName =
    currentUser?.name ||
    currentUser?.fullName ||
    currentUser?.organiserName ||
    "My Account";

  const userEmail = currentUser?.email || "";

  const profileImage =
    currentUser?.profileImage ||
    currentUser?.avatar ||
    currentUser?.image ||
    "";

  const profileInitial = userName.charAt(0).toUpperCase();

  // CLOSE MENUS
  const closeMenu = () => {
    setMenuOpen(false);
    setProfileOpen(false);
    setLanguageOpen(false);
  };

  // LOGOUT
  const handleLogout = () => {
    if (accountType === "vendor") {
      logout("vendor");

      setVendor(null);
      setVendorMembership(null);

      window.dispatchEvent(new Event("stallora-vendor-updated"));

      closeMenu();
      navigate("/vendor/login");
      return;
    }

    if (accountType === "organiser") {
      logout("organiser");
      setOrganiser(null);

      closeMenu();
      navigate("/organiser/login");
      return;
    }

    localStorage.removeItem("user");
    localStorage.removeItem("stalloraUser");

    setUser(null);

    closeMenu();
    navigate("/login");
  };

  // NAV LINKS
  const navItems = [
    { label: "Home", path: "/" },
    { label: "Explore Events", path: "/events" },
    { label: "About", path: "/about" },
  ];

  // MEMBERSHIP LABEL
  const membershipLabel = () => {
    if (accountType === "vendor") {
      return vendorMembership ? (
        <small className="gold">
          {vendorMembership.name?.toUpperCase()} MEMBERSHIP
        </small>
      ) : (
        <small className="st-membership-pending">Membership not active</small>
      );
    }

    if (accountType === "organiser") {
      const plan = String(
        currentUser?.membership ||
          currentUser?.membershipName ||
          currentUser?.planName ||
          "",
      ).toLowerCase();

      const status = String(
        currentUser?.membershipStatus || currentUser?.membership_status || "",
      ).toLowerCase();

      const verified =
        currentUser?.paymentVerified === true ||
        currentUser?.isPaymentVerified === true;

      if (
        ["silver", "gold"].includes(plan) &&
        status === "active" &&
        verified
      ) {
        return <small className={plan}>{plan.toUpperCase()} PLAN</small>;
      }

      return (
        <small className="st-membership-pending">
          Membership payment pending
        </small>
      );
    }

    return null;
  };

  return (
    <header className="st-navbar">
      <div className="st-navbar-container">
        {/* LOGO */}
        <Link to="/" className="st-logo" onClick={closeMenu}>
          <span className="st-logo-symbol">
            <svg
              width="43"
              height="43"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 39L24 8L40 39H8Z"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <path
                d="M16 39L24 24L32 39"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </span>

          <span className="st-logo-text">
            Stallora<span>✦</span>
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="st-desktop-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMenu}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {item.label}
            </NavLink>
          ))}

          {/* ORGANISER STALL REQUESTS */}
          <NavLink
            to="/organiser/stall-requests"
            onClick={closeMenu}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <Store size={17} />
            Stall Requests
          </NavLink>

          {/* VENDOR BROWSE STALLS - ALWAYS VISIBLE */}
          <NavLink
            to="/vendor/stalls"
            onClick={closeMenu}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <Store size={17} />
            Browse Stalls
          </NavLink>
        </nav>

        {/* ACTIONS */}
        <div className="st-navbar-actions">
          <Link
            to="/organiser/register"
            className="st-organiser-button"
            onClick={closeMenu}
          >
            <CalendarDays size={18} />
            Organise an Event
          </Link>

          {/* LANGUAGE */}
          <div className="st-language-wrapper">
            <button
              type="button"
              className="st-language-button"
              onClick={() => setLanguageOpen(!languageOpen)}
            >
              <Globe size={19} />
              {language}
              <ChevronDown size={15} />
            </button>

            {languageOpen && (
              <div className="st-language-dropdown">
                {["English", "Hindi", "Marathi"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={language === item ? "active" : ""}
                    onClick={() => changeLanguage(item)}
                  >
                    {item}
                    {language === item && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PROFILE */}
          {isLoggedIn && (
            <div className="st-profile-wrapper">
              <button
                type="button"
                className="st-profile-trigger"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <span className="st-navbar-avatar">
                  {profileImage ? (
                    <img src={profileImage} alt={userName} />
                  ) : (
                    profileInitial
                  )}
                </span>

                <span className="st-navbar-profile-name">{userName}</span>

                <ChevronDown size={16} />
              </button>

              {profileOpen && (
                <div className="st-profile-dropdown">
                  <div className="st-dropdown-user">
                    <div className="st-dropdown-avatar">
                      {profileImage ? (
                        <img src={profileImage} alt={userName} />
                      ) : (
                        profileInitial
                      )}
                    </div>

                    <div className="st-dropdown-user-info">
                      <strong>{userName}</strong>
                      <span>{userEmail}</span>
                      {membershipLabel()}
                    </div>
                  </div>

                  <div className="st-dropdown-divider" />

                  {/* VENDOR LINKS */}
                  {accountType === "vendor" && (
                    <>
                      <Link
                        to="/vendor/stalls"
                        className="st-dropdown-link"
                        onClick={closeMenu}
                      >
                        <Store size={17} />
                        Browse Stalls
                      </Link>

                      <Link
                        to="/vendor/profile"
                        className="st-dropdown-link"
                        onClick={closeMenu}
                      >
                        <User size={17} />
                        My Profile
                      </Link>

                      <Link
                        to="/vendor/bookings"
                        className="st-dropdown-link"
                        onClick={closeMenu}
                      >
                        <LayoutDashboard size={17} />
                        My Bookings
                      </Link>

                      {!vendorMembership && (
                        <Link
                          to="/vendor/membership"
                          className="st-dropdown-link"
                          onClick={closeMenu}
                        >
                          <Settings size={17} />
                          Get Membership
                        </Link>
                      )}
                    </>
                  )}

                  {/* ORGANISER LINKS */}
                  {accountType === "organiser" && (
                    <>
                      <Link
                        to="/organiser/dashboard"
                        className="st-dropdown-link"
                        onClick={closeMenu}
                      >
                        <LayoutDashboard size={17} />
                        Dashboard
                      </Link>

                      <Link
                        to="/organiser/stall-requests"
                        className="st-dropdown-link"
                        onClick={closeMenu}
                      >
                        <Store size={17} />
                        Stall Requests
                      </Link>

                      <Link
                        to="/organiser/profile"
                        className="st-dropdown-link"
                        onClick={closeMenu}
                      >
                        <Settings size={17} />
                        My Profile
                      </Link>
                    </>
                  )}

                  {/* NORMAL USER */}
                  {accountType === "user" && (
                    <Link
                      to="/profile"
                      className="st-dropdown-link"
                      onClick={closeMenu}
                    >
                      <User size={17} />
                      My Profile
                    </Link>
                  )}

                  <div className="st-dropdown-divider" />

                  <button
                    type="button"
                    className="st-dropdown-logout"
                    onClick={handleLogout}
                  >
                    <LogOut size={17} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MOBILE BUTTON */}
        <button
          type="button"
          className="st-mobile-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="st-mobile-menu">
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} onClick={closeMenu}>
                {item.label}
              </NavLink>
            ))}

            <div className="st-mobile-divider" />

            <NavLink
              to="/organiser/stall-requests"
              className="st-mobile-organiser"
              onClick={closeMenu}
            >
              <Store size={18} />
              Stall Requests
            </NavLink>

            {/* BROWSE STALLS ALWAYS VISIBLE ON MOBILE */}
            <NavLink
              to="/vendor/stalls"
              className="st-mobile-vendor"
              onClick={closeMenu}
            >
              <Store size={18} />
              Browse Stalls
            </NavLink>

            <Link
              to="/organiser/register"
              className="st-mobile-organiser"
              onClick={closeMenu}
            >
              <CalendarDays size={18} />
              Organise an Event
            </Link>

            {isLoggedIn && (
              <div className="st-mobile-profile">
                <div className="st-dropdown-user">
                  <div className="st-dropdown-avatar">{profileInitial}</div>

                  <div className="st-dropdown-user-info">
                    <strong>{userName}</strong>
                    <span>{userEmail}</span>
                    {membershipLabel()}
                  </div>
                </div>

                <div className="st-dropdown-divider" />

                {accountType === "vendor" && (
                  <>
                    <Link
                      to="/vendor/profile"
                      className="st-dropdown-link"
                      onClick={closeMenu}
                    >
                      <User size={17} />
                      My Profile
                    </Link>

                    <Link
                      to="/vendor/bookings"
                      className="st-dropdown-link"
                      onClick={closeMenu}
                    >
                      <LayoutDashboard size={17} />
                      My Bookings
                    </Link>

                    {!vendorMembership && (
                      <Link
                        to="/vendor/membership"
                        className="st-dropdown-link"
                        onClick={closeMenu}
                      >
                        <Settings size={17} />
                        Get Membership
                      </Link>
                    )}
                  </>
                )}

                {accountType === "organiser" && (
                  <>
                    <Link
                      to="/organiser/dashboard"
                      className="st-dropdown-link"
                      onClick={closeMenu}
                    >
                      <LayoutDashboard size={17} />
                      Dashboard
                    </Link>

                    <Link
                      to="/organiser/profile"
                      className="st-dropdown-link"
                      onClick={closeMenu}
                    >
                      <User size={17} />
                      My Profile
                    </Link>
                  </>
                )}

                {accountType === "user" && (
                  <Link
                    to="/profile"
                    className="st-dropdown-link"
                    onClick={closeMenu}
                  >
                    <User size={17} />
                    My Profile
                  </Link>
                )}

                <button
                  type="button"
                  className="st-dropdown-logout"
                  onClick={handleLogout}
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </div>
            )}

            <div className="st-mobile-language">
              <Globe size={18} />
              <select
                value={language}
                onChange={(event) => changeLanguage(event.target.value)}
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Marathi">Marathi</option>
              </select>
            </div>

            {!isLoggedIn && (
              <>
                <Link
                  to="/vendor/login"
                  className="st-dropdown-link"
                  onClick={closeMenu}
                >
                  <User size={17} />
                  Vendor Login
                </Link>

                <Link
                  to="/vendor/register"
                  className="st-dropdown-link"
                  onClick={closeMenu}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
