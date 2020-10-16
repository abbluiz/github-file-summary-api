const express = require('express');
const cheerio = require('cheerio');

const githubRequest = require('./utils/github-request');

const router = new express.Router();

router.get('/', async (request, response, next) => {

    let githubResponse = "";

    try {

        await githubRequest((errorMessage, response) => {

            if (errorMessage) {
                throw new Error(errorMessage);
            }

            githubResponse = response;

        });

        const $ = cheerio.load(githubResponse.data);
        response.send($('.repository-content > .gutter-condensed > div > .Box > .Details > .Details-content--hidden-not-important').html());

    } catch (error) {
        response.status(500).send({error: error.message});
    }

});

module.exports = router;