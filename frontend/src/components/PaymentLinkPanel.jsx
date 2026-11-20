import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import QrPayCard from "./QrPayCard";

// One-time stall booking payment: QR + button, checks every 4s until paid.
export default function PaymentLinkPanel({ booking, onPaid, onCancel }) {
  const [failed, setFailed] = useState(false);

  const check = async () => {
    const data = await apiFetch(`/bookings/${booking.id}/status`);
    if (data.paymentStatus === "paid") onPaid(data);
    else if (data.paymentStatus === "failed") setFailed(true);
  };

  useEffect(() => {
    const id = setInterval(() => check().catch(() => {}), 4000);
    return () => clearInterval(id);
  }, [booking.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const advance = booking.remainingAmount > 0;

  return (
    <QrPayCard
      eyebrow="STALL BOOKING"
      title={`Stall ${booking.stall?.id || ""} · ${booking.eventTitle}`}
      subtitle={
        advance
          ? `Advance payment. Remaining ₹${Number(booking.remainingAmount).toLocaleString("en-IN")} is paid later to the organiser.`
          : "Full payment for your stall."
      }
      amount={booking.amountToPayNow}
      url={booking.paymentUrl}
      failed={failed}
      onCheck={() => check().catch(() => {})}
      onBack={onCancel}
      backLabel="Change details"
      fileName={`stallora-stall-${booking.stall?.id || "booking"}-qr`}
    />
  );
}
