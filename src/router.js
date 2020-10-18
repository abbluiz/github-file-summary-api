const express = require('express');

const githubRequest = require('./utils/request');
const repo = require('./utils/repo');

const cache = require('./cache');

const router = new express.Router();

router.get('/', cache.get, async (request, response, next) => {

    if (!repo.isValid(request.query.repo)) {

        return response.status(400).send({ 

            error: 'Invalid or empty repository name', 
            expected_syntax: '?repo=owner/repo'

        });
    
    }

    const mode = request.query.mode || 'moderate';

    if (!repo.isModeValid(mode)) {

        return response.status(400).send({ 

            error: 'Invalid mode', 
            expected_syntax: '?mode=promiscuous or empty for default'

        });
    
    }

    try {

        let fakeDom = {};

        await githubRequest(request.query.repo, (error, githubResponse) => {

            if (error) {
                throw error;
            }

            fakeDom = repo.loadFakeDom(githubResponse.data); 

        });

        const defaultBranch = repo.determineDefaultBranch(fakeDom);
        const url = request.query.repo + '/file-list/' + defaultBranch + '/';

        const extensionStats = {};
        await repo.buildSummary(url, request.query.repo, defaultBranch, extensionStats, mode, (error) => {

            if (error) {
                throw error;
            }

        });

        response.locals.data = extensionStats;
        response.send(response.locals.data);

        next();

    } catch (error) {

        if (error.response) {

            if (error.response.status == 404) {

                response.status(404).send({
                    error: "Repository does not exist or it's private",
                });
            
            } else if (error.response.status == 429) {
                
                response.status(500).send({
                   error: "Repository is too big for this mode" 
                });

            }

        } else if (error.request) {

            response.status(500).send({

                error: 'Request was made but no response was received',
                details: error.message

            });

        } else {

            response.status(500).send({

                error: 'Something went terribly wrong',
                details: error.message
    
            });

        }

    }

}, cache.set);

module.exports = router;