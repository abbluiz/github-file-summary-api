const express = require('express');

const githubRequest = require('./utils/request');
const text = require('./utils/text');
const repo = require('./utils/repo');
const { extractFileExtensionFromUrl } = require('./utils/text');

const router = new express.Router();

router.get('/', async (request, response, next) => {

    if (!repo.isValid(request.query.repo)) {

        return response.status(400).send({ 

            error: 'Invalid or empty repository name', 
            expected_syntax: '?repo=owner/repo'

        });
    
    }

    try {

        let fakeDom = {};

        await githubRequest(request.query.repo, (error, githubResponse) => {

            if (error) {
                throw new Error(error);
            }

            fakeDom = repo.loadFakeDom(githubResponse.data); 

        });

        const defaultBranch = await repo.determineDefaultBranch(fakeDom);
        const url = request.query.repo + '/file-list/' + defaultBranch + '/';

        const extensionStats = {};
        await repo.buildRepoSummary(url, request.query.repo, defaultBranch, extensionStats);

        response.send(extensionStats);

    } catch (error) {

        if (error.response) {

            if (error.response.status == 404) {

                response.status(404).send({
                    error: "Repository does not exist or it's private",
                });
            
            }

        } else if (error.request) {

            response.status(500).send({

                error: 'Request was made but no response was received',
                details: error.message,
                request: error.request, 

            });

        } else {

            response.status(500).send({

                error: 'Something went terribly wrong',
                details: error.message
    
            });

        }

    }

});

module.exports = router;