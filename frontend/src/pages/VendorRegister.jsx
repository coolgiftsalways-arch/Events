import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/VendorFlow.css";

export default function VendorRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
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

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    const existing = JSON.parse(
      localStorage.getItem("stalloraVendor") || "null",
    );

    if (existing?.email?.toLowerCase() === form.email.trim().toLowerCase()) {
      setError("An account with this email already exists. Please log in.");
      return;
    }

    const vendor = {
      id: `vendor_${Date.now()}`,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      password: form.password,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("stalloraVendor", JSON.stringify(vendor));

    localStorage.setItem("stalloraVendorSession", "true");

    window.dispatchEvent(new Event("stallora-vendor-updated"));

    navigate("/vendor/stalls");
  };

  return (
    <main className="vf-page vf-auth-page">
      {/* LEFT SECTION */}

      <section className="vf-auth-visual">
        <span className="vf-eyebrow">JOIN THE STALLORA COMMUNITY</span>

        <h1>
          Make your brand
          <br />
          part of the <em>event.</em>
        </h1>

        <p>
          Create your vendor account and find the right spaces to meet your
          customers.
        </p>

        <div className="vf-visual-stat">
          <strong>One account.</strong>
          <span>More opportunities to grow.</span>
        </div>
      </section>

      {/* RIGHT SECTION */}

      <section className="vf-auth-card">
        <div className="vf-card-kicker">GET STARTED</div>

        <h2>Create vendor account</h2>

        <p className="vf-muted">Enter your details to get started.</p>

        <form onSubmit={handleSubmit} className="vf-form">
          <label>
            Full name
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              autoComplete="name"
              required
            />
          </label>

          <label>
            Email address
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Mobile number
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="Your mobile number"
              autoComplete="tel"
              required
            />
          </label>

          <div className="vf-form-row">
            <label>
              Password
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                required
              />
            </label>

            <label>
              Confirm password
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                autoComplete="new-password"
                required
              />
            </label>
          </div>

          {error && (
            <div className="vf-error" role="alert">
              {error}
            </div>
          )}

          <button className="vf-button vf-button-primary" type="submit">
            Create account
          </button>
        </form>

        <p className="vf-auth-switch">
          Already registered? <Link to="/vendor/login">Login</Link>
        </p>

        <Link className="vf-back-link" to="/">
          ← Back to home
        </Link>

        <p className="vf-demo-note">
          Prototype only: do not use a real password until backend
          authentication is connected.
        </p>
      </section>
    </main>
  );
}
