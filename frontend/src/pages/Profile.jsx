import React, { useEffect, useState } from "react";
import { isLoggedIn, updateProfile } from "../services/api";

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    bio: "",
    avatar: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    bio: "",
    avatar: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");

  // Load profile from localStorage
  useEffect(() => {
    try {
      const organiser = JSON.parse(
        localStorage.getItem("stalloraOrganiser") || "null",
      );

      const stalloraUser = JSON.parse(
        localStorage.getItem("stalloraUser") || "null",
      );

      const user = JSON.parse(localStorage.getItem("user") || "null");

      const savedUser = organiser || stalloraUser || user || {};

      const loadedProfile = {
        name:
          savedUser.name || savedUser.fullName || savedUser.organiserName || "",
        email: savedUser.email || "",
        phone:
          savedUser.phone || savedUser.mobile || savedUser.phoneNumber || "",
        businessName: savedUser.businessName || savedUser.companyName || "",
        bio: savedUser.bio || "",
        avatar:
          savedUser.avatar || savedUser.profileImage || savedUser.image || "",
      };

      setProfile(loadedProfile);
      setFormData(loadedProfile);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle profile image
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image.");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setMessage("Image size must be less than 3 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        avatar: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  // Save profile
  const handleSave = async () => {
    if (!formData.name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    if (!formData.email.trim()) {
      setMessage("Please enter your email.");
      return;
    }

    try {
      // Logged-in organiser/vendor: save to the server account
      const role = isLoggedIn("organiser") ? "organiser" : isLoggedIn("vendor") ? "vendor" : null;
      if (role) {
        await updateProfile(role, {
          name: formData.name,
          phone: formData.phone,
          company: formData.businessName,
          bio: formData.bio,
          profileImage: formData.avatar,
        });
      }

      const keys = role ? [] : ["stalloraUser", "user"];

      let savedSomething = false;

      keys.forEach((key) => {
        const existingData = localStorage.getItem(key);

        if (existingData) {
          const parsedData = JSON.parse(existingData);

          const updatedData = {
            ...parsedData,
            name: formData.name,
            fullName: formData.name,
            email: formData.email,
            phone: formData.phone,
            businessName: formData.businessName,
            bio: formData.bio,
            avatar: formData.avatar,
            profileImage: formData.avatar,
          };

          localStorage.setItem(key, JSON.stringify(updatedData));

          savedSomething = true;
        }
      });

      // Create a user entry if none exists
      if (!savedSomething && !role) {
        localStorage.setItem(
          "stalloraUser",
          JSON.stringify({
            ...formData,
          }),
        );
      }

      setProfile(formData);
      setIsEditing(false);
      setMessage("Profile updated successfully!");

      // Notify other components in the same tab
      window.dispatchEvent(new Event("stalloraProfileUpdated"));

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage(error.message || "Unable to save profile. Please try again.");
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
    setMessage("");
  };

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <div className="profile-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .profile-page {
          min-height: 100vh;
          background: #f7f7f5;
          padding: 45px 20px;
          font-family: Arial, sans-serif;
          color: #202020;
        }

        .profile-container {
          max-width: 950px;
          margin: auto;
        }

        .profile-heading {
          margin-bottom: 30px;
        }

        .profile-heading h1 {
          font-size: 32px;
          margin: 0 0 8px;
          font-weight: 700;
        }

        .profile-heading p {
          color: #777;
          font-size: 14px;
          margin: 0;
        }

        .profile-card {
          background: #fff;
          border-radius: 18px;
          border: 1px solid #eeeeeb;
          overflow: hidden;
          box-shadow: 0 8px 35px rgba(0,0,0,0.04);
        }

        .profile-cover {
          height: 145px;
          background: linear-gradient(120deg, #202020, #555);
        }

        .profile-main {
          padding: 0 35px 35px;
        }

        .profile-top {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-top: -55px;
          margin-bottom: 30px;
        }

        .profile-avatar-wrapper {
          display: flex;
          align-items: flex-end;
          gap: 18px;
        }

        .profile-avatar {
          width: 115px;
          height: 115px;
          border-radius: 50%;
          background: #e8e4dc;
          border: 5px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          font-size: 34px;
          font-weight: 700;
          color: #333;
          flex-shrink: 0;
        }

        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-user-name {
          padding-bottom: 12px;
        }

        .profile-user-name h2 {
          margin: 0 0 5px;
          font-size: 22px;
        }

        .profile-user-name p {
          margin: 0;
          color: #888;
          font-size: 13px;
        }

        .profile-edit-btn {
          background: #202020;
          color: white;
          border: none;
          padding: 12px 23px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }

        .profile-edit-btn:hover {
          background: #444;
        }

        .profile-section {
          border-top: 1px solid #eee;
          padding-top: 27px;
          margin-top: 25px;
        }

        .profile-section h3 {
          font-size: 16px;
          margin: 0 0 22px;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;
        }

        .profile-field {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .profile-field label {
          font-size: 12px;
          color: #777;
          font-weight: 600;
        }

        .profile-field input,
        .profile-field textarea {
          width: 100%;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          padding: 13px 14px;
          font-size: 14px;
          outline: none;
          font-family: inherit;
          background: #fafafa;
          color: #222;
        }

        .profile-field input:focus,
        .profile-field textarea:focus {
          border-color: #222;
          background: white;
        }

        .profile-field input:disabled,
        .profile-field textarea:disabled {
          background: #f8f8f8;
          color: #444;
          cursor: default;
        }

        .profile-field textarea {
          min-height: 95px;
          resize: vertical;
        }

        .profile-full {
          grid-column: 1 / -1;
        }

        .profile-image-upload {
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .profile-image-upload input {
          display: none;
        }

        .profile-upload-btn {
          display: inline-block;
          padding: 11px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 12px;
          cursor: pointer;
          background: white;
        }

        .profile-upload-btn:hover {
          background: #f5f5f5;
        }

        .profile-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 30px;
        }

        .profile-cancel-btn {
          background: white;
          border: 1px solid #ddd;
          color: #333;
          padding: 12px 22px;
          border-radius: 8px;
          cursor: pointer;
        }

        .profile-save-btn {
          background: #202020;
          color: white;
          border: none;
          padding: 12px 25px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .profile-message {
          padding: 13px 16px;
          margin-bottom: 20px;
          background: #e8f7ed;
          color: #21733d;
          border-radius: 8px;
          font-size: 13px;
        }

        @media (max-width: 650px) {
          .profile-page {
            padding: 25px 13px;
          }

          .profile-main {
            padding: 0 18px 25px;
          }

          .profile-heading h1 {
            font-size: 26px;
          }

          .profile-top {
            align-items: flex-start;
            flex-direction: column;
          }

          .profile-avatar {
            width: 85px;
            height: 85px;
            font-size: 25px;
          }

          .profile-user-name h2 {
            font-size: 18px;
          }

          .profile-grid {
            grid-template-columns: 1fr;
          }

          .profile-full {
            grid-column: auto;
          }

          .profile-actions {
            flex-direction: column-reverse;
          }

          .profile-actions button {
            width: 100%;
          }
        }
      `}</style>

      <div className="profile-container">
        <div className="profile-heading">
          <h1>My Profile</h1>
          <p>Manage your personal and organiser information.</p>
        </div>

        <div className="profile-card">
          <div className="profile-cover"></div>

          <div className="profile-main">
            <div className="profile-top">
              <div className="profile-avatar-wrapper">
                <div className="profile-avatar">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Profile" />
                  ) : (
                    initials
                  )}
                </div>

                <div className="profile-user-name">
                  <h2>{profile.name || "Your Name"}</h2>
                  <p>{profile.email || "Your email address"}</p>
                </div>
              </div>

              {!isEditing && (
                <button
                  className="profile-edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {message && <div className="profile-message">{message}</div>}

            {isEditing && (
              <div className="profile-section">
                <h3>Profile Photo</h3>

                <div className="profile-image-upload">
                  <label htmlFor="profile-image" className="profile-upload-btn">
                    Choose Image
                  </label>

                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />

                  <span style={{ fontSize: 12, color: "#888" }}>
                    JPG, PNG or WEBP. Maximum 3 MB.
                  </span>
                </div>
              </div>
            )}

            <div className="profile-section">
              <h3>Personal Information</h3>

              <div className="profile-grid">
                <div className="profile-field">
                  <label>FULL NAME</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="profile-field">
                  <label>EMAIL ADDRESS</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="profile-field">
                  <label>PHONE NUMBER</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="profile-field">
                  <label>BUSINESS / ORGANISATION NAME</label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter business name"
                  />
                </div>

                <div className="profile-field profile-full">
                  <label>ABOUT YOU</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Tell us something about yourself..."
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="profile-actions">
                <button className="profile-cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>

                <button className="profile-save-btn" onClick={handleSave}>
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
