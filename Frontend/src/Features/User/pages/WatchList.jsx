import UserPageLayout from "../components/userPageLayout";
import useWatchlist from "../hooks/useWatchList";
import MovieCard from "../../Movies/components/Moviecard";
import SkeletonGrid from "../../Movies/components/MovieSkeleton"; 
import { Link, useNavigate } from "react-router-dom";
import "../styles/userPages.scss";

const WatchlistPage = () => {
  const { user, watchlist, handleWatchlist } = useWatchlist();
  const navigate = useNavigate();

  const loading = user === null; 

  const toCardShape = (w) => ({
    id:             w.movieId,
    original_title: w.title,
    name:           w.title,
    poster_path:    w.posterPath    || null,
    vote_average:   w.rating        || 0,
    media_type:     w.mediaType     || "movie",
    release_date:   w.mediaType !== "tv" ? `${w.year}-01-01` : null,
    first_air_date: w.mediaType === "tv"  ? `${w.year}-01-01` : null,
  });

  return (
    <UserPageLayout>
      <div className="user-page">

        <div className="user-page__header">
          <div className="user-page__header-left">
            <p className="user-page__eyebrow">◈ Your Next Watch</p>
            <h1 className="user-page__title">WATCHLIST</h1>
            {!loading && (
              <span className="user-page__count">
                {watchlist.length} {watchlist.length === 1 ? "title" : "titles"}
              </span>
            )}
          </div>
        </div>

        {loading && (
          <div className="user-page__skeleton-grid">
            <SkeletonGrid count={12} />
          </div>
        )}

        {!loading && watchlist.length === 0 && (
          <div className="user-page__empty">
            <div className="user-page__empty-icon">📌</div>
            <h3>NO WATCHLIST YET</h3>
            <p>Save movies and shows you want to watch later.</p>
            <Link to="/browse">Browse titles →</Link>
          </div>
        )}

        {!loading && watchlist.length > 0 && (
          <div className="user-page__grid">
            {watchlist
              .filter((w) => w?.movieId)
              .map((w) => (
                <MovieCard
                  key={w.movieId}
                  features={toCardShape(w)} 
                  onRemove={() => handleWatchlist({
                    id:           w.movieId,
                    title:        w.title,
                    poster_path:  w.posterPath,
                    media_type:   w.mediaType  || "movie",
                    release_date: w.year ? `${w.year}-01-01` : "",
                    vote_average: w.rating,
                  })}
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

export default WatchlistPage;