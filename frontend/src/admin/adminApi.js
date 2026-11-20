import { API } from "../api";

const TOKEN_KEY = "stalloraAdminToken";

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (t) => {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
};

// fetch() for admin routes: adds the token, logs out on 401
export async function adminFetch(path, options = {}) {
  const res = await fetch(`${API}/admin${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken() || ""}`,
      ...(options.headers || {}),
    },
  });
  if (res.status === 401) {
    setToken(null);
    window.location.assign("/admin/login");
    throw new Error("Please log in again");
  }
  if (options.raw) return res;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

export const USER_STATUS = {
  active: { label: "Active", tone: "good" },
  blocked: { label: "Blocked", tone: "bad" },
};

export const EVENT_STATUS = {
  pending: { label: "Needs approval", tone: "warn" },
  approved: { label: "Live", tone: "good" },
  rejected: { label: "Rejected", tone: "bad" },
  hidden: { label: "Hidden", tone: "muted" },
};

// bookings: payment state matters most, then organiser decision
export const bookingStatus = (b) => {
  if (b.status === "cancelled") return { label: "Cancelled", tone: "muted" };
  if (b.status === "rejected") return { label: "Rejected", tone: "bad" };
  if (b.kind === "booking" && b.paymentStatus === "awaiting") return { label: "Not paid yet", tone: "muted" };
  if (b.kind === "booking" && b.paymentStatus === "failed") return { label: "Payment failed", tone: "bad" };
  if (b.status === "approved") return { label: b.paymentStatus === "paid" ? "Paid · approved" : "Approved", tone: "good" };
  if (b.paymentStatus === "paid") return { label: "Paid", tone: "good" };
  return { label: "Enquiry", tone: "info" };
};

export const STATUS = {
  created: { label: "Not paid", tone: "muted" },
  authenticated: { label: "Starting", tone: "info" },
  active: { label: "Active", tone: "good" },
  cancel_scheduled: { label: "Cancelling", tone: "warn" },
  pending: { label: "Payment retrying", tone: "warn" },
  halted: { label: "Payment failed", tone: "bad" },
  cancelled: { label: "Cancelled", tone: "muted" },
  completed: { label: "Completed", tone: "muted" },
  expired: { label: "Expired", tone: "muted" },
};

export const rupees = (n) => (n == null ? "—" : `₹${Number(n).toLocaleString("en-IN")}`);
export const date = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
