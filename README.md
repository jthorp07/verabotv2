# verabotv2
VeraBot but using Discord.js version 13+

This is a Discord bot running on Discord.js version 13 and using a small MySQL database
for storing information such as channel and message Snowflakes (ids) for fetching.

The bot is coded to function as a personal assistant to the staff of my Discord server
and has the following features:

-React role
  Users can receive roles in the server by adding reactions to a message.
  
-Reporting
  Users can report messages from another user, and staff can then view and respond to
  the report by either banning or warning the reported user, or by closing the report
  without taking disciplinary action.
  
-Database Access
  The bot's owner (I) can query the MySQL database, and the bot will send the results
  of the query in a Discord message.
  
-User XP System
  The bot will give users experience for each message sent, and users can level up by
  gaining experience. More will be added to this feature, such as a leaderboard and
  commands to view XP data.
  
I plan on adding more functionality to the bot as I get ideas for it. Anyone who wants
can clone this repo and make their own instance of this bot and configure it for another
Discord server. Currently, I am working on adding a /setup command that will make it
easier to get the bot and its database up and running and configured for its Discord
server.
