const { EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const os = require('os');
const path = require('path');
const du = require('du');
module.exports = {
    name: "botinfo",
    description: "Affiche des informations sur le bot",
    run: async (client, interaction) => {

        const serveurs = client.guilds.cache.size.toLocaleString();
        const utilisateurs = client.guilds.cache.reduce((total, guild) => total + guild.memberCount, 0).toLocaleString();
        const boosts = client.guilds.cache.reduce((acc, guild) => acc + guild.premiumSubscriptionCount, 0).toLocaleString();
        const channel = client.guilds.cache.reduce((acc, guild) => acc + guild.channels.cache.size, 0).toLocaleString();
        const role = client.guilds.cache.reduce((acc, guild) => acc + guild.roles.cache.size, 0).toLocaleString();
        const emoji = client.guilds.cache.reduce((acc, guild) => acc + guild.emojis.cache.size, 0).toLocaleString();
        const sown = await client.users.fetch('648236998657835047');
        const inside = await client.users.fetch('798973949189947459');
        const invite = await client.generateInvite({ scopes: ['applications.commands', 'bot'], permissions: [PermissionFlagsBits.Administrator] });

        const stockage = calculateDirectorySize();
        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setTitle(`Informations sur ${client.user.username}`)
            .addFields(
                { name: client.emoji.bot + `・Bots`, value: `**Username :** \`${client.user.username}\`\n**TAG :** \`${client.user.discriminator}\`\n**ID :** \`${client.user.id}\`` },
                { name: client.emoji.user + "・Développeurs", value: `- [\`${sown.username}\`](https://discord.com/users/${sown.id}) (\`${sown.id}\`)\n- [\`${inside.username}\`](https://discord.com/users/${inside.id}) (\`${inside.id}\`)` },
                { name: client.emoji.param + "・Statistique", value: `**Lancer le** <t:${Math.floor(Date.now() / 1000 - client.uptime / 1000)}:D> à <t:${Math.floor(Date.now() / 1000 - client.uptime / 1000)}:T>\n**Serveurs :** \`${serveurs}\`\n**Users :** \`${utilisateurs}\`\n**Shards** : \`n°${client.shard.id || 1}/${client.shard.count}\`\n**Version :** \`${require('../../../package.json').version}\`\n**Commandes :** \`${client.slashCommands.size}\`\n**Salon :** \`${channel}\`\n**Rôles :** \`${role}\`\n**Emojis :** \`${emoji}\`\n**Boost :** \`${boosts}\`\n**Stockage Backup :** \`${await stockage}\`` },
                { name: client.emoji.vps + '・Information Host', value: `**Nom :** \`${os.hostname()}\`\n**Latence :** \`${client.ws.ping}ms\`\n**Plateforme :** \`${os.platform()}\`\n**Processeur :** \`${os.cpus()[0].model}\`` }
            )
            .setFooter(client.footer);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setStyle(5)
                .setURL(invite)
                .setEmoji(client.emoji.invite)
                .setLabel('Invite Moi !'),
            new ButtonBuilder()
                .setStyle(5)
                .setURL(client.config.support)
                .setEmoji(client.emoji.support)
                .setLabel('Mon Support !')
        )
        return interaction.reply({ embeds: [embed], components: [row] });

    }
};



async function calculateDirectorySize() {
    return new Promise((resolve, reject) => {
        du(path.join(__dirname, '../../../backup'), (err, size) => {
            if (err) {
                reject(err);
            } else {
                const formattedSize = formatBytes(size);
                resolve(formattedSize);
            }
        });
    });
}

function formatBytes(bytes) {
    const units = ['octets', 'Ko', 'Mo', 'Go', 'To'];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
        bytes /= 1024;
        i++;
    }
    return `${bytes.toFixed(2)} ${units[i]}`;
}