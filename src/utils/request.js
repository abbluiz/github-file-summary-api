const axios = require('axios');

const githubRequest = async (url, callback) => {

    try {

        const response = await axios.get(url);
        callback(undefined, response);

    } catch (error) {
        callback(error, undefined);
    }

};

module.exports = githubRequest;