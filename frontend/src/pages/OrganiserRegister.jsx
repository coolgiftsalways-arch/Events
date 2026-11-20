
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  UserRound,
  Building2,
  Mail,
  Phone,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  CalendarDays,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import { register } from "../services/api";
import "../css/OrganiserAuth.css";

// ==========================================
// INITIAL FORM
// ==========================================

const initialForm = {
  name: "",
  company: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

// ==========================================
// ORGANISER REGISTRATION
// ==========================================

export default function OrganiserRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // ==========================================
  // HANDLE INPUT CHANGES
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const digits = value.replace(/\D/g, "").slice(0, 10);

      setForm((previous) => ({
        ...previous,
        phone: digits,
      }));
    } else {
      setForm((previous) => ({
        ...previous,
        [name]: value,
      }));
    }

    setError("");
  };

  // ==========================================
  // FORM VALIDATION
  // ==========================================

  const validateForm = () => {
    if (
      !form.name.trim() ||
      !form.company.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      return "Please complete all required fields.";
    }

    const cleanEmail = form.email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return "Please enter a valid email address.";
    }

    if (!/^\d{10}$/.test(form.phone)) {
      return "Please enter a valid 10-digit mobile number.";
    }

    if (form.password.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (form.password !== form.confirmPassword) {
      return "Passwords do not match.";
    }

    if (!acceptedTerms) {
      return "Please accept the Terms and Conditions.";
    }

    return null;
  };

  // ==========================================
  // SUBMIT REGISTRATION
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const cleanEmail = form.email.trim().toLowerCase();

      // Create the organiser account (password is stored securely on the server)
      await register("organiser", {
        name: form.name.trim(),
        company: form.company.trim(),
        email: cleanEmail,
        phone: form.phone,
        password: form.password,
      });

      // Details for the membership step
      localStorage.setItem(
        "stalloraPendingOrganiser",
        JSON.stringify({
          name: form.name.trim(),
          company: form.company.trim(),
          email: cleanEmail,
          phone: form.phone,
        }),
      );

      navigate("/organiser/membership");
    } catch (err) {
      console.error("Organiser registration error:", err);
      setError(err.message || "Unable to create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // PAGE UI
  // ==========================================

  return (
    <main className="oa-page">
      <div className="oa-container">

        {/* ==================================
            LEFT SIDE
        ================================== */}

        <section className="oa-visual">

          <Link to="/" className="oa-logo">
            <span className="oa-logo-symbol">△</span>
            STALLORA
            <span className="oa-logo-star">✦</span>
          </Link>

          <div className="oa-visual-content">

            <span className="oa-eyebrow">
              <Sparkles size={15} />
              FOR EVENT ORGANISERS
            </span>

            <h1>
              Your events.
              <br />
              <span>Your community.</span>
              <br />
              Your stage.
            </h1>

            <p>
              Bring your ideas to life. Create unforgettable
              events, showcase your experiences and connect
              with vendors across STALLORA.
            </p>

            <div className="oa-benefits">

              <div>
                <span>
                  <CheckCircle2 size={17} />
                </span>
                Create and promote your events
              </div>

              <div>
                <span>
                  <CheckCircle2 size={17} />
                </span>
                Publish event photos and videos
              </div>

              <div>
                <span>
                  <CheckCircle2 size={17} />
                </span>
                Manage stall availability and pricing
              </div>

              <div>
                <span>
                  <CheckCircle2 size={17} />
                </span>
                Receive and manage vendor bookings
              </div>

            </div>
          </div>

          <div className="oa-visual-bottom">

            <div className="oa-visual-icon">
              <CalendarDays size={21} />
            </div>

            <div>
              <strong>
                Make your next event happen.
              </strong>

              <span>
                Everything starts with your account.
              </span>
            </div>

          </div>

          <div className="oa-decoration oa-decoration-one" />
          <div className="oa-decoration oa-decoration-two" />

        </section>

        {/* ==================================
            RIGHT SIDE
        ================================== */}

        <section className="oa-form-section">

          {/* MOBILE LOGO */}

          <div className="oa-mobile-logo">
            <Link to="/" className="oa-logo">
              <span className="oa-logo-symbol">△</span>
              STALLORA
              <span className="oa-logo-star">✦</span>
            </Link>
          </div>

          {/* FORM HEADING */}

          <div className="oa-form-heading">

            <span className="oa-step-label">
              ORGANISER REGISTRATION · STEP 01
            </span>

            <h2>Create your account</h2>

            <p>
              Join STALLORA and start building your event business.
            </p>

          </div>

          {/* ERROR MESSAGE */}

          {error && (
            <div
              className="oa-error-message"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* REGISTRATION FORM */}

          <form
            onSubmit={handleSubmit}
            className="oa-form"
          >

            {/* FULL NAME */}

            <div className="oa-field">

              <label htmlFor="name">
                Full Name
              </label>

              <div className="oa-input-wrap">

                <UserRound size={18} />

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />

              </div>
            </div>

            {/* COMPANY NAME */}

            <div className="oa-field">

              <label htmlFor="company">
                Organiser / Company Name
              </label>

              <div className="oa-input-wrap">

                <Building2 size={18} />

                <input
                  id="company"
                  name="company"
                  type="text"
                  placeholder="Enter your company name"
                  value={form.company}
                  onChange={handleChange}
                  autoComplete="organization"
                  required
                />

              </div>
            </div>

            {/* EMAIL */}

            <div className="oa-field">

              <label htmlFor="email">
                Email Address
              </label>

              <div className="oa-input-wrap">

                <Mail size={18} />

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />

              </div>
            </div>

            {/* PHONE */}

            <div className="oa-field">

              <label htmlFor="phone">
                Mobile Number
              </label>

              <div className="oa-input-wrap">

                <Phone size={18} />

                <span className="oa-country-code">
                  +91
                </span>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Enter 10-digit number"
                  value={form.phone}
                  onChange={handleChange}
                  autoComplete="tel-national"
                  required
                />

              </div>
            </div>

            {/* PASSWORD */}

            <div className="oa-field">

              <label htmlFor="password">
                Password
              </label>

              <div className="oa-input-wrap">

                <LockKeyhole size={18} />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  className="oa-eye-button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>
            </div>

            {/* CONFIRM PASSWORD */}

            <div className="oa-field">

              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <div className="oa-input-wrap">

                <ShieldCheck size={18} />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showConfirmPassword ? "text" : "password"
                  }
                  placeholder="Enter your password again"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  className="oa-eye-button"
                  onClick={() =>
                    setShowConfirmPassword((previous) => !previous)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>
            </div>

            {/* TERMS AND CONDITIONS */}

            <label className="oa-terms">

              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked);
                  setError("");
                }}
              />

              <span>
                I agree to the{" "}
                <Link to="/terms">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link to="/privacy">
                  Privacy Policy
                </Link>.
              </span>

            </label>

            {/* SUBMIT BUTTON */}

            <button
              type="submit"
              className="oa-submit-button"
              disabled={loading}
            >

              {loading ? (
                "Please wait..."
              ) : (
                <>
                  Create Organiser Account
                  <ArrowRight size={19} />
                </>
              )}

            </button>

          </form>

          {/* LOGIN LINK */}

          <div className="oa-login-link">
            Already have an account?

            <Link to="/organiser/login">
              Log in
            </Link>
          </div>

          {/* SECURITY NOTE */}

          <div className="oa-security-note">

            <ShieldCheck size={16} />

            Your organiser details will be used to set up your
            membership profile.

          </div>

        </section>

      </div>
    </main>
  );
}
