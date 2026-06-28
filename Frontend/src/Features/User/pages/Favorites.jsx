import UserPageLayout from "../components/userPageLayout";
import useFavorites from "../hooks/useFavorites";
import MovieCard from "../../Movies/components/Moviecard";
import SkeletonGrid from "../../Movies/components/MovieSkeleton";
import { Link, useNavigate } from "react-router-dom";
import "../styles/userPages.scss";

const FavoritesPage = () => {
  const { user, handleFavorite, userLoading } = useFavorites();
  const navigate = useNavigate();

  // null  = auth hasn't resolved yet → show skeleton
  // object = auth done, even if favorites is empty → show grid/empty
  const loading = user === null;
  const favorites = user?.favorites || [];

  const toCardShape = (fav) => ({
    id: fav.movieId,
    original_title: fav.title,
    name: fav.title,
    poster_path: fav.posterPath || null,
    vote_average: fav.rating || 0,
    media_type: fav.mediaType || "movie",
    release_date: fav.mediaType !== "tv" ? `${fav.year}-01-01` : null,
    first_air_date: fav.mediaType === "tv" ? `${fav.year}-01-01` : null,
  });

  return (
    <UserPageLayout>
      <div className="user-page">
        <div className="user-page__header">
          <div className="user-page__header-left">
            <p className="user-page__eyebrow">◈ Your Collection</p>
            <h1 className="user-page__title">FAVORITES</h1>
            {!loading && (
              <span className="user-page__count">
                {favorites.length} {favorites.length === 1 ? "title" : "titles"}
              </span>
            )}
          </div>
        </div>

        {loading && (
          <div className="user-page__skeleton-grid">
            <SkeletonGrid count={12} />
          </div>
        )}

        {!loading && favorites.length === 0 && (
          <div className="user-page__empty">
            <div className="user-page__empty-icon">♡</div>
            <h3>NO FAVORITES YET</h3>
            <p>Save movies and shows you love to find them here.</p>
            <Link to="/browse">Browse titles →</Link>
          </div>
        )}

        {userLoading && (
          <div className="user-page__mutation-loader">Updating...</div>
        )}

        {!loading && favorites.length > 0 && (
          <div className="user-page__grid">
            {favorites
              .filter((fav) => fav?.movieId)
              .map((fav) => (
                <MovieCard
                  key={fav.movieId}
                  features={toCardShape(fav)}
                  onRemove={() =>
                    handleFavorite({
                      id: fav.movieId,
                      title: fav.title,
                      poster_path: fav.posterPath,
                      media_type: fav.mediaType || "movie",
                      release_date: fav.year ? `${fav.year}-01-01` : "",
                      vote_average: fav.rating,
                    })
                  }
                  showRemove
                />
              ))}
          </div>
        )}

        <button
          className="user-page__back-btn"
          onClick={() => navigate("/browse")}
        >
          ← Back to Site
        </button>
      </div>
    </UserPageLayout>
  );
};

export default FavoritesPage;
