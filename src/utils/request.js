const axios = require('axios');

const githubRequest = async (path, callback) => {

    const url = 'https://github.com/' + path;

    try {

        const response = await axios.get(url);
        callback(undefined, response);

    } catch (error) {
        callback(error, undefined);
    }

};

module.exports = githubRequest;