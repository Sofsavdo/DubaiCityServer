// API utility for handling authentication and requests
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const defaultOptions: RequestInit = {
    credentials: 'include',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      ...options.headers,
    },
    ...options,
  };

  console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);

  const response = await fetch(url, defaultOptions);
  
  console.log(`📡 API Response: ${response.status} ${response.statusText}`);

  return response;
};

export const login = async (username: string, password: string) => {
  const response = await apiRequest('/api/auth/login', {
    method: 'POST',
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

// Partner registration
export const registerPartner = async (data: any) => {
  const response = await apiRequest('/api/partner-registration-requests', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return await response.json();
};

// Get partner registration requests (admin only)
export const getPartnerRegistrationRequests = async () => {
  const response = await apiRequest('/api/partner-registration-requests');
  return await response.json();
};

// Approve partner registration (admin only)
export const approvePartnerRegistration = async (id: string) => {
  const response = await apiRequest(`/api/partner-registration-requests/${id}/approve`, {
    method: 'POST',
  });
  return await response.json();
};

// Reject partner registration (admin only)
export const rejectPartnerRegistration = async (id: string, reason: string) => {
  const response = await apiRequest(`/api/partner-registration-requests/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
  return await response.json();
};

// Get products
export const getProducts = async () => {
  const response = await apiRequest('/api/products');
  return await response.json();
};

// Create product (admin only)
export const createProduct = async (data: any) => {
  const response = await apiRequest('/api/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return await response.json();
};

// Get partners
export const getPartners = async () => {
  const response = await apiRequest('/api/partners');
  return await response.json();
};

export const getProductsByPartner = async (partnerId: string) => {
  const response = await apiRequest(`/api/products/partner/${partnerId}`);
  return await response.json();
};

// Low stock inventory (admin)
export const getLowStockInventory = async () => {
  const response = await apiRequest('/api/admin/inventory/low-stock');
  return await response.json();
};

// Update partner tier (admin)
export const updatePartnerTier = async (partnerId: string, tier: string) => {
  const response = await apiRequest(`/api/admin/partners/${partnerId}/tier`, {
    method: 'POST',
    body: JSON.stringify({ tier }),
  });
  return await response.json();
};

// Orders by partner
export const getOrdersByPartner = async (partnerId: string) => {
  const response = await apiRequest(`/api/orders/partner/${partnerId}`);
  return await response.json();
};

// Current partner profile
export const getMyPartnerProfile = async () => {
  const response = await apiRequest('/api/me/partner');
  return await response.json();
};

export const logout = async () => {
  const response = await apiRequest('/api/auth/logout', {
    method: 'POST',
  });
  
  return response.ok;
};

// Partner activation (legal info)
export const postPartnerActivationRequest = async (data: any) => {
  const response = await apiRequest('/api/partner-activation-requests', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return await response.json();
};

export const getPartnerActivationRequestsAdmin = async (partnerId: string) => {
  const response = await apiRequest(`/api/admin/partner-activation-requests/${partnerId}`);
  return await response.json();
};

export const getAllPartnerActivationRequestsAdmin = async () => {
  const response = await apiRequest(`/api/admin/partner-activation-requests`);
  return await response.json();
};

export const approvePartnerActivation = async (id: string) => {
  const response = await apiRequest(`/api/admin/partner-activation-requests/${id}/approve`, {
    method: 'POST',
  });
  return await response.json();
};

export const rejectPartnerActivation = async (id: string, reason: string) => {
  const response = await apiRequest(`/api/admin/partner-activation-requests/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
  return await response.json();
};

// Product fulfillment requests
export const postProductFulfillmentRequest = async (data: any) => {
  const response = await apiRequest('/api/product-fulfillment-requests', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return await response.json();
};

export const getProductFulfillmentRequestsAdmin = async () => {
  const response = await apiRequest('/api/admin/product-fulfillment-requests');
  return await response.json();
};

export const approveProductFulfillmentRequest = async (id: string) => {
  const response = await apiRequest(`/api/admin/product-fulfillment-requests/${id}/approve`, {
    method: 'POST',
  });
  return await response.json();
};

export const rejectProductFulfillmentRequest = async (id: string, reason: string) => {
  const response = await apiRequest(`/api/admin/product-fulfillment-requests/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
  return await response.json();
};