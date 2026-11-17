import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Ticket,
  ArrowRight,
  AlertCircle,
  Store,
} from "lucide-react";
import "../css/VendorFlow.css";

const BOOKINGS_KEY = "stalloraVendorBookings";

const readStoredJSON = (key, fallback) => {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "null");
    return saved ?? fallback;
  } catch (error) {
    console.error(`Unable to read ${key}:`, error);
    return fallback;
  }
};

const getSavedVendor = () => {
  const isLoggedIn = localStorage.getItem("stalloraVendorSession") === "true";

  return isLoggedIn ? readStoredJSON("stalloraVendor", null) : null;
};

const readBookings = () => {
  const saved = readStoredJSON(BOOKINGS_KEY, []);
  return Array.isArray(saved) ? saved : [];
};

function formatDate(date) {
  if (!date) return "Date not available";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Date not available";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(price) {
  const amount = Number(price);

  if (!Number.isFinite(amount)) return "₹0";

  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function VendorBookings() {
  const navigate = useNavigate();

  const [vendor] = useState(getSavedVendor);
  const [bookings, setBookings] = useState(readBookings);

  useEffect(() => {
    if (!getSavedVendor()) {
      navigate("/vendor/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const refreshBookings = () => {
      setBookings(readBookings());
    };

    window.addEventListener(
      "stallora:vendor-bookings-updated",
      refreshBookings,
    );
    window.addEventListener("storage", refreshBookings);
    window.addEventListener("focus", refreshBookings);

    return () => {
      window.removeEventListener(
        "stallora:vendor-bookings-updated",
        refreshBookings,
      );
      window.removeEventListener("storage", refreshBookings);
      window.removeEventListener("focus", refreshBookings);
    };
  }, []);

  if (!vendor) {
    return (
      <main className="vf-page">
        <div className="vf-loading">Loading your bookings...</div>
      </main>
    );
  }

  return (
    <main className="vf-page vf-content-page">
      <div className="vf-page-heading">
        <div>
          <span className="vf-eyebrow">VENDOR ACCOUNT</span>
          <h1>My Bookings</h1>
          <p>
            Track your event enquiries and view your submitted booking details.
          </p>
        </div>

        <div className="vf-welcome-chip">Welcome, {vendor.name}</div>
      </div>

      <div className="vf-access-banner">
        <div>
          <strong>
            {bookings.length} {bookings.length === 1 ? "Enquiry" : "Enquiries"}{" "}
            Submitted
          </strong>
          <span>All your event enquiries are available here.</span>
        </div>

        <Link to="/vendor/stalls" className="vf-button vf-button-primary">
          Explore Events
          <ArrowRight size={17} />
        </Link>
      </div>

      <div className="vf-event-toolbar">
        <div>
          <span className="vf-eyebrow">YOUR ACTIVITY</span>
          <h2>Event Enquiries</h2>
          <p>Your previously submitted event enquiries.</p>
        </div>

        <div className="vf-event-count">
          <Ticket size={18} />
          {bookings.length} Total
        </div>
      </div>

      {bookings.length > 0 ? (
        <div className="vf-bookings-list">
          {bookings
            .slice()
            .reverse()
            .map((booking, index) => (
              <article
                className="vf-booking-card"
                key={booking.id || `${booking.createdAt || "booking"}-${index}`}
              >
                <div className="vf-booking-header">
                  <div className="vf-booking-icon">
                    <CalendarDays size={23} />
                  </div>

                  <div className="vf-booking-title">
                    <span className="vf-eyebrow">EVENT ENQUIRY</span>
                    <h2>
                      {booking.eventTitle ||
                        booking.stallName ||
                        "Event enquiry"}
                    </h2>
                    <span>Submitted on {formatDate(booking.createdAt)}</span>
                  </div>

                  <span className="vf-booking-status">
                    {booking.status || "Enquiry saved (demo)"}
                  </span>
                </div>

                <div className="vf-booking-details">
                  <div>
                    <MapPin size={17} />
                    <span>
                      {booking.eventLocation ||
                        booking.location ||
                        "Location not available"}
                    </span>
                  </div>

                  <div>
                    <CalendarDays size={17} />
                    <span>{formatDate(booking.eventDate || booking.date)}</span>
                  </div>

                  <div>
                    <Store size={17} />
                    <span>{booking.category || "General Event"}</span>
                  </div>

                  {booking.venue && (
                    <div>
                      <MapPin size={17} />
                      <span>{booking.venue}</span>
                    </div>
                  )}
                </div>

                <div className="vf-booking-price">
                  <div>
                    <span>Original Price</span>
                    <strong>
                      {formatPrice(booking.originalPrice ?? booking.finalPrice)}
                    </strong>
                  </div>

                  <div>
                    <span>Membership Discount</span>
                    <strong className="vf-booking-discount">
                      {Number(booking.discount) || 0}%
                    </strong>
                  </div>

                  <div>
                    <span>Final Price</span>
                    <strong>
                      {formatPrice(booking.finalPrice ?? booking.originalPrice)}
                    </strong>
                  </div>
                </div>

                {booking.membershipName && (
                  <div className="vf-booking-membership">
                    <span>Membership applied:</span>
                    <strong>{booking.membershipName}</strong>
                  </div>
                )}

                <div className="vf-booking-note">
                  <AlertCircle size={17} />
                  <span>
                    This is a saved enquiry, not a confirmed stall reservation.
                    The organiser must confirm availability and booking details.
                  </span>
                </div>
              </article>
            ))}
        </div>
      ) : (
        <div className="vf-empty-events">
          <div>
            <Ticket size={36} />
          </div>

          <h2>No bookings yet</h2>
          <p>
            You haven't submitted any event enquiries. Explore available events
            and find the right opportunity for your business.
          </p>

          <Link to="/vendor/stalls" className="vf-button vf-button-primary">
            Discover Events
            <ArrowRight size={17} />
          </Link>
        </div>
      )}

      <p className="vf-demo-note">
        Booking enquiries are currently stored in your browser using
        localStorage. Actual reservations, organiser approval and payment
        processing require backend integration.
      </p>

      <Link to="/vendor/profile" className="vf-back-link">
        ← Back to vendor profile
      </Link>
    </main>
  );
}
