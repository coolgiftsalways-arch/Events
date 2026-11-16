import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  CalendarDays,
  Plus,
  Image,
  Video,
  Store,
  Users,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowRight,
  Settings,
  Crown,
  UserRound,
  MapPin,
  Clock,
  MoreHorizontal,
  Sparkles,
  CircleCheck,
  CreditCard,
  AlertCircle,
  BarChart3,
  ExternalLink,
} from "lucide-react";

import "../css/OrganiserDashboard.css";

const PROFILE_KEY = "stalloraOrganiser";
const POSTS_KEY = "stalloraOrganiserPosts";
const EVENTS_KEY = "stalloraOrganiserEvents";

// ==========================================
// STORAGE HELPERS
// ==========================================

function readStorage(key, fallback = null) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    console.error(`Unable to read ${key}:`, error);
    return fallback;
  }
}

// ==========================================
// FORMATTERS
// ==========================================

function formatDate(date) {
  if (!date) return "Date not added";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Date not added";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name = "Organiser") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

// ==========================================
// DASHBOARD
// ==========================================

export default function OrganiserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState(() =>
    readStorage(PROFILE_KEY)
  );

  const [posts, setPosts] = useState(() =>
    readStorage(POSTS_KEY, [])
  );

  const [events, setEvents] = useState(() =>
    readStorage(EVENTS_KEY, [])
  );

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPost, setSelectedPost] = useState(null);

  // ==========================================
  // REFRESH DASHBOARD DATA
  // ==========================================

  useEffect(() => {
    const refreshData = () => {
      setProfile(readStorage(PROFILE_KEY));
      setPosts(readStorage(POSTS_KEY, []));
      setEvents(readStorage(EVENTS_KEY, []));
    };

    refreshData();

    window.addEventListener(
      "stallora:organiser-updated",
      refreshData
    );

    window.addEventListener(
      "stallora:posts-updated",
      refreshData
    );

    window.addEventListener(
      "stallora:events-updated",
      refreshData
    );

    window.addEventListener("storage", refreshData);

    return () => {
      window.removeEventListener(
        "stallora:organiser-updated",
        refreshData
      );

      window.removeEventListener(
        "stallora:posts-updated",
        refreshData
      );

      window.removeEventListener(
        "stallora:events-updated",
        refreshData
      );

      window.removeEventListener("storage", refreshData);
    };
  }, []);

  // ==========================================
  // SELECT POST FROM PROFILE
  // ==========================================

  useEffect(() => {
    const postId = location.state?.selectedPost;

    if (!postId) return;

    const matchingPost = posts.find(
      (post) => String(post.id) === String(postId)
    );

    if (matchingPost) {
      setSelectedPost(matchingPost);
      setActiveTab("posts");
    }

    window.history.replaceState({}, document.title);
  }, [location.state, posts]);

  // ==========================================
  // ACCOUNT CHECK
  // ==========================================

  if (!profile) {
    return (
      <main className="od-page">
        <div className="od-empty-account">
          <div className="od-empty-icon">
            <UserRound size={35} />
          </div>

          <h1>Organiser account not found</h1>

          <p>
            Create your organiser account to access your
            STALLORA dashboard.
          </p>

          <Link to="/organiser/membership">
            Create Organiser Account
            <ArrowRight size={18} />
          </Link>
        </div>
      </main>
    );
  }

  // ==========================================
  // PROFILE DETAILS
  // ==========================================

  const organiserName =
    profile.company || profile.name || "Organiser";

  const membershipName =
    profile.membershipName ||
    (profile.membership === "gold" ? "Gold" : "Silver");

  const membershipStatus =
    profile.membershipStatus || "pending_payment";

  const initials = getInitials(organiserName);

  const totalPosts = posts.length;

  const totalImages = posts.filter(
    (post) => post.mediaType !== "video"
  ).length;

  const totalVideos = posts.filter(
    (post) => post.mediaType === "video"
  ).length;

  const totalEvents = events.length;

  const publishedEvents = events.filter(
    (event) =>
      event.status === "published" ||
      event.status === "active"
  ).length;

  const draftEvents = events.filter(
    (event) => event.status === "draft"
  ).length;

  const totalViews = posts.reduce(
    (sum, post) => sum + (Number(post.views) || 0),
    0
  );

  const totalLikes = posts.reduce(
    (sum, post) => sum + (Number(post.likes) || 0),
    0
  );

  const totalBookings = events.reduce(
    (sum, event) => sum + (Number(event.bookings) || 0),
    0
  );

  // ==========================================
  // NAVIGATION
  // ==========================================

  const openTab = (tab) => {
    setActiveTab(tab);
    setSelectedPost(null);
  };

  const openPost = (post) => {
    setSelectedPost(post);
    setActiveTab("posts");
  };

  // ==========================================
  // DELETE POST
  // ==========================================

  const deletePost = (postId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmed) return;

    const updatedPosts = posts.filter(
      (post) => String(post.id) !== String(postId)
    );

    try {
      localStorage.setItem(
        POSTS_KEY,
        JSON.stringify(updatedPosts)
      );

      setPosts(updatedPosts);
      setSelectedPost(null);

      window.dispatchEvent(
        new Event("stallora:posts-updated")
      );
    } catch (error) {
      console.error("Unable to delete post:", error);
      window.alert(
        "Unable to delete this post. Please try again."
      );
    }
  };

  // ==========================================
  // SIDEBAR
  // ==========================================

  const sidebarItems = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      id: "events",
      label: "My Events",
      icon: CalendarDays,
    },
    {
      id: "posts",
      label: "My Posts",
      icon: Image,
    },
  ];

  // ==========================================
  // DASHBOARD UI
  // ==========================================

  return (
    <main className="od-page">

      <div className="od-layout">

        {/* ==================================
            SIDEBAR
        ================================== */}

        <aside className="od-sidebar">

          <Link to="/" className="od-sidebar-brand">
            STALLORA<span>✳</span>
          </Link>

          <div className="od-sidebar-label">
            WORKSPACE
          </div>

          <nav className="od-sidebar-nav">

            {sidebarItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={
                    activeTab === item.id
                      ? "active"
                      : ""
                  }
                  onClick={() => openTab(item.id)}
                >
                  <Icon size={19} />
                  <span>{item.label}</span>

                  {item.id === "posts" && (
                    <small>{totalPosts}</small>
                  )}

                  {item.id === "events" && (
                    <small>{totalEvents}</small>
                  )}
                </button>
              );
            })}

          </nav>

          <div className="od-sidebar-label">
            ORGANISER
          </div>

          <nav className="od-sidebar-nav">

            <Link to="/organiser/create-event">
              <Plus size={19} />
              <span>Create Event</span>
            </Link>

            <Link to="/organiser/create-post">
              <Image size={19} />
              <span>Create Post</span>
            </Link>

            <Link to="/organiser/profile">
              <UserRound size={19} />
              <span>My Profile</span>
            </Link>

            <Link to="/organiser/membership">
              <Crown size={19} />
              <span>Membership</span>
            </Link>

          </nav>

          {/* SIDEBAR MEMBERSHIP */}

          <div className="od-sidebar-plan">

            <div className="od-sidebar-plan-icon">
              <Crown size={20} />
            </div>

            <span>YOUR MEMBERSHIP</span>

            <strong>{membershipName} Plan</strong>

            <p>
              {membershipStatus === "active"
                ? "Your membership is active."
                : "Payment verification pending."}
            </p>

            <Link to="/organiser/membership">
              View Plan
              <ArrowUpRight size={15} />
            </Link>

          </div>

          {/* SIDEBAR PROFILE */}

          <Link
            to="/organiser/profile"
            className="od-sidebar-user"
          >

            <div className="od-sidebar-avatar">

              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={organiserName}
                />
              ) : (
                initials
              )}

            </div>

            <div>
              <strong>{organiserName}</strong>
              <span>Organiser Account</span>
            </div>

            <MoreHorizontal size={19} />

          </Link>

        </aside>

        {/* ==================================
            MAIN CONTENT
        ================================== */}

        <section className="od-main">

          {/* HEADER */}

          <header className="od-header">

            <div>
              <span className="od-header-eyebrow">
                STALLORA / ORGANISER
              </span>

              <h1>
                {activeTab === "overview" &&
                  "Dashboard overview"}

                {activeTab === "events" &&
                  "My Events"}

                {activeTab === "posts" &&
                  "My Posts"}
              </h1>

              <p>
                Welcome back, {profile.name || organiserName}.
                Here's what's happening with your events.
              </p>
            </div>

            <div className="od-header-actions">

              <Link
                to="/organiser/profile"
                className="od-view-profile"
              >
                <Eye size={16} />
                View Profile
              </Link>

              <Link
                to="/organiser/create-event"
                className="od-create-button"
              >
                <Plus size={18} />
                Create Event
              </Link>

            </div>

          </header>

          {/* ==================================
              OVERVIEW
          ================================== */}

          {activeTab === "overview" && (
            <>

              {/* WELCOME BANNER */}

              <section className="od-welcome-banner">

                <div className="od-welcome-copy">

                  <span>
                    <Sparkles size={14} />
                    YOUR ORGANISER SPACE
                  </span>

                  <h2>
                    Make something
                    <br />
                    <em>worth showing up for.</em>
                  </h2>

                  <p>
                    Your next great event starts here.
                    Manage your events, share updates and
                    grow your vendor community.
                  </p>

                  <Link to="/organiser/create-event">
                    Create Your First Event
                    <ArrowRight size={17} />
                  </Link>

                </div>

                <div className="od-welcome-decoration">
                  <div className="od-decoration-circle" />

                  <div className="od-decoration-card">
                    <CalendarDays size={25} />
                    <strong>LET'S MAKE</strong>
                    <strong>IT HAPPEN.</strong>
                    <span>STALLORA / 2026</span>
                  </div>
                </div>

              </section>

              {/* PAYMENT STATUS */}

              {membershipStatus !== "active" && (
                <div className="od-payment-notice">

                  <AlertCircle size={21} />

                  <div>
                    <strong>Membership payment verification pending</strong>

                    <p>
                      Your {membershipName} plan has been selected,
                      but payment has not been verified yet.
                    </p>
                  </div>

                  <Link to="/organiser/membership">
                    View Membership
                    <ArrowRight size={15} />
                  </Link>

                </div>
              )}

              {/* STATISTICS */}

              <div className="od-section-heading">
                <div>
                  <span>YOUR ACTIVITY</span>
                  <h2>At a glance</h2>
                </div>

                <span className="od-period-label">
                  ALL TIME
                </span>
              </div>

              <div className="od-stats-grid">

                <article className="od-stat-card purple">
                  <div className="od-stat-top">
                    <span>Total Events</span>
                    <CalendarDays size={20} />
                  </div>

                  <strong>{totalEvents}</strong>

                  <small>
                    {publishedEvents} published · {draftEvents} drafts
                  </small>
                </article>

                <article className="od-stat-card lime">
                  <div className="od-stat-top">
                    <span>Total Posts</span>
                    <Image size={20} />
                  </div>

                  <strong>{totalPosts}</strong>

                  <small>
                    {totalImages} photos · {totalVideos} videos
                  </small>
                </article>

                <article className="od-stat-card coral">
                  <div className="od-stat-top">
                    <span>Total Views</span>
                    <Eye size={20} />
                  </div>

                  <strong>{totalViews.toLocaleString("en-IN")}</strong>

                  <small>
                    Across your posts
                  </small>
                </article>

                <article className="od-stat-card cream">
                  <div className="od-stat-top">
                    <span>Total Likes</span>
                    <Heart size={20} />
                  </div>

                  <strong>{totalLikes.toLocaleString("en-IN")}</strong>

                  <small>
                    Post engagement
                  </small>
                </article>

              </div>

              {/* QUICK ACTIONS */}

              <div className="od-section-heading">
                <div>
                  <span>GET THINGS DONE</span>
                  <h2>Quick actions</h2>
                </div>
              </div>

              <div className="od-quick-actions">

                <Link
                  to="/organiser/create-event"
                  className="od-quick-card"
                >
                  <div className="od-quick-icon purple">
                    <CalendarDays size={23} />
                  </div>

                  <strong>Create an Event</strong>

                  <span>
                    Publish your next event
                  </span>

                  <ArrowUpRight size={18} />
                </Link>

                <Link
                  to="/organiser/create-post"
                  className="od-quick-card"
                >
                  <div className="od-quick-icon coral">
                    <Image size={23} />
                  </div>

                  <strong>Share a Post</strong>

                  <span>
                    Upload photos and videos
                  </span>

                  <ArrowUpRight size={18} />
                </Link>

                <Link
                  to="/organiser/profile"
                  className="od-quick-card"
                >
                  <div className="od-quick-icon lime">
                    <UserRound size={23} />
                  </div>

                  <strong>Update Profile</strong>

                  <span>
                    Edit your organiser details
                  </span>

                  <ArrowUpRight size={18} />
                </Link>

              </div>

              {/* RECENT EVENTS */}

              <div className="od-section-heading od-recent-heading">
                <div>
                  <span>YOUR ACTIVITY</span>
                  <h2>Recent events</h2>
                </div>

                <button
                  type="button"
                  onClick={() => openTab("events")}
                >
                  View All
                  <ArrowRight size={16} />
                </button>
              </div>

              {events.length > 0 ? (

                <div className="od-event-list">

                  {events.slice(0, 4).map((event) => (
                    <article
                      className="od-event-row"
                      key={event.id}
                    >

                      <div className="od-event-icon">
                        <CalendarDays size={22} />
                      </div>

                      <div className="od-event-info">
                        <strong>
                          {event.title || event.name || "Untitled Event"}
                        </strong>

                        <span>
                          <MapPin size={13} />
                          {event.location || event.venue || "Location not added"}
                        </span>
                      </div>

                      <div className="od-event-date">
                        <span>EVENT DATE</span>
                        <strong>
                          {formatDate(event.date || event.startDate)}
                        </strong>
                      </div>

                      <span
                        className={`od-event-status ${
                          event.status || "draft"
                        }`}
                      >
                        {event.status || "Draft"}
                      </span>

                    </article>
                  ))}

                </div>

              ) : (

                <div className="od-empty-state">
                  <div>
                    <CalendarDays size={29} />
                  </div>

                  <h3>No events yet</h3>

                  <p>
                    Your events will appear here once you create them.
                  </p>

                  <Link to="/organiser/create-event">
                    Create Your First Event
                    <ArrowRight size={16} />
                  </Link>
                </div>

              )}

              {/* RECENT POSTS */}

              <div className="od-section-heading od-recent-heading">
                <div>
                  <span>YOUR CONTENT</span>
                  <h2>Recent posts</h2>
                </div>

                <button
                  type="button"
                  onClick={() => openTab("posts")}
                >
                  View All
                  <ArrowRight size={16} />
                </button>
              </div>

              {posts.length > 0 ? (

                <div className="od-recent-post-grid">

                  {posts.slice(0, 4).map((post) => (
                    <button
                      type="button"
                      className="od-recent-post"
                      key={post.id}
                      onClick={() => openPost(post)}
                    >

                      {post.mediaType === "video" ? (
                        <video
                          src={post.mediaUrl || post.image}
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={post.mediaUrl || post.image}
                          alt={post.caption || "Organiser post"}
                        />
                      )}

                      <span>
                        {post.mediaType === "video" ? (
                          <Video size={14} />
                        ) : (
                          <Image size={14} />
                        )}
                      </span>

                    </button>
                  ))}

                </div>

              ) : (

                <div className="od-empty-state">
                  <div>
                    <Image size={29} />
                  </div>

                  <h3>Your story starts here</h3>

                  <p>
                    Share event photos, announcements and videos
                    with your community.
                  </p>

                  <Link to="/organiser/create-post">
                    Create Your First Post
                    <ArrowRight size={16} />
                  </Link>
                </div>

              )}

            </>
          )}

          {/* ==================================
              EVENTS TAB
          ================================== */}

          {activeTab === "events" && (

            <section className="od-tab-content">

              <div className="od-tab-toolbar">

                <div>
                  <span>{totalEvents} TOTAL EVENTS</span>
                  <p>Manage all your created events.</p>
                </div>

                <Link
                  to="/organiser/create-event"
                  className="od-create-button"
                >
                  <Plus size={17} />
                  New Event
                </Link>

              </div>

              {events.length > 0 ? (

                <div className="od-event-list">

                  {events.map((event) => (

                    <article
                      className="od-event-row"
                      key={event.id}
                    >

                      <div className="od-event-icon">
                        <CalendarDays size={22} />
                      </div>

                      <div className="od-event-info">
                        <strong>
                          {event.title || event.name || "Untitled Event"}
                        </strong>

                        <span>
                          <MapPin size={13} />
                          {event.location || event.venue || "Location not added"}
                        </span>
                      </div>

                      <div className="od-event-date">
                        <span>EVENT DATE</span>
                        <strong>
                          {formatDate(event.date || event.startDate)}
                        </strong>
                      </div>

                      <span
                        className={`od-event-status ${
                          event.status || "draft"
                        }`}
                      >
                        {event.status || "Draft"}
                      </span>

                    </article>

                  ))}

                </div>

              ) : (

                <div className="od-empty-state">
                  <div>
                    <CalendarDays size={29} />
                  </div>

                  <h3>No events created</h3>

                  <p>
                    Create your first event and start inviting vendors.
                  </p>

                  <Link to="/organiser/create-event">
                    Create Event
                    <ArrowRight size={16} />
                  </Link>
                </div>

              )}

            </section>

          )}

          {/* ==================================
              POSTS TAB
          ================================== */}

          {activeTab === "posts" && (

            <section className="od-tab-content">

              <div className="od-tab-toolbar">

                <div>
                  <span>{totalPosts} TOTAL POSTS</span>
                  <p>
                    {totalImages} photos · {totalVideos} videos
                  </p>
                </div>

                <Link
                  to="/organiser/create-post"
                  className="od-create-button"
                >
                  <Plus size={17} />
                  Create Post
                </Link>

              </div>

              {posts.length > 0 ? (

                <div className="od-post-grid">

                  {posts.map((post) => (

                    <article
                      className="od-post-card"
                      key={post.id}
                    >

                      <button
                        type="button"
                        className="od-post-media"
                        onClick={() => openPost(post)}
                      >

                        {post.mediaType === "video" ? (
                          <video
                            src={post.mediaUrl || post.image}
                            muted
                            playsInline
                          />
                        ) : (
                          <img
                            src={post.mediaUrl || post.image}
                            alt={post.caption || "Organiser post"}
                          />
                        )}

                        <span>
                          {post.mediaType === "video" ? (
                            <Video size={17} />
                          ) : (
                            <Image size={17} />
                          )}
                        </span>

                      </button>

                      <div className="od-post-card-content">

                        <p>
                          {post.caption || "No caption added."}
                        </p>

                        <div className="od-post-metrics">
                          <span>
                            <Heart size={14} />
                            {post.likes || 0}
                          </span>

                          <span>
                            <Eye size={14} />
                            {post.views || 0}
                          </span>
                        </div>

                        <button
                          type="button"
                          className="od-delete-post"
                          onClick={() => deletePost(post.id)}
                        >
                          Delete Post
                        </button>

                      </div>

                    </article>

                  ))}

                </div>

              ) : (

                <div className="od-empty-state">
                  <div>
                    <Image size={29} />
                  </div>

                  <h3>No posts yet</h3>

                  <p>
                    Start sharing your events, photos and videos.
                  </p>

                  <Link to="/organiser/create-post">
                    Create Your First Post
                    <ArrowRight size={16} />
                  </Link>
                </div>

              )}

            </section>

          )}

          {/* ==================================
              FOOTER
          ================================== */}

          <footer className="od-footer">
            <span>© 2026 STALLORA</span>

            <span>
              MADE FOR PEOPLE WHO MAKE EVENTS HAPPEN.
            </span>

            <Link to="/organiser/profile">
              Organiser Profile
              <ExternalLink size={13} />
            </Link>
          </footer>

        </section>

      </div>

      {/* ==================================
          POST PREVIEW MODAL
      ================================== */}

      {selectedPost && (

        <div
          className="od-post-modal"
          onClick={() => setSelectedPost(null)}
        >

          <div
            className="od-post-modal-content"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              type="button"
              className="od-modal-close"
              onClick={() => setSelectedPost(null)}
              aria-label="Close post preview"
            >
              ×
            </button>

            {selectedPost.mediaType === "video" ? (
              <video
                src={selectedPost.mediaUrl || selectedPost.image}
                controls
                autoPlay
                playsInline
              />
            ) : (
              <img
                src={
                  selectedPost.mediaUrl ||
                  selectedPost.image
                }
                alt={selectedPost.caption || "Post preview"}
              />
            )}

            <div className="od-post-modal-details">

              <p>
                {selectedPost.caption || "No caption added."}
              </p>

              <div className="od-post-metrics">
                <span>
                  <Heart size={15} />
                  {selectedPost.likes || 0} Likes
                </span>

                <span>
                  <Eye size={15} />
                  {selectedPost.views || 0} Views
                </span>
              </div>

              <button
                type="button"
                className="od-delete-post"
                onClick={() => deletePost(selectedPost.id)}
              >
                Delete Post
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}