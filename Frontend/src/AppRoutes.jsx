import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Public from "./Features/Shared/components/Public";
import Protected from "./Features/Shared/components/Protected";
import Loader from "./Features/Shared/components/Loader";
import PageLoader from "./Features/Shared/components/PageLoader";

const Login = lazy(() => import("./Features/Auth/pages/Login"));
const Register = lazy(() => import("./Features/Auth/pages/Register"));
const Home = lazy(() => import("./Features/Auth/pages/Home"));
const Browse = lazy(() => import("./Features/Movies/pages/Browse"));
const MovieDetail = lazy(() => import("./Features/Movies/pages/MovieDetail"));
const FavoritesPage = lazy(() => import("./Features/User/pages/Favorites"));
const HistoryPage = lazy(() => import("./Features/User/pages/History"));
const WatchlistPage = lazy(() => import("./Features/User/pages/WatchList"));

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <PageLoader>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route
              path="/"
              element={
                <Public>
                  <Home />
                </Public>
              }
            />
            <Route
              path="/login"
              element={
                <Public>
                  <Login />
                </Public>
              }
            />
            <Route
              path="/register"
              element={
                <Public>
                  <Register />
                </Public>
              }
            />
            <Route
              path="/browse"
              element={
                <Protected>
                  <Browse />
                </Protected>
              }
            />
            <Route
              path="/movie/:movieId"
              element={
                <Protected>
                  <MovieDetail />
                </Protected>
              }
            />
            <Route
              path="/tv/:movieId"
              element={
                <Protected>
                  <MovieDetail />
                </Protected>
              }
            />
            <Route
              path="/favorites/"
              element={
                <Protected>
                  <FavoritesPage />
                </Protected>
              }
            />
            <Route
              path="/history/"
              element={
                <Protected>
                  <HistoryPage />
                </Protected>
              }
            />
            <Route
              path="/watchlist/"
              element={
                <Protected>
                  <WatchlistPage />
                </Protected>
              }
            />
          </Routes>
        </Suspense>
      </PageLoader>
    </BrowserRouter>
  );
};

export default AppRoutes;
