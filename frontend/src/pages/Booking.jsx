import { useMemo, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";

import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  CalendarDays,
  CreditCard,
  Store,
} from "lucide-react";

import useEvent from "../services/useEvent";
import { apiFetch, isLoggedIn } from "../services/api";
import PaymentLinkPanel from "../components/PaymentLinkPanel";
import { useLanguage } from "../context/LanguageContext";
import "../css/Booking.css";

// ==========================================
// PRICING
// ==========================================

const BOOKING_DISCOUNT = 1000;
const BOOKING_FEE = 1500;
const ADVANCE_PAYMENT = 1500;

// ==========================================
// TRANSLATIONS
// ==========================================

const translations = {
  en: {
    back: "Back to Event",
    eyebrow: "STALLORA BOOKING",
    title: "Reserve your space.",
    subtitle:
      "Tell us about your business, choose your stall and get ready to showcase your brand.",
    selectedEvent: "YOUR SELECTED EVENT",

    personalTitle: "Your Details",
    personalSubtitle: "Who will be booking this stall?",
    firstName: "First Name",
    lastName: "Last Name",
    phone: "Mobile Number",
    email: "Email Address",
    firstPlaceholder: "Enter first name",
    lastPlaceholder: "Enter last name",
    phonePlaceholder: "10-digit mobile number",
    emailPlaceholder: "you@example.com",

    businessTitle: "Business Details",
    businessSubtitle: "Tell us what your brand is about.",
    brandName: "Brand / Business Name",
    brandPlaceholder: "Enter your brand name",
    category: "Business Category",
    selectCategory: "Select category",
    products: "What products will you sell?",
    productsPlaceholder:
      "Describe the products or services you will showcase...",
    stallType: "Stall Type",
    selectStallType: "Select stall type",

    categories: [
      "Fashion",
      "Food & Beverages",
      "Beauty & Skincare",
      "Jewellery & Accessories",
      "Handmade & Crafts",
      "Home & Lifestyle",
      "Art",
      "Other",
    ],

    stallTypes: [
      "Standard Stall",
      "Corner Stall",
      "Premium Stall",
      "Food Stall",
      "Custom Stall",
    ],

    stallTitle: "Choose Your Stall",
    stallSubtitle: "Select one available stall from the layout.",
    available: "Available",
    selected: "Selected",
    booked: "Booked",
    stall: "Stall",

    summary: "Booking Summary",
    stallPrice: "Stall Price",
    discount: "Discount",
    bookingFee: "Booking Fee",
    total: "Total Booking Amount",
    selectStall: "Select a stall",

    paymentTitle: "Choose Payment Option",
    fullPayment: "Full Payment",
    fullDescription: "Pay the complete amount now.",
    advancePayment: "Advance Payment",
    advanceDescription: "Pay ₹1,500 now and the balance later.",
    payNow: "Pay Now",
    remaining: "Remaining Payment",
    payButton: "Pay",
    fullNote: "Your full booking amount will be payable now.",
    advanceNote:
      "Your booking will remain partially paid until the remaining balance is received.",
    verification:
      "Final confirmation requires successful payment verification.",

    help: "Need help?",
    helpText: "Contact the event organiser for stall-related queries.",

    eventNotFound: "Event not found",
    explore: "Explore Events",

    errors: {
      firstName: "First name is required",
      lastName: "Last name is required",
      phone: "Enter a valid 10-digit Indian mobile number",
      email: "Enter a valid email address",
      brandName: "Brand name is required",
      category: "Please select a business category",
      products: "Please describe your products",
      stallType: "Please select a stall type",
      stall: "Please select an available stall",
    },

    success: "Booking details saved!",
    paymentOption: "Payment option",
    full: "Full Payment",
    advance: "Advance Payment",
    remainingAlert: "Remaining",
    razorpay: "Razorpay integration is required to complete payment.",
  },

  hi: {
    back: "कार्यक्रम पर वापस जाएँ",
    eyebrow: "स्टॉलोरा बुकिंग",
    title: "अपनी जगह आरक्षित करें।",
    subtitle:
      "अपने व्यवसाय की जानकारी दें, स्टॉल चुनें और अपने ब्रांड को प्रदर्शित करने के लिए तैयार हो जाएँ।",
    selectedEvent: "आपका चुना हुआ कार्यक्रम",

    personalTitle: "आपकी जानकारी",
    personalSubtitle: "यह स्टॉल कौन बुक करेगा?",
    firstName: "पहला नाम",
    lastName: "उपनाम",
    phone: "मोबाइल नंबर",
    email: "ईमेल पता",
    firstPlaceholder: "पहला नाम दर्ज करें",
    lastPlaceholder: "उपनाम दर्ज करें",
    phonePlaceholder: "10 अंकों का मोबाइल नंबर",
    emailPlaceholder: "आपका ईमेल पता",

    businessTitle: "व्यवसाय की जानकारी",
    businessSubtitle: "अपने ब्रांड के बारे में बताएँ।",
    brandName: "ब्रांड / व्यवसाय का नाम",
    brandPlaceholder: "अपने ब्रांड का नाम दर्ज करें",
    category: "व्यवसाय की श्रेणी",
    selectCategory: "श्रेणी चुनें",
    products: "आप कौन से उत्पाद बेचेंगे?",
    productsPlaceholder: "अपने उत्पादों या सेवाओं के बारे में बताएँ...",
    stallType: "स्टॉल का प्रकार",
    selectStallType: "स्टॉल का प्रकार चुनें",

    categories: [
      "फैशन",
      "खाद्य और पेय",
      "ब्यूटी और स्किनकेयर",
      "आभूषण और एक्सेसरीज़",
      "हस्तनिर्मित और शिल्प",
      "घर और लाइफस्टाइल",
      "कला",
      "अन्य",
    ],

    stallTypes: [
      "स्टैंडर्ड स्टॉल",
      "कॉर्नर स्टॉल",
      "प्रीमियम स्टॉल",
      "फूड स्टॉल",
      "कस्टम स्टॉल",
    ],

    stallTitle: "अपना स्टॉल चुनें",
    stallSubtitle: "लेआउट में से एक उपलब्ध स्टॉल चुनें।",
    available: "उपलब्ध",
    selected: "चुना गया",
    booked: "बुक हो चुका",
    stall: "स्टॉल",

    summary: "बुकिंग का विवरण",
    stallPrice: "स्टॉल की कीमत",
    discount: "छूट",
    bookingFee: "बुकिंग शुल्क",
    total: "कुल बुकिंग राशि",
    selectStall: "स्टॉल चुनें",

    paymentTitle: "भुगतान विकल्प चुनें",
    fullPayment: "पूरा भुगतान",
    fullDescription: "अभी पूरी राशि का भुगतान करें।",
    advancePayment: "अग्रिम भुगतान",
    advanceDescription: "अभी ₹1,500 दें और बाकी राशि बाद में दें।",
    payNow: "अभी भुगतान करें",
    remaining: "बाकी भुगतान",
    payButton: "भुगतान करें",
    fullNote: "आपको अभी पूरी बुकिंग राशि का भुगतान करना होगा।",
    advanceNote:
      "बाकी राशि प्राप्त होने तक आपकी बुकिंग आंशिक रूप से भुगतान की गई रहेगी।",
    verification: "बुकिंग की अंतिम पुष्टि भुगतान सत्यापन के बाद होगी।",

    help: "मदद चाहिए?",
    helpText: "स्टॉल से संबंधित प्रश्नों के लिए आयोजक से संपर्क करें।",

    eventNotFound: "कार्यक्रम नहीं मिला",
    explore: "कार्यक्रम देखें",

    errors: {
      firstName: "पहला नाम आवश्यक है",
      lastName: "उपनाम आवश्यक है",
      phone: "सही 10 अंकों का मोबाइल नंबर दर्ज करें",
      email: "सही ईमेल पता दर्ज करें",
      brandName: "ब्रांड का नाम आवश्यक है",
      category: "व्यवसाय की श्रेणी चुनें",
      products: "अपने उत्पादों के बारे में बताएँ",
      stallType: "स्टॉल का प्रकार चुनें",
      stall: "कृपया उपलब्ध स्टॉल चुनें",
    },

    success: "बुकिंग की जानकारी सेव हो गई!",
    paymentOption: "भुगतान विकल्प",
    full: "पूरा भुगतान",
    advance: "अग्रिम भुगतान",
    remainingAlert: "बाकी राशि",
    razorpay: "भुगतान पूरा करने के लिए Razorpay इंटीग्रेशन आवश्यक है।",
  },

  mr: {
    back: "कार्यक्रमाकडे परत जा",
    eyebrow: "स्टॉलोरा बुकिंग",
    title: "तुमची जागा आरक्षित करा.",
    subtitle:
      "तुमच्या व्यवसायाची माहिती द्या, स्टॉल निवडा आणि तुमचा ब्रँड प्रदर्शित करण्यासाठी तयार व्हा.",
    selectedEvent: "तुमचा निवडलेला कार्यक्रम",

    personalTitle: "तुमची माहिती",
    personalSubtitle: "हा स्टॉल कोण बुक करणार आहे?",
    firstName: "पहिले नाव",
    lastName: "आडनाव",
    phone: "मोबाईल नंबर",
    email: "ईमेल पत्ता",
    firstPlaceholder: "पहिले नाव लिहा",
    lastPlaceholder: "आडनाव लिहा",
    phonePlaceholder: "10 अंकी मोबाईल नंबर",
    emailPlaceholder: "तुमचा ईमेल पत्ता",

    businessTitle: "व्यवसायाची माहिती",
    businessSubtitle: "तुमच्या ब्रँडबद्दल माहिती द्या.",
    brandName: "ब्रँड / व्यवसायाचे नाव",
    brandPlaceholder: "तुमच्या ब्रँडचे नाव लिहा",
    category: "व्यवसायाची श्रेणी",
    selectCategory: "श्रेणी निवडा",
    products: "तुम्ही कोणती उत्पादने विकणार आहात?",
    productsPlaceholder: "तुमची उत्पादने किंवा सेवा याबद्दल माहिती द्या...",
    stallType: "स्टॉलचा प्रकार",
    selectStallType: "स्टॉलचा प्रकार निवडा",

    categories: [
      "फॅशन",
      "खाद्यपदार्थ आणि पेये",
      "ब्युटी आणि स्किनकेअर",
      "दागिने आणि ॲक्सेसरीज",
      "हस्तकला आणि क्राफ्ट",
      "घर आणि लाइफस्टाइल",
      "कला",
      "इतर",
    ],

    stallTypes: [
      "स्टँडर्ड स्टॉल",
      "कॉर्नर स्टॉल",
      "प्रीमियम स्टॉल",
      "फूड स्टॉल",
      "कस्टम स्टॉल",
    ],

    stallTitle: "तुमचा स्टॉल निवडा",
    stallSubtitle: "लेआउटमधून एक उपलब्ध स्टॉल निवडा.",
    available: "उपलब्ध",
    selected: "निवडलेला",
    booked: "बुक झालेला",
    stall: "स्टॉल",

    summary: "बुकिंगचा तपशील",
    stallPrice: "स्टॉलची किंमत",
    discount: "सूट",
    bookingFee: "बुकिंग शुल्क",
    total: "एकूण बुकिंग रक्कम",
    selectStall: "स्टॉल निवडा",

    paymentTitle: "पेमेंट पर्याय निवडा",
    fullPayment: "पूर्ण पेमेंट",
    fullDescription: "संपूर्ण रक्कम आत्ताच भरा.",
    advancePayment: "ॲडव्हान्स पेमेंट",
    advanceDescription: "आत्ता ₹1,500 भरा आणि उर्वरित रक्कम नंतर भरा.",
    payNow: "आत्ता पेमेंट करा",
    remaining: "उर्वरित पेमेंट",
    payButton: "पेमेंट करा",
    fullNote: "तुम्हाला संपूर्ण बुकिंग रक्कम आत्ताच भरावी लागेल.",
    advanceNote: "उर्वरित रक्कम मिळेपर्यंत तुमचे बुकिंग अंशतः भरलेले राहील.",
    verification: "पेमेंट पडताळणीनंतरच बुकिंग निश्चित होईल.",

    help: "मदत हवी आहे?",
    helpText: "स्टॉलविषयक प्रश्नांसाठी आयोजकाशी संपर्क साधा.",

    eventNotFound: "कार्यक्रम सापडला नाही",
    explore: "कार्यक्रम पाहा",

    errors: {
      firstName: "पहिले नाव आवश्यक आहे",
      lastName: "आडनाव आवश्यक आहे",
      phone: "योग्य 10 अंकी मोबाईल नंबर टाका",
      email: "योग्य ईमेल पत्ता टाका",
      brandName: "ब्रँडचे नाव आवश्यक आहे",
      category: "व्यवसायाची श्रेणी निवडा",
      products: "तुमच्या उत्पादनांबद्दल माहिती द्या",
      stallType: "स्टॉलचा प्रकार निवडा",
      stall: "कृपया उपलब्ध स्टॉल निवडा",
    },

    success: "बुकिंगची माहिती सेव्ह झाली!",
    paymentOption: "पेमेंट पर्याय",
    full: "पूर्ण पेमेंट",
    advance: "ॲडव्हान्स पेमेंट",
    remainingAlert: "उर्वरित रक्कम",
    razorpay: "पेमेंट पूर्ण करण्यासाठी Razorpay इंटिग्रेशन आवश्यक आहे.",
  },
};

