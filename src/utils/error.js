const cache = require('../middleware/cache');

const handle = (error, request, response, next) => {

    if (error.response) {

        if (error.response.status == 404) {

            response.locals.data = {

                error: "Requested repository does not exist or it's private.",
                code: 404,
            
            };
        
        } else if (error.response.status == 429) {
            
            response.locals.data = {

                error: "Repository is too big for this mode (too many requests for GitHub). Please try another recursion mode.",
                code: 500

             }

        }

    } else if (error.request) {

        response.locals.data = {

            error: 'Request was made but no response was received from GitHub. Please wait a couple of minutes and try it with another mode.',
            code: 500

        };

    } else {

        console.log(error);

        response.locals.data = {

            error: "Something went terribly wrong while trying to build this repository's summary. Please wait a couple of minutes and try it with another mode.",
            code: 500

        };

    }

    console.log(error.message);
    cache.set(request, response, next);

};

module.exports = { handle };