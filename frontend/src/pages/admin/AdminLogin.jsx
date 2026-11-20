import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import { API } from "../../api";
import { getToken, setToken } from "../../admin/adminApi";
import "../../css/Admin.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (getToken()) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Login failed");
      setToken(data.token);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="adm adm-login">
      <form className="adm-login-card" onSubmit={submit}>
        <div className="adm-login-icon">
          <Lock size={22} />
        </div>
        <h1>Stallora Admin</h1>
        <p className="adm-muted">Sign in to manage memberships.</p>

        <label className="adm-field">
          <span>Email</span>
          <input type="email" autoComplete="username" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>

        <label className="adm-field">
          <span>Password</span>
          <div className="adm-pass">
            <input type={show ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>

        {error && <p className="adm-error" role="alert">{error}</p>}

        <button className="adm-btn adm-btn-primary adm-btn-block" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="adm-hint">Stays signed in on this device for 7 days.</p>
      </form>
    </main>
  );
}
