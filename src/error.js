let hadError = false;

module.exports = {
    report: ( lineNumber, message ) => {
        console.log( `Error on line ${ lineNumber }: ${ message }` );
        hadError = true;
    },
    hadError: () => hadError
};