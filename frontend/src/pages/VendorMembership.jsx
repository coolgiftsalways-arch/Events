
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Check,
  Crown,
  Sparkles,
  Star,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import "../css/VendorFlow.css";

// ==========================================
// MEMBERSHIP PLANS
// ==========================================

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: 999,
    months: 1,
    discount: 10,
    events: 2,
    description: "A simple start for new vendors.",
    icon: Star,
    features: [
      "Preview and unlock all approved events",
      "10% stall booking discount",
      "Discount on up to 2 events",
      "Vendor membership in your profile",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 1999,
    months: 3,
    discount: 20,
    events: 5,
    description: "More reach and more booking opportunities.",
    popular: true,
    icon: Sparkles,
    features: [
      "Preview and unlock all approved events",
      "20% stall booking discount",
      "Discount on up to 5 events",
      "Vendor membership in your profile",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 4999,
    months: 12,
    discount: 30,
    events: 36,
    description: "The complete year-round vendor advantage.",
    icon: Crown,
    features: [
      "Preview and unlock all approved events",
      "30% stall booking discount",
      "Discount on up to 36 events",
      "Year-round vendor membership",
    ],
  },
];

// ==========================================
// VENDOR MEMBERSHIP
// ==========================================

export default function VendorMembership() {
  const navigate = useNavigate();

  const [selectedPlan, setSelectedPlan] = useState("growth");
  const [vendor, setVendor] = useState(null);

  // ========================================
  // CHECK VENDOR LOGIN
  // ========================================

  useEffect(() => {
    const isLoggedIn =
      localStorage.getItem("stalloraVendorSession") === "true";

    let savedVendor = null;

    try {
      savedVendor = JSON.parse(
        localStorage.getItem("stalloraVendor") || "null"
      );
    } catch (error) {
      console.error("Unable to read vendor account:", error);
    }

    if (!isLoggedIn || !savedVendor) {
      navigate("/vendor/login", { replace: true });
      return;
    }

    setVendor(savedVendor);
  }, [navigate]);

  // ========================================
  // SELECTED PLAN
  // ========================================

  const activePlan = PLANS.find(
    (plan) => plan.id === selectedPlan
  );

  // ========================================
  // CONTINUE TO PAYMENT
  // ========================================

  const continueToPayment = () => {
    if (!activePlan || !vendor) return;

    const pendingPlan = {
      id: activePlan.id,
      name: activePlan.name,
      price: activePlan.price,
      months: activePlan.months,
      discount: activePlan.discount,
      events: activePlan.events,
      vendorId: vendor.id,
      vendorEmail: vendor.email,
    };

    localStorage.setItem(
      "stalloraPendingVendorPlan",
      JSON.stringify(pendingPlan)
    );

    // DEMO ONLY:
    // Replace with Razorpay checkout after backend integration.

    navigate("/vendor/payment-success", {
      state: { demo: true },
    });
  };

  // ========================================
  // LOADING
  // ========================================

  if (!vendor) {
    return (
      <main className="vf-page">
        <div className="vf-loading">
          Loading membership plans...
        </div>
      </main>
    );
  }

  // ========================================
  // UI
  // ========================================

  return (
    <main className="vf-page vf-content-page">

      {/* PAGE HEADING */}

      <div className="vf-page-heading vf-centered-heading">
        <span className="vf-eyebrow">
          VENDOR MEMBERSHIPS
        </span>

        <h1>Unlock More Stall Opportunities</h1>

        <p>
          Choose a membership plan to unlock all approved
          events and receive discounts on eligible bookings.
        </p>
      </div>

      {/* MEMBERSHIP CARDS */}

      <div className="vf-plan-grid">

        {PLANS.map((plan) => {
          const Icon = plan.icon;

          const isSelected = selectedPlan === plan.id;

          return (
            <article
              key={plan.id}
              className={`
                vf-plan-card
                ${plan.popular ? "is-popular" : ""}
                ${isSelected ? "is-selected" : ""}
              `}
            >

              {/* POPULAR LABEL */}

              {plan.popular && (
                <span className="vf-popular-label">
                  MOST POPULAR
                </span>
              )}

              {/* ICON */}

              <div className="vf-plan-icon">
                <Icon size={25} />
              </div>

              {/* PLAN NAME */}

              <h2>{plan.name}</h2>

              <p>{plan.description}</p>

              {/* PRICE */}

              <div className="vf-plan-price">
                ₹{plan.price.toLocaleString("en-IN")}

                <small>
                  / {plan.months}{" "}
                  {plan.months === 1 ? "month" : "months"}
                </small>
              </div>

              {/* DISCOUNT */}

              <div className="vf-discount-pill">
                {plan.discount}% STALL DISCOUNT
              </div>

              {/* FEATURES */}

              <ul>
                {plan.features.map((feature, index) => (
                  <li key={index}>
                    <Check size={16} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* SELECT BUTTON */}

              <button
                type="button"
                className={`vf-button ${
                  isSelected
                    ? "vf-button-primary"
                    : "vf-button-outline"
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {isSelected ? "Selected Plan" : "Choose Plan"}
              </button>

              {isSelected && (
                <div className="vf-selected-indicator">
                  <Check size={15} />
                  Your selected membership
                </div>
              )}

            </article>
          );
        })}

      </div>

      {/* PAYMENT SUMMARY */}

      <div className="vf-payment-summary">

        <div>
          <strong>
            Selected: {activePlan?.name}
          </strong>

          <span>
            {activePlan?.discount}% discount ·{" "}
            {activePlan?.months} month
            {activePlan?.months === 1 ? "" : "s"} access
          </span>
        </div>

        <button
          type="button"
          className="vf-button vf-button-primary"
          onClick={continueToPayment}
        >
          Continue — ₹
          {activePlan?.price.toLocaleString("en-IN")}

          <ArrowRight size={18} />
        </button>

      </div>

      {/* PAYMENT INFORMATION */}

      <div className="vf-membership-security">
        <ShieldCheck size={20} />

        <span>
          Your selected membership will be associated
          with your vendor account.
        </span>
      </div>

      {/* DEMO NOTE */}

      <p className="vf-demo-note">
        Payment is currently simulated in this frontend
        prototype. No money is charged. Connect Razorpay
        checkout and verify payment on your backend before
        activating live memberships.
      </p>

      {/* BACK LINK */}

      <Link
        className="vf-back-link"
        to="/vendor/stalls"
      >
        ← Back to events
      </Link>

    </main>
  );
}
