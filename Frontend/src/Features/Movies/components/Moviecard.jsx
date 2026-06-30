import { useNavigate } from "react-router-dom";
import "../styles/moviecard.scss";
import useMovies from "../hooks/useMovies";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";

const MovieCard = ({ features }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => {
        navigate(`/${features.first_air_date ? "tv" : "movie"}/${features.id}`);
      }}
      id={features.id}
      className="movie-card"
    >
      <div className="movie-card__poster">
        <img
          src={`${IMG_BASE}/${features.poster_path}`}
          alt={features.original_title}
          loading="lazy"
        />

        <div className="movie-card__overlay">
          <button className="movie-card__play">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>

        <span className="movie-card__type">
          {(features.media_type ||
            (features.first_air_date ? "tv" : "movie")) === "tv"
            ? "TV"
            : "FILM"}
        </span>

        <span
          className="movie-card__rating"
          style={{
            "--rc":
              (features.vote_average ?? 0) < 6
                ? "#f58f00"
                : (features.vote_average ?? 0) < 8
                  ? "#00bff3"
                  : "#e8ff00",
          }}
        >
          ★ {(features.vote_average ?? 0).toFixed(1)}
        </span>
      </div>

      <h3 className="movie-card__title">
        {features.original_title || features.name}
      </h3>

      <span className="movie-card__year">
        {(features.release_date || features.first_air_date)?.split("-")[0]}
      </span>
    </div>
  );
};

export default MovieCard;
