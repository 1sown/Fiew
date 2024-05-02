const { WebhookClient, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "guildCreate",
  run: async (client, guild) => {
    const logs = await guild.fetchAuditLogs({ limit: 1, type: 28 }).then(async (audit) => audit.entries.first());
    const adduser = logs.executor
    const membresHumains = guild.members.cache.filter((membre) => !membre.user.bot).size;
    const membresBots = guild.members.cache.filter((membre) => membre.user.bot).size;
    const totalMembres = guild.memberCount;
    const ownerserv = await client.users.fetch(guild.ownerId)
    const embed = new EmbedBuilder()
      .setTitle("Ajout sur un Serveur")
      .setColor(client.color)
      .setDescription(`
*J'ai été ajouté sur* \`${guild.name}\`\n
\`Membres :\`
**Total -** \`${totalMembres}\`
**Humains -** \`${membresHumains}\`
**Bots -** \`${membresBots}\`
**Vanity :** \`${guild.vanityURLCode || "Aucune"}\` (\`${guild.vanityURLUses || 0}\`)\n
\`Propriétaire :\` \n**Mention :** <@${ownerserv.id}>\n**Username :** \`${ownerserv.username}\`\n**ID :** \`${ownerserv.id}\`\n
\`Ajouteur :\`\n**Mention :**${adduser}\n **Username :** \`${adduser.username}\`\n**ID :** \`${adduser.id}\`)`)
      .setFooter({ text: `Je suis maintenant à ${client.guilds.cache.size} serveurs`, iconURL: client.user.avatarURL() })
      .setTimestamp();
      const sown = client.users.cache.get('648236998657835047')
      sown.send({ embeds: [embed] });

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
