const axios = require('axios')
module.exports = {
  name: "ready",
  run: async (client) => {
    console.log('[CLIENT] ' + client.user.tag + ` (` + client.user.id + `) est connecté ! (${client.guilds.cache.size} guilds / ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0).toLocaleString()} users / ${client.slashCommands.size} commands)`)
    client.user.setPresence({
      status: 'dnd',
      activities: [
        {
          name: `${client.guilds.cache.size} guilds | ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0).toLocaleString()} users`,
          type: 1,
          url: "https://twitch.tv/oni145"
        },
      ],
    });   
  }
}

