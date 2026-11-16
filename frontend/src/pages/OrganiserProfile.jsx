import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Grid3X3,
  Image,
  Video,
  MapPin,
  Globe,
  Pencil,
  Settings,
  Plus,
  Crown,
  CalendarDays,
  X,
  CheckCircle2,
  ExternalLink,
  Store,
} from "lucide-react";

import "../css/OrganiserProfile.css";

// ==========================================
// STORAGE KEYS
// ==========================================

const PROFILE_KEY = "stalloraOrganiser";
const POSTS_KEY = "stalloraOrganiserPosts";

// ==========================================
// DEFAULT PROFILE
// ==========================================

const emptyProfile = {
  name: "",
  company: "",
  username: "",
  bio: "",
  about: "",
  location: "",
  website: "",
  instagram: "",
  facebook: "",
  profileImage: "",
  membership: "silver",
  membershipName: "Silver",
  membershipStatus: "pending_payment",
  categories: [],
};

// ==========================================
// READ ORGANISER PROFILE
// ==========================================

function getSavedProfile() {
  try {
    const saved = localStorage.getItem(PROFILE_KEY);

    if (!saved) return null;

    return {
      ...emptyProfile,
      ...JSON.parse(saved),
    };
  } catch (error) {
    console.error("Unable to load organiser profile:", error);
    return null;
  }
}

// ==========================================
// READ ORGANISER POSTS
// ==========================================

function getSavedPosts() {
  try {
    const saved = localStorage.getItem(POSTS_KEY);

    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Unable to load organiser posts:", error);
    return [];
  }
}

// ==========================================
// SAVE PROFILE
// ==========================================

function saveOrganiserProfile(updatedProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));

  window.dispatchEvent(new Event("stallora:organiser-updated"));

  return updatedProfile;
}

// ==========================================
// NORMALIZE WEBSITE URL
// ==========================================

