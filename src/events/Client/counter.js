const axios = require('axios');
const ms = require('ms')
module.exports = {
    name: "ready",
    run: async (client) => {
      //  setInterval(() => {
        client.guilds.cache.forEach(async (guild) => {
            let counters = await client.db.get(`counter_${guild.id}`) || [];
            try {
                const membersGuild = await guild.members.fetch();
                const Vanity = await guild.fetchVanityData()
                const memberdnd = membersGuild.filter(member => member.presence && member.presence.status === 'dnd');
                const memberidl = membersGuild.filter(member => member.presence && member.presence.status === 'idle');
                const memberon = membersGuild.filter(member => member.presence && member.presence.status === 'online');
                const memberOffline = membersGuild.size - (memberdnd.size + memberidl.size + memberon.size)
                const membervocal = membersGuild.filter(member => member.voice.channel);

                if (counters.length > 0) {
                    for (const counter of counters) {
                        const channel = client.channels.cache.get(counter.channelId);

                        if (channel) {
                            const updatedText = counter.text
                            .replace("[serverName]", channel.guild.name)
                            .replace("[serverId]", channel.guild.id)
                            .replace("[serverMember]", membersGuild.size)
                            .replace("[serverBotCount]", membersGuild.filter(member => member.user.bot).size)
                            .replace("[serverCreatedDate]", channel.guild.createdAt.toDateString())
                            .replace("[serverCreatedAt]", channel.guild.createdAt.toLocaleTimeString())
                            .replace("[serverBoostCount]", channel.guild.premiumSubscriptionCount || 0)
                            .replace("[serverChannelsCount]", channel.guild.channels.cache.size)
                            .replace("[serverRolesCount]", channel.guild.roles.cache.size)
                            .replace("[serverMemberCount]", membersGuild.filter(h => !h.user.bot).size)
                            .replace("[serverVanity]", Vanity ? Vanity.code : "Aucune")
                            .replace("[serverVanityUse]", Vanity ? Vanity.uses : 0)
                            .replace("[serverMemberOnline]", memberon.size || 0)
                            .replace("[serverMemberVocal]", membervocal.size || 0)
                            .replace("[serverMemberDnd]", memberdnd.size || 0)
                            .replace("[serverMemberIdle]", memberidl.size || 0)
                            .replace("[serverMemberOffline]", memberOffline || 0)   
                            .replace("[serverMemberOnlineCount]", (memberdnd.size + memberidl.size + memberon.size) || 0)   
                            
                            await channel.edit({ name: updatedText });
                        }
                    }
                }
            } catch (fetcherror) {
                console.error(`[Counter Event] Erreur : ${fetcherror.message} [${fetcherror.code}] [${guild.name}]`);
            }
        });


        // }, ms('5m'));
    }
}
