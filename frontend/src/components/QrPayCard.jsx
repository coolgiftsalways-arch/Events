import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Check, Copy, Download, ExternalLink, QrCode, RefreshCw, Share2, ShieldCheck, Smartphone } from "lucide-react";
import "../css/QrPayCard.css";

const rupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

// Builds a shareable PNG: brand, title, QR, amount
function makePoster(qrCanvas, { title, amount, period }) {
  const W = 1080;
  const H = 1400;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");

  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#7137a8";
  g.fillRect(0, 0, W, 14);

  g.textAlign = "center";
  g.fillStyle = "#7137a8";
  g.font = "800 44px 'DM Sans', Arial, sans-serif";
  g.fillText("STALLORA", W / 2, 110);

  g.fillStyle = "#1d1426";
  g.font = "700 52px 'DM Sans', Arial, sans-serif";
  g.fillText(title.length > 34 ? title.slice(0, 33) + "…" : title, W / 2, 200);

  // QR in a soft frame
  const size = 760;
  const x = (W - size) / 2;
  const y = 260;
  g.fillStyle = "#f6f1fb";
  if (g.roundRect) {
    g.beginPath();
    g.roundRect(x - 40, y - 40, size + 80, size + 80, 40);
    g.fill();
  } else {
    g.fillRect(x - 40, y - 40, size + 80, size + 80);
  }
  g.fillStyle = "#ffffff";
  g.fillRect(x - 10, y - 10, size + 20, size + 20);
  g.drawImage(qrCanvas, x, y, size, size);

  g.fillStyle = "#1d1426";
  g.font = "800 72px 'DM Sans', Arial, sans-serif";
  g.fillText(rupees(amount) + (period ? ` ${period}` : ""), W / 2, 1180);

  g.fillStyle = "#6e6479";
  g.font = "500 34px 'DM Sans', Arial, sans-serif";
  g.fillText("Scan with any UPI app or phone camera to pay", W / 2, 1250);
  g.font = "500 28px 'DM Sans', Arial, sans-serif";
  g.fillText("Secure payment by Razorpay", W / 2, 1310);

  return c.toDataURL("image/png");
}

/**
 * One payment screen for every Razorpay QR we show.
 * props: eyebrow, title, subtitle, amount, period ("/ month"), note, url,
 *        failed, onCheck (async), onBack, backLabel, fileName, steps
 */
export default function QrPayCard({
  eyebrow = "SECURE PAYMENT",
  title,
  subtitle,
  amount,
  period = "",
  note,
  url,
  failed = false,
  onCheck,
  onBack,
  backLabel = "Change details",
  fileName = "stallora-payment-qr",
  steps = ["Scan the QR or tap Pay", "Pay with any UPI app or card", "This page confirms automatically"],
}) {
  const cardRef = useRef(null);
  const qrRef = useRef(null);
  const [checking, setChecking] = useState(false);
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  // Bring the payment card into view as soon as it appears (not the footer)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const el = cardRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top: Math.max(0, top), left: 0, behavior: "instant" });
    });
    return () => cancelAnimationFrame(id);
  }, [url]);

  const download = () => {
    const canvas = qrRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = makePoster(canvas, { title, amount, period });
    a.download = `${fileName}.png`;
    a.click();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this payment link:", url);
    }
  };

  const share = () => navigator.share({ title: `Pay ${rupees(amount)} – ${title}`, url }).catch(() => {});

  const check = async () => {
    setChecking(true);
    try {
      await onCheck?.();
    } finally {
      setChecking(false);
    }
  };

  return (
    <section className="qp" ref={cardRef}>
      <div className="qp-card">
        {/* LEFT: QR */}
        <div className="qp-qr-side">
          <div className="qp-qr-frame">
            {failed ? (
              <div className="qp-qr-expired">
                <QrCode size={40} />
                <span>This QR has expired</span>
              </div>
            ) : (
              <QRCodeSVG value={url} size={232} level="M" marginSize={1} fgColor="#1d1426" />
            )}
          </div>
          <p className="qp-qr-caption">
            <Smartphone size={15} /> Scan with any UPI app
          </p>

          {!failed && (
            <div className="qp-tools">
              <button type="button" onClick={download}>
                <Download size={16} /> Download QR
              </button>
              <button type="button" onClick={copy}>
                {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy link"}
              </button>
              {canShare && (
                <button type="button" onClick={share}>
                  <Share2 size={16} /> Share
                </button>
              )}
            </div>
          )}

          {/* hidden high-res QR used for the download */}
          <QRCodeCanvas ref={qrRef} value={url || " "} size={1024} level="M" marginSize={1} fgColor="#1d1426" style={{ display: "none" }} />
        </div>

        {/* RIGHT: details */}
        <div className="qp-info">
          <span className="qp-eyebrow">{eyebrow}</span>
          <h2 className="qp-title">{title}</h2>
          {subtitle && <p className="qp-sub">{subtitle}</p>}

          <div className="qp-amount">
            {rupees(amount)}
            {period && <small> {period}</small>}
          </div>
          {note && <p className="qp-note">{note}</p>}

          {failed ? (
            <p className="qp-error">This payment link has expired. Go back and start again to get a new one.</p>
          ) : (
            <>
              <a className="qp-pay" href={url} target="_blank" rel="noreferrer">
                Pay {rupees(amount)} with Razorpay <ExternalLink size={17} />
              </a>

              <ol className="qp-steps">
                {steps.map((s, i) => (
                  <li key={s}>
                    <span>{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>

              <div className="qp-status" role="status">
                <i className="qp-dot" /> Waiting for payment… this page updates by itself.
              </div>
            </>
          )}

          <div className="qp-links">
            {!failed && onCheck && (
              <button type="button" onClick={check} disabled={checking}>
                <RefreshCw size={15} className={checking ? "qp-spin" : ""} /> {checking ? "Checking…" : "I've paid – check now"}
              </button>
            )}
            {onBack && (
              <button type="button" onClick={onBack}>
                ← {backLabel}
              </button>
            )}
          </div>

          <p className="qp-secure">
            <ShieldCheck size={15} /> Payments are processed securely by Razorpay.
          </p>
        </div>
      </div>
    </section>
  );
}
