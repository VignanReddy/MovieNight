const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");

router.post("/", eventController.createEvent);
router.get("/vote/:id", eventController.getEventById);
router.put("/:id/upvote", eventController.upvoteMovie);
router.get("/user/:userId", eventController.getEventsByUser);
router.put("/:id/update", eventController.updateEventAfterVoting);
router.delete("/:id", eventController.deleteEvent);

module.exports = router;
