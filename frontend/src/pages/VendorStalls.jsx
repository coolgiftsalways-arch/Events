import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Clock,
  Store,
  Lock,
  ArrowRight,
  CheckCircle,
  Crown,
  Ticket,
  AlertCircle,
} from "lucide-react";

import "../css/VendorFlow.css";

const EVENTS_KEY = "stalloraOrganiserEvents";
const BOOKINGS_KEY = "stalloraVendorBookings";
const MEMBERSHIP_KEY = "stalloraVendorMembership";

function readStorage(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`Unable to read ${key}:`, error);
    return fallback;
  }
}

function getActiveMembership() {
  const membership = readStorage(MEMBERSHIP_KEY, null);

  if (!membership || membership.status !== "active") {
    return null;
  }

  const expiry = new Date(membership.expiresAt).getTime();

  if (!Number.isFinite(expiry) || expiry <= Date.now()) {
    return null;
  }

  return membership;
}

function formatDate(date) {
  if (!date) return "Date not announced";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Date not announced";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(price) {
  const amount = Number(price);

  if (!Number.isFinite(amount)) {
    return "Contact organiser";
  }

  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function VendorStalls() {
  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [membership, setMembership] = useState(getActiveMembership);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // ==========================================
  // REFRESH APPROVED EVENTS
  // ==========================================

  const refreshEvents = () => {
    const savedEvents = readStorage(EVENTS_KEY, []);

    const approvedEvents = Array.isArray(savedEvents)
      ? savedEvents.filter((event) =>
          ["published", "active"].includes(
            String(event.status || "").toLowerCase(),
          ),
        )
      : [];

    setEvents(approvedEvents);
  };

  // ==========================================
  // REFRESH BOOKINGS
  // ==========================================

  const refreshBookings = () => {
    const savedBookings = readStorage(BOOKINGS_KEY, []);

    setBookings(Array.isArray(savedBookings) ? savedBookings : []);
  };

  // ==========================================
  // REFRESH MEMBERSHIP
  // ==========================================

  const refreshMembership = () => {
    setMembership(getActiveMembership());
  };

  // ==========================================
  // CHECK LOGIN AND LOAD DATA
  // ==========================================

  useEffect(() => {
    const session = localStorage.getItem("stalloraVendorSession") === "true";

    const savedVendor = readStorage("stalloraVendor", null);

    if (!session || !savedVendor) {
      navigate("/vendor/login", { replace: true });
      return;
    }

    setVendor(savedVendor);

    refreshEvents();
    refreshBookings();
    refreshMembership();

    window.addEventListener("stallora:events-updated", refreshEvents);

    window.addEventListener("stallora-vendor-updated", refreshMembership);

    window.addEventListener(
      "stallora:vendor-bookings-updated",
      refreshBookings,
    );

    window.addEventListener("storage", refreshEvents);
    window.addEventListener("storage", refreshBookings);

    return () => {
      window.removeEventListener("stallora:events-updated", refreshEvents);

      window.removeEventListener("stallora-vendor-updated", refreshMembership);

      window.removeEventListener(
        "stallora:vendor-bookings-updated",
        refreshBookings,
      );

      window.removeEventListener("storage", refreshEvents);
      window.removeEventListener("storage", refreshBookings);
    };
  }, [navigate]);

  // ==========================================
  // MEMBERSHIP ACCESS
  // ==========================================

  const hasMembership = Boolean(membership);

  // Only 3 events are visible without membership.
  const visibleEvents = hasMembership ? events : events.slice(0, 3);

  const lockedCount = hasMembership ? 0 : Math.max(events.length - 3, 0);

  // ==========================================
  // DISCOUNT LIMIT
  // ==========================================

  const discountedBookings = membership
    ? bookings.filter(
        (booking) =>
          Number(booking.discount) > 0 &&
          booking.membershipName === membership.name,
      ).length
    : 0;

  const discountLimit = membership ? Number(membership.events || 0) : 0;

  const discountRemaining = Math.max(0, discountLimit - discountedBookings);

  // ==========================================
  // ALREADY ENQUIRED EVENTS
  // ==========================================

  const bookedEventIds = useMemo(
    () => bookings.map((booking) => String(booking.eventId)),
    [bookings],
  );

  // ==========================================
  // EVENT ENQUIRY
  // ==========================================

  const handleBookEvent = (event) => {
    setMessage("");

    const session = localStorage.getItem("stalloraVendorSession") === "true";

    if (!session) {
      navigate("/vendor/login");
      return;
    }

    const currentBookings = readStorage(BOOKINGS_KEY, []);

    const alreadyBooked = currentBookings.some(
      (booking) => String(booking.eventId) === String(event.id),
    );

    if (alreadyBooked) {
      setMessage("You have already submitted an enquiry for this event.");

      setMessageType("error");
      return;
    }

    const originalPrice = Number(event.price) || 0;

    const canApplyDiscount = hasMembership && discountRemaining > 0;

    const discount = canApplyDiscount ? Number(membership.discount || 0) : 0;

    const finalPrice = Math.round(originalPrice * (1 - discount / 100));

    const booking = {
      id: `booking-${Date.now()}`,

      eventId: event.id,

      eventTitle: event.title || event.name || "Untitled Event",

      eventDate: event.date || event.startDate || "",

      eventLocation:
        event.location ||
        [event.city, event.state].filter(Boolean).join(", ") ||
        event.venue ||
        "Location not added",

      venue: event.venue || "",

      category: event.category || "General",

      originalPrice,
      discount,
      finalPrice,

      membershipName: canApplyDiscount ? membership.name : null,

      vendorName: vendor.name || "",
      vendorEmail: vendor.email || "",

      status: "Enquiry saved (demo)",

      createdAt: new Date().toISOString(),
    };

    try {
      const updatedBookings = [...currentBookings, booking];

      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updatedBookings));

      setBookings(updatedBookings);

      window.dispatchEvent(new Event("stallora:vendor-bookings-updated"));

      setMessage(
        discount > 0
          ? `Your enquiry has been saved. ${discount}% membership discount applied.`
          : "Your event enquiry has been saved successfully.",
      );

      setMessageType("success");
    } catch (error) {
      console.error("Unable to save event enquiry:", error);

      setMessage("Unable to save your enquiry. Please try again.");

      setMessageType("error");
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (!vendor) {
    return (
      <main className="vf-page">
        <div className="vf-loading">Loading vendor account...</div>
      </main>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <main className="vf-page vf-content-page">
      {/* PAGE HEADING */}

      <div className="vf-page-heading">
        <div>
          <span className="vf-eyebrow">STALLORA MARKETPLACE</span>

          <h1>Discover Events</h1>

          <p>
            Explore approved events and find the right opportunity for your
            business.
          </p>
        </div>

        <div className="vf-welcome-chip">Welcome, {vendor.name}</div>
      </div>

      {/* MEMBERSHIP BANNER */}

      <div className={`vf-access-banner ${hasMembership ? "is-unlocked" : ""}`}>
        <div>
          <strong>
            {hasMembership
              ? `${membership.name} Membership Active`
              : "Preview Access"}
          </strong>

          <span>
            {hasMembership
              ? "All approved events are now unlocked."
              : "You can preview 3 approved events. Unlock all events with a vendor membership."}
          </span>

          {hasMembership && (
            <span>
              {membership.discount}% discount · {discountRemaining} discounted
              bookings remaining
            </span>
          )}
        </div>

        <Link
          to={hasMembership ? "/vendor/profile" : "/vendor/membership"}
          className="vf-button vf-button-primary"
        >
          {hasMembership ? "View Membership" : "Unlock All Events"}
        </Link>
      </div>

      {/* FEEDBACK */}

      {message && (
        <div
          className={
            messageType === "success" ? "vf-success-message" : "vf-error"
          }
          role="status"
        >
          {message}
        </div>
      )}

      {/* EVENT TOOLBAR */}

      <div className="vf-event-toolbar">
        <div>
          <span className="vf-eyebrow">MARKETPLACE</span>

          <h2>Available Events</h2>

          <p>
            {events.length} approved {events.length === 1 ? "event" : "events"}{" "}
            available
          </p>
        </div>

        <div className="vf-event-count">
          <CalendarDays size={18} />

          {hasMembership
            ? `${events.length} Events Unlocked`
            : `${visibleEvents.length} of ${events.length} Visible`}
        </div>
      </div>

      {/* EVENT CARDS */}

      {visibleEvents.length > 0 ? (
        <div className="vf-stall-grid">
          {visibleEvents.map((event) => {
            const eventId = String(event.id);

            const alreadyBooked = bookedEventIds.includes(eventId);

            const availableStalls = Number(
              event.availableStalls ?? event.totalStalls ?? 0,
            );

            const image = event.coverImage || event.image || "";

            const price = Number(event.price) || 0;

            const discountedPrice =
              hasMembership && discountRemaining > 0
                ? Math.round(
                    price * (1 - Number(membership.discount || 0) / 100),
                  )
                : price;

            return (
              <article className="vf-stall-card vf-event-card" key={event.id}>
                {/* EVENT IMAGE */}

                {image ? (
                  <img
                    src={image}
                    alt={event.title || "Event"}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="vf-event-placeholder">
                    <CalendarDays size={42} />
                    <span>STALLORA EVENT</span>
                  </div>
                )}

                <div className="vf-stall-body">
                  <div className="vf-stall-category">
                    {event.category || "General Event"}
                  </div>

                  <h2>{event.title || event.name || "Untitled Event"}</h2>

                  <p>
                    {event.description ||
                      "Discover this event and explore opportunities for your brand."}
                  </p>

                  {/* EVENT DETAILS */}

                  <div className="vf-event-details">
                    <span>
                      <CalendarDays size={15} />
                      {formatDate(event.date || event.startDate)}
                    </span>

                    <span>
                      <MapPin size={15} />
                      {event.location ||
                        [event.city, event.state].filter(Boolean).join(", ") ||
                        event.venue ||
                        "Location not added"}
                    </span>

                    {event.startTime && (
                      <span>
                        <Clock size={15} />

                        {event.startTime}

                        {event.endTime ? ` - ${event.endTime}` : ""}
                      </span>
                    )}

                    <span>
                      <Store size={15} />
                      {availableStalls} stalls available
                    </span>
                  </div>

                  {/* PRICE */}

                  <div className="vf-stall-meta">
                    <span>Stall Price</span>

                    <strong>{formatPrice(price)}</strong>
                  </div>

                  {/* MEMBERSHIP DISCOUNT */}

                  {hasMembership && (
                    <div className="vf-discount-price">
                      {discountRemaining > 0 ? (
                        <>
                          <span className="vf-old-price">
                            {formatPrice(price)}
                          </span>

                          <strong>
                            Membership price: {formatPrice(discountedPrice)}
                          </strong>
                        </>
                      ) : (
                        <span>
                          Your membership discount limit has been used.
                        </span>
                      )}
                    </div>
                  )}

                  {/* ENQUIRY BUTTON */}

                  <button
                    type="button"
                    className="vf-button vf-button-outline"
                    onClick={() => handleBookEvent(event)}
                    disabled={alreadyBooked || availableStalls <= 0}
                  >
                    {alreadyBooked
                      ? "Enquiry Saved"
                      : availableStalls <= 0
                        ? "Currently Full"
                        : "Enquire About This Event"}

                    {!alreadyBooked && availableStalls > 0 && (
                      <ArrowRight size={17} />
                    )}
                  </button>
                </div>
              </article>
            );
          })}

          {/* LOCKED EVENTS */}

          {lockedCount > 0 && (
            <button
              type="button"
              className="vf-locked-card"
              onClick={() => navigate("/vendor/membership")}
            >
              <span className="vf-lock-icon">
                <Lock size={28} />
              </span>

              <strong>{lockedCount} More Events Waiting</strong>

              <span>
                Unlock all approved events and access exclusive membership
                discounts.
              </span>

              <b>View Membership Plans →</b>

              <Crown size={25} />
            </button>
          )}
        </div>
      ) : (
        <div className="vf-empty-events">
          <div>
            <AlertCircle size={35} />
          </div>

          <h2>No approved events available</h2>

          <p>
            Organisers have not published any events yet. Please check back
            later.
          </p>
        </div>
      )}

      {/* INFORMATION */}

      <p className="vf-demo-note">
        Event information is loaded from Organiser-created events. Enquiries are
        currently saved locally as demonstrations. Actual stall reservations,
        availability updates and payment verification require backend
        integration.
      </p>
    </main>
  );
}
