import { useState } from "react";
import { Link, Navigate } from "react-router-dom";

import {
  ArrowRight,
  ArrowLeft,
  Check,
  Crown,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Star,
} from "lucide-react";

import "../css/OrganiserMembership.css";

// ==========================================
// MEMBERSHIP PLANS
// ==========================================

const plans = [
  {
    id: "silver",
    name: "Silver",
    price: 1999,
    description: "Everything you need to get your event started.",
    icon: Star,
    features: [
      "Create and publish events",
      "Custom event information page",
      "Manage stall listings",
      "View vendor booking requests",
      "Basic booking management",
      "Event performance overview",
      "Email support",
      "One organiser account",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    price: 9999,
    description: "A complete toolkit for growing event organisers.",
    icon: Crown,
    popular: true,
    features: [
      "Everything included in Silver",
      "Priority event listing",
      "Advanced event analytics",
      "Enhanced event visibility",
      "Advanced stall management",
      "Vendor booking insights",
      "Priority customer support",
      "Promotional event highlights",
      "Multiple event management",
      "Premium organiser profile",
    ],
  },
];

// ==========================================
// STORAGE HELPERS
// ==========================================

function readStorage(key) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error(`Unable to read ${key}:`, error);
    return null;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Unable to save ${key}:`, error);
    return false;
  }
}

// ==========================================
// ORGANISER MEMBERSHIP PAGE
// ==========================================

export default function OrganiserMembership() {
  // Read registration details created by OrganiserRegister.jsx
  const pendingOrganiser = readStorage("stalloraPendingOrganiser");

  // Do not display another registration form.
  // Redirect users who have not registered.
  if (
    !pendingOrganiser ||
    !pendingOrganiser.name ||
    !pendingOrganiser.company ||
    !pendingOrganiser.email ||
    !pendingOrganiser.phone
  ) {
    return <Navigate to="/organiser/register" replace />;
  }

  // ==========================================
  // SELECTED PLAN
  // ==========================================

  const savedPlan = readStorage("stalloraSelectedPlan");

  const [selectedPlan, setSelectedPlan] = useState(() => {
    if (savedPlan && plans.some((plan) => plan.id === savedPlan.plan)) {
      return savedPlan.plan;
    }

    return "gold";
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [isSaving, setIsSaving] = useState(false);

  const selected = plans.find((plan) => plan.id === selectedPlan);

  // ==========================================
  // SAVE ORGANISER PROFILE
  // ==========================================

  const continueWithPlan = () => {
    if (isSaving) return;

    setMessage("");
    setMessageType("error");

    if (!selected) {
      setMessage("Please select a valid membership plan.");
      return;
    }

    setIsSaving(true);

    try {
      const existingProfile = readStorage("stalloraOrganiser");

      // Preserve existing organiser information
      const organiserProfile = {
        ...(existingProfile || {}),

        id: existingProfile?.id || `organiser-${Date.now()}`,

        name: pendingOrganiser.name,
        company: pendingOrganiser.company,
        email: pendingOrganiser.email,
        phone: pendingOrganiser.phone,

        username:
          existingProfile?.username ||
          pendingOrganiser.company
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "")
            .slice(0, 20),

        bio: existingProfile?.bio || "",
        about: existingProfile?.about || "",
        location: existingProfile?.location || "",
        website: existingProfile?.website || "",
        instagram: existingProfile?.instagram || "",
        facebook: existingProfile?.facebook || "",

        profileImage: existingProfile?.profileImage || "",

        // Membership details
        membership: selected.id,
        membershipName: selected.name,
        membershipPrice: selected.price,

        // Payment is not verified yet
        membershipStatus: "pending_payment",
        paymentVerified: false,

        role: "organiser",

        createdAt: existingProfile?.createdAt || new Date().toISOString(),

        updatedAt: new Date().toISOString(),
      };

      // Save organiser profile
      const profileSaved = saveStorage("stalloraOrganiser", organiserProfile);

      if (!profileSaved) {
        setMessage("Unable to save your profile. Please try again.");
        setIsSaving(false);
        return;
      }

      // Save selected membership
      const planSaved = saveStorage("stalloraSelectedPlan", {
        plan: selected.id,
        planName: selected.name,
        amount: selected.price,
        paymentStatus: "pending",
        selectedAt: new Date().toISOString(),
      });

      if (!planSaved) {
        setMessage(
          "Your profile was saved, but membership selection could not be saved.",
        );

        setIsSaving(false);
        return;
      }

      // Clear temporary registration details
      localStorage.removeItem("stalloraPendingOrganiser");

      // Notify other components
      window.dispatchEvent(new Event("stallora:organiser-updated"));

      setMessageType("success");

      setMessage(
        `${selected.name} membership selected successfully! Your profile has been saved. Payment is still pending.`,
      );
    } catch (error) {
      console.error("Membership save error:", error);

      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================
  // PAGE UI
  // ==========================================

  return (
    <main className="om-page">
      <div className="om-background-shape om-shape-one" />
      <div className="om-background-shape om-shape-two" />

      <div className="om-container">
        {/* TOP BAR */}

        <div className="om-topbar">
          <Link to="/" className="om-brand">
            STALLORA<span>✳</span>
          </Link>

          <div className="om-top-label">
            <ShieldCheck size={15} />
            ORGANISER MEMBERSHIPS
          </div>
        </div>

        {/* PROGRESS */}

        <div className="om-progress">
          <div className="om-progress-item active">
            <div className="om-progress-circle">
              <Check size={15} />
            </div>
            <span>Discover</span>
          </div>

          <div className="om-progress-item active">
            <div className="om-progress-circle">
              <Check size={15} />
            </div>
            <span>Your Account</span>
          </div>

          <div className="om-progress-item active">
            <div className="om-progress-circle">3</div>
            <span>Membership</span>
          </div>
        </div>

        {/* MEMBERSHIP SECTION */}

        <section className="om-plans-section">
          <Link to="/organiser/register" className="om-back-button">
            <ArrowLeft size={17} />
            Back to Registration
          </Link>

          {/* HEADING */}

          <div className="om-section-heading om-plans-heading">
            <div className="om-eyebrow">
              <Crown size={15} />
              STEP 03 — CHOOSE YOUR MEMBERSHIP
            </div>

            <h1>
              Choose how you
              <br />
              <span>want to grow.</span>
            </h1>

            <p>Select the membership that fits your event business.</p>
          </div>

          {/* REGISTERED ORGANISER DETAILS */}

          <div className="om-secure-note">
            <ShieldCheck size={17} />

            <span>
              Registered as <strong>{pendingOrganiser.name}</strong> (
              {pendingOrganiser.email})
            </span>
          </div>

          {/* MEMBERSHIP CARDS */}

          <div className="om-plans-grid">
            {plans.map((plan) => {
              const PlanIcon = plan.icon;
              const isSelected = selectedPlan === plan.id;

              return (
                <article
                  key={plan.id}
                  className={`om-plan-card ${plan.id} ${
                    isSelected ? "selected" : ""
                  }`}
                  onClick={() => {
                    setSelectedPlan(plan.id);
                    setMessage("");
                  }}
                >
                  {plan.popular && (
                    <div className="om-popular-tag">
                      <Sparkles size={13} />
                      MOST POPULAR
                    </div>
                  )}

                  {/* CARD TOP */}

                  <div className="om-plan-top">
                    <div className="om-plan-icon">
                      <PlanIcon size={25} />
                    </div>

                    <span className="om-plan-number">
                      {plan.id === "silver" ? "01" : "02"}
                    </span>
                  </div>

                  {/* PLAN NAME */}

                  <div className="om-plan-name">{plan.name}</div>

                  <p className="om-plan-description">{plan.description}</p>

                  {/* PRICE */}

                  <div className="om-plan-price">
                    <span>₹</span>
                    {plan.price.toLocaleString("en-IN")}
                  </div>

                  <div className="om-plan-period">PER YEAR</div>

                  <div className="om-plan-divider" />

                  {/* FEATURES */}

                  <div className="om-feature-title">WHAT'S INCLUDED</div>

                  <ul className="om-feature-list">
                    {plan.features.map((feature) => (
                      <li key={feature}>
                        <span className="om-feature-check">
                          <Check size={13} />
                        </span>

                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* SELECT BUTTON */}

                  <button
                    className={`om-select-plan ${isSelected ? "chosen" : ""}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();

                      setSelectedPlan(plan.id);
                      setMessage("");
                    }}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 size={17} />
                        Selected
                      </>
                    ) : (
                      <>
                        Choose {plan.name}
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </article>
              );
            })}
          </div>

          {/* SELECTED PLAN FOOTER */}

          <div className="om-plan-footer">
            <div>
              <ShieldCheck size={18} />

              <span>
                Selected: {selected.name} — ₹
                {selected.price.toLocaleString("en-IN")} / year
              </span>
            </div>

            <button
              className="om-primary-button"
              type="button"
              onClick={continueWithPlan}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Continue with Membership"}

              {!isSaving && <ArrowRight size={18} />}
            </button>
          </div>

          {/* MESSAGE */}

          {message && (
            <div
              className={
                messageType === "success" ? "om-selection-message" : "om-error"
              }
              role={messageType === "success" ? "status" : "alert"}
            >
              {messageType === "success" && <CheckCircle2 size={18} />}

              {message}
            </div>
          )}
        </section>

        {/* FOOTER */}

        <footer className="om-footer">
          <span>© 2026 STALLORA</span>

          <span>MADE FOR PEOPLE WHO MAKE EVENTS HAPPEN.</span>

          <span>ORGANISER MEMBERSHIPS</span>
        </footer>
      </div>
    </main>
  );
}
