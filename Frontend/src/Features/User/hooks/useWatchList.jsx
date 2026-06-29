import useAuth from "../../Auth/hooks/useAuth";
import { useUserContext } from "../user.context";
import { setWatchlist } from "../services/User.api";
import { useToast } from "../../Shared/toast.context";

const useWatchlist = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const handleWatchlist = async (movie) => {
    const isCurrentlyInWatchlist = isInWatchlist(movie.id);
    const previousUser = { ...user };
    
    // Optimistic Update
    let updatedWatchlist = [];
    if (isCurrentlyInWatchlist) {
      updatedWatchlist = (user?.watchlist || []).filter(w => String(w.movieId) !== String(movie.id));
    } else {
      updatedWatchlist = [...(user?.watchlist || []), { movieId: String(movie.id) }];
    }
    updateUser({ ...user, watchlist: updatedWatchlist });

    // API Request
    try {
      const response = await setWatchlist(movie.id, {
        title: movie.title || movie.name,
        posterPath: movie.poster_path,
        mediaType: movie.media_type || "movie",
        year: (movie.release_date || movie.first_air_date)?.split("-")[0],
        rating: movie.vote_average,
      });
      if (response && response.user) {
        updateUser(response.user);
      }
    } catch (err) {
      updateUser(previousUser);
      showToast(err?.response?.data?.message || "Failed to update watchlist.", "error");
    }
  };

  const isInWatchlist = (movieId) =>
    user?.watchlist?.some((w) => String(w.movieId) === String(movieId)) ||
    false;

  return {
    watchlist: user?.watchlist || [],
    handleWatchlist,
    isInWatchlist,
    user,
  };
};

export default useWatchlist;
