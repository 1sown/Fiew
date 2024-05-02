const axios = require('axios');

class Snoway {
  static async prevnames(userId, client) {
    const url = `${client.config.panel}/prevname/get`;
    const data = {
      userId: userId
    };

    const headers = {
      'api-key': client.config.apikey
    };

    try {
      const response = await axios.post(url, data, { headers });

      if (response.status !== 200) {
        throw new Error('La requête a échoué');
      }

      return response.data;
    } catch (error) {
      console.error('Erreur avec la récupération des prevnames:', error);
      throw error;
    }
  }

  static async add(userId, name, time, client) {
    const url = `${client.config.panel}/prevname/massadd`;
    const data = {
      userId: userId,
      prevname: name,
      timetamps: time,
    };

    const headers = {
      'api-key': client.config.apikey
    };

    try {
      const response = await axios.post(url, data, { headers });

      if (response.status === 200) {
        console.log('Le prevname ' + name + " à était ajouter !");
      }

      if (response.status !== 200) {
        throw new Error('La requête a échoué');
      }

    } catch (error) {
      console.error('Erreur :', error);
      throw error;
    }
  }
}

module.exports = Snoway;
