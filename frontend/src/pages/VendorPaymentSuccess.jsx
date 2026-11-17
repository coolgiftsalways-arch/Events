import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Crown,
  CalendarDays,
  ArrowRight,
  UserRound,
  ShieldCheck,
} from "lucide-react";

import "../css/VendorFlow.css";

export default function VendorPaymentSuccess() {
  const navigate = useNavigate();

  const [activated, setActivated] = useState(false);
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    // ========================================
    // CHECK VENDOR LOGIN
    // ========================================

    const isLoggedIn =
      localStorage.getItem("stalloraVendorSession") === "true";

    if (!isLoggedIn) {
      navigate("/vendor/login", { replace: true });
      return;
    }

    // ========================================
    // GET PENDING PLAN
    // ========================================

    let pendingPlan = null;

    try {
      pendingPlan = JSON.parse(
        localStorage.getItem("stalloraPendingVendorPlan") || "null"
      );
    } catch (error) {
      console.error("Unable to read pending membership:", error);
    }

    if (!pendingPlan) {
      navigate("/vendor/membership", { replace: true });
      return;
    }

    // ========================================
    // CHECK EXISTING MEMBERSHIP
    // ========================================

    let existingMembership = null;

    try {
      existingMembership = JSON.parse(
        localStorage.getItem("stalloraVendorMembership") || "null"
      );
    } catch (error) {
      console.error("Unable to read existing membership:", error);
    }

    // ========================================
    // CALCULATE MEMBERSHIP DATES
    // ========================================

    const now = new Date();

    const expiryDate = new Date(now);

    expiryDate.setMonth(
      expiryDate.getMonth() + Number(pendingPlan.months)
    );

    // ========================================
    // ACTIVATE MEMBERSHIP
    // ========================================
    // DEMO ONLY:
    // Real activation must happen after verified
    // Razorpay payment from the backend.

    const membership = {
      ...pendingPlan,

      status: "active",

      startedAt: now.toISOString(),

      expiresAt: expiryDate.toISOString(),

      paymentMode: "frontend-demo",

      paymentReference: `DEMO-${Date.now()}`,

      activatedAt: now.toISOString(),
    };

    try {
      localStorage.setItem(
        "stalloraVendorMembership",
        JSON.stringify(membership)
      );

      localStorage.removeItem("stalloraPendingVendorPlan");

      // Notify vendor pages to refresh membership status.
      window.dispatchEvent(
        new Event("stallora-vendor-updated")
      );

      setPlan(membership);
      setActivated(true);
    } catch (error) {
      console.error("Unable to activate membership:", error);

      navigate("/vendor/membership", { replace: true });
    }
  }, [navigate]);

  // ========================================
  // LOADING
  // ========================================

  if (!activated || !plan) {
    return (
      <main className="vf-page">
        <div className="vf-loading">
          Preparing your membership...
        </div>
      </main>
    );
  }

  // ========================================
  // SUCCESS PAGE
  // ========================================

  return (
    <main className="vf-page vf-success-page">

      <section className="vf-success-card">

        {/* SUCCESS ICON */}

        <div className="vf-success-check">
          <CheckCircle size={48} />
        </div>

        <span className="vf-eyebrow">
          MEMBERSHIP ACTIVATED — DEMO
        </span>

        <h1>You're All Set!</h1>

        <p>
          Your {plan.name} membership has been activated
          in this browser prototype.
        </p>

        {/* MEMBERSHIP DETAILS */}

        <div className="vf-success-details">

          <div>
            <span>Membership Plan</span>
            <strong>{plan.name}</strong>
          </div>

          <div>
            <span>Amount</span>

            <strong>
              ₹{Number(plan.price).toLocaleString("en-IN")}
            </strong>
          </div>

          <div>
            <span>Stall Discount</span>
            <strong>{plan.discount}%</strong>
          </div>

          <div>
            <span>Discounted Bookings</span>
            <strong>
              Up to {plan.events} events
            </strong>
          </div>

          <div>
            <span>Membership Duration</span>
            <strong>
              {plan.months}{" "}
              {Number(plan.months) === 1 ? "month" : "months"}
            </strong>
          </div>

          <div>
            <span>Membership Valid Until</span>

            <strong>
              {new Date(plan.expiresAt).toLocaleDateString(
                "en-IN",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }
              )}
            </strong>
          </div>

        </div>

        {/* UNLOCKED MESSAGE */}

        <div className="vf-success-unlocked">
          <Crown size={21} />

          <div>
            <strong>All approved events unlocked!</strong>

            <span>
              You can now explore all available events
              on STALLORA.
            </span>
          </div>
        </div>

        {/* EXPLORE EVENTS */}

        <Link
          to="/vendor/stalls"
          className="vf-button vf-button-primary"
        >
          Explore All Events
          <ArrowRight size={18} />
        </Link>

        {/* PROFILE */}

        <Link
          to="/vendor/profile"
          className="vf-back-link"
        >
          <UserRound size={16} />
          View My Profile
        </Link>

        {/* PAYMENT NOTE */}

        <p className="vf-demo-note">
          This is a frontend payment simulation. No real
          payment was collected. Connect Razorpay and verify
          payment on your backend before activating live
          memberships.
        </p>

      </section>

    </main>
  );
}
