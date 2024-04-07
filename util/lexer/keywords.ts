import { TokenType } from "./token";

export interface keywordHash {
    [keyword: string] : number;
} 


export const keywords : keywordHash = {
    "and": TokenType.AND,
    "class": TokenType.CLASS,
    "else": TokenType.ELSE, 
    "false": TokenType.FALSE,
    "for": TokenType.FOR,
    "fun": TokenType.FUN,
    "if": TokenType.IF,
    "nil": TokenType.NIL,
    "or": TokenType.OR,
    "print": TokenType.PRINT,
    "return": TokenType.RETURN,
    "super": TokenType.SUPER,
    "this": TokenType.THIS,
    "true": TokenType.TRUE,
    "var": TokenType.VAR,
    "while": TokenType.WHILE,
    "maybe": TokenType.MAYBE,
    "break": TokenType.BREAK,
    "continue": TokenType.CONTINUE,
    "case": TokenType.CASE,
    "switch": TokenType.SWITCH,
    "default": TokenType.DEFAULT,
    "const": TokenType.CONST
};