const { readdirSync } = require('fs');

const { PermissionsBitField, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');

module.exports = (client) => {
    const data = [];
    readdirSync("./src/slashCommands/").forEach((dir) => {
        const slashCommandFile = readdirSync(`./src/slashCommands/${dir}/`).filter((files) => files.endsWith(".js"));

        for (const file of slashCommandFile) {
            const slashCommand = require(`../../src/slashCommands/${dir}/${file}`);

            if (!slashCommand.name) return console.error(`Erreur: ${slashCommand.split(".")[0]} la description fdp.`);

            if (!slashCommand.description) return console.error(`slashCommandDescriptionError: ${slashCommand.split(".")[0]} la description fdp. `);

            client.slashCommands.set(slashCommand.name, slashCommand);

            data.push({
                name: slashCommand.name,
                description: slashCommand.description,
                type: slashCommand.type,
                options: slashCommand.options ? slashCommand.options : null,
                default_userPerms: slashCommand.default_permission ? slashCommand.default_permission : null,
                default_member_permissions: slashCommand.default_member_permissions ? PermissionsBitField.resolve(slashCommand.default_member_permissions).toString() : null
            });
        }
    });
    const rest = new REST({ version: '10' }).setToken(client.config.token);
    (async () => {
        try {
            await rest.put(Routes.applicationCommands(client.config.clientID), { body: data });
        } catch (error) {
            console.error(error);
        }
    })();
}
