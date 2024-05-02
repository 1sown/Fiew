const { Client, CommandInteraction, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const ms = require('ms')
module.exports = {
    name: "bump",
    description: "Boostez votre serveur Discord pour pouvoir le promouvoir sur tous les serveurs !",
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
    
        const dbserveur = await client.db.get(`serveur_${interaction.guild.id}`) || {
            description: null,
            bl: false,
            totalbump: 1,
            prenium: false,
            preniumuser: false,
            channelbump: null,
            cooldown: Date.now() - 10,
            invite: null
        }

        if (Date.now() < dbserveur.cooldown) {
            const temps = ms(dbserveur.cooldown - Date.now(), { long: true });
            interaction.reply({content: `Le serveur est en cooldown. Attendez encore [\`${temps}\`](<${client.config.support}>) avant de pouvoir effectuer un autre bump.`, flags: 64});
            return;
        }

        if(!dbserveur.channelbump) {
            const slashCommands = await client.application.commands.fetch();
            const configcmd = slashCommands.find((command) => command.name === 'setchannel');
            interaction.reply({content: `Le serveur n'a pas de channel bump. Merci de faire la commande </${configcmd.name}:${configcmd.id}> pour pouvoir l'ajouter.`, flags: 64});
            return;
        };

        if(!dbserveur.description) {
            const slashCommands = await client.application.commands.fetch();
            const configcmd = slashCommands.find((command) => command.name === 'configurations');
            interaction.reply({content: `Le serveur n'a pas de description. Merci de faire la commande </${configcmd.name}:${configcmd.id}> pour pouvoir l'ajouter.`, flags: 64});
            return;
        };

        const bumpsintervalelol = 500;
        dbserveur.totalbump++;
        await client.db.set(`serveur_${interaction.guild.id}`, dbserveur);
        client.guilds.cache.forEach(async (guild) => {
            const db = await client.db.get(`serveur_${guild.id}`);
            if (!db) return;
            const channel = client.channels.cache.get(db.channelbump);
            if (!channel) return;
            dbserveur.cooldown = Date.now() + ms("1h");
            await client.db.set(`serveur_${interaction.guild.id}`, dbserveur);
            const invite = await interaction.channel.createInvite({
                maxAge: 0,
                maxUses: 0,
                reason: 'Snoway Bump | Création de l\'invite',
            });
            setTimeout(() => {
                channel.send({
                    embeds: [{
                        title: 'Nouveau Bump de \`' + interaction.guild.name + "\`",
                        color: client.color,
                        description: db.description,
                        footer: {
                            text: `Total des Bumps : ${dbserveur.totalBump} | Snoway Bumper`,
                            iconURL: interaction.guild.iconURL()
                        },
                    }],
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    label: "Lien vers le serveur",
                                    style: 5,
                                    url: invite.url
                                },
                                {
                                    type: 2,
                                    label: "Ajoutez-moi !",
                                    style: 5,
                                    url: client.generateInvite({ scopes: ['applications.commands', 'bot'] })
                                },
                            ]
                        }
                    ]

                });
            }, bumpsintervalelol);
        });
        interaction.reply({
            embeds: [{
                title: `${interaction.user.displayName} vient de bump !`,
                color: client.color,
                footer: client.footer,
                description: `Bump effectué !\nJetez un coup d'œil dans le salon ${dbserveur.channelBump ? `<#${dbserveur.channelBump}>` : `[\`${interaction.channel.name}\`](https://discord.com/channels/${interaction.guild.id}/${dbserveur.channelBump ? dbserveur.channelBump : interaction.channel.id})`}`
            }]
        });
    }
};