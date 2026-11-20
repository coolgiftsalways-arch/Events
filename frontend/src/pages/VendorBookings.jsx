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
import { apiFetch, isLoggedIn } from "../services/api";
import "../css/VendorFlow.css";

// What each status means to the vendor
const STATUS_TEXT = {
  pending: "Waiting for organiser",
  approved: "Approved",
  rejected: "Not accepted",
  cancelled: "Cancelled",
};

const statusText = (b) => {
  if (b.kind === "booking" && b.paymentStatus === "awaiting") return "Payment not completed";
  if (b.kind === "booking" && b.paymentStatus === "paid" && b.status === "pending") return "Paid · stall reserved";
  return STATUS_TEXT[b.status] || b.status;
};

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
  return isLoggedIn("vendor") ? readStoredJSON("stalloraVendor", null) : null;
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
  const [bookings, setBookings] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!getSavedVendor()) {
      navigate("/vendor/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const refreshBookings = () => {
      if (!isLoggedIn("vendor")) return;
      apiFetch("/bookings/mine", { role: "vendor" })
        .then((list) => setBookings(Array.isArray(list) ? list : []))
        .catch((error) => console.error("Unable to load bookings:", error))
        .finally(() => setLoaded(true));
    };

    refreshBookings();

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
          {bookings.map((booking, index) => (
              <article
                className="vf-booking-card"
                key={booking.id || `${booking.createdAt || "booking"}-${index}`}
              >
                <div className="vf-booking-header">
                  <div className="vf-booking-icon">
                    <CalendarDays size={23} />
                  </div>

                  <div className="vf-booking-title">
                    <span className="vf-eyebrow">
                      {booking.kind === "booking" ? `STALL ${booking.stall?.id || ""} BOOKING` : "EVENT ENQUIRY"}
                    </span>
                    <h2>
                      {booking.eventTitle ||
                        booking.stallName ||
                        "Event enquiry"}
                    </h2>
                    <span>Submitted on {formatDate(booking.createdAt)}</span>
                  </div>

                  <span className="vf-booking-status">
                    {statusText(booking)}
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

                {booking.kind === "booking" && booking.paymentStatus === "paid" && (
                  <div className="vf-booking-membership">
                    <span>Paid:</span>
                    <strong>
                      {formatPrice(booking.amountPaid)}
                      {booking.remainingAmount > 0 && ` · ${formatPrice(booking.remainingAmount)} due later`}
                    </strong>
                  </div>
                )}

                {booking.paymentUrl && (
                  <a className="vf-button vf-button-primary" href={booking.paymentUrl} target="_blank" rel="noreferrer">
                    Complete payment
                  </a>
                )}

                {booking.note && (
                  <div className="vf-booking-membership">
                    <span>Organiser note:</span>
                    <strong>{booking.note}</strong>
                  </div>
                )}

                {booking.kind !== "booking" && booking.status === "pending" && (
                  <div className="vf-booking-note">
                    <AlertCircle size={17} />
                    <span>
                      This is an enquiry, not a confirmed stall reservation.
                      The organiser will confirm availability and contact you.
                    </span>
                  </div>
                )}
              </article>
            ))}
        </div>
      ) : !loaded ? (
        <div className="vf-loading">Loading your bookings...</div>
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

      <Link to="/vendor/profile" className="vf-back-link">
        ← Back to vendor profile
      </Link>
    </main>
  );
}
