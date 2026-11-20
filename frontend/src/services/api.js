import { API } from "../api";

// ==========================================
// LOGIN SESSIONS
// The token is the key to the account; the profile/membership
// are cached in the same localStorage keys the pages already read.
// ==========================================

const TOKEN_KEY = {
  vendor: "stalloraVendorToken",
  organiser: "stalloraOrganiserToken",
};

const store = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      if (value === null || value === undefined) localStorage.removeItem(key);
      else localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    } catch {
      /* storage full or blocked */
    }
  },
};

export const getToken = (role) => store.get(TOKEN_KEY[role]);
export const isLoggedIn = (role) => Boolean(getToken(role));

export function saveSession(role, { token, user, membership }) {
  if (token) store.set(TOKEN_KEY[role], token);
  if (role === "vendor") {
    store.set("stalloraVendor", user);
    store.set("stalloraVendorSession", "true");
    store.set("stalloraVendorMembership", membership || null);
    window.dispatchEvent(new Event("stallora-vendor-updated"));
  } else {
    store.set("stalloraOrganiser", user);
    window.dispatchEvent(new Event("stallora:organiser-updated"));
    window.dispatchEvent(new Event("stallora-user-updated"));
  }
}

export function clearSession(role) {
  store.set(TOKEN_KEY[role], null);
  if (role === "vendor") {
    ["stalloraVendor", "stalloraVendorSession", "stalloraVendorMembership", "stalloraPendingVendorPlan"].forEach((k) =>
      store.set(k, null)
    );
    window.dispatchEvent(new Event("stallora-vendor-updated"));
  } else {
    ["stalloraOrganiser", "stalloraPendingOrganiser", "stalloraSelectedPlan"].forEach((k) => store.set(k, null));
    window.dispatchEvent(new Event("stallora:organiser-updated"));
    window.dispatchEvent(new Event("stallora-user-updated"));
  }
}

// ==========================================
// FETCH HELPER
// apiFetch("/events")                         public
// apiFetch("/bookings/mine", { role: "vendor" }) sends the vendor token
// ==========================================

export async function apiFetch(path, { role, method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = role ? getToken(role) : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new Error("Can't reach the server. Check your internet connection and try again.");
  }

  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && role && token) clearSession(role);
  if (!res.ok) {
    const err = new Error(data.error || "Something went wrong. Please try again.");
    err.status = res.status;
    throw err;
  }
  return data;
}

// ==========================================
// ACCOUNT ACTIONS
// ==========================================

export async function register(role, details) {
  const data = await apiFetch(`/auth/${role}/register`, { method: "POST", body: details });
  saveSession(role, data);
  return data;
}

export async function login(role, email, password) {
  const data = await apiFetch(`/auth/${role}/login`, { method: "POST", body: { email, password } });
  saveSession(role, data);
  return data;
}

// Re-reads profile + membership from the server (call after payment, on app start)
export async function refreshSession(role) {
  if (!isLoggedIn(role)) return null;
  try {
    const data = await apiFetch("/auth/me", { role });
    saveSession(role, data);
    return data;
  } catch {
    return null;
  }
}

export async function updateProfile(role, changes) {
  const data = await apiFetch("/auth/me", { role, method: "PATCH", body: changes });
  saveSession(role, data);
  return data.user;
}

export function logout(role) {
  clearSession(role);
}

// Reads a picked file as a "data:..." string (sent to the server, which stores/uploads it)
export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read the selected file."));
    reader.readAsDataURL(file);
  });
}
