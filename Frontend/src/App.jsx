import React, { useEffect } from "react";
import AppRoutes from "./AppRoutes";
import Lenis from "lenis";
import AuthProvider from "./Features/Auth/auth.context";
import MovieProvider from "./Features/Movies/movie.context";
import UserProvider from "./Features/User/user.context";
import { ToastProvider } from "./Features/Shared/toast.context";

const App = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smooth: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

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
