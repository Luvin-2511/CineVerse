import React, { createContext, useState, useEffect } from "react";
import { GetMe } from "./services/Auth.api";
export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const updateUser = (data) => setUser(data);

  // Restore session from cookie on every page load/refresh
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await GetMe();
        if (response?.user) {
          setUser(response.user);
        }
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };
    restoreSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{ authLoading, setAuthLoading, user, setUser, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
