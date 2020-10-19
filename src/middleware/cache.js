const NodeCache = require('node-cache');

// Cache will stay for 6 hours
const cache = new NodeCache({ stdTTL: 6 * 60 * 60 });

const getUrlFromRequest = (request) => {

    const url = request.protocol + '://' + request.headers.host + request.originalUrl;
    return url;

};

const set = (request, response, next) => {

    const url = getUrlFromRequest(request);

    cache.set(url, response.locals.data);

    return next();

};

const get = (request, response, next) => {

    const url = getUrlFromRequest(request);
    const data = cache.get(url);

    if (data) {

        if (data.info) {
            return response.status(202).send(data);
        }

        if (data.code) {

            if (data.code == 404) { return response.status(404).send(data); }
            if (data.code == 500) { return response.status(500).send(data); }

        }

        return response.status(200).send(data);
    
    }

    return next();

};

const setWaitInLineInfo = (url, data) => {
    cache.set(url, data);
};

const getErrorCheck = (url) => {
    return cache.get(url);
};

module.exports = { getUrlFromRequest, get, set, setWaitInLineInfo, getErrorCheck };