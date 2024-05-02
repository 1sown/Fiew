const Clients = require('./src/index.js');
const client = new Clients();
client.connect()
module.exports = client;
process.on("uncaughtException", (e) => {
   if(e.status === "403")return;
   console.log(e)
   })
   
   