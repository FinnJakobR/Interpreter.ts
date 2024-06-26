export enum TokenType {
    
    LEFT_PAREN, RIGHT_PAREN, LEFT_BRACE, RIGHT_BRACE,
    COMMA, DOT, MINUS, PLUS, SEMICOLON, SLASH, STAR, MODULO,
    SWITCH, CASE, DOUBLE_DOT,

    MINUS_EQUAL, PLUS_EQUAL, STAR_EQUAL, SLASH_EQUAL,

    BANG, BANG_EQUAL, 
    EQUAL, EQUAL_EQUAL,
    GREATER, GREATER_EQUAL,
    LESS, LESS_EQUAL,

    IDENTIFIER, STRING, NUMBER, LEFT_BRACKET, RIGHT_BRACKET,

    AND, CLASS, ELSE, FALSE, FUN, FOR, IF, NIL, OR, DEFAULT, TEMPLATE, DOLLAR,
    PRINT, RETURN, SUPER, THIS, TRUE, VAR, WHILE, MAYBE, BREAK, CONTINUE, CONST,
    EOF,
}





export class Token {
    public type: TokenType;
    public lexeme: string;
    public literal: any;
    public line: number;

    constructor(type: TokenType, lexeme: string, literal: any, line: number){
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }

    public toString(): string {
        return this.type + " " + this.lexeme + " " + this.literal; 
    }

}