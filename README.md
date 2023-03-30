# Lemmon-the-Trader
Economy bot for Discord made with discord.js. Made for DnD, but any other ttrpg probably works too.

If you want to run it yourself you're gonna have to setup a config.json like so:
```
  {
    "backupTime":3, //the time in hours (London time conforming to DST) you want the bot to do the backups and the cleanups. 
    "deleteThreshold":365, //how long you want transaction logs to exist for in days before they are automatically deleted during cleanup
    "token":, //your bot token, get it at the discord developer portal
    "clientId":, //your bot client id, get it at the discord developer portal
    "db_name":"test", //username and password for the sqlite3 database
    "db_password":"test",
    "servers":{}
  }
```
