import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ImagePlus,
  Video,
  X,
  Upload,
  Send,
  Hash,
  Eye,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import "../css/CreatePost.css";

const CreatePost = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const MAX_IMAGE_SIZE = 1.2 * 1024 * 1024;
  const MAX_VIDEO_SIZE = 2 * 1024 * 1024;

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      setError("Please select a valid image or video.");
      event.target.value = "";
      return;
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      setError("Image size must be below 1.2 MB.");
      event.target.value = "";
      return;
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      setError("Video size must be below 2 MB for this prototype.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setMedia(file);
      setPreview(reader.result);
      setMediaType(isImage ? "image" : "video");
    };

    reader.onerror = () => {
      setError("Unable to read this file. Please try another file.");
    };

    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setMedia(null);
    setPreview("");
    setMediaType("");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!media || !preview) {
      setError("Please upload an image or video before publishing.");
      return;
    }

    if (!caption.trim()) {
      setError("Please write a caption for your post.");
      return;
    }

    const organiser = JSON.parse(
      localStorage.getItem("stalloraOrganiser") || "null",
    );

    if (!organiser) {
      setError("Please complete organiser registration first.");
      return;
    }

    setLoading(true);

    try {
      const existingPosts = JSON.parse(
        localStorage.getItem("stalloraOrganiserPosts") || "[]",
      );

      if (!Array.isArray(existingPosts)) {
        throw new Error("Invalid posts data.");
      }

      const newPost = {
        id: `post-${Date.now()}`,
        mediaType,
        mediaUrl: preview,
        image: preview,
        caption: caption.trim(),
        likes: 0,
        views: 0,
        createdAt: new Date().toISOString(),
        organiserId: organiser.id || organiser.email || "organiser",
        organiserName: organiser.name || "Organiser",
      };

      const updatedPosts = [newPost, ...existingPosts];

      localStorage.setItem(
        "stalloraOrganiserPosts",
        JSON.stringify(updatedPosts),
      );

      window.dispatchEvent(new Event("stallora:posts-updated"));

      setSuccess("Your post has been published successfully!");

      setTimeout(() => {
        navigate("/organiser/dashboard");
      }, 1000);
    } catch (err) {
      console.error("Post publishing error:", err);

      setError(
        "Unable to publish your post. Storage may be full. Try a smaller file.",
      );
    } finally {
      setLoading(false);
    }
  };

  const characterCount = caption.length;

  return (
    <div className="cp-page">
      <div className="cp-container">
        <button
          type="button"
          className="cp-back-btn"
          onClick={() => navigate("/organiser/dashboard")}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="cp-heading">
          <div>
            <span className="cp-eyebrow">ORGANISER STUDIO</span>
            <h1>Create a Post</h1>
            <p>
              Share your event moments, announcements and experiences with the
              STALLORA community.
            </p>
          </div>
        </div>

        <form className="cp-layout" onSubmit={handleSubmit}>
          <div className="cp-editor">
            <div className="cp-card">
              <div className="cp-card-heading">
                <div>
                  <h2>Upload Media</h2>
                  <p>Add an image or video to your post.</p>
                </div>
                <ImagePlus size={22} />
              </div>

              {!preview ? (
                <div
                  className="cp-upload-area"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();

                    const file = event.dataTransfer.files?.[0];

                    if (file && fileInputRef.current) {
                      const transfer = new DataTransfer();
                      transfer.items.add(file);
                      fileInputRef.current.files = transfer.files;

                      handleFileChange({
                        target: fileInputRef.current,
                      });
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  <div className="cp-upload-icon">
                    <Upload size={28} />
                  </div>

                  <h3>Drag and drop your media here</h3>
                  <p>Or click to browse files</p>

                  <div className="cp-upload-formats">
                    <span>
                      <ImagePlus size={15} /> Images
                    </span>
                    <span>
                      <Video size={15} /> Videos
                    </span>
                  </div>

                  <small>Maximum image size: 1.2 MB · Video size: 2 MB</small>
                </div>
              ) : (
                <div className="cp-preview-wrapper">
                  <div className="cp-preview">
                    {mediaType === "image" ? (
                      <img src={preview} alt="Post preview" />
                    ) : (
                      <video src={preview} controls />
                    )}
                  </div>

                  <button
                    type="button"
                    className="cp-remove-media"
                    onClick={removeMedia}
                    aria-label="Remove uploaded media"
                  >
                    <X size={18} />
                  </button>

                  <div className="cp-media-info">
                    {mediaType === "image" ? (
                      <ImagePlus size={17} />
                    ) : (
                      <Video size={17} />
                    )}
                    <span>{media?.name}</span>
                    <span>{(media?.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                hidden
              />
            </div>

            <div className="cp-card">
              <div className="cp-card-heading">
                <div>
                  <h2>Post Details</h2>
                  <p>Tell people what your post is about.</p>
                </div>
                <Hash size={22} />
              </div>

              <div className="cp-field">
                <label htmlFor="cp-caption">Caption</label>

                <textarea
                  id="cp-caption"
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  placeholder="Share something exciting about your event..."
                  maxLength={1000}
                  rows={6}
                />

                <div className="cp-character-count">
                  {characterCount}/1000 characters
                </div>
              </div>
            </div>

            {error && (
              <div className="cp-message cp-error">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {success && (
              <div className="cp-message cp-success">
                <CheckCircle size={18} />
                {success}
              </div>
            )}

            <div className="cp-actions">
              <button
                type="button"
                className="cp-cancel-btn"
                onClick={() => navigate("/organiser/dashboard")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="cp-publish-btn"
                disabled={loading}
              >
                <Send size={17} />
                {loading ? "Publishing..." : "Publish Post"}
              </button>
            </div>
          </div>

          <aside className="cp-sidebar">
            <div className="cp-card cp-tips-card">
              <h3>Tips for a great post</h3>

              <ul>
                <li>Use high-quality images and videos.</li>
                <li>Write an engaging caption.</li>
                <li>Share event highlights and announcements.</li>
                <li>Keep your audience updated.</li>
              </ul>
            </div>

            <div className="cp-card cp-preview-card">
              <div className="cp-preview-title">
                <Eye size={18} />
                <h3>Post Preview</h3>
              </div>

              <div className="cp-preview-profile">
                <div className="cp-avatar">
                  {(
                    JSON.parse(
                      localStorage.getItem("stalloraOrganiser") || "{}",
                    ).name || "O"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>
                    {JSON.parse(
                      localStorage.getItem("stalloraOrganiser") || "{}",
                    ).name || "Your Organisation"}
                  </strong>
                  <span>Just now</span>
                </div>
              </div>

              <div className="cp-live-preview">
                {preview ? (
                  mediaType === "image" ? (
                    <img src={preview} alt="Live post preview" />
                  ) : (
                    <video src={preview} controls />
                  )
                ) : (
                  <div className="cp-empty-preview">
                    <ImagePlus size={30} />
                    <span>Your media preview will appear here</span>
                  </div>
                )}
              </div>

              <p className="cp-preview-caption">
                {caption || "Your caption will appear here..."}
              </p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
