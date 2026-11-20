import { useEffect, useState } from "react";
import { API } from "../api";

const LABEL = {
  active: "Active", authenticated: "Starting", cancel_scheduled: "Cancels at period end",
  cancelled: "Cancelled", halted: "Payment failed", pending: "Payment retrying",
  completed: "Completed", created: "Payment pending",
};

const PLAN_LABEL = {
  silver: "Silver (monthly)", gold: "Gold (yearly)",
  basic: "Basic (monthly)", growth: "Growth (every 3 months)", premium: "Premium (yearly)",
};

// Drop <ManageSubscription email={organiser.email} /> into the organiser dashboard/profile.
export default function ManageSubscription({ email, role = "organiser" }) {
  const [sub, setSub] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!email) return;
    fetch(`${API}/subscriptions/by-email/${encodeURIComponent(email)}?role=${role}`)
      .then((r) => r.json()).then(setSub).catch(() => {});
  }, [email]);

  if (!sub) return null;

  const cancel = async () => {
    if (!confirm("Cancel your membership? You keep access until the current period ends.")) return;
    setBusy(true);
    try {
      const r = await fetch(`${API}/subscriptions/${sub.id}/cancel`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setSub(data);
    } catch (e) {
      alert(e.message || "Could not cancel");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="om-manage" style={{ display: "grid", gap: 8, padding: 16, marginTop: 16, border: "1px solid #ddd", borderRadius: 12 }}>
      <strong>{PLAN_LABEL[sub.plan] || sub.plan}</strong> — {LABEL[sub.status] || sub.status}
      {sub.currentEnd && <div>{sub.status === "active" ? "Renews" : "Valid till"}: {new Date(sub.currentEnd).toLocaleDateString("en-IN")}</div>}
      {["active", "authenticated"].includes(sub.status) && (
        <button type="button" onClick={cancel} disabled={busy}>{busy ? "Cancelling…" : "Cancel subscription"}</button>
      )}
    </div>
  );
}
