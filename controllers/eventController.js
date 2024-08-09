const axios = require("axios");
const Event = require("../models/Event");
const UserModel = require("../models/User");
const { getMovieDetails } = require("./movieController");

exports.createEvent = async (req, res) => {
  try {
    const {
      night,
      venue,
      author,
      movies,
      days,
      hours,
      minutes,
      selectedMovie,
      votingEndTime,
    } = req.body;

    console.log("Entering create event");

    if (!night || !venue || !author || !movies) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Ensure author exists
    const user = await UserModel.findById(author);
    if (!user) {
      return res.status(400).json({ message: "Author not found" });
    }

    const newEvent = new Event({
      night,
      venue,
      author,
      movies,
      selectedMovie,
      votingEndTime,
    });

    await newEvent.save();

    const eventId = newEvent._id;

    res.send({ message: "Event created", eventId: eventId });
  } catch (error) {
    console.error("Error creating event:", error);
    res
      .status(500)
      .json({ message: "Error creating event", error: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.upvoteMovie = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { movieId, ipAddress } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if the IP address has already voted
    const hasAlreadyVoted = event.voters.some(
      (voter) => voter.voterId === ipAddress
    );

    if (hasAlreadyVoted) {
      return res.status(400).json({ message: "IP address has already voted" });
    }

    // Find the movie and increment votes
    const movie = event.movies.find((m) => m.movieId === movieId);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found in this event" });
    }

    movie.votes += 1;
    event.voters.push({ voterId: ipAddress, movieId: movieId });

    await event.save();

    res.json({ message: "Movie upvoted", event });
  } catch (error) {
    console.error("Error upvoting movie:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getEventsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Ensure user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find events by the user and sort by createdAt in descending order
    const events = await Event.find({ author: userId }).sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    console.error("Error fetching events by user:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.updateEventAfterVoting = async (req, res) => {
  try {
    const eventId = req.params.id;

    console.log("Request body:", eventId);

    // Find the event by ID
    const event = await Event.findById(eventId);

    console.log("fount event -----", event);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const currentTime = new Date();
    const votingEndTime = new Date(event.votingEndTime);

    // Check if voting end time has passed
    // if (currentTime <= votingEndTime) {
    //   return res.status(400).json({ message: "Voting is still ongoing" });
    // }

    // Find the maximum number of votes
    const maxVotes = Math.max(...event.movies.map((movie) => movie.votes));

    // Filter movies with the maximum votes
    const topVotedMovies = event.movies.filter(
      (movie) => movie.votes === maxVotes
    );

    // Randomly select one of the top-voted movies
    const selectedMovie =
      topVotedMovies[Math.floor(Math.random() * topVotedMovies.length)];

    console.log("------------", selectedMovie);

    // Update the selectedMovie field
    event.selectedMovie = {
      movieId: selectedMovie.movieId,
      title: selectedMovie.title,
      poster: selectedMovie.poster,
      release_date: selectedMovie.release_date,
    };

    // Save the updated event
    await event.save();

    res.json({ message: "Event updated with selected movie", event });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    // Find the event by ID
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Delete the event
    await Event.deleteOne({ _id: eventId });

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
