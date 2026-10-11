/** apiClient.js - one fetch() wrapper used by every service. */
class ApiError extends Error {
  constructor(message, status, data) { super(message); this.status = status; this.data = data; }
}

const Session = {
  save(token, user) { localStorage.setItem("iec_token", token || ""); localStorage.setItem("iec_user", JSON.stringify(user)); },
  /** Returns the stored JWT, or null if there is none or it has already expired. */
  getToken() {
    const t = localStorage.getItem("iec_token");
    if (t && Session.isExpired(t)) { Session.clear(); return null; }
    return t || null;
  },
  /** Reads the `exp` claim of a JWT. Non-JWT tokens are never treated as expired here (the server decides). */
  isExpired(token) {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return false;
      const { exp } = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
      return !!exp && exp * 1000 < Date.now();
    } catch { return false; }
  },
  getUser() { try { return JSON.parse(localStorage.getItem("iec_user")); } catch { return null; } },
  clear() { localStorage.removeItem("iec_token"); localStorage.removeItem("iec_user"); },
  root() { return document.body.dataset.root || "../"; },
  logout() { Session.clear(); location.href = Session.root() + "pages/login.html"; },
  /** Redirect to login unless a user with the given role is signed in. */
  requireRole(role) {
    const u = Session.getUser();
    if (!Session.getToken() || !u || String(u.role).toUpperCase() !== role.toUpperCase()) {
      Session.clear(); location.href = Session.root() + "pages/login.html"; return null;
    }
    return u;
  },
};

/** Turns whatever error body Spring Boot sent into one readable message. */
function errorMessage(data, status) {
  if (data && typeof data === "object") {
    if (Array.isArray(data.errors) && data.errors.length) {
      const m = data.errors.map((e) => (typeof e === "string" ? e : e.defaultMessage || e.message || "")).filter(Boolean).join("; ");
      if (m) return m;
    }
    if (data.message) return data.message;
    if (typeof data.error === "string" && data.error) return data.error;
  }
  if (typeof data === "string" && data.trim() && !data.trim().startsWith("<")) return data.trim();
  const fallback = {
    400: "The request was invalid. Please check the entered details.",
    403: "You do not have permission to do that. If your session has expired, please log in again.",
    404: "The requested item was not found.",
    409: "This action conflicts with existing data.",
  };
  return fallback[status] || (status >= 500 ? "The server ran into a problem. Please try again." : `Request failed (${status})`);
}

const Api = {
  async request(path, { method = "GET", body, auth = true } = {}) {
    const headers = { Accept: "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (auth) {
      const token = Session.getToken();
      if (!token) { Session.logout(); throw new ApiError("Please log in to continue.", 401); }
      headers.Authorization = "Bearer " + token;
    }

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), CONFIG.REQUEST_TIMEOUT_MS);
    let res;
    try {
      res = await fetch(CONFIG.API_BASE_URL + path, { method, headers, signal: ctrl.signal, body: body !== undefined ? JSON.stringify(body) : undefined });
    } catch (err) {
      throw new ApiError(err.name === "AbortError"
        ? "The server took too long to respond. Please try again."
        : `Cannot reach the server at ${CONFIG.API_BASE_URL}. Check that the Spring Boot backend is running and CORS is enabled.`, 0);
    } finally { clearTimeout(timer); }

    const text = await res.text();
    let data = null;
    if (text) { try { data = JSON.parse(text); } catch { data = text; } }
    if (res.status === 401 && auth) { Session.logout(); throw new ApiError("Session expired. Please log in again.", 401); }
    if (!res.ok) throw new ApiError(errorMessage(data, res.status), res.status, data);
    return data;
  },
  get: (p, o) => Api.request(p, o),
  post: (p, body, o) => Api.request(p, { method: "POST", body, ...o }),
  put: (p, body, o) => Api.request(p, { method: "PUT", body, ...o }),
  del: (p, o) => Api.request(p, { method: "DELETE", ...o }),
};
