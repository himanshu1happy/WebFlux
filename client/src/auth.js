import API_URL from "./api";

// ======================================================
// GET TOKEN
// ======================================================

export const getToken = () => {
  return localStorage.getItem("token");
};

// ======================================================
// GET CURRENT USER
// ======================================================

export const getUser = () => {
  try {
    const user = localStorage.getItem("user");

    if (!user) {
      return null;
    }

    return JSON.parse(user);
  } catch (error) {
    console.error("Unable to read user:", error);
    return null;
  }
};

// ======================================================
// CHECK TOKEN EXPIRY
// ======================================================

const tokenExpiry = (token) => {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return 0;
    }

    const normalized = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    return (
      JSON.parse(atob(normalized)).exp * 1000
    );
  } catch (error) {
    return 0;
  }
};

// ======================================================
// CHECK LOGIN
// ======================================================

export const isLoggedIn = () => {
  const token = getToken();

  if (!token) {
    return false;
  }

  const expiry = tokenExpiry(token);

  if (!expiry) {
    return false;
  }

  return expiry > Date.now();
};

// ======================================================
// LOGOUT
// ======================================================

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// ======================================================
// AUTHENTICATED FETCH
// ======================================================

export async function authFetch(
  path,
  options = {}
) {
  const token = getToken();

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,

      headers: {
        "Content-Type": "application/json",

        ...(options.headers || {}),

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
    }
  );

  // ------------------------------------------
  // Unauthorized
  // ------------------------------------------

  if (response.status === 401) {
    logout();

    window.location.href = "/login";

    throw new Error(
      "Session expired. Please log in again."
    );
  }

  // ------------------------------------------
  // Parse response
  // ------------------------------------------

  const data = await response
    .json()
    .catch(() => ({}));

  // ------------------------------------------
  // API error
  // ------------------------------------------

  if (!response.ok) {
    throw new Error(
      data.message ||
        `Request failed (${response.status})`
    );
  }

  return data;
}

// ======================================================
// FORMAT DATE
// ======================================================

export const formatDate = (date) => {
  if (!date) {
    return "Not available";
  }

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};