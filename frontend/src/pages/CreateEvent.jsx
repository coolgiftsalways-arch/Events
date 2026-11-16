import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  ImagePlus,
  Ticket,
  Users,
  Clock,
  IndianRupee,
  X,
  Upload,
  Save,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import "../css/CreateEvent.css";

const initialForm = {
  title: "",
  category: "",
  description: "",
  date: "",
  startTime: "",
  endTime: "",
  venue: "",
  address: "",
  city: "",
  state: "",
  price: "",
  totalStalls: "",
  contactEmail: "",
  contactPhone: "",
};

const CreateEvent = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [coverImage, setCoverImage] = useState("");
  const [imageName, setImageName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image.");
      event.target.value = "";
      return;
    }

    if (file.size > 1.5 * 1024 * 1024) {
      setError("Event image must be smaller than 1.5 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setCoverImage(reader.result);
      setImageName(file.name);
      setError("");
    };

    reader.onerror = () => {
      setError("Unable to read the selected image.");
    };

    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setCoverImage("");
    setImageName("");
  };

  const validateForm = () => {
    const requiredFields = [
      ["title", "Event title"],
      ["category", "Event category"],
      ["description", "Event description"],
      ["date", "Event date"],
      ["startTime", "Start time"],
      ["endTime", "End time"],
      ["venue", "Venue"],
      ["address", "Address"],
      ["city", "City"],
      ["state", "State"],
      ["price", "Stall price"],
      ["totalStalls", "Total stalls"],
      ["contactEmail", "Contact email"],
      ["contactPhone", "Contact phone"],
    ];

    for (const [field, label] of requiredFields) {
      if (!String(form[field]).trim()) {
        return `${label} is required.`;
      }
    }

    if (!coverImage) {
      return "Please upload an event cover image.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
      return "Please enter a valid contact email.";
    }

    if (!/^[6-9]\d{9}$/.test(form.contactPhone)) {
      return "Please enter a valid 10-digit Indian mobile number.";
    }

    if (Number(form.price) < 0) {
      return "Stall price cannot be negative.";
    }

    if (
      !Number.isInteger(Number(form.totalStalls)) ||
      Number(form.totalStalls) < 1
    ) {
      return "Please enter a valid number of stalls.";
    }

    const selectedDate = new Date(`${form.date}T${form.startTime}`);
    const endDate = new Date(`${form.date}T${form.endTime}`);

    if (Number.isNaN(selectedDate.getTime()) || selectedDate <= new Date()) {
      return "Please select a future event date and time.";
    }

    if (Number.isNaN(endDate.getTime()) || endDate <= selectedDate) {
      return "End time must be later than start time.";
    }

    return "";
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const organiser = JSON.parse(
      localStorage.getItem("stalloraOrganiser") || "null",
    );

    if (!organiser) {
      setError("Please register as an organiser before creating an event.");
      return;
    }

    setLoading(true);

    try {
      const existingEvents = JSON.parse(
        localStorage.getItem("stalloraOrganiserEvents") || "[]",
      );

      if (!Array.isArray(existingEvents)) {
        throw new Error("Invalid events data.");
      }

      const newEvent = {
        id: `event-${Date.now()}`,
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        date: form.date,
        startDate: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        venue: form.venue.trim(),
        location: `${form.city.trim()}, ${form.state.trim()}`,
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        price: Number(form.price),
        totalStalls: Number(form.totalStalls),
        availableStalls: Number(form.totalStalls),
        contactEmail: form.contactEmail.trim(),
        contactPhone: form.contactPhone.trim(),
        coverImage,
        image: coverImage,
        status: "pending",
        bookings: 0,
        createdAt: new Date().toISOString(),
        organiserId: organiser.id || organiser.email || "organiser",
        organiserName: organiser.name || "Organiser",
      };

      const updatedEvents = [newEvent, ...existingEvents];

      localStorage.setItem(
        "stalloraOrganiserEvents",
        JSON.stringify(updatedEvents),
      );

      window.dispatchEvent(new Event("stallora:events-updated"));

      setSuccess("Your event has been submitted successfully!");

      setTimeout(() => {
        navigate("/organiser/dashboard");
      }, 1200);
    } catch (err) {
      console.error("Event creation error:", err);

      setError(
        "Unable to save your event. Browser storage may be full. Try a smaller image.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ce-page">
      <div className="ce-container">
        <button
          type="button"
          className="ce-back-btn"
          onClick={() => navigate("/organiser/dashboard")}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="ce-heading">
          <span className="ce-eyebrow">ORGANISER STUDIO</span>
          <h1>Create Your Event</h1>
          <p>
            Bring your event to life. Add the details and invite vendors to
            participate.
          </p>
        </div>

        <form className="ce-form" onSubmit={handleSubmit}>
          {/* Basic Information */}

          <section className="ce-card">
            <div className="ce-section-heading">
              <div className="ce-section-icon">
                <CalendarDays size={21} />
              </div>

              <div>
                <h2>Basic Information</h2>
                <p>Give your event a name and tell people about it.</p>
              </div>
            </div>

            <div className="ce-grid">
              <div className="ce-field ce-full">
                <label htmlFor="ce-title">Event Name *</label>
                <input
                  id="ce-title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai Lifestyle & Flea Festival"
                  maxLength={100}
                />
              </div>

              <div className="ce-field">
                <label htmlFor="ce-category">Event Category *</label>
                <select
                  id="ce-category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="">Select category</option>
                  <option value="Flea Market">Flea Market</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Food Festival">Food Festival</option>
                  <option value="Art & Craft">Art & Craft</option>
                  <option value="Music">Music</option>
                  <option value="Exhibition">Exhibition</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="ce-field ce-full">
                <label htmlFor="ce-description">Event Description *</label>
                <textarea
                  id="ce-description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your event, audience, activities and what vendors can expect..."
                  rows={5}
                  maxLength={2000}
                />
                <span className="ce-character-count">
                  {form.description.length}/2000 characters
                </span>
              </div>
            </div>
          </section>

          {/* Cover Image */}

          <section className="ce-card">
            <div className="ce-section-heading">
              <div className="ce-section-icon">
                <ImagePlus size={21} />
              </div>

              <div>
                <h2>Event Cover Image</h2>
                <p>Choose an attractive image for your event.</p>
              </div>
            </div>

            {!coverImage ? (
              <label className="ce-upload-area">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />

                <div className="ce-upload-icon">
                  <Upload size={27} />
                </div>

                <strong>Upload your event image</strong>
                <span>Click to browse your device</span>
                <small>Image formats supported · Maximum 1.5 MB</small>
              </label>
            ) : (
              <div className="ce-image-preview">
                <img src={coverImage} alt="Event cover preview" />

                <button
                  type="button"
                  className="ce-remove-image"
                  onClick={removeImage}
                  aria-label="Remove event image"
                >
                  <X size={18} />
                </button>

                <div className="ce-image-name">{imageName}</div>
              </div>
            )}
          </section>

          {/* Date and Time */}

          <section className="ce-card">
            <div className="ce-section-heading">
              <div className="ce-section-icon">
                <Clock size={21} />
              </div>

              <div>
                <h2>Date & Time</h2>
                <p>When will your event take place?</p>
              </div>
            </div>

            <div className="ce-grid">
              <div className="ce-field ce-full">
                <label htmlFor="ce-date">Event Date *</label>
                <input
                  id="ce-date"
                  type="date"
                  name="date"
                  min={new Date().toLocaleDateString("en-CA")}
                  value={form.date}
                  onChange={handleChange}
                />
              </div>

              <div className="ce-field">
                <label htmlFor="ce-start">Start Time *</label>
                <input
                  id="ce-start"
                  type="time"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                />
              </div>

              <div className="ce-field">
                <label htmlFor="ce-end">End Time *</label>
                <input
                  id="ce-end"
                  type="time"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          {/* Venue Information */}

          <section className="ce-card">
            <div className="ce-section-heading">
              <div className="ce-section-icon">
                <MapPin size={21} />
              </div>

              <div>
                <h2>Venue & Location</h2>
                <p>Where should vendors and visitors find your event?</p>
              </div>
            </div>

            <div className="ce-grid">
              <div className="ce-field ce-full">
                <label htmlFor="ce-venue">Venue Name *</label>
                <input
                  id="ce-venue"
                  name="venue"
                  value={form.venue}
                  onChange={handleChange}
                  placeholder="e.g. Jio World Convention Centre"
                />
              </div>

              <div className="ce-field ce-full">
                <label htmlFor="ce-address">Full Address *</label>
                <textarea
                  id="ce-address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter the complete venue address"
                  rows={3}
                />
              </div>

              <div className="ce-field">
                <label htmlFor="ce-city">City *</label>
                <input
                  id="ce-city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai"
                />
              </div>

              <div className="ce-field">
                <label htmlFor="ce-state">State *</label>
                <input
                  id="ce-state"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="e.g. Maharashtra"
                />
              </div>
            </div>
          </section>

          {/* Stall Details */}

          <section className="ce-card">
            <div className="ce-section-heading">
              <div className="ce-section-icon">
                <Ticket size={21} />
              </div>

              <div>
                <h2>Stall Details</h2>
                <p>Set the pricing and number of available stalls.</p>
              </div>
            </div>

            <div className="ce-grid">
              <div className="ce-field">
                <label htmlFor="ce-price">Stall Price (₹) *</label>

                <div className="ce-input-icon">
                  <IndianRupee size={17} />

                  <input
                    id="ce-price"
                    type="number"
                    name="price"
                    min="0"
                    step="1"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="e.g. 2500"
                  />
                </div>
              </div>

              <div className="ce-field">
                <label htmlFor="ce-stalls">Total Stalls Available *</label>

                <div className="ce-input-icon">
                  <Users size={17} />

                  <input
                    id="ce-stalls"
                    type="number"
                    name="totalStalls"
                    min="1"
                    step="1"
                    value={form.totalStalls}
                    onChange={handleChange}
                    placeholder="e.g. 50"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Contact Details */}

          <section className="ce-card">
            <div className="ce-section-heading">
              <div className="ce-section-icon">
                <Users size={21} />
              </div>

              <div>
                <h2>Contact Information</h2>
                <p>How can vendors contact you about the event?</p>
              </div>
            </div>

            <div className="ce-grid">
              <div className="ce-field">
                <label htmlFor="ce-email">Contact Email *</label>
                <input
                  id="ce-email"
                  type="email"
                  name="contactEmail"
                  value={form.contactEmail}
                  onChange={handleChange}
                  placeholder="organiser@example.com"
                />
              </div>

              <div className="ce-field">
                <label htmlFor="ce-phone">Contact Phone *</label>
                <input
                  id="ce-phone"
                  type="tel"
                  name="contactPhone"
                  maxLength={10}
                  value={form.contactPhone}
                  onChange={(event) => {
                    const value = event.target.value.replace(/\D/g, "");

                    setForm((previous) => ({
                      ...previous,
                      contactPhone: value,
                    }));

                    setError("");
                  }}
                  placeholder="10-digit mobile number"
                />
              </div>
            </div>
          </section>

          {/* Messages */}

          {error && (
            <div className="ce-message ce-error">
              <AlertCircle size={19} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="ce-message ce-success">
              <CheckCircle size={19} />
              <span>{success}</span>
            </div>
          )}

          {/* Actions */}

          <div className="ce-submit-area">
            <p>
              Your event will be saved with <strong>Pending</strong> status
              until it is reviewed.
            </p>

            <div className="ce-submit-buttons">
              <button
                type="button"
                className="ce-cancel-btn"
                onClick={() => navigate("/organiser/dashboard")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="ce-submit-btn"
                disabled={loading}
              >
                <Save size={18} />
                {loading ? "Creating Event..." : "Create Event"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
