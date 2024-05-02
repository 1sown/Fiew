const config = require('./src/config')
const { WebhookClient, EmbedBuilder, ShardingManager } = require("discord.js");

const manager = new ShardingManager("./index.js", {
  respawn: true,
  autoSpawn: true,
  token: config.token,
  totalShards: "auto",
  shardList: "auto",
});

manager
  .spawn({ amount: manager.totalShards, delay: null, timeout: -1 })
  .then((shards) => {
    console.clear()
    console.log(`[CLIENT] ${shards.size} shard(s) spawned.`);
  })
  .catch((err) => {
    console.log("[CLIENT] Erreur :", err);
  });

manager.on("shardCreate", (shard) => {
  shard.on("ready", () => {
    console.log(`[CLIENT] Shard ${shard.id} est connecté à la Discord's Gateway !`);
  });
});
