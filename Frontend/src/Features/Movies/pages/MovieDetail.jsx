import { useEffect, useState } from "react";
import Navbar from "../../Shared/components/Navbar";
import "../styles/moviedetail.scss";
import { useNavigate, useParams } from "react-router-dom";
import useMovies from "../hooks/useMovies";
import MovieDetailSkeleton from "../components/MovieDetailSkeleton";
import useFavorites from "../../User/hooks/useFavorites";
import useWatchlist from "../../User/hooks/useWatchList";
import useHistory from "../../User/hooks/useHistory";
import ToggleButton from "../../Shared/components/ToggleButton";

const IMG_BASE_BACKDROP = "https://image.tmdb.org/t/p/original";
const IMG_BASE_POSTER = "https://image.tmdb.org/t/p/w500";
const IMG_BASE_FACE = "https://image.tmdb.org/t/p/w185";
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const MovieDetail = () => {
  const {
    movieDetail,
    handleMovieDetail,
    handleMovieTrailer,
    handleActorsOfMovie,
    handleSimilarMovies,
    selectedType,
  } = useMovies();

  const { handleFavorite, user } = useFavorites();
  const { handleWatchlist, isInWatchlist } = useWatchlist();
  const { handleHistory } = useHistory();

  const [actors, setActors] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [watchModalOpen, setWatchModalOpen] = useState(false);
  const [trailer, setTrailer] = useState(null);
  const [activeSource, setActiveSource] = useState(null);

  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  const { movieId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (movieId) {
      window.scrollTo(0, 0);
      handleMovieDetail(movieId);
      handleMovieTrailer(movieId).then(setTrailer);
      handleActorsOfMovie(movieId).then((res) => setActors(res?.cast || []));
      handleSimilarMovies(movieId).then((res) => setSimilarMovies(res || []));
    }
  }, [movieId, selectedType]);

  useEffect(() => {
    if (movieDetail?.id && movieDetail?.first_air_date) {
      const tvSeasons = (movieDetail.seasons || []).filter(
        (s) => s.season_number > 0,
      );
      setSeasons(tvSeasons);
      if (tvSeasons.length > 0) setSelectedSeason(tvSeasons[0].season_number);
    }
  }, [movieDetail]);

  useEffect(() => {
    if (!movieDetail?.id || !movieDetail?.first_air_date) return;
    
    const controller = new AbortController();
    setLoadingEpisodes(true);
    setSelectedEpisode(1);
    
    fetch(
      `https://api.themoviedb.org/3/tv/${movieDetail.id}/season/${selectedSeason}?api_key=${TMDB_API_KEY}`,
      { signal: controller.signal }
    )
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch episodes");
        return r.json();
      })
      .then((data) => {
        setEpisodes(data.episodes || []);
        setLoadingEpisodes(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setLoadingEpisodes(false);
        }
      });
      
    return () => controller.abort();
  }, [selectedSeason, movieDetail?.id]);

  if (!movieDetail || !movieDetail.id) return <MovieDetailSkeleton />;

  const isTV = !!movieDetail.first_air_date;
  const isFav = user?.favorites?.some(
    (f) => String(f.movieId) === String(movieDetail.id),
  );
  const inWatchlist = isInWatchlist(movieDetail.id);

  const movieShape = {
    id: movieDetail.id,
    title: movieDetail.original_title || movieDetail.name,
    poster_path: movieDetail.poster_path,
    media_type: isTV ? "tv" : "movie",
    release_date: movieDetail.release_date,
    first_air_date: movieDetail.first_air_date,
    vote_average: movieDetail.vote_average,
  };

  const handleWatchClick = () => {
    setWatchModalOpen(true);
    handleHistory(movieShape);
  };

  const SOURCES = [
    {
      id: "vidlink.pro",
      name: "Server 1",
      url: isTV
        ? `https://vidlink.pro/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidlink.pro/movie/${movieDetail.id}`,
    },
    {
      id: "autoembed.co",
      name: "Server 2",
      url: isTV
        ? `https://autoembed.co/tv/tmdb/${movieDetail.id}-${selectedSeason}-${selectedEpisode}`
        : `https://autoembed.co/movie/tmdb/${movieDetail.id}`,
    },
    {
      id: "2embed",
      name: "Server 3",
      url: isTV
        ? `https://www.2embed.cc/embedtv/${movieDetail.id}&s=${selectedSeason}&e=${selectedEpisode}`
        : `https://www.2embed.cc/embed/${movieDetail.id}`,
    },
    {
      id: "vidsrc.to",
      name: "Server 4",
      url: isTV
        ? `https://vidsrc.to/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.to/embed/movie/${movieDetail.id}`,
    },
    {
      id: "vidsrc.me",
      name: "Server 5",
      url: isTV
        ? `https://vidsrc.me/embed/tv?tmdb=${movieDetail.id}&season=${selectedSeason}&episode=${selectedEpisode}`
        : `https://vidsrc.me/embed/movie/${movieDetail.id}`,
    },
    {
      id: "smashystream",
      name: "Server 6",
      url: isTV
        ? `https://embed.smashystream.com/playere.php?tmdb=${movieDetail.id}&season=${selectedSeason}&episode=${selectedEpisode}`
        : `https://embed.smashystream.com/playere.php?tmdb=${movieDetail.id}`,
    },
    {
      id: "multiembed",
      name: "Server 7",
      url: isTV
        ? `https://multiembed.mov/?video_id=${movieDetail.id}&tmdb=1&s=${selectedSeason}&e=${selectedEpisode}`
        : `https://multiembed.mov/?video_id=${movieDetail.id}&tmdb=1`,
    },
    {
      id: "vidsrc.cc",
      name: "Server 8",
      url: isTV
        ? `https://vidsrc.cc/v2/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.cc/v2/embed/movie/${movieDetail.id}`,
    },
    {
      id: "videasy",
      name: "Server 9",
      url: isTV
        ? `https://player.videasy.net/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://player.videasy.net/movie/${movieDetail.id}`,
    },
    {
      id: "moviesapi",
      name: "Server 10",
      url: isTV
        ? `https://moviesapi.club/tv/${movieDetail.id}-${selectedSeason}-${selectedEpisode}`
        : `https://moviesapi.club/movie/${movieDetail.id}`,
    },
  ];

  const currentSource = activeSource
    ? SOURCES.find((s) => s.id === activeSource.id) || SOURCES[0]
    : SOURCES[0];
  const currentEpisodeData = episodes.find(
    (ep) => ep.episode_number === selectedEpisode,
  );

  return (
    <div className="detail">
      <Navbar />

      <section className="detail__hero">
        {watchModalOpen && (
          <div className="video-player">
            <div onClick={() => setWatchModalOpen(false)} className="close">
              <div className="first-cross" />
              <div className="second-cross" />
            </div>
            <div className="left-server-links">
              {SOURCES.map((source) => (
                <div
                  key={source.id}
                  style={{
                    backgroundColor:
                      currentSource.name === source.name ? "#e8ff00" : "",
                    color: currentSource.name === source.name ? "black" : "",
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveSource(source);
                  }}
                  className="link-tag"
                >
                  {source.name}
                  <div className="small-text">{source.id}</div>
                </div>
              ))}
            </div>
            <div className="right-player">
              {!currentSource.url ? (
                <>
                  <h3>Server not working right now</h3>
                  <h5>Change to other Server</h5>
                </>
              ) : (
                <iframe
                  allowFullScreen
                  key={`${currentSource.id}-s${selectedSeason}-e${selectedEpisode}`}
                  src={currentSource.url}
                  allow="autoplay; encrypted-media; fullscreen"
                  style={{ width: "100%", height: "100%", border: "none" }}
                />
              )}
            </div>
          </div>
        )}

        <div className="detail__hero-backdrop">
          {movieDetail.backdrop_path ? (
            <img
              fetchPriority="high"
              loading="eager"
              src={`${IMG_BASE_BACKDROP}${movieDetail.backdrop_path}`}
              alt={movieDetail.original_title || movieDetail.name}
            />
          ) : (
            <div
              style={{ width: "100%", height: "100%", background: "#111" }}
            />
          )}
        </div>
        <div className="detail__hero-gradient" />

        <div className="detail__hero-content">
          <div className="detail__hero-genres">
            {movieDetail.genres?.map((g) => (
              <span key={g.id}>{g.name}</span>
            ))}
          </div>

          <h1 className="detail__hero-title">
            {movieDetail.original_title || movieDetail.name}
          </h1>

          <div className="detail__hero-meta">
            <span className="meta-item meta-item--rating">
              ★ {movieDetail.vote_average}
            </span>
            <span className="meta-dot" />
            <span className="meta-item">
              {
                (movieDetail.release_date || movieDetail.first_air_date)?.split(
                  "-",
                )[0]
              }
            </span>
            {(movieDetail.runtime || movieDetail.episode_run_time?.[0]) && (
              <>
                <span className="meta-dot" />
                <span className="meta-item">
                  {movieDetail.runtime || movieDetail.episode_run_time?.[0]} min
                </span>
              </>
            )}
          </div>

          <p className="detail__hero-overview">{movieDetail.overview}</p>

          <div className="detail__hero-actions">
            <ToggleButton />

            <button
              className="detail__hero-play"
              onClick={() => setModalOpen(true)}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              WATCH TRAILER
            </button>

            {modalOpen && trailer && (
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 9999,
                  background: "rgba(4,4,6,0.96)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "2rem",
                }}
                onClick={() => setModalOpen(false)}
              >
                <button
                  onClick={() => setModalOpen(false)}
                  style={{
                    position: "absolute",
                    top: "1.5rem",
                    right: "1.5rem",
                    width: 42,
                    height: 42,
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "1.2rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✕
                </button>
                <div
                  style={{ width: "100%", maxWidth: 960, aspectRatio: "16/9" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <iframe
                    src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
                    title="Trailer"
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                    style={{ width: "100%", height: "100%", border: "none" }}
                  />
                </div>
              </div>
            )}

            <button className="detail__hero-watch" onClick={handleWatchClick}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
              </svg>
              WATCH NOW
            </button>

            {/* ── Favorite ── */}
            <button
              className={`detail__hero-fav${isFav ? " detail__hero-fav--active" : ""}`}
              onClick={() => handleFavorite(movieShape)}
              title={isFav ? "Remove from favorites" : "Add to favorites"}
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill={isFav ? "#e8ff00" : "none"}
                stroke={isFav ? "#e8ff00" : "currentColor"}
                strokeWidth="2"
                style={{ transition: "fill 0.2s, stroke 0.2s" }}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>

            {/* ── Watchlist — tick when added ── */}
            <button
              className={`detail__hero-fav${inWatchlist ? " detail__hero-fav--active" : ""}`}
              onClick={() => handleWatchlist(movieShape)}
            >
              {inWatchlist ? (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="#e8ff00"
                    strokeWidth="2.5"
                    style={{ transition: "stroke 0.2s" }}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  WATCHLIST
                </>
              ) : (
                <>+ WATCHLIST</>
              )}
            </button>
          </div>
        </div>
      </section>

      <div className="detail__body">
        <section className="detail__trailer-section">
          <p className="detail__trailer-section-label">◈ Trailer</p>
          <h2>WATCH THE TRAILER</h2>
          {trailer ? (
            <div className="detail__trailer-wrapper">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?mute=1`}
                title={`${movieDetail.original_title || movieDetail.name} Trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="detail__trailer-unavailable">
              Trailer unavailable.
            </div>
          )}
        </section>

        <section className="detail__download-section">
          <p className="detail__download-section-label">◈ Downloads</p>
          <h2>EXTERNAL TORRENT LINKS</h2>
          <div className="detail__download-links">
            {!isTV && (
              <a
                href={`https://yifysearch.com/search/?q=${(movieDetail.original_title || movieDetail.name).toLowerCase().replace(/\s+/g, "-")}/all/all/0/latest/0/all`}
                target="_blank"
                rel="noopener noreferrer"
                className="download-btn yts-btn"
              >
                Search on YTS
              </a>
            )}
            <a
              href={`https://1337x.st/search/${encodeURIComponent(movieDetail.original_title || movieDetail.name)}/1/`}
              target="_blank"
              rel="noopener noreferrer"
              className="download-btn x1337-btn"
            >
              Search on 1337x
            </a>
            <a
              href={`https://thepiratebay.org/search.php?q=${encodeURIComponent(movieDetail.original_title || movieDetail.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="download-btn tpb-btn"
            >
              Search on The Pirate Bay
            </a>
            <a
              href={`https://nyaa.si/?f=0&c=0_0&q=${encodeURIComponent(movieDetail.original_title || movieDetail.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="download-btn nyaa-btn"
            >
              Search on Nyaa (Anime)
            </a>
            <a
              href={`https://tgx.rs/torrents.php?search=${encodeURIComponent(movieDetail.original_title || movieDetail.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="download-btn tgx-btn"
            >
              Search on TorrentGalaxy
            </a>
            {isTV && (
              <a
                href={`https://eztvx.to/search/${encodeURIComponent(movieDetail.original_title || movieDetail.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="download-btn eztv-btn"
              >
                Search on EZTV (TV)
              </a>
            )}
            <a
              href={`https://www.limetorrents.lol/search/all/${encodeURIComponent(movieDetail.original_title || movieDetail.name)}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="download-btn lime-btn"
            >
              Search on LimeTorrents
            </a>
          </div>
        </section>

        <section className="detail__stream-section">
          <p className="detail__stream-section-label">◈ Watch Online</p>
          <h2>FREE STREAMING SITES</h2>
          <p className="detail__stream-disclaimer">
            External sites — open in a new tab. Quality may vary.
          </p>
          <div className="detail__stream-links">
            {[
              {
                name: "LordFlix",
                tag: "HD",
                url: `https://lordflix.org/watch/movie/${movieDetail.id}`,
              },
              {
                name: "FlickyStream",
                tag: "HD",
                url: `https://flickystream.su/player/movie/${movieDetail.id}`,
              },
              {
                name: "CinemaBZ",
                tag: "HD",
                url: `https://cinema.bz/search?q=${encodeURIComponent(movieDetail.original_title || movieDetail.name)}`,
              },
              {
                name: "67Movies",
                tag: "HD",
                url: `https://67movies.nl/watch/movie/${movieDetail.id}`,
              },
              {
                name: "Flixer",
                tag: "HD",
                url: `https://flixer.su/watch/movie/${movieDetail.id}`,
              },
              {
                name: "Cinezone",
                tag: "HD",
                url: `https://www.cinezone.to/search?keyword=${encodeURIComponent(movieDetail.original_title || movieDetail.name)}`,
              },
              {
                name: "TheMoviesFlix",
                tag: "HD",
                url: `https://themoviesflix.xyz/?s=${encodeURIComponent(movieDetail.original_title || movieDetail.name)}`,
              },
              {
                name: "Cineby",
                tag: "HD",
                url: `https://cineby.at/movie/${movieDetail.id}`,
              },
              {
                name: "RiveStream",
                tag: "HD",
                url: `https://www.rivestream.app/detail?type=movie&id=${movieDetail.id}`,
              },
            ].map((site) => (
              <a
                key={site.name}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="stream-site-btn"
              >
                <span className="stream-site-btn__name">{site.name}</span>
                <span className="stream-site-btn__tag">{site.tag}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="detail__watch-section">
          <p className="detail__watch-section-label">◈ Streaming</p>
          <h2>WATCH THE {isTV ? "SERIES" : "MOVIE"}</h2>

          <div className="detail__watch-container">
            {isTV && (
              <div className="detail__episode-panel">
                <div className="detail__season-tabs">
                  {seasons.map((s) => (
                    <button
                      key={s.season_number}
                      className={`season-tab${selectedSeason === s.season_number ? " season-tab--active" : ""}`}
                      onClick={() => setSelectedSeason(s.season_number)}
                    >
                      S{s.season_number}
                    </button>
                  ))}
                </div>

                {seasons.find((s) => s.season_number === selectedSeason) && (
                  <div className="detail__season-meta">
                    <span className="season-name">
                      {
                        seasons.find((s) => s.season_number === selectedSeason)
                          ?.name
                      }
                    </span>
                    <span className="season-ep-count">
                      {episodes.length} episodes
                    </span>
                  </div>
                )}

                <div className="detail__episode-list">
                  {loadingEpisodes ? (
                    <div className="episode-loading">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="episode-skeleton" />
                      ))}
                    </div>
                  ) : (
                    episodes.map((ep) => (
                      <div
                        key={ep.episode_number}
                        className={`episode-item${selectedEpisode === ep.episode_number ? " episode-item--active" : ""}`}
                        onClick={() => {
                          setSelectedEpisode(ep.episode_number);
                          setActiveSource(null);
                        }}
                      >
                        <div className="episode-number">
                          {String(ep.episode_number).padStart(2, "0")}
                        </div>
                        <div className="episode-info">
                          <p className="episode-title">{ep.name}</p>
                          <p className="episode-runtime">
                            {ep.runtime
                              ? `${ep.runtime} min`
                              : ep.air_date?.split("-")[0]}
                          </p>
                        </div>
                        {ep.still_path && (
                          <img
                            loading="lazy"
                            className="episode-thumb"
                            src={`https://image.tmdb.org/t/p/w185${ep.still_path}`}
                            alt={ep.name}
                          />
                        )}
                        {selectedEpisode === ep.episode_number && (
                          <div className="episode-playing-indicator">
                            <span />
                            <span />
                            <span />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div
              className="detail__watch-player-teaser"
              onClick={handleWatchClick}
            >
              <div className="teaser-overlay">
                <div className="play-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                {isTV ? (
                  <span>
                    S{String(selectedSeason).padStart(2, "0")} · E
                    {String(selectedEpisode).padStart(2, "0")}
                    {currentEpisodeData ? ` — ${currentEpisodeData.name}` : ""}
                  </span>
                ) : (
                  <span>Click to stream Full Movie</span>
                )}
              </div>
              <img
                loading="lazy"
                src={`${IMG_BASE_BACKDROP}${movieDetail.backdrop_path}`}
                alt=""
              />
            </div>
          </div>
        </section>

        <section className="detail__cast-section">
          <h2>CAST</h2>
          <div className="detail__cast-grid">
            {actors.slice(0, 10).map((i) => (
              <div key={i.id} className="detail__cast-card">
                <img
                  loading="lazy"
                  src={
                    i.profile_path
                      ? `${IMG_BASE_FACE}${i.profile_path}`
                      : "/fallback-avatar.png"
                  }
                  alt={i.name}
                />
                <p className="detail__cast-card-name">{i.name}</p>
                <p className="detail__cast-card-character">{i.character}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="detail__similar-section">
          <h2>YOU MIGHT ALSO LIKE</h2>
          <div className="detail__similar-grid">
            {similarMovies.slice(0, 16).map((i) => (
              <div
                key={i.id}
                className="detail__similar-card"
                onClick={() =>
                  navigate(`/${i.first_air_date ? "tv" : "movie"}/${i.id}`)
                }
              >
                <img
                  loading="lazy"
                  className="detail__similar-card-img"
                  src={`${IMG_BASE_POSTER}${i.poster_path}`}
                  alt={i.title || i.name}
                />
                <p className="detail__similar-card-name">{i.title || i.name}</p>
                <p className="detail__similar-card-character">
                  {(i.release_date || i.first_air_date)?.split("-")[0]}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MovieDetail;
