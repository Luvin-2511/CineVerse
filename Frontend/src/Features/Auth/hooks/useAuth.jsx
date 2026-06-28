import React, { useContext } from "react";
import { AuthContext } from "../auth.context";
import { GetMe, Login, Logout, Register } from "../services/Auth.api";
import { useToast } from "../../Shared/toast.context";

const useAuth = () => {
  const { authLoading, user, setAuthLoading, setUser, updateUser } =
    useContext(AuthContext);
  const { showToast } = useToast();

  const handleLogin = async (email, password) => {
    setAuthLoading(true);
    try {
      const response = await Login(email, password);
      setUser(response.user);
      return response.success;
    } catch (err) {
      showToast(err?.response?.data?.message || "Login failed. Please try again.", "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (name, email, password) => {
    setAuthLoading(true);
    try {
      const response = await Register(name, email, password);
      setUser(response.user);
      return response.success;
    } catch (err) {
      showToast(err?.response?.data?.message || "Registration failed. Please try again.", "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGetMe = async () => {
    setAuthLoading(true);
    try {
      const response = await GetMe();
      setUser(response.user);
    } catch (err) {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setAuthLoading(true);
    try {
      await Logout();
      setUser(null);
    } catch (err) {
      showToast("Logout failed. Please try again.", "error");
    } finally {
      setAuthLoading(false);
    }
  };

  return {
    authLoading,
    setAuthLoading,
    user,
    setUser,
    updateUser,
    handleLogin,
    handleRegister,
    handleLogout,
    handleGetMe,
  };
};

export default useAuth;
