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

import { events } from "../data/events";

import { useLanguage } from "../context/LanguageContext";

import "../css/Vendors.css";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1000&q=85";

export default function Vendors() {
  const { t } = useLanguage();

  const v = t.vendorsPage;

  const [city, setCity] = useState("Mumbai");

  const [dateFilter, setDateFilter] = useState("All Dates");

  const [category, setCategory] = useState("All Categories");

  const [search, setSearch] = useState("");

  const [sort, setSort] = useState("soonest");

  const [page, setPage] = useState(1);

  const [favorites, setFavorites] = useState([]);
  const [membership, setMembership] = useState(null);

  // Read the active vendor membership from localStorage.
  const refreshMembership = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("stalloraVendorMembership") || "null",
      );
      const active =
        saved &&
        saved.status === "active" &&
        saved.expiresAt &&
        new Date(saved.expiresAt).getTime() > Date.now();
      setMembership(active ? saved : null);
    } catch (error) {
      console.error("Unable to read vendor membership:", error);
      setMembership(null);
    }
  };

  useEffect(() => {
    refreshMembership();
    const handleFocus = () => refreshMembership();
    window.addEventListener("storage", refreshMembership);
    window.addEventListener("stallora-vendor-updated", refreshMembership);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("storage", refreshMembership);
      window.removeEventListener("stallora-vendor-updated", refreshMembership);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const hasMembership = Boolean(membership);

  // FILTER EVENTS

  const filteredEvents = useMemo(() => {
    let result = events.filter((event) => {
      const categories = Array.isArray(event.category) ? event.category : [];

      const matchesCity = city === "All Cities" || event.city === city;

      const matchesCategory =
        category === "All Categories" || categories.includes(category);

      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        [event.title, event.venue, event.organiser, ...categories]

          .filter(Boolean)

          .join(" ")

          .toLowerCase()

          .includes(query);

      const matchesDate =
        dateFilter === "All Dates" ||
        (dateFilter === "December 2026" &&
          event.startDate?.startsWith("2026-12")) ||
        (dateFilter === "January 2027" &&
          event.startDate?.startsWith("2027-01"));

      return matchesCity && matchesCategory && matchesSearch && matchesDate;
    });

    if (sort === "soonest") {
      result.sort((a, b) => a.startDate.localeCompare(b.startDate));
    }

    if (sort === "latest") {
      result.sort((a, b) => b.startDate.localeCompare(a.startDate));
    }

    if (sort === "name") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [city, dateFilter, category, search, sort]);

  // MEMBERSHIP ACCESS + PAGINATION
  // Before membership, vendors can see only the first 3 filtered events.
  const accessibleEvents = hasMembership
    ? filteredEvents
    : filteredEvents.slice(0, 3);
  const lockedCount = hasMembership
    ? 0
    : Math.max(filteredEvents.length - 3, 0);
  const pageSize = 8;
  const pageCount = Math.max(1, Math.ceil(accessibleEvents.length / pageSize));
  const visibleEvents = accessibleEvents.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  // FAVORITES

  const toggleFavorite = (id) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  // CLEAR FILTERS

  const clearFilters = () => {
    setCity("Mumbai");

    setDateFilter("All Dates");

    setCategory("All Categories");

    setSearch("");

    setSort("soonest");

    setPage(1);
  };

  // IMAGE FALLBACK

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;

    event.currentTarget.src = FALLBACK_IMAGE;
  };

  return (
    <main className="stall-page">
      {/** HERO SECTION **/}

      <section className="stall-hero">
        <div className="stall-hero-copy">
          <span className="stall-eyebrow">{v.eyebrow}</span>

          <h1>
            {v.title1}
            <br />
            {v.title2} <em>{v.title3}</em>
          </h1>

          <p>{v.description}</p>

          <div className="stall-hero-note">
            <span>✳</span>

            {v.heroNote}
          </div>
        </div>

        <div className="stall-hero-image">
          <img
            src={FALLBACK_IMAGE}
            alt="Exhibition and event experience"
            onError={handleImageError}
          />

          <div className="stall-hero-sticker">
            {v.sticker1}

            <br />

            {v.sticker2}

            <br />

            {v.sticker3}
          </div>

          <div className="stall-image-caption">{v.imageCaption}</div>
        </div>
      </section>

      {/** FILTER SECTION **/}

      <section className="stall-filters" aria-label={v.search}>
        {/** CITY **/}

        <label className="filter-control">
          <MapPin size={19} />

          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);

              setPage(1);
            }}
          >
            <option value="Mumbai">{v.mumbai}</option>

            <option value="All Cities">{v.allCities}</option>
          </select>

          <ChevronDown size={16} />
        </label>

        {/** DATE **/}

        <label className="filter-control">
          <CalendarDays size={19} />

          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);

              setPage(1);
            }}
          >
            <option value="All Dates">{v.allDates}</option>

            <option value="December 2026">{v.december}</option>

            <option value="January 2027">{v.january}</option>
          </select>

          <ChevronDown size={16} />
        </label>

        {/** CATEGORY **/}

        <label className="filter-control">
          <Tag size={19} />

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);

              setPage(1);
            }}
          >
            <option value="All Categories">{v.allCategories}</option>

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

        {/** SEARCH **/}

        <label className="filter-search">
          <Search size={19} />

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);

              setPage(1);
            }}
            placeholder={v.searchPlaceholder}
          />
        </label>

        <button className="stall-search-button" onClick={() => setPage(1)}>
          {v.search}
        </button>
      </section>

      {/** EVENTS SECTION **/}

      <section className="stall-events-section">
        <div className="stall-section-heading">
          <div>
            <span className="stall-section-label">{v.sectionLabel}</span>

            <h2>
              {v.upcomingEvents} <span>({filteredEvents.length})</span>
            </h2>

            <p>{v.sectionDescription}</p>
          </div>

          {/** SORT **/}

          <label className="stall-sort">
            <span>{v.sortBy}</span>

            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);

                setPage(1);
              }}
            >
              <option value="soonest">{v.soonest}</option>

              <option value="latest">{v.latest}</option>

              <option value="name">{v.eventName}</option>
            </select>
          </label>
        </div>

        <div className="events-membership-banner">
          <div className="events-membership-copy">
            <strong>
              {hasMembership
                ? `${membership.name} Membership Active`
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

        {/** EVENT CARDS **/}

        {visibleEvents.length > 0 ? (
          <div className="stall-event-grid">
            {visibleEvents.map((event) => (
              <article className="stall-event-card" key={event.id}>
                {/** EVENT IMAGE **/}

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
                      event.status === "Few Stalls Left" ? "few" : ""
                    }`}
                  >
                    {event.status === "Few Stalls Left"
                      ? v.fewStallsLeft
                      : v.stallsOpen}
                  </span>

                  {/** FAVORITE **/}

                  <button
                    className={`stall-favorite ${
                      favorites.includes(event.id) ? "is-favorite" : ""
                    }`}
                    onClick={() => toggleFavorite(event.id)}
                    aria-label={
                      favorites.includes(event.id)
                        ? v.removeFavorite
                        : v.saveEvent
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

                {/** EVENT DETAILS **/}

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
                        {v.by} {event.organiser}
                      </span>
                    </p>

                    {/** CATEGORIES **/}

                    <div className="stall-card-tags">
                      {(event.category || []).map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>

                  {/** ORGANISER AND BUTTON **/}

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
                      {v.viewMore}

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

            <h3>{v.noEvents}</h3>

            <p>{v.noEventsDescription}</p>

            <button onClick={clearFilters}>{v.clearFilters}</button>
          </div>
        )}

        {!hasMembership && lockedCount > 0 && (
          <div className="events-locked-section">
            <div className="events-lock-icon">🔒</div>
            <h3>{lockedCount} More Events Waiting for You!</h3>
            <p>
              Unlock all event opportunities and explore every available event
              with a vendor membership.
            </p>
            <Link to="/vendor/membership" className="events-membership-button">
              Explore Membership Plans <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/** PAGINATION **/}

        {pageCount > 1 && (
          <nav className="stall-pagination" aria-label={v.pagination}>
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              ‹
            </button>

            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (number) => (
                <button
                  key={number}
                  className={page === number ? "active" : ""}
                  onClick={() => setPage(number)}
                >
                  {number}
                </button>
              ),
            )}

            <button
              disabled={page === pageCount}
              onClick={() => setPage(page + 1)}
            >
              ›
            </button>
          </nav>
        )}
      </section>
    </main>
  );
}
