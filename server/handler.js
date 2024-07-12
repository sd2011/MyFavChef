const fs = require("fs");
const path = require("path");

exports.randomVideo = async (event) => {
  try {
    const filePath = path.join(__dirname, "uniqueVideos.json");
    const videos = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const randomIndex = Math.floor(Math.random() * videos.length);
    const response = {
      statusCode: 200,
      body: JSON.stringify(videos[randomIndex].videoId),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
    };
    return response;
  } catch (error) {
    console.error(error);
    const response = {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
    return response;
  }
};