function normalizeUrl(value) {
  if (!value) return "";

  const trimmed = value.trim();

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function OrganiserProfile() {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  // PROFILE
  const [profile, setProfile] = useState(getSavedProfile);

  // POSTS
  const [posts, setPosts] = useState(getSavedPosts);

  // EDIT MODAL
  const [editing, setEditing] = useState(false);

  // MESSAGE
  const [message, setMessage] = useState("");

  // FORM
  const [form, setForm] = useState(() => ({
    ...emptyProfile,
    ...(getSavedProfile() || {}),
  }));

  // ==========================================
  // REFRESH PROFILE
  // ==========================================

  useEffect(() => {
    const refreshData = () => {
      const updatedProfile = getSavedProfile();

      setProfile(updatedProfile);
      setPosts(getSavedPosts());

      if (updatedProfile) {
        setForm(updatedProfile);
      }
    };

    window.addEventListener("stallora:organiser-updated", refreshData);

    window.addEventListener("storage", refreshData);

    return () => {
      window.removeEventListener("stallora:organiser-updated", refreshData);

      window.removeEventListener("storage", refreshData);
    };
  }, []);

  // ==========================================
  // CHECK ORGANISER ACCOUNT
  // ==========================================

  if (!profile) {
    return (
      <main className="op-not-found">
        <div className="op-not-found-card">
          <Store size={38} />

          <h2>Organiser profile not found</h2>

          <p>
            Please create your organiser account before accessing your profile.
          </p>

          <Link to="/organiser/membership">
            Create Organiser Account
            <ArrowRight size={17} />
          </Link>
        </div>
      </main>
    );
  }

  // ==========================================
  // PROFILE INFORMATION
  // ==========================================

  const displayName = profile.company || profile.name || "Organiser";

  const username =
    profile.username || displayName.toLowerCase().replace(/[^a-z0-9]+/g, "");

  const planName =
    profile.membershipName ||
    (profile.membership === "gold" ? "Gold" : "Silver");

  const isGold = planName.toLowerCase() === "gold";

  // ==========================================
  // POSTS INFORMATION
  // ==========================================

  const totalPosts = posts.length;

  const imagePosts = posts.filter((post) => post.mediaType !== "video").length;

  const videoPosts = posts.filter((post) => post.mediaType === "video").length;

  // ==========================================
  // PROFILE INITIALS
  // ==========================================

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  // ==========================================
  // HANDLE FORM INPUT
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // IMAGE UPLOAD
  // ==========================================

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image.");
      e.target.value = "";
      return;
    }

    // Keep localStorage usage manageable
    if (file.size > 1.5 * 1024 * 1024) {
      setMessage("Please select an image smaller than 1.5 MB.");

      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageData = reader.result;

      if (typeof imageData !== "string") {
        setMessage("Unable to read the selected image.");
        return;
      }

      // Update form preview immediately
      setForm((previous) => ({
        ...previous,
        profileImage: imageData,
      }));

      // When not editing, save directly to profile
      if (!editing) {
        try {
          const updatedProfile = {
            ...profile,
            profileImage: imageData,
            updatedAt: new Date().toISOString(),
          };

          saveOrganiserProfile(updatedProfile);

          setProfile(updatedProfile);
          setForm(updatedProfile);

          setMessage("Profile picture updated successfully.");
        } catch (error) {
          console.error("Image save error:", error);

          setMessage("Unable to save image. Please choose a smaller image.");
        }
      } else {
        setMessage("Image preview updated. Save your profile to apply it.");
      }
    };

    reader.onerror = () => {
      setMessage("Unable to read the selected image.");
    };

    reader.readAsDataURL(file);

    // Allow selecting the same image again
    e.target.value = "";
  };

  // ==========================================
  // SAVE PROFILE
  // ==========================================

  const saveProfile = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setMessage("Please enter your full name.");
      return;
    }

    if (!form.company.trim()) {
      setMessage("Please enter your company name.");
      return;
    }

    const updatedProfile = {
      ...profile,
      ...form,

      name: form.name.trim(),
      company: form.company.trim(),

      username: (form.username || "")
        .trim()
        .replace(/^@/, "")
        .replace(/\s+/g, "")
        .toLowerCase(),

      website: (form.website || "").trim(),
      instagram: (form.instagram || "").trim(),
      facebook: (form.facebook || "").trim(),

      updatedAt: new Date().toISOString(),
    };

    try {
      saveOrganiserProfile(updatedProfile);

      setProfile(updatedProfile);
      setForm(updatedProfile);

      setEditing(false);

      setMessage("Your organiser profile has been updated.");
    } catch (error) {
      console.error("Profile save error:", error);

      setMessage("Unable to save profile. Please use a smaller image.");
    }
  };

  // ==========================================
  // OPEN EDIT PROFILE
  // ==========================================

  const openEditProfile = () => {
    setForm(profile);
    setEditing(true);
    setMessage("");
  };

  // ==========================================
  // OPEN POST
  // ==========================================

  const openPost = (post) => {
    navigate("/organiser/dashboard", {
      state: {
        selectedPost: post.id,
      },
    });
  };

  // ==========================================
  // PROFILE PAGE
  // ==========================================

  return (
    <main className="op-page">
      <div className="op-container">
        {/* ==================================
            TOP NAVIGATION
        ================================== */}

        <div className="op-topbar">
          <Link to="/" className="op-back-home">
            <ArrowLeft size={17} />
            STALLORA
          </Link>

          <div className="op-top-actions">
            <Link to="/organiser/dashboard" className="op-dashboard-link">
              <Settings size={17} />
              Dashboard
            </Link>

            <button className="op-edit-button" onClick={openEditProfile}>
              <Pencil size={16} />
              Edit Profile
            </button>
          </div>
        </div>

        {/* ==================================
            MESSAGE
        ================================== */}

        {message && (
          <div className="op-message">
            <CheckCircle2 size={17} />

            {message}

            <button onClick={() => setMessage("")}>
              <X size={15} />
            </button>
          </div>
        )}

        {/* ==================================
            PROFILE HEADER
        ================================== */}

        <section className="op-profile-header">
          {/* PROFILE IMAGE */}

          <div className="op-avatar-section">
            <button
              type="button"
              className="op-avatar"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change profile photo"
            >
              {profile.profileImage ? (
                <img src={profile.profileImage} alt={displayName} />
              ) : (
                <span>{initials}</span>
              )}

              <div className="op-avatar-camera">
                <Camera size={19} />
              </div>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageUpload}
            />
          </div>

          {/* PROFILE DETAILS */}

          <div className="op-profile-details">
            <div className="op-name-row">
              <h1>{displayName}</h1>

              <span
                className={`op-membership-badge ${isGold ? "gold" : "silver"}`}
              >
                <Crown size={14} />
                {planName} Member
              </span>
            </div>

            <div className="op-username">@{username}</div>

            {/* STATS */}

            <div className="op-stats">
              <div>
                <strong>{totalPosts}</strong>
                <span>Posts</span>
              </div>

              <div>
                <strong>{imagePosts}</strong>
                <span>Photos</span>
              </div>

              <div>
                <strong>{videoPosts}</strong>
                <span>Videos</span>
              </div>
            </div>

            {/* BIO */}

            <div className="op-bio">
              <strong>{displayName}</strong>

              <p>
                {profile.bio ||
                  "Welcome to our organiser profile. We create experiences, bring communities together and make events happen."}
              </p>

              {profile.about && <p>{profile.about}</p>}
            </div>

            {/* LOCATION */}

            {profile.location && (
              <div className="op-meta-item">
                <MapPin size={15} />
                {profile.location}
              </div>
            )}

            {/* WEBSITE */}

            {profile.website && (
              <a
                className="op-meta-item op-website"
                href={normalizeUrl(profile.website)}
                target="_blank"
                rel="noreferrer"
              >
                <Globe size={15} />
                {profile.website}
                <ExternalLink size={12} />
              </a>
            )}

            {/* SOCIAL LINKS */}

            <div className="op-social-links">
              {profile.instagram && (
                <a
                  href={
                    profile.instagram.startsWith("http")
                      ? profile.instagram
                      : `https://instagram.com/${profile.instagram.replace("@", "")}`
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  <Globe size={16} />
                  Instagram
                </a>
              )}

              {profile.facebook && (
                <a
                  href={
                    profile.facebook.startsWith("http")
                      ? profile.facebook
                      : `https://facebook.com/${profile.facebook}`
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  <Globe size={16} />
                  Facebook
                </a>
              )}
            </div>

            {/* CATEGORIES */}

            {profile.categories?.length > 0 && (
              <div className="op-categories">
                {profile.categories.map((category) => (
                  <span key={category}>{category}</span>
                ))}
              </div>
            )}
          </div>

          {/* MOBILE EDIT BUTTON */}

          <button className="op-mobile-edit" onClick={openEditProfile}>
            <Pencil size={16} />
            Edit Profile
          </button>
        </section>

        {/* ==================================
            MEMBERSHIP BANNER
        ================================== */}

        <section className={`op-plan-banner ${isGold ? "gold" : "silver"}`}>
          <div className="op-plan-icon">
            <Crown size={22} />
          </div>

          <div>
            <span>YOUR STALLORA MEMBERSHIP</span>

            <h3>{planName} Membership</h3>

            <p>
              {profile.membershipStatus === "active"
                ? "Your membership is active."
                : "Your selected membership is awaiting payment verification."}
            </p>
          </div>

          <div className="op-plan-status">
            {profile.membershipStatus === "active"
              ? "ACTIVE"
              : "PENDING PAYMENT"}
          </div>
        </section>

        {/* ==================================
            PROFILE TABS
        ================================== */}

        <div className="op-tabs">
          <button className="active" type="button">
            <Grid3X3 size={17} />
            POSTS
          </button>

          <Link to="/organiser/dashboard">
            <CalendarDays size={17} />
            MY EVENTS
          </Link>

          <Link to="/organiser/dashboard">
            <Video size={17} />
            VIDEOS
          </Link>
        </div>

        {/* ==================================
            POSTS SECTION
        ================================== */}

        <section className="op-post-section">
          <div className="op-post-heading">
            <div>
              <span>ORGANISER CONTENT</span>
              <h2>Your posts</h2>
            </div>

            <Link to="/organiser/dashboard" className="op-create-post-button">
              <Plus size={17} />
              Create Post
            </Link>
          </div>

          {/* POSTS GRID */}

          {posts.length > 0 ? (
            <div className="op-post-grid">
              {posts.map((post) => (
                <button
                  className="op-post-tile"
                  key={post.id}
                  onClick={() => openPost(post)}
                  aria-label={`View ${post.eventName || "event"} post`}
                >
                  {post.mediaType === "video" ? (
                    <video
                      src={post.media}
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={post.media}
                      alt={post.eventName || "Organiser post"}
                      loading="lazy"
                    />
                  )}

                  {post.mediaType === "video" && (
                    <div className="op-video-indicator">
                      <Video size={20} />
                    </div>
                  )}

                  <div className="op-post-overlay">
                    <strong>{post.eventName}</strong>

                    <span>{post.caption}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="op-empty-posts">
              <div className="op-empty-icon">
                <Image size={35} />
              </div>

              <h3>Share your first event story.</h3>

              <p>
                Your event photos and videos will appear here. Start creating
                posts and show vendors what you're organising.
              </p>

              <Link to="/organiser/dashboard" className="op-create-first-post">
                Create Your First Post
                <ArrowRight size={17} />
              </Link>
            </div>
          )}
        </section>

        {/* ==================================
            FOOTER
        ================================== */}

        <footer className="op-footer">
          <span>STALLORA</span>
          <span>YOUR EVENTS. YOUR COMMUNITY.</span>
        </footer>
      </div>

      {/* ======================================
          EDIT PROFILE MODAL
      ====================================== */}

      {editing && (
        <div className="op-modal-overlay" onClick={() => setEditing(false)}>
          <div className="op-edit-modal" onClick={(e) => e.stopPropagation()}>
            {/* MODAL HEADER */}

            <div className="op-modal-heading">
              <div>
                <span>YOUR ORGANISER IDENTITY</span>
                <h2>Edit Profile</h2>
              </div>

              <button
                type="button"
                onClick={() => setEditing(false)}
                aria-label="Close edit profile"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={saveProfile}>
              {/* IMAGE PREVIEW */}

              <div className="op-edit-avatar">
                <div className="op-edit-avatar-image">
                  {form.profileImage ? (
                    <img src={form.profileImage} alt="Profile preview" />
                  ) : (
                    initials
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={16} />
                  Change photo
                </button>
              </div>

              {/* FORM FIELDS */}

              <div className="op-form-grid">
                <label>
                  Full Name
                  <input
                    name="name"
                    value={form.name || ""}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                  />
                </label>

                <label>
                  Company Name
                  <input
                    name="company"
                    value={form.company || ""}
                    onChange={handleChange}
                    placeholder="Your company name"
                    required
                  />
                </label>

                <label>
                  Username
                  <input
                    name="username"
                    value={form.username || ""}
                    onChange={handleChange}
                    placeholder="your_username"
                  />
                </label>

                <label>
                  Location
                  <input
                    name="location"
                    value={form.location || ""}
                    onChange={handleChange}
                    placeholder="Mumbai, India"
                  />
                </label>

                <label className="op-full-field">
                  Bio
                  <textarea
                    name="bio"
                    value={form.bio || ""}
                    onChange={handleChange}
                    maxLength={250}
                    placeholder="Write something about your event business..."
                  />
                  <small>{(form.bio || "").length}/250 characters</small>
                </label>

                <label className="op-full-field">
                  About Your Business
                  <textarea
                    name="about"
                    value={form.about || ""}
                    onChange={handleChange}
                    placeholder="Tell vendors about your company and events..."
                  />
                </label>

                <label>
                  Website
                  <input
                    name="website"
                    value={form.website || ""}
                    onChange={handleChange}
                    placeholder="www.example.com"
                  />
                </label>

                <label>
                  Instagram
                  <input
                    name="instagram"
                    value={form.instagram || ""}
                    onChange={handleChange}
                    placeholder="@username"
                  />
                </label>

                <label className="op-full-field">
                  Facebook
                  <input
                    name="facebook"
                    value={form.facebook || ""}
                    onChange={handleChange}
                    placeholder="Facebook profile URL"
                  />
                </label>
              </div>

              {/* MODAL BUTTONS */}

              <div className="op-modal-footer">
                <button
                  type="button"
                  className="op-cancel-button"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="op-save-button">
                  Save Changes
                  <CheckCircle2 size={17} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
