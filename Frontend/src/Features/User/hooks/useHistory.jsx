import useAuth from "../../Auth/hooks/useAuth";
import { addHistory, clearAllHistory } from "../services/user.api";
import { useToast } from "../../Shared/toast.context";

const useHistory = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const handleHistory = async (movie) => {
    try {
      const response = await addHistory(movie.id, {
        title:      movie.title      || movie.name,
        posterPath: movie.poster_path,
        mediaType:  movie.media_type || "movie",
        year:       (movie.release_date || movie.first_air_date)?.split("-")[0],
      });
      updateUser(response.data);
    } catch (err) {
      showToast("Failed to save watch history.", "error");
    }
  };

  const clearHistory = async () => {
    try {
      const response = await clearAllHistory();
      updateUser(response.data);
    } catch (err) {
      showToast("Failed to clear watch history.", "error");
    }
  };

  return {
    history:      user?.watchHistory || [],
    handleHistory,
    clearHistory,
  };
};

export default useHistory;