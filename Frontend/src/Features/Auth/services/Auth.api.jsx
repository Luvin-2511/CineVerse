import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.BACKEND_URI || "http://localhost:3000/",
  withCredentials: true,
});

export const Login = async (email, password) => {
  try {
    const response = await api.post("/api/auth/login", {
      email: email,
      password: password,
    });
    return response.data;
  } catch (err) {
    console.log(err);
  }
};

export const Register = async (name, email, password) => {
  try {
    const response = await api.post("/api/auth/register", {
      name: name,
      email: email,
      password: password,
    });
    return response.data;
  } catch (err) {
    console.log(err);
  }
};

export const Logout = async () => {
  try {
    const response = await api.post("/api/auth/logout");
    return response.data;
  } catch (err) {
    console.log(err);
  }
};

export const GetMe = async () => {
  try {
    const response = await api.get("api/auth/get-me");
    return response.data;
  } catch (err) {
    console.log(err);
  }
};
