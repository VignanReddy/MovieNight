const axios = require("axios");

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const OMDB_API_KEY = process.env.OMDB_API_KEY;

exports.getRandomMoviesByGenres = async (req, res) => {
  const { genreIds, count } = req.query; // Get genre IDs and count from the query parameters

  // Convert count to a number
  const movieCount = parseInt(count, 10) || 0; // Default to 5 if count is not a valid number

  try {
    // Convert comma-separated genre IDs into an array
    const genreIdArray = genreIds
      ? genreIds.split(",").map((id) => id.trim())
      : [];

    // Step 1: Make an initial request to get the total number of pages
    const initialResponse = await axios.get(
      "https://api.themoviedb.org/3/discover/movie",
      {
        params: {
          api_key: TMDB_API_KEY,
          with_genres: genreIdArray.join(","),
          language: "en-US",
          page: 1,
        },
      }
    );

    let totalPages = initialResponse.data.total_pages;

    // Ensure totalPages is within TMDB API limits
    if (totalPages > 500) {
      totalPages = 500;
    }

    // Function to get a random integer between min and max (inclusive)
    const getRandomInt = (min, max) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    let allMovies = [];
    const movieIds = new Set();
    const visitedPages = new Set(); // Track visited pages to avoid duplicates

    // Keep fetching until we have at least the desired number of unique movies
    while (allMovies.length < movieCount && movieIds.size < totalPages * 20) {
      let randomPage;

      // Ensure we get a new random page
      do {
        randomPage = getRandomInt(1, totalPages);
      } while (visitedPages.has(randomPage));

      visitedPages.add(randomPage);

      const response = await axios.get(
        "https://api.themoviedb.org/3/discover/movie",
        {
          params: {
            api_key: TMDB_API_KEY,
            with_genres: genreIdArray.join(","),
            language: "en-US",
            page: randomPage,
          },
        }
      );

      const movies = response.data.results;
      for (let movie of movies) {
        if (!movieIds.has(movie.id)) {
          movieIds.add(movie.id);
          allMovies.push(movie);
          if (allMovies.length >= movieCount) break;
        }
      }
    }

    // Function to shuffle an array
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    };

    // Shuffle the array of movie objects
    shuffleArray(allMovies);

    // Select the desired number of movie objects from the shuffled array
    const randomMovies = allMovies.slice(0, movieCount);

    res.json(randomMovies);
  } catch (error) {
    console.error("Error fetching random movies by genres:", error);
    res.status(500).json({ error: "Error fetching random movies by genres" });
  }
};

exports.searchMovies = async (req, res) => {
  const { query } = req.query;
  const genreMap = {
    Action: 28,
    Adventure: 12,
    Animation: 16,
    Comedy: 35,
    Crime: 80,
    Documentary: 99,
    Drama: 18,
    Family: 10751,
    Fantasy: 14,
    History: 36,
    Horror: 27,
    Music: 10402,
    Mystery: 9648,
    Romance: 10749,
    ScienceFiction: 878,
    Thriller: 53,
    War: 10752,
    Western: 37,
  };

  try {
    const { query, genres } = req.query;
    const genreIds = genres ? genres.split(",").map(Number) : [];

    const response = await axios.get(
      "https://api.themoviedb.org/3/search/movie",
      {
        params: {
          api_key: TMDB_API_KEY,
          query: query,
        },
      }
    );

    const movies = response.data.results.filter((movie) => {
      console.log(genreIds);
      if (genreIds.length === 0) return true; // No genre filter, include all movies
      return genreIds.some((genreId) => movie?.genre_ids?.includes(genreId));
    });
    // .map((movie) => ({
    //   id: movie.id,
    //   title: movie.title,
    //   release_date: movie.release_date,
    //   poster_path: movie.poster_path,
    // }));

    res.json(movies);
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).json({ error: "Error fetching movies" });
  }
};

exports.getMovieDetails = async (req, res) => {
  const { movieId } = req.params;

  try {
    const tmdbResponse = await axios.get(
      `https://api.themoviedb.org/3/movie/${movieId}`,
      {
        params: {
          api_key: TMDB_API_KEY,
          append_to_response: "videos,credits",
        },
      }
    );

    const { title, release_date, overview, poster_path, genres, imdb_id } =
      tmdbResponse.data;

    const omdbResponse = await axios.get("http://www.omdbapi.com/", {
      params: {
        apikey: OMDB_API_KEY,
        i: imdb_id,
        plot: "full",
      },
    });

    const { imdbRating } = omdbResponse.data;

    const providersResponse = await axios.get(
      `https://api.themoviedb.org/3/movie/${movieId}/watch/providers`,
      {
        params: {
          api_key: TMDB_API_KEY,
          language: "en-US",
          watch_region: "US",
        },
      }
    );

    const streamingPlatforms = providersResponse.data.results.US.flatrate.map(
      (provider) => ({
        name: provider.provider_name,
        logoPath: provider.logo_path,
      })
    );

    const movieGenres = genres.map((genre) => genre.name);

    const movieDetails = {
      title: title,
      release_date: release_date,
      synopsis: overview,
      imdbRating: imdbRating,
      posterPath: poster_path,
      genres: movieGenres,
      streamingPlatforms: streamingPlatforms,
    };

    res.json(movieDetails);
  } catch (error) {
    console.error("Error fetching movie details:", error);
    res.status(500).json({ error: "Error fetching movie details" });
  }
};

const API_URL =
  "https://api.themoviedb.org/3/trending/movie/week?language=en-US";

exports.fetchTrendingMovies = async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.themoviedb.org/3/trending/movie/week?language=en-US",
      {
        params: {
          api_key: TMDB_API_KEY,
        },
      }
    );

    const movies = response.data.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      poster_path: movie.poster_path,
    }));

    res.json(movies);
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).json({ error: "Error fetching movies" });
  }
};
