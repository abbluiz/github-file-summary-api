const express = require('express');
const cheerio = require('cheerio');

const githubRequest = require('./utils/request');
const text = require('./utils/text');
const repo = require('./utils/repo');

const router = new express.Router();

router.get('/', async (request, response, next) => {

    if (!repo.isValidRepo(request.query.repo)) {

        return response.status(400).send({ 

            error: 'Invalid or empty repository name', 
            expected_syntax: 'owner/repo'

        });
    
    }

    try {

        await githubRequest(request.query.repo, (error, githubResponse) => {

            if (error) {
                throw new Error(error);
            }

            // do something with github response

        });

        response.send("Hello World!");

    } catch (error) {

        response.status(404).send({

            error: "Repository does not exist or it's private",
            gh_status_code: error.message
            
        });

    }

});

module.exports = router;