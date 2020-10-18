const axios = require('axios');
const rax = require('retry-axios');

const githubRequest = async (path, callback) => {

    const url = 'https://github.com/' + path;
    console.log('Performing request to ' + url);

    const interceptorId = rax.attach();

    try {

        const response = await axios({
            
            url,
            method: 'get',
            raxConfig: {

                retry: 7,
                retryDelay: 30000,
                onRetryAttempt: err => {

                    const cfg = rax.getConfig(err);
                    console.log(`Retrying request attempt (${url})`);

                }
            
            }

        });

        callback(undefined, response);

    } catch (error) {

        console.log(error.message);
        callback(error, undefined);
    
    }

};

module.exports = githubRequest;