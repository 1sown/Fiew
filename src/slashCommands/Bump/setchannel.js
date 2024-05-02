const { Client, CommandInteraction, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const ms = require('ms')
const Discord = require('discord.js')

module.exports = {
    name: "setchannel",
    description: "Configurer le salon des bumps",
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    options: [
        {
          type: 7,
          name: "channel",
          description: "Le salon des bumps.",
          required: true,
          channel_types: [0]
        },
    ],
    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: "Vous n'avez pas la permission d'utiliser cette commande. Permissions manquantes : `Administrator`", ephemeral: true });
        }
        const db = await client.db.get(`serveur_${interaction.guild.id}`) || {
            description: null,
            shortdescription: null,
            bl: false,
            totalbump: 0,
            prenium: false,
            preniumuser: false,
            channelbump: null,
            cooldown: Date.now(),
            invite: null
        }

        const channel = interaction.options.getChannel('channel')

        if(channel.id === db.channelbump) {
            interaction.reply({
                content: "Le salon [\`" + channel.name + `\`](https://discord.com/channels/${interaction.guild.id}/${channel.id}) est déjà associé aux bumps !`,
                flags: 64
            })
            return;
        }
        db.channelbump = channel.id
        await client.db.set(`serveur_${interaction.guild.id}`, db)
        interaction.reply({
            content: "Le salon [\`" + channel.name + `\`](https://discord.com/channels/${interaction.guild.id}/${channel.id}) vient d'être associé pour les bumps !`,
            flags: 64
        })

    }
}