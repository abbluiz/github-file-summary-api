const axios = require('axios');

const githubRequest = async (repo, callback) => {

    const url = 'https://github.com/' + repo;

    try {

        const response = await axios.get(url);
        callback(undefined, response);

    } catch (error) {
        callback(error.response.status, undefined);
    }

};

module.exports = githubRequest;