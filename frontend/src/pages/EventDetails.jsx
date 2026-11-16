import { Link, useParams } from "react-router-dom";

import {
  MapPin,
  CalendarDays,
  Clock,
  Users,
  Mail,
  Phone,
  ArrowLeft,
} from "lucide-react";

import { events, eventDetails } from "../data/events";
import { useLanguage } from "../context/LanguageContext";

import "../css/EventDetails.css";

// ==========================================
// TRANSLATIONS
// ==========================================

const translations = {
  en: {
    eventNotFound: "Event not found",
    notFoundDescription:
      "This event may have been removed or the link may be incorrect.",
    backEvents: "Back to events",
    backAllEvents: "Back to all events",
    event: "STALLORA EVENT",
    eventDates: "EVENT DATES",
    eventTimings: "EVENT TIMINGS",
    footfall: "EXPECTED FOOTFALL",
    comingSoon: "Details coming soon",
    about: "ABOUT THE EVENT",
    aboutTitle: "Be part of something exciting.",
    aboutFallback:
      "More event information will be added by the organiser soon. Contact the organiser for stall availability and participation details.",
    audienceTitle: "Who will you meet?",
    audienceFallback: "Event audience details will be announced soon.",
    gallery: "EVENT GALLERY",
    galleryTitle: "Get a feel for the experience.",
    nextStep: "YOUR NEXT STEP",
    reserveStall: "Reserve your stall",
    bookingDescription:
      "Ready to showcase your brand? Continue to the booking form to enter your details and choose your stall.",
    chooseOnNextPage: "Choose your stall on the next page.",
    requestBooking: "Request to Book Stall",
    bookingNote: "Select your stall and payment option on the next page.",
    organiser: "EVENT ORGANISER",
    organiserDescription:
      "Contact the organiser for event and stall-related questions.",
    fewLeft: "Few Stalls Left",
    stallsOpen: "Stalls Open",
  },

  hi: {
    eventNotFound: "कार्यक्रम नहीं मिला",
    notFoundDescription:
      "यह कार्यक्रम हटाया जा चुका हो सकता है या लिंक गलत हो सकता है।",
    backEvents: "कार्यक्रमों पर वापस जाएँ",
    backAllEvents: "सभी कार्यक्रमों पर वापस जाएँ",
    event: "स्टॉलोरा कार्यक्रम",
    eventDates: "कार्यक्रम की तारीखें",
    eventTimings: "कार्यक्रम का समय",
    footfall: "अनुमानित आगंतुक",
    comingSoon: "जानकारी जल्द उपलब्ध होगी",
    about: "कार्यक्रम के बारे में",
    aboutTitle: "कुछ रोमांचक अनुभव का हिस्सा बनें।",
    aboutFallback:
      "आयोजक जल्द ही कार्यक्रम की अधिक जानकारी देंगे। स्टॉल की उपलब्धता और भागीदारी के लिए आयोजक से संपर्क करें।",
    audienceTitle: "आप किन लोगों से मिलेंगे?",
    audienceFallback: "कार्यक्रम के दर्शकों की जानकारी जल्द घोषित होगी।",
    gallery: "कार्यक्रम की तस्वीरें",
    galleryTitle: "इस अनुभव की झलक देखें।",
    nextStep: "आपका अगला कदम",
    reserveStall: "अपना स्टॉल आरक्षित करें",
    bookingDescription:
      "अपना ब्रांड प्रदर्शित करने के लिए बुकिंग फॉर्म में आगे बढ़ें और अपनी जानकारी भरें।",
    chooseOnNextPage: "अगले पेज पर अपना स्टॉल चुनें।",
    requestBooking: "स्टॉल बुक करने का अनुरोध करें",
    bookingNote: "अगले पेज पर अपना स्टॉल और भुगतान विकल्प चुनें।",
    organiser: "कार्यक्रम आयोजक",
    organiserDescription:
      "कार्यक्रम और स्टॉल से संबंधित प्रश्नों के लिए आयोजक से संपर्क करें।",
    fewLeft: "कुछ स्टॉल बाकी",
    stallsOpen: "स्टॉल उपलब्ध",
  },

  mr: {
    eventNotFound: "कार्यक्रम सापडला नाही",
    notFoundDescription:
      "हा कार्यक्रम काढला गेला असू शकतो किंवा लिंक चुकीची असू शकते.",
    backEvents: "कार्यक्रमांकडे परत जा",
    backAllEvents: "सर्व कार्यक्रमांकडे परत जा",
    event: "स्टॉलोरा कार्यक्रम",
    eventDates: "कार्यक्रमाच्या तारखा",
    eventTimings: "कार्यक्रमाची वेळ",
    footfall: "अपेक्षित उपस्थिती",
    comingSoon: "माहिती लवकरच उपलब्ध होईल",
    about: "कार्यक्रमाबद्दल",
    aboutTitle: "एका रोमांचक अनुभवाचा भाग व्हा.",
    aboutFallback:
      "आयोजक लवकरच कार्यक्रमाची अधिक माहिती देतील. स्टॉलची उपलब्धता आणि सहभागासाठी आयोजकाशी संपर्क साधा.",
    audienceTitle: "तुम्हाला कोण भेटणार?",
    audienceFallback: "कार्यक्रमातील प्रेक्षकांची माहिती लवकरच जाहीर होईल.",
    gallery: "कार्यक्रमाची छायाचित्रे",
    galleryTitle: "या अनुभवाची झलक पाहा.",
    nextStep: "तुमची पुढची पायरी",
    reserveStall: "तुमचा स्टॉल आरक्षित करा",
    bookingDescription:
      "तुमचा ब्रँड प्रदर्शित करण्यासाठी बुकिंग फॉर्ममध्ये पुढे जा आणि तुमची माहिती भरा.",
    chooseOnNextPage: "पुढील पेजवर तुमचा स्टॉल निवडा.",
    requestBooking: "स्टॉल बुक करण्याची विनंती करा",
    bookingNote: "पुढील पेजवर तुमचा स्टॉल आणि पेमेंट पर्याय निवडा.",
    organiser: "कार्यक्रम आयोजक",
    organiserDescription:
      "कार्यक्रम आणि स्टॉलविषयी प्रश्नांसाठी आयोजकाशी संपर्क साधा.",
    fewLeft: "काही स्टॉल शिल्लक",
    stallsOpen: "स्टॉल उपलब्ध",
  },
};

