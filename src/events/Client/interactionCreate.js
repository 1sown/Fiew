const { InteractionType, ActionRowBuilder, TextInputStyle, TextInputBuilder, ModalBuilder, EmbedBuilder } = require("discord.js");
module.exports = {
    name: "interactionCreate",
    run: async (client, interaction) => {
        if (interaction.type === InteractionType.ApplicationCommand) {
            if (!interaction.guild) return;
            const SlashCommands = client.slashCommands.get(interaction.commandName);
            if (!SlashCommands) return;
            console.log(interaction.commandName + ` à été executer par ${interaction.user.tag}`)
            await SlashCommands.run(client, interaction);
        }

    }
}
