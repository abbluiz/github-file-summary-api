const express = require('express');
const {default: PQueue} = require('p-queue');

const githubRequest = require('./utils/request');
const repo = require('./utils/repo');

const cache = require('./middleware/cache');
const line = require('./middleware/wait-in-line');

const { handle } = require('./utils/error');

const router = new express.Router();

const queue = new PQueue({concurrency: 1});

router.get('/', cache.get, line.set, async (request, response, next) => {

    if (!repo.isValid(request.query.repo)) {

        return response.status(400).send({ 

            error: "Invalid or empty GitHub repository name. It is not possible to create an 'owner/repo' in GitHub like this.", 
            expected_syntax: '?repo=owner/repo'

        });
    
    }

    const mode = request.query.mode || 'moderate';

    if (!repo.isModeValid(mode)) {

        return response.status(400).send({ 

            error: 'Invalid web scraping mode.', 
            expected_syntax: '?mode=promiscuous or ?mode=polite or ?mode=moderate (default)'

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
        
        (async () => {

            try {

                const task = await repo.buildSummaryRecursive(url, request.query.repo, defaultBranch, extensionStats, mode, {

                    request,
                    response,
                    next
                
                });

                await queue.add(task);

            } catch (error) {
                handle(error, request, response, next);
            }

            const cacheData = cache.getErrorCheck(cache.getUrlFromRequest(request));
            
            if (cacheData) {
            
                if (cacheData.error) {
                    return;
                }
            
            }

            response.locals.data = extensionStats;
            cache.set(request, response, next);

        })();

        return next();

    } catch (error) {
        handle(error, request, response, next);
    }

});

module.exports = router;