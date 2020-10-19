const cheerio = require('cheerio');
const escapeStringRegexp = require('escape-string-regexp');

const githubRequest = require('./request');
const text = require('./text');
const { handle } = require('../utils/error');

const loadFakeDom = (githubResponseData) => cheerio.load(githubResponseData);

const determineDefaultBranch = (fakeDom) => text.removeAllWhitespace(fakeDom('#branch-select-menu').text());

const determineFileSizeAndExtension = (url, fakeDom) => ({

    url,
    stats: {
        fileExtension: text.extractFileExtensionFromUrl(url),
        size: text.countLinesAndBytesOfFile(fakeDom('.Box > .Box-header > .text-mono').text())
    }

});

const buildSummaryRecursive = async (path, repo, defaultBranch, extensionStats, mode, expressData) => {

    try {

        let fakeDom = {};

        if (path.indexOf(repo + '/file-list/') == 0) {

            await githubRequest(path, (error, githubResponse) => {

                if (error) {
                    throw error;
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

                        if (isDirectoryBox(fakeDom, boxRowSelector)) {
                            
                            const dirPath = fakeDom('.Details').find(boxRowSelector).find('a').attr('href').replace(new RegExp(treePathPattern), '');

                            await buildSummaryRecursive(repo + '/file-list/' + defaultBranch + '/' + dirPath, repo, defaultBranch, extensionStats, mode, expressData);

                        } else if (isFileBox(fakeDom, boxRowSelector)) {

                            const filePath = fakeDom('.Details').find(boxRowSelector).find('a').attr('href').replace(new RegExp(blobPathPattern), '');
                            
                            await buildSummaryRecursive(repo + '/blob/' + defaultBranch + '/' + filePath, repo, defaultBranch, extensionStats, mode, expressData);

                        }

                    }

                }));

            } else if (mode == 'polite') {

                let j = 0;
                for (let i = 2; i <= pathLength + 1; i++) {

                    allBoxRowSelectors.push('.Box-row:nth-child('+ i + ')');

                    if (!isParentDirectoryBox(fakeDom, allBoxRowSelectors[j])) {

                        if (isDirectoryBox(fakeDom, allBoxRowSelectors[j])) {
                            
                            const dirPath = fakeDom('.Details').find(allBoxRowSelectors[j]).find('a').attr('href').replace(new RegExp(treePathPattern), '');

                            await buildSummaryRecursive(repo + '/file-list/' + defaultBranch + '/' + dirPath, repo, defaultBranch, extensionStats, mode, expressData);

                        } else if (isFileBox(fakeDom, allBoxRowSelectors[j])) {

                            const filePath = fakeDom('.Details').find(allBoxRowSelectors[j]).find('a').attr('href').replace(new RegExp(blobPathPattern), '');
                            
                            await buildSummaryRecursive(repo + '/blob/' + defaultBranch + '/' + filePath, repo, defaultBranch, extensionStats, mode, expressData);

                        }

                    }

                    j += 1;
                
                }

            } else if (mode == 'moderate') {  

                const filePaths = [];

                let j = 0;
                for (let i = 2; i <= pathLength + 1; i++) {

                    allBoxRowSelectors.push('.Box-row:nth-child('+ i + ')');

                    if (!isParentDirectoryBox(fakeDom, allBoxRowSelectors[j])) {

                        if (isDirectoryBox(fakeDom, allBoxRowSelectors[j])) {

                            const dirPath = fakeDom('.Details').find(allBoxRowSelectors[j]).find('a').attr('href').replace(new RegExp(treePathPattern), '');
                            await buildSummaryRecursive(repo + '/file-list/' + defaultBranch + '/' + dirPath, repo, defaultBranch, extensionStats, mode, expressData);

                        } else if (isFileBox(fakeDom, allBoxRowSelectors[j])) {

                            const filePath = fakeDom('.Details').find(allBoxRowSelectors[j]).find('a').attr('href').replace(new RegExp(blobPathPattern), '');
                            filePaths.push(filePath);
                        
                        }

                    }

                    j += 1;
                
                }

                if (filePaths.length >= 5) {

                    const chunkedPaths = chunkArray(filePaths, 5);

                    for (let i = 0; i < chunkedPaths.length; i++) {

                        await Promise.all(chunkedPaths[i].map(async (filePath) => {

                            await buildSummaryRecursive(repo + '/blob/' + defaultBranch + '/' + filePath, repo, defaultBranch, extensionStats, mode, expressData);
                        
                        }));

                        await sleep(2000);

                    }

                } else {

                    await Promise.all(filePaths.map(async (filePath) => {
                        await buildSummaryRecursive(repo + '/blob/' + defaultBranch + '/' + filePath, repo, defaultBranch, extensionStats, mode, expressData);
                    }));

                }

            }

        } else if (path.indexOf(repo + '/blob/') == 0) {
                
            await githubRequest(path, (error, githubResponse) => {

                if (error) {
                    throw error;
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

        }

    } catch (error) {
        handle(error, expressData.request, expressData.response, expressData.next);
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

const isModeValid = (mode) => mode == 'promiscuous' | mode == 'polite' | mode == 'moderate' ? true : false;

const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms) });

const chunkArray = (arr, chunkSize) => {

    const results = [];

    while (arr.length) {
        results.push(arr.splice(0, chunkSize));
    }

    return results;

};

module.exports = {

    loadFakeDom,
    determineDefaultBranch,
    determineFileSizeAndExtension,
    buildSummaryRecursive,
    isValid,
    isModeValid

};