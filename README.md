# Twitch-Scraper

Script to pull messages from defined twitch channels and save them in the mongodb database

## How to use?

 1. Download and install nodejs
 2. Run npm install
 3. Create a .env file
 4. In the .env file add
	 * TWITCH_USERNAME = your username
	 * TWITCH_PASSWORD = your oauth token which you can get from https://twitchapps.com/tmi/
	 * MONGO_URI = your URI for mongodb database
	 * TWITCH_CHANNEL1 = add your first channel
	 * TWITCH_CHANNEL2 = add your second channel
	 * add more in .env and channels table in line 30
 5. Run using pm2 or just by typing node .