// ==========================================
// EVENT DETAILS PAGE
// ==========================================

export default function EventDetails() {
  const { eventId } = useParams();

  const { language } = useLanguage();

  const t = translations[language] || translations.en;

  const event = events.find((item) => item.id === eventId);

  const details = eventDetails[eventId];

  const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1000&q=85";

  const handleImageError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = FALLBACK_IMAGE;
  };

  // ==========================================
  // EVENT NOT FOUND
  // ==========================================

  if (!event) {
    return (
      <main className="event-detail-page">
        <div className="event-not-found">
          <h1>{t.eventNotFound}</h1>

          <p>{t.notFoundDescription}</p>

          <Link to="/vendors">{t.backEvents}</Link>
        </div>
      </main>
    );
  }

  // ==========================================
  // EVENT GALLERY
  // ==========================================

  const gallery =
    details?.gallery?.length > 0
      ? details.gallery
      : [event.image, event.image, event.image];

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="event-detail-page">
      <div className="event-detail-wrap">
        {/* BACK BUTTON */}

        <Link to="/vendors" className="event-back-link">
          <ArrowLeft size={17} />
          {t.backAllEvents}
        </Link>

        {/* EVENT HERO */}

        <section className="event-detail-hero">
          <img
            src={event.image || FALLBACK_IMAGE}
            alt={event.title}
            onError={handleImageError}
          />

          <div className="event-detail-hero-overlay">
            <span className="event-detail-kicker">{t.event}</span>

            <h1>{event.title}</h1>

            <p>
              <MapPin size={17} />
              {event.venue}
            </p>
          </div>

          <span className="event-detail-status">
            {event.status === "Few Stalls Left" ? t.fewLeft : t.stallsOpen}
          </span>
        </section>

        {/* EVENT FACTS */}

        <section className="event-facts">
          <div>
            <CalendarDays />

            <span>
              <small>{t.eventDates}</small>
              <strong>{event.date}</strong>
            </span>
          </div>

          <div>
            <Clock />

            <span>
              <small>{t.eventTimings}</small>
              <strong>{event.time}</strong>
            </span>
          </div>

          <div>
            <Users />

            <span>
              <small>{t.footfall}</small>
              <strong>{details?.footfall || t.comingSoon}</strong>
            </span>
          </div>
        </section>

        {/* MAIN CONTENT */}

        <div className="event-detail-columns">
          <div className="event-detail-main">
            {/* ABOUT EVENT */}

            <section className="event-content-card">
              <span className="event-detail-kicker">{t.about}</span>

              <h2>{t.aboutTitle}</h2>

              <p>{details?.about || t.aboutFallback}</p>

              <div className="event-audience">
                <strong>{t.audienceTitle}</strong>

                <p>{details?.audience || t.audienceFallback}</p>
              </div>
            </section>

            {/* EVENT GALLERY */}

            <section className="event-content-card">
              <span className="event-detail-kicker">{t.gallery}</span>

              <h2>{t.galleryTitle}</h2>

              <div className="event-gallery">
                {gallery.map((image, index) => (
                  <img
                    key={`${image}-${index}`}
                    src={image || FALLBACK_IMAGE}
                    alt={`${event.title} gallery ${index + 1}`}
                    onError={handleImageError}
                    loading="lazy"
                  />
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT SIDEBAR */}

          <aside className="event-detail-sidebar">
            {/* BOOKING CARD */}

            <section className="event-booking-card">
              <span className="event-detail-kicker">{t.nextStep}</span>

              <h2>{t.reserveStall}</h2>

              <p>{t.bookingDescription}</p>

              <div className="booking-placeholder">{t.chooseOnNextPage}</div>

              {/* GO TO BOOKING PAGE */}

              <Link
                to={`/book/${eventId}`}
                className="event-book-button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                }}
              >
                {t.requestBooking}
              </Link>

              <small className="booking-note">{t.bookingNote}</small>
            </section>

            {/* ORGANISER INFORMATION */}

            <section className="event-organiser-card">
              <span className="event-detail-kicker">{t.organiser}</span>

              <h3>{event.organiser}</h3>

              <p>{t.organiserDescription}</p>

              {details?.organiserPhone && (
                <a href={`tel:${details.organiserPhone}`}>
                  <Phone size={16} />
                  {details.organiserPhone}
                </a>
              )}

              {details?.organiserEmail && (
                <a href={`mailto:${details.organiserEmail}`}>
                  <Mail size={16} />
                  {details.organiserEmail}
                </a>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
