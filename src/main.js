const fs = require( `fs` );
const scanner = require( `./scan.js` );
const errorHandler = require( `./error.js` );

if ( process.argv.length === 3 ) {
    const script = process.argv[ 2 ];
    fs.readFile( script, ( error, data ) => {
        const code = data.toString();
        const tokens = scanner.scanTokens( code );
        tokens.forEach( ( token ) => token.print() );
        if ( errorHandler.hadError() ) {
            process.exit( 65 );
        }
    });
}
else {
    console.log( `Usage: jmez [script]` );
    process.exit( 64 );
}