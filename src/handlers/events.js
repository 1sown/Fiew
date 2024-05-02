const { readdirSync } = require('fs');
const { join } = require('path');

module.exports = (client) => {
    readdirSync("./src/events/Client/").forEach(file => {
        const event = require(`../../src/events/Client/${file}`);
        if (event.name && event.run) {
            client.on(event.name, (...args) => event.run(client, ...args));
        }
    });
};
