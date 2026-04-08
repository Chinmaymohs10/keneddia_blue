import { loginAPI } from "@/Api/Api";

const isBrowser = typeof window !== "undefined";

const getStorage = (type) => {
  if (!isBrowser) return null;
  return type === "local" ? window.localStorage : window.sessionStorage;
};

const getStoredItem = (key) => {
  const sessionValue = getStorage("session")?.getItem(key);
  if (sessionValue) return sessionValue;

  return getStorage("local")?.getItem(key) || null;
};

const clearAuthStorage = () => {
  getStorage("local")?.removeItem("accessToken");
  getStorage("local")?.removeItem("user");
  getStorage("session")?.removeItem("accessToken");
  getStorage("session")?.removeItem("user");
};

const AuthService = {
  /**
   * @param {Object} credentials - { username, password }
   * @param {boolean} rememberMe - If true, uses localStorage, else sessionStorage
   */
  login: async (credentials, rememberMe = false) => {
    try {
      const response = await loginAPI(credentials);
      const { token, user } = response.data;

      if (token) {
        if (!isBrowser) {
          return { success: false, message: "Authentication is only available in the browser" };
        }

        // Decide storage type
        const storage = rememberMe ? getStorage("local") : getStorage("session");

        // Clear the other storage to avoid token conflicts
        const otherStorage = rememberMe ? getStorage("session") : getStorage("local");
        otherStorage.removeItem("accessToken");
        otherStorage.removeItem("user");

        // Save to selected storage
        storage.setItem("accessToken", token);
        storage.setItem("user", JSON.stringify(user));

        return { success: true, user };
      }
      return { success: false, message: "Invalid credentials" };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Connection error"
      };
    }
  },

  logout: () => {
    // Clear both to be safe
    clearAuthStorage();

    if (isBrowser) {
      window.location.href = "/login";
    }
  },

  getCurrentUser: () => {
    const user = getStoredItem("user");

    if (!user) return null;

    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    return !!getStoredItem("accessToken");
  },
};

export default AuthService;
