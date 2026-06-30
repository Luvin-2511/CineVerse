import MovieCard from "../components/Moviecard";
import Navbar from "../../Shared/components/Navbar";
import "../styles/browse.scss";
import useMovies from "../hooks/useMovies";
import { useEffect, useRef, useState } from "react";
import MovieSkeleton from "../components/MovieSkeleton";
import LineLoader from "../../Shared/components/LineLoader";


const Browse = () => {
  const {
    movies,
    setPage,
    category,
    setCategory,
    genre,
    selectedGenre,
    setselectedGenre,
    loading,
    handleParticularGenre,
    handleSearch,
    fetchMovies,
    selectedType,
    setSelectedType,
  } = useMovies();
  const sentinalRef = useRef(null);
  const isMounted = useRef(false);
  
  const CATEGORIES = [
    { key: "trending", label: "Trending" },
    { key: "popular", label: "Popular" },
    {
      key: selectedType === "tv" ? "on_the_air" : "now_playing",
      label: selectedType === "tv" ? "On The Air" : "Now Playing",
    },
    { key: "top_rated", label: "Top Rated" },
  ];
  const [search, setSearch] = useState("");
  
  useEffect(() => {
    // Skip the very first render — useMovies already fetches on mount
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (!search.trim()) {
      // User cleared the box — restore the active category
      fetchMovies(category, 1);
      return;
    }
    const handleTimeout = setTimeout(() => {
      handleSearch(search);
    }, 500);
    return () => {
      clearTimeout(handleTimeout);
    };
  }, [search]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 },
    );

    if (sentinalRef.current) observer.observe(sentinalRef.current);
    return () => observer.disconnect();
  }, [category, loading]);

  const isFirstLoad = loading && movies.length === 0;
  const isPaginating = loading && movies.length > 0;

  return (
    <div className="browse">
      <Navbar />

      {/* Header */}
      <div className="browse__header">
        <p className="browse__header-eyebrow">◈ Explore</p>
        <h1 className="browse__header-title">
          {category.split("_").join(" ")}
        </h1>
      </div>

      {/* Controls */}
      <div className="browse__controls">
        <div className="browse__tabs">
          {CATEGORIES.map((cat) => (
            <button
              onClick={() => {
                setselectedGenre(null);
                setCategory(cat.key);
                setPage(1);
              }}
              key={cat.key}
              style={{
                backgroundColor: `${category == cat.key ? "#e8ff00" : ""}`,
                color: `${category == cat.key ? "black" : ""}`,
              }}
              className="browse__tab"
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="browse__search">
          <svg
            className="browse__search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            value={search}
            onInput={(e) => {
              setSearch(e.target.value);
            }}
            type="text"
            placeholder="Search movies, shows..."
          />
        </div>

        <div className="switch-movie-tv">
          <select value={selectedType} onChange={(e)=>{
            setSelectedType(e.target.value)
          }} name="selection" id="selection">
            <option value="movie">Movie</option>
            <option value="tv">TV</option>
          </select>
        </div>

        <div className="browse__genre">
          {genre != null &&
            genre.map((g) => (
              <button
                onClick={() => {
                  handleParticularGenre(g.id);
                  setselectedGenre(g);
                }}
                style={{
                  backgroundColor: `${selectedGenre?.name == g.name ? "#e8ff00" : ""}`,
                  color: `${selectedGenre?.name == g.name ? "black" : ""}`,
                }}
                key={g.id}
                className="browse__genre-btn"
              >
                {g.name}
              </button>
            ))}
        </div>
      </div>

      {/* Grid */}
      <div className="browse__grid">
        {!loading && movies.length === 0 ? (
          <div className="browse__empty">
            <div className="empty-icon">🎬</div>
            <h3>NOTHING FOUND</h3>
            <p>Try a different search or category.</p>
          </div>
        ) : isFirstLoad ? (
          <MovieSkeleton count={20} />
        ) : (
          <>
            {movies.map((movie) => (
              <MovieCard key={movie.id} features={movie} />
            ))}
            {isPaginating && <MovieSkeleton count={10} />}
          </>
        )}
      </div>

      <div ref={sentinalRef} className="sentinal-page"></div>
    </div>
  );
};

export default Browse;
