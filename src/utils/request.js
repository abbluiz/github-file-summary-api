const axios = require('axios');

const githubRequest = async (path, callback) => {

    const url = 'https://github.com/' + path;
    // console.log(url);

    try {

        const response = await axios.get(url);
        callback(undefined, response);

    } catch (error) {
        callback(error, undefined);
    }

};

module.exports = githubRequest;