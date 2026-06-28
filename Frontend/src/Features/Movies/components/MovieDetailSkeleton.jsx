import "../styles/moviedetailskeleton.scss";

const MovieDetailSkeleton = () => {
  return (
    <div className="detail-skeleton">
      {/* Hero */}
      <section className="detail-skeleton__hero">
        {/* Backdrop */}
        <div className="detail-skeleton__backdrop shimmer" />
        <div className="detail-skeleton__hero-gradient" />

        <div className="detail-skeleton__hero-content">
          {/* Genres */}
          <div className="detail-skeleton__genres">
            <span className="detail-skeleton__genre-tag shimmer" />
            <span className="detail-skeleton__genre-tag shimmer" />
            <span className="detail-skeleton__genre-tag shimmer" style={{ width: "70px" }} />
          </div>

          {/* Title */}
          <div className="detail-skeleton__title shimmer" />
          <div className="detail-skeleton__title detail-skeleton__title--short shimmer" />

          {/* Meta */}
          <div className="detail-skeleton__meta">
            <span className="detail-skeleton__meta-item shimmer" />
            <span className="detail-skeleton__meta-item shimmer" style={{ width: "50px" }} />
            <span className="detail-skeleton__meta-item shimmer" style={{ width: "60px" }} />
          </div>

          {/* Overview */}
          <div className="detail-skeleton__overview">
            <div className="detail-skeleton__overview-line shimmer" />
            <div className="detail-skeleton__overview-line shimmer" />
            <div className="detail-skeleton__overview-line detail-skeleton__overview-line--short shimmer" />
          </div>

          {/* Actions */}
          <div className="detail-skeleton__actions">
            <div className="detail-skeleton__btn shimmer" />
            <div className="detail-skeleton__btn shimmer" />
            <div className="detail-skeleton__btn detail-skeleton__btn--icon shimmer" />
            <div className="detail-skeleton__btn detail-skeleton__btn--watchlist shimmer" />
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="detail-skeleton__body">
        {/* Trailer Section */}
        <section className="detail-skeleton__section">
          <div className="detail-skeleton__section-eyebrow shimmer" />
          <div className="detail-skeleton__section-heading shimmer" />
          <div className="detail-skeleton__iframe shimmer" />
        </section>

        {/* Watch Section */}
        <section className="detail-skeleton__section">
          <div className="detail-skeleton__section-eyebrow shimmer" />
          <div className="detail-skeleton__section-heading shimmer" />
          <div className="detail-skeleton__watch-teaser shimmer" />
        </section>

        {/* Cast Section */}
        <section className="detail-skeleton__section">
          <div className="detail-skeleton__section-heading shimmer" />
          <div className="detail-skeleton__cast-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="detail-skeleton__cast-card">
                <div className="detail-skeleton__cast-img shimmer" />
                <div className="detail-skeleton__cast-name shimmer" />
                <div className="detail-skeleton__cast-role shimmer" />
              </div>
            ))}
          </div>
        </section>

        {/* Similar Section */}
        <section className="detail-skeleton__section">
          <div className="detail-skeleton__section-heading shimmer" />
          <div className="detail-skeleton__similar-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="detail-skeleton__similar-card shimmer" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MovieDetailSkeleton;