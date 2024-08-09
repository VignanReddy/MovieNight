const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movieController");

router.get("/search-movies", movieController.searchMovies);
router.get("/movie-details/:movieId", movieController.getMovieDetails);
router.get("/trending", movieController.fetchTrendingMovies);
router.get("/random", movieController.getRandomMoviesByGenres);

module.exports = router;
