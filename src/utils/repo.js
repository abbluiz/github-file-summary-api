const cheerio = require('cheerio');

const text = require('./text');

const loadFakeDom = async (githubResponseData) => {
    return cheerio.load(githubResponseData);
};

const determineDefaultBranch = async (repo) => {

    

};

const isValidRepo = (repo) => {

    // This regex is meant to test for valid GitHub repository
    // The correct syntax is: user-or-organization-name/repo-name
    // Where user or organization names cannot have more than 39 characters, only accepts a-z, 0-9 and - (dashes); it cannot start or finish with dashes
    // Repository names are much more flexible, because they can have up to 100 characters, a-z, 0-9, dashes, dots, and underscores
    const validRepoRegEx = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}\/([a-z\d]|-|.|_){1,100}$/i;

    return validRepoRegEx.test(repo);

};

module.exports = {

    determineDefaultBranch,
    isValidRepo
    
};

// 
// // response.send($('.repository-content > .gutter-condensed > div > .Box > .Details > .Details-content--hidden-not-important').html());
// // response.send($('.repository-content > .Box').html());
// // const linesAndBytes = await text.countLinesAndBytesOfFile($(".repository-content > div:nth-child(5) > .Box-header > div:first-child").text());

// response.send(
//     {
//         "defaultBranch": text.removeAllWhitespace($('#branch-select-menu').text())
//     }
// );