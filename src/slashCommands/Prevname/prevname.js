const { EmbedBuilder } = require('discord.js');
const EpicBots = require('../../lib/epicbots'); 
const Snoway = require('../../lib/snoway');

module.exports = {
    name: "prevname",
    description: "Affiche vos prevname ou celui d'un membre",
    options: [
        {
            type: 6,
            name: "user",
            description: "L\'utilisateur a voir ces prevname",
            required: false,
        },
    ],
    run: async (client, interaction) => {
        const original = await interaction.reply({ content: 'Je recherche...', flags: 64 });
        const users = interaction.options.getUser('user');
        const userId = users ? users.id : interaction.user.id;

        try {
            const snowayPrev = await Snoway.prevnames(userId, client);
            const snowayPrevnamesCount = snowayPrev.prevnames.length;

            if (snowayPrevnamesCount > 0) {
                const snowayEmbed = new EmbedBuilder()
                    .setColor(client.color)
                    .setTitle('Prevname')
                    .setDescription(snowayPrev.prevnames.map((entry, index) => `**${index + 1} -** <t:${Math.floor(entry.temps)}:D> - [\`${entry.prevname}\`](https://discord.com/users/${userId})`).join('\n'))
                    .setFooter({ text: `Total des prevnames dans l'API Snoway : ${snowayPrevnamesCount}`, iconURL: interaction.guild.iconURL() });

                await original.edit({ embeds: [snowayEmbed], content: null, ephemeral: true });
            } else {
                const epicbotPrev = await EpicBots.prevnames(userId);
                const epicbotPrevnamesCount = epicbotPrev.Names.length;

                if (epicbotPrevnamesCount > 0) {
                    for (let index = 0; index < epicbotPrevnamesCount; index++) {
                        const entry = epicbotPrev.Names[index];
                        const time = new Date(entry.timestamp).getTime() / 1000
                        await Snoway.add(userId, entry.name, time, client)
                    }
                    const epicbotEmbed = new EmbedBuilder()
                        .setColor(client.color)
                        .setTitle('Prevname')
                        .setDescription(epicbotPrev.Names.map((entry, index) => `**${index + 1} -** <t:${Math.floor(new Date(entry.timestamp).getTime() / 1000)}:D> - [\`${entry.name}\`](https://discord.com/users/${userId})`).join('\n'))
                        .setFooter({ text: `Total des prevnames dans l'API EpicBot : ${epicbotPrevnamesCount}`, iconURL: interaction.guild.iconURL() });

                    await original.edit({ embeds: [epicbotEmbed], content: null, ephemeral: true });
                } else {
                    await original.edit("Aucun prevname trouver !");
                }
            }
        } catch (error) {
            console.error('Erreur :', error);
            await original.edit("Une erreur s'est produite.");
        }
    }
};
