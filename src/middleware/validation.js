const repo = require('../utils/repo');

const perform = (request, response, next) => {

    if (!repo.isValid(request.query.repo)) {

        return response.status(400).send({ 

            error: "Invalid or empty GitHub repository name. It's just not possible to create an user/repository name like this in GitHub.", 
            expected_syntax: '?repo=owner/repo'

        });
    
    }

    const mode = request.query.mode || 'moderate';

    if (!repo.isModeValid(mode)) {

        return response.status(400).send({ 

            error: 'Invalid web scraping mode.', 
            expected_syntax: '?mode=polite or ?mode=moderate (default)'

        });
    
    }

    const isPromiscuousModeEnabled = process.env.PROMISCUOUS || false;

    if (mode == 'promiscuous' && isPromiscuousModeEnabled == false) {

        return response.status(400).send({
            error: 'Promiscuous mode is currently disabled.',
        });

    }

    return next();

};

module.exports = { perform };