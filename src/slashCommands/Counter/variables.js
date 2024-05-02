const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
    name: "variables",
    description: "Affiche les variables pour les counters",
    run: async (client, interaction) => {

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select')
                    .addOptions([
                        {
                            label: 'Counter',
                            emoji: client.emoji.fleche,
                            value: 'counter',
                        },

                    ]),
            );

        const msg = await interaction.reply({ content: null, components: [row] });
        ;

        const collector = msg.createMessageComponentCollector();
            collector.on('collect', async i => {
                if (i.user.id !== interaction.user.id) return i.reply({ content: "Tu n'es pas autorisé à interagir avec cette interaction !", flags: 64 })

                const value = i.values[0];

                if (value === 'counter') {
                    const membersGuild = await interaction.guild.members.fetch();
                    const memberdnd = membersGuild.filter(member => member.presence && member.presence.status === 'dnd');
                    const memberidl = membersGuild.filter(member => member.presence && member.presence.status === 'idle');
                    const memberon = membersGuild.filter(member => member.presence && member.presence.status === 'online');
                    const memberOffline = membersGuild.size - (memberdnd.size + memberidl.size + memberon.size)
                    const membervocal = membersGuild.filter(member => member.voice.channel);
                    let Vanity = { code: "Aucune", uses: 0 };

                    try {
                        Vanity = await interaction.guild.fetchVanityData();
                    } catch (error) {
                        Vanity = { code: "Aucune", uses: 0 };
                    }

                    msg.edit({
                        embeds: [{
                            title: "Variable Counter",
                            color: client.color,
                            fields: [
                                { name: "[serverName]", value: `\`${interaction.guild?.name}\`` },
                                { name: "[serverId]", value: `\`${interaction.guild?.id}\`` },
                                { name: "[serverMemberCount]", value: `\`${membersGuild.size}\`` },
                                { name: "[serverBotCount]", value: `\`${membersGuild.filter(h => h.user.bot).size}\`` },
                                { name: "[serverMemberCount]", value: `\`${membersGuild.filter(h => !h.user.bot).size}\`` },
                                { name: "[serverCreatedDate]", value: `<t:${Math.round(parseInt(interaction.guild.createdTimestamp) / 1000)}:f>` },
                                { name: "[serverCreatedAt]", value: `<t:${Math.round(parseInt(interaction.guild.createdTimestamp) / 1000)}:R>` },
                                { name: "[serverBoostCount]", value: '\`' + interaction.guild.premiumSubscriptionCount + '\`' || `\`0\`` },
                                { name: "[serverVanityUse]", value: Vanity ? '\`' +Vanity.uses+ '\`' : '\`' +0+ '\`' },
                                { name: "[serverVanity]", value: Vanity ? '\`' +Vanity.code+ '\`' : "snoway" },
                                { name: "[serverChannelsCount]", value: '\`' + interaction.guild.channels.cache.size + '\`' },
                                { name: "[serverRolesCount]", value: `\`${interaction.guild.roles.cache.size}\`` },
                                { name: "[serverMemberOnline]", value: `\`${memberon.size || 0}\`` },
                                { name: "[serverMemberVocal]", value: `\`${membervocal.size || 0}\`` },
                                { name: "[serverMemberOffline]", value: `\`${memberOffline || 0}\`` },
                                { name: "[serverMemberDnd]", value: `\`${memberdnd.size || 0 }\`` },
                                { name: "[serverMemberIdle]", value: `\`${memberidl.size || 0 }\`` },
                                { name: "[serverMemberOnlineCount]", value: `\`${(memberdnd.size + memberidl.size + memberon.size) || 0 }\`` },
                            ]
                        }]
                    })
                    await i.deferUpdate();
                }
            });
       
      
    },
};