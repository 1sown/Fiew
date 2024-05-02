const axios = require("axios");
module.exports = {
    name: "userUpdate",
    run: async (client, oldUser, newUser) => {
        if (oldUser.username !== newUser.username) {
            if (oldUser.bot) return;
           const prevname = oldUser.username;
            const userId = oldUser.id;
            const useruserame = newUser.username
          
            await axios.post(`${client.config.panel}/prevname/add`, {
                prevname: prevname,
                userId: userId,
            }, {
                headers: {
                    'api-key': client.config.apikey
                }

            }).catch(() => { })
        }
    },
};
