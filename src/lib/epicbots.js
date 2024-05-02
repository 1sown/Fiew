const axios = require('axios');

class EpicBots {
  static async prevnames(userId) {
    const url = `http://epicbots.xyz/api/prev/read/name?UserId=${userId}`;

    try {
      const response = await axios.get(url);

      if (response.status !== 200) {
        throw new Error('La requête a échoué');
      }

      return response.data;
    } catch (error) {
      console.error('Erreur avec la récupération des prevnames:', error);
      throw error;
    }
  }
}

module.exports = EpicBots;
