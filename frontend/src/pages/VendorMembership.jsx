import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  CheckCircle,
  Crown,
  ArrowRight,
  ShieldCheck,
  Zap,
  Star,
} from "lucide-react";

import "../css/VendorFlow.css";

// ==========================================
// MEMBERSHIP PLANS
// ==========================================

const MEMBERSHIP_PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: 999,
    months: 1,
    discount: 10,
    events: 2,
    description: "Perfect for vendors getting started.",
    icon: Star,
    features: [
      "1 month membership",
      "10% discount on stall bookings",
      "Discount on up to 2 events",
      "Access to all available events",
      "Vendor membership profile",
    ],
  },

  {
    id: "growth",
    name: "Growth",
    price: 1999,
    months: 3,
    discount: 20,
    events: 5,
    description: "Grow your brand and reach more customers.",
    icon: Zap,
    popular: true,
    features: [
      "3 months membership",
      "20% discount on stall bookings",
      "Discount on up to 5 events",
      "Access to all available events",
      "Vendor membership profile",
      "More event opportunities",
    ],
  },

  {
    id: "premium",
    name: "Premium",
    price: 4999,
    months: 12,
    discount: 30,
    events: 36,
    description: "For vendors ready to expand their business.",
    icon: Crown,
    features: [
      "12 months membership",
      "30% discount on stall bookings",
      "Discount on up to 36 events",
      "Access to all available events",
      "Vendor membership profile",
      "Maximum membership benefits",
    ],
  },
];

const VENDOR_SESSION_KEY = "stalloraVendorSession";
const VENDOR_KEY = "stalloraVendor";
const PENDING_PLAN_KEY = "stalloraPendingVendorPlan";

// ==========================================
// COMPONENT
// ==========================================

