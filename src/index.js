const { Client, Collection} = require("discord.js");
const {QuickDB} = require("quick.db")
const db = new QuickDB();

class Clients extends Client {
  constructor() {
    super({
      intents: [3276799],
      partials: [
        1, 2, 5, 3,
        4, 6, 0
      ]
    });
    this.config = require('./config.js');
    this.db = db;
    this.emoji = require('./emoji.js')
    this.slashCommands = new Collection();
    this.color = 0xFFFFFF;
    this.staff = ['648236998657835047', "988049815160094781", "798973949189947459"];
    this.footer = {
      text: "© Fiew X Snoway"
    },
    ['slashCommand', 'events'].forEach((handler) => {
      require(`./handlers/${handler}`)(this);
    });
  }

  connect() {
    return super.login(this.config.token);
  }
}

module.exports = Clients;