const Discord = require('discord.js')
const variable = require('../../Model/variable')
module.exports = {
    name: "counter",
    description: "Crée/List/delete les counters",
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    options: [
        {
            name: 'clear',
            description: "Supprime tous les counters du serveur",
            type: 1,
        },
        {
            name: 'list',
            description: "Affiche la list des counters",
            type: 1,
        },
        {
            name: 'del',
            description: "Supprime un counter",
            type: 1,
            options: [
                {
                    name: "channel",
                    description: "Le channel",
                    type: 7,
                    channel_types: [2],
                    required: true
                }
            ]
        },
        {
            name: 'create',
            description: "Crée un counter pour le serveur !",
            type: 1,
            options: [
                {
                    name: "channel",
                    description: "Le channel",
                    type: 7,
                    required: true,
                    channel_types: [2]
                },
                {
                    name: "text",
                    description: "Le Text du channel (exemple: ⚡・ Membres: [serverMemberCount])",
                    type: 3,
                    required: true,
                },
            ]
        }
    ],
    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageChannels) && !interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageGuild)) {
            return interaction.followUp({ content: "Vous n'avez pas la permission d'utiliser cette commande. Permissions manquantes : `ManageChannels / ManageGuild`", ephemeral: true });
        }
        if (!interaction.guild.members.me.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
            return interaction.followUp({ content: "Je n'ai pas les permissions, Permissions manquantes : `Administrator`", ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });
        if (interaction.options.getSubcommand() === 'clear')
            
        {
            const counters = await client.db.get(`counter_${interaction.guild.id}`)
            if (!counters) return interaction.followUp({ content: "Il n'y a pas de compteur affecté à ce serveur !" });
            await client.db.delete(`counter_${interaction.guild.id}`)
            interaction.followUp({ content: "Les compteurs ont été supprimés !" });
        }
        if (interaction.options.getSubcommand() === 'list') {
            
            const guildId = interaction.guild.id;
            let counters = await client.db.get(`counter_${guildId}`) || [];

            const countersList = counters.map((counter, index) => {
                return `Counter \`${index + 1}\`: **Channel:** <#${counter.channelId}> - **Text:** \`${counter.text}\``;
            }).join('\n');
            const embed = new Discord.EmbedBuilder()
                .setColor(client.color)
                .setFooter(client.footer)
                .setTitle('Liste des compteurs')
                .setDescription(countersList)
            interaction.followUp({ embeds: [embed] });
        }

        if (interaction.options.getSubcommand() === 'del') {
            
            const guildId = interaction.guild.id;
            const channelIdToDelete = interaction.options.getChannel('channel').id;

            let counters = await client.db.get(`counter_${guildId}`) || [];

            const indexToDelete = counters.findIndex(counter => counter.channelId === channelIdToDelete);

            if (indexToDelete !== -1) {
                counters.splice(indexToDelete, 1);
                await client.db.set(`counter_${guildId}`, counters);

                return interaction.followUp(`Compteur dans le channel supprimé avec succès.`);
            } else {
                return interaction.followUp(`Aucun compteur trouvé dans le channel.`);
            }
        }

        if (interaction.options.getSubcommand() === 'create') {
            

            const channel = interaction.options.getChannel('channel');
            const guildId = interaction.guild.id;

            if (interaction.options.getString("text")) {

                const textValue = interaction.options.getString("text");

                if (!variable.some(variable => textValue.includes(variable))) {
                    return interaction.followUp("Le texte ne contient pas de variables.");
                }

                if (textValue.length >= 100) {
                    return interaction.followUp("Le texte est trop long.");
                }
                let counters = await client.db.get(`counter_${guildId}`) || [];
                const existingCounter = counters.find(counter => counter.channelId === channel.id);

                if (existingCounter) {
                    existingCounter.text = textValue;
                } else {
                    const newCounter = { channelId: channel.id, text: textValue };
                    counters.push(newCounter);
                }

                if (counters.length >= 7) {
                    return interaction.followUp("Le nombre maximal de compteurs (7) a été atteint. Supprimez un compteur existant avant d'en ajouter un nouveau.");
                }

                await client.db.set(`counter_${guildId}`, counters);

                await interaction.followUp('Compteur crée avec succès.');

            }

        }
    }
}