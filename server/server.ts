const express = require("express");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());

app.get("/get-random-video", (req, res) => {
  //get data from uniqueVideos.json
  const fs = require("fs");
  const videos = JSON.parse(fs.readFileSync("uniqueVideos.json"));
  const randomIndex = Math.floor(Math.random() * videos.length);
  res.json(videos[randomIndex].videoId);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
 
    