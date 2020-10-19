const express = require('express');
const {default: PQueue} = require('p-queue');

const githubRequest = require('./utils/request');
const repo = require('./utils/repo');

const validation = require('./middleware/validation');
const cache = require('./middleware/cache');
const line = require('./middleware/wait-in-line');

const { handle } = require('./utils/error');

const router = new express.Router();

const queue = new PQueue({concurrency: 1});

router.get('/', cache.get, validation.perform, line.set, async (request, response, next) => {

    const mode = request.query.mode || 'moderate';

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

                await queue.add(() => repo.buildSummaryRecursive(url, request.query.repo, defaultBranch, extensionStats, mode, (error) => {

                    if (error) {
                        throw error;
                    }

                }));

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