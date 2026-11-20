const cloudinary = require("cloudinary").v2;

const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);
if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const MAX_INLINE = 3 * 1024 * 1024; // without Cloudinary, keep stored files small

// Takes what the browser sent (a "data:image/..." string or a normal URL).
// With Cloudinary set up: uploads it and returns the hosted link.
// Without: keeps the data in MongoDB (fine for small images while testing).
async function storeMedia(value, folder = "stallora") {
  const v = String(value || "");
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v.slice(0, 1000);
  if (!/^data:(image|video)\/[a-z0-9.+-]+;base64,/i.test(v)) {
    const err = new Error("Unsupported file. Please upload an image or video.");
    err.status = 400;
    throw err;
  }
  if (hasCloudinary) {
    const res = await cloudinary.uploader.upload(v, { folder, resource_type: "auto" });
    return res.secure_url;
  }
  if (v.length > MAX_INLINE) {
    const err = new Error("File too large. Add Cloudinary keys in backend/.env to upload big files, or use a smaller image.");
    err.status = 413;
    throw err;
  }
  return v;
}

module.exports = { storeMedia, hasCloudinary };
