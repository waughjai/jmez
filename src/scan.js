const error = require( `./error.js` );

const identifiers = [ "print" ];
const tokenTypes = [ "EOF", "plus", "minus", "asterisk", "lessEqual", "less", "string", "number", "identifier" ].concat( identifiers );
const checkTokenType = ( type ) => tokenTypes.includes( type );

module.exports = {
    scanTokens: ( code ) => {

        let line = 1;
        let column = 1;
        let start = 0;
        let current = 0;
        const tokens = [];
        
        const createToken = ( type, lexeme, literal ) => {
            if ( !checkTokenType( type ) ) {
                throw `Invalid Token Type: ${ type }`;
            }
            return {
                type: type,
                lexeme: lexeme,
                literal: literal,
                line: line,
                print: () => console.log( `${ type } ${ lexeme } ${ literal }` )
            }
        };

        const addToken = ( type, literal ) => {
            if ( literal === undefined ) {
                literal = null;
            }
            const text = code.substring( start, current );
            tokens.push( createToken( type, text, literal ) );
        }

        const isAtEnd = () => current >= code.length;
        const isDigit = ( character ) => character >= `0` && character <= `9`;
        const isAlpha = ( character ) => ( character >= `a` && character <= `z` ) || ( character >= `A` && character <= `Z` ) || character === `_`;
        const isAlphaNumeric = ( character ) => isDigit( character) || isAlpha( character );

        const match = ( character ) => {
            if ( isAtEnd() ) {
                return false;
            }
            if ( code[ current ] !== character ) {
                return false;
            }
            ++current;
            return true;
        };

        const advance = () => {
            const character = code[ current ];
            ++current;
            return character;
        };

        const peek = () => ( isAtEnd() ) ? `\0` : code[ current ];

        const peekNext = () => ( current + 1 >= code.length ) ? `\0` : code[ current + 1 ];

        // EXECUTE
        while ( !isAtEnd() ) {
            start = current;
            const character = advance();
            switch ( character ) {
                case ( ` ` ): { /* Ignore */ } break;
                case ( `\t` ): { /* Ignore */ } break;
                case ( `\s` ): { /* Ignore */ } break;
                case ( `\r` ): { /* Ignore */ } break;
                case ( `.` ): { /* Ignore */ } break;
                case ( `\n` ): { ++line; } break;
                case ( "`" ): {
                    while ( peek() !== "`" && !isAtEnd() ) {
                        if ( peek() === `\n` ) {
                            ++line;
                        }
                        advance();
                    }

                    if ( isAtEnd() ) {
                        error.report( line, `Unterminated string` );
                        return;
                    }

                    advance();

                    const value = code.substring( start + 1, current );
                    addToken( "string", value );
                }
                break;
                case ( `+` ): { addToken( "plus"     ); } break;
                case ( `-` ): { addToken( "minus"    ); } break;
                case ( `*` ): { addToken( "asterisk" ); } break;
                case ( `<` ): { addToken( ( match( `=` ) ) ? `lessEqual` : `less` ); } break;
                case ( `~` ): {
                    while ( peek() !== `\n` && !isAtEnd() ) {
                        advance();
                    }
                }
                break;
                default:
                {
                    if ( isDigit( character ) ) {
                        while ( isDigit( peek() ) ) {
                            advance();
                        }
                        if ( peek() === `.` && isDigit( peekNext() ) ) {
                            advance();
                        }
                        while ( isDigit( peek() ) ) {
                            advance();
                        }
                        const number = code.substring( start, current );
                        addToken( "number", number );
                    }
                    else if ( isAlpha( character ) ) {
                        while ( isAlphaNumeric( peek() ) ) {
                            advance();
                        }
                        const identifier = code.substring( start, current );
                        addToken( ( identifiers.includes( identifier ) ) ? identifier : "identifier" );
                    }
                    else {
                        error.report( line, `Unexpected character @ column ${ column }: ${ character }.` );
                    }
                }
            }
            ++column;
        }
        tokens.push( createToken( "EOF", null, null ));
        return tokens;
    }
};