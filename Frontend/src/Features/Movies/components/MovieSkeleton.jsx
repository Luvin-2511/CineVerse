import "../styles/movieskeleton.scss";

const SkeletonGrid = ({ count = 20 }) => {
  return (  
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div className="movie-skeleton" key={i}>
          <div className="movie-skeleton__poster shimmer" />
          <div className="movie-skeleton__info">
            <div className="movie-skeleton__title shimmer" />
            <div className="movie-skeleton__year shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonGrid