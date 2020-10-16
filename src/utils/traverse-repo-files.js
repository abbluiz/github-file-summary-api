const countLines = async (text) => {

    /* 'text' will be something like this:
     * 0lines(0sloc)0Bytes
     * where 0 in '0lines' may vary according to the number of lines of a file in a GitHub repo */

    const indexOfLinesWord = text.indexOf('lines');
    const numberOfLines = text.slice(0, indexOfLinesWord);

    return numberOfLines;

};

const countBytes = async (text) => {

    /* 'text' will be something like this:
     * 0lines(0sloc)0Bytes
     * where 'Bytes' might be 'KB' instead
     * and 0 in '0Bytes' may vary according to the size of a file in a GitHub repo
     * (or 'x.xKB' where x.x is a real number) */

    let indexOfBytesWord = text.indexOf('Bytes');

    if (indexOfBytesWord == -1) {
        indexOfBytesWord = text.indexOf('KB');
    }

    const indexOfLastParentheses = ""

};

const countLinesAndBytes = async (text) => {

    const textWithoutWhitespace = text.replace(/\s/g, '');

    return {
        lines: countLines()
    };

}

module.exports = {
    countLines,
    countBytes
};