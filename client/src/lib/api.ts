// client/src/lib/api.ts
// API utility for handling authentication and requests

export const apiRequest = async (url: string, options: RequestInit = {}) => {
  // Get base URL from environment or use current origin
  const baseURL =
    process.env.NODE_ENV === "production" ? window.location.origin : "http://localhost:5000";

  const fullUrl = url.startsWith("http") ? url : `${baseURL}${url}`;

  const defaultOptions: RequestInit = {
    credentials: "include",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Cache-Control": "no-cache",
      ...(options.headers as Record<string, string> | undefined),
    },
    ...options,
  };

  console.log(`🌐 API Request: ${options.method || "GET"} ${fullUrl}`);

  try {
    const response = await fetch(fullUrl, defaultOptions);

    console.log(`📡 API Response: ${response.status} ${response.statusText}`);

    // Handle authentication errors
    if (response.status === 401) {
      console.log("🔒 Unauthorized - redirecting to login");
      window.location.href = "/login";
      return response;
    }

    return response;
  } catch (error) {
    console.error("❌ API Request failed:", error);
    throw error;
  }
};

/* ---------- Auth ---------- */
export const login = async (username: string, password: string) => {
  const response = await apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  return { response, data };
};

export const getCurrentUser = async () => {
  const response = await apiRequest(`/api/auth/user?t=${Date.now()}`);

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`User fetch failed: ${response.status}`);
  }

  return await response.json();
};

export const logout = async () => {
  const response = await apiRequest("/api/auth/logout", {
    method: "POST",
  });

  return response.ok;
};

/* ---------- Partners / Registration / Activation ---------- */

// Partner registration (user-facing)
export const registerPartner = async (data: any) => {
  const response = await apiRequest("/api/partner-registration-requests", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return await response.json();
};

// Get partner registration requests (admin only)
export const getPartnerRegistrationRequests = async () => {
  const response = await apiRequest("/api/partner-registration-requests");
  return await response.json();
};

// Approve partner registration (admin only)
export const approvePartnerRegistration = async (id: string) => {
  const response = await apiRequest(`/api/partner-registration-requests/${id}/approve`, {
    method: "POST",
  });
  return await response.json();
};

// Reject partner registration (admin only)
export const rejectPartnerRegistration = async (id: string, reason: string) => {
  const response = await apiRequest(`/api/partner-registration-requests/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  return await response.json();
};

/* ---------- Partner Activation (legal info / activation requests) ---------- */

// Create partner activation request (partner submits legal docs)
export const postPartnerActivationRequest = async (data: any) => {
  const response = await apiRequest("/api/partner-activation-requests", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return await response.json();
};

// Get partner activation requests for a specific partner (admin helper or partner view)
export const getPartnerActivationRequestsAdmin = async (partnerId: string) => {
  const response = await apiRequest(`/api/partner-activation-requests/partner/${partnerId}`);
  return await response.json();
};

// Get all partner activation requests (admin view) — THIS is required by client/pages/admin-activation-management.tsx
export const getAllPartnerActivationRequestsAdmin = async () => {
  const response = await apiRequest(`/api/partner-activation-requests`);
  return await response.json();
};

// Approve a partner activation request (admin)
export const approvePartnerActivation = async (requestId: string) => {
  const response = await apiRequest(`/api/partner-activation-requests/${requestId}/approve`, {
    method: "POST",
  });
  return await response.json();
};

// Reject a partner activation request (admin)
export const rejectPartnerActivation = async (requestId: string, reason: string) => {
  const response = await apiRequest(`/api/partner-activation-requests/${requestId}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  return await response.json();
};

/* ---------- Products / Partners / Inventory ---------- */

export const getProducts = async () => {
  const response = await apiRequest("/api/products");
  return await response.json();
};

export const createProduct = async (data: any) => {
  const response = await apiRequest("/api/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return await response.json();
};

export const getPartners = async () => {
  const response = await apiRequest("/api/partners");
  return await response.json();
};

export const getProductsByPartner = async (partnerId: string) => {
  const response = await apiRequest(`/api/products/partner/${partnerId}`);
  return await response.json();
};

export const getLowStockInventory = async () => {
  const response = await apiRequest("/api/admin/inventory/low-stock");
  return await response.json();
};

export const updatePartnerTier = async (partnerId: string, tier: string) => {
  const response = await apiRequest(`/api/admin/partners/${partnerId}/tier`, {
    method: "POST",
    body: JSON.stringify({ tier }),
  });
  return await response.json();
};

/* ---------- Orders ---------- */

export const getOrdersByPartner = async (partnerId: string) => {
  const response = await apiRequest(`/api/orders/partner/${partnerId}`);
  return await response.json();
};

/* ---------- My partner profile ---------- */

export const getMyPartnerProfile = async () => {
  const response = await apiRequest("/api/me/partner");
  return await response.json();
};

/* ---------- Misc helpers (example) ---------- */

// Example generic helper (adjust as needed for your app)
export const fetchJson = async (url: string, opts: RequestInit = {}) => {
  const res = await apiRequest(url, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fetch failed ${res.status} - ${text}`);
  }
  return await res.json();
};
