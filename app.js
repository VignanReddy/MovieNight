const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const connectDB = require("./config/database");
const requestIp = require("request-ip");

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(requestIp.mw());
app.use(bodyParser.json());

// Routes
const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");
const movieRoutes = require("./routes/movieRoutes");

app.use("/users", userRoutes);
app.use("/events", eventRoutes);
app.use("/api", movieRoutes);

// Default Route
app.get("/", (req, res) => {
  res.send("Welcome to Movie Night");
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
