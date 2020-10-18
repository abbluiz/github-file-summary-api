const path = require('path');

const extractFileExtensionFromUrl = (text) => {
    return path.extname(text);
};

const removeAllWhitespace = (text) => {
    return text.replace(/\s/g, '');
};

const countLines = (text) => {

    /* 
    *  text will be something like this:
    *  0lines(0sloc)0Bytes
    *  where 0 in '0lines' may vary according to the number of lines of a file in a GitHub repo 
    */

    const indexOfLinesWord = text.indexOf('lines');
    return parseInt(text.slice(0, indexOfLinesWord));

};

const countBytes = (text) => {

    /* 
    *  text will be something like this:
    *  0lines(0sloc)0Bytes
    *  where 'Bytes' might be 'KB' or 'MB' instead
    *  and 0 in '0Bytes' (or 'x.xxKB', or 'x.xxMB' where x.xx is a real number)
    *  may vary according to the size of a file in a GitHub repo 
    */

    // Repo files cannot exceed 100 MB (100 MiB)
    const indexOfBytesWord = text.indexOf('Bytes');
    const indexOfKBWord = text.indexOf('KB');
    const indexOfMBWord = text.indexOf('MB');

    const indexOfLastParentheses = text.indexOf(')');

    if (indexOfBytesWord > -1) {
        return parseInt(text.slice(indexOfLastParentheses + 1, indexOfBytesWord));
    } else if (indexOfKBWord > -1) {
        return Math.round(parseFloat(text.slice(indexOfLastParentheses+1, indexOfKBWord)) * 1024);
    } else {
        return Math.round(parseFloat(text.slice(indexOfLastParentheses+1, indexOfMBWord)) * 1024 * 1024);
    }

};

const countLinesAndBytesOfFile = (text) => {

    return {
    
        lines: countLines(removeAllWhitespace(text)),
        bytes: countBytes(removeAllWhitespace(text))
    
    };

}

module.exports = {

    extractFileExtensionFromUrl,
    countLinesAndBytesOfFile,
    removeAllWhitespace

};