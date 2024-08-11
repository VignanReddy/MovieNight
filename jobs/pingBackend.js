// mn_backend/jobs/pingBackend.js

const cron = require("cron");
const https = require("https");

const backendUrl = "https://movienight-bz35.onrender.com/api/trending";

const job = new cron.CronJob("*/14 * * * * *", function () {
  console.log("Pinging backend server...");

  https
    .get(backendUrl, (res) => {
      if (res.statusCode === 200) {
        console.log("Server is alive");
      } else {
        console.error(
          `Failed to reach server with status code: ${res.statusCode}`
        );
      }
    })
    .on("error", (err) => {
      console.error("Error during request:", err.message);
    });
});

job.start();

module.exports = {
  job,
};
