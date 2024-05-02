const { Client, CommandInteraction, ActionRowBuilder, StringSelectMenuBuilder} = require('discord.js');
const ms = require('ms')
const Discord = require('discord.js')

module.exports = {
    name: "configurations",
    description: "Configure le bumper du bot !",
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: "Vous n'avez pas la permission d'utiliser cette commande. Permissions manquantes : `Administrator`", ephemeral: true });
        }
        const db = await client.db.get(`serveur_${interaction.guild.id}`) || {
            description: null,
            bl: false,
            totalbump: 0,
            prenium: false,
            preniumuser: false,
            channelbump: null,
            cooldown: Date.now() - 10,
            invite: null
        }


        const author = interaction.user.id
        const msg = await interaction.reply('Veuillez patienter, s\'il vous plaît...');
        async function update() {
            const embed = {
                title: 'Paramètres du serveur',
                url: client.config.support,
                thumbnail: {
                    url: interaction.guild.iconURL(),
                },  
                color: client.color,
                description: 'Description du serveur\n' + `\`\`\`js\n${db.description || "Aucune description définie"}\`\`\``
            };

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('configMenu')
                .setPlaceholder('Sélectionnez une option')
                .addOptions([
                    {
                        label: 'Modifier la description',
                        value: 'descript',
                        emoji: "<:pene:1127800479771013120>"
                    },
                    
                ]);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            msg.edit({ content: null, embeds: [embed], components: [row] });
        }

        update()

        const collector = msg.createMessageComponentCollector();

        collector.on('collect', async i => {
            if (i.user.id !== author) return i.reply({ content: "Vous n'êtes pas autorisé(e) à interagir avec cette interaction !", ephemeral: true });

                
            if (i.values[0] === 'descript') {
                try {
                    const msg = await i.reply('Quelle devrait être la nouvelle description du serveur ? (moins de 2000 caractères)');
                    const filter = response => response.author.id === author;
                    const collected = await i.channel.awaitMessages({ filter, max: 1, time: ms('1m'), errors: ['time'] });
                    const newDescription = collected.first().content.trim();
        
                  
                    if (newDescription.length > 3000) {
                        await i.channel.send('La description doit contenir moins de 2000 caractères.');

                    } else {
                        db.description = newDescription;
                        await client.db.set(`serveur_${interaction.guild.id}`, db);
                        await update();
                    }
                    msg.delete()
                    collected.first().delete();
                } catch (error) {
                    console.error(error);
                    i.reply('Une erreur s\'est produite.');
                }
            } 

        });

    }
}