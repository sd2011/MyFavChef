const axios = require("axios");
require('dotenv').config();

const getData = async () => {
    axios.get("https://www.googleapis.com/youtube/v3/search",{
        params:{
            part: "snippet",
            channelId: "UCqRdvREgI2qLnKtiMfswzZQ", //chef jack ovens channelId
            key: process.env.YOUTUBE_KEY,
            maxResults: 50,
        }
    })
    .then(async (response) => 
        {
        console.log(response.data.items[0].snippet.title);
        const videos = response.data.items.map((item) => {
            return {
                title: item.snippet.title,
                videoId: item.id.videoId,
            };
        });
        let nextPageToken = response.data.nextPageToken;
        const totalResults = response.data.pageInfo.totalResults;
        let numResults = 50;
        

        

        while (numResults < totalResults) {

            console.log("Getting more videos...", numResults, "out of", totalResults);
           await axios.get("https://www.googleapis.com/youtube/v3/search", {
                params: {
                    part: "snippet",
                    channelId: "UCqRdvREgI2qLnKtiMfswzZQ",
                    key: process.env.YOUTUBE_KEY,
                    maxResults: 50,
                    pageToken: nextPageToken,
                },
            })
            .then((response) => {
                videos.push(
                    ...response.data.items.map((item) => {
                        return {
                            title: item.snippet.title,
                            videoId: item.id.videoId,
                        };
                    })
                );
                nextPageToken = response.data.nextPageToken;
                numResults += 50;
                console.log("numResults", numResults);
            })
            .catch((error) => {
                console.error(error);
            });
        
        }
        console.log(videos);
        //write to file
        const fs = require("fs");
        fs.writeFile("videos.json", JSON.stringify(videos), (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log("File has been created");
        });

    
    })
    .catch((error) => {
        console.error(error);
    });
}

const checkForDuplicates = async () => {
    const fs = require("fs");
    const videos = JSON.parse(fs.readFileSync("videos.json"));
    const titles = videos.map((video) => video.title);
    const ids = videos.map((video) => video.videoId);
    const uniqueIds = new Set(ids);
    const uniqueTitles = new Set(titles);
    console.log("Number of unique ids:", uniqueIds.size);
    console.log("Number of duplicate ids:", ids.length - uniqueIds.size);
    console.log("Number of unique titles:", uniqueTitles.size);
    console.log("Number of duplicate titles:", titles.length - uniqueTitles.size);

    //remove duplicates and write to file
    const uniqueVideos = videos.filter((video, index) => {
        return ids.indexOf(video.videoId) === index;
    });

    fs.writeFile("uniqueVideos.json", JSON.stringify(uniqueVideos), (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log("File has been created");
    });

}

getData();
checkForDuplicates();