const axios = require('axios');

const githubRequest = async (callback) => {

    const url = 'https://github.com/PrivacidadeDigital/privacidade.digital';

    try {

        const response = await axios.get(url);
        callback(undefined, response);

    } catch (error) {
        callback(error.message, undefined);
    }

};

module.exports = githubRequest;