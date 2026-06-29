import useAuth from "../../Auth/hooks/useAuth";
import { useUserContext } from "../user.context";
import { setFavorites } from "../services/User.api";
import { useToast } from "../../Shared/toast.context";

const useFavorites = () => {
  const { user, updateUser } = useAuth();
  const { userLoading } = useUserContext();
  const { showToast } = useToast();

  const handleFavorite = async (movie) => {
    const isFav = user?.favorites?.some((f) => String(f.movieId) === String(movie.id));
    const previousUser = { ...user };
    
    // Optimistic Update
    let updatedFavorites = [];
    if (isFav) {
      updatedFavorites = (user?.favorites || []).filter(f => String(f.movieId) !== String(movie.id));
    } else {
      updatedFavorites = [...(user?.favorites || []), { movieId: String(movie.id) }];
    }
    updateUser({ ...user, favorites: updatedFavorites });

    // API Request
    try {
      const response = await setFavorites(movie.id, {
        title:      movie.title      || movie.name,
        posterPath: movie.poster_path,
        mediaType:  movie.media_type || "movie",
        year:       (movie.release_date || movie.first_air_date)?.split("-")[0],
        rating:     movie.vote_average,
      });
      if (response && response.user) {
        updateUser(response.user);
      }
    } catch (err) {
      updateUser(previousUser);
      showToast(err?.response?.data?.message || "Failed to update favorites.", "error");
    }
  };

  return {
    favorites: user?.favorites || [],
    userLoading,
    handleFavorite,
    user,
  };
};

export default useFavorites;