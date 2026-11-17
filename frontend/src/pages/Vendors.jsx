import { useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import {
  Search,
  MapPin,
  CalendarDays,
  Tag,
  ChevronDown,
  Heart,
  Clock,
  UserRound,
  ArrowRight,
} from "lucide-react";

import { useLanguage } from "../context/LanguageContext";

import { events as staticEvents } from "../data/events";

import "../css/Vendors.css";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1000&q=85";

const EVENTS_KEY = "stalloraOrganiserEvents";

const MEMBERSHIP_KEY = "stalloraVendorMembership";

const PREVIEW_LIMIT = 3;

const PAGE_SIZE = 8;

const normalizeText = (value) =>
  String(value || "")
    .trim()

    .toLowerCase();

// ==========================================

// NORMALIZE EVENT DATA

// ==========================================

function normalizeEvent(event, index = 0) {
  const categories = Array.isArray(event.category)
    ? event.category
    : Array.isArray(event.categories)
      ? event.categories
      : event.category
        ? [event.category]
        : [];

  const rawDate = event.startDate || event.eventDate || event.date || "";

  return {
    ...event,

    id: String(event.id || event._id || `event-${index}`),

    title: event.title || event.eventTitle || event.name || "Untitled Event",

    date: event.date || rawDate || "Date not announced",

    startDate: rawDate,

    venue: event.venue || event.location || "Venue not announced",

    time:
      event.time ||
      [event.startTime, event.endTime].filter(Boolean).join(" - ") ||
      "Time not announced",

    organiser: event.organiser || event.organiserName || "Event Organiser",

    logo: event.logo || event.organiser || event.organiserName || "EVENT",

    category: categories.map((item) => String(item)),

    status:
      event.availabilityStatus ||
      event.stallStatus ||
      event.status ||
      "Stalls Open",

    city: event.city || event.eventCity || "Mumbai",

    image:
      event.coverImage || event.image || event.bannerImage || FALLBACK_IMAGE,
  };
}

// ==========================================

// READ ORGANISER EVENTS

// ==========================================

function readOrganiserEvents() {
  try {
    const saved = JSON.parse(localStorage.getItem(EVENTS_KEY) || "[]");

    if (!Array.isArray(saved)) return [];

    return saved

      .filter((event) => {
        const statuses = [
          event.status,

          event.approvalStatus,

          event.approval_status,

          event.eventStatus,
        ]

          .map(normalizeText)

          .filter(Boolean);

        if (statuses.length === 0) return true;

        return statuses.some((status) =>
          ["approved", "published", "active", "pending"].includes(status),
        );
      })

      .map((event, index) => normalizeEvent(event, index));
  } catch (error) {
    console.error("Unable to load organiser events:", error);

    return [];
  }
}

// ==========================================

// COMBINE STATIC + ORGANISER EVENTS

// ==========================================

function readAllEvents() {
  const staticList = Array.isArray(staticEvents)
    ? staticEvents.map((event, index) => normalizeEvent(event, index))
    : [];

  const organiserList = readOrganiserEvents();

  const eventMap = new Map();

  staticList.forEach((event) => {
    eventMap.set(String(event.id), event);
  });

  organiserList.forEach((event) => {
    eventMap.set(String(event.id), event);
  });

  const allEvents = Array.from(eventMap.values());

  console.log("STALLORA Total Events:", allEvents.length);

  return allEvents;
}

// ==========================================

// VALIDATE ACTIVE MEMBERSHIP

// ==========================================

function readActiveMembership() {
  try {
    const isLoggedIn = localStorage.getItem("stalloraVendorSession") === "true";

    if (!isLoggedIn) return null;

    const saved = JSON.parse(localStorage.getItem(MEMBERSHIP_KEY) || "null");

    if (!saved || saved.status !== "active") return null;

    const expiryTime = new Date(saved.expiresAt).getTime();

    const validPaymentMode = ["frontend-demo", "demo"].includes(
      saved.paymentMode,
    );

    const isValid =
      Number.isFinite(expiryTime) &&
      expiryTime > Date.now() &&
      validPaymentMode;

    return isValid ? saved : null;
  } catch (error) {
    console.error("Unable to read vendor membership:", error);
    return null;
  }
}

// ==========================================

// MAIN VENDORS PAGE

// ==========================================

export default function Vendors() {
  const { t } = useLanguage();

  const v = t?.vendorsPage || {};

  // ==========================================

  // FILTERS

  // ==========================================

  const [city, setCity] = useState("All Cities");

  const [dateFilter, setDateFilter] = useState("All Dates");

  const [category, setCategory] = useState("All Categories");

  const [search, setSearch] = useState("");

  const [sort, setSort] = useState("soonest");

  // ==========================================

  // PAGINATION

  // ==========================================

  const [page, setPage] = useState(1);

  // ==========================================

  // FAVOURITES

  // ==========================================

  const [favorites, setFavorites] = useState([]);

  // ==========================================

  // MEMBERSHIP

  // ==========================================

  const [membership, setMembership] = useState(() => readActiveMembership());

  // ==========================================

  // EVENTS

  // ==========================================

  const [events, setEvents] = useState(() => readAllEvents());

  // ==========================================

  // REFRESH EVENTS AND MEMBERSHIP

  // ==========================================

  useEffect(() => {
    const refreshEvents = () => {
      setEvents(readAllEvents());
    };

    const refreshMembership = () => {
      setMembership(readActiveMembership());
    };

    const refreshEverything = () => {
      refreshEvents();

      refreshMembership();
    };

    window.addEventListener("storage", refreshEverything);

    window.addEventListener("stallora:events-updated", refreshEvents);

    window.addEventListener("stallora-vendor-updated", refreshMembership);

    window.addEventListener("focus", refreshEverything);

    // Recheck membership expiry periodically.

    const interval = window.setInterval(refreshMembership, 10000);

    return () => {
      window.removeEventListener("storage", refreshEverything);

      window.removeEventListener("stallora:events-updated", refreshEvents);

      window.removeEventListener("stallora-vendor-updated", refreshMembership);

      window.removeEventListener("focus", refreshEverything);

      window.clearInterval(interval);
    };
  }, []);

  // ==========================================

  // MEMBERSHIP STATUS

  // ==========================================

  const hasMembership = Boolean(membership);

  // ==========================================

  // FILTER EVENTS

  // ==========================================

  const filteredEvents = useMemo(() => {
    let result = events.filter((event) => {
      const categories = Array.isArray(event.category) ? event.category : [];

      // CITY FILTER

      const eventCity = normalizeText(event.city);

      const selectedCity = normalizeText(city);

      const matchesCity =
        city === "All Cities" ||
        !eventCity ||
        eventCity === selectedCity ||
        eventCity.startsWith(`${selectedCity},`) ||
        eventCity.includes(selectedCity);

      // CATEGORY FILTER

      const matchesCategory =
        category === "All Categories" || categories.includes(category);

      // SEARCH FILTER

      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        [event.title, event.venue, event.organiser, event.city, ...categories]

          .filter(Boolean)

          .join(" ")

          .toLowerCase()

          .includes(query);

      // DATE FILTER

      const eventDate = String(event.startDate || "");

      const matchesDate =
        dateFilter === "All Dates" ||
        (dateFilter === "December 2026" && eventDate.startsWith("2026-12")) ||
        (dateFilter === "January 2027" && eventDate.startsWith("2027-01")) ||
        (dateFilter === "February 2027" && eventDate.startsWith("2027-02")) ||
        (dateFilter === "March 2027" && eventDate.startsWith("2027-03"));

      return matchesCity && matchesCategory && matchesSearch && matchesDate;
    });

    // SORTING

    if (sort === "soonest") {
      result.sort((a, b) =>
        String(a.startDate || "").localeCompare(String(b.startDate || "")),
      );
    }

    if (sort === "latest") {
      result.sort((a, b) =>
        String(b.startDate || "").localeCompare(String(a.startDate || "")),
      );
    }

    if (sort === "name") {
      result.sort((a, b) =>
        String(a.title || "").localeCompare(String(b.title || "")),
      );
    }

    return result;
  }, [events, city, dateFilter, category, search, sort]);

  // ==========================================

  // IMPORTANT: MEMBERSHIP EVENT RESTRICTION

  // ==========================================

  // Without membership: only first 3 events.

  // With active membership: all filtered events.

  const accessibleEvents = hasMembership
    ? filteredEvents
    : filteredEvents.slice(0, PREVIEW_LIMIT);

  const lockedCount = hasMembership
    ? 0
    : Math.max(filteredEvents.length - PREVIEW_LIMIT, 0);

  // ==========================================

  // PAGINATION

  // ==========================================

  const pageCount = Math.max(1, Math.ceil(accessibleEvents.length / PAGE_SIZE));

  const safePage = Math.min(page, pageCount);

  const visibleEvents = accessibleEvents.slice(
    (safePage - 1) * PAGE_SIZE,

    safePage * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [city, dateFilter, category, search, sort, events.length, hasMembership]);

  // ==========================================

  // FAVOURITES

  // ==========================================

  const toggleFavorite = (id) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  // ==========================================

  // CLEAR FILTERS

  // ==========================================

  const clearFilters = () => {
    setCity("All Cities");

    setDateFilter("All Dates");

    setCategory("All Categories");

    setSearch("");

    setSort("soonest");

    setPage(1);
  };

  // ==========================================

  // IMAGE FALLBACK

  // ==========================================

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;

    event.currentTarget.src = FALLBACK_IMAGE;
  };

  // ==========================================

  // PAGE UI

  // ==========================================

  return (
    <main className="stall-page">
      {/** HERO SECTION  **/}

      <section className="stall-hero">
        <div className="stall-hero-copy">
          <span className="stall-eyebrow">
            {v.eyebrow || "STALLORA EVENTS"}
          </span>

          <h1>
            {v.title1 || "Find Your"}
            <br />
            {v.title2 || "Next"} <em>{v.title3 || "Opportunity"}</em>
          </h1>

          <p>
            {v.description ||
              "Discover upcoming exhibitions, flea markets, festivals and events. Find the perfect opportunity for your brand."}
          </p>

          <div className="stall-hero-note">
            <span>✳</span>

            {v.heroNote ||
              "Discover events. Showcase your brand. Grow your business."}
          </div>
        </div>

        <div className="stall-hero-image">
          <img
            src={FALLBACK_IMAGE}
            alt="Exhibition and event experience"
            onError={handleImageError}
          />

          <div className="stall-hero-sticker">
            {v.sticker1 || "DISCOVER"}

            <br />

            {v.sticker2 || "CONNECT"}

            <br />

            {v.sticker3 || "GROW"}
          </div>

          <div className="stall-image-caption">
            {v.imageCaption || "Your next event starts here"}
          </div>
        </div>
      </section>

      {/** FILTER SECTION  **/}

      <section className="stall-filters" aria-label="Event filters">
        {/** CITY  **/}

        <label className="filter-control">
          <MapPin size={19} />

          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);

              setPage(1);
            }}
          >
            <option value="All Cities">{v.allCities || "All Cities"}</option>

            <option value="Mumbai">{v.mumbai || "Mumbai"}</option>
          </select>

          <ChevronDown size={16} />
        </label>

        {/** DATE  **/}

        <label className="filter-control">
          <CalendarDays size={19} />

          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);

              setPage(1);
            }}
          >
            <option value="All Dates">{v.allDates || "All Dates"}</option>

            <option value="December 2026">
              {v.december || "December 2026"}
            </option>

            <option value="January 2027">{v.january || "January 2027"}</option>

            <option value="February 2027">February 2027</option>

            <option value="March 2027">March 2027</option>
          </select>

          <ChevronDown size={16} />
        </label>

        {/** CATEGORY  **/}

        <label className="filter-control">
          <Tag size={19} />

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);

              setPage(1);
            }}
          >
            <option value="All Categories">
              {v.allCategories || "All Categories"}
            </option>

            {[
              ...new Set(
                events.flatMap((event) =>
                  Array.isArray(event.category) ? event.category : [],
                ),
              ),
            ]

              .sort()

              .map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
          </select>

          <ChevronDown size={16} />
        </label>

        {/** SEARCH  **/}

        <label className="filter-search">
          <Search size={19} />

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);

              setPage(1);
            }}
            placeholder={v.searchPlaceholder || "Search events..."}
          />
        </label>

        <button className="stall-search-button" onClick={() => setPage(1)}>
          {v.search || "Search"}
        </button>
      </section>

      {/** EVENTS SECTION  **/}

      <section className="stall-events-section">
        {/** SECTION HEADING  **/}

        <div className="stall-section-heading">
          <div>
            <span className="stall-section-label">
              {v.sectionLabel || "EXPLORE"}
            </span>

            <h2>
              {v.upcomingEvents || "Upcoming Events"}{" "}
              <span>({accessibleEvents.length})</span>
            </h2>

            <p>
              {v.sectionDescription ||
                "Explore upcoming events and find the right stall opportunity for your business."}
            </p>
          </div>

          {/** SORT  **/}

          <label className="stall-sort">
            <span>{v.sortBy || "Sort By"}</span>

            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);

                setPage(1);
              }}
            >
              <option value="soonest">{v.soonest || "Soonest"}</option>

              <option value="latest">{v.latest || "Latest"}</option>

              <option value="name">{v.eventName || "Event Name"}</option>
            </select>
          </label>
        </div>

        {/** MEMBERSHIP BANNER  **/}

        <div className="events-membership-banner">
          <div className="events-membership-copy">
            <strong>
              {hasMembership
                ? `${
                    membership.name || membership.planName || "Vendor"
                  } Membership Active`
                : "Preview Access – 3 Events"}
            </strong>

            <p>
              {hasMembership
                ? "Your membership is active. You can explore all available events."
                : "Explore your first 3 events. Activate a vendor membership to unlock all events."}
            </p>
          </div>

          <Link
            to={hasMembership ? "/vendor/profile" : "/vendor/membership"}
            className="events-membership-button"
          >
            {hasMembership ? "View Membership" : "Unlock All Events"}
          </Link>
        </div>

        {/** EVENT CARDS  **/}

        {visibleEvents.length > 0 ? (
          <div className="stall-event-grid">
            {visibleEvents.map((event) => (
              <article className="stall-event-card" key={event.id}>
                {/** EVENT IMAGE  **/}

                <div className="stall-card-image">
                  <img
                    src={event.image || FALLBACK_IMAGE}
                    alt={event.title}
                    loading="lazy"
                    onError={handleImageError}
                  />

                  <span className="stall-date-badge">{event.date}</span>

                  <span
                    className={`stall-status ${
                      normalizeText(event.status).includes("few") ? "few" : ""
                    }`}
                  >
                    {event.status}
                  </span>

                  {/** FAVOURITE  **/}

                  <button
                    className={`stall-favorite ${
                      favorites.includes(event.id) ? "is-favorite" : ""
                    }`}
                    onClick={() => toggleFavorite(event.id)}
                    aria-label={
                      favorites.includes(event.id)
                        ? v.removeFavorite || "Remove favourite"
                        : v.saveEvent || "Save event"
                    }
                  >
                    <Heart
                      size={20}
                      fill={
                        favorites.includes(event.id) ? "currentColor" : "none"
                      }
                    />
                  </button>
                </div>

                {/** EVENT DETAILS  **/}

                <div className="stall-card-body">
                  <div className="stall-card-main">
                    <h3>{event.title}</h3>

                    <p>
                      <MapPin size={15} />

                      <span>{event.venue}</span>
                    </p>

                    <p>
                      <Clock size={15} />

                      <span>{event.time}</span>
                    </p>

                    <p>
                      <UserRound size={15} />

                      <span>
                        {v.by || "By"} {event.organiser}
                      </span>
                    </p>

                    {/** CATEGORIES  **/}

                    <div className="stall-card-tags">
                      {(event.category || []).map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>

                  {/** ORGANISER AND BUTTON  **/}

                  <div className="stall-card-side">
                    <div className="stall-organiser-mark">
                      {(event.logo || event.organiser || "EVENT")

                        .split("\n")

                        .map((line, index) => (
                          <span key={`${line}-${index}`}>{line}</span>
                        ))}
                    </div>

                    <Link
                      className="stall-view-button"
                      to={`/event/${event.id}`}
                    >
                      {v.viewMore || "View More"}

                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="stall-empty">
            <span className="stall-empty-symbol">✳</span>

            <h3>{v.noEvents || "No Events Found"}</h3>

            <p>
              {v.noEventsDescription ||
                "Try changing your filters to discover more events."}
            </p>

            <button onClick={clearFilters}>
              {v.clearFilters || "Clear Filters"}
            </button>
          </div>
        )}

        {/** LOCKED EVENTS  **/}

        {!hasMembership && lockedCount > 0 && (
          <div className="events-locked-section">
            <div className="events-lock-icon">🔒</div>

            <h3>{lockedCount} More Events Waiting for You!</h3>

            <p>
              Unlock all event opportunities and explore every available event
              with a vendor membership.
            </p>

            <Link to="/vendor/membership" className="events-membership-button">
              Explore Membership Plans
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/** PAGINATION  **/}

        {pageCount > 1 && (
          <nav
            className="stall-pagination"
            aria-label={v.pagination || "Pagination"}
          >
            <button
              disabled={safePage === 1}
              onClick={() => setPage(safePage - 1)}
            >
              ‹
            </button>

            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (number) => (
                <button
                  key={number}
                  className={safePage === number ? "active" : ""}
                  onClick={() => setPage(number)}
                >
                  {number}
                </button>
              ),
            )}

            <button
              disabled={safePage === pageCount}
              onClick={() => setPage(safePage + 1)}
            >
              ›
            </button>
          </nav>
        )}
      </section>
    </main>
  );
}
