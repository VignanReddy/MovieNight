const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    night: { type: String, required: true },
    venue: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    days: { type: String },
    hours: { type: String },
    minutes: { type: String },
    movies: [
      {
        movieId: { type: String, required: true },
        votes: { type: Number, default: 0 },
        title: { type: String },
        poster: { type: String },
        release_date: { type: String },
      },
    ],
    selectedMovie: {
      movieId: { type: String },
      votes: { type: Number },
      title: { type: String },
      poster: { type: String },
      release_date: { type: String },
    },
    voters: [
      {
        voterId: { type: String, required: true },
        movieId: { type: String, required: true },
      },
    ],
    votingEndTime: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
