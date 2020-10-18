const express = require('express');
const timeout = require('connect-timeout');

const router = require('./router');
const app = express();

app.use(timeout('15s'));

app.use(router);

const haltOnTimedout = (request, response, next) => {
    if (!request.timedout) next();
};

app.use(haltOnTimedout);

module.exports = app;