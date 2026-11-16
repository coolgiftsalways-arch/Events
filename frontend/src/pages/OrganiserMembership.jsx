import { useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  ArrowLeft,
  Check,
  Crown,
  CalendarDays,
  Store,
  Users,
  ChartNoAxesCombined,
  ShieldCheck,
  Sparkles,
  Building2,
  Mail,
  Lock,
  Phone,
  User,
  CheckCircle2,
  Star,
  Eye,
  EyeOff,
  BriefcaseBusiness,
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
// INITIAL FORM
// ==========================================

const initialForm = {
  name: "",
  company: "",
  email: "",
  phone: "",
};

// ==========================================
// SAFE LOCAL STORAGE HELPERS
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

function getPendingOrganiser() {
  return readStorage("stalloraPendingOrganiser");
}

// ==========================================
// MEMBERSHIP PAGE
// ==========================================

export default function OrganiserMembership() {
  const pendingOrganiser = getPendingOrganiser();

  const [step, setStep] = useState(() => {
    return pendingOrganiser ? 2 : 0;
  });

  const [selectedPlan, setSelectedPlan] = useState("gold");

  const [form, setForm] = useState(() => ({
    ...initialForm,
    ...(pendingOrganiser || {}),
  }));

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [agreed, setAgreed] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  // ==========================================
  // FORM UPDATE
  // ==========================================

  const updateForm = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  };

  // ==========================================
  // REGISTRATION VALIDATION
  // ==========================================

  const continueToPlans = (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("error");

    if (
      !form.name.trim() ||
      !form.company.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      setMessage("Please complete all your account details.");
      return;
    }

    const cleanEmail = form.email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    const cleanPhone = form.phone.replace(/\D/g, "");

    if (!/^\d{10}$/.test(cleanPhone)) {
      setMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Your passwords do not match.");
      return;
    }

    if (!agreed) {
      setMessage("Please accept the Terms and Conditions.");
      return;
    }

    const pendingOrganiser = {
      name: form.name.trim(),
      company: form.company.trim(),
      email: cleanEmail,
      phone: cleanPhone,
    };

    // Password is intentionally not stored in localStorage.
    // Real authentication must be handled securely by the backend.

    const saved = saveStorage(
      "stalloraPendingOrganiser",
      pendingOrganiser,
    );

    if (!saved) {
      setMessage(
        "Unable to save your details. Please check your browser storage and try again.",
      );
      return;
    }

    setForm(pendingOrganiser);
    setMessage("");
    setStep(2);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // SELECTED PLAN
  // ==========================================

  const selected = plans.find(
    (plan) => plan.id === selectedPlan,
  );

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

    const pending = getPendingOrganiser();

    if (
      !pending ||
      !pending.name ||
      !pending.company ||
      !pending.email ||
      !pending.phone
    ) {
      setMessage("Please complete organiser registration first.");
      setStep(1);
      return;
    }

    setIsSaving(true);

    // Preserve an existing profile if the organiser is updating
    // their membership selection in this browser.
    const existingProfile = readStorage("stalloraOrganiser");

    const organiserProfile = {
      ...(existingProfile || {}),

      id:
        existingProfile?.id ||
        `organiser-${Date.now()}`,

      name: pending.name,
      company: pending.company,
      email: pending.email,
      phone: pending.phone,

      username:
        existingProfile?.username ||
        pending.company
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "")
          .slice(0, 20),

      bio: existingProfile?.bio || "",
      location: existingProfile?.location || "",
      website: existingProfile?.website || "",
      instagram: existingProfile?.instagram || "",

      profileImage: existingProfile?.profileImage || "",

      membership: selected.id,
      membershipName: selected.name,
      membershipPrice: selected.price,

      // Selecting a plan does not verify payment.
      membershipStatus: "pending_payment",
      paymentVerified: false,

      role: "organiser",

      createdAt:
        existingProfile?.createdAt ||
        new Date().toISOString(),

      updatedAt: new Date().toISOString(),
    };

    const profileSaved = saveStorage(
      "stalloraOrganiser",
      organiserProfile,
    );

    if (!profileSaved) {
      setIsSaving(false);
      setMessage(
        "Your profile could not be saved. Please try again.",
      );
      return;
    }

    const planSaved = saveStorage(
      "stalloraSelectedPlan",
      {
        plan: selected.id,
        planName: selected.name,
        amount: selected.price,
        selectedAt: new Date().toISOString(),
      },
    );

    if (!planSaved) {
      setIsSaving(false);
      setMessage(
        "Your profile was saved, but the membership selection could not be saved. Please try again.",
      );
      return;
    }

    // Remove temporary registration data.
    localStorage.removeItem("stalloraPendingOrganiser");

    // Notify components listening for organiser changes.
    window.dispatchEvent(
      new Event("stallora:organiser-updated"),
    );

    setMessageType("success");

    setMessage(
      `${selected.name} membership selected successfully! Your organiser profile has been saved. Payment verification is still required before membership activation.`,
    );

    setIsSaving(false);
  };

  // ==========================================
  // MAIN PAGE
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
          {["Discover", "Your Account", "Membership"].map(
            (label, index) => (
              <div
                className={`om-progress-item ${
                  step >= index ? "active" : ""
                }`}
                key={label}
              >
                <div className="om-progress-circle">
                  {step > index ? (
                    <Check size={15} />
                  ) : (
                    index + 1
                  )}
                </div>

                <span>{label}</span>
              </div>
            ),
          )}
        </div>

        {/* ==================================
            STEP 1 - WELCOME
        ================================== */}

        {step === 0 && (
          <section className="om-welcome">
            <div className="om-welcome-copy">
              <div className="om-eyebrow">
                <Sparkles size={15} />
                FOR EVENT ORGANISERS
              </div>

              <h1>
                Your event.
                <br />
                <span>Your marketplace.</span>
                <br />
                Your rules.
              </h1>

              <p>
                Bring your event to life with STALLORA. Create
                events, showcase stall spaces, connect with
                vendors and manage your bookings — all from
                one place.
              </p>

              <div className="om-welcome-points">
                <div>
                  <CalendarDays />
                  <span>Create and manage events</span>
                </div>

                <div>
                  <Store />
                  <span>List and manage stall spaces</span>
                </div>

                <div>
                  <ChartNoAxesCombined />
                  <span>Track your event bookings</span>
                </div>
              </div>

              <button
                className="om-primary-button"
                type="button"
                onClick={() => setStep(1)}
              >
                Get Started
                <ArrowRight size={18} />
              </button>

              <div className="om-welcome-note">
                Simple setup. Flexible membership. More possibilities.
              </div>
            </div>

            <div className="om-welcome-visual">
              <div className="om-visual-top">
                <span>THE ORGANISER EXPERIENCE</span>
                <Sparkles size={18} />
              </div>

              <div className="om-event-art">
                <div className="om-art-circle" />

                <div className="om-art-sticker">
                  MAKE
                  <br />
                  IT
                  <br />
                  HAPPEN
                </div>

                <div className="om-art-title">
                  GOOD
                  <br />
                  EVENTS
                  <br />
                  START HERE.
                </div>

                <div className="om-art-bottom">
                  <span>STALLORA</span>
                  <span>01 / 03</span>
                </div>
              </div>

              <div className="om-floating-card">
                <div className="om-floating-icon">
                  <Users size={20} />
                </div>

                <div>
                  <strong>Your vendor community</strong>
                  <span>Connect. Organise. Grow.</span>
                </div>

                <CheckCircle2
                  size={19}
                  className="om-floating-check"
                />
              </div>
            </div>
          </section>
        )}

        {/* ==================================
            STEP 2 - ACCOUNT
        ================================== */}

        {step === 1 && (
          <section className="om-account-section">
            <button
              className="om-back-button"
              type="button"
              onClick={() => setStep(0)}
            >
              <ArrowLeft size={17} />
              Back
            </button>

            <div className="om-section-heading">
              <div className="om-eyebrow">
                <Building2 size={15} />
                STEP 02 — ORGANISER REGISTRATION
              </div>

              <h1>
                Let's get to
                <br />
                <span>know you.</span>
              </h1>

              <p>
                Create your organiser details before choosing
                your membership.
              </p>
            </div>

            <div className="om-account-card">
              <form onSubmit={continueToPlans}>
                <label className="om-label" htmlFor="om-name">
                  Full Name
                </label>

                <div className="om-input-wrap">
                  <User size={18} />

                  <input
                    id="om-name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={updateForm}
                    autoComplete="name"
                    required
                  />
                </div>

                <label className="om-label" htmlFor="om-company">
                  Organiser / Company Name
                </label>

                <div className="om-input-wrap">
                  <BriefcaseBusiness size={18} />

                  <input
                    id="om-company"
                    name="company"
                    type="text"
                    placeholder="Enter your company name"
                    value={form.company}
                    onChange={updateForm}
                    autoComplete="organization"
                    required
                  />
                </div>

                <label className="om-label" htmlFor="om-email">
                  Email Address
                </label>

                <div className="om-input-wrap">
                  <Mail size={18} />

                  <input
                    id="om-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={updateForm}
                    autoComplete="email"
                    required
                  />
                </div>

                <label className="om-label" htmlFor="om-phone">
                  Mobile Number
                </label>

                <div className="om-input-wrap">
                  <Phone size={18} />

                  <span>+91</span>

                  <input
                    id="om-phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Enter 10-digit number"
                    value={form.phone}
                    onChange={(e) => {
                      const digits = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);

                      setForm((previous) => ({
                        ...previous,
                        phone: digits,
                      }));

                      setMessage("");
                    }}
                    autoComplete="tel-national"
                    required
                  />
                </div>

                <label className="om-label" htmlFor="om-password">
                  Password
                </label>

                <div className="om-input-wrap">
                  <Lock size={18} />

                  <input
                    id="om-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setMessage("");
                    }}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                <label
                  className="om-label"
                  htmlFor="om-confirm-password"
                >
                  Confirm Password
                </label>

                <div className="om-input-wrap">
                  <ShieldCheck size={18} />

                  <input
                    id="om-confirm-password"
                    type={
                      showConfirmPassword ? "text" : "password"
                    }
                    placeholder="Enter your password again"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setMessage("");
                    }}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((previous) => !previous)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                <label className="om-terms">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => {
                      setAgreed(e.target.checked);
                      setMessage("");
                    }}
                  />

                  <span>
                    I agree to the{" "}
                    <Link to="/terms">Terms & Conditions</Link>{" "}
                    and{" "}
                    <Link to="/privacy">Privacy Policy</Link>.
                  </span>
                </label>

                {message && (
                  <div
                    className="om-error"
                    role="alert"
                  >
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  className="om-primary-button om-full-button"
                >
                  Continue to Membership
                  <ArrowRight size={18} />
                </button>
              </form>

              <div className="om-secure-note">
                <ShieldCheck size={16} />
                Your organiser details are ready for membership selection.
              </div>
            </div>
          </section>
        )}

        {/* ==================================
            STEP 3 - MEMBERSHIP
        ================================== */}

        {step === 2 && (
          <section className="om-plans-section">
            <button
              className="om-back-button"
              type="button"
              onClick={() => setStep(1)}
            >
              <ArrowLeft size={17} />
              Back to Account
            </button>

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

              <p>
                Select the membership that fits your event business.
              </p>
            </div>

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

                    <div className="om-plan-top">
                      <div className="om-plan-icon">
                        <PlanIcon size={25} />
                      </div>

                      <span className="om-plan-number">
                        {plan.id === "silver" ? "01" : "02"}
                      </span>
                    </div>

                    <div className="om-plan-name">
                      {plan.name}
                    </div>

                    <p className="om-plan-description">
                      {plan.description}
                    </p>

                    <div className="om-plan-price">
                      <span>₹</span>
                      {plan.price.toLocaleString("en-IN")}
                    </div>

                    <div className="om-plan-period">
                      PER YEAR
                    </div>

                    <div className="om-plan-divider" />

                    <div className="om-feature-title">
                      WHAT'S INCLUDED
                    </div>

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

                    <button
                      className={`om-select-plan ${
                        isSelected ? "chosen" : ""
                      }`}
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
                {isSaving ? "Saving..." : "Save My Profile"}

                {!isSaving && <ArrowRight size={18} />}
              </button>
            </div>

            {message && (
              <div
                className={
                  messageType === "success"
                    ? "om-selection-message"
                    : "om-error"
                }
                role={messageType === "success" ? "status" : "alert"}
              >
                {messageType === "success" && (
                  <CheckCircle2 size={18} />
                )}

                {message}
              </div>
            )}
          </section>
        )}

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
