import React from "react";
import AppRoutes from "./AppRoutes";
import AuthProvider from "./Features/Auth/Auth.context";
import MovieProvider from "./Features/Movies/Movie.context";
import UserProvider from "./Features/User/user.context";
import { ToastProvider } from "./Features/Shared/toast.context";

const App = () => {

  return (
    <AuthProvider>
      <ToastProvider>
        <MovieProvider>
          <UserProvider>
            <AppRoutes />
          </UserProvider>
        </MovieProvider>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
