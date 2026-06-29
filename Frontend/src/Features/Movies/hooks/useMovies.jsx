import React, { useContext, useEffect } from "react";
import { MovieContext } from "../Movie.context";
import {
  getGenreList,
  getMovieDetail,
  getNowPlaying,
  getParticularGenre,
  getPopular,
  getTopRated,
  getTrending,
  getMovieTrailer,
  searchMovie,
  getActorsOfMovie,
  getSimilarMovies,
} from "../services/Movie.api";
import { useToast } from "../../Shared/toast.context";

const useMovies = () => {
  const {
    loading,
    setLoading,
    movies,
    setMovies,
    category,
    setCategory,
    page,
    setPage,
    hasMore,
    sethasMore,
    genre,
    setGenre,
    selectedGenre,
    setselectedGenre,
    movieDetail,
    setmovieDetail,
    selectedType,
    setSelectedType,
  } = useContext(MovieContext);
  const { showToast } = useToast();

  useEffect(() => {
    setPage(1);
    setMovies([]);
    fetchMovies(category, 1);
  }, [category, selectedType]);

  useEffect(() => {
    if (page === 1) return;
    fetchMovies(category, page);
  }, [page, selectedType]);

  useEffect(() => {
    handleGenre();
  }, []);

  const fetchMovies = async (cat = category, pg = page) => {
    setLoading(true);
    try {
      let data;
      if (cat === "trending")
        data = await getTrending(selectedType, "week", pg);
      if (cat === "popular") data = await getPopular(selectedType, pg);
      if (cat === "top_rated") data = await getTopRated(pg, selectedType);
      if (cat === "now_playing") {
        if (selectedType === "movie") {
          data = await getNowPlaying(pg, "movie");
        } else {
          return;
        }
      }
      if (!data || !data.results) return;

      setMovies((prev) =>
        pg === 1 ? data.results : [...prev, ...data.results],
      );
      if (pg >= data.total_pages) {
        sethasMore(false);
      }
    } catch (err) {
      showToast("Failed to load movies. Check your connection.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGenre = async () => {
    try {
      const response = await getGenreList();
      setGenre(response.genres);
    } catch (err) {
      showToast("Failed to load genres.", "error");
    }
  };

  const handleParticularGenre = async (genreId) => {
    try {
      const response = await getParticularGenre(selectedType, genreId, page);
      setMovies(response.results);
      return response.results;
    } catch (err) {
      showToast("Failed to load genre movies.", "error");
    }
  };

  const handleMovieDetail = async (movieId) => {
    setLoading(true);
    try {
      const response = await getMovieDetail(selectedType, movieId);
      setmovieDetail(response);
      return response;
    } catch (err) {
      showToast("Failed to load movie details.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleMovieTrailer = async (movieId) => {
    try {
      const response = await getMovieTrailer(selectedType, movieId);
      return response.results.find(
        (vid) => vid.type == "Trailer" && vid.site == "YouTube",
      );
    } catch (err) {
      // Silently fail — trailer is optional UI
      return null;
    }
  };

  const handleSearch = async (search) => {
    setLoading(true);
    try {
      const response = await searchMovie(selectedType, search);
      setMovies(response.results);
    } catch (err) {
      showToast("Search failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleActorsOfMovie = async (movieId) => {
    try {
      const response = await getActorsOfMovie(selectedType, movieId);
      return response;
    } catch (err) {
      showToast("Failed to load cast information.", "error");
      return { cast: [] };
    }
  };

  const handleSimilarMovies = async (movieId) => {
    try {
      const response = await getSimilarMovies(selectedType, movieId);
      return response.results;
    } catch (err) {
      showToast("Failed to load similar movies.", "error");
      return [];
    }
  };

  return {
    loading,
    movies,
    category,
    setCategory,
    setPage,
    hasMore,
    sethasMore,
    genre,
    selectedGenre,
    setselectedGenre,
    movieDetail,
    selectedType,
    setSelectedType,
    fetchMovies,
    handleParticularGenre,
    handleMovieDetail,
    handleMovieTrailer,
    handleSearch,
    handleActorsOfMovie,
    handleSimilarMovies,
  };
};

export default useMovies;
