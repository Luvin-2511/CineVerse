import React, { createContext, useState } from "react";

export const MovieContext = createContext();

const MovieProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const [category, setCategory] = useState("trending");
  const [page, setPage] = useState(1);
  const [hasMore, sethasMore] = useState(true);
  const [genre, setGenre] = useState(null);
  const [selectedGenre, setselectedGenre] = useState(null);
  const [movieDetail,setmovieDetail] = useState({})
  const [selectedType,setSelectedType] = useState("movie")

  return (
    <MovieContext.Provider
      value={{
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
        setSelectedType
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export default MovieProvider;
