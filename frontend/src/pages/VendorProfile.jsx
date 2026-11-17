import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/VendorFlow.css";

const readStoredJSON = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
};

const getSavedVendor = () => {
  const isLoggedIn = localStorage.getItem("stalloraVendorSession") === "true";
  return isLoggedIn ? readStoredJSON("stalloraVendor") : null;
};

const getActiveMembership = () => {
  const savedMembership = readStoredJSON("stalloraVendorMembership");

  if (
    savedMembership?.status === "active" &&
    savedMembership.expiresAt &&
    new Date(savedMembership.expiresAt).getTime() > Date.now()
  ) {
    return savedMembership;
  }

  return null;
};

export default function VendorProfile() {
  const navigate = useNavigate();

  const [vendor, setVendor] = useState(getSavedVendor);
  const [membership, setMembership] = useState(getActiveMembership);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => {
    const savedVendor = getSavedVendor();

    return {
      name: savedVendor?.name || "",
      phone: savedVendor?.phone || "",
    };
  });

  useEffect(() => {
    if (!getSavedVendor()) {
      navigate("/vendor/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const refreshMembership = () => {
      setMembership(getActiveMembership());
    };

    window.addEventListener("storage", refreshMembership);
    window.addEventListener("stallora-vendor-updated", refreshMembership);
    window.addEventListener("focus", refreshMembership);

    return () => {
      window.removeEventListener("storage", refreshMembership);
      window.removeEventListener("stallora-vendor-updated", refreshMembership);
      window.removeEventListener("focus", refreshMembership);
    };
  }, []);

  const handleSave = (event) => {
    event.preventDefault();

    const updatedVendor = {
      ...vendor,
      name: form.name.trim(),
      phone: form.phone.trim(),
    };

    localStorage.setItem("stalloraVendor", JSON.stringify(updatedVendor));
    setVendor(updatedVendor);
    setForm({
      name: updatedVendor.name,
      phone: updatedVendor.phone,
    });
    setEditing(false);

    window.dispatchEvent(new Event("stallora-vendor-updated"));
  };

  if (!vendor) {
    return (
      <main className="vf-page">
        <div className="vf-loading">Loading profile...</div>
      </main>
    );
  }

  return (
    <main className="vf-page vf-content-page vf-profile-page">
      <div className="vf-page-heading">
        <div>
          <span className="vf-eyebrow">YOUR ACCOUNT</span>
          <h1>Vendor Profile</h1>
          <p>Manage your account and membership details.</p>
        </div>

        <Link to="/vendor/bookings" className="vf-button vf-button-outline">
          My Bookings
        </Link>
      </div>

      <section className="vf-profile-layout">
        <div className="vf-profile-card">
          <div className="vf-profile-avatar">
            {vendor.name?.charAt(0)?.toUpperCase() || "V"}
          </div>

          <h2>{vendor.name}</h2>
          <p>{vendor.email}</p>

          <span className="vf-status-badge">
            {membership ? "Membership Active" : "Free Preview Access"}
          </span>

          <button
            type="button"
            className="vf-button vf-button-outline"
            onClick={() => setEditing((current) => !current)}
          >
            {editing ? "Cancel Editing" : "Edit Profile"}
          </button>
        </div>

        <div className="vf-profile-details">
          <h2>Personal Information</h2>

          {editing ? (
            <form className="vf-form" onSubmit={handleSave}>
              <label>
                Full Name
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  required
                />
              </label>

              <label>
                Mobile Number
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                />
              </label>

              <button className="vf-button vf-button-primary" type="submit">
                Save Changes
              </button>
            </form>
          ) : (
            <div className="vf-detail-list">
              <div>
                <span>Full Name</span>
                <strong>{vendor.name}</strong>
              </div>

              <div>
                <span>Email Address</span>
                <strong>{vendor.email}</strong>
              </div>

              <div>
                <span>Mobile Number</span>
                <strong>{vendor.phone || "Not added"}</strong>
              </div>

              <div>
                <span>Member Since</span>
                <strong>
                  {vendor.createdAt
                    ? new Date(vendor.createdAt).toLocaleDateString("en-IN")
                    : "—"}
                </strong>
              </div>
            </div>
          )}

          <div className="vf-membership-box">
            <div>
              <span className="vf-card-kicker">YOUR MEMBERSHIP</span>

              <h3>
                {membership
                  ? `${membership.name} Plan`
                  : "No Active Membership"}
              </h3>

              <p>
                {membership
                  ? `${membership.discount}% stall discount · Up to ${membership.events} discounted events`
                  : "You currently have access to 3 preview stall cards."}
              </p>

              {membership && (
                <small>
                  Expires{" "}
                  {new Date(membership.expiresAt).toLocaleDateString("en-IN")}
                </small>
              )}
            </div>

            <Link
              to={membership ? "/vendor/stalls" : "/vendor/membership"}
              className="vf-button vf-button-primary"
            >
              {membership ? "Explore Stalls" : "View Plans"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
