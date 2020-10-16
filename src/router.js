const express = require('express');
const cheerio = require('cheerio');

const githubRequest = require('./utils/request');
const repo = require('./utils/traverse-repo-files');

const router = new express.Router();

router.get('/', async (request, response, next) => {

    let githubResponse = "";

    try {

        await githubRequest('https://github.com/PrivacidadeDigital/privacidade.digital/blob/master/pages/providers/vpn.html', (errorMessage, response) => {

            if (errorMessage) {
                throw new Error(errorMessage);
            }

            githubResponse = response;

        });

        const $ = cheerio.load(githubResponse.data);
        // response.send($('.repository-content > .gutter-condensed > div > .Box > .Details > .Details-content--hidden-not-important').html());
        // response.send($(".repository-content > div:nth-child(5) > .Box-header > div:first-child").html());
        repo.countLines($(".repository-content > div:nth-child(5) > .Box-header > div:first-child").text());

    } catch (error) {
        response.status(500).send({error});
    }

});

module.exports = router;