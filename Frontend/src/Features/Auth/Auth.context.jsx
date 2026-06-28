import React, { createContext, useState } from "react";
export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const updateUser = (data) => setUser(data);

  return (
    <AuthContext.Provider
      value={{ authLoading, setAuthLoading, user, setUser, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
