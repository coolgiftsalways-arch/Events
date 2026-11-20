import { useEffect } from "react";
import { API } from "../api";
import QrPayCard from "./QrPayCard";

// Razorpay subscription (membership) payment: QR + button, waits until it's active.
export default function SubscriptionPayment({ sub, plan, onPaid, onCancel }) {
  const check = async () => {
    const res = await fetch(`${API}/subscriptions/${sub.id}/status`);
    const data = await res.json();
    if (["authenticated", "active"].includes(data.status)) onPaid(data);
  };

  useEffect(() => {
    const id = setInterval(() => check().catch(() => {}), 4000);
    return () => clearInterval(id);
  }, [sub.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <QrPayCard
      eyebrow="MEMBERSHIP · AUTOPAY"
      title={`${plan.name} membership`}
      subtitle="Approve the AutoPay mandate once — renewals happen automatically. Cancel anytime from your profile."
      amount={plan.price}
      period={`/ ${plan.period}`}
      url={sub.shortUrl}
      onCheck={() => check().catch(() => {})}
      onBack={onCancel}
      backLabel="Change plan"
      fileName={`stallora-${String(plan.name).toLowerCase()}-membership-qr`}
      steps={["Scan the QR or tap Pay", "Approve AutoPay in your UPI app (or use a card)", "This page confirms automatically"]}
    />
  );
}
