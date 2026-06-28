import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./Features/Shared/styles/global.scss";
import "./Features/Shared/styles/Theme.scss";
import AuthProvider from "./Features/Auth/auth.context";

createRoot(document.getElementById("root")).render(<App />);
