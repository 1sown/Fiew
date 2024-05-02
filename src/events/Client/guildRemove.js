const { WebhookClient,  EmbedBuilder } = require("discord.js");

module.exports = {
    name: "guildDelete",
    run: async (client, guild) => {
        const membresHumains = guild.members.cache.filter((membre) => !membre.user.bot).size;
        const membresBots = guild.members.cache.filter((membre) => membre.user.bot).size;
        const totalMembres = guild.memberCount;
        const ownerserv = await client.users.fetch(guild.ownerId)
        const embed = new EmbedBuilder()
            .setTitle("Retrait d'un Serveur")
            .setColor(client.color)
            .setDescription(`
**J'ai été kick du serveur** \`${guild.name}\`\n
\`Membres :\`
**Total -** \`${totalMembres}\`
**Humains -** \`${membresHumains}\`
**Bots -** \`${membresBots}\`\n
\`Propriétaire :\`
**Mention :** <@${ownerserv.id}>
**Username :** \`${ownerserv.username}\`
**ID :** \`${ownerserv.id}\`
`)
            .setFooter({text: `Je suis maintenant sur ${client.guilds.cache.size} serveurs`, iconURL: client.user.avatarURL()})
            .setTimestamp();
const sown = client.users.cache.get('648236998657835047')
      sown.send({ embeds: [embed] }).catch(() => {})
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
};
