const cheerio = require('cheerio');
const escapeStringRegexp = require('escape-string-regexp');

const githubRequest = require('./request');
const text = require('./text');

const loadFakeDom = (githubResponseData) => cheerio.load(githubResponseData);

const determineDefaultBranch = (fakeDom) => text.removeAllWhitespace(fakeDom('#branch-select-menu').text());

const determineFileSizeAndExtension = (url, fakeDom) => ({

    url,
    stats: {
        fileExtension: text.extractFileExtensionFromUrl(url),
        size: text.countLinesAndBytesOfFile(fakeDom('.Box > .Box-header > .text-mono').text())
    }

});

const buildSummary = async (path, repo, defaultBranch, extensionStats, mode) => {

    let fakeDom = {};

    if (path.indexOf(repo + '/file-list/') == 0) {
        
        try {

            await githubRequest(path, (error, githubResponse) => {

                if (error) {
                    throw new Error(error);
                }

                fakeDom = loadFakeDom(githubResponse.data); 

            });

            const treePathPattern = escapeStringRegexp('/' + repo + '/tree/' + defaultBranch + '/');
            const blobPathPattern = escapeStringRegexp('/' + repo + '/blob/' + defaultBranch + '/');
            const pathLength = fakeDom('.Details').find('.Box-row').length;
            const allBoxRowSelectors = [];

            if (mode == 'promiscuous') {

                for (let i = 2; i <= pathLength + 1; i++) {
                    allBoxRowSelectors.push('.Box-row:nth-child('+ i + ')');
                }

                await Promise.all(allBoxRowSelectors.map(async (boxRowSelector) => {

                    if (!isParentDirectoryBox(fakeDom, boxRowSelector)) {
    
                        // console.log(fakeDom('.Details').find(boxRowSelector).html());
    
                        if (isDirectoryBox(fakeDom, boxRowSelector)) {
                            
                            const dirPath = fakeDom('.Details').find(boxRowSelector).find('a').attr('href').replace(new RegExp(treePathPattern), '');
    
                            await buildSummary(repo + '/file-list/' + defaultBranch + '/' + dirPath, repo, defaultBranch, extensionStats, mode);
    
                        } else if (isFileBox(fakeDom, boxRowSelector)) {
    
                            const dirPath = fakeDom('.Details').find(boxRowSelector).find('a').attr('href').replace(new RegExp(blobPathPattern), '');
                            
                            await buildSummary(repo + '/blob/' + defaultBranch + '/' + dirPath, repo, defaultBranch, extensionStats, mode);
    
                        }
    
                    }
    
                }));

            } else if (mode == 'default') {

                let j = 0;
                for (let i = 2; i <= pathLength + 1; i++) {

                    allBoxRowSelectors.push('.Box-row:nth-child('+ i + ')');

                    if (!isParentDirectoryBox(fakeDom, allBoxRowSelectors[j])) {
    
                        if (isDirectoryBox(fakeDom, allBoxRowSelectors[j])) {
                            
                            const dirPath = fakeDom('.Details').find(allBoxRowSelectors[j]).find('a').attr('href').replace(new RegExp(treePathPattern), '');
    
                            await buildSummary(repo + '/file-list/' + defaultBranch + '/' + dirPath, repo, defaultBranch, extensionStats, mode);
    
                        } else if (isFileBox(fakeDom, allBoxRowSelectors[j])) {
    
                            const dirPath = fakeDom('.Details').find(allBoxRowSelectors[j]).find('a').attr('href').replace(new RegExp(blobPathPattern), '');
                            
                            await buildSummary(repo + '/blob/' + defaultBranch + '/' + dirPath, repo, defaultBranch, extensionStats, mode);
    
                        }
    
                    }

                    j += 1;
                
                }

            }

        } catch (error) {

            if (error.response && error.response.status) {

                if (error.response.status == 404) {

                    console.error({
                        error: "Repository does not exist or it's private",
                        details: error.message
                    });

                } else if (error.response.status == 429) {

                    console.error({
                        error: "Too many requests to GitHub",
                        url: error.request.url
                    });

                }

            } else {

                console.error({

                    error: 'Something went terribly wrong',
                    details: error.message
        
                });

            }

        }

    } else if (path.indexOf(repo + '/blob/') == 0) {

        try {
            
            await githubRequest(path, (error, githubResponse) => {

                if (error) {
                    throw new Error(error);
                }
    
                fakeDom = loadFakeDom(githubResponse.data); 
    
            });
    
            const fileMeta = determineFileSizeAndExtension(path, fakeDom);

            if (extensionStats[fileMeta.stats.fileExtension] == undefined) {
                extensionStats[fileMeta.stats.fileExtension] = fileMeta.stats.size;
            } else {

                extensionStats[fileMeta.stats.fileExtension].lines += fileMeta.stats.size.lines;
                extensionStats[fileMeta.stats.fileExtension].bytes += fileMeta.stats.size.bytes;
            
            }

        } catch (error) {

            if (error.response && error.response.status) {

                if (error.response.status == 404) {

                    console.error({
                        error: "Repository does not exist or it's private",
                        details: error.message
                    });

                } else if (error.response.status == 429) {

                    console.error({
                        error: "Too many requests to GitHub",
                        url: error.request.url
                    });

                }

            } else {

                console.error({

                    error: 'Something went terribly wrong',
                    details: error.message
        
                });

            }

        }

    }

};

const isParentDirectoryBox = (fakeDom, boxRowSelector) => fakeDom('.Details').find(boxRowSelector).find('a').attr('title').trim() == 'Go to parent directory' ? true : false;

const isDirectoryBox = (fakeDom, boxRowSelector) => fakeDom('.Details').find(boxRowSelector).find('svg').attr('aria-label') == 'Directory' ? true : false;

const isFileBox = (fakeDom, boxRowSelector) => fakeDom('.Details').find(boxRowSelector).find('svg').attr('aria-label') == 'File' ? true: false;

const isValid = (repo) => {

    // This regex is meant to test for valid GitHub repository
    // The correct syntax is: user-or-organization-name/repo-name
    // Where user or organization names cannot have more than 39 characters, only accepts a-z, 0-9 and - (dashes); it cannot start or finish with dashes
    // Repository names are much more flexible, because they can have up to 100 characters, a-z, 0-9, dashes, dots, and underscores
    const validRepoRegEx = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}\/([a-z\d]|-|.|_){1,100}$/i;

    return validRepoRegEx.test(repo);

};

const isModeValid = (mode) => mode == 'default' | mode == 'promiscuous' ? true : false;

module.exports = {

    loadFakeDom,
    determineDefaultBranch,
    determineFileSizeAndExtension,
    buildSummary,
    isValid,
    isModeValid

};