// ==========================================
// INITIAL FORM
// ==========================================

const initialForm = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  brandName: "",
  category: "",
  products: "",
  stallType: "",
};

// ==========================================
// BOOKING PAGE
// ==========================================

export default function Booking() {
  const { eventId } = useParams();
  const location = useLocation();

  const { language } = useLanguage();

  const t = translations[language] || translations.en;

  const { event, details, loading } = useEvent(eventId);

  // Razorpay step
  const [pendingBooking, setPendingBooking] = useState(null);
  const [paid, setPaid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState(initialForm);

  const [selectedStall, setSelectedStall] = useState(
    location.state?.selectedStall || "",
  );

  const [paymentOption, setPaymentOption] = useState("full");
  const [errors, setErrors] = useState({});

  const stalls = details?.stalls || [];

  const selected = useMemo(
    () => stalls.find((stall) => stall.id === selectedStall),
    [stalls, selectedStall],
  );

  // ==========================================
  // PRICE CALCULATION
  // ==========================================

  const stallPrice = selected?.price || 0;

  const discount = selected ? Math.min(BOOKING_DISCOUNT, stallPrice) : 0;

  const total = selected ? stallPrice - discount + BOOKING_FEE : 0;

  const amountToPayNow =
    paymentOption === "full" ? total : Math.min(ADVANCE_PAYMENT, total);

  const remainingAmount = total - amountToPayNow;

  const formatPrice = (amount) => `₹${amount.toLocaleString("en-IN")}`;

  // ==========================================
  // EVENT NOT FOUND
  // ==========================================

  if (loading) {
    return (
      <main className="booking-page">
        <div className="booking-not-found">
          <p>Loading…</p>
        </div>
      </main>
    );
  }

  if (!event || !details) {
    return (
      <main className="booking-page">
        <div className="booking-not-found">
          <h1>{t.eventNotFound}</h1>
          <Link to="/vendors">{t.explore}</Link>
        </div>
      </main>
    );
  }

  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  // ==========================================
  // VALIDATION
  // ==========================================

  const validateForm = () => {
    const newErrors = {};

    if (!form.firstName.trim()) {
      newErrors.firstName = t.errors.firstName;
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = t.errors.lastName;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      newErrors.phone = t.errors.phone;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = t.errors.email;
    }

    if (!form.brandName.trim()) {
      newErrors.brandName = t.errors.brandName;
    }

    if (!form.category) {
      newErrors.category = t.errors.category;
    }

    if (!form.products.trim()) {
      newErrors.products = t.errors.products;
    }

    if (!form.stallType) {
      newErrors.stallType = t.errors.stallType;
    }

    if (!selected || !selected.available) {
      newErrors.stall = t.errors.stall;
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ==========================================
  // PAYMENT HANDLER
  // ==========================================

  const handlePayment = async (e) => {
    e.preventDefault();

    if (submitting) return;

    if (!validateForm()) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      // The server re-checks the stall and works out the price itself
      const booking = await apiFetch("/bookings", {
        method: "POST",
        role: isLoggedIn("vendor") ? "vendor" : undefined,
        body: {
          kind: "booking",
          eventId: event.id,
          stallId: selected.id,
          paymentOption,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          email: form.email,
          brandName: form.brandName,
          category: form.category,
          products: form.products,
        },
      });
      setPendingBooking(booking);
      // jump straight to the QR code (smooth scrolling can stop half-way)
      requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" }));
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // PAYMENT STEP / DONE
  // ==========================================

  if (paid) {
    return (
      <main className="booking-page">
        <div className="pay-panel">
          <div className="pay-panel-done">✓</div>
          <h2>Stall booked!</h2>
          <p>
            Stall {pendingBooking?.stall?.id} at {event.title} is reserved for you. The organiser will contact you
            with the next steps.
          </p>
          {pendingBooking?.remainingAmount > 0 && (
            <p>Remaining to pay later: {formatPrice(pendingBooking.remainingAmount)}</p>
          )}
          <Link className="pay-panel-button" to={isLoggedIn("vendor") ? "/vendor/bookings" : "/vendors"}>
            {isLoggedIn("vendor") ? "See my bookings" : "Explore more events"}
          </Link>
        </div>
      </main>
    );
  }

  if (pendingBooking) {
    return (
      <main className="booking-page">
        <PaymentLinkPanel
          booking={pendingBooking}
          onPaid={() => setPaid(true)}
          onCancel={() => setPendingBooking(null)}
        />
      </main>
    );
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <main className="booking-page">
      <div className="booking-container">
        {/* BACK BUTTON */}

        <Link to={`/event/${eventId}`} className="booking-back">
          <ArrowLeft size={17} />
          {t.back}
        </Link>

        {/* PAGE HEADING */}

        <header className="booking-heading">
          <span>{t.eyebrow}</span>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </header>

        {/* EVENT INFORMATION */}

        <div className="booking-event-banner">
          <img
            src={event.image}
            alt={event.title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1000&q=85";
            }}
          />

          <div>
            <span>{t.selectedEvent}</span>
            <h2>{event.title}</h2>

            <p>
              <MapPin size={15} />
              {event.venue}
            </p>

            <p>
              <CalendarDays size={15} />
              {event.date}
            </p>
          </div>
        </div>

        {/* BOOKING FORM */}

        <form onSubmit={handlePayment} noValidate>
          <div className="booking-layout">
            <div className="booking-main">
              {/* CUSTOMER DETAILS */}

              <section className="booking-card">
                <div className="booking-card-heading">
                  <span>01</span>

                  <div>
                    <h2>{t.personalTitle}</h2>
                    <p>{t.personalSubtitle}</p>
                  </div>
                </div>

                <div className="booking-form-grid">
                  <div className="booking-field">
                    <label>{t.firstName} *</label>
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder={t.firstPlaceholder}
                      autoComplete="given-name"
                    />
                    {errors.firstName && <small>{errors.firstName}</small>}
                  </div>

                  <div className="booking-field">
                    <label>{t.lastName} *</label>
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder={t.lastPlaceholder}
                      autoComplete="family-name"
                    />
                    {errors.lastName && <small>{errors.lastName}</small>}
                  </div>

                  <div className="booking-field">
                    <label>{t.phone} *</label>
                    <input
                      type="tel"
                      name="phone"
                      maxLength="10"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder={t.phonePlaceholder}
                      autoComplete="tel-national"
                    />
                    {errors.phone && <small>{errors.phone}</small>}
                  </div>

                  <div className="booking-field">
                    <label>{t.email} *</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder={t.emailPlaceholder}
                      autoComplete="email"
                    />
                    {errors.email && <small>{errors.email}</small>}
                  </div>
                </div>
              </section>

              {/* BUSINESS DETAILS */}

              <section className="booking-card">
                <div className="booking-card-heading">
                  <span>02</span>

                  <div>
                    <h2>{t.businessTitle}</h2>
                    <p>{t.businessSubtitle}</p>
                  </div>
                </div>

                <div className="booking-form-grid">
                  <div className="booking-field full">
                    <label>{t.brandName} *</label>
                    <input
                      name="brandName"
                      value={form.brandName}
                      onChange={handleChange}
                      placeholder={t.brandPlaceholder}
                    />
                    {errors.brandName && <small>{errors.brandName}</small>}
                  </div>

                  <div className="booking-field">
                    <label>{t.category} *</label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                    >
                      <option value="">{t.selectCategory}</option>

                      {t.categories.map((category, index) => (
                        <option key={index} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    {errors.category && <small>{errors.category}</small>}
                  </div>

                  <div className="booking-field">
                    <label>{t.stallType} *</label>
                    <select
                      name="stallType"
                      value={form.stallType}
                      onChange={handleChange}
                    >
                      <option value="">{t.selectStallType}</option>

                      {t.stallTypes.map((type, index) => (
                        <option key={index} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {errors.stallType && <small>{errors.stallType}</small>}
                  </div>

                  <div className="booking-field full">
                    <label>{t.products} *</label>
                    <textarea
                      name="products"
                      rows="4"
                      value={form.products}
                      onChange={handleChange}
                      placeholder={t.productsPlaceholder}
                    />
                    {errors.products && <small>{errors.products}</small>}
                  </div>
                </div>
              </section>

              {/* STALL SELECTION */}

              <section className="booking-card">
                <div className="booking-card-heading">
                  <span>03</span>

                  <div>
                    <h2>{t.stallTitle}</h2>
                    <p>{t.stallSubtitle}</p>
                  </div>
                </div>

                <div className="booking-stall-legend">
                  <span>
                    <i className="legend-available" />
                    {t.available}
                  </span>

                  <span>
                    <i className="legend-selected" />
                    {t.selected}
                  </span>

                  <span>
                    <i className="legend-booked" />
                    {t.booked}
                  </span>
                </div>

                <div className="booking-stall-map">
                  {stalls.map((stall) => (
                    <button
                      key={stall.id}
                      type="button"
                      disabled={!stall.available}
                      onClick={() => {
                        setSelectedStall(stall.id);
                        setErrors((previous) => ({
                          ...previous,
                          stall: "",
                        }));
                      }}
                      className={`
                        booking-stall
                        ${!stall.available ? "booked" : ""}
                        ${selectedStall === stall.id ? "active" : ""}
                      `}
                    >
                      <strong>{stall.id}</strong>

                      <span>{stall.available ? t.available : t.booked}</span>
                    </button>
                  ))}
                </div>

                {errors.stall && (
                  <p className="booking-error">{errors.stall}</p>
                )}

                {selected && (
                  <div className="booking-selected-stall">
                    <CheckCircle2 size={20} />

                    <div>
                      <strong>{selected.type}</strong>

                      <span>
                        {t.stall} {selected.id} · {selected.size}
                      </span>
                    </div>

                    <strong>{formatPrice(selected.price)}</strong>
                  </div>
                )}
              </section>
            </div>

            {/* BOOKING SUMMARY */}

            <aside className="booking-sidebar">
              <section className="booking-summary">
                <div className="booking-summary-heading">
                  <CreditCard size={22} />
                  <h2>{t.summary}</h2>
                </div>

                <p className="booking-summary-event">{event.title}</p>

                <div className="booking-summary-line">
                  <span>{t.stallPrice}</span>
                  <strong>
                    {selected ? formatPrice(stallPrice) : t.selectStall}
                  </strong>
                </div>

                <div className="booking-summary-line discount">
                  <span>{t.discount}</span>
                  <strong>
                    {selected ? `−${formatPrice(discount)}` : "—"}
                  </strong>
                </div>

                <div className="booking-summary-line">
                  <span>{t.bookingFee}</span>
                  <strong>{selected ? formatPrice(BOOKING_FEE) : "—"}</strong>
                </div>

                <div className="booking-total">
                  <span>{t.total}</span>
                  <strong>{formatPrice(total)}</strong>
                </div>

                {/* PAYMENT OPTIONS */}

                <div className="payment-options">
                  <h3>{t.paymentTitle}</h3>

                  <label
                    className={`payment-option ${
                      paymentOption === "full" ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentOption"
                      value="full"
                      checked={paymentOption === "full"}
                      onChange={() => setPaymentOption("full")}
                    />

                    <div>
                      <strong>{t.fullPayment}</strong>
                      <span>{t.fullDescription}</span>
                    </div>

                    <strong>{formatPrice(total)}</strong>
                  </label>

                  <label
                    className={`payment-option ${
                      paymentOption === "advance" ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentOption"
                      value="advance"
                      checked={paymentOption === "advance"}
                      onChange={() => setPaymentOption("advance")}
                    />

                    <div>
                      <strong>{t.advancePayment}</strong>
                      <span>{t.advanceDescription}</span>
                    </div>

                    <strong>
                      {formatPrice(Math.min(ADVANCE_PAYMENT, total))}
                    </strong>
                  </label>
                </div>

                {/* PAYMENT BREAKDOWN */}

                <div className="payment-breakdown">
                  <div>
                    <span>{t.payNow}</span>
                    <strong>{formatPrice(amountToPayNow)}</strong>
                  </div>

                  <div>
                    <span>{t.remaining}</span>
                    <strong>{formatPrice(remainingAmount)}</strong>
                  </div>
                </div>

                {/* PAYMENT BUTTON */}

                {submitError && (
                  <p className="booking-secure-note" role="alert" style={{ color: "#b4232c" }}>
                    {submitError}
                  </p>
                )}

                <button
                  type="submit"
                  className="booking-pay-button"
                  disabled={!selected || submitting}
                >
                  {submitting ? "Starting payment…" : `${t.payButton} ${formatPrice(amountToPayNow)}`}
                  <CreditCard size={18} />
                </button>

                <p className="booking-secure-note">
                  {paymentOption === "full" ? t.fullNote : t.advanceNote}{" "}
                  {t.verification}
                </p>
              </section>

              {/* HELP */}

              <div className="booking-help">
                <Store size={20} />

                <div>
                  <strong>{t.help}</strong>
                  <p>{t.helpText}</p>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </main>
  );
}
