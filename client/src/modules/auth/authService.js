import { loginAPI } from "@/Api/Api";

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
        // Decide storage type
        const storage = rememberMe ? localStorage : sessionStorage;
        
        // Clear the other storage to avoid token conflicts
        const otherStorage = rememberMe ? sessionStorage : localStorage;
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
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    window.location.href = "/login";
  },

  getCurrentUser: () => {
    const user = sessionStorage.getItem("user") || localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!(sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken"));
  }
};

export default AuthService;