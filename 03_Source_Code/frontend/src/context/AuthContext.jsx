import React, { createContext, useState, useContext, useEffect } from "react";
import { apiJson } from "../lib/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user session exists in localStorage
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);

    // Automatically log out when API returns 401
    const handleUnauthorized = () => {
      console.warn("Session expired or unauthorized. Logging out...");
      logout();
    };

    window.addEventListener("auth-unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth-unauthorized", handleUnauthorized);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const params = new URLSearchParams();
      params.append("username", email.trim());
      params.append("password", password);
      const tokenRes = await apiJson("/auth/login", {
        method: "POST",
        body: params,
      });

      if (!tokenRes.ok || !tokenRes.data) return false;

      const tokenData = tokenRes.data;
      const token = tokenData.access_token;
      setToken(token);
      localStorage.setItem("token", token);

      // Fetch user profile info
      const meResponse = await apiJson("/users/me", { token });

      if (!meResponse.ok || !meResponse.data) {
        logout();
        return false;
      }

      const dbUser = meResponse.data;

      // Map backend role enum to frontend roles:
      // Backend: 'admin', 'civitas', 'umum'
      // Frontend expects: 'Admin', 'Student'
      const mappedRole = dbUser.role === "admin" ? "Admin" : "Student";

      const userData = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.fullname,
        role: mappedRole,
        nim: dbUser.identity_number,
        department:
          dbUser.role === "admin"
            ? "Direktorat Sistem Informasi"
            : "Ilmu Komputer",
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const signUp = async (
    name,
    email,
    password,
    phoneNumber,
    identityNumber = null,
    identityDocumentFile = null,
  ) => {
    try {
      const formData = new FormData();
      formData.append("fullname", name);
      formData.append("email", email.trim());
      formData.append("password", password);
      formData.append("phone_number", phoneNumber.trim());
      if (identityNumber) formData.append("identity_number", identityNumber);
      if (identityDocumentFile) formData.append("identity_document", identityDocumentFile);

      const res = await apiJson("/auth/users/", { method: "POST", body: formData });

      if (!res.ok) {
        // Extract error message from backend response
        let errorMsg = "Registration failed. Please try again.";
        if (Array.isArray(res.data?.detail)) {
          errorMsg = res.data.detail.map(err => `${err.msg}`).join(', ');
        } else if (typeof res.data?.detail === 'string') {
          errorMsg = res.data.detail;
        } else if (res.data?.message) {
          errorMsg = res.data.message;
        }
        return { success: false, error: errorMsg };
      }

      // Automatically log the user in after successful sign up
      const loginSuccess = await login(email, password);
      if (loginSuccess) {
        return { success: true, error: null };
      } else {
        return {
          success: false,
          error: "Registration successful but login failed. Please try again.",
        };
      }
    } catch (error) {
      console.error("SignUp error:", error);
      return {
        success: false,
        error:
          error.message || "An unexpected error occurred. Please try again.",
      };
    }
  };

  // Backward compatible stub
  const switchRole = () => {};

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, signUp, switchRole, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
