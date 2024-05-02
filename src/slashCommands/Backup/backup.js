const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const backup = require('discord-backup');
const Discord = require('discord.js')
const ms = require('ms')
module.exports = {
    name: "backup",
    description: "Crée une backup",
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    options: [
        {
            name: 'clear',
            description: "Clear vos backups !",
            type: 1,
        },
        {
            name: 'create',
            description: "Crée une backup",
            type: 1,
        },
        {
            name: 'list',
            description: "Affiche la liste des Backup",
            type: 1,
        },
        {
            name: 'del',
            description: "Supprime une backup a vous !",
            type: 1,
            options: [
                {
                    name: "code",
                    description: "Le code de la backup",
                    type: 3,
                    required: true
                }
            ]
        },
        {
            name: 'load',
            description: "Charge une backup à partir d'un code unique",
            type: 1,
            options: [
                {
                    name: "code",
                    description: "Le code de la backup",
                    type: 3,
                    required: true
                }
            ]
        }
    ],
    run: async (client, interaction) => {
        if (interaction.options.getSubcommand() === 'del') {
            await interaction.deferReply({ ephemeral: true });

            const userBackups = await client.db.get(`backup_${interaction.user.id}`) || [];
            const backupCode = interaction.options.getString('code');

            const selectedBackupIndex = userBackups.findIndex(backup => backup.id === backupCode);

            if (selectedBackupIndex === -1) {
                return interaction.followUp({ content: "Code de backup invalide ou inexistant.", ephemeral: true });
            }

            const selectedBackup = userBackups[selectedBackupIndex];

            const backupFilePath = path.join(__dirname, `../../../backup/backup_${selectedBackup.id}.json`);

            try {
                await fsPromises.rm(backupFilePath);
                userBackups.splice(selectedBackupIndex, 1);
                await client.db.set(`backup_${interaction.user.id}`, userBackups);

                interaction.followUp({
                    content: `👀 La backup \`${selectedBackup.id}\` a été supprimée avec succès.`,
                    ephemeral: true,
                });
            } catch (error) {
                console.error(error);
                interaction.followUp({
                    content: "Une erreur s'est produite.",
                    ephemeral: true,
                });
            }
        }


        if (interaction.options.getSubcommand() === 'clear') {
            await interaction.deferReply({ ephemeral: true });

            try {
                const userBackups = await client.db.get(`backup_${interaction.user.id}`)
                if (!userBackups) return interaction.followUp({
                    content: "Vous n'avez aucune backup !",
                    ephemeral: true,
                });
                await client.db.delete(`backup_${interaction.user.id}`);

                for (const backup of userBackups) {
                    const backupFilePath = path.join(__dirname, `../../../backup/backup_${backup.id}.json`);
                    await fsPromises.rm(backupFilePath).catch(() => { })
                }

                return interaction.followUp({
                    content: 'Vos backups ont été supprimées avec succès !',
                    ephemeral: true,
                });
            } catch (error) {
                console.error(error);
                return interaction.followUp({
                    content: 'Une erreur s\'est produite lors de la suppression de vos backups.',
                    ephemeral: true,
                });
            }
        }

        if (interaction.options.getSubcommand() === 'load') {
            await interaction.deferReply({ ephemeral: true })
            if (interaction.user.id !== interaction.guild.ownerId) {
                return interaction.followUp({ content: `Seul le propriétaire de la guild peut exécuter cette commande !` });
            }

            const db = await client.db.get(`cooldown_backup_${interaction.user.id}`);
            const time = Date.now();

            if (db && db > time) {
                return interaction.followUp({ content: 'Vous ne pouvez load une backup qu\'une toute les 30 minuttes.', ephemeral: true })
            }

            const userBackups = await client.db.get(`backup_${interaction.user.id}`) || [];
            const backupCode = interaction.options.getString('code');

            const selectedBackup = userBackups.find(backup => backup.id === backupCode);
            if (!selectedBackup) {
                return interaction.followUp({ content: "Code de backup invalide ou inexistant.", ephemeral: true });
            }

            const backupPath = path.join(__dirname, `../../../backup/backup_${backupCode}.json`);

            try {
                const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
                const startTime = Date.now();

                try {
                    backup.load(backupData, interaction.guild, {
                        clearGuildBeforeRestore: true,
                        clearRolesBeforeRestore: true,
                        maxMessagesPerChannel: 0
                    });
                    interaction.guild.roles.cache.forEach((role) => { role.delete() });
                } catch (error) {
                    return interaction.followUp({ content: "Une erreur s'est produite.", ephemeral: true });
                }

                const date = Date.now() + 30 * 60 * 1000;
                await client.db.set(`cooldown_backup_${interaction.user.id}`, date)
                await new Promise(resolve => setTimeout(resolve, 15000));

                const endTime = Date.now();
                const duration = (endTime - startTime) / 1000;
                const user = await client.users.fetch(interaction.user.id);
                await user.send(`La backup a été chargée avec succès en ${duration} secondes.`);
            } catch (error) {
                console.error(error);
                const user = await interaction.user.fetch();
                return user.send({ content: "Une erreur s'est produite.", ephemeral: true });
            }
        }
        if (interaction.options.getSubcommand() === 'create') {
            await interaction.deferReply({ ephemeral: true })
            await interaction.followUp({ content: "Création de la backup en cours..." });
            if (!client.staff.includes(interaction.user.id)) {
                if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageChannels) && !interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageGuild)) {
                    return interaction.followUp({ content: "Vous n'avez pas la permission d'utiliser cette commande. Permissions manquantes : `ManageChannels / ManageGuild`", ephemeral: true });
                }
                if (!interaction.guild.members.me.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
                    return interaction.followUp({ content: "je n'ai pas les permissions, Permissions manquantes : `Administrator`", ephemeral: true });
                }
            }
            try {
                const backupData = await backup.create(interaction.guild, {
                    maxMessagesPerChannel: 0,
                    doNotBackup: ["emojis", "bans", "messages"]
                });

                const uniqueID = generateUniqueID();
                const backupPath = path.join(__dirname, `../../../backup/backup_${uniqueID}.json`);

                fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 4));
                await client.db.push(`backup_${interaction.user.id}`, {
                    id: uniqueID,
                    date: Date.now(),
                });

                const embed = {
                    color: client.color,
                    title: 'Backup Créée !',
                    description: 'Voici votre code de backup unique.',
                    fields: [
                        {
                            name: 'Code de la backup',
                            value: `\`\`\`js\n${uniqueID}\`\`\``
                        },
                        {
                            name: 'Chargement de la Backup',
                            value: `\`\`\`js\n/load ${uniqueID}\`\`\``
                        }
                    ]
                };

                return interaction.editReply({ embeds: [embed], ephemeral: true, content: null });
            } catch (error) {
                console.error(error);
                return interaction.editReply(':x: Une erreur s\'est produite.');
            }

        }
        if (interaction.options.getSubcommand() === 'list') {
            const userBackups = await client.db.get(`backup_${interaction.user.id}`) || [];
            if (userBackups.length === 0) {
                return interaction.reply({ content: "Vous n'avez aucune backup.", ephemeral: true });
            }
            const itemsPerPage = 5;
            const totalPages = Math.ceil(userBackups.length / itemsPerPage);
            let page = 1;
            const totalBackups = userBackups.length
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const backupsToShow = userBackups.slice(startIndex, endIndex);

            const backupList = backupsToShow.map((backup) => {
                const backupFilePath = path.join(__dirname, `../../../backup/backup_${backup.id}.json`);
                const backupData = fs.readFileSync(backupFilePath, 'utf8');
                const backupObject = JSON.parse(backupData);

                const backupDate = new Date(backup.date);
                const formattedDate = `${backupDate.getDate()}/${backupDate.getMonth() + 1}/${backupDate.getFullYear()}`;

                const fileSizeInBytes = fs.statSync(backupFilePath).size;
                const fileSizeInKB = fileSizeInBytes / 1024;

                const rolesCount = backupObject.roles.length;
                const categoriesCount = backupObject.channels.categories.length;

                let channelCount = 0;
                backupObject.channels.categories.forEach(category => {
                    category.children.forEach(channel => {
                        if (channel.type === 0 || channel.type === 2) {
                            channelCount++;
                        }
                    });
                });

                return `__**Backup**__ \`${backup.id}\`\n\`\`\`js\nNom du serveur : ${backupObject.name}\nCrée : ${formattedDate}\nChannels : ${channelCount || 0}\nCatégorie : ${categoriesCount || 0}\nRôles : ${rolesCount || 0}\nTaille : ${fileSizeInKB.toFixed(2)} KB\`\`\``;
            }).join('\n');

            const embed = {
                color: client.color,
                title: "Liste des Backup",
                description: backupList,
                footer: { text: `${page}/${totalPages} - ${totalBackups} backups` }
            };

            const row = {
                type: 1,
                components: [
                    {
                        type: 2,
                        customId: 'previous_' + interaction.id,
                        label: '<<<',
                        style: 1,
                        disabled: page === 1
                    },
                    {
                        type: 2,
                        customId: 'suivant_' + interaction.id,
                        label: '>>>',
                        style: 1,
                        disabled: page === totalPages
                    }
                ]
            };

            const reply = await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

            const collector = interaction.channel.createMessageComponentCollector({
                filter: (i) => i.user.id === interaction.user.id,
                time: ms('3m'),
            });

            collector.on('collect', async (button) => {
                if (button.customId.includes('suivant_') && page < totalPages) {
                    page++;
                } else if (button.customId.includes('previous_') && page > 1) {
                    page--;
                }

                const updatedBackupList = userBackups.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((backup) => {
                    const backupFilePath = path.join(__dirname, `../../../backup/backup_${backup.id}.json`);
                    const backupData = fs.readFileSync(backupFilePath, 'utf8');
                    const backupObject = JSON.parse(backupData);

                    const backupDate = new Date(backup.date);
                    const formattedDate = `${backupDate.getDate()}/${backupDate.getMonth() + 1}/${backupDate.getFullYear()}`;

                    const fileSizeInBytes = fs.statSync(backupFilePath).size;
                    const fileSizeInKB = fileSizeInBytes / 1024;

                    const rolesCount = backupObject.roles.length;
                    const categoriesCount = backupObject.channels.categories.length;

                    let channelCount = 0;
                    backupObject.channels.categories.forEach(category => {
                        category.children.forEach(channel => {
                            if (channel.type === 0 || channel.type === 2) {
                                channelCount++;
                            }
                        });
                    });

                    return `__**Backup**__ \`${backup.id}\`\n\`\`\`js\nNom du serveur : ${backupObject.name}\nCrée : ${formattedDate}\nChannels : ${channelCount || 0}\nCatégorie : ${categoriesCount || 0}\nRôles : ${rolesCount || 0}\nTaille : ${fileSizeInKB.toFixed(2)} KB\`\`\``;
                }).join('\n');

                const updatedEmbed = {
                    color: client.color,
                    title: "Liste des Backup",
                    description: updatedBackupList,
                    footer: { text: `${page}/${totalPages} - ${totalBackups} backups` }
                };

                const updatedRow = {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            customId: 'previous_',
                            label: '<<<',
                            style: 1,
                            disabled: page === 1
                        },
                        {
                            type: 2,
                            customId: 'suivant_',
                            label: '>>>',
                            style: 1,
                            disabled: page === totalPages
                        }
                    ]
                };

                await button.update({ embeds: [updatedEmbed], components: [updatedRow] });
            });

            collector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    reply.edit({ components: [] });
                }
            });

        }

    }
}


function generateUniqueID() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const idLength = 16;
    let result = '';
    for (let i = 0; i < idLength; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}