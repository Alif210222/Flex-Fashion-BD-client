
import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

import api from "../services/api";
import { clearGuestCart } from "../utils/guestCart";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem("authUser") || "null"
      );
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => sessionStorage.getItem("accessToken") || ""
  );

  const saveSession = useCallback((accessToken, currentUser) => {
  sessionStorage.setItem("accessToken", accessToken);
  sessionStorage.setItem("authUser", JSON.stringify(currentUser));

  // Do not merge guest cart into the authenticated cart.
  clearGuestCart();

  setToken(accessToken);
  setUser(currentUser);
}, []);

  const login = useCallback(async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    const data = response.data?.data;

    if (!data?.accessToken || !data?.user) {
      throw new Error("Unexpected login response from server.");
    }

    saveSession(data.accessToken, data.user);

    return data.user;
  }, [saveSession]);

  const register = useCallback(async (details) => {
    const response = await api.post("/auth/register", details);
    const data = response.data?.data;

    if (!data?.accessToken || !data?.user) {
      throw new Error("Unexpected registration response from server.");
    }

    saveSession(data.accessToken, data.user);

    return data.user;
  }, [saveSession]);

  const logout = useCallback(() => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("authUser");

    setToken("");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        saveSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
