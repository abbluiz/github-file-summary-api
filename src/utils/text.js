const path = require('path');

const extractFileExtensionFromUrl = (text) => {
    return path.extname(text);
};

const removeAllWhitespace = (text) => {
    return text.replace(/\s/g, '');
};

const countLines = (text) => {

   const indexOfLinesWord = text.indexOf('lines');
   
    if (indexOfLinesWord != -1) {
        return parseInt(text.slice(0, indexOfLinesWord)); // if format is xlines(xsloc)xxBytes[or KB, or MB]
    } else if (text.lastIndexOf('ExecutableFile') != -1) {
        return parseInt(text.slice(text.lastIndexOf('ExecutableFile') + 1, indexOfLinesWord)); // if format is ExecutableFilexlines(xsloc)xxBytes[or KB, or MB]
    } else {
        return 1; // if format is xxBytes[or KB, or MB]
    }

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

    if (indexOfLastParentheses != -1) {

        if (indexOfBytesWord > -1) {
            return parseInt(text.slice(indexOfLastParentheses + 1, indexOfBytesWord));
        } else if (indexOfKBWord > -1) {
            return Math.round(parseFloat(text.slice(indexOfLastParentheses+1, indexOfKBWord)) * 1024);
        } else {
            return Math.round(parseFloat(text.slice(indexOfLastParentheses+1, indexOfMBWord)) * 1024 * 1024);
        }

    } else {

        if (indexOfBytesWord > -1) {
            return parseInt(text.slice(0, indexOfBytesWord));
        } else if (indexOfKBWord > -1) {
            return Math.round(parseFloat(text.slice(0, indexOfKBWord)) * 1024);
        } else {
            return Math.round(parseFloat(text.slice(0, indexOfMBWord)) * 1024 * 1024);
        }

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