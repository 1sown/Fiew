const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "help",
  description: "Affiche les commandes du bot.",
  run: async (client, interaction) => {
    const commands = await client.application.commands.fetch();
    const commandList = commands.map(command => ({
        name: command.name,
        description: command.description,
        id: command.id
    }));
    const description = commandList.map(command => `</${command.name}:${command.id}> - \`${command.description}\``).join("\n");
    const embed = new EmbedBuilder()
    .setTitle("Voici la liste des commandes")
    .setColor(client.color)
    .setDescription(description)
    .setFooter({text: "Help Temporaire !"})
    
   return interaction.reply({embeds: [embed]})
  }
}
