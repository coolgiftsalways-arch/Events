import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/api";
import PasswordInput from "../components/PasswordInput";
import "../css/VendorFlow.css";

export default function VendorLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login("vendor", form.email.trim().toLowerCase(), form.password);
      navigate("/vendor/stalls");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
            <PasswordInput
              name="password"
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

          <button className="vf-button vf-button-primary" type="submit" disabled={loading}>
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
          Your account is saved securely, so you can log in from any device.
        </p>
      </section>
    </main>
  );
}
