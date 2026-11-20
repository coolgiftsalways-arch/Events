import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { login } from "../services/api";
import "../css/OrganiserAuth.css";

export default function OrganiserLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const { user } = await login("organiser", email.trim().toLowerCase(), password);
      navigate(user.paymentVerified ? "/organiser/dashboard" : "/organiser/membership");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="oa-page">
      <div className="oa-container">
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
              Welcome
              <br />
              <span>back.</span>
            </h1>
            <p>Log in to manage your events, stalls and vendor requests.</p>
          </div>
          <div className="oa-decoration oa-decoration-one" />
          <div className="oa-decoration oa-decoration-two" />
        </section>

        <section className="oa-form-section">
          <div className="oa-mobile-logo">
            <Link to="/" className="oa-logo">
              <span className="oa-logo-symbol">△</span>
              STALLORA
              <span className="oa-logo-star">✦</span>
            </Link>
          </div>

          <div className="oa-form-heading">
            <span className="oa-step-label">ORGANISER LOGIN</span>
            <h2>Log in to your account</h2>
            <p>Use the email and password you registered with.</p>
          </div>

          {error && (
            <div className="oa-error-message" role="alert">
              {error}
            </div>
          )}

          <form className="oa-form" onSubmit={handleSubmit} noValidate>
            <div className="oa-field">
              <label htmlFor="email">Email Address</label>
              <div className="oa-input-wrap">
                <Mail size={18} />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="oa-field">
              <label htmlFor="password">Password</label>
              <div className="oa-input-wrap">
                <Lock size={18} />
                <input
                  id="password"
                  type={show ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="oa-eye-button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="oa-submit-button" disabled={loading}>
              {loading ? (
                "Please wait..."
              ) : (
                <>
                  Log in
                  <ArrowRight size={19} />
                </>
              )}
            </button>
          </form>

          <div className="oa-login-link">
            New to STALLORA? <Link to="/organiser/register">Create an organiser account</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
