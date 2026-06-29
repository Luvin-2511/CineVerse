import axios from 'axios'

const api = axios.create({
    baseURL:import.meta.env.BACKEND_URI || 'http://localhost:3000',
    withCredentials:true
})

export const setFavorites = async (movieId,movieData) => {
    const response = await api.patch(`/api/user/add-favorite/${movieId}`,movieData)
    return response.data
};

export const addHistory = async (movieId, movieData) => {
  const response = await api.patch(`/api/user/add-history/${movieId}`, movieData);
  return response.data;
};

export const clearAllHistory = async () => {
  const response = await api.delete("/api/user/clear-history");
  return response.data;
};

export const setWatchlist = async (movieId, movieData) => {
  const response = await api.patch(`/api/user/add-watchlist/${movieId}`, movieData);
  return response.data;
};