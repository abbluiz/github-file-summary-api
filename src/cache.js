const NodeCache = require('node-cache');

// Cache will stay for 6 hours
const cache = new NodeCache({ stdTTL: 6 * 60 * 60 });

const getUrlFromRequest = (request) => {

    const url = request.protocol + '://' + request.headers.host + request.originalUrl;
    return url;

};

const set = (request, response, next) => {

    const url = getUrlFromRequest(request);

    console.log('cache.set url: ' + url);

    cache.set(url, response.locals.data);
    return next();

};

const get = (request, response, next) => {

    const url = getUrlFromRequest(request);
    const data = cache.get(url);

    console.log('cache.get url: ' + url);
    console.log('cache.get data: ' + data);

    if (data) {
        return response.status(200).send(data);
    }

    return next();

};

module.exports = { get, set };