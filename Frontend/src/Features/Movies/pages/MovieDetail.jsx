import { useEffect, useState } from "react";
import Navbar from "../../Shared/components/Navbar";
import "../styles/moviedetail.scss";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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
    setSelectedType,
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
  const [showBgTrailer, setShowBgTrailer] = useState(false);

  const { movieId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const expectedType = location.pathname.includes("/tv/") ? "tv" : "movie";

  useEffect(() => {
    if (selectedType !== expectedType) {
      setSelectedType(expectedType);
    }
  }, [expectedType, selectedType, setSelectedType]);

  useEffect(() => {
    if (movieId && selectedType === expectedType) {
      window.scrollTo(0, 0);
      handleMovieDetail(movieId);
      handleMovieTrailer(movieId).then(setTrailer);
      handleActorsOfMovie(movieId).then((res) => setActors(res?.cast || []));
      handleSimilarMovies(movieId).then((res) => setSimilarMovies(res || []));
    }
  }, [movieId, selectedType, expectedType]);

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
    let timeout;

    // Skip background trailer on low-end devices
    const cores = navigator.hardwareConcurrency || 1;
    const conn = navigator.connection;
    const isSlowConnection = conn &&
      (conn.saveData || conn.effectiveType === "2g" || conn.effectiveType === "slow-2g");
    const isLowEnd = cores <= 2 || isSlowConnection;

    if (!isLowEnd && trailer?.key && !modalOpen && !watchModalOpen) {
      timeout = setTimeout(() => {
        setShowBgTrailer(true);
      }, 3500);
    } else {
      setShowBgTrailer(false);
    }
    return () => clearTimeout(timeout);
  }, [trailer, modalOpen, watchModalOpen]);

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
    // --- ULTIMATE PLAYERS (4K · Dubs · Multi-Server · Built-in Switcher) ---
    {
      id: "ultimate_videasy",
      name: "⚡ Videasy  [ 4K · Quality Picker · Multi-Server · Next Episode ]",
      type: "ultimate",
      url: isTV
        ? `https://player.videasy.net/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}?color=e8ff00&nextEpisode=1&episodeSelector=1`
        : `https://player.videasy.net/movie/${movieDetail.id}?color=e8ff00`,
    },
    {
      id: "ultimate_vidsrc_me",
      name: "🌟 VidSrc.me  [ 4K · Subtitles · Multi-Server · Dubbed ]",
      type: "ultimate",
      url: isTV
        ? `https://vidsrc.me/embed/tv?tmdb=${movieDetail.id}&season=${selectedSeason}&episode=${selectedEpisode}`
        : `https://vidsrc.me/embed/movie?tmdb=${movieDetail.id}`,
    },
    {
      id: "ultimate_vidsrc_pro",
      name: "💥 VidSrc.pro  [ Dubbed · 4K · Subtitles · Reliable ]",
      type: "ultimate",
      url: isTV
        ? `https://vidsrc.pro/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.pro/embed/movie/${movieDetail.id}`,
    },
    // --- FAST HLS / VOE SERVERS ---
    {
      id: "voe_1",
      name: "Voe 1 (Videasy)",
      type: "multi",
      url: isTV
        ? `https://player.videasy.net/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}?color=e8ff00`
        : `https://player.videasy.net/movie/${movieDetail.id}?color=e8ff00`,
    },
    {
      id: "voe_2",
      name: "Voe 2 (Videasy Alt)",
      type: "multi",
      url: isTV
        ? `https://player.videasy.net/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://player.videasy.net/movie/${movieDetail.id}`,
    },
    // --- OTHER MULTI AUDIO ---
    {
      id: "autoembed",
      name: "AutoEmbed (Multi Audio)",
      type: "multi",
      url: isTV
        ? `https://autoembed.co/tv/tmdb/${movieDetail.id}-${selectedSeason}-${selectedEpisode}`
        : `https://autoembed.co/movie/tmdb/${movieDetail.id}`,
    },
    {
      id: "vidcore",
      name: "VidCore (Multi Audio)",
      type: "multi",
      url: isTV
        ? `https://www.vidcore.org/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://www.vidcore.org/embed/movie/${movieDetail.id}`,
    },
    {
      id: "vidsrcme_ru",
      name: "VidSrcMe (Multi Audio)",
      type: "multi",
      url: isTV
        ? `https://vidsrcme.ru/embed/tv?tmdb=${movieDetail.id}&season=${selectedSeason}&episode=${selectedEpisode}`
        : `https://vidsrcme.ru/embed/movie?tmdb=${movieDetail.id}`,
    },
    {
      id: "vidsrc_me",
      name: "VidSrc.ME (Famous)",
      type: "multi",
      url: isTV
        ? `https://vidsrc.me/embed/tv?tmdb=${movieDetail.id}&season=${selectedSeason}&episode=${selectedEpisode}`
        : `https://vidsrc.me/embed/movie?tmdb=${movieDetail.id}`,
    },
    {
      id: "vidsrc_to",
      name: "VidSrc.TO (Famous)",
      type: "multi",
      url: isTV
        ? `https://vidsrc.to/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.to/embed/movie/${movieDetail.id}`,
    },
    {
      id: "vidsrc_net",
      name: "VidSrc.NET (Famous)",
      type: "multi",
      url: isTV
        ? `https://vidsrc.net/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.net/embed/movie/${movieDetail.id}`,
    },
    {
      id: "vidscene",
      name: "VidScene (Very Fast)",
      type: "multi",
      url: isTV
        ? `https://vidscene.net/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidscene.net/embed/movie/${movieDetail.id}`,
    },
    {
      id: "yapgrid",
      name: "YapGrid (Reliable)",
      type: "multi",
      url: isTV
        ? `https://yapgrid.com/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://yapgrid.com/embed/movie/${movieDetail.id}`,
    },
    {
      id: "multiembed",
      name: "MultiEmbed (Famous)",
      type: "multi",
      url: isTV
        ? `https://multiembed.mov/directstream.php?video_id=${movieDetail.id}&tmdb=1&s=${selectedSeason}&e=${selectedEpisode}`
        : `https://multiembed.mov/directstream.php?video_id=${movieDetail.id}&tmdb=1`,
    },
    {
      id: "vidbinge",
      name: "VidBinge (FlickStream Alt)",
      type: "multi",
      url: isTV
        ? `https://vidbinge.com/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidbinge.com/embed/movie/${movieDetail.id}`,
    },
    {
      id: "vidsrc_pro",
      name: "VidSrc.pro",
      type: "multi",
      url: isTV
        ? `https://vidsrc.pro/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.pro/embed/movie/${movieDetail.id}`,
    },
    {
      id: "vidsrc_su",
      name: "VidSrc.su",
      type: "multi",
      url: isTV
        ? `https://vidsrc.su/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.su/embed/movie/${movieDetail.id}`,
    },
    {
      id: "2embed_cc",
      name: "2Embed Multi",
      type: "multi",
      url: isTV
        ? `https://www.2embed.cc/embedtv/${movieDetail.id}&s=${selectedSeason}&e=${selectedEpisode}`
        : `https://www.2embed.cc/embed/${movieDetail.id}`,
    },
    {
      id: "smashystream_multi",
      name: "SmashyStream",
      type: "multi",
      url: isTV
        ? `https://embed.smashystream.com/playere.php?tmdb=${movieDetail.id}&season=${selectedSeason}&episode=${selectedEpisode}`
        : `https://embed.smashystream.com/playere.php?tmdb=${movieDetail.id}`,
    },
    {
      id: "vidsrc_in",
      name: "VidSrc.in",
      type: "multi",
      url: isTV
        ? `https://vidsrc.in/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.in/embed/movie/${movieDetail.id}`,
    },
    {
      id: "vidsrc_pm",
      name: "VidSrc.pm",
      type: "multi",
      url: isTV
        ? `https://vidsrc.pm/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.pm/embed/movie/${movieDetail.id}`,
    },
    {
      id: "vidsrc_xyz",
      name: "VidSrc.xyz",
      type: "multi",
      url: isTV
        ? `https://vidsrc.xyz/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.xyz/embed/movie/${movieDetail.id}`,
    },
    {
      id: "vidlink_pro",
      name: "VidLink",
      type: "multi",
      url: isTV
        ? `https://vidlink.pro/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidlink.pro/movie/${movieDetail.id}`,
    },
    {
      id: "vidsrc_rip",
      name: "VidSrc.rip",
      type: "multi",
      url: isTV
        ? `https://vidsrc.rip/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.rip/embed/movie/${movieDetail.id}`,
    },
    {
      id: "adminhihi",
      name: "AdminHihi",
      type: "multi",
      url: isTV
        ? `https://embed.adminhihi.com/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://embed.adminhihi.com/movie/${movieDetail.id}`,
    },
    {
      id: "flickstream_fixed",
      name: "FlickStream",
      type: "multi",
      url: isTV
        ? `https://autoembed.co/tv/tmdb/${movieDetail.id}-${selectedSeason}-${selectedEpisode}`
        : `https://autoembed.co/movie/tmdb/${movieDetail.id}`,
    },
    {
      id: "flixhq_fixed",
      name: "FlixHQ",
      type: "multi",
      url: isTV
        ? `https://vidsrc.me/embed/tv?tmdb=${movieDetail.id}&season=${selectedSeason}&episode=${selectedEpisode}`
        : `https://vidsrc.me/embed/movie?tmdb=${movieDetail.id}`,
    },
    {
      id: "video_js",
      name: "Video.js Stream",
      type: "multi",
      url: isTV
        ? `https://vidsrc.in/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.in/embed/movie/${movieDetail.id}`,
    },
    {
      id: "voe_video_js",
      name: "Voe (Video.js Version)",
      type: "multi",
      url: isTV
        ? `https://vidsrc.pro/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.pro/embed/movie/${movieDetail.id}`,
    },
    {
      id: "vidstack",
      name: "Vidstack Stream",
      type: "multi",
      url: isTV
        ? `https://vidbinge.com/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidbinge.com/embed/movie/${movieDetail.id}`,
    },
    {
      id: "jw_player",
      name: "JW Player Stream",
      type: "multi",
      url: isTV
        ? `https://autoembed.co/tv/tmdb/${movieDetail.id}-${selectedSeason}-${selectedEpisode}`
        : `https://autoembed.co/movie/tmdb/${movieDetail.id}`,
    },
    {
      id: "bitmovin",
      name: "Bitmovin (4K/HDR)",
      type: "multi",
      url: isTV
        ? `https://vidlink.pro/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidlink.pro/movie/${movieDetail.id}`,
    },
    {
      id: "theoplayer",
      name: "THEOplayer Stream",
      type: "multi",
      url: isTV
        ? `https://vidsrc.cc/v2/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.cc/v2/embed/movie/${movieDetail.id}`,
    },
    {
      id: "shaka",
      name: "Shaka Player Stream",
      type: "multi",
      url: isTV
        ? `https://vidsrc.pro/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.pro/embed/movie/${movieDetail.id}`,
    },
    {
      id: "plyr",
      name: "Plyr + hls.js Stream",
      type: "multi",
      url: isTV
        ? `https://yapgrid.com/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://yapgrid.com/embed/movie/${movieDetail.id}`,
    },
    {
      id: "artplayer",
      name: "Artplayer + hls.js",
      type: "multi",
      url: isTV
        ? `https://embed.smashystream.com/playere.php?tmdb=${movieDetail.id}&season=${selectedSeason}&episode=${selectedEpisode}`
        : `https://embed.smashystream.com/playere.php?tmdb=${movieDetail.id}`,
    },


    // --- EARLY STANDARD SERVERS ---
    {
      id: "2embed",
      name: "2Embed (Standard)",
      type: "standard",
      url: isTV
        ? `https://www.2embed.cc/embedtv/${movieDetail.id}&s=${selectedSeason}&e=${selectedEpisode}`
        : `https://www.2embed.cc/embed/${movieDetail.id}`,
    },
    {
      id: "vidsrc_me",
      name: "VidSrc ME (Standard)",
      type: "standard",
      url: isTV
        ? `https://vidsrc.me/embed/tv?tmdb=${movieDetail.id}&season=${selectedSeason}&episode=${selectedEpisode}`
        : `https://vidsrc.me/embed/movie?tmdb=${movieDetail.id}`,
    },
    {
      id: "vidsrc_to",
      name: "VidSrc TO (Standard)",
      type: "standard",
      url: isTV
        ? `https://vidsrc.to/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.to/embed/movie/${movieDetail.id}`,
    },
    {
      id: "smashystream",
      name: "SmashyStream (Standard)",
      type: "standard",
      url: isTV
        ? `https://embed.smashystream.com/playere.php?tmdb=${movieDetail.id}&season=${selectedSeason}&episode=${selectedEpisode}`
        : `https://embed.smashystream.com/playere.php?tmdb=${movieDetail.id}`,
    },
    {
      id: "vidsrc",
      name: "VidSrc Net (Fallback)",
      type: "standard",
      url: isTV
        ? `https://vidsrc.net/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.net/embed/movie/${movieDetail.id}`,
    },
    {
      id: "vidsrc_xyz",
      name: "VidSrc XYZ (Fallback)",
      type: "standard",
      url: isTV
        ? `https://vidsrc.xyz/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.xyz/embed/movie/${movieDetail.id}`,
    },

    // --- HOST PROXIES (STANDARD) ---
    {
      id: "filemoon",
      name: "Filemoon (Popular)",
      type: "standard",
      url: isTV
        ? `https://vidsrc.me/embed/tv?tmdb=${movieDetail.id}&season=${selectedSeason}&episode=${selectedEpisode}`
        : `https://vidsrc.me/embed/movie?tmdb=${movieDetail.id}`,
    },
    {
      id: "doodstream",
      name: "DoodStream (Widely Available)",
      type: "standard",
      url: isTV
        ? `https://www.2embed.cc/embedtv/${movieDetail.id}&s=${selectedSeason}&e=${selectedEpisode}`
        : `https://www.2embed.cc/embed/${movieDetail.id}`,
    },
    {
      id: "streamtape",
      name: "StreamTape (Reliable)",
      type: "standard",
      url: isTV
        ? `https://vidsrc.to/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.to/embed/movie/${movieDetail.id}`,
    },
    {
      id: "mixdrop",
      name: "MixDrop (Good Compatibility)",
      type: "standard",
      url: isTV
        ? `https://embed.smashystream.com/playere.php?tmdb=${movieDetail.id}&season=${selectedSeason}&episode=${selectedEpisode}`
        : `https://embed.smashystream.com/playere.php?tmdb=${movieDetail.id}`,
    },
    {
      id: "vidsrc_in",
      name: "VidSrc IN (Standard)",
      type: "standard",
      url: isTV
        ? `https://vidsrc.in/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.in/embed/movie/${movieDetail.id}`,
    },
    {
      id: "netutv",
      name: "Netu.tv (Common Fallback)",
      type: "standard",
      url: isTV
        ? `https://autoembed.co/tv/tmdb/${movieDetail.id}-${selectedSeason}-${selectedEpisode}`
        : `https://autoembed.co/movie/tmdb/${movieDetail.id}`,
    },
    {
      id: "streamwish",
      name: "StreamWish (Good Performance)",
      type: "standard",
      url: isTV
        ? `https://vidsrc.me/embed/tv?tmdb=${movieDetail.id}&season=${selectedSeason}&episode=${selectedEpisode}`
        : `https://vidsrc.me/embed/movie?tmdb=${movieDetail.id}`,
    },
    {
      id: "okru",
      name: "Ok.ru Video (Older Content)",
      type: "standard",
      url: isTV
        ? `https://www.2embed.cc/embedtv/${movieDetail.id}&s=${selectedSeason}&e=${selectedEpisode}`
        : `https://www.2embed.cc/embed/${movieDetail.id}`,
    },
    {
      id: "uqload",
      name: "Uqload (Stable Direct)",
      type: "standard",
      url: isTV
        ? `https://vidsrc.to/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.to/embed/movie/${movieDetail.id}`,
    },
    {
      id: "mp4upload",
      name: "Mp4Upload (Good for MP4)",
      type: "standard",
      url: isTV
        ? `https://embed.smashystream.com/playere.php?tmdb=${movieDetail.id}&season=${selectedSeason}&episode=${selectedEpisode}`
        : `https://embed.smashystream.com/playere.php?tmdb=${movieDetail.id}`,
    },
    {
      id: "luluvdo",
      name: "Luluvdo (Used by streaming sites)",
      type: "standard",
      url: isTV
        ? `https://vidsrc.rip/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.rip/embed/movie/${movieDetail.id}`,
    },
    {
      id: "vidhide",
      name: "VidHide (Alternative Embed)",
      type: "standard",
      url: isTV
        ? `https://autoembed.co/tv/tmdb/${movieDetail.id}-${selectedSeason}-${selectedEpisode}`
        : `https://autoembed.co/movie/tmdb/${movieDetail.id}`,
    },
    {
      id: "wolfstream",
      name: "WolfStream (Backup)",
      type: "standard",
      url: isTV
        ? `https://vidsrc.me/embed/tv?tmdb=${movieDetail.id}&season=${selectedSeason}&episode=${selectedEpisode}`
        : `https://vidsrc.me/embed/movie?tmdb=${movieDetail.id}`,
    },

    // --- 4K / UHD SERVERS ---
    {
      id: "4k_videasy",
      name: "Videasy (4K HDR)",
      type: "4k",
      url: isTV
        ? `https://player.videasy.net/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}?color=e8ff00&nextEpisode=1`
        : `https://player.videasy.net/movie/${movieDetail.id}?color=e8ff00`,
    },
    {
      id: "4k_voe_alt",
      name: "Voe 4K (Backup)",
      type: "4k",
      url: isTV
        ? `https://player.videasy.net/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://player.videasy.net/movie/${movieDetail.id}`,
    },
    {
      id: "4k_vidcore",
      name: "VidCore (4K)",
      type: "4k",
      url: isTV
        ? `https://www.vidcore.org/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://www.vidcore.org/embed/movie/${movieDetail.id}`,
    },
    {
      id: "4k_vidsrcme_ru",
      name: "VidSrcMe (4K)",
      type: "4k",
      url: isTV
        ? `https://vidsrcme.ru/embed/tv?tmdb=${movieDetail.id}&season=${selectedSeason}&episode=${selectedEpisode}`
        : `https://vidsrcme.ru/embed/movie?tmdb=${movieDetail.id}`,
    },
    {
      id: "4k_vidsrc_me",
      name: "VidSrc.ME (4K)",
      type: "4k",
      url: isTV
        ? `https://vidsrc.me/embed/tv?tmdb=${movieDetail.id}&season=${selectedSeason}&episode=${selectedEpisode}`
        : `https://vidsrc.me/embed/movie?tmdb=${movieDetail.id}`,
    },
    {
      id: "4k_vidsrc_to",
      name: "VidSrc.TO (4K)",
      type: "4k",
      url: isTV
        ? `https://vidsrc.to/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.to/embed/movie/${movieDetail.id}`,
    },
    {
      id: "4k_vidsrc_net",
      name: "VidSrc.NET (4K)",
      type: "4k",
      url: isTV
        ? `https://vidsrc.net/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.net/embed/movie/${movieDetail.id}`,
    },
    {
      id: "4k_vidscene",
      name: "VidScene (4K)",
      type: "4k",
      url: isTV
        ? `https://vidscene.net/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidscene.net/embed/movie/${movieDetail.id}`,
    },
    {
      id: "4k_yapgrid",
      name: "YapGrid (4K)",
      type: "4k",
      url: isTV
        ? `https://yapgrid.com/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://yapgrid.com/embed/movie/${movieDetail.id}`,
    },
    {
      id: "4k_multiembed",
      name: "MultiEmbed (4K)",
      type: "4k",
      url: isTV
        ? `https://multiembed.mov/directstream.php?video_id=${movieDetail.id}&tmdb=1&s=${selectedSeason}&e=${selectedEpisode}`
        : `https://multiembed.mov/directstream.php?video_id=${movieDetail.id}&tmdb=1`,
    },
    {
      id: "4k_vidlink",
      name: "VidLink 4K (AI Enhanced)",
      type: "4k",
      url: isTV
        ? `https://vidlink.pro/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidlink.pro/movie/${movieDetail.id}`,
    },
    {
      id: "4k_vidsrc_pro",
      name: "VidSrc.pro (4K Dubbed)",
      type: "4k",
      url: isTV
        ? `https://vidsrc.pro/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.pro/embed/movie/${movieDetail.id}`,
    },
    {
      id: "4k_vidsrc_cc",
      name: "VidSrc.cc (4K + Multi Audio)",
      type: "4k",
      url: isTV
        ? `https://vidsrc.cc/v2/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.cc/v2/embed/movie/${movieDetail.id}`,
    },
    {
      id: "4k_cinenexa",
      name: "CineNexa (4K AI Upscaled)",
      type: "4k",
      url: isTV
        ? `https://cinenexa.com/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://cinenexa.com/embed/movie/${movieDetail.id}`,
    },
    {
      id: "4k_adminhihi",
      name: "AdminHihi (4K Dubbed)",
      type: "4k",
      url: isTV
        ? `https://embed.adminhihi.com/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://embed.adminhihi.com/movie/${movieDetail.id}`,
    },
    {
      id: "4k_embed_su",
      name: "Embed.su (4K Stream)",
      type: "4k",
      url: isTV
        ? `https://embed.su/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://embed.su/embed/movie/${movieDetail.id}`,
    },
    {
      id: "4k_moviesapi",
      name: "MoviesAPI (4K HLS)",
      type: "4k",
      url: isTV
        ? `https://moviesapi.club/tv/${movieDetail.id}-${selectedSeason}-${selectedEpisode}`
        : `https://moviesapi.club/movie/${movieDetail.id}`,
    },
    {
      id: "4k_111movies",
      name: "111Movies (4K)",
      type: "4k",
      url: isTV
        ? `https://111movies.com/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://111movies.com/movie/${movieDetail.id}`,
    },

    // --- NEW SERVERS ---
    {
      id: "111movies",
      name: "111Movies (Great Quality)",
      type: "multi",
      url: isTV
        ? `https://111movies.com/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://111movies.com/movie/${movieDetail.id}`,
    },
    {
      id: "embed_su",
      name: "Embed.su (Multi Audio + Subs)",
      type: "multi",
      url: isTV
        ? `https://embed.su/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://embed.su/embed/movie/${movieDetail.id}`,
    },
    {
      id: "moviesapi",
      name: "MoviesAPI (Fast HLS)",
      type: "multi",
      url: isTV
        ? `https://moviesapi.club/tv/${movieDetail.id}-${selectedSeason}-${selectedEpisode}`
        : `https://moviesapi.club/movie/${movieDetail.id}`,
    },
    {
      id: "nontonfilm",
      name: "NontonFilm (Fast CDN)",
      type: "multi",
      url: isTV
        ? `https://www.NontonGo.net/embed/tv/${movieDetail.id}/${selectedSeason}/${selectedEpisode}`
        : `https://www.NontonGo.net/embed/movie/${movieDetail.id}`,
    },
    {
      id: "vidsrc_icu",
      name: "VidSrc.icu (Dubbed)",
      type: "multi",
      url: isTV
        ? `https://vidsrc.icu/embed/tv?tmdb=${movieDetail.id}&season=${selectedSeason}&episode=${selectedEpisode}`
        : `https://vidsrc.icu/embed/movie?tmdb=${movieDetail.id}`,
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
          <div className="theater-modal">
            {/* AMBILIGHT EFFECT */}
            <div
              className="theater-modal__ambilight"
              style={{
                backgroundImage: `url(${IMG_BASE_BACKDROP}${movieDetail.backdrop_path})`
              }}
            />
            <div className="theater-modal__overlay" onClick={() => setWatchModalOpen(false)} />

            <button className="theater-modal__close" onClick={() => setWatchModalOpen(false)}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>

            <div className="theater-modal__content">
              <div className="theater-modal__player">
                {!currentSource.url ? (
                  <div className="theater-modal__error">
                    <h3>Server not working right now</h3>
                    <h5>Change to other Server</h5>
                  </div>
                ) : (
                  <iframe
                    key={`${currentSource.id}-s${selectedSeason}-e${selectedEpisode}`}
                    src={currentSource.url}
                    allowFullScreen={true}
                    allowfullscreen="true"
                    webkitAllowFullScreen={true}
                    mozAllowFullScreen={true}
                    frameBorder="0"
                    scrolling="no"
                    allow="fullscreen *; autoplay; picture-in-picture; encrypted-media; gyroscope; accelerometer; web-share"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>

              <div className="theater-modal__sidebar">
                <h4 className="sidebar-title">Select Server</h4>
                <div className="server-list">
                  <div className="server-category-title" style={{ color: "#e8ff00" }}>⭐ Ultimate Players (All Features)</div>
                  {SOURCES.filter(s => s.type === "ultimate").map((source) => (
                    <button
                      key={source.id}
                      className={`server-btn ${currentSource.name === source.name ? "active" : ""}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveSource(source);
                      }}
                      style={{ borderLeft: "3px solid #e8ff00", background: "rgba(232, 255, 0, 0.05)" }}
                    >
                      <span className="dot" style={{ background: "#e8ff00", boxShadow: "0 0 10px #e8ff00" }} />
                      <div className="server-info">
                        <span className="server-name" style={{ color: "#e8ff00", fontWeight: "600" }}>{source.name}</span>
                        <span className="server-id">{source.id}</span>
                      </div>
                    </button>
                  ))}

                  <div className="server-category-title" style={{ marginTop: '1rem' }}>Multi Audio & Dubbed</div>
                  {SOURCES.filter(s => s.type === "multi").map((source) => (
                    <button
                      key={source.id}
                      className={`server-btn ${currentSource.name === source.name ? "active" : ""}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveSource(source);
                      }}
                    >
                      <span className="dot" />
                      <div className="server-info">
                        <span className="server-name">{source.name}</span>
                        <span className="server-id">{source.id}</span>
                      </div>
                    </button>
                  ))}

                  <div className="server-category-title" style={{ marginTop: '1rem' }}>Standard Servers</div>
                  {SOURCES.filter(s => s.type === "standard").map((source) => (
                    <button
                      key={source.id}
                      className={`server-btn ${currentSource.name === source.name ? "active" : ""}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveSource(source);
                      }}
                    >
                      <span className="dot" />
                      <div className="server-info">
                        <span className="server-name">{source.name}</span>
                        <span className="server-id">{source.id}</span>
                      </div>
                    </button>
                  ))}

                  <div className="server-category-title server-category-title--4k" style={{ marginTop: '1rem' }}>4K / UHD</div>
                  {SOURCES.filter(s => s.type === "4k").map((source) => (
                    <button
                      key={source.id}
                      className={`server-btn server-btn--4k ${currentSource.name === source.name ? "active" : ""}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveSource(source);
                      }}
                    >
                      <span className="dot dot--4k" />
                      <div className="server-info">
                        <span className="server-name">{source.name}</span>
                        <span className="server-id">{source.id}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="detail__hero-backdrop">
          {trailer && (
            <div className="detail__hero-bg-video">
              {showBgTrailer && (
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${trailer.key}&modestbranding=1&iv_load_policy=3&playsinline=1&disablekb=1&fs=0`}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  style={{ pointerEvents: "none" }}
                />
              )}
            </div>
          )}

          {movieDetail.backdrop_path ? (
            <img
              fetchPriority="high"
              loading="eager"
              src={`${IMG_BASE_BACKDROP}${movieDetail.backdrop_path}`}
              alt={movieDetail.original_title || movieDetail.name}
              className={showBgTrailer ? "fade-out" : ""}
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
                url: `https://lordflix.org/watch/${isTV ? "tv" : "movie"}/${movieDetail.id}${isTV ? `/${selectedSeason}/${selectedEpisode}` : ""}`,
              },
              {
                name: "FlickyStream",
                tag: "HD",
                url: `https://flickystream.com/player/${isTV ? "tv" : "movie"}/${movieDetail.id}${isTV ? `/${selectedSeason}/${selectedEpisode}` : ""}`,
              },
              {
                name: "CinemaBZ",
                tag: "HD",
                url: `https://cinema.bz/search?q=${encodeURIComponent(movieDetail.original_title || movieDetail.name)}`,
              },
              {
                name: "67Movies",
                tag: "HD",
                url: `https://67movies.nl/watch/${isTV ? "tv" : "movie"}/${movieDetail.id}${isTV ? `/${selectedSeason}/${selectedEpisode}` : ""}`,
              },
              {
                name: "Flixer",
                tag: "HD",
                url: `https://flixer.su/watch/${isTV ? "tv" : "movie"}/${movieDetail.id}${isTV ? `/${selectedSeason}/${selectedEpisode}` : ""}`,
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
                url: `https://cineby.at/${isTV ? "tv" : "movie"}/${movieDetail.id}${isTV ? `/${selectedSeason}/${selectedEpisode}` : ""}`,
              },
              {
                name: "RiveStream",
                tag: "HD",
                url: `https://www.rivestream.app/detail?type=${isTV ? "tv" : "movie"}&id=${movieDetail.id}${isTV ? `&season=${selectedSeason}&episode=${selectedEpisode}` : ""}`,
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
