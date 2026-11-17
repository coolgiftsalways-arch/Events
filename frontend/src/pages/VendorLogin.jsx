import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/VendorFlow.css";

export default function VendorLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    try {
      const savedVendor = JSON.parse(
        localStorage.getItem("stalloraVendor") || "null",
      );

      if (
        !savedVendor ||
        savedVendor.email.toLowerCase() !== form.email.trim().toLowerCase() ||
        savedVendor.password !== form.password
      ) {
        setError(
          "Email or password is incorrect. Please register if you are new.",
        );
        return;
      }

      localStorage.setItem("stalloraVendorSession", "true");

      window.dispatchEvent(new Event("stallora-vendor-updated"));

      navigate("/vendor/stalls");
    } catch {
      setError("We couldn't sign you in. Please try again.");
    }
  };

  return (
    <main className="vf-page vf-auth-page">
      {/* LEFT SECTION */}

      <section className="vf-auth-visual">
        <span className="vf-eyebrow">WELCOME TO STALLORA</span>

        <h1>
          Your next great
          <br />
          <em>stall opportunity</em>
          <br />
          starts here.
        </h1>

        <p>
          Discover events, showcase your business and connect with new
          customers.
        </p>

        <div className="vf-visual-tags">
          <span>Discover</span>
          <span>Connect</span>
          <span>Grow</span>
        </div>
      </section>

      {/* RIGHT SECTION */}

      <section className="vf-auth-card">
        <div className="vf-card-kicker">VENDOR ACCOUNT</div>

        <h2>Welcome back!</h2>

        <p className="vf-muted">Log in to explore and book event stalls.</p>

        <form onSubmit={handleSubmit} className="vf-form">
          <label>
            Email address
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          {error && (
            <div className="vf-error" role="alert">
              {error}
            </div>
          )}

          <button className="vf-button vf-button-primary" type="submit">
            Login to your account
          </button>
        </form>

        <p className="vf-auth-switch">
          New to Stallora? <Link to="/vendor/register">Create an account</Link>
        </p>

        <Link className="vf-back-link" to="/">
          ← Back to home
        </Link>

        <p className="vf-demo-note">
          Frontend prototype: account details are stored in this browser only.
        </p>
      </section>
    </main>
  );
}
