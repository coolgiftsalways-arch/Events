import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { API } from "../api";

// Shows QR + button for the Razorpay subscription page and waits until it's active.
export default function SubscriptionPayment({ sub, plan, onPaid, onCancel }) {
  const [checking, setChecking] = useState(false);

  const check = async () => {
    const res = await fetch(`${API}/subscriptions/${sub.id}/status`);
    const data = await res.json();
    if (["authenticated", "active"].includes(data.status)) onPaid(data);
  };

  useEffect(() => {
    const id = setInterval(() => check().catch(() => {}), 4000);
    return () => clearInterval(id);
  }, [sub.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const price = `₹${plan.price.toLocaleString("en-IN")} / ${plan.period}`;

  return (
    <div className="om-pay">
      <h2>{plan.name} — {price}</h2>
      <p>Scan with your phone camera to open the payment page and approve the AutoPay mandate. You'll be charged {price} automatically. Cancel anytime from your dashboard.</p>
      <div className="om-pay-qr">
        <QRCodeSVG value={sub.shortUrl} size={220} level="M" marginSize={2} />
      </div>
      <a className="om-primary-button" href={sub.shortUrl} target="_blank" rel="noreferrer">
        Pay with Razorpay
      </a>
      <p>Waiting for payment… this page updates automatically.</p>
      <div className="om-pay-links">
        <button type="button" disabled={checking}
          onClick={async () => { setChecking(true); try { await check(); } finally { setChecking(false); } }}>
          {checking ? "Checking…" : "I've paid — check now"}
        </button>
        <button type="button" onClick={onCancel}>← Change plan</button>
      </div>
    </div>
  );
}
