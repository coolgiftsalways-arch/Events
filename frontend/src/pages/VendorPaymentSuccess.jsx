import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, Crown, ArrowRight, UserRound } from "lucide-react";

import "../css/VendorFlow.css";

const VALID_PLANS = {
  basic: {
    months: 1,
    discount: 10,
    events: 2,
    price: 999,
    name: "Basic",
  },
  growth: {
    months: 3,
    discount: 20,
    events: 5,
    price: 1999,
    name: "Growth",
  },
  premium: {
    months: 12,
    discount: 30,
    events: 36,
    price: 4999,
    name: "Premium",
  },
};

export default function VendorPaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const activationStarted = useRef(false);

  const [activated, setActivated] = useState(false);
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    // Only allow access through the demo Pay Now flow.
    if (!location.state?.demoPaymentConfirmed) {
      navigate("/vendor/membership", { replace: true });
      return;
    }

    if (activationStarted.current) return;
    activationStarted.current = true;

    // Check vendor login.
    const isLoggedIn = localStorage.getItem("stalloraVendorSession") === "true";

    if (!isLoggedIn) {
      navigate("/vendor/login", { replace: true });
      return;
    }

    let pendingPlan = null;

    try {
      pendingPlan = JSON.parse(
        localStorage.getItem("stalloraPendingVendorPlan") || "null",
      );
    } catch (error) {
      console.error("Unable to read selected plan:", error);
    }

    const selectedPlan = pendingPlan && VALID_PLANS[pendingPlan.id];

    if (!selectedPlan) {
      localStorage.removeItem("stalloraPendingVendorPlan");
      navigate("/vendor/membership", { replace: true });
      return;
    }

    // Activate demo membership.
    const now = new Date();

    const expiryDate = new Date(now);
    expiryDate.setMonth(expiryDate.getMonth() + selectedPlan.months);

    const membership = {
      ...selectedPlan,
      planId: pendingPlan.id,
      status: "active",
      startedAt: now.toISOString(),
      expiresAt: expiryDate.toISOString(),
      paymentMode: "demo",
      paymentReference: `DEMO-${Date.now()}`,
      activatedAt: now.toISOString(),
    };

    try {
      localStorage.setItem(
        "stalloraVendorMembership",
        JSON.stringify(membership),
      );

      localStorage.removeItem("stalloraPendingVendorPlan");

      window.dispatchEvent(new Event("stallora-vendor-updated"));

      setPlan(membership);
      setActivated(true);
    } catch (error) {
      console.error("Membership activation failed:", error);

      activationStarted.current = false;

      navigate("/vendor/membership", { replace: true });
    }
  }, [navigate, location.state]);

  if (!activated || !plan) {
    return (
      <main className="vf-page">
        <div className="vf-loading">Activating your membership...</div>
      </main>
    );
  }

  return (
    <main className="vf-page vf-success-page">
      <section className="vf-success-card">
        <div className="vf-success-check">
          <CheckCircle size={48} />
        </div>

        <span className="vf-eyebrow">DEMO MEMBERSHIP ACTIVATED</span>

        <h1>You're All Set!</h1>

        <p>
          Your {plan.name} membership has been activated successfully in this
          browser.
        </p>

        <div className="vf-success-details">
          <div>
            <span>Membership Plan</span>
            <strong>{plan.name}</strong>
          </div>

          <div>
            <span>Amount</span>
            <strong>₹{Number(plan.price).toLocaleString("en-IN")}</strong>
          </div>

          <div>
            <span>Stall Discount</span>
            <strong>{plan.discount}%</strong>
          </div>

          <div>
            <span>Discounted Bookings</span>
            <strong>Up to {plan.events} events</strong>
          </div>

          <div>
            <span>Membership Duration</span>
            <strong>
              {plan.months} {plan.months === 1 ? "month" : "months"}
            </strong>
          </div>

          <div>
            <span>Membership Valid Until</span>
            <strong>
              {new Date(plan.expiresAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </strong>
          </div>
        </div>

        <div className="vf-success-unlocked">
          <Crown size={21} />

          <div>
            <strong>All 63 Events Unlocked!</strong>
            <span>You can now explore all available events on STALLORA.</span>
          </div>
        </div>

        <Link to="/vendor/stalls" className="vf-button vf-button-primary">
          Explore All Events
          <ArrowRight size={18} />
        </Link>

        <Link to="/vendor/profile" className="vf-back-link">
          <UserRound size={16} />
          View My Profile
        </Link>

        <p className="vf-demo-note">
          Demo mode: No real payment has been collected. Membership is activated
          locally in this browser.
        </p>
      </section>
    </main>
  );
}
