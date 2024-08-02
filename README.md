# MyFavChef
A website to show a random recipe from my favorite chef -> https://myfavchef.netlify.app/

All videos data is stored at a MySQL RDS on AWS.
Using lambadas to get and insert videos.
Subscribed to PubSubHubbub to get notify each time a new video was added to the channel
and use a webhook to insert new video data to the DB -> https://pubsubhubbub.appspot.com/subscribe 