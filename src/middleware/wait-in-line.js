const cache = require('./cache');

const set = (request, response, next) => {

    const url = cache.getUrlFromRequest(request);

    const data = {
        info: "Server has started building this repo summary. Come back in a few seconds (or minutes) for the results."
    };

    cache.setWaitInLineInfo(url, data);
    response.status(202).send(data);

    return next();

};

module.exports = { set };