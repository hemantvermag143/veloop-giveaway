const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({
    success: false,
    code: "INVALID_RESPONSE",
    message: "Invalid server response.",
  }));

  if (!response.ok) {
    const error = new Error(data.message || "Request failed.");
    error.code = data.code;
    error.status = response.status;
    throw error;
  }

  return data;
}

export function getGiveaways() {
  return request("/giveaways");
}

export function getCurrentGiveaway() {
  return request("/giveaways/current");
}

export function getGiveawayBySlug(slug) {
  return request(`/giveaways/slug/${slug}`);
}

export function getGiveaway(giveawayId) {
  return request(`/giveaways/${giveawayId}`);
}

export function getGiveawayLeaderboard(giveawayId) {
  return request(`/giveaways/${giveawayId}/leaderboard`);
}

export function getPreviousGiveaways() {
  return request("/giveaways/previous");
}

export function getPreviousWinners() {
  return request("/giveaways/previous/winners");
}

export function getMyParticipation(giveawayId, token) {
  return request(`/giveaways/${giveawayId}/my-status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function joinGiveaway(giveawayId, token) {
  return request(`/giveaways/${giveawayId}/join`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ giveawayId }),
  });
}

export function getWinners(giveawayId) {
  return request(`/giveaways/${giveawayId}/winners`);
}

export function getMyWinnerStatus(giveawayId, token) {
  return request(`/giveaways/${giveawayId}/my-winner-status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getMyClaim(giveawayId, token) {
  return request(`/giveaways/${giveawayId}/my-claim`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function submitClaim(giveawayId, details, token) {
  return request(`/giveaways/${giveawayId}/claim`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(details),
  });
}

export function getMe(token) {
  return request("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function login(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(name, email, password) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export function getAdminClaims(token) {
  return request("/admin/claims", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function processAdminClaim(claimId, token) {
  return request(`/admin/claims/${claimId}/process`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function completeAdminClaim(claimId, token) {
  return request(`/admin/claims/${claimId}/complete`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getMyTransactions(token) {
  const response = await fetch(`${API_BASE_URL}/giveaways/my-transactions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await response.json();

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Unable to load transaction history.");
  }

  return payload;
}
