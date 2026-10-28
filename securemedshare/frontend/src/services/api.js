const API_BASE = "http://127.0.0.1:8000/api";

function getToken() {
  try {
    const raw = localStorage.getItem("securemedshare_token");
    return raw || "";
  } catch {
    return "";
  }
}

async function request(endpoint, options = {}) {
  const headers = options.headers || {};
  const token = getToken();
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let msg = "Request failed";
    try {
      const err = await res.json();
      msg = err.detail || err.message || msg;
    } catch {
      // fallback
    }
    throw new Error(msg);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(credentials) {
    const data = await request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (data.access_token) {
      localStorage.setItem("securemedshare_token", data.access_token);
    }
    return data;
  },

  async register(details) {
    const data = await request("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(details),
    });
    if (data.access_token) {
      localStorage.setItem("securemedshare_token", data.access_token);
    }
    return data;
  },

  async me() {
    return request("/auth/me");
  },

  // Records
  async getRecords(params = {}) {
    const q = new URLSearchParams();
    if (params.q) q.set("q", params.q);
    if (params.type && params.type !== "All") q.set("type", params.type);
    if (params.status && params.status !== "All") q.set("status", params.status);
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request(`/records${qs}`);
  },

  async uploadRecord(formData) {
    return request("/records", {
      method: "POST",
      body: formData,
    });
  },

  // Watermark
  async embedWatermark(formData) {
    return request("/watermark/embed", {
      method: "POST",
      body: formData,
    });
  },

  async verifyWatermark(formData) {
    return request("/watermark/verify", {
      method: "POST",
      body: formData,
    });
  },

  // Steganography
  async getStegoCapacity(formData) {
    return request("/stego/capacity", {
      method: "POST",
      body: formData,
    });
  },

  async hideStego(formData) {
    return request("/stego/hide", {
      method: "POST",
      body: formData,
    });
  },

  async extractStego(formData) {
    return request("/stego/extract", {
      method: "POST",
      body: formData,
    });
  },

  // Verification
  async verifyFile(formData) {
    return request("/verify/file", {
      method: "POST",
      body: formData,
    });
  },

  // Sharing & Permissions
  async getPermissions() {
    return request("/sharing/permissions");
  },

  async grantPermission(payload) {
    return request("/sharing/grant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  async revokePermission(id) {
    return request(`/sharing/revoke/${id}`, {
      method: "POST",
    });
  },

  // Audit
  async getAuditLogs(params = {}) {
    const q = new URLSearchParams();
    if (params.q) q.set("q", params.q);
    if (params.event && params.event !== "All") q.set("event", params.event);
    if (params.result && params.result !== "All") q.set("result", params.result);
    if (params.date) q.set("date", params.date);
    if (params.page) q.set("page", params.page);
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request(`/audit/logs${qs}`);
  },

  // Users & Patients
  async getPatients() {
    return request("/patients");
  },

  async getUsers() {
    return request("/users");
  },

  async getNotifications() {
    return request("/notifications");
  },

  async markNotificationsRead() {
    return request("/notifications/mark-read", { method: "POST" });
  },
};