export default function VendorMembership() {
  const navigate = useNavigate();

  const [selectedPlan, setSelectedPlan] = useState("growth");
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(false);

  // ==========================================
  // CHECK VENDOR LOGIN
  // ==========================================

  useEffect(() => {
    const isLoggedIn = localStorage.getItem(VENDOR_SESSION_KEY) === "true";

    if (!isLoggedIn) {
      navigate("/vendor/login", {
        replace: true,
      });

      return;
    }

    try {
      const savedVendor = JSON.parse(
        localStorage.getItem(VENDOR_KEY) || "null",
      );

      setVendor(savedVendor || {});
    } catch (error) {
      console.error("Unable to read vendor details:", error);
      setVendor({});
    }
  }, [navigate]);

  // ==========================================
  // SELECT PLAN
  // ==========================================

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
  };

  // ==========================================
  // CONTINUE TO DEMO PAYMENT
  // ==========================================

  const continueToPayment = () => {
    if (loading) return;

    const isLoggedIn = localStorage.getItem(VENDOR_SESSION_KEY) === "true";

    if (!isLoggedIn) {
      navigate("/vendor/login", {
        replace: true,
      });

      return;
    }

    const plan = MEMBERSHIP_PLANS.find((item) => item.id === selectedPlan);

    if (!plan) {
      alert("Please select a valid membership plan.");
      return;
    }

    setLoading(true);

    try {
      const savedVendor = JSON.parse(
        localStorage.getItem(VENDOR_KEY) || "null",
      );

      // Save selected plan for the success page.
      const pendingPlan = {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        months: plan.months,
        discount: plan.discount,
        events: plan.events,

        vendorId:
          savedVendor?._id || savedVendor?.id || savedVendor?.vendorId || "",

        vendorEmail: savedVendor?.email || savedVendor?.vendorEmail || "",

        selectedAt: new Date().toISOString(),
      };

      localStorage.setItem(PENDING_PLAN_KEY, JSON.stringify(pendingPlan));

      // Demo flow: no actual payment gateway is connected.
      navigate("/vendor/payment-success", {
        state: {
          demoPaymentConfirmed: true,
        },
      });
    } catch (error) {
      console.error("Unable to continue:", error);

      alert("Something went wrong. Please try again.");

      setLoading(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (vendor === null) {
    return (
      <main className="vf-page">
        <div className="vf-loading">Loading membership plans...</div>
      </main>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="vf-page">
      <section className="vf-membership-container">
        {/* HEADER */}

        <div className="vf-membership-header">
          <span className="vf-eyebrow">STALLORA VENDOR MEMBERSHIP</span>

          <h1>
            Choose Your
            <span> Growth Plan</span>
          </h1>

          <p>
            Unlock every available event and enjoy exclusive discounts on your
            stall bookings.
          </p>

          <div className="vf-membership-trust">
            <ShieldCheck size={17} />
            <span>Choose a plan that works for your business.</span>
          </div>
        </div>

        {/* PLANS */}

        <div className="vf-plan-grid">
          {MEMBERSHIP_PLANS.map((plan) => {
            const Icon = plan.icon;

            const isSelected = selectedPlan === plan.id;

            return (
              <article
                key={plan.id}
                className={`vf-plan-card ${
                  isSelected ? "vf-plan-selected" : ""
                } ${plan.popular ? "vf-plan-popular" : ""}`}
              >
                {/* POPULAR LABEL */}

                {plan.popular && (
                  <div className="vf-popular-label">MOST POPULAR</div>
                )}

                {/* PLAN ICON */}

                <div className="vf-plan-icon">
                  <Icon size={27} />
                </div>

                {/* PLAN NAME */}

                <h2>{plan.name}</h2>

                <p className="vf-plan-description">{plan.description}</p>

                {/* PRICE */}

                <div className="vf-plan-price">
                  <span>₹</span>
                  {plan.price.toLocaleString("en-IN")}
                </div>

                <p className="vf-plan-duration">
                  Valid for {plan.months}{" "}
                  {plan.months === 1 ? "month" : "months"}
                </p>

                {/* DISCOUNT */}

                <div className="vf-plan-discount">
                  <strong>{plan.discount}% OFF</strong>

                  <span>on stall bookings</span>
                </div>

                {/* FEATURES */}

                <div className="vf-plan-features">
                  {plan.features.map((feature, index) => (
                    <div
                      className="vf-plan-feature"
                      key={`${plan.id}-${index}`}
                    >
                      <CheckCircle size={17} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* SELECT BUTTON */}

                <button
                  type="button"
                  className={`vf-button ${
                    isSelected ? "vf-button-primary" : "vf-button-outline"
                  }`}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle size={17} />
                      Selected
                    </>
                  ) : (
                    <>
                      Select Plan
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </article>
            );
          })}
        </div>

        {/* SELECTED PLAN SUMMARY */}

        {selectedPlan && (
          <div className="vf-selected-summary">
            <div>
              <span>Selected Membership</span>

              <strong>
                {
                  MEMBERSHIP_PLANS.find((plan) => plan.id === selectedPlan)
                    ?.name
                }
              </strong>
            </div>

            <div>
              <span>Membership Price</span>

              <strong>
                ₹
                {MEMBERSHIP_PLANS.find(
                  (plan) => plan.id === selectedPlan,
                )?.price.toLocaleString("en-IN")}
              </strong>
            </div>
          </div>
        )}

        {/* PAY BUTTON */}

        <div className="vf-membership-action">
          <button
            type="button"
            className="vf-button vf-button-primary vf-pay-button"
            onClick={continueToPayment}
            disabled={loading || !selectedPlan}
          >
            {loading ? (
              "Processing..."
            ) : (
              <>
                Pay Now — ₹
                {MEMBERSHIP_PLANS.find(
                  (plan) => plan.id === selectedPlan,
                )?.price.toLocaleString("en-IN")}
                <ArrowRight size={19} />
              </>
            )}
          </button>

          <p className="vf-demo-note">
            Demo mode: Clicking Pay Now activates the selected membership
            without collecting a real payment.
          </p>
        </div>

        {/* FOOTER LINK */}

        <div className="vf-membership-footer">
          <Link to="/events" className="vf-back-link">
            ← Back to Events
          </Link>

          <Link to="/vendor/profile" className="vf-back-link">
            View My Profile
          </Link>
        </div>
      </section>
    </main>
  );
}
